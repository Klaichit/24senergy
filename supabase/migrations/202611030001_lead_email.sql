-- Apply before enabling LEAD_EMAIL_ENABLED. Existing customer requests are preserved.
begin;
create table if not exists public.lead_email_outbox (
 id uuid primary key default gen_random_uuid(), lead_id uuid not null, kind text not null check(kind in ('quote','contact')),
 payload jsonb not null, status text not null default 'pending' check(status in ('pending','sending','sent','review')),
 attempts integer not null default 0, first_attempt_at timestamptz, next_attempt_at timestamptz not null default now(),
 provider_id text, last_error text, created_at timestamptz not null default now(), sent_at timestamptz,
 unique(kind,lead_id)
);
alter table public.lead_email_outbox enable row level security;
revoke all on public.lead_email_outbox from anon, authenticated;
grant all on public.lead_email_outbox to service_role;
create or replace function public.queue_lead_email() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.lead_email_outbox(lead_id,kind,payload) values(new.id,TG_ARGV[0],to_jsonb(new)) on conflict(kind,lead_id) do nothing;
 return new;
end $$;
revoke all on function public.queue_lead_email() from public,anon,authenticated;
drop trigger if exists queue_quote_email on public.quotes;
create trigger queue_quote_email after insert on public.quotes for each row execute function public.queue_lead_email('quote');
drop trigger if exists queue_contact_email on public.contact_messages;
create trigger queue_contact_email after insert on public.contact_messages for each row execute function public.queue_lead_email('contact');
create or replace function public.claim_lead_emails() returns setof public.lead_email_outbox language plpgsql security definer set search_path='' as $$
begin
 -- Do not resend ambiguous old deliveries outside the provider's idempotency window.
 update public.lead_email_outbox set status='review' where status in ('pending','sending') and (attempts>=5 or first_attempt_at<now()-interval '23 hours');
 return query with picked as (
 select id from public.lead_email_outbox where status in ('pending','sending') and next_attempt_at<=now()
 order by created_at for update skip locked limit 10
 ) update public.lead_email_outbox o set status='sending',attempts=o.attempts+1,
 first_attempt_at=coalesce(o.first_attempt_at,now()),next_attempt_at=now()+interval '5 minutes'
 from picked where o.id=picked.id returning o.*;
end $$;
revoke all on function public.claim_lead_emails() from public,anon,authenticated;
grant execute on function public.claim_lead_emails() to service_role;
commit;
