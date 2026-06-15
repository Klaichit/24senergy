'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Quote, QuoteStatus } from '@/types/database'

const STATUS_OPTIONS: { value: QuoteStatus; label: string; color: string }[] = [
  { value: 'new',       label: 'ใหม่',          color: 'bg-amber-100 text-amber-700' },
  { value: 'contacted', label: 'ติดต่อแล้ว',   color: 'bg-blue-100 text-blue-700' },
  { value: 'quoted',    label: 'ส่งใบเสนอราคา', color: 'bg-purple-100 text-purple-700' },
  { value: 'closed',    label: 'ปิดงาน',        color: 'bg-green-100 text-green-700' },
]

const statusColor = Object.fromEntries(STATUS_OPTIONS.map(s => [s.value, s.color]))
const statusLabel = Object.fromEntries(STATUS_OPTIONS.map(s => [s.value, s.label]))

export default function QuotesAdmin() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [filter, setFilter] = useState<QuoteStatus | 'all'>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setQuotes(data ?? []))
  }, [])

  async function updateStatus(id: string, status: QuoteStatus) {
    setUpdating(id)
    const { data } = await supabase
      .from('quotes')
      .update({ status })
      .eq('id', id)
      .select()
      .single()
    if (data) setQuotes(qs => qs.map(q => q.id === id ? data : q))
    setUpdating(null)
  }

  const visible = filter === 'all' ? quotes : quotes.filter(q => q.status === filter)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">ใบเสนอราคา</h1>
          <p className="text-sm text-gray-500">{quotes.length} รายการทั้งหมด</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            ทั้งหมด ({quotes.length})
          </button>
          {STATUS_OPTIONS.map(s => (
            <button key={s.value} onClick={() => setFilter(s.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filter === s.value ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s.label} ({quotes.filter(q => q.status === s.value).length})
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['ชื่อ / บริษัท','โทร / Email','สินค้า','สถานะ','วันที่','จัดการ'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {visible.map(q => (
              <>
                <tr key={q.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setExpanded(expanded === q.id ? null : q.id)}>
                  <td className="px-5 py-4">
                    <div className="font-semibold text-gray-900">{q.name}</div>
                    <div className="text-xs text-gray-400">{q.company}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-gray-700">{q.phone}</div>
                    <div className="text-xs text-gray-400">{q.email}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {q.products.map((p: string) => (
                        <span key={p} className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-md font-mono">{p.toUpperCase()}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${statusColor[q.status]}`}>
                      {statusLabel[q.status]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">
                    {new Date(q.created_at).toLocaleDateString('th-TH')}
                  </td>
                  <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                    <select
                      value={q.status}
                      disabled={updating === q.id}
                      onChange={e => updateStatus(q.id, e.target.value as QuoteStatus)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:border-purple-400 disabled:opacity-50"
                    >
                      {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </td>
                </tr>
                {expanded === q.id && (
                  <tr key={`${q.id}-detail`} className="bg-purple-50/50">
                    <td colSpan={6} className="px-5 py-4">
                      <div className="grid grid-cols-3 gap-6 text-sm">
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase mb-1">ข้อมูลติดต่อ</p>
                          <p><span className="text-gray-500">Line ID:</span> {q.line_id || '—'}</p>
                          <p><span className="text-gray-500">ช่องทางที่ต้องการ:</span> {q.contact_pref}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase mb-1">โครงการ</p>
                          <p><span className="text-gray-500">ประเภทธุรกิจ:</span> {q.business_type}</p>
                          <p><span className="text-gray-500">ความต้องการไฟ:</span> {q.power_demand || '—'}</p>
                          <p><span className="text-gray-500">ระยะเวลา:</span> {q.timeline || '—'}</p>
                          <p><span className="text-gray-500">งบประมาณ:</span> {q.budget || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase mb-1">รายละเอียดเพิ่มเติม</p>
                          <p className="text-gray-700 whitespace-pre-wrap">{q.details || '—'}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={6} className="py-16 text-center text-gray-400 text-sm">ไม่มีรายการ</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
