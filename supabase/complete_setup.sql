-- ========================================================
-- SupportOps Complete Supabase Database Initialization Script
-- Paste this script into your Supabase SQL Editor and click RUN.
-- ========================================================

create extension if not exists pgcrypto;

-- 1. Roles & Permissions
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (name in ('manager', 'support_engineer', 'qa_engineer')),
  description text,
  created_at timestamptz not null default now()
);

insert into public.roles (name, description)
values
  ('manager', 'Team Lead with administrative access'),
  ('support_engineer', 'Support Engineer evaluated with support-specific KPIs'),
  ('qa_engineer', 'QA Engineer evaluated with QA-specific KPIs')
on conflict (name) do nothing;

-- 2. Profiles Table
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  full_name text not null,
  email text not null unique,
  role_id uuid references public.roles(id),
  role text default 'support_engineer',
  shift text default 'day' check (shift in ('morning', 'day', 'evening')),
  employment_status text not null default 'active' check (employment_status in ('active', 'inactive')),
  avatar_url text,
  joined_at date default CURRENT_DATE,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure columns exist and auth_user_id is nullable for unauthenticated form entries
alter table public.profiles alter column auth_user_id drop not null;
alter table public.profiles add column if not exists role text default 'support_engineer';
alter table public.profiles add column if not exists shift text default 'day';
alter table public.profiles add column if not exists employment_status text default 'active';
alter table public.profiles add column if not exists role_id uuid references public.roles(id);

-- Seed initial team profiles if missing
insert into public.profiles (full_name, email, role, role_id, shift, employment_status)
select 
  p.full_name, 
  p.email, 
  p.role, 
  r.id as role_id,
  p.shift, 
  p.employment_status
from (
  values
    ('Ankit Mane', 'mane@thaliatechnologies.com', 'manager', 'day', 'active'),
    ('Lalit', 'lalit@thaliatechnologies.com', 'support_engineer', 'day', 'active'),
    ('Gaurav', 'gauravsalvi@thaliatechnologies.com', 'support_engineer', 'morning', 'active'),
    ('Rupali', 'rupali@thaliatechnologies.com', 'support_engineer', 'evening', 'active'),
    ('Prathamesh', 'prathamesh@thaliatechnologies.com', 'support_engineer', 'day', 'active'),
    ('Shivam', 'shivam@thaliatechnologies.com', 'qa_engineer', 'day', 'active')
) as p(full_name, email, role, shift, employment_status)
left join public.roles r on r.name = p.role
on conflict (email) do update set
  role = excluded.role,
  role_id = coalesce(excluded.role_id, public.profiles.role_id),
  shift = excluded.shift,
  employment_status = excluded.employment_status;

-- 3. Daily Operations & Support Logs Table
create table if not exists public.daily_support_logs (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.profiles(id) on delete cascade,
  log_date date not null,
  attendance_status text not null default 'present' check (attendance_status in ('present', 'wfh', 'leave')),
  tickets_handled integer not null default 0 check (tickets_handled >= 0),
  chats_handled integer not null default 0 check (chats_handled >= 0),
  doc_updated boolean default false,
  feature_suggestion boolean default false,
  bug_verification boolean default false,
  asked_for_review boolean default false,
  got_review boolean default false,
  other_contribution boolean default false,
  support_quality text default 'average',
  testing_quality text default 'average',
  testing_notes text,
  notes text,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (employee_id, log_date)
);

alter table public.daily_support_logs add column if not exists doc_updated boolean default false;
alter table public.daily_support_logs add column if not exists feature_suggestion boolean default false;
alter table public.daily_support_logs add column if not exists bug_verification boolean default false;
alter table public.daily_support_logs add column if not exists asked_for_review boolean default false;
alter table public.daily_support_logs add column if not exists got_review boolean default false;
alter table public.daily_support_logs add column if not exists other_contribution boolean default false;
alter table public.daily_support_logs add column if not exists support_quality text default 'average';
alter table public.daily_support_logs add column if not exists testing_quality text default 'average';
alter table public.daily_support_logs add column if not exists testing_notes text;

-- 4. Daily Testing Logs Table
create table if not exists public.daily_testing_logs (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.profiles(id) on delete cascade,
  log_date date not null,
  platform text default 'shopify',
  application_name text not null default '',
  module_name text not null default '',
  testing_type text not null default 'functional',
  status text not null default 'completed',
  bugs_found integer not null default 0,
  critical_bugs_found integer not null default 0,
  critical_bug boolean default false,
  notes text,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.daily_testing_logs add column if not exists platform text default 'shopify';
alter table public.daily_testing_logs add column if not exists critical_bug boolean default false;

-- 5. Public Daily Report Portal Submissions & Attachments Table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'submission_status_enum') THEN
    CREATE TYPE submission_status_enum AS ENUM ('draft', 'submitted', 'late', 'missing');
  END IF;
END $$;

create table if not exists public.daily_report_submissions (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.profiles(id) on delete cascade,
  work_date date not null,
  shift text not null check (shift in ('morning', 'day', 'evening')),
  status submission_status_enum not null default 'submitted',
  is_late boolean not null default false,
  submitted_at timestamptz default now(),
  draft_payload jsonb default '{}'::jsonb,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_employee_work_date unique (employee_id, work_date)
);

create table if not exists public.daily_report_attachments (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.daily_report_submissions(id) on delete cascade,
  employee_id uuid not null references public.profiles(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_size int not null,
  file_type text not null,
  storage_bucket text not null default 'daily-log-attachments',
  created_at timestamptz not null default now()
);

-- 6. Email Settings Table
create table if not exists public.email_settings (
  id uuid primary key default gen_random_uuid(),
  resend_api_key text default '',
  sender_email text default 'SupportOps <notifications@supportops.thaliatechnologies.com>',
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

insert into public.email_settings (id, resend_api_key, sender_email, primary_manager_email, app_url)
select 
  '00000000-0000-0000-0000-000000000001'::uuid,
  '',
  'SupportOps <notifications@supportops.thaliatechnologies.com>',
  'mane@thaliatechnologies.com',
  'http://localhost:3000'
where not exists (select 1 from public.email_settings);

-- 7. Email Queue & Audit Logs Table
create table if not exists public.email_queue (
  id uuid primary key default gen_random_uuid(),
  report_id uuid,
  recipient_email text not null,
  cc_emails text[] default array[]::text[],
  email_type text not null default 'report_notification',
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

-- 8. Enable Row Level Security (RLS) Policies
alter table public.profiles enable row level security;
alter table public.daily_support_logs enable row level security;
alter table public.daily_testing_logs enable row level security;
alter table public.daily_report_submissions enable row level security;
alter table public.daily_report_attachments enable row level security;
alter table public.email_settings enable row level security;
alter table public.email_queue enable row level security;

-- Permissive policies for web application access
drop policy if exists "Allow all on profiles" on public.profiles;
create policy "Allow all on profiles" on public.profiles for all using (true) with check (true);

drop policy if exists "Allow all on daily_support_logs" on public.daily_support_logs;
create policy "Allow all on daily_support_logs" on public.daily_support_logs for all using (true) with check (true);

drop policy if exists "Allow all on daily_testing_logs" on public.daily_testing_logs;
create policy "Allow all on daily_testing_logs" on public.daily_testing_logs for all using (true) with check (true);

drop policy if exists "Allow all on daily_report_submissions" on public.daily_report_submissions;
create policy "Allow all on daily_report_submissions" on public.daily_report_submissions for all using (true) with check (true);

drop policy if exists "Allow all on daily_report_attachments" on public.daily_report_attachments;
create policy "Allow all on daily_report_attachments" on public.daily_report_attachments for all using (true) with check (true);

drop policy if exists "Allow all on email_settings" on public.email_settings;
create policy "Allow all on email_settings" on public.email_settings for all using (true) with check (true);

drop policy if exists "Allow all on email_queue" on public.email_queue;
create policy "Allow all on email_queue" on public.email_queue for all using (true) with check (true);
