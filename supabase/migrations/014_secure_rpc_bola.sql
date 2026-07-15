-- SupportOps Module 14: Fix BOLA in save_daily_operations RPC
-- Adds strict authentication and authorization checks to verify that:
-- 1. The caller is a manager, or the caller is editing their own log.
-- 2. The auditing p_profile_id matches the caller's actual profile ID to prevent creator/updater spoofing.
-- Uses Postgres IS DISTINCT FROM checks to remain secure and null-safe.

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
  p_profile_id uuid,
  p_ticket_rating int default null,
  p_chat_rating int default null,
  p_documentation_rating int default null
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
  -- BOLA Security Guard: Only allow if caller is manager, or caller is editing their own log
  if (public.current_profile_role() is distinct from 'manager') and (public.current_profile_id() is distinct from p_employee_id) then
    return jsonb_build_object('success', false, 'error', 'Unauthorized: You do not have permission to modify this employee''s daily operations.');
  end if;

  -- Additional Guard: Ensure the p_profile_id matches the caller's actual profile to prevent audit spoofing
  if p_profile_id is distinct from public.current_profile_id() then
    return jsonb_build_object('success', false, 'error', 'Unauthorized: Auditing ID mismatch.');
  end if;

  -- Upsert daily_support_logs with manager ratings
  insert into public.daily_support_logs (
    employee_id, log_date, attendance_status, tickets_handled, chats_handled,
    notes, work_focus, day_status, daily_remarks,
    ticket_rating, chat_rating, documentation_rating,
    created_by, updated_by
  ) values (
    p_employee_id, p_log_date, p_attendance_status, p_tickets_handled, p_chats_handled,
    p_notes, p_work_focus, p_day_status, p_daily_remarks,
    p_ticket_rating, p_chat_rating, p_documentation_rating,
    p_profile_id, p_profile_id
  )
  on conflict (employee_id, log_date) do update set
    attendance_status = excluded.attendance_status,
    tickets_handled = excluded.tickets_handled,
    chats_handled = excluded.chats_handled,
    notes = excluded.notes,
    work_focus = excluded.work_focus,
    day_status = excluded.day_status,
    daily_remarks = excluded.daily_remarks,
    ticket_rating = excluded.ticket_rating,
    chat_rating = excluded.chat_rating,
    documentation_rating = excluded.documentation_rating,
    updated_by = excluded.updated_by
  returning id into v_support_id;

  -- Delete existing testing entries for this employee + date
  delete from public.daily_testing_logs
  where employee_id = p_employee_id and log_date = p_log_date;

  -- Insert new testing entries
  if p_testing_entries is not null and jsonb_typeof(p_testing_entries) = 'array' and jsonb_array_length(p_testing_entries) > 0 then
    for v_entry in select * from jsonb_array_elements(p_testing_entries)
    loop
      insert into public.daily_testing_logs (
        employee_id, log_date, platform, application_name, module_name,
        testing_type, status, bugs_found, critical_bugs_found,
        testing_quality, task_completion, started_at, ended_at, notes, created_by, updated_by
      ) values (
        p_employee_id,
        p_log_date,
        coalesce(nullif(v_entry->>'platform', ''), 'shopify'),
        coalesce(v_entry->>'application_name', ''),
        coalesce(v_entry->>'module_name', ''),
        coalesce(nullif(v_entry->>'testing_type', ''), 'functional'),
        coalesce(nullif(v_entry->>'status', ''), 'in_progress'),
        coalesce((v_entry->>'bugs_found')::int, 0),
        coalesce((v_entry->>'critical_bugs_found')::int, 0),
        coalesce(nullif(v_entry->>'testing_quality', ''), 'good'),
        coalesce((v_entry->>'task_completion')::int, 5),
        nullif(v_entry->>'started_at', '')::timestamptz,
        nullif(v_entry->>'ended_at', '')::timestamptz,
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

notify pgrst, 'reload schema';
