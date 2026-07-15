import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { canManageSupport, canManageTesting, type AppRole, type UserProfile } from "@/lib/auth/roles";
import type { Shift } from "@/features/employees/types";
import type { DailySupportLog, DailyTestingLog, TeamMemberDailyRow, TestingQuality } from "./types";
import {
  calculateDailyFinalScore,
  calculateDailySupportScore,
  calculateDailyTestingScore,
  getExpectedWorkingDays,
  getStarRating,
  round,
  clamp,
  type MonthlyPerformanceMetrics,
  type MonthlyPerformanceSummary,
} from "./performance";
import { testingQualityToScore } from "./types";

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
  return new Date().toISOString().slice(0, 10);
}

export type DashboardRange = "today" | "yesterday" | "7d" | "month";

function isSchemaCacheError(error: { message?: string } | null) {
  if (!error?.message) {
    return false;
  }
  return /Could not find the table|relation "[^"]+" does not exist|invalid schema/i.test(error.message);
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
    notes: null,
    work_focus: null,
    day_status: null,
    daily_remarks: null,
    ticket_rating: null,
    chat_rating: null,
    documentation_rating: null,
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
      critical_bugs_found: 0,
      testing_quality: "good",
      task_completion: 5,
      started_at: null,
      ended_at: null,
      notes: legacy.current_testing_task ?? null,
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
      averageDailyScore: 0, averageFinalScore: 0,
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
    const [sr, tr, ar] = await Promise.all([
      supabase.from("daily_support_logs").select("*").gte("log_date", reportMonth.startDate).lte("log_date", reportMonth.endDate).in("employee_id", employeeIds),
      supabase.from("daily_testing_logs").select("*").gte("log_date", reportMonth.startDate).lte("log_date", reportMonth.endDate).in("employee_id", employeeIds),
      supabase.from("monthly_performance_adjustments").select("*").eq("report_month", reportMonth.startDate).in("employee_id", employeeIds),
    ]);

    if (sr.error && isSchemaCacheError(sr.error)) {
      const legacy = await fetchLegacyOperations(supabase, reportMonth.startDate, reportMonth.endDate, employeeIds);
      if (legacy.error) return emptyMonthlyReport(reportMonth.month, reportMonth.monthLabel, reportMonth.expectedWorkingDays, legacy.error.message);
      supportLogs = legacy.data.map(toSupportLog);
    } else if (sr.error) {
      return emptyMonthlyReport(reportMonth.month, reportMonth.monthLabel, reportMonth.expectedWorkingDays, sr.error.message);
    } else {
      supportLogs = (sr.data ?? []) as DailySupportLog[];
    }

    if (tr.error && isSchemaCacheError(tr.error)) {
      const legacy = await fetchLegacyOperations(supabase, reportMonth.startDate, reportMonth.endDate, employeeIds);
      if (legacy.error) return emptyMonthlyReport(reportMonth.month, reportMonth.monthLabel, reportMonth.expectedWorkingDays, legacy.error.message);
      testingLogs = legacy.data.flatMap(toTestingLogs);
    } else if (tr.error) {
      return emptyMonthlyReport(reportMonth.month, reportMonth.monthLabel, reportMonth.expectedWorkingDays, tr.error.message);
    } else {
      testingLogs = (tr.data ?? []) as DailyTestingLog[];
    }

    if (ar.error && !isSchemaCacheError(ar.error)) {
      return emptyMonthlyReport(reportMonth.month, reportMonth.monthLabel, reportMonth.expectedWorkingDays, ar.error.message);
    }
    adjustments = (ar.data ?? []) as typeof adjustments;
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

    // Compute per-day scores
    const dailySupportScores: number[] = [];
    const dailyTestingScores: number[] = [];
    const dailyFinalScores: number[] = [];

    for (const date of allDates) {
      const sl = supportByDate.get(date) ?? null;
      const tlogs = testingByDate.get(date) ?? [];

      const hasSupport = canManageSupport(role as AppRole) && sl !== null && sl.attendance_status !== "leave";
      // Testing entries that are not "No Testing Assigned" count as real testing work
      const realTestingLogs = tlogs.filter((tl) => tl.application_name && tl.application_name !== "No Testing Assigned");
      const hasTesting = canManageTesting(role as AppRole) && realTestingLogs.length > 0;

      if (hasSupport) {
        const supportScore = calculateDailySupportScore(
          sl!.ticket_rating,
          sl!.chat_rating,
          sl!.documentation_rating,
        );
        dailySupportScores.push(supportScore);

        if (hasTesting) {
          const taskRatings = realTestingLogs.map((tl) => tl.task_completion ?? 5);
          const qualityScores = realTestingLogs.map((tl) => testingQualityToScore[tl.testing_quality] ?? 3);
          const testingScore = calculateDailyTestingScore(taskRatings, qualityScores);
          dailyTestingScores.push(testingScore);
          dailyFinalScores.push(calculateDailyFinalScore(supportScore, testingScore, true, true));
        } else {
          dailyFinalScores.push(calculateDailyFinalScore(supportScore, 0, true, false));
        }
      } else if (hasTesting) {
        const taskRatings = realTestingLogs.map((tl) => tl.task_completion ?? 5);
        const qualityScores = realTestingLogs.map((tl) => testingQualityToScore[tl.testing_quality] ?? 3);
        const testingScore = calculateDailyTestingScore(taskRatings, qualityScores);
        dailyTestingScores.push(testingScore);
        dailyFinalScores.push(calculateDailyFinalScore(0, testingScore, false, true));
      }
    }

    const avgSupport = dailySupportScores.length > 0
      ? round(dailySupportScores.reduce((a, b) => a + b, 0) / dailySupportScores.length, 2) : 0;
    const avgTesting = dailyTestingScores.length > 0
      ? round(dailyTestingScores.reduce((a, b) => a + b, 0) / dailyTestingScores.length, 2) : 0;
    const avgDaily = dailyFinalScores.length > 0
      ? round(dailyFinalScores.reduce((a, b) => a + b, 0) / dailyFinalScores.length, 2) : 0;

    // Find manager monthly adjustments
    const adj = adjustments.find((a) => a.employee_id === emp.id);

    // Normalize rating values from DB columns with JSON remark parsing fallback for old entries
    let managerPoints = adj?.manager_points ?? adj?.support_adjustment ?? 0;
    let behaviorRating = adj?.behavior_rating ?? 3;
    let communicationRating = adj?.communication_rating ?? 3;
    let ownershipRating = adj?.ownership_rating ?? 3;
    let disciplineRating = adj?.discipline_rating ?? 3;
    let managerRemarksText = adj?.manager_remarks ?? "";

    if (managerRemarksText && managerRemarksText.startsWith("{\"ratings\":")) {
      try {
        const parsed = JSON.parse(managerRemarksText);
        if (parsed && typeof parsed === "object" && parsed.ratings) {
          managerRemarksText = parsed.remarks ?? "";
          behaviorRating = parsed.ratings.behavior ?? parsed.ratings.behaviour ?? behaviorRating;
          communicationRating = parsed.ratings.communication ?? communicationRating;
          ownershipRating = parsed.ratings.ownership ?? ownershipRating;
          disciplineRating = parsed.ratings.discipline ?? disciplineRating;
        }
      } catch {}
    }

    const adjustmentEffect = managerPoints / 20.0;
    const finalScore = clamp(round(avgDaily + adjustmentEffect, 2), 1.0, 5.0);
    const { rating, label } = getStarRating(finalScore);

    const appsTested = new Set(empTestingLogs.map((l) => l.application_name).filter((n) => n && n !== "No Testing Assigned"));
    const supportEnabled = canManageSupport(role as AppRole);
    const testingEnabled = canManageTesting(role as AppRole);

    return {
      employee_id: emp.id,
      full_name: emp.full_name,
      role: role as AppRole,
      workingDays: allDates.size,
      supportDays: supportEnabled ? empSupportLogs.filter((l) => l.attendance_status !== "leave").length : 0,
      testingDays: testingEnabled ? new Set(empTestingLogs.filter((l) => l.application_name && l.application_name !== "No Testing Assigned").map((l) => l.log_date)).size : 0,
      supportScore: supportEnabled ? avgSupport : 0,
      testingScore: testingEnabled ? avgTesting : 0,
      averageDailyScore: avgDaily,
      finalScore,
      starRating: rating,
      ratingLabel: label,
      totalTickets: supportEnabled ? empSupportLogs.reduce((s, l) => s + l.tickets_handled, 0) : 0,
      totalChats: supportEnabled ? empSupportLogs.reduce((s, l) => s + l.chats_handled, 0) : 0,
      totalTestingEntries: testingEnabled ? empTestingLogs.filter((l) => l.application_name && l.application_name !== "No Testing Assigned").length : 0,
      appsTested: testingEnabled ? appsTested.size : 0,
      bugsFound: testingEnabled ? empTestingLogs.reduce((s, l) => s + l.bugs_found, 0) : 0,
      criticalBugsFound: testingEnabled ? empTestingLogs.reduce((s, l) => s + l.critical_bugs_found, 0) : 0,
      // @deprecated - replaced by managerPoints. Keep for backward compatibility.
      supportAdjustment: managerPoints,
      // @deprecated - replaced by normalized rating fields. Keep for backward compatibility.
      testingAdjustment: 0,
      managerRemarks: managerRemarksText,
      behaviorRating,
      communicationRating,
      ownershipRating,
      disciplineRating,
      managerPoints,
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
    averageDailyScore: avg(workRows.map((r) => r.averageDailyScore)),
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
    .select("id, full_name, email, shift, avatar_url, roles(name)")
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

  if (employeeIds.length > 0) {
    const [sr, tr] = await Promise.all([
      supabase.from("daily_support_logs").select("*").eq("log_date", date).in("employee_id", employeeIds),
      supabase.from("daily_testing_logs").select("*").eq("log_date", date).in("employee_id", employeeIds),
    ]);

    if (sr.error && isSchemaCacheError(sr.error)) {
      const legacy = await fetchLegacyOperations(supabase, date, undefined, employeeIds);
      if (legacy.error) return { date, rows: [], error: legacy.error.message };
      supportLogs = legacy.data.map(toSupportLog);
    } else if (sr.error) {
      return { date, rows: [], error: sr.error.message };
    } else {
      supportLogs = (sr.data ?? []) as DailySupportLog[];
    }

    if (tr.error && isSchemaCacheError(tr.error)) {
      const legacy = await fetchLegacyOperations(supabase, date, undefined, employeeIds);
      if (legacy.error) return { date, rows: [], error: legacy.error.message };
      testingLogs = legacy.data.flatMap(toTestingLogs);
    } else if (tr.error) {
      return { date, rows: [], error: tr.error.message };
    } else {
      testingLogs = (tr.data ?? []) as DailyTestingLog[];
    }
  }

  const supportByEmp = new Map(supportLogs.map((l) => [l.employee_id, l]));
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
      supportLog: supportByEmp.get(emp.id) ?? null,
      testingLogs: testingByEmp.get(emp.id) ?? [],
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
      supabase.from("daily_support_logs").select("*").gte("log_date", startDate).lte("log_date", endDate).in("employee_id", employeeIds).order("log_date", { ascending: false }),
      supabase.from("daily_testing_logs").select("*").gte("log_date", startDate).lte("log_date", endDate).in("employee_id", employeeIds).order("log_date", { ascending: false }),
    ]);

    if (sr.error && isSchemaCacheError(sr.error)) {
      const legacy = await fetchLegacyOperations(supabase, startDate, endDate, employeeIds);
      if (legacy.error) return { range, startDate, endDate, rows: [], error: legacy.error.message };
      supportLogs = legacy.data.map(toSupportLog);
    } else if (sr.error) {
      return { range, startDate, endDate, rows: [], error: sr.error.message };
    } else {
      supportLogs = (sr.data ?? []) as DailySupportLog[];
    }

    if (tr.error && isSchemaCacheError(tr.error)) {
      const legacy = await fetchLegacyOperations(supabase, startDate, endDate, employeeIds);
      if (legacy.error) return { range, startDate, endDate, rows: [], error: legacy.error.message };
      testingLogs = legacy.data.flatMap(toTestingLogs);
    } else if (tr.error) {
      return { range, startDate, endDate, rows: [], error: tr.error.message };
    } else {
      testingLogs = (tr.data ?? []) as DailyTestingLog[];
    }
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
