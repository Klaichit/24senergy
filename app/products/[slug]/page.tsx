import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Product } from '@/types/database'

export const dynamic = 'force-dynamic'

interface Props { params: Promise<{ slug: string }> }

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!data) notFound()
  const product = data as Product
  return <ProductPage product={product} />
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
  const hasImage = !!product.images?.[0]

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Noto Sans Thai','Noto Sans',sans-serif" }}>

      {/* ── Navbar ── */}
      <nav style={{ borderBottom: '1px solid #f0f0f0' }}
        className="bg-white/90 backdrop-blur-sm px-8 py-4 flex items-center gap-3 sticky top-0 z-50">
        <Link href="/index.html" className="font-black text-gray-900 text-lg tracking-tight">
          24s<span style={{ color: theme.accent }}>Energy</span>
        </Link>
        <span className="text-gray-200 mx-1">/</span>
        <Link href="/products.html" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">ผลิตภัณฑ์</Link>
        <span className="text-gray-200 mx-1">/</span>
        <span className="text-sm text-gray-700 font-medium">{product.name_th}</span>
        <div className="ml-auto flex items-center gap-3">
          <Link href="/products.html" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">← กลับ</Link>
          <a href="/quote.html"
            style={{ background: theme.accent }}
            className="px-5 py-2 text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity">
            ขอใบเสนอราคา
          </a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden min-h-[92vh] flex items-center"
        style={{ background: `radial-gradient(ellipse at 35% 50%, ${theme.glow} 0%, transparent 65%), #fafafa` }}>

        <div className="max-w-7xl mx-auto px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 py-16 items-center">

          {/* Image side */}
          <div className="flex items-center justify-center relative">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ color: theme.accent }}>
              {ICON[product.category]}
            </div>
            {hasImage ? (
              <img
                src={product.images[0]}
                alt={product.name_en}
                className="relative z-10 max-h-[520px] w-full object-contain drop-shadow-2xl"
                style={{ filter: 'drop-shadow(0 40px 80px rgba(0,0,0,0.12))' }}
              />
            ) : (
              <div className="w-80 h-80 flex items-center justify-center"
                style={{ color: theme.accent, opacity: 0.15 }}>
                {ICON[product.category]}
              </div>
            )}
          </div>

          {/* Text side */}
          <div className="lg:pl-16">
            <span className="inline-block px-3 py-1.5 rounded-full text-xs font-black mb-6 tracking-widest uppercase"
              style={{ background: theme.badgeBg, color: theme.badgeText }}>
              {theme.badge}
            </span>
            <h1 className="text-5xl lg:text-6xl font-black text-gray-900 leading-[1.05] tracking-tight mb-4">
              {product.name_th}
            </h1>
            <p className="text-base text-gray-400 font-medium mb-6 tracking-wide">{product.name_en}</p>
            <p className="text-gray-600 leading-relaxed mb-10 max-w-md text-[15px]">
              {product.description_th}
            </p>
            <div className="flex gap-3 flex-wrap">
              <a href="/quote.html"
                style={{ background: theme.accent }}
                className="px-7 py-3.5 text-white font-bold rounded-2xl text-sm hover:opacity-90 transition-opacity inline-flex items-center gap-2">
                ขอใบเสนอราคา
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </a>
              {product.pdf_url && (
                <a href={product.pdf_url} target="_blank" rel="noopener noreferrer"
                  className="px-7 py-3.5 bg-white text-gray-700 font-bold rounded-2xl text-sm hover:bg-gray-50 transition-colors inline-flex items-center gap-2 border border-gray-200">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Datasheet
                </a>
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
              style={{ color: theme.accent }}>รายละเอียดผลิตภัณฑ์</p>
            <h2 className="text-3xl font-black text-gray-900 leading-tight mb-5">
              {product.name_th}
            </h2>
            <p className="text-gray-600 leading-relaxed text-[15px]">
              {product.description_th}
            </p>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] mb-5 text-gray-400">
              Product Overview
            </p>
            <p className="text-gray-500 leading-relaxed text-[15px]">
              {product.description_en}
            </p>
            {product.pdf_url && (
              <a href={product.pdf_url} target="_blank" rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 text-sm font-bold"
                style={{ color: theme.accent }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                ดาวน์โหลด Product Datasheet →
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-8 bg-white border-t border-gray-100 text-center">
        <p className="text-xs font-black uppercase tracking-[0.2em] mb-4 text-gray-400">Ready to get started?</p>
        <h2 className="text-3xl font-black text-gray-900 mb-3">สนใจผลิตภัณฑ์นี้?</h2>
        <p className="text-gray-500 mb-8 text-sm">ทีมวิศวกรพร้อมให้คำปรึกษาและเสนอราคาฟรี ไม่มีข้อผูกมัด</p>
        <a href="/quote.html"
          style={{ background: theme.accent }}
          className="inline-block px-10 py-4 text-white font-black rounded-2xl text-sm hover:opacity-90 transition-opacity">
          ขอใบเสนอราคา →
        </a>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-950 text-white/40 text-xs text-center py-8">
        © 2026 24sEnergy Co., Ltd. All rights reserved.
      </footer>
    </div>
  )
}
