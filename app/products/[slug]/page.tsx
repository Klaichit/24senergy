import { createPublicClient } from '@/lib/public-data'
import { cache } from 'react'
import ProductLanguage from '@/components/ProductLanguage'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/types/database'
import ImageGallery from './ImageGallery'
import ParallaxSection from './ParallaxSection'

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
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.24senergy.co.th'
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

/* ── Brand colour overrides (official brand colours) ───────────── */
const BRAND_COLOR: Record<string, string> = {
  TCL:      '#E8001B',
  Hithium:  '#00A0E9',
  Leapton:  '#0066CC',
  AISWEI:   '#FF6600',
  SolarEdge:'#FF6600',
}

/* ── Theme per category ─────────────────────────────────────────── */
const THEME = {
  bess:     { accent: '#7C3AED', glow: 'rgba(124,58,237,0.18)', badge: 'BESS · Energy Storage', badgeBg: '#f3effe', badgeText: '#6d28d9' },
  solar:    { accent: '#D97706', glow: 'rgba(217,119,6,0.15)',  badge: 'Solar PV · Modules',    badgeBg: '#fffbeb', badgeText: '#b45309' },
  inverter: { accent: '#2563EB', glow: 'rgba(37,99,235,0.15)',  badge: 'Inverter',              badgeBg: '#eff6ff', badgeText: '#1d4ed8' },
} as const

const ICON: Record<string, React.ReactNode> = {
  bess: <svg className="w-48 h-48 opacity-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.6"><rect x="2" y="7" width="18" height="11" rx="2"/><path d="M22 11v3"/><rect x="5" y="10" width="5" height="5" rx="1"/></svg>,
  solar: <svg className="w-48 h-48 opacity-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.6"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>,
  inverter: <svg className="w-48 h-48 opacity-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.6"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 12h3l2-3 2 6 2-3h1"/></svg>,
}

/* ── Spec icon mapping ──────────────────────────────────────────── */
const SPEC_ICON_MAP: [RegExp, string][] = [
  [/kwh|scalab|capacity|usable|storage/i, 'M3 17h4V9H3zM10 17h4V5h-4zM17 17h4v-6h-4z'],
  [/\bms\b|transfer|backup\s*time/i,      'M13 2 3 14h7l-1 8 10-12h-7l1-8z'],
  [/mppt|pv\b|solar\s*panel/i,            'M2 3h7v7H2zM15 3h7v7h-7zM2 14h7v7H2zM15 14h7v7h-7z'],
  [/\bip\d|protect|safety|shield/i,       'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4'],
  [/cycle|life|รอบ/i,                     'M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15'],
  [/effic/i,                              'M22 12h-4l-3 9L9 3l-3 9H2'],
  [/parallel|unit/i,                      'M5 3v16M19 3v16M5 12h14'],
  [/temp|°|celsius/i,                     'M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z'],
  [/kw\b|power|watt|inverter/i,           'M3 4h18v16H3z M7 12h3l2-3 2 6 2-3h1'],
  [/warrant|year|ปี/i,                    'M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z'],
]

function getSpecIcon(key: string): string {
  for (const [rx, path] of SPEC_ICON_MAP) {
    if (rx.test(key)) return path
  }
  return 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 8v4M12 16h.01'
}

function pickHeroSpecs(specs: [string, unknown][]): [string, unknown][] {
  const priority = [
    /kwh|scalab|capacity/i, /\bms\b|transfer/i, /mppt/i,
    /\bip\d|protect/i, /cycle|life/i, /effic/i, /kw\b|power/i, /parallel/i,
  ]
  const picked: [string, unknown][] = []
  for (const rx of priority) {
    const found = specs.find(([k]) => rx.test(k))
    if (found && !picked.includes(found)) picked.push(found)
    if (picked.length >= 5) break
  }
  for (const s of specs) {
    if (picked.length >= 5) break
    if (!picked.includes(s)) picked.push(s)
  }
  return picked.slice(0, 5)
}

/* ── Main Component ─────────────────────────────────────────────── */
function ProductPage({ product }: { product: Product }) {
  const theme = THEME[product.category as keyof typeof THEME] ?? THEME.bess
  const specs = Object.entries(product.specs ?? {})
  const images = product.images ?? []
  const pdfUrl = product.pdf_url && /^(https?:\/\/|\/(?!\/))/.test(product.pdf_url) ? product.pdf_url : null
  const heroMode = !!product.hero_bg_url
  const heroSpecs = pickHeroSpecs(specs)

  /* Split "TCL BlueArk X1" → brand="TCL", rest="BlueArk X1" */
  const enWords = product.name_en.trim().split(/\s+/)
  const brand = enWords[0]
  const productRest = enWords.slice(1).join(' ')
  const brandColor = BRAND_COLOR[brand] ?? '#ffffff'

  const NavBar = (
    <nav
      style={{ borderBottom: heroMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #f0f0f0' }}
      className={`px-4 md:px-8 py-4 flex flex-wrap items-center gap-3 z-50 ${heroMode ? 'absolute top-0 left-0 right-0 bg-black/20 backdrop-blur-md' : 'sticky top-0 bg-white/90 backdrop-blur-sm'}`}>
      <Link href="/index.html">
        <img src="/24sEnergy_png.png" alt="24sEnergy" className={`h-8 w-auto ${heroMode ? 'brightness-0 invert' : ''}`} style={heroMode ? { filter: 'brightness(0) invert(1)' } : {}} />
      </Link>
      <span className={`mx-1 ${heroMode ? 'text-white/30' : 'text-gray-200'}`}>/</span>
      <Link href="/products.html" className={`text-sm transition-colors ${heroMode ? 'text-white/50 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`}><Bi th="ผลิตภัณฑ์" en="Products" /></Link>
      <span className={`mx-1 ${heroMode ? 'text-white/30' : 'text-gray-200'}`}>/</span>
      <span className={`text-sm font-medium ${heroMode ? 'text-white/80' : 'text-gray-700'}`}><Bi th={product.name_th} en={product.name_en} /></span>
      <div className="ml-auto flex items-center gap-3">
        <Link href="/products.html" className={`text-sm transition-colors ${heroMode ? 'text-white/50 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`}><Bi th="← กลับ" en="← Back" /></Link>
        <a href={`/quote.html?product=${product.category}`}
          style={{ background: theme.accent }}
          className="px-5 py-2 text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity">
          <Bi th="ขอใบเสนอราคา" en="Get a Quote" />
        </a>
      </div>
    </nav>
  )

  return (
    <div className="min-h-screen" style={{ background: heroMode ? '#0c0c14' : 'white', fontFamily: "'IBM Plex Sans Thai',Arial,sans-serif" }}>

      {/* ── Hero ── */}
      {heroMode ? (
        /* ── Full-Bleed Hero ── */
        <section className="relative overflow-hidden" style={{ minHeight: '100svh' }}>
          {NavBar}

          {/* Background lifestyle image */}
          <Image src={product.hero_bg_url!} alt="" fill className="object-cover" priority style={{ zIndex: 0 }} />
          {/* Gradient overlay — light left (product shows), dark right (text readable) */}
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 1,
            background: 'linear-gradient(100deg, rgba(8,6,18,0.25) 0%, rgba(8,6,18,0.55) 42%, rgba(8,6,18,0.88) 65%, rgba(8,6,18,0.95) 100%)' }} />

          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 w-full grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-4 lg:gap-12 pt-28 pb-16 items-center min-h-screen">

            {/* Left — Product image with overlay thumbnails */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-lg">
                <ImageGallery images={images} alt={product.name_en} accent={theme.accent} heroMode />
              </div>
            </div>

            {/* Right — Text */}
            <div className="text-white">
              {/* Category badge */}
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black tracking-widest uppercase mb-5"
                style={{ background: `${theme.accent}22`, color: theme.accent, border: `1px solid ${theme.accent}44` }}>
                {theme.badge}
              </span>

              {/* Product name */}
              <h1 className="font-black leading-[1.0] tracking-tight mb-3">
                <span className="block text-4xl lg:text-5xl font-black tracking-tight" style={{ color: brandColor }}>{brand}</span>
                <span className="block text-4xl lg:text-6xl text-white">{productRest || brand}</span>
                {product.hero_badge && (
                  <span className="inline-block mt-2 px-3 py-1 text-sm font-black rounded-lg"
                    style={{ background: theme.accent, color: '#fff' }}>
                    {product.hero_badge}
                  </span>
                )}
              </h1>

              <p className="text-white/40 text-sm font-medium mb-4 tracking-wide">{product.name_en}</p>
              <p className="text-white/70 leading-relaxed mb-8 text-[15px] max-w-md">
                <Bi th={product.description_th} en={product.description_en} />
              </p>

              {/* Hero spec strip — 5 key specs with icons */}
              {heroSpecs.length > 0 && (
                <div className="grid grid-cols-5 gap-2 mb-8 py-5 border-t border-b border-white/10">
                  {heroSpecs.map(([k, v]) => (
                    <div key={k} className="flex flex-col items-center gap-2 text-center">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                        style={{ color: theme.accent }} dangerouslySetInnerHTML={{ __html: getSpecIcon(k) }} />
                      <div className="text-white font-black text-sm leading-tight">{String(v)}</div>
                      <div className="text-white/35 text-[9px] font-bold uppercase tracking-wider leading-tight">{k}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* CTAs */}
              <div className="flex gap-3 flex-wrap">
                <a href={`/quote.html?product=${product.category}`}
                  style={{ background: theme.accent }}
                  className="px-7 py-3.5 text-white font-bold rounded-2xl text-sm hover:opacity-90 transition-opacity inline-flex items-center gap-2">
                  <Bi th="ขอใบเสนอราคา" en="Get a Quote" />
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                </a>
                {pdfUrl ? (
                  <a href={pdfUrl} target="_blank" rel="noopener noreferrer"
                    className="px-7 py-3.5 font-bold rounded-2xl text-sm inline-flex items-center gap-2 border transition-all hover:bg-white/10"
                    style={{ borderColor: 'rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.85)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    <Bi th="ดาวน์โหลด Datasheet" en="Download Datasheet" />
                  </a>
                ) : (
                  <span className="px-7 py-3.5 font-bold rounded-2xl text-sm inline-flex items-center gap-2 border border-white/10 text-white/30 cursor-not-allowed select-none">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    <Bi th="Datasheet (ยังไม่มี)" en="Datasheet (unavailable)" />
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* ── Standard Hero (fallback when no hero_bg_url) ── */
        <>
          {NavBar}
          <section className="relative overflow-hidden flex items-center"
            style={{ background: `radial-gradient(ellipse at 35% 50%, ${theme.glow} 0%, transparent 65%), #fafafa` }}>
            <div className="max-w-7xl mx-auto px-8 w-full grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 lg:gap-12 py-16 items-center">
              <div className="flex items-center justify-center relative w-full">
                {images.length > 0 ? (
                  <div className="relative z-10 w-full max-w-xl">
                    <ImageGallery images={images} alt={product.name_en} accent={theme.accent} />
                  </div>
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center" style={{ color: theme.accent, opacity: 0.12 }}>
                    {ICON[product.category] ?? ICON.bess}
                  </div>
                )}
              </div>
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
        </>
      )}

      {/* ── Specs ── */}
      {specs.length > 0 && (
        <ParallaxSection imageUrl={product.bg_image_url ?? null}>
          <div className="py-20 px-8">
            <div className="max-w-7xl mx-auto">
              <p className="text-xs font-black uppercase tracking-[0.2em] mb-14"
                style={{ color: theme.accent }}>Technical Specifications</p>
              <div className="grid lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20 items-start">
                <div className="flex flex-col gap-10">
                  {specs.slice(0, 3).map(([k, v]) => (
                    <div key={k}>
                      <div className="text-[3.25rem] font-black text-white leading-none tracking-tight mb-2">{String(v)}</div>
                      <div className="text-xs font-semibold text-white/40 uppercase tracking-[0.18em]">{k}</div>
                      <div className="h-px w-10 mt-3 rounded" style={{ background: theme.accent, opacity: 0.7 }} />
                    </div>
                  ))}
                </div>
                <div className="grid sm:grid-cols-2 gap-0 border-t border-white/10">
                  {specs.map(([k, v]) => (
                    <div key={k} className="flex items-start gap-4 py-4 border-b border-white/10 px-1">
                      <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest w-32 flex-shrink-0 pt-0.5">{k}</span>
                      <span className="text-sm font-bold text-white/90">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ParallaxSection>
      )}

      {/* ── Details / Description ── */}
      <section className="py-20 px-8 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] mb-5" style={{ color: theme.accent }}>
              <Bi th="รายละเอียดผลิตภัณฑ์" en="Product details" />
            </p>
            <h2 className="text-3xl font-black text-gray-900 leading-tight mb-5">
              <Bi th={product.name_th} en={product.name_en} />
            </h2>
            <p className="text-gray-600 leading-relaxed text-[15px]">
              <Bi th={product.description_th} en={product.description_en} />
            </p>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] mb-5 text-gray-400">Product Overview</p>
            <p className="text-gray-500 leading-relaxed text-[15px]">{product.description_en}</p>
            {pdfUrl && (
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2.5 px-6 py-3 rounded-xl border font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90"
                style={{ borderColor: theme.accent, color: theme.accent, background: theme.badgeBg }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <Bi th="ดาวน์โหลด Product Datasheet" en="Download Product Datasheet" />
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
