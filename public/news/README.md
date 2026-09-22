# News article images

Drop an image in this folder and the matching article picks it up. No code
change, no rebuild step.

## Naming

The filename is the article's dedupe key from the Notion Content Board
(`คีย์ป้องกันข่าวซ้ำ`), plus `.webp`:

    public/news/<คีย์ป้องกันข่าวซ้ำ>.webp

`news.html` sets `--news-img: url('/news/<slug>.webp')` on every article. That
layer sits above the placeholder, so a missing file falls through to the 01–04
placeholder and a present file replaces it. Nothing errors either way.

## Format

- **webp**, about **1600 px** wide. The featured slot is the largest at 420 px
  tall on a 1240 px container, so 1600 px covers retina
- Aim for **under 250 KB**. The originals on Drive are 2–2.6 MB, far too heavy
  for a page carrying 19 of them
- Article thumbnails crop to `center 25%` and the featured image to
  `center 30%`, so keep the subject in the upper middle

## Filenames for the 19 posted articles

| file | date | article |
|---|---|---|
| `nepc177-solar-people-10000mw-2.20thb-20yr-rooftop-ground-floating-2026-09-18.webp` | 2026-09-18 | กพช. ขยายโซลาร์ประชาชนเป็น 10,000 MW รับซื้อไฟ 2.20 บาท นา |
| `th-industry-ministry-tisi-solar-rooftop-standards-1.5m-households-mid-oct-2026-09-16.webp` | 2026-09-16 | โซลาร์ 1.5 ล้านหลัง ไม่ได้มีแค่เรื่องเงินอุดหนุน มาตรฐานติ |
| `thanakorn-rooftop-solar-5kw-750units-1650baht-month-figure-conflict-2026-09-13.webp` | 2026-09-13 | ขายไฟคืนได้ 1,000 หรือ 1,650 บาทต่อเดือน — ทำไมสองตัวเลขนี |
| `pdp2026-analysis-clean-power-datacenter-16-sites-800mw-direct-ppa-65bn-2026-09-13.webp` | 2026-09-13 | Data Center 16 แห่ง กินไฟเกิน 800 MW สิ่งที่โรงงานควรอ่านจ |
| `gulf-sparks-offgrid-solar-battery-ban-huai-ta-uttaradit-2026-09-12.webp` | 2026-09-12 | ติดโซลาร์แล้วไฟไม่ดับจริงไหม — คำตอบอยู่ที่แบตเตอรี่ ไม่ใช |
| `pdp2026-option4-73pct-green-power-3.8364-tariff-pending-final-2026-09-12.webp` | 2026-09-12 | PDP 2026: ไฟฟ้าสีเขียว 73% กับค่าไฟ 3.8364 บาท — ตัวเลขนี้ |
| `gastech-2026-bangkok-energy-security-ai-grid-modernization-2026-09-11.webp` | 2026-09-11 | Gastech 2026 เปิดที่กรุงเทพ — ทำไมเรื่อง Grid และความมั่นค |
| `th-pea-residential-progressive-rate-application-2026-09-11.webp` | 2026-09-11 | PEA เปิดให้บ้านทะเบียนชั่วคราวยื่นเปลี่ยนอัตราค่าไฟ เริ่ม  |
| `th-10gw-rooftop-target-6842mw-installed-netbilling-500mw-deadline-sep30-2026-09-10.webp` | 2026-09-10 | ตอนนี้มี 2 มาตรการเดินคู่กัน — ตัวที่เปิดแล้วหมดสิ้น 30 ก. |
| `solaredge-800vdc-ai-data-center-nvidia-framework-2026-09-10.webp` | 2026-09-10 | SolarEdge–NVIDIA เผยกรอบป้องกันระบบ 800 VDC สำหรับศูนย์ข้อ |
| `th-pdp2026-solar-24300mw-bess-14500mw-lcoe-criticism-2026-09-09.webp` | 2026-09-09 | แผนไฟฟ้า 25 ปีของรัฐ วางโซลาร์ไว้ 24,300 MW — แล้วค่าไฟล่ะ |
| `th-rooftop-solar-subsidy-1.5m-homes-50k-baht-2026-09-09.webp` | 2026-09-09 | อุดหนุนโซลาร์บ้านขยายเป็น 1.5 ล้านครัวเรือน หลังละ 5 หมื่น |
| `gulf-agri-solar-water-pump-greenhouse-udonthani-32k-baht-2026-09-09.webp` | 2026-09-09 | โซลาร์ไม่ได้มีแค่บนหลังคา — บทเรียนจากระบบสูบน้ำที่อุดรธาน |
| `thai-smart-grid-egat-mea-pea-erc-solar-ev-tpa-ugt-2026-09-09.webp` | 2026-09-09 | Smart Grid ไทยต้องโตพร้อม Solar, EV และ Data Center — ไม่ใ |
| `tisi-61730-solar-safety-2026.webp` | 2026-09-07 | โซลาร์ที่ติดไปแล้วต้องรื้อไหม? เข้าใจ มอก. ใหม่แบบเจ้าของบ |
| `village-fund-500m-solar-budget-duplication-sml-scrutiny-2026-09-07.webp` | 2026-09-07 | มีคนอ้าง "โครงการโซลาร์ของรัฐ" — เช็กก่อนว่าหมายถึงช่องทาง |
| `erc-residential-progressive-tariff-sep-2026.webp` | 2026-08-13 | ค่าไฟบ้านโครงสร้างใหม่เริ่มเดือนนี้ — อ่านบิลตัวเองยังไงก่ |
| `thai-solar-vendor-registry-2026-08-05.webp` | 2026-08-05 | ขึ้นทะเบียนผู้ติดตั้ง Solar Rooftop ปิด 30 ก.ย. — ช่างและต |
| `tisi-5-solar-equipment-mandatory-standard-sep-2026.webp` | 2026-06-30 | ก่อนติดโซลาร์ อย่าดูแค่แผง — 5 อุปกรณ์ที่ต้องมี มอก. บังคั |

`scripts/sync-news-images.mjs` can fetch, convert and place these files
automatically; see the header of that script for what it needs.
