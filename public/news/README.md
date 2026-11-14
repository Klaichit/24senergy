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
  for a page carrying 37 of them
- Article thumbnails crop to `center 25%` and the featured image to
  `center 30%`, so keep the subject in the upper middle

## Filenames for the 37 posted articles

| file | date | article |
|---|---|---|
| `solar-rooftop-no-rg4-license-2569.webp` | 2026-10-28 | ติดโซลาร์รูฟท็อปไม่ต้องขอใบอนุญาต รง.4 แต่ยังมีขั้นตอนที่ต้อ |
| `pea-solar-worth-it-bill-2000-2569.webp` | 2026-10-28 | บ้านค่าไฟเท่าไหร่ถึงคุ้มร่วมโซลาร์ภาคประชาชน? |
| `pea-solar-smartgrid-smartmeter-20bn-2569.webp` | 2026-10-28 | รัฐเตรียมลงทุนสายส่งและสมาร์ตมิเตอร์หลักหมื่นล้าน รองรับโซลา |
| `pea-solar-registered-installers-bigplayers-2569.webp` | 2026-10-28 | โซลาร์ภาคประชาชน: เลือกผู้ติดตั้งที่ขึ้นทะเบียนกับการไฟฟ้าอย |
| `pea-solar-macro-1.5bn-jobs-training-2569.webp` | 2026-10-28 | ภาพใหญ่โซลาร์ภาคประชาชน: เม็ดเงินราว 1.5 พันล้านดอลลาร์ และก |
| `bess-ci-boi-depreciation-2569.webp` | 2026-10-28 | BESS สำหรับธุรกิจ C&I กับประเด็นสิทธิ BOI และการหักค่าเสื่อม |
| `thailand-solar-import-surge-china-2026.webp` | 2026-10-28 | ไทยนำเข้าแผงโซลาร์เพิ่มขึ้น 88.7% ใน 7 เดือนแรกปี 2026 |
| `edu-panel-degradation-lifespan-25-30yr.webp` | 2026-10-28 | แผงโซลาร์เสื่อมปีละเท่าไร? อายุใช้งาน 25–30 ปีจริงไหม |
| `edu-ongrid-offgrid-hybrid-comparison.webp` | 2026-10-28 | On-grid, Off-grid และ Hybrid ต่างกันอย่างไร เลือกแบบไหนดี? |
| `edu-panel-cleaning-maintenance-rainy-pm25.webp` | 2026-10-28 | ดูแลและล้างแผงโซลาร์ ช่วงหน้าฝนและฝุ่น PM2.5 |
| `pea-solar-prachachon-50k-subsidy-5-10kw-2569.webp` | 2026-10-27 | โครงการโซลาร์ภาคประชาชนของ PEA เงินสนับสนุน 50,000 บาท |
| `erc-revise-adder-fit-spp-vspp-nonfirm-11baht-vs-2.1579-2026-10-08.webp` | 2026-10-08 | กกพ. ทบทวนสัญญารับซื้อไฟเก่า บางโครงการโซลาร์รับซื้อถึง 11 บ |
| `th-solar-1.5m-bottleneck-installers-mit-cost-grid-2026-10-07.webp` | 2026-10-07 | โซลาร์ 1.5 ล้านหลังจะไปถึงไหม — โจทย์อยู่ที่ช่าง อุปกรณ์ และ |
| `egat-78072m-baht-bess-1595mw-6380mwh-4-substations-2026-10-07.webp` | 2026-10-07 | กฟผ. วางแผน 7.8 หมื่นล้าน เพิ่ม BESS 1,595 MW รองรับโซลาร์ภา |
| `nepc177-solar-people-10000mw-2.20thb-20yr-rooftop-ground-floating-2026-09-18.webp` | 2026-09-18 | กพช. ขยายโซลาร์ประชาชนเป็น 10,000 MW รับซื้อไฟ 2.20 บาท นา |
| `solar-buyback-2.20-net-billing-nepc-20yr-2569.webp` | 2026-09-18 | รับซื้อไฟโซลาร์ 2.20 บาท/หน่วย แบบ Net Billing คืออะไร |
| `th-industry-ministry-tisi-solar-rooftop-standards-1.5m-households-mid-oct-2026-09-16.webp` | 2026-09-16 | โซลาร์ 1.5 ล้านหลัง ไม่ได้มีแค่เรื่องเงินอุดหนุน มาตรฐานติ |
| `krisdika-warns-power-development-fund-24.6bn-public-lighting-cost-to-ratepayers-2026-09-14.webp` | 2026-09-14 | กฤษฎีกาตั้งข้อห่วงใย การใช้เงินกองทุนพัฒนาไฟฟ้าจ่ายค่าไฟสาธา |
| `thanakorn-rooftop-solar-5kw-750units-1650baht-month-figure-conflict-2026-09-13.webp` | 2026-09-13 | ขายไฟคืนได้ 1,000 หรือ 1,650 บาทต่อเดือน — ทำไมสองตัวเลขนี |
| `pdp2026-analysis-clean-power-datacenter-16-sites-800mw-direct-ppa-65bn-2026-09-13.webp` | 2026-09-13 | Data Center 16 แห่ง กินไฟเกิน 800 MW สิ่งที่โรงงานควรอ่านจ |
| `gulf-sparks-offgrid-solar-battery-ban-huai-ta-uttaradit-2026-09-12.webp` | 2026-09-12 | ติดโซลาร์แล้วไฟไม่ดับจริงไหม — คำตอบอยู่ที่แบตเตอรี่ ไม่ใช |
| `pdp2026-option4-73pct-green-power-3.8364-tariff-pending-final-2026-09-12.webp` | 2026-09-12 | PDP 2026: ไฟฟ้าสีเขียว 73% กับค่าไฟ 3.8364 บาท — ตัวเลขนี้ |
| `moi-submits-75bn-loan-screening-board-1.5m-households-5kw-cap-2300-installers-2026-09-12.webp` | 2026-09-12 | โครงการโซลาร์ 7.5 หมื่นล้านเสนอเข้าบอร์ดกลั่นกรองแล้ว ยังรอผ |
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
| `siam-premium-outlets-solar-bess-re100-2026-09-02.webp` | 2026-09-02 | Siam Premium Outlets ใช้โซลาร์ + แบตเตอรี่ และพลังงานหมุนเวี |
| `erc-residential-progressive-tariff-sep-2026.webp` | 2026-08-13 | ค่าไฟบ้านโครงสร้างใหม่เริ่มเดือนนี้ — อ่านบิลตัวเองยังไงก่ |
| `thai-solar-vendor-registry-2026-08-05.webp` | 2026-08-05 | ขึ้นทะเบียนผู้ติดตั้ง Solar Rooftop ปิด 30 ก.ย. — ช่างและต |
| `tisi-5-solar-equipment-mandatory-standard-sep-2026.webp` | 2026-06-30 | ก่อนติดโซลาร์ อย่าดูแค่แผง — 5 อุปกรณ์ที่ต้องมี มอก. บังคั |

`scripts/sync-news-images.mjs` can fetch, convert and place these files
automatically; see the header of that script for what it needs.
