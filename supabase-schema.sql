-- ===== Run this in Supabase Dashboard → SQL Editor =====

-- Products table
create table if not exists products (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name_th     text not null,
  name_en     text not null,
  category    text not null check (category in ('bess','solar','inverter','ev','ems')),
  description_th text not null default '',
  description_en text not null default '',
  specs       jsonb not null default '{}',
  images      text[] not null default '{}',
  pdf_url     text,
  is_published boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Quotes table
create table if not exists quotes (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  company      text not null,
  phone        text not null,
  email        text not null,
  line_id      text,
  contact_pref text not null default 'phone',
  products     text[] not null default '{}',
  business_type text not null,
  power_demand text,
  timeline     text,
  budget       text,
  details      text,
  status       text not null default 'new' check (status in ('new','contacted','quoted','closed')),
  created_at   timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger products_updated_at
  before update on products
  for each row execute function update_updated_at();

-- RLS (Row Level Security)
alter table products enable row level security;
alter table quotes enable row level security;

-- Public can read published products
create policy "Public read published products"
  on products for select
  using (is_published = true);

-- Admin role must be assigned through trusted Auth app_metadata.
create policy "Admin manage products"
  on products for all to authenticated
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role' = 'admin', false))
  with check (coalesce(auth.jwt() -> 'app_metadata' ->> 'role' = 'admin', false));

-- Lead inserts go through /api/leads using a server-only key.

-- Admin: read and update quotes
create policy "Admin read quotes"
  on quotes for select to authenticated
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role' = 'admin', false));

create policy "Admin update quotes"
  on quotes for update to authenticated
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role' = 'admin', false))
  with check (coalesce(auth.jwt() -> 'app_metadata' ->> 'role' = 'admin', false));

-- Seed: 4 initial products
insert into products (slug, name_th, name_en, category, description_th, description_en, specs, sort_order) values
(
  'sunwoda-atrix-max-plus',
  'Sunwoda Atrix Max+ แบตเตอรี่ 16 kWh',
  'Sunwoda Atrix Max+ 16 kWh Battery',
  'bess',
  'แบตเตอรี่ LFP เซลล์ 314Ah ความจุ 16 kWh ใช้ได้เต็ม 16 kWh ที่ 100% DOD อายุการใช้งานสูงสุด 10,000 รอบตามเงื่อนไขผู้ผลิต ต่อขนานได้สูงสุด 32 ชุด รวม 512 kWh IP65 รับประกัน 10 ปีตามเงื่อนไขผู้ผลิต',
  'LFP battery with 314Ah cells: 16 kWh nominal, 16 kWh usable at 100% DOD, up to 10,000 cycles under manufacturer test conditions. Up to 32 units in parallel for 512 kWh. IP65. 10-year warranty per manufacturer terms.',
  '{"Usable":"16 kWh","Max system":"512 kWh","Rating":"IP65"}',
  10
),
(
  'kstar-blue-s-bluepulse',
  'KSTAR BluE-S และ BluePulse ระบบกักเก็บพลังงาน',
  'KSTAR BluE-S & BluePulse Energy Storage',
  'bess',
  'ระบบกักเก็บพลังงานตั้งแต่บ้าน 3.68–10 kW ถึงงาน C&I 20–50 kW คู่กับตู้ 107 kWh ขยายได้ 70–214 kWh สลับไฟสำรองต่ำกว่า 10 ms รองรับเครื่องปั่นไฟ',
  'Storage from 3.68–10 kW residential to 20–50 kW C&I with a 107 kWh cabinet, expandable to 70–214 kWh. Sub-10 ms backup transfer with genset input.',
  '{"Home":"3.68–10 kW","C&I":"20–50 kW","Cabinet":"107 kWh"}',
  20
),
(
  'tcl-blueark-x1',
  'TCL BlueArk X1 ชุด Hybrid และแบตเตอรี่',
  'TCL BlueArk X1 Hybrid & Battery System',
  'bess',
  'อินเวอร์เตอร์ไฮบริด 1 เฟส 3–8 kW และ 3 เฟส 5–16 kW แบต LFP 8 kWh ใช้ได้จริง 7.2 kWh ขยายได้ 8–128 kWh IP66 รับประกัน 5 ปี (10 ปีเป็นออปชัน)',
  'Hybrid inverter 3–8 kW single-phase and 5–16 kW three-phase. LFP battery 8 kWh nominal, 7.2 kWh usable, scaling 8–128 kWh. IP66. 5-year warranty, 10 years optional.',
  '{"Hybrid":"3–16 kW","Storage":"8–128 kWh","Rating":"IP66"}',
  30
),
(
  'leapton-n-type-topcon-bifacial',
  'Leapton N-Type TOPCon Bifacial 610–725W',
  'Leapton N-Type TOPCon Bifacial 610–725W',
  'solar',
  'แผง N-Type TOPCon กระจกสองชั้น 610–725W ประสิทธิภาพสูงสุด 23.34% Bifaciality 80±5% เสื่อม 0.4% ต่อปี รับประกันสินค้า 25 ปี / กำลังผลิต 30 ปี ผลิตที่ประเทศจีน',
  'N-Type TOPCon dual-glass modules, 610–725W, up to 23.34% efficiency, 80±5% bifaciality, 0.4% annual degradation. 25-year product / 30-year performance warranty. Manufactured in China.',
  '{"Power":"610–725 W","Max eff.":"23.34%","Bifaciality":"80±5%"}',
  40
),
(
  'solaredge-home-hub-optimizer',
  'SolarEdge Home Hub, Optimizer และ Home Battery',
  'SolarEdge Home Hub, Optimizer & Home Battery',
  'inverter',
  'ระบบควบคุมและดูข้อมูลทีละแผง Home Hub 3–10 kVA Optimizer ประสิทธิภาพสูงสุด 99.5% พร้อม SafeDC และแบตใช้ได้จริง 9.7 kWh รับประกัน 12–25 ปีแล้วแต่รุ่น',
  'Panel-level control and monitoring. Home Hub 3–10 kVA, optimizers up to 99.5% peak efficiency with SafeDC, and a 9.7 kWh usable battery. Warranty 12–25 years depending on model.',
  '{"Home Hub":"3–10 kVA","Peak eff.":"99.5%","Battery":"9.7 kWh"}',
  50
),
(
  'solplanet-asw-ht-series',
  'Solplanet ASW HT Series และ Rapid Shutdown',
  'Solplanet ASW HT Series & Rapid Shutdown',
  'inverter',
  'อินเวอร์เตอร์ 3 เฟส 250–360 kW ประสิทธิภาพสูงสุด 99.01% กระแส 75A ต่อ MPPT รองรับ 1500V IP66 พร้อม Rapid Shutdown ระดับแผง Sol-RSD02',
  'Three-phase inverters 250–360 kW, up to 99.01% peak efficiency, 75A per MPPT, 1500V, IP66, with Sol-RSD02 module-level rapid shutdown.',
  '{"Power":"250–360 kW","Max eff.":"99.01%","Per MPPT":"75 A"}',
  60
)
on conflict (slug) do nothing;
