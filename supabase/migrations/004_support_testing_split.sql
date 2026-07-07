-- SupportOps Module 4: Separate support and testing logs

create table if not exists public.daily_support_logs (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.profiles(id) on delete cascade,
  log_date date not null,
  attendance_status text not null default 'present'
    check (attendance_status in ('present', 'wfh', 'leave')),
  tickets_handled integer not null default 0 check (tickets_handled >= 0),
  chats_handled integer not null default 0 check (chats_handled >= 0),
  notes text,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (employee_id, log_date)
);

create table if not exists public.daily_testing_logs (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.profiles(id) on delete cascade,
  log_date date not null,
  application_name text not null default '',
  module_name text not null default '',
  testing_task text not null default '',
  testing_type text not null default 'functional'
    check (testing_type in ('functional', 'regression', 'bug_verification', 'exploratory')),
  status text not null default 'in_progress'
    check (status in ('in_progress', 'completed')),
  bugs_found integer not null default 0 check (bugs_found >= 0),
  critical_bugs_found integer not null default 0 check (critical_bugs_found >= 0),
  notes text,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (employee_id, log_date)
);

create index if not exists daily_support_logs_employee_date_idx
  on public.daily_support_logs(employee_id, log_date);
create index if not exists daily_support_logs_date_idx
  on public.daily_support_logs(log_date);
create index if not exists daily_testing_logs_employee_date_idx
  on public.daily_testing_logs(employee_id, log_date);
create index if not exists daily_testing_logs_date_idx
  on public.daily_testing_logs(log_date);

drop trigger if exists daily_support_logs_set_updated_at on public.daily_support_logs;
create trigger daily_support_logs_set_updated_at
before update on public.daily_support_logs
for each row
execute function public.set_updated_at();

drop trigger if exists daily_testing_logs_set_updated_at on public.daily_testing_logs;
create trigger daily_testing_logs_set_updated_at
before update on public.daily_testing_logs
for each row
execute function public.set_updated_at();

alter table public.daily_support_logs enable row level security;
alter table public.daily_testing_logs enable row level security;

drop policy if exists "Users can view own support logs" on public.daily_support_logs;
create policy "Users can view own support logs"
on public.daily_support_logs for select
to authenticated
using (employee_id = public.current_profile_id());

drop policy if exists "Managers can view all support logs" on public.daily_support_logs;
create policy "Managers can view all support logs"
on public.daily_support_logs for select
to authenticated
using (public.current_profile_role() = 'manager');

drop policy if exists "Users can insert own support logs" on public.daily_support_logs;
create policy "Users can insert own support logs"
on public.daily_support_logs for insert
to authenticated
with check (
  employee_id = public.current_profile_id()
  or public.current_profile_role() = 'manager'
);

drop policy if exists "Users can update own support logs" on public.daily_support_logs;
create policy "Users can update own support logs"
on public.daily_support_logs for update
to authenticated
using (
  employee_id = public.current_profile_id()
  or public.current_profile_role() = 'manager'
)
with check (
  employee_id = public.current_profile_id()
  or public.current_profile_role() = 'manager'
);

drop policy if exists "Users can view own testing logs" on public.daily_testing_logs;
create policy "Users can view own testing logs"
on public.daily_testing_logs for select
to authenticated
using (employee_id = public.current_profile_id());

drop policy if exists "Managers can view all testing logs" on public.daily_testing_logs;
create policy "Managers can view all testing logs"
on public.daily_testing_logs for select
to authenticated
using (public.current_profile_role() = 'manager');

drop policy if exists "Users can insert own testing logs" on public.daily_testing_logs;
create policy "Users can insert own testing logs"
on public.daily_testing_logs for insert
to authenticated
with check (
  employee_id = public.current_profile_id()
  or public.current_profile_role() = 'manager'
);

drop policy if exists "Users can update own testing logs" on public.daily_testing_logs;
create policy "Users can update own testing logs"
on public.daily_testing_logs for update
to authenticated
using (
  employee_id = public.current_profile_id()
  or public.current_profile_role() = 'manager'
)
with check (
  employee_id = public.current_profile_id()
  or public.current_profile_role() = 'manager'
);
