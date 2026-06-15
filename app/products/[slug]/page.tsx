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

  switch (product.category) {
    case 'bess':  return <BessTemplate  product={product} />
    case 'solar': return <SolarTemplate product={product} />
    case 'ev':    return <EvTemplate    product={product} />
    case 'ems':   return <EmsTemplate   product={product} />
    default:      return <BessTemplate  product={product} />
  }
}

/* ─── Shared Components ────────────────────────────────────────── */

function NavBar({ product }: { product: Product }) {
  return (
    <nav className="bg-white/90 backdrop-blur border-b border-gray-100 px-6 py-4 flex items-center gap-3 sticky top-0 z-50">
      <Link href="/index.html" className="font-bold text-gray-900">
        24s<span className="text-purple-600">Energy</span>
      </Link>
      <span className="text-gray-300">/</span>
      <Link href="/products.html" className="text-sm text-gray-400 hover:text-gray-700">ผลิตภัณฑ์</Link>
      <span className="text-gray-300">/</span>
      <span className="text-sm text-gray-800 font-medium truncate max-w-[200px]">{product.name_th}</span>
      <div className="ml-auto flex items-center gap-3">
        <Link href="/products.html" className="text-sm text-gray-400 hover:text-gray-700">← กลับ</Link>
        <a href="/quote.html" className="px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700 transition-colors">
          ขอใบเสนอราคา
        </a>
      </div>
    </nav>
  )
}

function SpecCard({ k, v }: { k: string; v: string }) {
  return (
    <div className="bg-white/10 backdrop-blur rounded-2xl p-5 text-center border border-white/10">
      <div className="text-2xl font-black text-white mb-1">{v}</div>
      <div className="text-xs font-semibold text-white/60 uppercase tracking-widest">{k}</div>
    </div>
  )
}

function SpecCardLight({ k, v }: { k: string; v: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 text-center shadow-sm">
      <div className="text-2xl font-black text-gray-900 mb-1">{v}</div>
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{k}</div>
    </div>
  )
}

function SharedFooter({ color = 'bg-purple-600' }: { color?: string }) {
  return (
    <footer className={`${color} text-white py-14 text-center`}>
      <h2 className="text-2xl font-black mb-2">สนใจผลิตภัณฑ์นี้?</h2>
      <p className="text-white/75 mb-7 text-sm">ทีมวิศวกรพร้อมให้คำปรึกษาและเสนอราคาฟรี ไม่มีข้อผูกมัด</p>
      <a href="/quote.html" className="inline-block px-8 py-3.5 bg-white text-gray-900 font-black rounded-xl text-sm hover:bg-gray-100 transition-colors shadow-lg">
        ขอใบเสนอราคา →
      </a>
    </footer>
  )
}

/* ─── BESS Template ────────────────────────────────────────────── */
function BessTemplate({ product }: { product: Product }) {
  const specs = Object.entries(product.specs ?? {})
  return (
    <div className="min-h-screen bg-[#0f0a1e]">
      <NavBar product={product} />

      {/* Hero — dark with glowing purple */}
      <section className="relative overflow-hidden pt-16 pb-24 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(106,45,175,0.5),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(63,63,63,0.3),transparent_50%)]" />
        <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-black mb-5 bg-purple-500/20 text-purple-300 border border-purple-500/30 tracking-widest uppercase">
              BESS · Battery Energy Storage
            </span>
            <h1 className="text-5xl font-black text-white leading-tight mb-3">{product.name_th}</h1>
            <p className="text-purple-300 text-lg mb-6">{product.name_en}</p>
            <p className="text-white/65 leading-relaxed mb-8">{product.description_th}</p>
            <div className="flex gap-3 flex-wrap">
              <a href="/quote.html" className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl text-sm hover:bg-purple-700 transition-colors">
                ขอใบเสนอราคา →
              </a>
              {product.pdf_url && (
                <a href={product.pdf_url} target="_blank" rel="noopener noreferrer"
                  className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl text-sm hover:bg-white/15 transition-colors border border-white/20">
                  ดาวน์โหลด Datasheet
                </a>
              )}
            </div>
          </div>
          <div className="flex justify-center">
            {product.images?.[0]
              ? <img src={product.images[0]} alt={product.name_en} className="max-h-80 object-contain drop-shadow-[0_0_60px_rgba(106,45,175,0.5)]" />
              : <BessIcon />}
          </div>
        </div>
      </section>

      {/* Specs */}
      {specs.length > 0 && (
        <section className="bg-[#1a1030] py-14 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-white font-black text-xl mb-8 text-center tracking-wide">TECHNICAL SPECIFICATIONS</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {specs.map(([k, v]) => <SpecCard key={k} k={k} v={String(v)} />)}
            </div>
          </div>
        </section>
      )}

      {/* Description */}
      <section className="bg-[#0f0a1e] py-14 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-white/60 leading-relaxed text-base">{product.description_en}</p>
        </div>
      </section>

      <SharedFooter color="bg-purple-700" />
    </div>
  )
}

/* ─── Solar Template ───────────────────────────────────────────── */
function SolarTemplate({ product }: { product: Product }) {
  const specs = Object.entries(product.specs ?? {})
  return (
    <div className="min-h-screen bg-white">
      <NavBar product={product} />

      {/* Hero — bright with solar warmth */}
      <section className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 pt-16 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center relative">
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-black mb-5 bg-amber-100 text-amber-700 tracking-widest uppercase">
              Solar PV · Rooftop
            </span>
            <h1 className="text-5xl font-black text-gray-900 leading-tight mb-3">{product.name_th}</h1>
            <p className="text-amber-600 text-lg mb-6">{product.name_en}</p>
            <p className="text-gray-600 leading-relaxed mb-8">{product.description_th}</p>
            <div className="flex gap-3 flex-wrap">
              <a href="/quote.html" className="px-6 py-3 bg-amber-500 text-white font-bold rounded-xl text-sm hover:bg-amber-600 transition-colors">
                ขอใบเสนอราคา →
              </a>
              {product.pdf_url && (
                <a href={product.pdf_url} target="_blank" rel="noopener noreferrer"
                  className="px-6 py-3 bg-white text-amber-700 font-bold rounded-xl text-sm hover:bg-amber-50 transition-colors border border-amber-200">
                  ดาวน์โหลด Datasheet
                </a>
              )}
            </div>
          </div>
          <div className="flex justify-center">
            {product.images?.[0]
              ? <img src={product.images[0]} alt={product.name_en} className="max-h-80 object-contain drop-shadow-xl" />
              : <SolarIcon />}
          </div>
        </div>
      </section>

      {/* Specs */}
      {specs.length > 0 && (
        <section className="bg-gray-900 py-14 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-white font-black text-xl mb-8 text-center tracking-wide">TECHNICAL SPECIFICATIONS</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {specs.map(([k, v]) => <SpecCard key={k} k={k} v={String(v)} />)}
            </div>
          </div>
        </section>
      )}

      {/* Description */}
      <section className="bg-amber-50 py-14 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-gray-600 leading-relaxed">{product.description_en}</p>
        </div>
      </section>

      <SharedFooter color="bg-amber-600" />
    </div>
  )
}

/* ─── EV Template ──────────────────────────────────────────────── */
function EvTemplate({ product }: { product: Product }) {
  const specs = Object.entries(product.specs ?? {})
  return (
    <div className="min-h-screen bg-white">
      <NavBar product={product} />

      {/* Hero — clean white + green accent */}
      <section className="bg-gradient-to-br from-green-900 via-emerald-900 to-gray-900 pt-16 pb-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(16,185,129,0.2),transparent_60%)]" />
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center relative">
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-black mb-5 bg-green-500/20 text-green-300 border border-green-500/30 tracking-widest uppercase">
              EV Charger · DC Fast
            </span>
            <h1 className="text-5xl font-black text-white leading-tight mb-3">{product.name_th}</h1>
            <p className="text-green-400 text-lg mb-6">{product.name_en}</p>
            <p className="text-white/65 leading-relaxed mb-8">{product.description_th}</p>
            <div className="flex gap-3 flex-wrap">
              <a href="/quote.html" className="px-6 py-3 bg-green-500 text-white font-bold rounded-xl text-sm hover:bg-green-600 transition-colors">
                ขอใบเสนอราคา →
              </a>
              {product.pdf_url && (
                <a href={product.pdf_url} target="_blank" rel="noopener noreferrer"
                  className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl text-sm hover:bg-white/15 transition-colors border border-white/20">
                  ดาวน์โหลด Datasheet
                </a>
              )}
            </div>
          </div>
          <div className="flex justify-center">
            {product.images?.[0]
              ? <img src={product.images[0]} alt={product.name_en} className="max-h-80 object-contain drop-shadow-2xl" />
              : <EvIcon />}
          </div>
        </div>
      </section>

      {/* Specs */}
      {specs.length > 0 && (
        <section className="bg-gray-50 py-14 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-gray-900 font-black text-xl mb-8 text-center tracking-wide">TECHNICAL SPECIFICATIONS</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {specs.map(([k, v]) => <SpecCardLight key={k} k={k} v={String(v)} />)}
            </div>
          </div>
        </section>
      )}

      {/* Description */}
      <section className="bg-white py-14 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-gray-600 leading-relaxed">{product.description_en}</p>
        </div>
      </section>

      <SharedFooter color="bg-green-700" />
    </div>
  )
}

/* ─── EMS Template ─────────────────────────────────────────────── */
function EmsTemplate({ product }: { product: Product }) {
  const specs = Object.entries(product.specs ?? {})
  return (
    <div className="min-h-screen bg-gray-950">
      <NavBar product={product} />

      {/* Hero — data/tech dark blue */}
      <section className="relative overflow-hidden pt-16 pb-24 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_60%,rgba(37,99,235,0.35),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_30%,rgba(96,165,250,0.15),transparent_45%)]" />
        <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-black mb-5 bg-blue-500/20 text-blue-300 border border-blue-500/30 tracking-widest uppercase">
              EMS · Cloud Monitoring
            </span>
            <h1 className="text-5xl font-black text-white leading-tight mb-3">{product.name_th}</h1>
            <p className="text-blue-400 text-lg mb-6">{product.name_en}</p>
            <p className="text-white/65 leading-relaxed mb-8">{product.description_th}</p>
            <div className="flex gap-3 flex-wrap">
              <a href="/quote.html" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition-colors">
                ขอใบเสนอราคา →
              </a>
              {product.pdf_url && (
                <a href={product.pdf_url} target="_blank" rel="noopener noreferrer"
                  className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl text-sm hover:bg-white/15 transition-colors border border-white/20">
                  ดาวน์โหลด Datasheet
                </a>
              )}
            </div>
          </div>
          <div className="flex justify-center">
            {product.images?.[0]
              ? <img src={product.images[0]} alt={product.name_en} className="max-h-80 object-contain drop-shadow-[0_0_60px_rgba(37,99,235,0.4)]" />
              : <EmsIcon />}
          </div>
        </div>
      </section>

      {/* Specs */}
      {specs.length > 0 && (
        <section className="bg-gray-900 py-14 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-white font-black text-xl mb-8 text-center tracking-wide">TECHNICAL SPECIFICATIONS</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {specs.map(([k, v]) => <SpecCard key={k} k={k} v={String(v)} />)}
            </div>
          </div>
        </section>
      )}

      {/* Description */}
      <section className="bg-gray-950 py-14 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-white/55 leading-relaxed">{product.description_en}</p>
        </div>
      </section>

      <SharedFooter color="bg-blue-700" />
    </div>
  )
}

/* ─── Icons ────────────────────────────────────────────────────── */
function BessIcon() {
  return (
    <svg className="w-64 h-64 text-purple-400/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8">
      <rect x="2" y="7" width="18" height="11" rx="2"/><path d="M22 11v3"/><rect x="5" y="10" width="5" height="5" rx="1"/>
    </svg>
  )
}
function SolarIcon() {
  return (
    <svg className="w-64 h-64 text-amber-400/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8">
      <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
  )
}
function EvIcon() {
  return (
    <svg className="w-64 h-64 text-green-400/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8">
      <rect x="6" y="3" width="12" height="18" rx="2"/><line x1="10" y1="7" x2="14" y2="7"/><path d="M11 11l-2 4h6l-2 4"/>
    </svg>
  )
}
function EmsIcon() {
  return (
    <svg className="w-64 h-64 text-blue-400/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8">
      <rect x="2" y="3" width="20" height="14" rx="2"/><polyline points="5 13 9 8 13 11 19 5"/>
    </svg>
  )
}
