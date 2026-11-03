'use client'
import {useState} from 'react'
export default function LeadEmailRetry(){
 const [busy,setBusy]=useState(false),[message,setMessage]=useState('')
 async function retry(){setBusy(true);setMessage('');try{const r=await fetch('/api/admin/lead-emails',{method:'POST'});if(!r.ok)throw Error();const d=await r.json();setMessage(d.configured?`ส่งอีเมล ${d.sent} รายการ · รอลองใหม่ ${d.failed} รายการ`:'ยังไม่ได้เปิดบริการส่งเมล กรุณาตั้งค่าโดเมนและ API key ก่อน')}catch{setMessage('ยังส่งไม่ได้ กรุณาตรวจการตั้งค่าและตารางคิวอีเมล')}finally{setBusy(false)}}
 return <div className="mb-6 text-sm"><button onClick={retry} disabled={busy} className="rounded-lg border border-purple-300 px-4 py-2 text-purple-800 disabled:opacity-50">{busy?'กำลังส่ง…':'ส่งอีเมลแจ้งเตือนที่ค้าง'}</button><p role="status" className="mt-2 text-gray-600">{message}</p></div>
}
