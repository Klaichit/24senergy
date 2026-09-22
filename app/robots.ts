import type { MetadataRoute } from 'next'
export default function robots(): MetadataRoute.Robots {
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.24senergy.co.th'
  return { rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] }, sitemap: `${site}/sitemap.xml` }
}
