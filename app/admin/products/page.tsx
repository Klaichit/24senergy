import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import type { Product } from '@/types/database'

export const dynamic = 'force-dynamic'

const categoryColor: Record<string, string> = {
  bess:  'bg-purple-100 text-purple-700',
  solar: 'bg-amber-100 text-amber-700',
  ev:    'bg-green-100 text-green-700',
  ems:   'bg-blue-100 text-blue-700',
}

export default async function ProductsAdmin() {
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('sort_order')

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">ผลิตภัณฑ์</h1>
          <p className="text-sm text-gray-500">{products?.length ?? 0} รายการ</p>
        </div>
        <Link href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          เพิ่มผลิตภัณฑ์
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['ลำดับ','ชื่อ','หมวดหมู่','สถานะ','การจัดการ'].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products?.map((p: Product) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-400 font-mono text-xs">{p.sort_order}</td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900">{p.name_th}</div>
                  <div className="text-xs text-gray-400 font-mono">{p.slug}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${categoryColor[p.category] ?? 'bg-gray-100 text-gray-600'}`}>
                    {p.category.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {p.is_published
                    ? <span className="flex items-center gap-1.5 text-green-600 text-xs font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"/>เผยแพร่แล้ว</span>
                    : <span className="flex items-center gap-1.5 text-gray-400 text-xs font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block"/>ซ่อน</span>}
                </td>
                <td className="px-6 py-4">
                  <Link href={`/admin/products/${p.id}`}
                    className="text-purple-600 font-semibold text-xs hover:underline">
                    แก้ไข
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
