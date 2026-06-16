'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { SiteConfig } from '@/types/database'

export default function SiteConfigPage() {
  const [configs, setConfigs] = useState<SiteConfig[]>([])
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('site_config').select('*').order('key').then(({ data }) => {
      if (data) setConfigs(data as SiteConfig[])
    })
  }, [])

  function updateValue(key: string, value: string) {
    setConfigs(prev => prev.map(c => c.key === key ? { ...c, value } : c))
  }

  async function save(key: string, value: string) {
    setSaving(key)
    await supabase.from('site_config').update({ value, updated_at: new Date().toISOString() }).eq('key', key)
    setSaving(null)
    setSaved(key)
    setTimeout(() => setSaved(null), 2000)
  }

  const kpis = configs.filter(c => c.key.startsWith('kpi_'))
  const contacts = configs.filter(c => !c.key.startsWith('kpi_'))

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">ตั้งค่าเว็บไซต์</h1>
        <p className="text-sm text-gray-400 mt-1">KPI และข้อมูลติดต่อบนหน้าแรก</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="font-bold text-gray-800 mb-5">ตัวเลข KPI (หน้าแรก)</h2>
          <div className="grid grid-cols-2 gap-4">
            {kpis.map(c => (
              <div key={c.key} className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">{c.label}</label>
                <div className="flex gap-2">
                  <input
                    className="input flex-1"
                    value={c.value}
                    onChange={e => updateValue(c.key, e.target.value)}
                    onBlur={() => save(c.key, c.value)}
                  />
                  <button onClick={() => save(c.key, c.value)}
                    disabled={saving === c.key}
                    className="px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold hover:bg-purple-100 transition-colors disabled:opacity-50">
                    {saved === c.key ? '✓' : saving === c.key ? '...' : 'บันทึก'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="font-bold text-gray-800 mb-5">ข้อมูลติดต่อ</h2>
          <div className="space-y-4">
            {contacts.map(c => (
              <div key={c.key} className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">{c.label}</label>
                <div className="flex gap-2">
                  <input
                    className="input flex-1"
                    value={c.value}
                    onChange={e => updateValue(c.key, e.target.value)}
                    onBlur={() => save(c.key, c.value)}
                  />
                  <button onClick={() => save(c.key, c.value)}
                    disabled={saving === c.key}
                    className="px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold hover:bg-purple-100 transition-colors disabled:opacity-50">
                    {saved === c.key ? '✓' : saving === c.key ? '...' : 'บันทึก'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
