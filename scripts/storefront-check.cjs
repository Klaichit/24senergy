const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.AUDIT_BASE_URL||'http://localhost:3100';
const products=[['sunwoda-atrix-max-plus','Sunwoda','bess'],['kstar-blue-s-bluepulse','KSTAR','bess'],['tcl-blueark-x1','TCL','bess'],['leapton-n-type-topcon-bifacial','Leapton','solar'],['solaredge-home-hub-optimizer','SolarEdge','inverter'],['solplanet-asw-ht-series','Solplanet','inverter']].map(([slug,name,category])=>({slug,name_th:name,name_en:name,category,description_th:'รายละเอียดสินค้า',description_en:'Product information',specs:{Power:'10 kW'},images:[]}));
(async()=>{const b=await chromium.launch({headless:true});try{
 const c=await b.newContext({viewport:{width:1440,height:900}});const errors=[],missing=[];
 await c.route('**/*',r=>['GET','HEAD','OPTIONS'].includes(r.request().method())?r.continue():r.abort());
 await c.route('https://**.supabase.co/rest/v1/**',r=>r.fulfill({contentType:'application/json',body:JSON.stringify(r.request().url().includes('/products?')?products:[])}));
 const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400&&r.url().startsWith(base)&&!r.url().includes('/api/leads'))missing.push(r.url());});
 fs.mkdirSync('artifacts/storefront',{recursive:true});
 for(const name of ['index','products','news','contact','quote']){
  await p.goto(`${base}/${name}.html`,{waitUntil:'networkidle'});
  await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});
  for(const width of [320,375,414,768,1440]){
   await p.setViewportSize({width,height:900});
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`${name} overflow at ${width}`);
   if(width===375){
    const burger=p.locator('.store-burger,.nav-burger');await burger.click();assert.equal(await burger.getAttribute('aria-expanded'),'true',name+' menu opens');
    await p.keyboard.press('Escape');assert.equal(await burger.getAttribute('aria-expanded'),'false',name+' menu closes');
    await p.locator('#btnEN').click();assert.equal(await p.locator('html').getAttribute('lang'),'en');
    await p.locator('#btnTH').click();
    await p.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=700){scrollTo(0,y);await new Promise(r=>setTimeout(r,70));}scrollTo(0,0);});
    await p.screenshot({path:`artifacts/storefront/${name}-mobile.png`,fullPage:true});
   }
  }
  await p.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=700){scrollTo(0,y);await new Promise(r=>setTimeout(r,70));}scrollTo(0,0);});
  await p.screenshot({path:`artifacts/storefront/${name}-desktop.png`,fullPage:true});
  console.log('Responsive, navigation and language:',name);
 }
 await p.goto(base+'/index.html',{waitUntil:'networkidle'});assert.equal(await p.locator('.home-product').count(),6);assert.equal(await p.locator('.home-product-copy a[href^="/products/"]').count(),6);
 await c.route('**/rest/v1/hero_slides?**',r=>r.fulfill({contentType:'application/json',body:JSON.stringify([{title_th:'สไลด์ทดสอบ',title_en:'CMS slide',image_url:base+'/v2-hero.webp'},{title_th:'สไลด์สอง',title_en:'Second slide',image_url:base+'/v2-nature.webp'}])}));
 await p.goto(base+'/index.html',{waitUntil:'networkidle'});assert.equal(await p.locator('.hslide').count(),2);assert.equal(await p.locator('h1 .th').innerText(),'สไลด์ทดสอบ');await p.locator('#hNext').click();assert.equal(await p.locator('h1 .th').innerText(),'สไลด์สอง');await p.locator('#hPause').click();assert.equal(await p.locator('#hPause').getAttribute('aria-pressed'),'true');
 await p.goto(base+'/products.html',{waitUntil:'networkidle'});assert.equal(await p.locator('.prod-card').count(),6);
 for(const box of await p.locator('[data-filter=app]').all())await box.uncheck();await p.locator('[data-filter=app][value=industrial]').check();
 assert.equal(await p.locator('.prod-card:not(.hide)[data-search*=kstar]').count(),1);
 assert.equal(await p.locator('.prod-card:not(.hide)[data-search*=tcl]').count(),0);
 await p.locator('#clearAll').click();await p.locator('#searchBox').fill('TCL');assert.equal(await p.locator('.prod-card:not(.hide)').count(),1);await p.locator('#btnEN').click();assert.match(await p.locator('#searchBox').getAttribute('placeholder'),/Search/);
 await p.goto(base+'/index.html');assert.equal(await p.locator('html').getAttribute('lang'),'en');
 await p.goto(base+'/quote.html?product=inverter&model=SolarEdge%20Home%20Hub',{waitUntil:'networkidle'});assert.equal(await p.locator('[value=inverter]').isChecked(),true);assert.match(await p.locator('#quoteContext').innerText(),/SolarEdge Home Hub/);
 await p.locator('[name=business_type]').selectOption('residential');assert.equal(await p.locator('[name=company]').getAttribute('required'),null);
 if(await p.locator('#flowNext').count()){await p.locator('#flowNext').click();await p.locator('#flowNext').click();}
 for(const [name,value] of Object.entries({name:'Audit Test',phone:'0812345678',email:'audit@example.com'}))await p.locator(`[name=${name}]`).fill(value);
 if(await p.locator('#flowNext').count())await p.locator('#flowNext').click();
 let payload;await c.route('**/api/leads',r=>{payload=r.request().postDataJSON();return r.fulfill({status:503,contentType:'application/json',body:'{"error":"test"}'});});
 await p.locator('#quoteForm button[type=submit]').click();await p.locator('.form-feedback[data-error=true]').waitFor();assert.equal(await p.locator('[name=name]').inputValue(),'Audit Test');assert.match(payload.details,/Product: SolarEdge Home Hub/);assert.deepEqual(payload.products,['inverter']);
 await c.route('**/api/leads',r=>r.fulfill({status:201,contentType:'application/json',body:'{"ok":true}'}));await p.locator('#quoteForm button[type=submit]').click();await p.locator('#successState.show').waitFor();
 await p.goto(base+'/quote.html?product=ev');assert.equal(await p.locator('[name=products]:checked').count(),0);
 await p.goto(base+'/news.html',{waitUntil:'networkidle'});await p.locator('#btnEN').click();assert.match(await p.locator('#pageStatus').innerText(),/Showing/);await p.locator('#pager button').filter({hasText:/^2$/}).click();assert.match(await p.locator('#pageStatus').innerText(),/Page 2/);
 assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
 console.log('PASS: five responsive pages, six products, per-product filters, language persistence, quote prefill, homeowner validation, simulated form failure/success, news pagination, no local 404s or page errors.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
