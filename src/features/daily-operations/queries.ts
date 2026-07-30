import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { canManageSupport, canManageTesting, type AppRole, type UserProfile } from "@/lib/auth/roles";
import type { Shift } from "@/features/employees/types";
import type { DailySupportLog, DailyTestingLog, TeamMemberDailyRow, TestingQuality } from "./types";
import {
  calculateMonthlyFinalScore,
  getExpectedWorkingDays,
  getStarRating,
  round,
  clamp,
  type MonthlyPerformanceMetrics,
  type MonthlyPerformanceSummary,
} from "./performance";
import { testingQualityToScore, supportQualityToScore } from "./types";

type ProfileRow = {
  id: string;
  full_name: string;
  email: string;
  shift: Shift;
  avatar_url: string | null;
  roles:
    | {
        name: AppRole;
      }
    | {
        name: AppRole;
      }[]
    | null;
};

export function todayIso() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export type DashboardRange = "today" | "yesterday" | "7d" | "month";

function isSchemaCacheError(error: { message?: string } | null) {
  if (!error?.message) {
    return false;
  }
  return /Could not find the|relation "[^"]+" does not exist|invalid schema|column|schema cache/i.test(error.message);
}

type LegacyOperation = {
  id: string;
  employee_id: string;
  operation_date: string;
  attendance_status: "present" | "wfh" | "leave";
  tickets_resolved: number;
  chats_handled: number;
  current_testing_task: string | null;
};

function toSupportLog(legacy: LegacyOperation): DailySupportLog {
  return {
    id: legacy.id,
    employee_id: legacy.employee_id,
    log_date: legacy.operation_date,
    attendance_status: legacy.attendance_status,
    tickets_handled: legacy.tickets_resolved,
    chats_handled: legacy.chats_handled,
    doc_updated: false,
    feature_suggestion: false,
    bug_verification: false,
    asked_for_review: false,
    got_review: false,
    other_contribution: false,
    support_quality: "average",
    testing_quality: "average",
    testing_notes: null,
    created_by: null,
    updated_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function toTestingLogs(legacy: LegacyOperation): DailyTestingLog[] {
  if (!legacy.current_testing_task) {
    return [];
  }
  return [
    {
      id: legacy.id,
      employee_id: legacy.employee_id,
      log_date: legacy.operation_date,
      platform: "shopify" as const,
      application_name: "",
      module_name: "",
      testing_type: "functional",
      status: "completed",
      bugs_found: 0,
      critical_bug: false,
      created_by: null,
      updated_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
}

async function fetchLegacyOperations(
  supabase: Awaited<ReturnType<typeof createClient>>,
  dateOrStart: string,
  dateOrEnd: string | undefined,
  employeeIds: string[],
) {
  const query = supabase.from("daily_operations").select("*").in("employee_id", employeeIds);
  const { data, error } = dateOrEnd
    ? await query.gte("operation_date", dateOrStart).lte("operation_date", dateOrEnd)
    : await query.eq("operation_date", dateOrStart);
  if (error) {
    return { data: [] as LegacyOperation[], error };
  }
  return { data: (data ?? []) as LegacyOperation[], error: null };
}

async function fetchDailySupportLogsWithFallback(
  supabase: Awaited<ReturnType<typeof createClient>>,
  startDate: string,
  endDate: string | undefined,
  employeeIds: string[],
) {
  let query = supabase.from("daily_support_logs").select("*").in("employee_id", employeeIds);
  if (endDate) {
    query = query.gte("log_date", startDate).lte("log_date", endDate).order("log_date", { ascending: false });
  } else {
    query = query.gte("log_date", startDate).lte("log_date", `${startDate}T23:59:59.999Z`);
  }

  const { data, error } = await query;
  if (!error) {
    return { data: (data ?? []) as DailySupportLog[], error: null };
  }

  // If select("*") failed because redesign columns (e.g. asked_for_review) are missing, query baseline columns
  let legacyQuery = supabase
    .from("daily_support_logs")
    .select("id, employee_id, log_date, attendance_status, tickets_handled, chats_handled, created_at, updated_at")
    .in("employee_id", employeeIds);

  if (endDate) {
    legacyQuery = legacyQuery.gte("log_date", startDate).lte("log_date", endDate).order("log_date", { ascending: false });
  } else {
    legacyQuery = legacyQuery.gte("log_date", startDate).lte("log_date", `${startDate}T23:59:59.999Z`);
  }

  const { data: legacyData, error: legacyError } = await legacyQuery;
  if (!legacyError && legacyData) {
    const mapped = legacyData.map((row) => ({
      ...row,
      doc_updated: false,
      feature_suggestion: false,
      bug_verification: false,
      asked_for_review: false,
      got_review: false,
      other_contribution: false,
      support_quality: "average" as const,
      testing_quality: "average" as const,
      testing_notes: null,
      created_by: null,
      updated_by: null,
    })) as DailySupportLog[];
    return { data: mapped, error: null };
  }

  // Fallback to legacy daily_operations table
  const legacy = await fetchLegacyOperations(supabase, startDate, endDate, employeeIds);
  if (!legacy.error) {
    return { data: (legacy.data || []).map(toSupportLog), error: null };
  }

  // If table is missing from schema cache, return empty array without error banner
  if (isSchemaCacheError(error) || isSchemaCacheError(legacyError) || isSchemaCacheError(legacy.error)) {
    return { data: [] as DailySupportLog[], error: null };
  }

  return { data: [] as DailySupportLog[], error: error ?? legacyError };
}

async function fetchDailyTestingLogsWithFallback(
  supabase: Awaited<ReturnType<typeof createClient>>,
  startDate: string,
  endDate: string | undefined,
  employeeIds: string[],
) {
  let query = supabase.from("daily_testing_logs").select("*").in("employee_id", employeeIds);
  if (endDate) {
    query = query.gte("log_date", startDate).lte("log_date", endDate).order("log_date", { ascending: false });
  } else {
    query = query.gte("log_date", startDate).lte("log_date", `${startDate}T23:59:59.999Z`);
  }

  const { data, error } = await query;
  if (!error) {
    return { data: (data ?? []) as DailyTestingLog[], error: null };
  }

  // If select("*") failed because critical_bug column is missing, query baseline columns
  let legacyQuery = supabase
    .from("daily_testing_logs")
    .select("id, employee_id, log_date, application_name, module_name, testing_type, status, bugs_found, created_at, updated_at")
    .in("employee_id", employeeIds);

  if (endDate) {
    legacyQuery = legacyQuery.gte("log_date", startDate).lte("log_date", endDate).order("log_date", { ascending: false });
  } else {
    legacyQuery = legacyQuery.gte("log_date", startDate).lte("log_date", `${startDate}T23:59:59.999Z`);
  }

  const { data: legacyData, error: legacyError } = await legacyQuery;
  if (!legacyError && legacyData) {
    const mapped = legacyData.map((row) => ({
      ...row,
      platform: "shopify" as const,
      critical_bug: false,
      created_by: null,
      updated_by: null,
    })) as DailyTestingLog[];
    return { data: mapped, error: null };
  }

  // Fallback to legacy daily_operations table
  const legacy = await fetchLegacyOperations(supabase, startDate, endDate, employeeIds);
  if (!legacy.error) {
    return { data: (legacy.data || []).flatMap(toTestingLogs), error: null };
  }

  // If table is missing from schema cache, return empty array without error banner
  if (isSchemaCacheError(error) || isSchemaCacheError(legacyError) || isSchemaCacheError(legacy.error)) {
    return { data: [] as DailyTestingLog[], error: null };
  }

  return { data: [] as DailyTestingLog[], error: error ?? legacyError };
}

export function getDashboardDateRange(range: DashboardRange, baseDate = todayIso()) {
  const current = new Date(`${baseDate}T00:00:00.000Z`);
  if (range === "yesterday") {
    current.setUTCDate(current.getUTCDate() - 1);
    return { startDate: current.toISOString().slice(0, 10), endDate: current.toISOString().slice(0, 10), label: "Yesterday" };
  }
  if (range === "7d") {
    const start = new Date(current);
    start.setUTCDate(start.getUTCDate() - 6);
    return { startDate: start.toISOString().slice(0, 10), endDate: current.toISOString().slice(0, 10), label: "Last 7 Days" };
  }
  if (range === "month") {
    const start = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth(), 1));
    return { startDate: start.toISOString().slice(0, 10), endDate: current.toISOString().slice(0, 10), label: "This Month" };
  }
  return { startDate: baseDate, endDate: baseDate, label: "Today" };
}

function parseReportMonth(month: string) {
  const safeMonth = /^\d{4}-\d{2}$/.test(month) ? month : new Date().toISOString().slice(0, 7);
  const [yearText, monthText] = safeMonth.split("-");
  const year = Number(yearText);
  const monthNumber = Number(monthText);
  const startDate = `${yearText}-${monthText}-01`;
  const endDate = new Date(Date.UTC(year, monthNumber, 0)).toISOString().slice(0, 10);
  return {
    month: safeMonth, year, monthNumber, startDate, endDate,
    monthLabel: new Date(`${safeMonth}-01T00:00:00.000Z`).toLocaleDateString("en", { month: "long", year: "numeric" }),
    expectedWorkingDays: getExpectedWorkingDays(year, monthNumber),
  };
}

function emptyMonthlyReport(month: string, monthLabel: string, expectedWorkingDays: number, error: string | null) {
  return {
    month, monthLabel, expectedWorkingDays,
    rows: [] as MonthlyPerformanceMetrics[],
    summary: {
      month, monthLabel, expectedWorkingDays,
      totalTeamTickets: 0, totalTeamChats: 0,
      totalTestingEntries: 0, totalAppsTested: 0,
      totalBugsFound: 0, totalCriticalBugs: 0,
      averageSupportScore: 0, averageTestingScore: 0,
      averageManagerScore: 0, averageFinalScore: 0,
      bestSupportPerformer: null, bestTestingPerformer: null, overallBestPerformer: null,
    } satisfies MonthlyPerformanceSummary,
    error,
  };
}

export async function getMonthlyPerformanceReport(profile: UserProfile, month = new Date().toISOString().slice(0, 7)) {
  const reportMonth = parseReportMonth(month);
  if (!isSupabaseConfigured()) {
    return emptyMonthlyReport(reportMonth.month, reportMonth.monthLabel, reportMonth.expectedWorkingDays, "Supabase is not configured.");
  }

  const supabase = await createClient();
  const isManager = profile.role === "manager";

  const profileQuery = supabase
    .from("profiles")
    .select("id, full_name, email, shift, avatar_url, roles(name)")
    .eq("employment_status", "active")
    .order("full_name");

  const { data: profiles, error: profilesError } = isManager
    ? await profileQuery.neq("id", profile.id)
    : await profileQuery.eq("id", profile.id);

  if (profilesError) {
    return emptyMonthlyReport(reportMonth.month, reportMonth.monthLabel, reportMonth.expectedWorkingDays, profilesError.message);
  }

  const employeeIds = ((profiles ?? []) as unknown as ProfileRow[]).map((e) => e.id);
  let supportLogs: DailySupportLog[] = [];
  let testingLogs: DailyTestingLog[] = [];
  let adjustments: Array<{
    employee_id: string;
    report_month: string;
    // @deprecated - replaced by manager_points. Keep for backward compatibility.
    support_adjustment: number;
    // @deprecated - replaced by normalized rating fields. Keep for backward compatibility.
    testing_adjustment: number;
    manager_remarks: string | null;
    behavior_rating?: number | null;
    communication_rating?: number | null;
    ownership_rating?: number | null;
    discipline_rating?: number | null;
    manager_points?: number | null;
  }> = [];

  if (employeeIds.length > 0) {
    const [sr, tr, ar, subRes] = await Promise.all([
      fetchDailySupportLogsWithFallback(supabase, reportMonth.startDate, reportMonth.endDate, employeeIds),
      fetchDailyTestingLogsWithFallback(supabase, reportMonth.startDate, reportMonth.endDate, employeeIds),
      supabase.from("monthly_performance_adjustments").select("*").eq("report_month", reportMonth.startDate).in("employee_id", employeeIds),
      supabase.from("daily_report_submissions").select("employee_id, work_date, draft_payload, notes").gte("work_date", reportMonth.startDate).lte("work_date", reportMonth.endDate).in("employee_id", employeeIds),
    ]);

    if (sr.error) {
      return emptyMonthlyReport(reportMonth.month, reportMonth.monthLabel, reportMonth.expectedWorkingDays, sr.error.message);
    }
    supportLogs = sr.data;

    if (tr.error) {
      return emptyMonthlyReport(reportMonth.month, reportMonth.monthLabel, reportMonth.expectedWorkingDays, tr.error.message);
    }
    testingLogs = tr.data;

    if (ar.error && !isSchemaCacheError(ar.error)) {
      return emptyMonthlyReport(reportMonth.month, reportMonth.monthLabel, reportMonth.expectedWorkingDays, ar.error.message);
    }
    adjustments = (ar.data ?? []) as typeof adjustments;

    if (subRes.data) {
      for (const s of subRes.data) {
        const wDate = String(s.work_date).split("T")[0];
        const draft = (s.draft_payload as any) ?? {};
        const tHandled = Number(draft.tickets_handled ?? draft.tickets ?? 0);
        const cHandled = Number(draft.chats_handled ?? draft.chats ?? 0);

        const existingIdx = supportLogs.findIndex((l) => l.employee_id === s.employee_id && String(l.log_date).split("T")[0] === wDate);
        if (existingIdx >= 0) {
          if ((supportLogs[existingIdx].tickets_handled ?? 0) === 0 && (supportLogs[existingIdx].chats_handled ?? 0) === 0 && (tHandled > 0 || cHandled > 0)) {
            supportLogs[existingIdx].tickets_handled = tHandled;
            supportLogs[existingIdx].chats_handled = cHandled;
          }
        } else if (tHandled > 0 || cHandled > 0) {
          supportLogs.push({
            id: `sub-m-${s.employee_id}-${wDate}`,
            employee_id: s.employee_id,
            log_date: wDate,
            attendance_status: draft.attendance_status ?? "present",
            tickets_handled: tHandled,
            chats_handled: cHandled,
            doc_updated: Boolean(draft.doc_updated),
            feature_suggestion: Boolean(draft.feature_suggestion),
            bug_verification: Boolean(draft.bug_verification),
            asked_for_review: Boolean(draft.asked_for_review),
            got_review: Boolean(draft.got_review),
            other_contribution: Boolean(draft.other_contribution),
            support_quality: "good",
            testing_quality: "good",
            testing_notes: s.notes ?? null,
            created_by: null,
            updated_by: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      }
    }
  }

  // Group logs by employee
  const supportByEmp = new Map<string, DailySupportLog[]>();
  for (const log of supportLogs) {
    supportByEmp.set(log.employee_id, [...(supportByEmp.get(log.employee_id) ?? []), log]);
  }
  const testingByEmp = new Map<string, DailyTestingLog[]>();
  for (const log of testingLogs) {
    testingByEmp.set(log.employee_id, [...(testingByEmp.get(log.employee_id) ?? []), log]);
  }

  // Build rows: compute per-day scores, then average for the month
  const rows: MonthlyPerformanceMetrics[] = ((profiles ?? []) as unknown as ProfileRow[]).map((emp) => {
    const role = Array.isArray(emp.roles) ? emp.roles[0]?.name : emp.roles?.name ?? "support_engineer";

    const empSupportLogs = supportByEmp.get(emp.id) ?? [];
    const empTestingLogs = testingByEmp.get(emp.id) ?? [];

    // Group by date
    const supportByDate = new Map<string, DailySupportLog>();
    for (const sl of empSupportLogs) supportByDate.set(sl.log_date, sl);
    const testingByDate = new Map<string, DailyTestingLog[]>();
    for (const tl of empTestingLogs) {
      const arr = testingByDate.get(tl.log_date) ?? [];
      arr.push(tl);
      testingByDate.set(tl.log_date, arr);
    }

    const allDates = new Set<string>([...supportByDate.keys(), ...testingByDate.keys()]);

    let sumSupportQuality = 0;
    let countSupportQuality = 0;
    
    let sumTestingQuality = 0;
    let countTestingQuality = 0;

    let docUpdates = 0;
    let featureSuggestions = 0;
    let bugVerifications = 0;
    let askedForReviews = 0;
    let gotReviews = 0;
    let otherContributions = 0;

    const supportEnabled = canManageSupport(role as AppRole);
    const testingEnabled = canManageTesting(role as AppRole);

    for (const date of allDates) {
      const sl = supportByDate.get(date) ?? null;
      const tlogs = testingByDate.get(date) ?? [];

      const hasSupport = supportEnabled && sl !== null && sl.attendance_status !== "leave";
      const realTestingLogs = tlogs.filter((tl) => tl.application_name && tl.application_name !== "No Testing Assigned");
      const hasTesting = testingEnabled && realTestingLogs.length > 0;

      if (hasSupport) {
        sumSupportQuality += supportQualityToScore[sl.support_quality] ?? 3;
        countSupportQuality++;
        
        if (sl.doc_updated) docUpdates++;
        if (sl.feature_suggestion) featureSuggestions++;
        if (sl.bug_verification) bugVerifications++;
        if (sl.asked_for_review) askedForReviews++;
        if (sl.got_review) gotReviews++;
        if (sl.other_contribution) otherContributions++;
      }
      
      if (hasTesting && sl !== null) {
        sumTestingQuality += testingQualityToScore[sl.testing_quality] ?? 3;
        countTestingQuality++;
      }
    }

    const avgSupport = countSupportQuality > 0 ? round(sumSupportQuality / countSupportQuality, 2) : 0;
    const avgTesting = countTestingQuality > 0 ? round(sumTestingQuality / countTestingQuality, 2) : 0;

    // Find manager monthly adjustments
    const adj = adjustments.find((a) => a.employee_id === emp.id);

    let initiativeRating = adj?.behavior_rating ?? 3;
    let communicationRating = adj?.communication_rating ?? 3;
    let ownershipRating = adj?.ownership_rating ?? 3;
    let disciplineRating = adj?.discipline_rating ?? 3;
    let managerRemarksText = adj?.manager_remarks ?? "";

    if (managerRemarksText && managerRemarksText.startsWith("{\"ratings\":")) {
      try {
        const parsed = JSON.parse(managerRemarksText);
        if (parsed && typeof parsed === "object" && parsed.ratings) {
          managerRemarksText = parsed.remarks ?? "";
          initiativeRating = parsed.ratings.behavior ?? parsed.ratings.behaviour ?? initiativeRating;
          communicationRating = parsed.ratings.communication ?? communicationRating;
          ownershipRating = parsed.ratings.ownership ?? ownershipRating;
          disciplineRating = parsed.ratings.discipline ?? disciplineRating;
        }
      } catch {}
    }

    const managerScore = round((initiativeRating + communicationRating + ownershipRating + disciplineRating) / 4.0, 2);
    
    // Check if employee did any real work this month
    const didSupport = avgSupport > 0;
    const didTesting = avgTesting > 0;
    const finalScore = calculateMonthlyFinalScore(avgSupport, avgTesting, managerScore, didSupport, didTesting);
    const { rating, label } = getStarRating(finalScore);

    const appsTested = new Set(empTestingLogs.map((l) => l.application_name).filter((n) => n && n !== "No Testing Assigned"));
    const supportDaysFiltered = empSupportLogs.filter((l) => l.attendance_status !== "leave");

    let workingDaysCount = 0;
    for (const date of allDates) {
      const sl = supportByDate.get(date);
      if (sl && sl.attendance_status !== "leave") {
        workingDaysCount += 1.0;
      } else if (!sl && testingByDate.has(date)) {
        workingDaysCount += 1.0;
      }
    }

    const supportDaysCount = supportDaysFiltered.length;
    const testingDaysCount = new Set(empTestingLogs.filter((l) => l.application_name && l.application_name !== "No Testing Assigned").map((l) => l.log_date)).size;

    return {
      employee_id: emp.id,
      full_name: emp.full_name,
      role: role as AppRole,
      workingDays: workingDaysCount,
      supportDays: supportEnabled ? supportDaysCount : 0,
      testingDays: testingEnabled ? testingDaysCount : 0,
      supportScore: supportEnabled ? avgSupport : 0,
      testingScore: testingEnabled ? avgTesting : 0,
      managerScore,
      finalScore,
      starRating: rating,
      ratingLabel: label,
      totalTickets: supportEnabled ? empSupportLogs.reduce((s, l) => s + l.tickets_handled, 0) : 0,
      totalChats: supportEnabled ? empSupportLogs.reduce((s, l) => s + l.chats_handled, 0) : 0,
      totalTestingEntries: testingEnabled ? empTestingLogs.filter((l) => l.application_name && l.application_name !== "No Testing Assigned").length : 0,
      appsTested: testingEnabled ? appsTested.size : 0,
      bugsFound: testingEnabled ? empTestingLogs.reduce((s, l) => s + l.bugs_found, 0) : 0,
      criticalBugsFound: testingEnabled ? empTestingLogs.reduce((s, l) => s + (l.critical_bug ? 1 : 0), 0) : 0,
      docUpdates,
      featureSuggestions,
      bugVerifications,
      askedForReviews,
      gotReviews,
      otherContributions,
      managerRemarks: managerRemarksText,
      initiativeRating,
      communicationRating,
      ownershipRating,
      disciplineRating,
    };
  });

  const avg = (v: number[]) => (v.length > 0 ? round(v.reduce((s, n) => s + n, 0) / v.length, 1) : 0);
  const workRows = rows.filter((r) => r.supportDays > 0 || r.testingDays > 0);
  const supportRows = rows.filter((r) => r.supportDays > 0);
  const testingRows = rows.filter((r) => r.testingDays > 0);
  const best = (f: "supportScore" | "testingScore" | "finalScore", c = workRows) => [...c].sort((a, b) => b[f] - a[f])[0]?.full_name ?? null;

  const summary: MonthlyPerformanceSummary = {
    month: reportMonth.month, monthLabel: reportMonth.monthLabel, expectedWorkingDays: reportMonth.expectedWorkingDays,
    totalTeamTickets: rows.reduce((s, r) => s + r.totalTickets, 0),
    totalTeamChats: rows.reduce((s, r) => s + r.totalChats, 0),
    totalTestingEntries: rows.reduce((s, r) => s + r.totalTestingEntries, 0),
    totalAppsTested: rows.reduce((s, r) => s + r.appsTested, 0),
    totalBugsFound: rows.reduce((s, r) => s + r.bugsFound, 0),
    totalCriticalBugs: rows.reduce((s, r) => s + r.criticalBugsFound, 0),
    averageSupportScore: avg(supportRows.map((r) => r.supportScore)),
    averageTestingScore: avg(testingRows.map((r) => r.testingScore)),
    averageManagerScore: avg(workRows.map((r) => r.managerScore)),
    averageFinalScore: avg(workRows.map((r) => r.finalScore)),
    bestSupportPerformer: best("supportScore", supportRows),
    bestTestingPerformer: best("testingScore", testingRows),
    overallBestPerformer: best("finalScore"),
  };

  return { month: reportMonth.month, monthLabel: reportMonth.monthLabel, expectedWorkingDays: reportMonth.expectedWorkingDays, summary, rows, error: null };
}

export async function getDailyOperationsPageData(profile: UserProfile, date = todayIso()) {
  if (!isSupabaseConfigured()) {
    return { date, rows: [] as TeamMemberDailyRow[], error: "Supabase is not configured." };
  }

  const supabase = await createClient();
  const isManager = profile.role === "manager";

  const profileQuery = supabase
    .from("profiles")
    .select("id, full_name, email, shift, avatar_url, role, roles(name)")
    .eq("employment_status", "active")
    .order("full_name");

  const { data: profiles, error: profilesError } = isManager
    ? await profileQuery.neq("id", profile.id)
    : await profileQuery.eq("id", profile.id);

  if (profilesError) {
    return { date, rows: [], error: profilesError.message };
  }

  const employeeIds = ((profiles ?? []) as unknown as ProfileRow[]).map((e) => e.id);
  let supportLogs: DailySupportLog[] = [];
  let testingLogs: DailyTestingLog[] = [];
  const submissionsMap = new Set<string>();
  const subDataMap = new Map<string, any>();

  if (employeeIds.length > 0) {
    const [sr, tr, subRes] = await Promise.all([
      fetchDailySupportLogsWithFallback(supabase, date, undefined, employeeIds),
      fetchDailyTestingLogsWithFallback(supabase, date, undefined, employeeIds),
      supabase.from("daily_report_submissions").select("employee_id, draft_payload, notes").eq("work_date", date).in("employee_id", employeeIds),
    ]);

    if (sr.error) return { date, rows: [], error: sr.error.message };
    supportLogs = sr.data;

    if (tr.error) return { date, rows: [], error: tr.error.message };
    testingLogs = tr.data;

    if (subRes.data) {
      subRes.data.forEach((s) => {
        submissionsMap.add(s.employee_id);
        subDataMap.set(s.employee_id, s);
      });
    }
  }

  const supportByEmp = new Map<string, DailySupportLog>();
  for (const log of supportLogs) {
    const existing = supportByEmp.get(log.employee_id);
    if (!existing || (log.tickets_handled ?? 0) > 0 || (log.chats_handled ?? 0) > 0) {
      supportByEmp.set(log.employee_id, log);
    }
  }

  const testingByEmp = new Map<string, DailyTestingLog[]>();
  for (const log of testingLogs) {
    const existing = testingByEmp.get(log.employee_id) ?? [];
    existing.push(log);
    testingByEmp.set(log.employee_id, existing);
  }

  const rows = ((profiles ?? []) as unknown as ProfileRow[]).map((emp) => {
    const role = Array.isArray(emp.roles) ? emp.roles[0]?.name : emp.roles?.name ?? "support_engineer";
    let sLog = supportByEmp.get(emp.id) ?? null;
    if (!sLog && submissionsMap.has(emp.id)) {
      const subRec = subDataMap.get(emp.id);
      const draft = (subRec?.draft_payload as any) ?? {};
      const tHandled = Number(draft.tickets_handled ?? draft.tickets ?? 0);
      const cHandled = Number(draft.chats_handled ?? draft.chats ?? 0);

      sLog = {
        id: `sub-${emp.id}`,
        employee_id: emp.id,
        log_date: date,
        attendance_status: (draft.attendance_status as any) ?? "present",
        tickets_handled: isNaN(tHandled) ? 0 : tHandled,
        chats_handled: isNaN(cHandled) ? 0 : cHandled,
        doc_updated: Boolean(draft.doc_updated),
        feature_suggestion: Boolean(draft.feature_suggestion),
        bug_verification: Boolean(draft.bug_verification),
        asked_for_review: Boolean(draft.asked_for_review),
        got_review: Boolean(draft.got_review),
        other_contribution: Boolean(draft.other_contribution),
        support_quality: "good",
        testing_quality: "good",
        testing_notes: subRec?.notes ?? null,
        created_by: null,
        updated_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    let empTestingLogs = testingByEmp.get(emp.id) ?? [];
    if (empTestingLogs.length === 0 && submissionsMap.has(emp.id)) {
      const subRec = subDataMap.get(emp.id);
      const draft = (subRec?.draft_payload as any) ?? {};
      if (Array.isArray(draft.testing_entries) && draft.testing_entries.length > 0) {
        empTestingLogs = draft.testing_entries.map((t: any, idx: number) => ({
          id: `draft-t-${emp.id}-${idx}`,
          employee_id: emp.id,
          log_date: date,
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

    return {
      employee_id: emp.id,
      full_name: emp.full_name,
      email: emp.email,
      role: role as AppRole,
      shift: emp.shift,
      avatar_url: emp.avatar_url,
      supportLog: sLog,
      testingLogs: empTestingLogs,
    };
  });

  return { date, rows, error: null };
}

export async function getDailyOperationsDashboardData(profile: UserProfile, range: DashboardRange = "today") {
  if (!isSupabaseConfigured()) {
    return { range, startDate: todayIso(), endDate: todayIso(), rows: [] as TeamMemberDailyRow[], error: "Supabase is not configured." };
  }

  const { startDate, endDate, label } = getDashboardDateRange(range);
  const supabase = await createClient();
  const isManager = profile.role === "manager";

  const profileQuery = supabase
    .from("profiles")
    .select("id, full_name, email, shift, avatar_url, roles(name)")
    .eq("employment_status", "active")
    .order("full_name");

  const { data: profiles, error: profilesError } = isManager
    ? await profileQuery.neq("id", profile.id)
    : await profileQuery.eq("id", profile.id);

  if (profilesError) {
    return { range, startDate, endDate, rows: [], error: profilesError.message };
  }

  const employeeIds = ((profiles ?? []) as unknown as ProfileRow[]).map((e) => e.id);
  let supportLogs: DailySupportLog[] = [];
  let testingLogs: DailyTestingLog[] = [];

  if (employeeIds.length > 0) {
    const [sr, tr] = await Promise.all([
      fetchDailySupportLogsWithFallback(supabase, startDate, endDate, employeeIds),
      fetchDailyTestingLogsWithFallback(supabase, startDate, endDate, employeeIds),
    ]);

    if (sr.error) return { range, startDate, endDate, rows: [], error: sr.error.message };
    supportLogs = sr.data;

    if (tr.error) return { range, startDate, endDate, rows: [], error: tr.error.message };
    testingLogs = tr.data;
  }

  const latestSupportByEmp = new Map<string, DailySupportLog>();
  for (const log of supportLogs) {
    if (!latestSupportByEmp.has(log.employee_id)) latestSupportByEmp.set(log.employee_id, log);
  }

  const testingByEmp = new Map<string, DailyTestingLog[]>();
  for (const log of testingLogs) {
    const existing = testingByEmp.get(log.employee_id) ?? [];
    existing.push(log);
    testingByEmp.set(log.employee_id, existing);
  }

  const rows = ((profiles ?? []) as unknown as ProfileRow[]).map((emp) => {
    const role = Array.isArray(emp.roles) ? emp.roles[0]?.name : emp.roles?.name ?? "support_engineer";
    return {
      employee_id: emp.id,
      full_name: emp.full_name,
      email: emp.email,
      role: role as AppRole,
      shift: emp.shift,
      avatar_url: emp.avatar_url,
      supportLog: latestSupportByEmp.get(emp.id) ?? null,
      testingLogs: testingByEmp.get(emp.id) ?? [],
    };
  });

  return { range, rangeLabel: label, startDate, endDate, rows, error: null };
}

export type TeamMemberMonthlyLogsRow = {
  employee_id: string;
  full_name: string;
  email: string;
  role: AppRole;
  shift: Shift;
  avatar_url: string | null;
  supportLogs: DailySupportLog[];
  testingLogs: DailyTestingLog[];
};

export async function getDailyOperationsMonthData(
  profile: UserProfile,
  month = new Date().toISOString().slice(0, 7),
) {
  const reportMonth = parseReportMonth(month);
  if (!isSupabaseConfigured()) {
    return { month, rows: [] as TeamMemberMonthlyLogsRow[], error: "Supabase is not configured." };
  }

  const supabase = await createClient();
  const isManager = profile.role === "manager";

  const profileQuery = supabase
    .from("profiles")
    .select("id, full_name, email, shift, avatar_url, role, roles(name)")
    .eq("employment_status", "active")
    .order("full_name");

  const { data: profiles, error: profilesError } = isManager
    ? await profileQuery.neq("id", profile.id)
    : await profileQuery.eq("id", profile.id);

  if (profilesError) {
    return { month, rows: [] as TeamMemberMonthlyLogsRow[], error: profilesError.message };
  }

  const employeeIds = ((profiles ?? []) as unknown as ProfileRow[]).map((e) => e.id);
  let supportLogs: DailySupportLog[] = [];
  let testingLogs: DailyTestingLog[] = [];

  if (employeeIds.length > 0) {
    const [sr, tr] = await Promise.all([
      fetchDailySupportLogsWithFallback(supabase, reportMonth.startDate, reportMonth.endDate, employeeIds),
      fetchDailyTestingLogsWithFallback(supabase, reportMonth.startDate, reportMonth.endDate, employeeIds),
    ]);

    if (sr.error) return { month, rows: [] as TeamMemberMonthlyLogsRow[], error: sr.error.message };
    supportLogs = sr.data;

    if (tr.error) return { month, rows: [] as TeamMemberMonthlyLogsRow[], error: tr.error.message };
    testingLogs = tr.data;
  }

  const rows = ((profiles ?? []) as unknown as ProfileRow[]).map((emp) => {
    const role = Array.isArray(emp.roles) ? emp.roles[0]?.name : emp.roles?.name ?? "support_engineer";
    return {
      employee_id: emp.id,
      full_name: emp.full_name,
      email: emp.email,
      role: role as AppRole,
      shift: emp.shift,
      avatar_url: emp.avatar_url,
      supportLogs: supportLogs.filter((l) => l.employee_id === emp.id),
      testingLogs: testingLogs.filter((l) => l.employee_id === emp.id),
    };
  });

  return { month: reportMonth.month, monthLabel: reportMonth.monthLabel, rows, error: null };
}

export type DashboardTrendData = {
  date: string;
  tickets: number;
  chats: number;
  testingEntries: number;
  bugsFound: number;
  present: number;
  wfh: number;
  leave: number;
};

export async function getDashboardTrendData(profile: UserProfile, days: number = 14) {
  if (!isSupabaseConfigured()) {
    return { data: [], error: "Supabase is not configured." };
  }

  const supabase = await createClient();
  const isManager = profile.role === "manager";

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days + 1);

  const startIso = startDate.toISOString().split("T")[0];
  const endIso = endDate.toISOString().split("T")[0];

  const profileQuery = supabase
    .from("profiles")
    .select("id")
    .eq("employment_status", "active");

  const { data: profiles, error: profilesError } = isManager
    ? await profileQuery.neq("id", profile.id)
    : await profileQuery.eq("id", profile.id);

  if (profilesError) {
    return { data: [], error: profilesError.message };
  }

  const employeeIds = ((profiles ?? []) as unknown as ProfileRow[]).map((p) => p.id);
  
  if (employeeIds.length === 0) {
    return { data: [], error: null };
  }

  let supportLogs: DailySupportLog[] = [];
  let testingLogs: DailyTestingLog[] = [];

  const [sr, tr] = await Promise.all([
    fetchDailySupportLogsWithFallback(supabase, startIso, endIso, employeeIds),
    fetchDailyTestingLogsWithFallback(supabase, startIso, endIso, employeeIds),
  ]);

  if (!sr.error) supportLogs = sr.data;
  if (!tr.error) testingLogs = tr.data;

  const dates: string[] = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split("T")[0]);
  }

  const trendData: DashboardTrendData[] = dates.map(dateStr => {
    const sLogs = supportLogs.filter(l => l.log_date === dateStr);
    const tLogs = testingLogs.filter(l => l.log_date === dateStr);
    
    return {
      date: dateStr,
      tickets: sLogs.reduce((sum, l) => sum + (l.tickets_handled ?? 0), 0),
      chats: sLogs.reduce((sum, l) => sum + (l.chats_handled ?? 0), 0),
      testingEntries: tLogs.length,
      bugsFound: tLogs.reduce((sum, l) => sum + (l.bugs_found ?? 0), 0),
      present: sLogs.filter(l => l.attendance_status === "present").length,
      wfh: sLogs.filter(l => l.attendance_status === "wfh").length,
      leave: sLogs.filter(l => l.attendance_status === "leave").length,
    };
  });

  return { data: trendData, error: null };
}
