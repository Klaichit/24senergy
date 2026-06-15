'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Product, ProductCategory } from '@/types/database'

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'bess', label: 'BESS — ระบบกักเก็บพลังงาน' },
  { value: 'solar', label: 'Solar PV' },
  { value: 'ev', label: 'EV Charger' },
  { value: 'ems', label: 'EMS / Monitoring' },
]

const BUCKET = 'product-images'

type Props = { product?: Product }

export default function ProductForm({ product }: Props) {
  const router = useRouter()
  const isEdit = !!product

  const [form, setForm] = useState({
    slug:           product?.slug ?? '',
    name_th:        product?.name_th ?? '',
    name_en:        product?.name_en ?? '',
    category:       (product?.category ?? 'bess') as ProductCategory,
    description_th: product?.description_th ?? '',
    description_en: product?.description_en ?? '',
    specs:          product?.specs ? JSON.stringify(product.specs, null, 2) : '{}',
    pdf_url:        product?.pdf_url ?? '',
    is_published:   product?.is_published ?? true,
    sort_order:     product?.sort_order ?? 0,
  })

  const [images, setImages] = useState<string[]>(product?.images ?? [])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    setError('')

    const slug = form.slug || `product-${Date.now()}`
    const urls: string[] = []

    for (const file of files) {
      const ext = file.name.split('.').pop()
      const path = `${slug}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true })
      if (upErr) { setError(`อัปโหลดไม่สำเร็จ: ${upErr.message}`); setUploading(false); return }
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
      urls.push(data.publicUrl)
    }

    setImages(prev => [...prev, ...urls])
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  function removeImage(url: string) {
    setImages(prev => prev.filter(u => u !== url))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError('')
    let specsObj: Record<string, string> = {}
    try { specsObj = JSON.parse(form.specs) } catch { setError('Specs ต้องเป็น JSON ที่ถูกต้อง'); setSaving(false); return }

    const payload = {
      slug:           form.slug,
      name_th:        form.name_th,
      name_en:        form.name_en,
      category:       form.category,
      description_th: form.description_th,
      description_en: form.description_en,
      specs:          specsObj,
      images,
      pdf_url:        form.pdf_url || null,
      is_published:   form.is_published,
      sort_order:     Number(form.sort_order),
    }

    const { error: err } = isEdit
      ? await supabase.from('products').update(payload).eq('id', product.id)
      : await supabase.from('products').insert(payload)

    if (err) { setError(err.message); setSaving(false); return }
    router.push('/admin/products')
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm('ลบผลิตภัณฑ์นี้?')) return
    setDeleting(true)
    await supabase.from('products').delete().eq('id', product!.id)
    router.push('/admin/products')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <h2 className="font-bold text-gray-800 mb-1">ข้อมูลพื้นฐาน</h2>

        <div className="grid grid-cols-2 gap-4">
          <Field label="ชื่อ (ภาษาไทย)" required>
            <input className="input" value={form.name_th} onChange={e => set('name_th', e.target.value)} required />
          </Field>
          <Field label="ชื่อ (English)" required>
            <input className="input" value={form.name_en} onChange={e => set('name_en', e.target.value)} required />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Slug (URL)" required>
            <input className="input font-mono text-sm" value={form.slug} onChange={e => set('slug', e.target.value.toLowerCase().replace(/\s+/g,'-'))} required placeholder="heroee8-aio" />
          </Field>
          <Field label="หมวดหมู่" required>
            <select className="input" value={form.category} onChange={e => set('category', e.target.value as ProductCategory)}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </Field>
        </div>

        <Field label="คำอธิบาย (ภาษาไทย)">
          <textarea className="input min-h-[80px]" value={form.description_th} onChange={e => set('description_th', e.target.value)} />
        </Field>
        <Field label="Description (English)">
          <textarea className="input min-h-[80px]" value={form.description_en} onChange={e => set('description_en', e.target.value)} />
        </Field>
      </div>

      {/* Image Upload */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <h2 className="font-bold text-gray-800 mb-1">รูปภาพผลิตภัณฑ์</h2>

        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {images.map((url, i) => (
              <div key={url} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-200">
                <img src={url} alt={`Product image ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >×</button>
                {i === 0 && (
                  <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">หลัก</span>
                )}
              </div>
            ))}
          </div>
        )}

        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-purple-300 hover:bg-purple-50/30 transition-colors"
        >
          {uploading ? (
            <p className="text-sm text-purple-600 font-medium">กำลังอัปโหลด...</p>
          ) : (
            <>
              <svg className="mx-auto mb-2 text-gray-300 w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <p className="text-sm text-gray-500">คลิกเพื่ออัปโหลดรูปภาพ</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP — เลือกหลายรูปพร้อมกันได้</p>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <h2 className="font-bold text-gray-800 mb-1">Specs &amp; ไฟล์</h2>
        <Field label='Specs (JSON) เช่น {"Power":"180 kW","Ports":"2"}'>
          <textarea className="input font-mono text-sm min-h-[120px]" value={form.specs} onChange={e => set('specs', e.target.value)} />
        </Field>
        <Field label="PDF URL (Datasheet)">
          <input className="input" type="url" value={form.pdf_url} onChange={e => set('pdf_url', e.target.value)} placeholder="https://..." />
        </Field>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <h2 className="font-bold text-gray-800 mb-1">การเผยแพร่</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="ลำดับการแสดง">
            <input className="input" type="number" value={form.sort_order} onChange={e => set('sort_order', e.target.value)} />
          </Field>
          <Field label="สถานะ">
            <select className="input" value={form.is_published ? '1' : '0'} onChange={e => set('is_published', e.target.value === '1')}>
              <option value="1">เผยแพร่</option>
              <option value="0">ซ่อน</option>
            </select>
          </Field>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving || uploading}
          className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 disabled:opacity-50 transition-colors">
          {saving ? 'กำลังบันทึก...' : isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มผลิตภัณฑ์'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors">
          ยกเลิก
        </button>
        {isEdit && (
          <button type="button" onClick={handleDelete} disabled={deleting}
            className="ml-auto px-5 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 disabled:opacity-50 transition-colors">
            {deleting ? 'กำลังลบ...' : 'ลบผลิตภัณฑ์'}
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
