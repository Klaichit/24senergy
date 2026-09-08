import type { MetadataRoute } from 'next'
import { createPublicClient } from '@/lib/public-data'
export const dynamic = 'force-dynamic'
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://24senergy.vercel.app'
  const pages = ['index.html','products.html','news.html','contact.html','quote.html'].map(path => ({ url: `${site}/${path}` }))
  const { data, error } = await createPublicClient().from('products').select('slug,updated_at').eq('is_published', true)
  if (error) throw new Error('Unable to load sitemap products')
  return [...pages, ...(data || []).map(p => ({ url: `${site}/products/${encodeURIComponent(p.slug)}`, lastModified: p.updated_at }))]
}
