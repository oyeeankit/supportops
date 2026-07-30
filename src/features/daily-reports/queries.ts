import { createClient } from "@/lib/supabase/server";
import type { UserProfile } from "@/lib/auth/roles";
import type { DailyReportSubmission, DailyReportAttachment } from "./types";
import type { DailySupportLog, DailyTestingLog } from "../daily-operations/types";

export async function getDailyReportSubmissionForDate(
  profile: UserProfile,
  workDate: string
): Promise<{ submission: DailyReportSubmission | null; error?: string }> {
  const supabase = await createClient();

  // Try fetching from daily_report_submissions first
  const { data: subData } = await supabase
    .from("daily_report_submissions")
    .select("*")
    .eq("employee_id", profile.id)
    .eq("work_date", workDate)
    .maybeSingle();

  // Fetch support logs
  const supportRes = await supabase
    .from("daily_support_logs")
    .select("*")
    .eq("employee_id", profile.id)
    .eq("log_date", workDate)
    .maybeSingle();

  // Fetch testing logs
  const testingRes = await supabase
    .from("daily_testing_logs")
    .select("*")
    .eq("employee_id", profile.id)
    .eq("log_date", workDate);

  // Fetch attachments
  let attachments: DailyReportAttachment[] = [];
  if (subData?.id) {
    const attachRes = await supabase
      .from("daily_report_attachments")
      .select("*")
      .eq("submission_id", subData.id);
    attachments = (attachRes.data || []) as DailyReportAttachment[];
  }

  const supportLog = (supportRes.data as DailySupportLog) ?? null;
  const testingLogs = (testingRes.data as DailyTestingLog[]) ?? [];

  if (!subData && !supportLog && testingLogs.length === 0) {
    return { submission: null };
  }

  const status = subData?.status ?? (supportLog || testingLogs.length > 0 ? "submitted" : "missing");

  return {
    submission: {
      id: subData?.id ?? supportLog?.id ?? `sub_${profile.id}_${workDate}`,
      employee_id: profile.id,
      work_date: workDate,
      shift: subData?.shift ?? "day",
      status,
      is_late: subData?.is_late ?? false,
      submitted_at: subData?.submitted_at ?? supportLog?.created_at ?? new Date().toISOString(),
      draft_payload: subData?.draft_payload ?? null,
      notes: subData?.notes ?? (supportLog as any)?.notes ?? (supportLog as any)?.testing_notes ?? null,
      created_by: profile.id,
      updated_by: profile.id,
      created_at: subData?.created_at ?? supportLog?.created_at ?? new Date().toISOString(),
      updated_at: subData?.updated_at ?? supportLog?.updated_at ?? new Date().toISOString(),
      employee_name: profile.full_name,
      employee_email: profile.email,
      avatar_url: (profile as any).avatar_url ?? null,
      role: profile.role,
      supportLog,
      testingLogs,
      attachments,
    },
  };
}

export async function getEmployeeSubmissions(
  profile: UserProfile,
  limitOrMonth?: number | string
): Promise<{ submissions: DailyReportSubmission[]; error?: string }> {
  const limit = typeof limitOrMonth === "number" ? limitOrMonth : 30;
  const monthFilter = typeof limitOrMonth === "string" ? limitOrMonth : null;

  const supabase = await createClient();

  let subQuery = supabase
    .from("daily_report_submissions")
    .select("*")
    .eq("employee_id", profile.id)
    .order("work_date", { ascending: false });

  let supportQuery = supabase
    .from("daily_support_logs")
    .select("*")
    .eq("employee_id", profile.id)
    .order("log_date", { ascending: false });

  let testingQuery = supabase
    .from("daily_testing_logs")
    .select("*")
    .eq("employee_id", profile.id)
    .order("log_date", { ascending: false });

  if (monthFilter) {
    const startDate = `${monthFilter}-01`;
    const endDate = `${monthFilter}-31`;
    subQuery = subQuery.gte("work_date", startDate).lte("work_date", endDate);
    supportQuery = supportQuery.gte("log_date", startDate).lte("log_date", endDate);
    testingQuery = testingQuery.gte("log_date", startDate).lte("log_date", endDate);
  } else {
    subQuery = subQuery.limit(limit);
    supportQuery = supportQuery.limit(limit);
    testingQuery = testingQuery.limit(limit * 3);
  }

  const [{ data: subData }, supportRes, testingRes, attachRes] = await Promise.all([
    subQuery,
    supportQuery,
    testingQuery,
    supabase.from("daily_report_attachments").select("*").eq("uploaded_by", profile.id),
  ]);

  const supportMap = new Map<string, DailySupportLog>();
  (supportRes.data || []).forEach((log) => {
    const key = String(log.log_date).split("T")[0];
    supportMap.set(key, log as DailySupportLog);
  });

  const testingMap = new Map<string, DailyTestingLog[]>();
  (testingRes.data || []).forEach((log) => {
    const key = String(log.log_date).split("T")[0];
    const list = testingMap.get(key) || [];
    list.push(log as DailyTestingLog);
    testingMap.set(key, list);
  });

  const attachMap = new Map<string, DailyReportAttachment[]>();
  (attachRes.data || []).forEach((att) => {
    const list = attachMap.get(att.submission_id) || [];
    list.push(att as DailyReportAttachment);
    attachMap.set(att.submission_id, list);
  });

  const subMap = new Map<string, any>();
  (subData || []).forEach((sub) => {
    const key = String(sub.work_date).split("T")[0];
    subMap.set(key, sub);
  });

  const allDates = Array.from(
    new Set([
      ...Array.from(subMap.keys()),
      ...Array.from(supportMap.keys()),
      ...Array.from(testingMap.keys()),
    ])
  ).sort((a, b) => b.localeCompare(a));

  const fullSubmissions: DailyReportSubmission[] = allDates.map((workDate) => {
    const sub = subMap.get(workDate);
    let sLog = supportMap.get(workDate) ?? null;
    if ((!sLog || ((sLog.tickets_handled ?? 0) === 0 && (sLog.chats_handled ?? 0) === 0)) && sub?.draft_payload) {
      const draft = sub.draft_payload as any;
      const tHandled = Number(draft.tickets_handled ?? draft.tickets ?? 0);
      const cHandled = Number(draft.chats_handled ?? draft.chats ?? 0);
      if (tHandled > 0 || cHandled > 0) {
        sLog = {
          id: sLog?.id ?? `draft-s-${profile.id}-${workDate}`,
          employee_id: profile.id,
          log_date: workDate,
          attendance_status: draft.attendance_status ?? sLog?.attendance_status ?? "present",
          tickets_handled: tHandled,
          chats_handled: cHandled,
          doc_updated: Boolean(draft.doc_updated ?? sLog?.doc_updated),
          feature_suggestion: Boolean(draft.feature_suggestion ?? sLog?.feature_suggestion),
          bug_verification: Boolean(draft.bug_verification ?? sLog?.bug_verification),
          asked_for_review: Boolean(draft.asked_for_review ?? sLog?.asked_for_review),
          got_review: Boolean(draft.got_review ?? sLog?.got_review),
          other_contribution: Boolean(draft.other_contribution ?? sLog?.other_contribution),
          support_quality: sLog?.support_quality ?? "good",
          testing_quality: sLog?.testing_quality ?? "good",
          testing_notes: sub.notes ?? sLog?.testing_notes ?? null,
          created_by: null,
          updated_by: null,
          created_at: sub.created_at ?? sLog?.created_at ?? new Date().toISOString(),
          updated_at: sub.updated_at ?? sLog?.updated_at ?? new Date().toISOString(),
        };
      }
    }
    let tLogs = testingMap.get(workDate) ?? [];
    if (tLogs.length === 0 && sub?.draft_payload?.testing_entries) {
      const draftList = sub.draft_payload.testing_entries;
      if (Array.isArray(draftList) && draftList.length > 0) {
        tLogs = draftList.map((t: any, idx: number) => ({
          id: `draft-t-${profile.id}-${workDate}-${idx}`,
          employee_id: profile.id,
          log_date: workDate,
          platform: t.platform || "shopify",
          application_name: t.application_name || "App Testing",
          module_name: t.module_name || "",
          testing_type: t.testing_type || "functional",
          status: t.status || "completed",
          bugs_found: Number(t.bugs_found || 0),
          critical_bug: Boolean(t.critical_bug),
          created_by: null,
          updated_by: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
      }
    }
    const status = sub?.status ?? (sLog || tLogs.length > 0 ? "submitted" : "missing");

    return {
      id: sub?.id ?? sLog?.id ?? `sub_${profile.id}_${workDate}`,
      employee_id: profile.id,
      work_date: workDate,
      shift: sub?.shift ?? "day",
      status,
      is_late: sub?.is_late ?? false,
      submitted_at: sub?.submitted_at ?? sLog?.created_at ?? new Date().toISOString(),
      draft_payload: sub?.draft_payload ?? null,
      notes: sub?.notes ?? (sLog as any)?.notes ?? null,
      created_by: profile.id,
      updated_by: profile.id,
      created_at: sub?.created_at ?? sLog?.created_at ?? new Date().toISOString(),
      updated_at: sub?.updated_at ?? sLog?.updated_at ?? new Date().toISOString(),
      employee_name: profile.full_name,
      employee_email: profile.email,
      role: profile.role,
      supportLog: sLog,
      testingLogs: tLogs,
      attachments: sub ? (attachMap.get(sub.id) ?? []) : [],
    };
  });

  return { submissions: fullSubmissions };
}

export async function getEmployeeDraft(
  profile: UserProfile,
  workDate: string
): Promise<{ draft: Record<string, unknown> | null; status?: string }> {
  try {
    const supabase = await createClient();

    const { data } = await supabase
      .from("daily_report_submissions")
      .select("draft_payload, status")
      .eq("employee_id", profile.id)
      .eq("work_date", workDate)
      .maybeSingle();

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

  // 1. Fetch daily report submissions, support logs, and testing logs
  let subQuery = supabase.from("daily_report_submissions").select("*").order("work_date", { ascending: false });
  let supportQuery = supabase.from("daily_support_logs").select("*").order("log_date", { ascending: false });
  let testingQuery = supabase.from("daily_testing_logs").select("*").order("log_date", { ascending: false });

  if (filters?.date) {
    subQuery = subQuery.eq("work_date", filters.date);
    supportQuery = supportQuery.eq("log_date", filters.date);
    testingQuery = testingQuery.eq("log_date", filters.date);
  }
  if (filters?.employeeId && filters.employeeId !== "all") {
    subQuery = subQuery.eq("employee_id", filters.employeeId);
    supportQuery = supportQuery.eq("employee_id", filters.employeeId);
    testingQuery = testingQuery.eq("employee_id", filters.employeeId);
  }

  const [subRes, supportRes, testingRes] = await Promise.all([subQuery, supportQuery, testingQuery]);
  const subData = subRes.data || [];
  const supportLogs = (supportRes.data || []) as DailySupportLog[];
  const testingLogs = (testingRes.data || []) as DailyTestingLog[];

  // Collect all unique employee IDs
  const empIds = Array.from(
    new Set([
      ...subData.map((s) => s.employee_id),
      ...supportLogs.map((l) => l.employee_id),
      ...testingLogs.map((t) => t.employee_id),
    ])
  );

  if (empIds.length === 0) {
    return { submissions: [] };
  }

  // 2. Fetch employee profiles (including all team profiles)
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, avatar_url, role, roles(name)")
    .in("id", empIds);

  const profileMap = new Map();
  (profiles || []).forEach((p) => {
    const roleName = Array.isArray(p.roles) ? p.roles[0]?.name : (p.roles as any)?.name ?? p.role ?? "support_engineer";
    profileMap.set(p.id, { ...p, role: roleName });
  });

  // Group logs by (employee_id, date)
  const groupedKeys = new Set<string>();
  subData.forEach((s) => groupedKeys.add(`${s.employee_id}_${String(s.work_date).split("T")[0]}`));
  supportLogs.forEach((l) => groupedKeys.add(`${l.employee_id}_${String(l.log_date).split("T")[0]}`));
  testingLogs.forEach((t) => groupedKeys.add(`${t.employee_id}_${String(t.log_date).split("T")[0]}`));

  const submissions: DailyReportSubmission[] = [];

  for (const key of Array.from(groupedKeys)) {
    const [empId, workDate] = key.split("_");
    const emp = profileMap.get(empId) || {
      full_name: `Employee (${empId.slice(0, 6)})`,
      email: "",
      avatar_url: null,
      role: "support_engineer",
    };

    const subRecord = subData.find((s) => s.employee_id === empId && String(s.work_date).split("T")[0] === workDate) ?? null;
    const matchingSupportLogs = supportLogs.filter((l) => l.employee_id === empId && String(l.log_date).split("T")[0] === workDate);
    let empSupportLog = matchingSupportLogs.find((l) => (l.tickets_handled ?? 0) > 0 || (l.chats_handled ?? 0) > 0) ?? matchingSupportLogs[0] ?? null;

    if ((!empSupportLog || ((empSupportLog.tickets_handled ?? 0) === 0 && (empSupportLog.chats_handled ?? 0) === 0)) && subRecord?.draft_payload) {
      const draft = subRecord.draft_payload as any;
      const tHandled = Number(draft.tickets_handled ?? draft.tickets ?? 0);
      const cHandled = Number(draft.chats_handled ?? draft.chats ?? 0);
      if (tHandled > 0 || cHandled > 0) {
        empSupportLog = {
          id: empSupportLog?.id ?? `draft-s-${empId}-${workDate}`,
          employee_id: empId,
          log_date: workDate,
          attendance_status: draft.attendance_status ?? empSupportLog?.attendance_status ?? "present",
          tickets_handled: tHandled,
          chats_handled: cHandled,
          doc_updated: Boolean(draft.doc_updated ?? empSupportLog?.doc_updated),
          feature_suggestion: Boolean(draft.feature_suggestion ?? empSupportLog?.feature_suggestion),
          bug_verification: Boolean(draft.bug_verification ?? empSupportLog?.bug_verification),
          asked_for_review: Boolean(draft.asked_for_review ?? empSupportLog?.asked_for_review),
          got_review: Boolean(draft.got_review ?? empSupportLog?.got_review),
          other_contribution: Boolean(draft.other_contribution ?? empSupportLog?.other_contribution),
          support_quality: empSupportLog?.support_quality ?? "good",
          testing_quality: empSupportLog?.testing_quality ?? "good",
          testing_notes: subRecord.notes ?? empSupportLog?.testing_notes ?? null,
          created_by: null,
          updated_by: null,
          created_at: subRecord.created_at ?? empSupportLog?.created_at ?? new Date().toISOString(),
          updated_at: subRecord.updated_at ?? empSupportLog?.updated_at ?? new Date().toISOString(),
        };
      }
    }
    let empTestingLogs = testingLogs.filter((t) => t.employee_id === empId && String(t.log_date).split("T")[0] === workDate);

    if (empTestingLogs.length === 0 && subRecord?.draft_payload?.testing_entries) {
      const draftList = subRecord.draft_payload.testing_entries;
      if (Array.isArray(draftList) && draftList.length > 0) {
        empTestingLogs = draftList.map((t: any, idx: number) => ({
          id: `draft-t-${empId}-${workDate}-${idx}`,
          employee_id: empId,
          log_date: workDate,
          platform: t.platform || "shopify",
          application_name: t.application_name || "App Testing",
          module_name: t.module_name || "",
          testing_type: t.testing_type || "functional",
          status: t.status || "completed",
          bugs_found: Number(t.bugs_found || 0),
          critical_bug: Boolean(t.critical_bug),
          created_by: null,
          updated_by: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
      }
    }

    const status = subRecord?.status ?? (empSupportLog || empTestingLogs.length > 0 ? "submitted" : "missing");

    submissions.push({
      id: subRecord?.id ?? empSupportLog?.id ?? `sub_${empId}_${workDate}`,
      employee_id: empId,
      work_date: workDate,
      shift: subRecord?.shift ?? "day",
      status,
      is_late: subRecord?.is_late ?? false,
      submitted_at: subRecord?.submitted_at ?? empSupportLog?.created_at ?? new Date().toISOString(),
      draft_payload: subRecord?.draft_payload ?? null,
      notes: subRecord?.notes ?? (empSupportLog as any)?.notes ?? (empSupportLog as any)?.testing_notes ?? null,
      created_by: empId,
      updated_by: empId,
      created_at: subRecord?.created_at ?? empSupportLog?.created_at ?? new Date().toISOString(),
      updated_at: subRecord?.updated_at ?? empSupportLog?.updated_at ?? new Date().toISOString(),
      employee_name: emp.full_name,
      employee_email: emp.email,
      avatar_url: emp.avatar_url,
      role: emp.role,
      supportLog: empSupportLog,
      testingLogs: empTestingLogs,
      attachments: [],
    });
  }

  return { submissions };
}

export { getEmployeeSubmissions as getEmployeeSubmissionsHistory };
