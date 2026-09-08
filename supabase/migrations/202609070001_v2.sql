-- Apply after supabase-schema.sql. Existing rows are preserved.
begin;

create or replace function public.is_admin() returns boolean
language sql stable set search_path = '' as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role' = 'admin', false)
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(), title_th text not null, title_en text not null,
  location_th text not null default '', location_en text not null default '', year integer,
  category text not null default '', capacity_value numeric, capacity_unit text not null default '',
  capacity_detail text not null default '', description_th text not null default '', description_en text not null default '',
  image_url text, product_tag text not null default '', roi_text text not null default '',
  is_featured boolean not null default false, sort_order integer not null default 0, created_at timestamptz not null default now()
);
create table if not exists public.hero_slides (
  id uuid primary key default gen_random_uuid(), title_th text not null, title_en text not null,
  image_url text, sort_order integer not null default 0, is_active boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(), name text not null, logo_url text, website text,
  sort_order integer not null default 0, is_active boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.site_config (
  key text primary key, value text not null default '', label text not null default '', updated_at timestamptz not null default now()
);
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(), name text not null, company text not null default '',
  email text not null, phone text not null, message text not null, created_at timestamptz not null default now()
);
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(), email text not null unique, created_at timestamptz not null default now()
);
create table if not exists public.lead_rate_limits (
  key text primary key, window_start timestamptz not null, attempts integer not null
);

-- Replace the prototype's permissive policies, including any policies with other names.
do $$
declare t text; p record;
begin
  foreach t in array array['products','quotes','projects','hero_slides','partners','site_config','contact_messages','newsletter_subscribers','lead_rate_limits'] loop
    execute format('alter table public.%I enable row level security', t);
    for p in select policyname from pg_policies where schemaname = 'public' and tablename = t loop
      execute format('drop policy %I on public.%I', p.policyname, t);
    end loop;
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    if t <> 'lead_rate_limits' then
      execute format('grant select, insert, update, delete on public.%I to authenticated', t);
      execute format('create policy admin_access on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
    end if;
  end loop;
end $$;
grant select on public.products, public.projects, public.hero_slides, public.partners, public.site_config to anon;
create policy published_products on public.products for select to anon, authenticated using (is_published);
create policy featured_projects on public.projects for select to anon, authenticated using (is_featured);
create policy active_slides on public.hero_slides for select to anon, authenticated using (is_active);
create policy active_partners on public.partners for select to anon, authenticated using (is_active);
create policy public_config on public.site_config for select to anon, authenticated using (
  key in ('kpi_mwh','kpi_projects','kpi_years','kpi_satisfaction','video_youtube_url','video_title_th','video_title_en','video_desc_th','video_desc_en')
);

create or replace function public.consume_lead_limit(client_key text) returns boolean
language plpgsql security definer set search_path = '' as $$
declare n integer;
begin
  if length(client_key) <> 64 then return false; end if;
  -- Atomic upsert serializes concurrent requests for the same client.
  insert into public.lead_rate_limits as r (key, window_start, attempts)
  values (client_key, now(), 1)
  on conflict (key) do update set
    attempts = case when r.window_start < now() - interval '1 hour' then 1 else least(r.attempts + 1, 11) end,
    window_start = case when r.window_start < now() - interval '1 hour' then now() else r.window_start end
  returning attempts into n;
  delete from public.lead_rate_limits where window_start < now() - interval '2 days';
  return n <= 10;
end $$;
revoke all on function public.consume_lead_limit(text) from public, anon, authenticated;
grant execute on function public.consume_lead_limit(text) to service_role;

-- Restrictive guards also constrain old permissive storage policies on this bucket.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images','product-images',true,10485760,array['image/png','image/jpeg','image/webp','image/avif','application/pdf'])
on conflict (id) do update set file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists v2_storage_insert_guard on storage.objects;
drop policy if exists v2_storage_update_guard on storage.objects;
drop policy if exists v2_storage_delete_guard on storage.objects;
drop policy if exists v2_storage_admin on storage.objects;
create policy v2_storage_insert_guard on storage.objects as restrictive for insert to anon, authenticated
with check (bucket_id <> 'product-images' or public.is_admin());
create policy v2_storage_update_guard on storage.objects as restrictive for update to anon, authenticated
using (bucket_id <> 'product-images' or public.is_admin()) with check (bucket_id <> 'product-images' or public.is_admin());
create policy v2_storage_delete_guard on storage.objects as restrictive for delete to anon, authenticated
using (bucket_id <> 'product-images' or public.is_admin());
create policy v2_storage_admin on storage.objects for all to authenticated
using (bucket_id = 'product-images' and public.is_admin()) with check (bucket_id = 'product-images' and public.is_admin());
commit;
