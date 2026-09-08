import { createPublicClient } from '@/lib/public-data'
import { cache } from 'react'
import ProductLanguage from '@/components/ProductLanguage'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Product } from '@/types/database'
import ImageGallery from './ImageGallery'

export const revalidate = 60

interface Props { params: Promise<{ slug: string }> }

const getProduct = cache(async (slug: string) => {
  const { data, error } = await createPublicClient().from('products').select('*').eq('slug', slug).eq('is_published', true).maybeSingle()
  if (error) throw new Error('Unable to load product')
  return data as Product | null
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return { title: 'Product not found — 24sEnergy', robots: { index: false } }
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://24senergy.vercel.app'
  const url = `${site}/products/${encodeURIComponent(slug)}`
  return { title: `${product.name_th} — 24sEnergy`, description: product.description_th,
    alternates: { canonical: url }, openGraph: { title: product.name_th, description: product.description_th, url, images: product.images?.slice(0, 1) || [] } }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()
  const json = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Product', name: product.name_th,
    description: product.description_th, image: product.images, brand: { '@type': 'Brand', name: '24sEnergy' } }).replace(/</g, '\\u003c')
  return <ProductLanguage><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} /><ProductPage product={product} /></ProductLanguage>
}

function Bi({ th, en }: { th: string; en: string }) {
  return <span className="bi"><span className="th">{th}</span><span className="en">{en}</span></span>
}

/* ── Theme per category ─────────────────────────────────────────── */
const THEME = {
  bess:  { accent: '#7C3AED', glow: 'rgba(124,58,237,0.18)', badge: 'BESS · Energy Storage',      badgeBg: '#f3effe', badgeText: '#6d28d9' },
  solar: { accent: '#D97706', glow: 'rgba(217,119,6,0.15)',  badge: 'Solar PV · Rooftop',          badgeBg: '#fffbeb', badgeText: '#b45309' },
  ev:    { accent: '#059669', glow: 'rgba(5,150,105,0.15)',  badge: 'EV Charger · DC Fast Charge', badgeBg: '#ecfdf5', badgeText: '#065f46' },
  ems:   { accent: '#2563EB', glow: 'rgba(37,99,235,0.15)',  badge: 'EMS · Cloud Monitoring',      badgeBg: '#eff6ff', badgeText: '#1d4ed8' },
} as const

const ICON: Record<string, React.ReactNode> = {
  bess: (
    <svg className="w-48 h-48 opacity-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.6">
      <rect x="2" y="7" width="18" height="11" rx="2"/><path d="M22 11v3"/><rect x="5" y="10" width="5" height="5" rx="1"/>
    </svg>
  ),
  solar: (
    <svg className="w-48 h-48 opacity-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.6">
      <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
  ),
  ev: (
    <svg className="w-48 h-48 opacity-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.6">
      <rect x="6" y="3" width="12" height="18" rx="2"/><line x1="10" y1="7" x2="14" y2="7"/><path d="M11 11l-2 4h6l-2 4"/>
    </svg>
  ),
  ems: (
    <svg className="w-48 h-48 opacity-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.6">
      <rect x="2" y="3" width="20" height="14" rx="2"/><polyline points="5 13 9 8 13 11 19 5"/>
    </svg>
  ),
}

/* ── Main Component ─────────────────────────────────────────────── */
function ProductPage({ product }: { product: Product }) {
  const theme = THEME[product.category as keyof typeof THEME] ?? THEME.bess
  const specs = Object.entries(product.specs ?? {})
  const images = product.images ?? []
  const pdfUrl = product.pdf_url && /^(https?:\/\/|\/(?!\/))/.test(product.pdf_url) ? product.pdf_url : null

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'IBM Plex Sans Thai',Arial,sans-serif" }}>

      {/* ── Navbar ── */}
      <nav style={{ borderBottom: '1px solid #f0f0f0' }}
        className="bg-white/90 backdrop-blur-sm px-4 md:px-8 py-4 flex flex-wrap items-center gap-3 sticky top-0 z-50">
        <Link href="/index.html">
          <img src="/24sEnergy_png.png" alt="24sEnergy" className="h-8 w-auto" />
        </Link>
        <span className="text-gray-200 mx-1">/</span>
        <Link href="/products.html" className="text-sm text-gray-400 hover:text-gray-700 transition-colors"><Bi th="ผลิตภัณฑ์" en="Products" /></Link>
        <span className="text-gray-200 mx-1">/</span>
        <span className="text-sm text-gray-700 font-medium"><Bi th={product.name_th} en={product.name_en} /></span>
        <div className="ml-auto flex items-center gap-3">
          <Link href="/products.html" className="text-sm text-gray-400 hover:text-gray-700 transition-colors"><Bi th="← กลับ" en="← Back" /></Link>
          <a href={`/quote.html?product=${product.category}`}
            style={{ background: theme.accent }}
            className="px-5 py-2 text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity">
            <Bi th="ขอใบเสนอราคา" en="Get a Quote" />
          </a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden flex items-center"
        style={{ background: `radial-gradient(ellipse at 35% 50%, ${theme.glow} 0%, transparent 65%), #fafafa` }}>

        <div className="max-w-7xl mx-auto px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 py-12 items-center">

          {/* Image side */}
          <div className="flex items-center justify-center relative w-full">
            {images.length > 0 ? (
              <div className="relative z-10 w-full max-w-md">
                <ImageGallery images={images} alt={product.name_en} accent={theme.accent} />
              </div>
            ) : (
              <div className="w-64 h-64 flex items-center justify-center"
                style={{ color: theme.accent, opacity: 0.12 }}>
                {ICON[product.category]}
              </div>
            )}
          </div>

          {/* Text side */}
          <div className="lg:pl-12">
            <span className="inline-block px-3 py-1.5 rounded-full text-xs font-black mb-5 tracking-widest uppercase"
              style={{ background: theme.badgeBg, color: theme.badgeText }}>
              {theme.badge}
            </span>
            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 leading-[1.05] tracking-tight mb-3">
              <Bi th={product.name_th} en={product.name_en} />
            </h1>
            <p className="text-sm text-gray-400 font-medium mb-5 tracking-wide">{product.name_en}</p>
            <p className="text-gray-600 leading-relaxed mb-8 max-w-md text-[15px]">
              <Bi th={product.description_th} en={product.description_en} />
            </p>
            <div className="flex gap-3 flex-wrap">
              <a href={`/quote.html?product=${product.category}`}
                style={{ background: theme.accent }}
                className="px-7 py-3.5 text-white font-bold rounded-2xl text-sm hover:opacity-90 transition-opacity inline-flex items-center gap-2">
                <Bi th="ขอใบเสนอราคา" en="Get a Quote" />
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </a>
              {pdfUrl ? (
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer"
                  className="px-7 py-3.5 bg-white text-gray-700 font-bold rounded-2xl text-sm hover:bg-gray-50 transition-colors inline-flex items-center gap-2 border border-gray-200">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  <Bi th="ดาวน์โหลด Datasheet" en="Download Datasheet" />
                </a>
              ) : (
                <span className="px-7 py-3.5 bg-gray-100 text-gray-400 font-bold rounded-2xl text-sm inline-flex items-center gap-2 cursor-not-allowed select-none">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  <Bi th="Datasheet (ยังไม่มี)" en="Datasheet (unavailable)" />
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Specs ── */}
      {specs.length > 0 && (
        <section className="py-20 px-8 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto">
            <p className="text-xs font-black uppercase tracking-[0.2em] mb-10"
              style={{ color: theme.accent }}>Technical Specifications</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-gray-100 rounded-2xl overflow-hidden border border-gray-100">
              {specs.map(([k, v]) => (
                <div key={k} className="bg-white px-8 py-7">
                  <div className="text-3xl font-black text-gray-900 mb-1">{String(v)}</div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{k}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Details / Description ── */}
      <section className="py-20 px-8 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] mb-5"
              style={{ color: theme.accent }}><Bi th="รายละเอียดผลิตภัณฑ์" en="Product details" /></p>
            <h2 className="text-3xl font-black text-gray-900 leading-tight mb-5">
              <Bi th={product.name_th} en={product.name_en} />
            </h2>
            <p className="text-gray-600 leading-relaxed text-[15px]">
              <Bi th={product.description_th} en={product.description_en} />
            </p>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] mb-5 text-gray-400">
              Product Overview
            </p>
            <p className="text-gray-500 leading-relaxed text-[15px]">
              {product.description_en}
            </p>
            {pdfUrl && (
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 text-sm font-bold"
                style={{ color: theme.accent }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <Bi th="ดาวน์โหลด Product Datasheet →" en="Download Product Datasheet →" />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-8 bg-white border-t border-gray-100 text-center">
        <p className="text-xs font-black uppercase tracking-[0.2em] mb-4 text-gray-400">Ready to get started?</p>
        <h2 className="text-3xl font-black text-gray-900 mb-3"><Bi th="สนใจผลิตภัณฑ์นี้?" en="Interested in this product?" /></h2>
        <p className="text-gray-500 mb-8 text-sm"><Bi th="ทีมวิศวกรพร้อมให้คำปรึกษาและเสนอราคาฟรี ไม่มีข้อผูกมัด" en="Our engineers can help with advice and a no-obligation quote." /></p>
        <a href={`/quote.html?product=${product.category}`}
          style={{ background: theme.accent }}
          className="inline-block px-10 py-4 text-white font-black rounded-2xl text-sm hover:opacity-90 transition-opacity">
          <Bi th="ขอใบเสนอราคา →" en="Get a Quote →" />
        </a>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-950 text-white/40 text-xs text-center py-8">
        © 2026 24sEnergy Co., Ltd. All rights reserved.
      </footer>
    </div>
  )
}
