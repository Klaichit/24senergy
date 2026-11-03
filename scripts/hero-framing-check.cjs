const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
  const browser=await chromium.launch();
  try{
    const page=await browser.newPage({reducedMotion:'reduce'});
    const base=process.env.AUDIT_BASE_URL||'http://localhost:3100';
    const out=process.env.AUDIT_OUTPUT||'artifacts/hero';fs.mkdirSync(out,{recursive:true});
    // Exercise both the built-in slides and replacement slides returned by the CMS.
    for(const cms of [false,true]){
      await page.route('**/rest/v1/hero_slides?*',r=>r.fulfill({json:cms?['v2-sunwoda.webp','v2-leapton.webp'].map(image_url=>({image_url:base+'/'+image_url,title_th:'โซลูชันพลังงานครบวงจร',title_en:'Complete energy solutions'})):[]}));
      await page.goto(base+'/index.html',{waitUntil:'networkidle'});
      for(const width of [320,375,768,1024,1440,1920,2048]){
        await page.setViewportSize({width,height:950});
        const frames=await page.locator('.hslide img').evaluateAll(async images=>Promise.all(images.map(async img=>{
          img.loading='eager';await img.decode();
          const css=getComputedStyle(img),box=img.getBoundingClientRect(),slide=img.parentElement.getBoundingClientRect();
          return {fit:css.objectFit,loaded:img.naturalWidth>0,contained:box.left>=slide.left-1&&box.right<=slide.right+1&&box.top>=slide.top-1&&box.bottom<=slide.bottom+1,background:img.parentElement.style.getPropertyValue('--slide-scene')};
        })));
        assert(frames.length>0);
        for(const frame of frames){assert.equal(frame.fit,'contain');assert(frame.loaded&&frame.contained&&frame.background,JSON.stringify({width,frame}));}
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
        if(cms&&[375,1440,2048].includes(width)){
          for(let i=0;i<2;i++){await page.locator('#hDots button').nth(i).click();await page.locator('.home-hero').screenshot({path:`${out}/hero-${width}-${i}.png`});}
        }
      }
      await page.unroute('**/rest/v1/hero_slides?*');
    }
    console.log('PASS: all hero frames fully contained, fallback and CMS, 7 viewport widths; screenshots saved.');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
