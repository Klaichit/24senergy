import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import type { Project } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
  const { data } = await supabase.from('projects').select('*').order('sort_order')
  const projects = (data ?? []) as Project[]

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">โครงการ</h1>
          <p className="text-sm text-gray-400 mt-1">{projects.length} โครงการ</p>
        </div>
        <Link href="/admin/projects/new"
          className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 transition-colors">
          + เพิ่มโครงการ
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">#</th>
              <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">โครงการ</th>
              <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">สถานที่</th>
              <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">ขนาด</th>
              <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">ปี</th>
              <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">สถานะ</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {projects.map(p => (
              <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-400 font-mono">{p.sort_order}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {p.image_url ? (
                      <img src={p.image_url} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0" />
                    )}
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{p.title_th}</div>
                      <div className="text-xs text-gray-400">{p.category}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{p.location_th}</td>
                <td className="px-6 py-4 text-sm font-mono text-gray-800">
                  {p.capacity_value != null ? `${p.capacity_value} ${p.capacity_unit}` : '—'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{p.year ?? '—'}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    p.is_featured ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {p.is_featured ? 'แสดง' : 'ซ่อน'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/admin/projects/${p.id}`}
                    className="text-sm text-purple-600 hover:text-purple-800 font-semibold">แก้ไข</Link>
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-400">ยังไม่มีโครงการ</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
