import test from 'node:test'
import assert from 'node:assert/strict'
import { validateLead } from '../lib/lead-validation.ts'

const quote = { kind:'quote', name:'ทดสอบ', company:'Example', email:'TEST@example.com', phone:'+66 81 234 5678', business_type:'industrial', products:['bess'], contact_pref:'phone' }
test('normalizes email and maps quote fields without trusting status', () => {
  const { row } = validateLead({ ...quote, line:'line-id', power:'100 kW', status:'closed', id:'injected' })
  assert.equal(row.email,'test@example.com'); assert.equal(row.status,'new'); assert.equal(row.power_demand,'100 kW'); assert.equal(row.line_id,'line-id'); assert.equal(row.id,undefined)
})
test('rejects bad email, empty required fields and invalid phone', () => {
  for (const fields of [{email:'bad'}, {name:' '}, {company:''}, {phone:'abcdefg'}, {business_type:''}]) assert.throws(() => validateLead({...quote,...fields}))
})
test('rejects arbitrary products and wrong input types', () => {
  for (const fields of [{products:['unknown']},{products:'bess'},{name:[]},{kind:'admin'},{email:123}]) assert.throws(() => validateLead({...quote,...fields}))
})
test('rejects oversized fields and bot honeypot', () => {
  assert.throws(() => validateLead({...quote, details:'x'.repeat(5001)}))
  assert.throws(() => validateLead({...quote, website:'spam'}))
})
test('LINE preference requires LINE ID', () => {
  assert.throws(() => validateLead({...quote, contact_pref:'line'}))
  assert.equal(validateLead({...quote, contact_pref:'line', line:'user'}).row.line_id,'user')
})
test('contact message is required; company is optional', () => {
  assert.throws(() => validateLead({...quote, kind:'contact'}))
  assert.equal(validateLead({...quote, kind:'contact', company:'', message:'Hello'}).row.message,'Hello')
})
test('newsletter stores only normalized email', () => {
  assert.deepEqual(validateLead({kind:'newsletter', email:' A@example.com ', status:'admin'}).row,{email:'a@example.com'})
})
