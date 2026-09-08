import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { PGlite } from '@electric-sql/pglite'

test('PostgreSQL migration: roles, private leads, drafts, storage guards, limiter and repeat application', async () => {
  const db = new PGlite()
  try {
    // Minimal Supabase platform schemas. Policies and application SQL run on real PostgreSQL WASM.
    await db.exec(`
      create role anon; create role authenticated; create role service_role bypassrls;
      create schema auth; create schema storage;
      create function auth.jwt() returns jsonb language sql stable as
        $$ select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
      grant usage on schema public, auth, storage to anon, authenticated, service_role;
      grant execute on function auth.jwt() to anon, authenticated, service_role;
      create table storage.buckets (id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
      create table storage.objects (id uuid primary key default gen_random_uuid(),bucket_id text,name text);
      alter table storage.objects enable row level security;
      grant all on storage.objects to anon,authenticated,service_role;
      create policy prototype_open_storage on storage.objects for all using (true) with check (true);
    `)
    await db.exec(readFileSync('supabase-schema.sql','utf8'))
    const migration = readFileSync('supabase/migrations/202609070001_v2.sql','utf8')
    await db.exec(migration)
    await db.exec(migration)
    await db.exec(readFileSync('supabase/tests/v2-access.sql','utf8'))
    await db.exec(`set role anon; select set_config('request.jwt.claims','{"role":"anon"}',false);`)
    await assert.rejects(db.exec(`insert into storage.objects(bucket_id,name) values('product-images','forbidden.png')`),/row-level security/)
    await db.exec(`reset role; set role authenticated; select set_config('request.jwt.claims','{"role":"authenticated","app_metadata":{"role":"admin"}}',false);`)
    await db.exec(`insert into storage.objects(bucket_id,name) values('product-images','allowed.png')`)
    await db.exec('reset role')
    const { rows } = await db.query('select count(*)::int as count from products')
    assert.equal(rows[0].count,4,'migration and rolled-back tests preserve seed products')
  } finally { await db.close() }
})
