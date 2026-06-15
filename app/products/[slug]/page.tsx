import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Product } from '@/types/database'

export const dynamic = 'force-dynamic'

const catColor: Record<string, { bg: string; text: string; label: string }> = {
  bess:  { bg: 'bg-purple-100', text: 'text-purple-700', label: 'BESS · Storage' },
  solar: { bg: 'bg-amber-100',  text: 'text-amber-700',  label: 'Solar PV' },
  ev:    { bg: 'bg-green-100',  text: 'text-green-700',  label: 'EV Charger' },
  ems:   { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'EMS · Monitoring' },
}

const catGradient: Record<string, string> = {
  bess:  'from-purple-900 via-purple-800 to-gray-900',
  solar: 'from-amber-900 via-amber-700 to-gray-900',
  ev:    'from-green-900 via-green-800 to-gray-900',
  ems:   'from-blue-900 via-blue-800 to-gray-900',
}

interface Props {
  params: Promise<{ slug: string }>
}

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
  const cat = catColor[product.category] ?? catColor.bess
  const gradient = catGradient[product.category] ?? catGradient.bess
  const specs = Object.entries(product.specs ?? {})
  const image = product.images?.[0] ?? null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <Link href="/index.html" className="font-bold text-lg text-gray-900">
          24s<span className="text-purple-600">Energy</span>
        </Link>
        <span className="text-gray-300">/</span>
        <Link href="/products.html" className="text-sm text-gray-500 hover:text-gray-800">ผลิตภัณฑ์</Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-800 font-medium">{product.name_th}</span>
        <div className="ml-auto flex items-center gap-3">
          <Link href="/products.html" className="text-sm text-gray-500 hover:text-gray-800">← กลับ</Link>
          <a href="/quote.html" className="px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700 transition-colors">
            ขอใบเสนอราคา
          </a>
        </div>
      </nav>

      {/* Hero */}
      <div className={`bg-gradient-to-br ${gradient} text-white`}>
        <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${cat.bg} ${cat.text}`}>
              {cat.label}
            </span>
            <h1 className="text-4xl font-black leading-tight mb-3">{product.name_th}</h1>
            <p className="text-lg text-white/70 font-light mb-2">{product.name_en}</p>
            <p className="text-white/80 leading-relaxed mt-4">{product.description_th}</p>
            <div className="flex gap-3 mt-8">
              <a href="/quote.html"
                className="px-6 py-3 bg-white text-gray-900 font-bold rounded-xl text-sm hover:bg-gray-100 transition-colors">
                ขอใบเสนอราคา →
              </a>
              {product.pdf_url && (
                <a href={product.pdf_url} target="_blank" rel="noopener noreferrer"
                  className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl text-sm hover:bg-white/20 transition-colors border border-white/20">
                  ดาวน์โหลด Datasheet
                </a>
              )}
            </div>
          </div>
          {image && (
            <div className="relative aspect-square max-w-sm mx-auto">
              <img src={image} alt={product.name_en}
                className="w-full h-full object-contain drop-shadow-2xl" />
            </div>
          )}
        </div>
      </div>

      {/* Specs */}
      {specs.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 py-12">
          <h2 className="text-xl font-black text-gray-900 mb-6">ข้อมูลจำเพาะ</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {specs.map(([key, value]) => (
              <div key={key} className="bg-white border border-gray-200 rounded-2xl p-5 text-center">
                <div className="text-2xl font-black text-gray-900 mb-1">{String(value)}</div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{key}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Description EN */}
      {product.description_en && (
        <div className="max-w-6xl mx-auto px-6 pb-12">
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <h2 className="text-xl font-black text-gray-900 mb-4">Product Overview</h2>
            <p className="text-gray-600 leading-relaxed">{product.description_en}</p>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="bg-purple-600 text-white py-16 text-center">
        <h2 className="text-2xl font-black mb-3">สนใจผลิตภัณฑ์นี้?</h2>
        <p className="text-white/80 mb-8">ทีมวิศวกรพร้อมให้คำปรึกษาและเสนอราคาฟรี</p>
        <a href="/quote.html"
          className="inline-block px-8 py-4 bg-white text-purple-700 font-black rounded-xl text-sm hover:bg-gray-100 transition-colors">
          ขอใบเสนอราคา →
        </a>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white/60 text-sm text-center py-8">
        © 2026 24sEnergy Co., Ltd.
      </footer>
    </div>
  )
}
