const http = require('node:http');
const { spawn } = require('node:child_process');
const assert = require('node:assert/strict');
const { once } = require('node:events');

(async () => {
  const received=[];
  let mode='ok';
  const product={id:'test',slug:'heroee8-aio',name_th:'แบตเตอรี่ทดสอบ',name_en:'Test Battery',category:'bess',description_th:'รายละเอียดทดสอบ',description_en:'Test description',images:[],specs:{Energy:'8 kWh'},is_published:true,updated_at:'2026-09-07T00:00:00Z'};
  const mock=http.createServer(async (req,res)=>{
    let body=''; for await(const chunk of req) body+=chunk;
    received.push({url:req.url,body,authorization:req.headers.authorization});
    res.setHeader('Content-Type','application/json');
    if(req.url.includes('/rpc/consume_lead_limit')) {
      res.statusCode=mode==='limit-error'?500:200; res.end(mode==='limited'?'false':mode==='limit-error'?'{"message":"failed"}':'true');
    } else if(req.method==='POST') {
      res.statusCode=mode==='save-error'?500:mode==='duplicate'?409:201;
      res.end(mode==='save-error'?'{"message":"failed"}':mode==='duplicate'?'{"code":"23505"}':'{}');
    } else if(req.url.includes('/products')) {
      res.end(req.url.includes('slug=eq.missing')?'null':req.url.includes('slug=eq.')?JSON.stringify(product):JSON.stringify([product]));
    } else { res.statusCode=401; res.end('{"message":"Unauthorized"}'); }
  }).listen(3101,'127.0.0.1');
  await once(mock,'listening');
  const child=spawn(process.execPath,['node_modules/next/dist/bin/next','dev','-p','3102'],{
    env:{...process.env,NEXT_PUBLIC_SUPABASE_URL:'http://127.0.0.1:3101',NEXT_PUBLIC_SUPABASE_ANON_KEY:'test-public',SUPABASE_SERVICE_ROLE_KEY:'test-server-only',NEXT_TELEMETRY_DISABLED:'1'},stdio:['ignore','pipe','pipe'],windowsHide:true,
  });
  let output=''; child.stdout.on('data',chunk=>output+=chunk); child.stderr.on('data',chunk=>output+=chunk);
  const base='http://localhost:3102';
  try {
    let ready=false;
    for(let i=0;i<100;i++) { try { if((await fetch(base+'/index.html')).ok){ready=true;break;} }catch{} await new Promise(r=>setTimeout(r,300)); }
    assert.ok(ready,output);
    const valid={kind:'quote',name:'Test',company:'Example',phone:'0812345678',email:'test@example.com',business_type:'industrial',products:['bess']};
    const post=(data=valid,headers={})=>fetch(base+'/api/leads',{method:'POST',headers:{Origin:base,'Content-Type':'application/json',...headers},body:typeof data==='string'?data:JSON.stringify(data)});
    assert.equal((await post(valid,{Origin:'https://attacker.example'})).status,403);
    assert.equal((await post(valid,{'Content-Type':'text/plain'})).status,415);
    assert.equal((await post('{')).status,400);
    assert.equal((await post({...valid,email:'bad'})).status,400);
    assert.equal((await post('x'.repeat(20001))).status,413);
    assert.equal((await post()).status,201);
    assert.ok(received.some(r=>r.url==='/rest/v1/quotes'&&JSON.parse(r.body).email==='test@example.com'&&r.authorization==='Bearer test-server-only'));
    assert.equal((await post({...valid,kind:'contact',message:'hello'})).status,201);
    assert.equal((await post({kind:'newsletter',email:'test@example.com'})).status,201);
    mode='duplicate'; assert.equal((await post({kind:'newsletter',email:'test@example.com'})).status,201);
    mode='save-error'; assert.equal((await post()).status,503);
    mode='limit-error'; assert.equal((await post()).status,503);
    mode='limited'; const limited=await post(); assert.equal(limited.status,429); assert.equal(limited.headers.get('retry-after'),'3600');
    mode='ok';
    const admin=await fetch(base+'/admin',{redirect:'manual'}); assert.equal(admin.status,307); assert.match(admin.headers.get('location'),/\/admin\/login/);
    const legacy=await fetch(base+'/product-heroee8.html',{redirect:'manual'}); assert.equal(legacy.status,308); assert.match(legacy.headers.get('location'),/\/products\/heroee8-aio/);
    const response=await fetch(base+'/products/heroee8-aio'); const html=await response.text(); assert.equal(response.status,200,output);
    assert.ok(html.includes('แบตเตอรี่ทดสอบ — 24sEnergy')); assert.ok(html.includes('Test Battery')); assert.ok(html.includes('application/ld+json')); assert.ok(!html.includes('test-server-only'));
    assert.equal((await fetch(base+'/products/missing')).status,404);
    const sitemap=await (await fetch(base+'/sitemap.xml')).text(); assert.ok(sitemap.includes('/products/heroee8-aio'));
    const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
    const browser=await chromium.launch({executablePath:process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
    try {
      const page=await browser.newPage({viewport:{width:390,height:844}});
      await page.addInitScript(()=>localStorage.setItem('lang','en'));
      await page.goto(base+'/products/heroee8-aio');
      await page.waitForFunction(()=>document.querySelector('.product-language').dataset.lang==='en');
      assert.equal(await page.locator('h1 .en').innerText(),'Test Battery');
      assert.equal(await page.locator('h1 .th').isVisible(),false);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
      await page.getByRole('button',{name:'TH',exact:true}).click();
      assert.equal(await page.locator('h1 .th').innerText(),'แบตเตอรี่ทดสอบ');
      await page.screenshot({path:'artifacts/v2-product-mobile.png'});
    } finally { await browser.close(); }
    console.log('Integration passed: API validation and persistence, admin redirect, legacy redirect, product SSR/404/metadata, sitemap, product mobile and language.');
  } finally {
    child.kill(); mock.closeAllConnections(); mock.close();
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
