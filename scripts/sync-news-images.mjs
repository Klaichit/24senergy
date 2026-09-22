#!/usr/bin/env node
/**
 * Pull article images from the Notion Content Board, resize them for the web
 * and place them where news.html expects to find them.
 *
 * Nothing runs this on a schedule yet. It is a manual command, and it only
 * writes files — it never edits news.html or the Notion board.
 *
 *   node scripts/sync-news-images.mjs            # what it would do
 *   node scripts/sync-news-images.mjs --write    # actually fetch and write
 *   node scripts/sync-news-images.mjs --write --stage=all
 *
 * Install once:
 *   npm i -D googleapis sharp
 *
 * Environment:
 *   NOTION_TOKEN              Notion integration token with read access to the
 *                             Content Board
 *   NOTION_CONTENT_DB         data source id of the board
 *                             (default: the SSC — Content Board source)
 *   GOOGLE_SERVICE_ACCOUNT    path to a service-account JSON key, or the JSON
 *                             itself. The board's image folders must be shared
 *                             with that account's email, read-only.
 *
 * Optional, to publish to Supabase Storage instead of the repo:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_BUCKET (default news-images)
 *   ...and pass --target=supabase
 *
 * Why this exists: the board stores images as Google Drive /view links. Those
 * are web pages, not image files, so they cannot be used as an <img> source at
 * all. The bytes have to be copied somewhere that serves images. This does that
 * copy, and shrinks 2–2.6 MB originals down to something a page can carry.
 */

import { mkdir, writeFile, readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'

const args = new Set(process.argv.slice(2))
const flag = (name, fallback) => {
  const hit = [...args].find(a => a.startsWith(`--${name}=`))
  return hit ? hit.slice(name.length + 3) : fallback
}

const WRITE = args.has('--write')
const STAGE = flag('stage', 'โพสแล้ว')       // 'all' for every row
const TARGET = flag('target', 'repo')         // 'repo' | 'supabase'
const OUT_DIR = 'public/news'
const MAX_WIDTH = 1600
const QUALITY = 78

const DATA_SOURCE = process.env.NOTION_CONTENT_DB ?? '6a2e052d-8552-4bb9-8ca7-2d7b86402a17'
const SLUG_PROP = 'คีย์ป้องกันข่าวซ้ำ'
const IMAGE_PROP = 'ลิงก์ไฟล์ภาพ'
const STAGE_PROP = 'ขั้นตอน'

const die = msg => { console.error(`\n✗ ${msg}\n`); process.exit(1) }

/* ---------------------------------------------------------------- Notion --- */

async function fetchRows() {
  const token = process.env.NOTION_TOKEN
  if (!token) die('NOTION_TOKEN is not set.')

  const rows = []
  let cursor
  do {
    const res = await fetch(`https://api.notion.com/v1/data_sources/${DATA_SOURCE}/query`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'notion-version': '2025-09-03',
        'content-type': 'application/json',
      },
      body: JSON.stringify({ page_size: 100, start_cursor: cursor }),
    })
    if (!res.ok) die(`Notion query failed: ${res.status} ${await res.text()}`)
    const page = await res.json()
    rows.push(...page.results)
    cursor = page.has_more ? page.next_cursor : undefined
  } while (cursor)
  return rows
}

const plain = prop => {
  if (!prop) return ''
  if (prop.type === 'rich_text' || prop.type === 'title') {
    return (prop[prop.type] ?? []).map(t => t.plain_text).join('').trim()
  }
  if (prop.type === 'select') return prop.select?.name ?? ''
  if (prop.type === 'url') return prop.url ?? ''
  return ''
}

const driveId = url => url.match(/\/d\/([A-Za-z0-9_-]+)/)?.[1] ?? null

/* ----------------------------------------------------------------- Drive --- */

async function driveClient() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT
  if (!raw) die('GOOGLE_SERVICE_ACCOUNT is not set (path to a key file, or the JSON itself).')
  const key = JSON.parse(raw.trimStart().startsWith('{') ? raw : await readFile(raw, 'utf8'))

  const { google } = await import('googleapis')
  const auth = new google.auth.JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  })
  await auth.authorize()
  return google.drive({ version: 'v3', auth })
}

async function download(drive, id) {
  const res = await drive.files.get({ fileId: id, alt: 'media' }, { responseType: 'arraybuffer' })
  return Buffer.from(res.data)
}

/* ------------------------------------------------------------- Supabase --- */

async function uploadToSupabase(name, body) {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  const bucket = process.env.SUPABASE_BUCKET ?? 'news-images'
  if (!url || !key) die('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for --target=supabase.')

  const res = await fetch(`${url}/storage/v1/object/${bucket}/${name}`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${key}`,
      'content-type': 'image/webp',
      'x-upsert': 'true',
    },
    body,
  })
  if (!res.ok) die(`Upload of ${name} failed: ${res.status} ${await res.text()}`)
  return `${url}/storage/v1/object/public/${bucket}/${name}`
}

/* ------------------------------------------------------------------ main --- */

const rows = await fetchRows()
const wanted = rows
  .map(r => ({
    slug: plain(r.properties[SLUG_PROP]),
    stage: plain(r.properties[STAGE_PROP]),
    image: plain(r.properties[IMAGE_PROP]),
  }))
  .filter(r => (STAGE === 'all' || r.stage === STAGE) && r.slug && driveId(r.image))

if (!wanted.length) die(`No rows matched stage "${STAGE}" with both a slug and an image link.`)

const missingSlug = rows.filter(r => !plain(r.properties[SLUG_PROP])).length
if (missingSlug) console.warn(`! ${missingSlug} row(s) have no ${SLUG_PROP} and were skipped`)

console.log(`${wanted.length} article image(s) at stage "${STAGE}" → ${TARGET}`)

if (!WRITE) {
  for (const r of wanted) console.log(`  would write ${r.slug}.webp`)
  console.log('\nDry run. Re-run with --write to fetch and convert.')
  process.exit(0)
}

const sharp = (await import('sharp')).default
const drive = await driveClient()
if (TARGET === 'repo') await mkdir(OUT_DIR, { recursive: true })

let done = 0, skipped = 0
for (const r of wanted) {
  const name = `${r.slug}.webp`
  const dest = join(OUT_DIR, name)

  if (TARGET === 'repo' && !args.has('--force')) {
    const exists = await stat(dest).then(() => true, () => false)
    if (exists) { console.log(`  = ${name} (exists, --force to replace)`); skipped++; continue }
  }

  const original = await download(drive, driveId(r.image))
  const webp = await sharp(original)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toBuffer()

  if (TARGET === 'supabase') {
    const url = await uploadToSupabase(name, webp)
    console.log(`  ↑ ${name}  ${(original.length / 1e6).toFixed(1)}MB → ${(webp.length / 1e3).toFixed(0)}KB  ${url}`)
  } else {
    await writeFile(dest, webp)
    console.log(`  ✓ ${dest}  ${(original.length / 1e6).toFixed(1)}MB → ${(webp.length / 1e3).toFixed(0)}KB`)
  }
  done++
}

console.log(`\n${done} written, ${skipped} already present.`)
if (TARGET === 'supabase') {
  console.log('Storage URLs differ from the /news/<slug>.webp paths news.html uses;')
  console.log('point --news-img at the bucket, or run with --target=repo.')
}
