import { createSessionClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'
export default async function Inquiries() {
  const db = await createSessionClient()
  const [messages, subscriptions] = await Promise.all([
    db.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(100),
    db.from('newsletter_subscribers').select('id,email,created_at').order('created_at', { ascending: false }).limit(100),
  ])
  if (messages.error || subscriptions.error) return <p className="p-8 text-red-700">โหลดข้อมูลไม่สำเร็จ โปรดตรวจ migration และสิทธิ์แอดมิน</p>
  return <div className="p-6 space-y-8">
    <h1 className="text-2xl font-bold">ข้อความติดต่อ / Newsletter</h1>
    <p className="text-gray-600">แสดง 100 รายการล่าสุดในแต่ละหมวด</p>
    <section className="space-y-4"><h2 className="text-xl font-bold">ข้อความติดต่อ</h2>
      {!messages.data?.length && <p>ยังไม่มีข้อความ</p>}
      {messages.data?.map(message => <article key={message.id} className="p-5 rounded-xl border bg-white break-words">
        <h3 className="font-bold">{message.name} · {message.company}</h3>
        <p>{message.email} · {message.phone}</p>
        <p className="whitespace-pre-wrap mt-3">{message.message}</p>
        <time className="text-sm text-gray-500">{new Date(message.created_at).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}</time>
      </article>)}
    </section>
    <section className="space-y-3"><h2 className="text-xl font-bold">ผู้สมัครรับข่าวสาร</h2>
      {!subscriptions.data?.length && <p>ยังไม่มีผู้สมัคร</p>}
      {subscriptions.data?.map(item => <p key={item.id} className="break-all">{item.email}</p>)}
    </section>
  </div>
}
