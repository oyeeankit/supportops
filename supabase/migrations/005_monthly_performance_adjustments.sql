-- SupportOps Module 5: Monthly performance manager adjustments

create table if not exists public.monthly_performance_adjustments (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.profiles(id) on delete cascade,
  report_month date not null,
  support_adjustment integer not null default 0 check (support_adjustment between -10 and 10),
  testing_adjustment integer not null default 0 check (testing_adjustment between -10 and 10),
  manager_remarks text,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (employee_id, report_month)
);

create index if not exists monthly_performance_adjustments_employee_month_idx
  on public.monthly_performance_adjustments(employee_id, report_month);

drop trigger if exists monthly_performance_adjustments_set_updated_at on public.monthly_performance_adjustments;
create trigger monthly_performance_adjustments_set_updated_at
before update on public.monthly_performance_adjustments
for each row
execute function public.set_updated_at();

alter table public.monthly_performance_adjustments enable row level security;

drop policy if exists "Managers can view monthly adjustments" on public.monthly_performance_adjustments;
create policy "Managers can view monthly adjustments"
on public.monthly_performance_adjustments for select
to authenticated
using (public.current_profile_role() = 'manager');

drop policy if exists "Managers can insert monthly adjustments" on public.monthly_performance_adjustments;
create policy "Managers can insert monthly adjustments"
on public.monthly_performance_adjustments for insert
to authenticated
with check (public.current_profile_role() = 'manager');

drop policy if exists "Managers can update monthly adjustments" on public.monthly_performance_adjustments;
create policy "Managers can update monthly adjustments"
on public.monthly_performance_adjustments for update
to authenticated
using (public.current_profile_role() = 'manager')
with check (public.current_profile_role() = 'manager');
