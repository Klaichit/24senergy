'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Project } from '@/types/database'

const UNITS = ['MW', 'kW', 'MWh', 'kWh']
const BUCKET = 'product-images'

type Props = { project?: Project }

export default function ProjectForm({ project }: Props) {
  const router = useRouter()
  const isEdit = !!project

  const [form, setForm] = useState({
    title_th:        project?.title_th ?? '',
    title_en:        project?.title_en ?? '',
    location_th:     project?.location_th ?? '',
    location_en:     project?.location_en ?? '',
    year:            project?.year ?? new Date().getFullYear(),
    category:        project?.category ?? '',
    capacity_value:  project?.capacity_value ?? '',
    capacity_unit:   project?.capacity_unit ?? 'MW',
    capacity_detail: project?.capacity_detail ?? '',
    description_th:  project?.description_th ?? '',
    description_en:  project?.description_en ?? '',
    product_tag:     project?.product_tag ?? '',
    roi_text:        project?.roi_text ?? '',
    is_featured:     project?.is_featured ?? true,
    sort_order:      project?.sort_order ?? 0,
  })

  const [imageUrl, setImageUrl] = useState<string>(project?.image_url ?? '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true); setError('')
    const ext = file.name.split('.').pop()
    const path = `projects/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true })
    if (upErr) { setError(`อัปโหลดไม่สำเร็จ: ${upErr.message}`); setUploading(false); return }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    setImageUrl(data.publicUrl)
    setUploading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError('')
    const payload = {
      title_th:        form.title_th,
      title_en:        form.title_en,
      location_th:     form.location_th,
      location_en:     form.location_en,
      year:            Number(form.year) || null,
      category:        form.category,
      capacity_value:  form.capacity_value !== '' ? Number(form.capacity_value) : null,
      capacity_unit:   form.capacity_unit,
      capacity_detail: form.capacity_detail,
      description_th:  form.description_th,
      description_en:  form.description_en,
      image_url:       imageUrl || null,
      product_tag:     form.product_tag,
      roi_text:        form.roi_text,
      is_featured:     form.is_featured,
      sort_order:      Number(form.sort_order),
    }
    const { error: err } = isEdit
      ? await supabase.from('projects').update(payload).eq('id', project.id)
      : await supabase.from('projects').insert(payload)
    if (err) { setError(err.message); setSaving(false); return }
    router.push('/admin/projects')
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm('ลบโครงการนี้?')) return
    setDeleting(true)
    await supabase.from('projects').delete().eq('id', project!.id)
    router.push('/admin/projects')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <h2 className="font-bold text-gray-800">ข้อมูลโครงการ</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="ชื่อโครงการ (ไทย)" required>
            <input className="input" value={form.title_th} onChange={e => set('title_th', e.target.value)} required />
          </Field>
          <Field label="Project Title (EN)" required>
            <input className="input" value={form.title_en} onChange={e => set('title_en', e.target.value)} required />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="สถานที่ (ไทย)">
            <input className="input" value={form.location_th} onChange={e => set('location_th', e.target.value)} placeholder="ระยอง" />
          </Field>
          <Field label="Location (EN)">
            <input className="input" value={form.location_en} onChange={e => set('location_en', e.target.value)} placeholder="Rayong" />
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Field label="ปี (Year)">
            <input className="input" type="number" value={form.year} onChange={e => set('year', e.target.value)} />
          </Field>
          <Field label="หมวด (Badge)">
            <input className="input" value={form.category} onChange={e => set('category', e.target.value)} placeholder="ปิโตรเคมี" />
          </Field>
          <Field label="Product Tag">
            <input className="input" value={form.product_tag} onChange={e => set('product_tag', e.target.value)} placeholder="HinerCab" />
          </Field>
        </div>
        <Field label="คำอธิบาย (ไทย)">
          <textarea className="input min-h-[80px]" value={form.description_th} onChange={e => set('description_th', e.target.value)} />
        </Field>
        <Field label="Description (EN)">
          <textarea className="input min-h-[80px]" value={form.description_en} onChange={e => set('description_en', e.target.value)} />
        </Field>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <h2 className="font-bold text-gray-800">ขนาดโครงการ</h2>
        <div className="grid grid-cols-3 gap-4">
          <Field label="ขนาด (ตัวเลข)">
            <input className="input" type="number" step="0.1" value={form.capacity_value} onChange={e => set('capacity_value', e.target.value)} placeholder="5" />
          </Field>
          <Field label="หน่วย">
            <select className="input" value={form.capacity_unit} onChange={e => set('capacity_unit', e.target.value)}>
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </Field>
          <Field label="รายละเอียดเพิ่มเติม">
            <input className="input" value={form.capacity_detail} onChange={e => set('capacity_detail', e.target.value)} placeholder="+ 10 MWh BESS" />
          </Field>
        </div>
        <Field label="ROI / ผลประโยชน์เด่น">
          <input className="input" value={form.roi_text} onChange={e => set('roi_text', e.target.value)} placeholder="ROI 4.5 ปี" />
        </Field>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <h2 className="font-bold text-gray-800">รูปภาพโครงการ</h2>
        {imageUrl && (
          <div className="relative group w-full aspect-video rounded-xl overflow-hidden bg-gray-50 border border-gray-200">
            <img src={imageUrl} alt="Project" className="w-full h-full object-cover" />
            <button type="button" onClick={() => setImageUrl('')}
              className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">×</button>
          </div>
        )}
        <div onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-purple-300 hover:bg-purple-50/30 transition-colors">
          {uploading ? (
            <p className="text-sm text-purple-600 font-medium">กำลังอัปโหลด...</p>
          ) : (
            <>
              <svg className="mx-auto mb-2 text-gray-300 w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <p className="text-sm text-gray-500">คลิกเพื่ออัปโหลดรูปโครงการ</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP — 1 รูปต่อโครงการ</p>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <h2 className="font-bold text-gray-800">การแสดงผล</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="ลำดับ">
            <input className="input" type="number" value={form.sort_order} onChange={e => set('sort_order', e.target.value)} />
          </Field>
          <Field label="สถานะ">
            <select className="input" value={form.is_featured ? '1' : '0'} onChange={e => set('is_featured', e.target.value === '1')}>
              <option value="1">แสดงบนหน้าแรก</option>
              <option value="0">ซ่อน</option>
            </select>
          </Field>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving || uploading}
          className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 disabled:opacity-50 transition-colors">
          {saving ? 'กำลังบันทึก...' : isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มโครงการ'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors">
          ยกเลิก
        </button>
        {isEdit && (
          <button type="button" onClick={handleDelete} disabled={deleting}
            className="ml-auto px-5 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 disabled:opacity-50 transition-colors">
            {deleting ? 'กำลังลบ...' : 'ลบโครงการ'}
          </button>
        )}
      </div>
    </form>
  )
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-gray-700">
        {label}{required && <span className="text-purple-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}
