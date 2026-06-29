'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง'); setLoading(false); return }
    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#1a1a1f] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-white font-bold text-2xl">24s<span className="text-purple-400">Energy</span></span>
          <p className="text-white/40 text-sm mt-1 font-mono">ADMIN PANEL</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-5">
          <h1 className="text-white font-bold text-lg">เข้าสู่ระบบ</h1>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm text-white/60 font-medium">Email</label>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@24senergy.co.th"
              className="w-full px-4 py-3 bg-white/8 border border-white/15 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-white/60 font-medium">รหัสผ่าน</label>
            <input
              type="password" required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-white/8 border border-white/15 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-colors"
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors"
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
      </div>
    </div>
  )
}
