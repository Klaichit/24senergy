import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import type { HeroSlide } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function HeroPage() {
  const { data } = await supabase.from('hero_slides').select('*').order('sort_order')
  const slides = (data ?? []) as HeroSlide[]

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Hero Carousel</h1>
          <p className="text-sm text-gray-400 mt-1">{slides.length} slides</p>
        </div>
        <Link href="/admin/hero/new"
          className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 transition-colors">
          + เพิ่ม Slide
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {slides.map((s, i) => (
          <div key={s.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="aspect-video relative bg-gray-900 flex items-end">
              {s.image_url
                ? <img src={s.image_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-70" />
                : <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
              }
              <div className="relative p-4 text-white">
                <div className="text-xs font-mono text-white/50 mb-1">Slide {i + 1}</div>
                <div className="font-black text-lg leading-tight">{s.title_th}</div>
                <div className="text-xs text-white/60">{s.title_en}</div>
              </div>
              <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-bold ${
                s.is_active ? 'bg-green-500 text-white' : 'bg-gray-600 text-white/70'
              }`}>{s.is_active ? 'Active' : 'Hidden'}</span>
            </div>
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-100">
              <span className="text-xs text-gray-400 font-mono">sort: {s.sort_order}</span>
              <Link href={`/admin/hero/${s.id}`}
                className="text-sm text-purple-600 hover:text-purple-800 font-semibold">แก้ไข</Link>
            </div>
          </div>
        ))}
        {slides.length === 0 && (
          <div className="col-span-2 py-16 text-center text-sm text-gray-400">ยังไม่มี slide</div>
        )}
      </div>
    </div>
  )
}
