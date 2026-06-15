import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import type { Quote } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const [{ count: productCount }, { count: quoteCount }, { data }] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('quotes').select('*', { count: 'exact', head: true }),
    supabase.from('quotes').select('*').eq('status', 'new').order('created_at', { ascending: false }).limit(5),
  ])

  const newQuotes = (data ?? []) as Quote[]

  const stats = [
    { label: 'ผลิตภัณฑ์ทั้งหมด', value: productCount ?? 0, href: '/admin/products', color: 'bg-purple-50 text-purple-700' },
    { label: 'ใบเสนอราคาทั้งหมด', value: quoteCount ?? 0, href: '/admin/quotes', color: 'bg-blue-50 text-blue-700' },
    { label: 'รอติดตาม (New)', value: newQuotes.length, href: '/admin/quotes', color: 'bg-amber-50 text-amber-700' },
  ]

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
      <p className="text-sm text-gray-500 mb-8">ภาพรวมระบบ 24sEnergy</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-5 mb-10">
        {stats.map(s => (
          <Link key={s.label} href={s.href} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
            <div className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold mb-3 ${s.color}`}>{s.label}</div>
            <div className="text-4xl font-bold text-gray-900">{s.value}</div>
          </Link>
        ))}
      </div>

      {/* Recent quotes */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-800">ใบเสนอราคาล่าสุด (รอติดตาม)</h2>
          <Link href="/admin/quotes" className="text-sm text-purple-600 font-semibold hover:underline">ดูทั้งหมด →</Link>
        </div>
        {newQuotes.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['ชื่อ','บริษัท','โทร','สินค้าที่สนใจ','วันที่'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {newQuotes.map(q => (
                <tr key={q.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{q.name}</td>
                  <td className="px-6 py-4 text-gray-600">{q.company}</td>
                  <td className="px-6 py-4 text-gray-600">{q.phone}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {q.products.map((p: string) => (
                        <span key={p} className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-md font-mono">{p.toUpperCase()}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{new Date(q.created_at).toLocaleDateString('th-TH')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-16 text-center text-gray-400 text-sm">ยังไม่มีใบเสนอราคาใหม่</div>
        )}
      </div>
    </div>
  )
}
