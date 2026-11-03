import type { SupabaseClient } from '@supabase/supabase-js'

export function emailMessage(kind: string, row: Record<string, unknown>) {
  const fields = [['name','ชื่อ'],['company','บริษัท'],['phone','โทรศัพท์'],['email','อีเมล'],['line_id','LINE'],['contact_pref','ติดต่อกลับทาง'],['business_type','ลักษณะงาน'],['products','สินค้า'],['power_demand','กำลังไฟ'],['timeline','ช่วงเวลา'],['budget','งบประมาณ'],['details','รายละเอียด'],['message','ข้อความ']]
  const title = kind === 'quote' ? 'คำขอใบเสนอราคาใหม่' : 'ข้อความติดต่อใหม่'
  const text = fields.filter(([key])=>row[key]).map(([key,label])=>`${label}: ${Array.isArray(row[key]) ? (row[key] as string[]).join(', ') : String(row[key])}`).join('\n')
  return { subject: `[24sEnergy] ${title}`, text: `${title}\nเลขอ้างอิง: ${row.id}\n\n${text}\n\nเปิดในระบบ: https://www.24senergy.co.th/admin/${kind === 'quote' ? 'quotes' : 'inquiries'}\n\nข้อมูลจากแบบฟอร์มลูกค้า โปรดตรวจสอบก่อนดำเนินการ` }
}

export async function processLeadEmails(db: SupabaseClient) {
  if(process.env.LEAD_EMAIL_ENABLED !== 'true' || !process.env.RESEND_API_KEY || !process.env.LEAD_EMAIL_FROM) return { configured:false, sent:0, failed:0 }
  const {data:jobs,error}=await db.rpc('claim_lead_emails')
  if(error) throw new Error('Email queue unavailable; apply lead email migration')
  let sent=0,failed=0
  for(const job of jobs || []) {
    try {
      const response=await fetch('https://api.resend.com/emails',{
        method:'POST',headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`lead-${job.id}`},
        body:JSON.stringify({from:process.env.LEAD_EMAIL_FROM,to:['info@24senergy.co.th'],reply_to:job.payload.email,...emailMessage(job.kind,job.payload)}),signal:AbortSignal.timeout(8000),
      })
      if(!response.ok)throw new Error(`Provider HTTP ${response.status}`)
      const result=await response.json()
      if(!result.id)throw new Error('Provider returned no message ID')
      const saved=await db.from('lead_email_outbox').update({status:'sent',provider_id:result.id,sent_at:new Date().toISOString(),last_error:null}).eq('id',job.id)
      if(saved.error)throw new Error('Could not record delivery status')
      sent++
    } catch(error) {
      failed++
      // Store only operational errors, never provider response bodies or credentials.
      const message=error instanceof Error?error.message:'Email delivery failed'
      const saved=await db.from('lead_email_outbox').update({status:job.attempts>=5?'review':'pending',last_error:message.slice(0,200),next_attempt_at:new Date(Date.now()+5*60*1000).toISOString()}).eq('id',job.id)
      if(saved.error)console.error('Could not update lead email status')
    }
  }
  return {configured:true,sent,failed}
}
