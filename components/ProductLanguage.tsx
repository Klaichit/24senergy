'use client'
import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react'

const subscribe = (cb: () => void) => {
  window.addEventListener('storage', cb)
  window.addEventListener('language-change', cb)
  return () => { window.removeEventListener('storage', cb); window.removeEventListener('language-change', cb) }
}
const snapshot = () => { try { return localStorage.getItem('lang') === 'en' ? 'en' : 'th' } catch { return 'th' } }

function changeLang(value: string) {
  try { localStorage.setItem('lang', value) } catch {}
  window.dispatchEvent(new Event('language-change'))
}

export function LangToggle({ dark }: { dark?: boolean }) {
  const saved = useSyncExternalStore(subscribe, snapshot, () => 'th')
  const [selected, setSelected] = useState<string | null>(null)
  const lang = selected ?? saved
  function change(value: string) { setSelected(value); changeLang(value) }
  return (
    <div className="flex items-center gap-1 text-sm font-bold select-none" aria-label="Language">
      {(['TH', 'EN'] as const).map((v, i) => (
        <span key={v} className="flex items-center gap-1">
          {i > 0 && <span style={{ color: dark ? 'rgba(255,255,255,0.2)' : '#ccc' }}>/</span>}
          <button
            aria-pressed={lang === v.toLowerCase()}
            onClick={() => change(v.toLowerCase())}
            className="transition-colors"
            style={{
              color: lang === v.toLowerCase()
                ? (dark ? '#fff' : '#4c1d95')
                : (dark ? 'rgba(255,255,255,0.38)' : '#9ca3af'),
              fontWeight: lang === v.toLowerCase() ? 800 : 500,
            }}
          >{v}</button>
        </span>
      ))}
    </div>
  )
}

export default function ProductLanguage({ children }: { children: ReactNode }) {
  const saved = useSyncExternalStore(subscribe, snapshot, () => 'th')
  const [selected, setSelected] = useState<string | null>(null)
  const lang = selected ?? saved
  useEffect(() => { document.documentElement.lang = lang }, [lang])
  return (
    <div className="product-language" data-lang={lang}>
      {children}
    </div>
  )
}
