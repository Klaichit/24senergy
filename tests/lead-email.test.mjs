import test from 'node:test'
import assert from 'node:assert/strict'
import {emailMessage,processLeadEmails} from '../lib/lead-email.ts'
test('email uses a fixed subject and plain-text customer data',()=>{const m=emailMessage('quote',{id:'id',name:'<script>x</script>',email:'x@example.com',products:['solar'],details:'test'});assert.match(m.text,/<script>x<\/script>/);assert.match(m.text,/admin\/quotes/);assert(!m.subject.includes('<script>'))})
test('email queue preserves failed work and records accepted sends',async()=>{
 const saved={...process.env},oldFetch=global.fetch;const updates=[];let fail=true;
 const db={rpc:async()=>({data:[{id:'job1',attempts:1,kind:'quote',payload:{id:'q1',email:'customer@example.com'}}]}),from:()=>({update:row=>({eq:async()=>{updates.push(row);return {error:null}}})})};
 try{process.env.LEAD_EMAIL_ENABLED='false';assert.equal((await processLeadEmails(db)).configured,false);process.env.LEAD_EMAIL_ENABLED='true';process.env.RESEND_API_KEY='test';process.env.LEAD_EMAIL_FROM='24sEnergy <notify@example.com>';global.fetch=async(url,opts)=>{assert.equal(url,'https://api.resend.com/emails');const body=JSON.parse(opts.body);assert.deepEqual(body.to,['info@24senergy.co.th']);assert.equal(body.reply_to,'customer@example.com');assert.equal(opts.headers['Idempotency-Key'],'lead-job1');return fail?new Response('{}',{status:503}):Response.json({id:'accepted1'})};assert.equal((await processLeadEmails(db)).failed,1);assert.equal(updates[0].status,'pending');fail=false;assert.equal((await processLeadEmails(db)).sent,1);assert.equal(updates[1].provider_id,'accepted1')}
 finally{global.fetch=oldFetch;for(const k of ['LEAD_EMAIL_ENABLED','RESEND_API_KEY','LEAD_EMAIL_FROM']){if(saved[k]===undefined)delete process.env[k];else process.env[k]=saved[k]}}
})
