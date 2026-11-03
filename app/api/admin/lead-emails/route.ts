import { createClient } from '@supabase/supabase-js'
import { createSessionClient } from '@/lib/supabase-server'
import { processLeadEmails } from '@/lib/lead-email'
export const runtime='nodejs'
export const maxDuration=120
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Origin not allowed'},{status:403})
 const session=await createSessionClient();const {data:{user}}=await session.auth.getUser()
 if(!user||user.app_metadata?.role!=='admin')return Response.json({error:'Admin required'},{status:403})
 if(!process.env.SUPABASE_SERVICE_ROLE_KEY)return Response.json({error:'Not configured'},{status:503})
 const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}})
 try{return Response.json(await processLeadEmails(db))}catch{return Response.json({error:'Email queue unavailable'},{status:503})}
}
