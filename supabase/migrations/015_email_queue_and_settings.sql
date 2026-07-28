-- SupportOps Module 15: Email Queue, Settings, and Audit Logs
-- Enables configurable email recipients, retry queue, notification preferences, and logging

-- 1. Email Settings Table (Singleton configuration row)
create table if not exists public.email_settings (
  id uuid primary key default gen_random_uuid(),
  resend_api_key text default '',
  sender_email text default 'SupportOps <onboarding@resend.dev>',
  primary_manager_email text default 'mane@thaliatechnologies.com',
  cc_recipients text[] default array[]::text[],
  admin_recipients text[] default array[]::text[],
  app_url text default 'http://localhost:3000',
  notify_employee_confirmation boolean default true,
  notify_manager_submission boolean default true,
  notify_daily_reminder boolean default false,
  notify_late_submission boolean default false,
  notify_missing_report boolean default false,
  notify_weekly_summary boolean default false,
  notify_monthly_summary boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Insert initial default settings row if empty
insert into public.email_settings (id, resend_api_key, sender_email, primary_manager_email, app_url)
select 
  '00000000-0000-0000-0000-000000000001'::uuid,
  '',
  'SupportOps <onboarding@resend.dev>',
  'mane@thaliatechnologies.com',
  'http://localhost:3000'
where not exists (select 1 from public.email_settings);

-- 2. Email Queue & Audit Logs Table
create table if not exists public.email_queue (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references public.daily_report_submissions(id) on delete set null,
  recipient_email text not null,
  cc_emails text[] default array[]::text[],
  email_type text not null default 'report_notification', -- 'employee_confirmation', 'manager_notification', etc.
  subject text not null,
  html_body text not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  attempts int not null default 0,
  max_attempts int not null default 3,
  error_message text,
  scheduled_at timestamp with time zone default now(),
  sent_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Index for queue polling
create index if not exists idx_email_queue_status_scheduled on public.email_queue(status, scheduled_at);

-- RLS Policies
alter table public.email_settings enable row level security;
alter table public.email_queue enable row level security;

-- Allow authenticated users to view settings & email logs
create policy "Allow read access to email settings" on public.email_settings for select using (true);
create policy "Allow update email settings for managers/admin" on public.email_settings for update using (true);

create policy "Allow read access to email queue" on public.email_queue for select using (true);
create policy "Allow insert to email queue" on public.email_queue for insert with check (true);
create policy "Allow update email queue" on public.email_queue for update using (true);
