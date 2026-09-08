import { createClient } from '@supabase/supabase-js'
import { createHmac } from 'node:crypto'
import { validateLead } from '@/lib/lead-validation'

export const runtime = 'nodejs'
const reply = (status: number, error?: string) => Response.json(error ? { error } : { ok: true }, {
  status, headers: { 'Cache-Control': 'no-store', ...(status === 429 ? { 'Retry-After': '3600' } : {}) },
})

export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  if (!origin || origin !== new URL(request.url).origin) return reply(403, 'Origin not allowed')
  if (!request.headers.get('content-type')?.startsWith('application/json')) return reply(415, 'JSON required')
  // Enforce the limit while streaming, even if Content-Length is absent.
  const reader = request.body?.getReader()
  if (!reader) return reply(400, 'Body required')
  let raw = ''
  let bytes = 0
  const decoder = new TextDecoder()
  let lead: ReturnType<typeof validateLead>
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      bytes += value.byteLength
      if (bytes > 20000) { await reader.cancel(); return reply(413, 'Submission too large') }
      raw += decoder.decode(value, { stream: true })
    }
    raw += decoder.decode()
    lead = validateLead(JSON.parse(raw))
  } catch { return reply(400, 'Please check the form fields') }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !secret) return reply(503, 'Submission service is not configured')
  const db = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } })
  // Trust Vercel's overwritten header only on Vercel; other hosts share a safe fallback bucket.
  const ip = process.env.VERCEL === '1' ? request.headers.get('x-vercel-forwarded-for') || 'unknown' : 'local'
  const key = createHmac('sha256', secret).update(ip).digest('hex')
  try {
    const { data: allowed, error: rateError } = await db.rpc('consume_lead_limit', { client_key: key })
    if (rateError) return reply(503, 'Submission service unavailable')
    if (!allowed) return reply(429, 'Too many submissions. Please try again later')
    const table = { quote: 'quotes', contact: 'contact_messages', newsletter: 'newsletter_subscribers' }[lead.kind]
    const { error } = await db.from(table).insert(lead.row)
    // Do not reveal whether an email address is already subscribed.
    if (error && !(lead.kind === 'newsletter' && error.code === '23505')) return reply(503, 'Could not save submission')
    return reply(201)
  } catch { return reply(503, 'Submission service unavailable') }
}
