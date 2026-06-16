'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { HeroSlide } from '@/types/database'

const BUCKET = 'product-images'

type Props = { slide?: HeroSlide }

export default function HeroSlideForm({ slide }: Props) {
  const router = useRouter()
  const isEdit = !!slide

  const [form, setForm] = useState({
    title_th:   slide?.title_th ?? '',
    title_en:   slide?.title_en ?? '',
    sort_order: slide?.sort_order ?? 0,
    is_active:  slide?.is_active ?? true,
  })
  const [imageUrl, setImageUrl] = useState(slide?.image_url ?? '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true); setError('')
    const ext = file.name.split('.').pop()
    const path = `hero/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true })
    if (upErr) { setError(upErr.message); setUploading(false); return }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    setImageUrl(data.publicUrl)
    setUploading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError('')
    const payload = { ...form, image_url: imageUrl || null, sort_order: Number(form.sort_order) }
    const { error: err } = isEdit
      ? await supabase.from('hero_slides').update(payload).eq('id', slide.id)
      : await supabase.from('hero_slides').insert(payload)
    if (err) { setError(err.message); setSaving(false); return }
    router.push('/admin/hero'); router.refresh()
  }

  async function handleDelete() {
    if (!confirm('ลบ slide นี้?')) return
    await supabase.from('hero_slides').delete().eq('id', slide!.id)
    router.push('/admin/hero'); router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <h2 className="font-bold text-gray-800">ข้อความ Slide</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">หัวข้อ (ไทย)<span className="text-purple-500">*</span></label>
            <input className="input" value={form.title_th} onChange={e => set('title_th', e.target.value)} required placeholder="ระบบกักเก็บพลังงาน" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Title (EN)<span className="text-purple-500">*</span></label>
            <input className="input" value={form.title_en} onChange={e => set('title_en', e.target.value)} required placeholder="BATTERY STORAGE" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">ลำดับ</label>
            <input className="input" type="number" value={form.sort_order} onChange={e => set('sort_order', e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">สถานะ</label>
            <select className="input" value={form.is_active ? '1' : '0'} onChange={e => set('is_active', e.target.value === '1')}>
              <option value="1">แสดง (Active)</option>
              <option value="0">ซ่อน</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <h2 className="font-bold text-gray-800">รูปภาพพื้นหลัง</h2>
        {imageUrl && (
          <div className="relative group aspect-video rounded-xl overflow-hidden bg-gray-900">
            <img src={imageUrl} alt="" className="w-full h-full object-cover opacity-80" />
            <button type="button" onClick={() => setImageUrl('')}
              className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">×</button>
          </div>
        )}
        <div onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-purple-300 hover:bg-purple-50/30 transition-colors">
          {uploading ? <p className="text-sm text-purple-600 font-medium">กำลังอัปโหลด...</p> : (
            <>
              <svg className="mx-auto mb-2 text-gray-300 w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <p className="text-sm text-gray-500">คลิกอัปโหลดรูปพื้นหลัง Hero</p>
              <p className="text-xs text-gray-400 mt-1">แนะนำ 1920×1080px ขึ้นไป</p>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving || uploading}
          className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 disabled:opacity-50 transition-colors">
          {saving ? 'กำลังบันทึก...' : isEdit ? 'บันทึกการแก้ไข' : 'เพิ่ม Slide'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors">ยกเลิก</button>
        {isEdit && (
          <button type="button" onClick={handleDelete}
            className="ml-auto px-5 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors">ลบ Slide</button>
        )}
      </div>
    </form>
  )
}
