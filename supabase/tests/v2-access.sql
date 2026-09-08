-- Run after migration on a disposable Supabase test project. Rolls back fixtures.
begin;
insert into public.products (slug,name_th,name_en,category,is_published)
values ('v2-test-published','ทดสอบ','Test','bess',true), ('v2-test-draft','ฉบับร่าง','Draft','bess',false);
insert into public.quotes (name,company,phone,email,business_type) values ('V2 test','Test','0812345678','v2-test@example.com','test');
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
do $$ begin
  if (select count(*) from public.products where slug like 'v2-test-%') <> 1 then raise exception 'Anon can see draft'; end if;
  if has_table_privilege('anon','public.quotes','SELECT') then raise exception 'Anon can read leads'; end if;
  if has_table_privilege('anon','public.products','UPDATE') then raise exception 'Anon can edit products'; end if;
  if has_function_privilege('anon','public.consume_lead_limit(text)','EXECUTE') then raise exception 'Anon can call limiter'; end if;
end $$;
reset role;
set local role authenticated;
-- User-editable metadata must not grant administration.
select set_config('request.jwt.claims', '{"role":"authenticated","user_metadata":{"role":"admin"},"app_metadata":{}}', true);
do $$ begin
  if public.is_admin() then raise exception 'User metadata grants admin'; end if;
  if exists(select 1 from public.quotes) then raise exception 'Normal user sees private leads'; end if;
  if (select count(*) from public.products where slug like 'v2-test-%') <> 1 then raise exception 'Normal user sees drafts'; end if;
  begin
    insert into public.products (slug,name_th,name_en,category) values ('v2-test-forbidden','x','x','bess');
    raise exception 'Normal user can insert';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claims', '{"role":"authenticated","app_metadata":{"role":"admin"}}', true);
do $$ begin
  if not public.is_admin() then raise exception 'Admin denied'; end if;
  if (select count(*) from public.products where slug like 'v2-test-%') <> 2 then raise exception 'Admin cannot see drafts'; end if;
  if not exists(select 1 from public.quotes where email='v2-test@example.com') then raise exception 'Admin cannot read leads'; end if;
end $$;
reset role;
set local role service_role;
do $$ declare i integer; k text := repeat('a',64); begin
  delete from public.lead_rate_limits where key=k;
  for i in 1..10 loop
    if not public.consume_lead_limit(k) then raise exception 'Rate limit too early'; end if;
  end loop;
  if public.consume_lead_limit(k) then raise exception 'Rate limit failed'; end if;
end $$;
rollback;
