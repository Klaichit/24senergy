# 24sEnergy Website

เว็บไซต์อย่างเป็นทางการของ **24sEnergy** — ผู้นำด้านระบบกักเก็บพลังงาน (BESS) และ Solar PV สำหรับอุตสาหกรรมไทย ขับเคลื่อนด้วยเทคโนโลยี Hithium และพันธมิตรชั้นนำระดับโลก

🇹🇭 รองรับสองภาษา (ไทย/อังกฤษ) — สลับได้ทันทีบน toolbar

## โครงสร้าง

```
24senergy/
├── index.html                       — หน้าแรก (Hero carousel, KPI, Products, Solutions, Projects)
├── products.html                    — แคตตาล็อกผลิตภัณฑ์ 11 รายการ (BESS, Solar, EV, Monitoring)
├── news.html                        — Magazine layout (Featured + Grid + Sidebar)
├── 24sEnergy_png.png                — โลโก้
├── 01.png – 04.png                  — ภาพ mockup product (portrait PNG)
├── 24sEnergy_Website_Analysis.html  — Sitemap + Wireframes + i18n Strategy
├── 24sEnergy_CMS_Recommendation.html — แนะนำ Sanity stack
├── 24sEnergy_Hostatom_Options.html  — 4 ทางเลือกการใช้ Hostatom
└── 24sEnergy_Image_Prompts.html     — 6 AI image prompts สำหรับ hero
```

## เทคโนโลยี

- **Pure HTML/CSS/JS** — ไม่มี build step ไม่ต้อง npm install
- **Google Fonts** — IBM Plex Sans Thai, Inter, Anton, JetBrains Mono
- **Vanilla JavaScript** — ไม่ใช้ React/Vue/jQuery
- **Responsive** — รองรับ desktop, tablet, mobile (breakpoints: 1020, 980, 820, 640, 520px)

## Brand System

| Token | Value | Usage |
|---|---|---|
| Primary | `#6A2DAF` | Purple — CTA, accents |
| Secondary | `#3F3F3F` | Charcoal — headlines, footer |
| Brand Dark | `#4d1f80` | Hover, gradients |
| Brand Light | `#8b4dd6` | Highlights |

## วิธีเปิด

เปิดไฟล์ `index.html` ใน browser ได้ทันที (double-click) — ไม่ต้องตั้ง server

หรือถ้าต้องการ live reload:
```bash
# Python 3
python -m http.server 8000

# หรือ Node.js
npx serve
```

แล้วเปิด `http://localhost:8000`

## Deploy

### Option 1: Static hosting (แนะนำ)
- **Vercel** / **Netlify** / **Cloudflare Pages** — drag & drop folder
- **GitHub Pages** — push และเปิด Pages settings

### Option 2: Hostatom Shared Hosting
- อัพไฟล์ทั้งหมดขึ้น `public_html/` ผ่าน cPanel File Manager
- ไม่ต้องตั้ง PHP/MySQL

### Option 3: Production-ready stack
ดูคำแนะนำใน `24sEnergy_CMS_Recommendation.html` (Sanity + Next.js + Vercel)

## License

© 2026 24sEnergy Co., Ltd. — All rights reserved.
