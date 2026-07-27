import { createClient } from "@/lib/supabase/server";
import type { UserProfile } from "@/lib/auth/roles";
import type { DailyReportSubmission, DailyReportAttachment } from "./types";
import type { DailySupportLog, DailyTestingLog } from "../daily-operations/types";

export async function getEmployeeSubmissions(
  profile: UserProfile,
  monthFilter?: string
): Promise<{ submissions: DailyReportSubmission[]; error?: string }> {
  const supabase = await createClient();

  let query = supabase
    .from("daily_report_submissions")
    .select("*")
    .eq("employee_id", profile.id)
    .order("work_date", { ascending: false });

  if (monthFilter) {
    query = query.gte("work_date", `${monthFilter}-01`).lte("work_date", `${monthFilter}-31`);
  }

  const { data: subData, error: subErr } = await query;
  if (subErr) {
    // Fallback: query daily_support_logs directly
    let logQuery = supabase
      .from("daily_support_logs")
      .select("*")
      .eq("employee_id", profile.id)
      .order("log_date", { ascending: false });

    if (monthFilter) {
      logQuery = logQuery.gte("log_date", `${monthFilter}-01`).lte("log_date", `${monthFilter}-31`);
    }

    const { data: logData } = await logQuery;

    const fallbackSubs: DailyReportSubmission[] = (logData || []).map((log) => ({
      id: log.id,
      employee_id: log.employee_id,
      work_date: log.log_date,
      shift: "day",
      status: "submitted",
      is_late: false,
      submitted_at: log.created_at,
      draft_payload: null,
      notes: log.notes ?? null,
      created_by: log.created_by,
      updated_by: log.updated_by,
      created_at: log.created_at,
      updated_at: log.updated_at,
      supportLog: log as DailySupportLog,
    }));

    return { submissions: fallbackSubs };
  }

  const workDates = (subData || []).map((s) => s.work_date);

  const [supportRes, testingRes, attachRes] = await Promise.all([
    supabase
      .from("daily_support_logs")
      .select("*")
      .eq("employee_id", profile.id)
      .in("log_date", workDates.length > 0 ? workDates : ["1970-01-01"]),
    supabase
      .from("daily_testing_logs")
      .select("*")
      .eq("employee_id", profile.id)
      .in("log_date", workDates.length > 0 ? workDates : ["1970-01-01"]),
    supabase
      .from("daily_report_attachments")
      .select("*")
      .eq("employee_id", profile.id),
  ]);

  const supportMap = new Map<string, DailySupportLog>();
  (supportRes.data || []).forEach((log) => supportMap.set(log.log_date, log as DailySupportLog));

  const testingMap = new Map<string, DailyTestingLog[]>();
  (testingRes.data || []).forEach((log) => {
    const list = testingMap.get(log.log_date) || [];
    list.push(log as DailyTestingLog);
    testingMap.set(log.log_date, list);
  });

  const attachMap = new Map<string, DailyReportAttachment[]>();
  (attachRes.data || []).forEach((att) => {
    const list = attachMap.get(att.submission_id) || [];
    list.push(att as DailyReportAttachment);
    attachMap.set(att.submission_id, list);
  });

  const fullSubmissions: DailyReportSubmission[] = (subData || []).map((sub) => ({
    ...sub,
    supportLog: supportMap.get(sub.work_date) ?? null,
    testingLogs: testingMap.get(sub.work_date) ?? [],
    attachments: attachMap.get(sub.id) ?? [],
  }));

  return { submissions: fullSubmissions };
}

export async function getEmployeeDraft(
  profile: UserProfile,
  workDate: string
): Promise<{ draft: Record<string, unknown> | null; status?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("daily_report_submissions")
      .select("draft_payload, status")
      .eq("employee_id", profile.id)
      .eq("work_date", workDate)
      .maybeSingle();

    if (error) {
      return { draft: null };
    }

    return {
      draft: data?.draft_payload ?? null,
      status: data?.status,
    };
  } catch {
    return { draft: null };
  }
}

export async function getManagerSubmissions(
  profile: UserProfile,
  filters?: {
    date?: string;
    shift?: string;
    status?: string;
    employeeId?: string;
  }
): Promise<{ submissions: DailyReportSubmission[]; error?: string }> {
  const supabase = await createClient();

  if (profile.role !== "manager") {
    return { submissions: [], error: "Unauthorized access." };
  }

  let query = supabase.from("daily_report_submissions").select("*").order("work_date", { ascending: false });

  if (filters?.date) query = query.eq("work_date", filters.date);
  if (filters?.shift && filters.shift !== "all") query = query.eq("shift", filters.shift);
  if (filters?.status && filters.status !== "all") query = query.eq("status", filters.status);
  if (filters?.employeeId && filters.employeeId !== "all") query = query.eq("employee_id", filters.employeeId);

  const { data: subData, error: subErr } = await query;

  if (subErr) {
    // Fallback: Query daily_support_logs & profiles
    let logQuery = supabase.from("daily_support_logs").select("*").order("log_date", { ascending: false });
    if (filters?.date) logQuery = logQuery.eq("log_date", filters.date);
    if (filters?.employeeId && filters.employeeId !== "all") logQuery = logQuery.eq("employee_id", filters.employeeId);

    const { data: logs } = await logQuery;
    const empIds = Array.from(new Set((logs || []).map((l) => l.employee_id)));

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, avatar_url")
      .in("id", empIds.length > 0 ? empIds : ["00000000-0000-0000-0000-000000000000"]);

    const profileMap = new Map();
    (profiles || []).forEach((p) => profileMap.set(p.id, p));

    const fallbackSubs: DailyReportSubmission[] = (logs || []).map((log) => {
      const emp = profileMap.get(log.employee_id);
      return {
        id: log.id,
        employee_id: log.employee_id,
        work_date: log.log_date,
        shift: "day",
        status: "submitted",
        is_late: false,
        submitted_at: log.created_at,
        draft_payload: null,
        notes: log.notes ?? null,
        created_by: log.created_by,
        updated_by: log.updated_by,
        created_at: log.created_at,
        updated_at: log.updated_at,
        employee_name: emp?.full_name ?? "Unknown",
        employee_email: emp?.email ?? "",
        avatar_url: emp?.avatar_url ?? null,
        role: emp?.role ?? "support_engineer",
        supportLog: log as DailySupportLog,
      };
    });

    return { submissions: fallbackSubs };
  }

  // Join profiles
  const empIds = Array.from(new Set((subData || []).map((s) => s.employee_id)));
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, avatar_url")
    .in("id", empIds.length > 0 ? empIds : ["00000000-0000-0000-0000-000000000000"]);

  const profileMap = new Map();
  (profiles || []).forEach((p) => profileMap.set(p.id, p));

  const submissions: DailyReportSubmission[] = (subData || []).map((sub) => {
    const emp = profileMap.get(sub.employee_id);
    return {
      ...sub,
      employee_name: emp?.full_name ?? "Unknown",
      employee_email: emp?.email ?? "",
      avatar_url: emp?.avatar_url ?? null,
      role: emp?.role ?? "support_engineer",
    };
  });

  return { submissions };
}
