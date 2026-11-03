(async function(){
  const e=window.escapeHTML;
  try {
    const products=await window.energyCMS('products','is_published=eq.true&order=sort_order.asc&select=slug,name_th,name_en,category,description_th,description_en,images,specs');
    const grid=document.getElementById('home-products');
    grid.innerHTML=products.length?products.map(p=>{
      const src=window.energyCatalog[p.slug]?.image || window.safeURL(p.images?.[0]);
      const url=`/products/${encodeURIComponent(p.slug)}`;
      return `<article class="home-product"><a href="${url}" class="home-product-image">${src?`<img src="${e(src)}" alt="${e(p.name_en)}" loading="lazy" decoding="async" width="720" height="600">`:''}</a><div class="home-product-copy"><p class="product-category">${e({bess:'Battery Storage',solar:'Solar PV',inverter:'Inverter'}[p.category]||'')}</p><h3 class="bi"><span class="th">${e(p.name_th)}</span><span class="en">${e(p.name_en)}</span></h3><p class="product-summary bi"><span class="th">${e(p.description_th)}</span><span class="en">${e(p.description_en)}</span></p><a class="product-link bi" href="${url}"><span class="th">ดูรายละเอียด</span><span class="en">View details</span></a></div></article>`;
    }).join(''):'<p class="bi"><span class="th">กำลังอัปเดตรายการสินค้า กรุณาติดต่อทีมงานเพื่อสอบถาม</span><span class="en">The catalogue is being updated. Please contact our team.</span></p>';
  } catch(error){console.error('Home products:',error);}
  try {
    const partners=await window.energyCMS('partners','is_active=eq.true&order=sort_order.asc&select=name,website,logo_url');
    const logos=[['solaredge','solaredge.png','Inverter · Optimizer'],['kstar','kstar.jpg','BESS'],['leapton','leapton.png','Solar PV'],['solplanet','solplanet.png','Inverter'],['sunwoda','sunwoda.webp','BESS'],['tcl','tcl.png','BESS']];
    if(partners.length)document.getElementById('home-brands').innerHTML=partners.map(p=>{
      const brand=logos.find(([key])=>String(p.name).toLowerCase().replace(/\s/g,'').includes(key));
      const src=brand?`brands/${brand[1]}`:window.safeURL(p.logo_url);
      return `<div class="brand-item"><div class="brand-logo">${src?`<img src="${e(src)}" alt="${e(p.name)}" width="200" height="64" loading="lazy" decoding="async">`:`<span class="brand-name">${e(p.name)}</span>`}</div>${brand?`<span class="brand-category">${brand[2]}</span>`:''}</div>`;
    }).join('');
  } catch(error){console.error('Home brands:',error);}
})();

(async function(){
  let slides=[...document.querySelectorAll('.hslide')];
  function frameSlides(){slides.forEach(slide=>{const src=slide.querySelector('img')?.src;if(src)slide.style.setProperty('--slide-scene',`url(${JSON.stringify(src)})`);});}
  frameSlides();
  const title=document.querySelector('.home-hero h1');
  const dots=document.getElementById('hDots');
  function paintDots(){dots.innerHTML=slides.map((_,i)=>`<button class="hdot ${i===0?'active':''}" data-go="${i}" aria-label="Slide ${i+1}" aria-current="${i===0}"></button>`).join('');dots.querySelectorAll('button').forEach(d=>d.onclick=()=>{go(Number(d.dataset.go));play();});}
  let current=0,timer,paused=false;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const stop=()=>clearInterval(timer);
  const play=()=>{stop();if(!paused&&!reduced.matches&&!document.hidden&&slides.length>1)timer=setInterval(()=>go(current+1),6000);};
  function go(n){current=(n+slides.length)%slides.length;slides.forEach((s,i)=>s.classList.toggle('active',i===current));dots.querySelectorAll('button').forEach((d,i)=>{d.classList.toggle('active',i===current);d.setAttribute('aria-current',String(i===current));});if(slides[current].dataset.th){title.querySelector('.th').textContent=slides[current].dataset.th;title.querySelector('.en').textContent=slides[current].dataset.en;}}
  document.getElementById('hPrev').onclick=()=>{go(current-1);play();};
  document.getElementById('hNext').onclick=()=>{go(current+1);play();};
  paintDots();
  const hero=document.querySelector('.home-hero');
  hero.addEventListener('mouseenter',stop);hero.addEventListener('mouseleave',play);
  hero.addEventListener('focusin',stop);hero.addEventListener('focusout',event=>{if(!hero.contains(event.relatedTarget))play();});
  document.getElementById('hPause').onclick=event=>{paused=!paused;event.currentTarget.setAttribute('aria-pressed',String(paused));event.currentTarget.textContent=paused?'▶':'Ⅱ';play();};
  document.addEventListener('visibilitychange',play);reduced.addEventListener('change',play);go(0);play();
  try{
    const rows=await window.energyCMS('hero_slides','is_active=eq.true&order=sort_order.asc&select=title_th,title_en,image_url');
    const valid=rows.filter(s=>s.image_url&&window.safeURL(s.image_url));
    if(valid.length){
      document.getElementById('hero-slides').innerHTML=valid.map((s,i)=>`<div class="hslide ${i===0?'active':''} absolute inset-0"><img src="${window.escapeHTML(window.safeURL(s.image_url))}" alt="" class="w-full h-full object-cover" ${i?'loading="lazy"':'fetchpriority="high"'}></div>`).join('');
      slides=[...document.querySelectorAll('.hslide')];
      frameSlides();
      slides.forEach((s,i)=>{s.dataset.th=valid[i].title_th;s.dataset.en=valid[i].title_en;});paintDots();go(0);play();
    }
  }catch(error){console.error('Home slides:',error);}
})();
