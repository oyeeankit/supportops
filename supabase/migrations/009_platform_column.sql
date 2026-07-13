-- SupportOps Module 9: Platform column + updated RPC
-- Adds platform to daily_testing_logs, updates save_daily_operations RPC

-- Add platform column to daily_testing_logs
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'daily_testing_logs' and column_name = 'platform'
  ) then
    alter table public.daily_testing_logs
      add column platform text not null default 'shopify'
        check (platform in ('support_only', 'shopify', 'wix', 'bigcommerce', 'woocommerce'));
  end if;
end $$;

-- Backfill platform for existing rows based on application_name
update public.daily_testing_logs set platform = 'support_only'
  where application_name = 'No Testing Assigned' or application_name = '';

-- Refresh schema cache
notify pgrst, 'reload schema';

-- Recreate the RPC function with platform support
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
        employee_id, log_date, platform, application_name, module_name,
        testing_type, status, bugs_found, critical_bugs_found,
        testing_quality, started_at, ended_at, notes, created_by, updated_by
      ) values (
        p_employee_id,
        p_log_date,
        coalesce(v_entry->>'platform', 'shopify'),
        coalesce(v_entry->>'application_name', ''),
        coalesce(v_entry->>'module_name', ''),
        coalesce(v_entry->>'testing_type', 'functional'),
        coalesce(v_entry->>'status', 'in_progress'),
        coalesce((v_entry->>'bugs_found')::int, 0),
        coalesce((v_entry->>'critical_bugs_found')::int, 0),
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

-- Notify again after function recreation
notify pgrst, 'reload schema';
