-- Migration: 016_daily_operations_manager_redesign
-- Modifies the daily support and testing logs to support the new manager-driven workflow.

-- 1. Alter daily_support_logs
ALTER TABLE public.daily_support_logs
  DROP COLUMN IF EXISTS notes,
  DROP COLUMN IF EXISTS work_focus,
  DROP COLUMN IF EXISTS day_status,
  DROP COLUMN IF EXISTS daily_remarks,
  DROP COLUMN IF EXISTS ticket_rating,
  DROP COLUMN IF EXISTS chat_rating,
  DROP COLUMN IF EXISTS documentation_rating;

ALTER TABLE public.daily_support_logs
  ADD COLUMN IF NOT EXISTS doc_updated BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS feature_suggestion BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS bug_verification BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS asked_for_review BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS got_review BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS other_contribution BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS support_quality TEXT DEFAULT 'good',
  ADD COLUMN IF NOT EXISTS testing_quality TEXT DEFAULT 'good',
  ADD COLUMN IF NOT EXISTS testing_notes TEXT;

-- 2. Alter daily_testing_logs
ALTER TABLE public.daily_testing_logs
  DROP COLUMN IF EXISTS testing_quality,
  DROP COLUMN IF EXISTS task_completion,
  DROP COLUMN IF EXISTS started_at,
  DROP COLUMN IF EXISTS ended_at,
  DROP COLUMN IF EXISTS notes;

ALTER TABLE public.daily_testing_logs
  DROP COLUMN IF EXISTS critical_bugs_found,
  ADD COLUMN IF NOT EXISTS critical_bug BOOLEAN DEFAULT false;

-- 3. Alter monthly_performance_adjustments
ALTER TABLE public.monthly_performance_adjustments
  DROP COLUMN IF EXISTS behavior_rating,
  DROP COLUMN IF EXISTS manager_points,
  DROP COLUMN IF EXISTS support_adjustment,
  DROP COLUMN IF EXISTS testing_adjustment;

ALTER TABLE public.monthly_performance_adjustments
  ADD COLUMN IF NOT EXISTS initiative_rating INTEGER DEFAULT 3;

-- 4. Recreate the save_daily_operations RPC to match the new schema
create or replace function public.save_daily_operations(
  p_employee_id uuid,
  p_log_date date,
  p_attendance_status text,
  p_tickets_handled int,
  p_chats_handled int,
  p_doc_updated boolean,
  p_feature_suggestion boolean,
  p_bug_verification boolean,
  p_asked_for_review boolean,
  p_got_review boolean,
  p_other_contribution boolean,
  p_support_quality text,
  p_testing_quality text,
  p_testing_notes text,
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
  -- BOLA Security Guard: Only allow if caller is manager, or caller is editing their own log
  if (public.current_profile_role() is distinct from 'manager') and (public.current_profile_id() is distinct from p_employee_id) then
    return jsonb_build_object('success', false, 'error', 'Unauthorized: You do not have permission to modify this employee''s daily operations.');
  end if;

  -- Additional Guard: Ensure the p_profile_id matches the caller's actual profile to prevent audit spoofing
  if p_profile_id is distinct from public.current_profile_id() then
    return jsonb_build_object('success', false, 'error', 'Unauthorized: Auditing ID mismatch.');
  end if;

  -- Upsert daily_support_logs
  insert into public.daily_support_logs (
    employee_id, log_date, attendance_status, tickets_handled, chats_handled,
    doc_updated, feature_suggestion, bug_verification, asked_for_review, got_review, other_contribution,
    support_quality, testing_quality, testing_notes,
    created_by, updated_by
  ) values (
    p_employee_id, p_log_date, p_attendance_status, p_tickets_handled, p_chats_handled,
    p_doc_updated, p_feature_suggestion, p_bug_verification, p_asked_for_review, p_got_review, p_other_contribution,
    p_support_quality, p_testing_quality, p_testing_notes,
    p_profile_id, p_profile_id
  )
  on conflict (employee_id, log_date) do update set
    attendance_status = excluded.attendance_status,
    tickets_handled = excluded.tickets_handled,
    chats_handled = excluded.chats_handled,
    doc_updated = excluded.doc_updated,
    feature_suggestion = excluded.feature_suggestion,
    bug_verification = excluded.bug_verification,
    asked_for_review = excluded.asked_for_review,
    got_review = excluded.got_review,
    other_contribution = excluded.other_contribution,
    support_quality = excluded.support_quality,
    testing_quality = excluded.testing_quality,
    testing_notes = excluded.testing_notes,
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
        testing_type, status, bugs_found, critical_bug, created_by, updated_by
      ) values (
        p_employee_id,
        p_log_date,
        coalesce(nullif(v_entry->>'platform', ''), 'shopify'),
        coalesce(v_entry->>'application_name', ''),
        coalesce(v_entry->>'module_name', ''),
        coalesce(nullif(v_entry->>'testing_type', ''), 'functional'),
        coalesce(nullif(v_entry->>'status', ''), 'in_progress'),
        coalesce((v_entry->>'bugs_found')::int, 0),
        coalesce((v_entry->>'critical_bug')::boolean, false),
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
