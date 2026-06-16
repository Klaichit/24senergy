'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Partner { id: string; name: string; logo_url: string | null; website: string | null; sort_order: number; is_active: boolean }
const BUCKET = 'product-images'
type Props = { partner?: Partner }

export default function PartnerForm({ partner }: Props) {
  const router = useRouter()
  const isEdit = !!partner
  const [form, setForm] = useState({
    name:       partner?.name ?? '',
    website:    partner?.website ?? '',
    sort_order: partner?.sort_order ?? 0,
    is_active:  partner?.is_active ?? true,
  })
  const [logoUrl, setLogoUrl] = useState(partner?.logo_url ?? '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true); setError('')
    const ext = file.name.split('.').pop()
    const path = `partners/${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true })
    if (upErr) { setError(upErr.message); setUploading(false); return }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    setLogoUrl(data.publicUrl); setUploading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError('')
    const payload = { ...form, logo_url: logoUrl || null, website: form.website || null, sort_order: Number(form.sort_order) }
    const { error: err } = isEdit
      ? await supabase.from('partners').update(payload).eq('id', partner.id)
      : await supabase.from('partners').insert(payload)
    if (err) { setError(err.message); setSaving(false); return }
    router.push('/admin/partners'); router.refresh()
  }

  async function handleDelete() {
    if (!confirm('ลบ partner นี้?')) return
    await supabase.from('partners').delete().eq('id', partner!.id)
    router.push('/admin/partners'); router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <h2 className="font-bold text-gray-800">ข้อมูล Partner / ลูกค้า</h2>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">ชื่อ<span className="text-purple-500">*</span></label>
          <input className="input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="HITHIUM" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">Website URL</label>
          <input className="input" type="url" value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">ลำดับ</label>
            <input className="input" type="number" value={form.sort_order} onChange={e => set('sort_order', e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">สถานะ</label>
            <select className="input" value={form.is_active ? '1' : '0'} onChange={e => set('is_active', e.target.value === '1')}>
              <option value="1">แสดง</option>
              <option value="0">ซ่อน</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <h2 className="font-bold text-gray-800">โลโก้</h2>
        {logoUrl && (
          <div className="relative group w-40 h-20 rounded-xl overflow-hidden bg-gray-50 border border-gray-200 flex items-center justify-center p-3">
            <img src={logoUrl} alt="" className="max-w-full max-h-full object-contain" />
            <button type="button" onClick={() => setLogoUrl('')}
              className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">×</button>
          </div>
        )}
        <div onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-purple-300 hover:bg-purple-50/30 transition-colors">
          {uploading ? <p className="text-sm text-purple-600 font-medium">กำลังอัปโหลด...</p> : (
            <p className="text-sm text-gray-500">คลิกอัปโหลดโลโก้ (PNG โปร่งใสดีที่สุด)</p>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving || uploading}
          className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 disabled:opacity-50 transition-colors">
          {saving ? 'กำลังบันทึก...' : isEdit ? 'บันทึก' : 'เพิ่ม Partner'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors">ยกเลิก</button>
        {isEdit && (
          <button type="button" onClick={handleDelete}
            className="ml-auto px-5 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors">ลบ</button>
        )}
      </div>
    </form>
  )
}
