import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import type { Partner } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function PartnersPage() {
  const { data } = await supabase.from('partners').select('*').order('sort_order')
  const partners = (data ?? []) as Partner[]

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Partners / ลูกค้า</h1>
          <p className="text-sm text-gray-400 mt-1">{partners.length} รายการ</p>
        </div>
        <Link href="/admin/partners/new"
          className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 transition-colors">
          + เพิ่ม Partner
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {partners.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">ยังไม่มี partner</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">โลโก้</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">ชื่อ</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Website</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">ลำดับ</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">สถานะ</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {partners.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    {p.logo_url
                      ? <div className="w-20 h-10 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center p-2">
                          <img src={p.logo_url} alt={p.name} className="max-w-full max-h-full object-contain" />
                        </div>
                      : <div className="w-20 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400 font-mono">No logo</div>
                    }
                  </td>
                  <td className="px-5 py-3 font-semibold text-gray-800">{p.name}</td>
                  <td className="px-5 py-3 text-sm text-blue-600 truncate max-w-[200px]">
                    {p.website ? <a href={p.website} target="_blank" rel="noopener noreferrer" className="hover:underline">{p.website}</a> : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500 font-mono">{p.sort_order}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.is_active ? 'แสดง' : 'ซ่อน'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/admin/partners/${p.id}`} className="text-sm text-purple-600 hover:text-purple-800 font-semibold">แก้ไข</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
