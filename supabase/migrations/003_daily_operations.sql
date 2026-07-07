-- SupportOps Module 3: Daily Operations

create or replace function public.current_profile_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select p.id
  from public.profiles p
  where p.auth_user_id = auth.uid()
  limit 1
$$;

create table if not exists public.daily_operations (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.profiles(id) on delete cascade,
  operation_date date not null,
  attendance_status text not null default 'present'
    check (attendance_status in ('present', 'wfh', 'leave')),
  tickets_resolved integer not null default 0 check (tickets_resolved >= 0),
  chats_handled integer not null default 0 check (chats_handled >= 0),
  work_focus text not null default 'support'
    check (work_focus in ('support', 'testing', 'mixed', 'documentation', 'training', 'other')),
  current_testing_task text,
  notes text,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (employee_id, operation_date)
);

create index if not exists daily_operations_employee_date_idx
  on public.daily_operations(employee_id, operation_date);
create index if not exists daily_operations_date_idx
  on public.daily_operations(operation_date);

drop trigger if exists daily_operations_set_updated_at on public.daily_operations;
create trigger daily_operations_set_updated_at
before update on public.daily_operations
for each row
execute function public.set_updated_at();

alter table public.daily_operations enable row level security;

drop policy if exists "Users can view own daily operations" on public.daily_operations;
create policy "Users can view own daily operations"
on public.daily_operations for select
to authenticated
using (employee_id = public.current_profile_id());

drop policy if exists "Managers can view all daily operations" on public.daily_operations;
create policy "Managers can view all daily operations"
on public.daily_operations for select
to authenticated
using (public.current_profile_role() = 'manager');

drop policy if exists "Users can insert own daily operations" on public.daily_operations;
create policy "Users can insert own daily operations"
on public.daily_operations for insert
to authenticated
with check (
  employee_id = public.current_profile_id()
  or public.current_profile_role() = 'manager'
);

drop policy if exists "Users can update own daily operations" on public.daily_operations;
create policy "Users can update own daily operations"
on public.daily_operations for update
to authenticated
using (
  employee_id = public.current_profile_id()
  or public.current_profile_role() = 'manager'
)
with check (
  employee_id = public.current_profile_id()
  or public.current_profile_role() = 'manager'
);
