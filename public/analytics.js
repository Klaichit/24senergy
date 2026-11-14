/* Google Analytics 4 behind a PDPA consent banner (Google Consent Mode v2).
   The GA4 Measurement ID below is the only setting. Blank it ('') to switch
   analytics off entirely: no request to Google, no cookie, no banner. */
(() => {
  const GA_MEASUREMENT_ID = 'G-7J7YXKV7N4'
  if (!GA_MEASUREMENT_ID) return

  const CONSENT_KEY = 'analytics-consent'
  const readStored = key => {
    try { return localStorage.getItem(key) } catch (error) { console.warn(`Could not read ${key} from localStorage`, error); return null }
  }
  const stored = readStored(CONSENT_KEY)
  let choice = stored === 'granted' || stored === 'denied' ? stored : null

  window.dataLayer = window.dataLayer || []
  function gtag() { window.dataLayer.push(arguments) }
  gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' })

  let started = false
  const start = () => {
    if (started) return
    started = true
    gtag('js', new Date())
    gtag('config', GA_MEASUREMENT_ID)
    const script = document.createElement('script')
    script.async = true
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_MEASUREMENT_ID)
    script.onerror = () => console.warn('Google Analytics did not load', script.src)
    document.head.append(script)
  }
  if (choice === 'granted') { gtag('consent', 'update', { analytics_storage: 'granted' }); start() }

  const clearAnalyticsCookies = () => {
    const names = document.cookie.split(';').map(c => c.split('=')[0].trim()).filter(n => n === '_ga' || n.startsWith('_ga_'))
    const labels = location.hostname.split('.')
    const domains = labels.map((_, i) => labels.slice(i).join('.'))
    for (const name of names) {
      document.cookie = `${name}=; Max-Age=0; path=/`
      for (const domain of domains) document.cookie = `${name}=; Max-Age=0; path=/; domain=${domain}`
    }
  }

  window.siteAnalytics = { track(name, params) { if (choice === 'granted') gtag('event', name, params) } }

  const CONTACT_METHODS = [[/^tel:/i, 'phone'], [/^mailto:/i, 'email'], [/^https?:\/\/(?:[\w-]+\.)*(?:line\.me|lin\.ee)\//i, 'line']]

  const style = document.createElement('style')
  style.textContent = `
.consent-banner{position:fixed;left:16px;right:16px;bottom:16px;z-index:1000;box-sizing:border-box;max-width:640px;margin:0 auto;padding:20px 22px;background:#fff;color:#1a1a1f;border:1px solid #e7e1f0;border-radius:16px;box-shadow:0 18px 48px rgba(26,10,48,.18);font-size:14px;line-height:1.6;text-align:left}
.consent-banner[hidden]{display:none}
.consent-banner[data-lang="th"] .en,.consent-banner[data-lang="en"] .th{display:none}
.consent-banner .consent-title{margin:0 0 6px;font-size:15px;font-weight:700;color:#6A2DAF}
.consent-banner .consent-text{margin:0 0 16px;color:#3f3f46}
.consent-banner .consent-actions{display:flex;gap:10px;flex-wrap:wrap}
.consent-banner .consent-actions button{flex:1 1 120px;min-height:44px;padding:10px 18px;border:2px solid #6A2DAF;border-radius:999px;background:#fff;color:#6A2DAF;font:inherit;font-weight:700;cursor:pointer}
.consent-banner .consent-actions button:hover{background:#f1e9fb}
.consent-banner .consent-actions button:focus-visible,.cookie-settings-link:focus-visible{outline:3px solid #8b4dd6;outline-offset:3px}
.cookie-settings-link{padding:0;border:0;background:none;color:inherit;font:inherit;text-decoration:underline;text-underline-offset:3px;cursor:pointer}`
  document.head.append(style)

  const banner = document.createElement('section')
  banner.className = 'consent-banner'
  banner.setAttribute('aria-labelledby', 'consent-title')
  banner.hidden = true
  banner.innerHTML = `
<p class="consent-title" id="consent-title"><span class="bi"><span class="th">คุกกี้เพื่อการวิเคราะห์</span><span class="en">Analytics cookies</span></span></p>
<p class="consent-text"><span class="bi"><span class="th">เราใช้คุกกี้วิเคราะห์ (Google Analytics) เพื่อเข้าใจว่าเว็บไซต์ถูกใช้งานอย่างไรและนำไปปรับปรุง ไม่ใช้เพื่อการโฆษณา เปลี่ยนการตั้งค่าได้ทุกเมื่อที่ “ตั้งค่าคุกกี้” ท้ายหน้า</span><span class="en">We use analytics cookies (Google Analytics) to understand how this site is used and improve it. We do not use them for advertising. You can change this anytime under “Cookie settings” at the bottom of the page.</span></span></p>
<div class="consent-actions"><button type="button" data-consent="denied"><span class="bi"><span class="th">ปฏิเสธ</span><span class="en">Decline</span></span></button><button type="button" data-consent="granted"><span class="bi"><span class="th">ยอมรับ</span><span class="en">Accept</span></span></button></div>`

  const paintLang = () => {
    const lang = document.body.dataset.lang || readStored('lang')
    banner.dataset.lang = lang === 'en' ? 'en' : 'th'
  }
  const show = focus => {
    paintLang()
    banner.hidden = false
    if (focus) banner.querySelector(`[data-consent="${choice || 'granted'}"]`).focus()
  }
  const decide = next => {
    choice = next
    try { localStorage.setItem(CONSENT_KEY, next) } catch (error) { console.warn('Could not save the analytics choice; the banner will ask again on the next page', error) }
    gtag('consent', 'update', { analytics_storage: next })
    if (next === 'granted') start(); else clearAnalyticsCookies()
    banner.hidden = true
  }
  banner.addEventListener('click', event => {
    const next = event.target.closest('[data-consent]')?.dataset.consent
    if (next) decide(next)
  })

  const mount = () => {
    document.body.append(banner)
    new MutationObserver(paintLang).observe(document.body, { attributes: true, attributeFilter: ['data-lang'] })
    window.addEventListener('language-change', paintLang)
    for (const link of document.querySelectorAll('[data-cookie-settings]')) link.hidden = false
    document.addEventListener('click', event => {
      if (!(event.target instanceof Element)) return
      if (event.target.closest('[data-cookie-settings]')) return show(true)
      const href = event.target.closest('a[href]')?.getAttribute('href') || ''
      const method = CONTACT_METHODS.find(([pattern]) => pattern.test(href))?.[1]
      if (method) window.siteAnalytics.track('contact_click', { method })
    })
    if (!choice) show(false)
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount)
  else mount()
})()
