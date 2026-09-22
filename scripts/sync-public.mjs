import { readdir, readFile, writeFile, mkdir, stat } from 'node:fs/promises'
import { dirname } from 'node:path'

const check = process.argv.includes('--check')
let mismatch = false

/**
 * public/ is what Next serves. The copies at the repo root exist so the site
 * can be opened with a plain static server (VS Code Live Server and friends)
 * pointed at the repo root.
 *
 * For that to work the mirror needs more than the HTML: a page that cannot
 * load /site.js loses escapeHTML, and every Supabase-backed list on it fails
 * with an error message instead of content. So mirror the HTML and every
 * root-relative asset the HTML actually references.
 */

const pages = (await readdir('public')).filter(name => name.endsWith('.html'))

const assets = new Set()
const collect = html => {
  // src="/x", href="/x" and url('/x') — root-relative only; ignore other pages.
  const refs = [
    ...html.matchAll(/(?:src|href)="(\/[^"#?]+)"/g),
    ...html.matchAll(/url\((?:'|"|&quot;)?(\/[^)'"&]+)/g),
  ]
  for (const [, path] of refs) {
    if (!path.endsWith('.html')) assets.add(path.slice(1))
  }
}

const copies = []
for (const name of pages) {
  const content = await readFile(`public/${name}`, 'utf8')
  collect(content)
  copies.push([name, content])
}

for (const asset of assets) {
  const from = `public/${asset}`
  // Article images are uploaded per article and many are not present yet.
  if (!(await stat(from).then(() => true, () => false))) continue
  copies.push([asset, await readFile(from)])
}

for (const [name, content] of copies) {
  if (check) {
    const current = await readFile(name).catch(() => null)
    const same = current !== null && Buffer.from(current).equals(Buffer.from(content))
    if (!same) { console.error(`Outdated mirror: ${name}`); mismatch = true }
  } else {
    await mkdir(dirname(name), { recursive: true }).catch(() => {})
    await writeFile(name, content)
  }
}

if (mismatch) {
  console.error('\nRun `npm run sync:public` to refresh the root mirror.')
  process.exitCode = 1
} else if (!check) {
  console.log(`Mirrored ${pages.length} page(s) and ${copies.length - pages.length} asset(s) to the repo root.`)
}
