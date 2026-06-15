-- ===== Run this in Supabase Dashboard → SQL Editor =====

-- Products table
create table if not exists products (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name_th     text not null,
  name_en     text not null,
  category    text not null check (category in ('bess','solar','ev','ems')),
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

-- Admin: full access to products (anon key — add auth later to restrict)
create policy "Admin manage products"
  on products for all
  using (true)
  with check (true);

-- Public can insert quotes
create policy "Public insert quotes"
  on quotes for insert
  with check (true);

-- Admin: read and update quotes
create policy "Admin read quotes"
  on quotes for select
  using (true);

create policy "Admin update quotes"
  on quotes for update
  using (true)
  with check (true);

-- Seed: 4 initial products
insert into products (slug, name_th, name_en, category, description_th, description_en, specs, images, sort_order) values
(
  'heroee8-aio',
  'HeroEE 8 AIO',
  'HeroEE 8 AIO',
  'bess',
  'แบตเตอรี่ 8 kWh + Inverter 5,000W ในตัวเดียว รองรับ Solar สูงสุด 9,000W ทนทาน 11,000 รอบชาร์จ ติดตั้งง่าย',
  '8 kWh battery + 5,000W inverter in one unit. Accepts 9,000W solar input, rated for 11,000 charge cycles.',
  '{"Energy":"8 kWh","Output":"5,000 W","Cycles":"11,000","Solar Input":"9,000 W","Chemistry":"LiFePO₄"}',
  ARRAY['/01.png'],
  1
),
(
  'solar-rooftop-industrial',
  'Solar Rooftop อุตสาหกรรม',
  'Solar Rooftop Industrial',
  'solar',
  'ระบบโซลาร์บนหลังคาโรงงาน 500 kW – 5 MW บริการ EPC ครบวงจร ตั้งแต่สำรวจ ออกแบบ ขอใบอนุญาต จนถึงติดตั้งและ O&M',
  'Factory rooftop solar 500 kW – 5 MW. Full EPC service from site survey, design, permitting to installation and O&M.',
  '{"Capacity":"0.5–5 MW","Efficiency":"22.5%","Warranty":"25 yr","Service":"EPC"}',
  ARRAY['/02.png'],
  2
),
(
  'dc-fast-charger-180kw',
  'DC Fast Charger 180 kW',
  'DC Fast Charger 180 kW',
  'ev',
  'ตู้ชาร์จเร็ว DC สำหรับสถานีบริการน้ำมัน ลานจอด ห้างสรรพสินค้า รองรับ EV ทุกค่าย ชาร์จ 10→80% ภายใน 15 นาที',
  'DC fast charger for gas stations, parking lots, and malls. Universal EV compatibility — 10→80% in 15 minutes.',
  '{"Power":"180 kW","Ports":"2","Charge Time":"15 min","Protocol":"OCPP 2.0","Standard":"CCS2"}',
  ARRAY['/03.png'],
  3
),
(
  '24scloud-ems',
  '24sCloud EMS',
  '24sCloud EMS',
  'ems',
  'ระบบจัดการพลังงานบนคลาวด์ ดูสถานะแบบ Real-time วิเคราะห์ ROI แจ้งเตือนผ่าน LINE และ Email รองรับ Modbus / OPC-UA',
  'Cloud EMS with real-time monitoring, ROI analytics, LINE/email alerts, Modbus and OPC-UA integration.',
  '{"Monitor":"24/7","App":"iOS+Android","Alert":"LINE + Email","Protocol":"Modbus / OPC-UA"}',
  ARRAY['/04.png'],
  4
)
on conflict (slug) do nothing;
