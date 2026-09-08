'use client'
import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react'

const subscribe = (callback: () => void) => {
  window.addEventListener('storage', callback)
  window.addEventListener('language-change', callback)
  return () => { window.removeEventListener('storage', callback); window.removeEventListener('language-change', callback) }
}
const snapshot = () => { try { return localStorage.getItem('lang') === 'en' ? 'en' : 'th' } catch { return 'th' } }
export default function ProductLanguage({ children }: { children: ReactNode }) {
  const saved = useSyncExternalStore(subscribe, snapshot, () => 'th')
  const [selected, setSelected] = useState<string | null>(null)
  const lang = selected ?? saved
  useEffect(() => { document.documentElement.lang = lang }, [lang])
  function change(value: string) {
    setSelected(value)
    try { localStorage.setItem('lang', value) } catch {}
    window.dispatchEvent(new Event('language-change'))
  }
  return <div className="product-language" data-lang={lang}>
    <div className="flex justify-end gap-2 px-6 py-2 bg-white text-sm" aria-label="Language">
      {['th', 'en'].map(value => <button key={value} aria-pressed={lang === value} onClick={() => change(value)} className={lang === value ? 'font-bold text-purple-800' : 'text-gray-600'}>{value.toUpperCase()}</button>)}
    </div>
    {children}
  </div>
}
