/* Shared behavior for the public HTML pages. */
window.escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
window.safeURL = value => {
  try { const url = new URL(String(value || ''), document.baseURI); return ['http:', 'https:'].includes(url.protocol) ? url.href : ''; }
  catch { return ''; }
};
document.addEventListener('DOMContentLoaded', () => {
  const translatePlaceholders=()=>{const lang=document.body.dataset.lang==='en'?'en':'th';document.querySelectorAll('[data-placeholder-th]').forEach(el=>{el.placeholder=el.dataset[lang==='en'?'placeholderEn':'placeholderTh'];});};
  window.addEventListener('language-change',translatePlaceholders);translatePlaceholders();
  const burger = document.querySelector('.nav-burger, .store-burger');
  const links = document.querySelector('.nav-links, .store-menu');
  if (burger && links) {
    if (!links.querySelector('a[href="quote.html"]')) {
      const quote = document.createElement('a'); quote.href = 'quote.html';
      quote.innerHTML = '<span class="bi"><span class="th">ขอใบเสนอราคา</span><span class="en">Get a Quote</span></span>';
      quote.className = 'mobile-quote-link'; links.append(quote);
    }
    links.id = 'primary-navigation';
    burger.setAttribute('aria-controls', links.id);
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'เปิด/ปิดเมนู — Toggle navigation');
    const close = () => { links.classList.remove('is-open'); burger.setAttribute('aria-expanded','false'); };
    burger.addEventListener('click', () => { burger.setAttribute('aria-expanded', String(links.classList.toggle('is-open'))); });
    links.addEventListener('click', close);
    window.addEventListener('resize',close);
    document.addEventListener('keydown', e => { if(e.key === 'Escape') { close(); burger.focus(); } });
    document.addEventListener('click', e => { if (!e.target.closest('.nav, .store-nav')) close(); });
  }
  document.querySelectorAll('input,select,textarea').forEach((field, i) => {
    if (!field.id) field.id = 'field-' + i;
    const label = field.closest('.field')?.querySelector('label');
    if (label && !label.contains(field)) label.htmlFor = field.id;
  });
  const forms = [[document.getElementById('quoteForm'),'quote'], [document.getElementById('contactForm'),'contact'], [document.getElementById('newsletterForm'),'newsletter']];
  for (const [form, kind] of forms) {
    if (!form) continue;
    const trap = document.createElement('input');
    trap.name = 'website'; trap.tabIndex = -1; trap.autocomplete = 'off'; trap.className = 'sr-only'; trap.setAttribute('aria-hidden','true');
    form.append(trap);
    const feedback = document.createElement('p');
    feedback.className = 'form-feedback'; feedback.setAttribute('role','status'); feedback.setAttribute('aria-live','polite');
    form.append(feedback);
    const category = new URLSearchParams(location.search).get('product');
    if (kind === 'quote' && ['bess','solar','inverter'].includes(category)) { const selected=form.querySelector(`input[value="${category}"]`); if(selected)selected.checked=true; }
    if(kind==='quote'){
      const model=(new URLSearchParams(location.search).get('model')||'').slice(0,200);
      const context=document.getElementById('quoteContext');
      const business=form.elements.business_type, company=form.elements.company;
      const update=()=>{const en=document.body.dataset.lang==='en';const home=business.value==='residential';company.required=!home;document.getElementById('companyRequired').hidden=home;company.placeholder=home?(en?'Optional for a home project':'ไม่จำเป็นสำหรับบ้านพักอาศัย'):(en?'Company / organization':'ชื่อบริษัท / องค์กร');if(context&&model){context.hidden=false;context.textContent=(en?'Product of interest: ':'สินค้าที่สนใจ: ')+model;}};
      business.addEventListener('change',update);window.addEventListener('language-change',update);update();
    }
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (form.dataset.sending || !form.reportValidity()) return;
      const en = document.body.dataset.lang === 'en';
      if (kind === 'contact') document.getElementById('successMsg')?.classList.remove('show');
      const button = form.querySelector('[type="submit"]');
      const fields = new FormData(form);
      const data = Object.fromEntries(fields);
      data.kind = kind;
      if (kind === 'quote') { data.products = fields.getAll('products'); const model=(new URLSearchParams(location.search).get('model')||'').slice(0,200); if(model)data.details=`Product: ${model}\n${data.details||''}`; }
      form.dataset.sending = 'true'; button.disabled = true;
      feedback.dataset.error = 'false'; feedback.textContent = en ? 'Sending…' : 'กำลังส่ง…';
      try {
        const response = await fetch('/api/leads', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data), signal:AbortSignal.timeout(20000) });
        if (!response.ok) throw new Error(String(response.status));
        form.reset();
        feedback.textContent = en ? 'Your information has been received. Thank you.' : 'ระบบได้รับข้อมูลของคุณแล้ว ขอบคุณครับ';
        if(kind === 'quote') { form.classList.add('hide'); const success = document.getElementById('successState'); success.classList.add('show'); success.setAttribute('tabindex','-1'); success.focus(); }
        if(kind === 'contact') document.getElementById('successMsg')?.classList.add('show');
      } catch(error) {
        feedback.dataset.error = 'true';
        feedback.textContent = error.message === '429'
          ? (en ? 'Too many submissions. Please try again in an hour.' : 'ส่งข้อมูลถี่เกินไป กรุณาลองใหม่ในอีกหนึ่งชั่วโมง')
          : error.message === '400'
          ? (en ? 'Please check your phone, email and required fields.' : 'กรุณาตรวจเบอร์โทร อีเมล และช่องที่จำเป็น หากเลือก LINE โปรดกรอก LINE ID')
          : (en ? 'Unable to confirm receipt. Your entries are kept; please try again.' : 'ยังยืนยันการรับข้อมูลไม่ได้ ข้อมูลที่กรอกยังอยู่ กรุณาลองใหม่');
      } finally { delete form.dataset.sending; button.disabled = false; }
    });
  }
});
