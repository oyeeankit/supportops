-- SupportOps Module 8: Daily Operations Redesign
-- Merges support + testing into single form, adds work_focus, start/end datetimes

-- Ensure daily_support_logs exists (idempotent)
create table if not exists public.daily_support_logs (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.profiles(id) on delete cascade,
  log_date date not null,
  attendance_status text not null default 'present'
    check (attendance_status in ('present', 'wfh', 'leave')),
  tickets_handled integer not null default 0 check (tickets_handled >= 0),
  chats_handled integer not null default 0 check (chats_handled >= 0),
  notes text,
  work_focus text default 'support'
    check (work_focus in ('support', 'testing', 'support_testing', 'meeting', 'training', 'leave')),
  day_status text default 'support'
    check (day_status in ('support', 'testing', 'support_testing', 'meeting', 'training', 'leave')),
  daily_remarks text,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (employee_id, log_date)
);

-- Ensure daily_testing_logs exists (idempotent)
create table if not exists public.daily_testing_logs (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.profiles(id) on delete cascade,
  log_date date not null,
  application_name text not null default '',
  module_name text not null default '',
  testing_task text not null default '',
  testing_type text not null default 'functional'
    check (testing_type in ('functional', 'regression', 'smoke', 'ui_ux', 'performance', 'integration', 'api', 'database', 'security', 'other')),
  status text not null default 'in_progress'
    check (status in ('in_progress', 'completed', 'blocked', 'on_hold')),
  bugs_found integer not null default 0 check (bugs_found >= 0),
  critical_bugs_found integer not null default 0 check (critical_bugs_found >= 0),
  bugs_major integer not null default 0 check (bugs_major >= 0),
  bugs_minor integer not null default 0 check (bugs_minor >= 0),
  testing_quality text not null default 'good'
    check (testing_quality in ('excellent', 'good', 'average', 'poor')),
  started_at timestamptz,
  ended_at timestamptz,
  notes text,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add new columns to daily_support_logs if missing
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'daily_support_logs' and column_name = 'work_focus'
  ) then
    alter table public.daily_support_logs
      add column work_focus text default 'support'
        check (work_focus in ('support', 'testing', 'support_testing', 'meeting', 'training', 'leave'));
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'daily_support_logs' and column_name = 'day_status'
  ) then
    alter table public.daily_support_logs
      add column day_status text default 'support'
        check (day_status in ('support', 'testing', 'support_testing', 'meeting', 'training', 'leave'));
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'daily_support_logs' and column_name = 'daily_remarks'
  ) then
    alter table public.daily_support_logs
      add column daily_remarks text;
  end if;

  -- Add started_at / ended_at to daily_testing_logs, drop time_spent if it exists
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'daily_testing_logs' and column_name = 'started_at'
  ) then
    alter table public.daily_testing_logs
      add column started_at timestamptz,
      add column ended_at timestamptz;

    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'daily_testing_logs' and column_name = 'time_spent'
    ) then
      alter table public.daily_testing_logs drop column time_spent;
    end if;
  end if;
end $$;

-- Drop old unique constraint on daily_testing_logs if it still exists
alter table public.daily_testing_logs
  drop constraint if exists daily_testing_logs_employee_id_log_date_key;

-- Indexes
create index if not exists daily_testing_logs_employee_date_idx
  on public.daily_testing_logs(employee_id, log_date);
create index if not exists daily_testing_logs_date_idx
  on public.daily_testing_logs(log_date);
create index if not exists daily_support_logs_date_idx
  on public.daily_support_logs(log_date);

-- Updated_at triggers
drop trigger if exists daily_testing_logs_set_updated_at on public.daily_testing_logs;
create trigger daily_testing_logs_set_updated_at
  before update on public.daily_testing_logs
  for each row execute function public.set_updated_at();

drop trigger if exists daily_support_logs_set_updated_at on public.daily_support_logs;
create trigger daily_support_logs_set_updated_at
  before update on public.daily_support_logs
  for each row execute function public.set_updated_at();

-- RLS
alter table public.daily_testing_logs enable row level security;
alter table public.daily_support_logs enable row level security;

-- Testing logs: select
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

-- Testing logs: insert
drop policy if exists "Users can insert own testing logs" on public.daily_testing_logs;
create policy "Users can insert own testing logs"
  on public.daily_testing_logs for insert
  to authenticated
  with check (
    employee_id = public.current_profile_id()
    or public.current_profile_role() = 'manager'
  );

-- Testing logs: update
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

-- Testing logs: delete
drop policy if exists "Users can delete own testing logs" on public.daily_testing_logs;
create policy "Users can delete own testing logs"
  on public.daily_testing_logs for delete
  to authenticated
  using (
    employee_id = public.current_profile_id()
    or public.current_profile_role() = 'manager'
  );

-- Support logs: select
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

-- Support logs: insert
drop policy if exists "Users can insert own support logs" on public.daily_support_logs;
create policy "Users can insert own support logs"
  on public.daily_support_logs for insert
  to authenticated
  with check (
    employee_id = public.current_profile_id()
    or public.current_profile_role() = 'manager'
  );

-- Support logs: update
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

-- Prevent created_by overwrite
drop trigger if exists daily_support_logs_prevent_created_by_update on public.daily_support_logs;
create trigger daily_support_logs_prevent_created_by_update
  before update on public.daily_support_logs
  for each row execute function public.prevent_created_by_update();

drop trigger if exists daily_testing_logs_prevent_created_by_update on public.daily_testing_logs;
create trigger daily_testing_logs_prevent_created_by_update
  before update on public.daily_testing_logs
  for each row execute function public.prevent_created_by_update();

-- Ensure prevent_created_by_update function exists
create or replace function public.prevent_created_by_update()
returns trigger
language plpgsql
as $$
begin
  if old.created_by is not null and new.created_by is distinct from old.created_by then
    new.created_by = old.created_by;
  end if;
  return new;
end;
$$;

-- RPC function for transactional daily operations save
create or replace function public.save_daily_operations(
  p_employee_id uuid,
  p_log_date date,
  p_attendance_status text,
  p_tickets_handled int,
  p_chats_handled int,
  p_notes text,
  p_work_focus text,
  p_day_status text,
  p_daily_remarks text,
  p_testing_entries jsonb,
  p_profile_id uuid
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_support_id uuid;
  v_entry jsonb;
  v_entry_id uuid;
  v_result jsonb = '{"success": true}'::jsonb;
begin
  -- Upsert daily_support_logs
  insert into public.daily_support_logs (
    employee_id, log_date, attendance_status, tickets_handled, chats_handled,
    notes, work_focus, day_status, daily_remarks, created_by, updated_by
  ) values (
    p_employee_id, p_log_date, p_attendance_status, p_tickets_handled, p_chats_handled,
    p_notes, p_work_focus, p_day_status, p_daily_remarks, p_profile_id, p_profile_id
  )
  on conflict (employee_id, log_date) do update set
    attendance_status = excluded.attendance_status,
    tickets_handled = excluded.tickets_handled,
    chats_handled = excluded.chats_handled,
    notes = excluded.notes,
    work_focus = excluded.work_focus,
    day_status = excluded.day_status,
    daily_remarks = excluded.daily_remarks,
    updated_by = excluded.updated_by
  returning id into v_support_id;

  -- Delete existing testing entries for this employee + date
  delete from public.daily_testing_logs
  where employee_id = p_employee_id and log_date = p_log_date;

  -- Insert new testing entries
  if p_testing_entries is not null and jsonb_array_length(p_testing_entries) > 0 then
    for v_entry in select * from jsonb_array_elements(p_testing_entries)
    loop
      insert into public.daily_testing_logs (
        employee_id, log_date, application_name, module_name, testing_task,
        testing_type, status, bugs_found, critical_bugs_found, bugs_major, bugs_minor,
        testing_quality, started_at, ended_at, notes, created_by, updated_by
      ) values (
        p_employee_id,
        p_log_date,
        coalesce(v_entry->>'application_name', ''),
        coalesce(v_entry->>'module_name', ''),
        coalesce(v_entry->>'testing_task', ''),
        coalesce(v_entry->>'testing_type', 'functional'),
        coalesce(v_entry->>'status', 'in_progress'),
        coalesce((v_entry->>'bugs_found')::int, 0),
        coalesce((v_entry->>'critical_bugs_found')::int, 0),
        coalesce((v_entry->>'bugs_major')::int, 0),
        coalesce((v_entry->>'bugs_minor')::int, 0),
        coalesce(v_entry->>'testing_quality', 'good'),
        (v_entry->>'started_at')::timestamptz,
        (v_entry->>'ended_at')::timestamptz,
        v_entry->>'notes',
        p_profile_id,
        p_profile_id
      );
    end loop;
  end if;

  return v_result;
exception when others then
  return jsonb_build_object('success', false, 'error', SQLERRM);
end;
$$;

-- Refresh schema cache
notify pgrst, 'reload schema';
