export type LeadKind = 'quote' | 'contact' | 'newsletter'
const categories = new Set(['bess', 'solar', 'ev', 'ems'])

export function validateLead(value: unknown): { kind: LeadKind; row: Record<string, unknown> } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid body')
  const data = value as Record<string, unknown>
  const field = (key: string, max: number, required = false) => {
    const raw = data[key]
    if (raw !== undefined && typeof raw !== 'string') throw new Error(`Invalid ${key}`)
    const text = ((raw as string) || '').trim()
    if ((required && !text) || text.length > max) throw new Error(`Invalid ${key}`)
    return text
  }
  if (field('website', 200)) throw new Error('Invalid submission')
  if (!['quote', 'contact', 'newsletter'].includes(String(data.kind))) throw new Error('Invalid kind')
  const kind = data.kind as LeadKind
  const email = field('email', 254, true).toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Invalid email')
  if (kind === 'newsletter') return { kind, row: { email } }
  const phone = field('phone', 40, true)
  if (!/^[+\d\s().-]{7,40}$/.test(phone) || phone.replace(/\D/g, '').length < 7) throw new Error('Invalid phone')
  const common = { name: field('name', 150, true), company: field('company', 200, kind === 'quote'), email, phone }
  if (kind === 'contact') return { kind, row: { ...common, message: field('message', 5000, true) } }
  const products = data.products ?? []
  if (!Array.isArray(products) || products.length > 4 || products.some(p => !categories.has(p))) throw new Error('Invalid products')
  const contactPref = field('contact_pref', 10) || 'phone'
  if (!['phone', 'email', 'line'].includes(contactPref)) throw new Error('Invalid contact preference')
  const line = field('line', 100, contactPref === 'line')
  return { kind, row: { ...common, products: [...new Set(products)], contact_pref: contactPref,
    line_id: line || null, business_type: field('business_type', 100, true),
    power_demand: field('power', 100) || null, timeline: field('timeline', 100) || null,
    budget: field('budget', 100) || null, details: field('details', 5000) || null, status: 'new',
  } }
}
