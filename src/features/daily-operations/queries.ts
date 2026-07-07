import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { AppRole, UserProfile } from "@/lib/auth/roles";
import type { Shift } from "@/features/employees/types";
import type { DailySupportLog, DailyTestingLog, TeamMemberDailyRow } from "./types";
import {
  calculateFinalScore,
  calculateSupportScore,
  calculateTestingScore,
  getExpectedWorkingDays,
  round,
  type MonthlyPerformanceMetrics,
  type MonthlyPerformanceSummary,
  type TeamAverages,
} from "./performance";

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
    created_by: null,
    updated_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function toTestingLog(legacy: LegacyOperation): DailyTestingLog {
  return {
    id: legacy.id,
    employee_id: legacy.employee_id,
    log_date: legacy.operation_date,
    application_name: "",
    module_name: "",
    testing_task: legacy.current_testing_task ?? "",
    testing_type: "functional",
    status: legacy.current_testing_task ? "completed" : "in_progress",
    bugs_found: 0,
    critical_bugs_found: 0,
    notes: null,
    created_by: null,
    updated_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
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
    return {
      startDate: current.toISOString().slice(0, 10),
      endDate: current.toISOString().slice(0, 10),
      label: "Yesterday",
    };
  }

  if (range === "7d") {
    const start = new Date(current);
    start.setUTCDate(start.getUTCDate() - 6);
    return {
      startDate: start.toISOString().slice(0, 10),
      endDate: current.toISOString().slice(0, 10),
      label: "Last 7 Days",
    };
  }

  if (range === "month") {
    const start = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth(), 1));
    return {
      startDate: start.toISOString().slice(0, 10),
      endDate: current.toISOString().slice(0, 10),
      label: "This Month",
    };
  }

  return {
    startDate: baseDate,
    endDate: baseDate,
    label: "Today",
  };
}

export type MonthlyReportRow = {
  employee_id: string;
  full_name: string;
  tickets: number;
  chats: number;
  entries: number;
  testingNotes: number;
};

type MonthlyAdjustmentRow = {
  employee_id: string;
  report_month: string;
  support_adjustment: number;
  testing_adjustment: number;
  manager_remarks: string | null;
};

function parseReportMonth(month: string) {
  const safeMonth = /^\d{4}-\d{2}$/.test(month) ? month : new Date().toISOString().slice(0, 7);
  const [yearText, monthText] = safeMonth.split("-");
  const year = Number(yearText);
  const monthNumber = Number(monthText);
  const startDate = `${yearText}-${monthText}-01`;
  const endDate = new Date(Date.UTC(year, monthNumber, 0)).toISOString().slice(0, 10);

  return {
    month: safeMonth,
    year,
    monthNumber,
    startDate,
    endDate,
    monthLabel: new Date(`${safeMonth}-01T00:00:00.000Z`).toLocaleDateString("en", { month: "long", year: "numeric" }),
    expectedWorkingDays: getExpectedWorkingDays(year, monthNumber),
  };
}

function emptyMonthlyReport(month: string, monthLabel: string, expectedWorkingDays: number, error: string | null) {
  return {
    month,
    monthLabel,
    expectedWorkingDays,
    rows: [] as MonthlyPerformanceMetrics[],
    summary: {
      month,
      monthLabel,
      totalTeamTickets: 0,
      totalTeamChats: 0,
      totalTestingTasks: 0,
      totalBugsFound: 0,
      averageSupportScore: 0,
      averageTestingScore: 0,
      averageFinalScore: 0,
      bestSupportPerformer: null,
      bestTestingPerformer: null,
      overallBestPerformer: null,
      expectedWorkingDays,
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

  const employeeIds = ((profiles ?? []) as unknown as ProfileRow[]).map((employee) => employee.id);
  let supportLogs: DailySupportLog[] = [];
  let testingLogs: DailyTestingLog[] = [];
  let adjustments: MonthlyAdjustmentRow[] = [];

  if (employeeIds.length > 0) {
    const [{ data: supportData, error: supportError }, { data: testingData, error: testingError }, { data: adjustmentData, error: adjustmentError }] = await Promise.all([
      supabase.from("daily_support_logs").select("*").gte("log_date", reportMonth.startDate).lte("log_date", reportMonth.endDate).in("employee_id", employeeIds),
      supabase.from("daily_testing_logs").select("*").gte("log_date", reportMonth.startDate).lte("log_date", reportMonth.endDate).in("employee_id", employeeIds),
      supabase.from("monthly_performance_adjustments").select("*").eq("report_month", reportMonth.startDate).in("employee_id", employeeIds),
    ]);

    if (supportError && isSchemaCacheError(supportError)) {
      const legacy = await fetchLegacyOperations(supabase, reportMonth.startDate, reportMonth.endDate, employeeIds);
      if (legacy.error) {
        return emptyMonthlyReport(reportMonth.month, reportMonth.monthLabel, reportMonth.expectedWorkingDays, legacy.error.message);
      }
      supportLogs = legacy.data.map(toSupportLog);
    } else if (supportError) {
      return emptyMonthlyReport(reportMonth.month, reportMonth.monthLabel, reportMonth.expectedWorkingDays, supportError.message);
    } else {
      supportLogs = (supportData ?? []) as DailySupportLog[];
    }

    if (testingError && isSchemaCacheError(testingError)) {
      const legacy = await fetchLegacyOperations(supabase, reportMonth.startDate, reportMonth.endDate, employeeIds);
      if (legacy.error) {
        return emptyMonthlyReport(reportMonth.month, reportMonth.monthLabel, reportMonth.expectedWorkingDays, legacy.error.message);
      }
      testingLogs = legacy.data.map(toTestingLog);
    } else if (testingError) {
      return emptyMonthlyReport(reportMonth.month, reportMonth.monthLabel, reportMonth.expectedWorkingDays, testingError.message);
    } else {
      testingLogs = (testingData ?? []) as DailyTestingLog[];
    }

    if (!(supportError && isSchemaCacheError(supportError)) || !(testingError && isSchemaCacheError(testingError))) {
      const legacy = await fetchLegacyOperations(supabase, reportMonth.startDate, reportMonth.endDate, employeeIds);
      if (!legacy.error) {
        const supportKeys = new Set(supportLogs.map((log) => `${log.employee_id}:${log.log_date}`));
        const testingKeys = new Set(testingLogs.map((log) => `${log.employee_id}:${log.log_date}`));

        for (const legacyLog of legacy.data) {
          const key = `${legacyLog.employee_id}:${legacyLog.operation_date}`;
          if (!supportKeys.has(key)) {
            supportLogs.push(toSupportLog(legacyLog));
            supportKeys.add(key);
          }

          if (legacyLog.current_testing_task && !testingKeys.has(key)) {
            testingLogs.push(toTestingLog(legacyLog));
            testingKeys.add(key);
          }
        }
      }
    }

    if (!adjustmentError || !isSchemaCacheError(adjustmentError)) {
      if (adjustmentError) {
        return emptyMonthlyReport(reportMonth.month, reportMonth.monthLabel, reportMonth.expectedWorkingDays, adjustmentError.message);
      }
      adjustments = (adjustmentData ?? []) as MonthlyAdjustmentRow[];
    }
  }

  const supportLogsByEmployee = new Map<string, DailySupportLog[]>();
  for (const log of supportLogs) {
    supportLogsByEmployee.set(log.employee_id, [...(supportLogsByEmployee.get(log.employee_id) ?? []), log]);
  }

  const testingLogsByEmployee = new Map<string, DailyTestingLog[]>();
  for (const log of testingLogs) {
    testingLogsByEmployee.set(log.employee_id, [...(testingLogsByEmployee.get(log.employee_id) ?? []), log]);
  }
  const adjustmentsByEmployee = new Map(adjustments.map((adjustment) => [adjustment.employee_id, adjustment]));
  const baseRows = ((profiles ?? []) as unknown as ProfileRow[]).map((employee) => {
    const roleRelation = Array.isArray(employee.roles) ? employee.roles[0] : employee.roles;
    const employeeSupportLogs = supportLogsByEmployee.get(employee.id) ?? [];
    const employeeTestingLogs = testingLogsByEmployee.get(employee.id) ?? [];
    const activeSupportLogs = employeeSupportLogs.filter((log) => log.attendance_status !== "leave");
    const supportDays = activeSupportLogs.length;
    const testingDays = employeeTestingLogs.length;
    const totalTickets = activeSupportLogs.reduce((sum, log) => sum + log.tickets_handled, 0);
    const totalChats = activeSupportLogs.reduce((sum, log) => sum + log.chats_handled, 0);
    const totalTestingTasks = employeeTestingLogs.filter((log) => log.testing_task.trim()).length;
    const completedTestingTasks = employeeTestingLogs.filter((log) => log.status === "completed").length;
    const bugsFound = employeeTestingLogs.reduce((sum, log) => sum + log.bugs_found, 0);
    const criticalBugsFound = employeeTestingLogs.reduce((sum, log) => sum + log.critical_bugs_found, 0);

    return {
      employee_id: employee.id,
      full_name: employee.full_name,
      role: roleRelation?.name ?? "support_engineer",
      supportDays,
      testingDays,
      totalTickets,
      totalChats,
      avgTicketsPerSupportDay: supportDays > 0 ? round(totalTickets / supportDays, 1) : 0,
      avgChatsPerSupportDay: supportDays > 0 ? round(totalChats / supportDays, 1) : 0,
      totalTestingTasks,
      completedTestingTasks,
      bugsFound,
      criticalBugsFound,
      supportScore: 0,
      testingScore: 0,
      finalScore: 0,
      managerAdjustmentSupport: adjustmentsByEmployee.get(employee.id)?.support_adjustment ?? 0,
      managerAdjustmentTesting: adjustmentsByEmployee.get(employee.id)?.testing_adjustment ?? 0,
      managerRemarks: adjustmentsByEmployee.get(employee.id)?.manager_remarks ?? "",
    };
  });

  const totalSupportDays = baseRows.reduce((sum, row) => sum + row.supportDays, 0);
  const totalTestingDays = baseRows.reduce((sum, row) => sum + row.testingDays, 0);
  const teamAverages: TeamAverages = {
    averageTicketsPerSupportDay: totalSupportDays > 0 ? baseRows.reduce((sum, row) => sum + row.totalTickets, 0) / totalSupportDays : 0,
    averageChatsPerSupportDay: totalSupportDays > 0 ? baseRows.reduce((sum, row) => sum + row.totalChats, 0) / totalSupportDays : 0,
    averageBugsFoundPerTestingDay: totalTestingDays > 0 ? baseRows.reduce((sum, row) => sum + row.bugsFound, 0) / totalTestingDays : 0,
    averageCriticalBugsFoundPerTestingDay: totalTestingDays > 0 ? baseRows.reduce((sum, row) => sum + row.criticalBugsFound, 0) / totalTestingDays : 0,
  };

  const rows = baseRows.map((row) => {
    const supportScore = calculateSupportScore(
      row.supportDays,
      row.avgTicketsPerSupportDay,
      row.avgChatsPerSupportDay,
      teamAverages,
      reportMonth.expectedWorkingDays,
      row.managerAdjustmentSupport,
    );
    const testingScore = calculateTestingScore(
      row.testingDays,
      row.totalTestingTasks,
      row.completedTestingTasks,
      row.bugsFound,
      row.criticalBugsFound,
      teamAverages,
      reportMonth.expectedWorkingDays,
      row.managerAdjustmentTesting,
    );
    const finalScore = row.role === "qa_engineer"
      ? testingScore
      : calculateFinalScore(supportScore, testingScore, row.supportDays, row.testingDays, reportMonth.expectedWorkingDays);

    return {
      ...row,
      supportScore,
      testingScore,
      finalScore,
    };
  });

  const average = (values: number[]) => (values.length > 0 ? round(values.reduce((sum, value) => sum + value, 0) / values.length, 1) : 0);
  const supportRows = rows.filter((row) => row.role !== "qa_engineer");
  const bestBy = (field: "supportScore" | "testingScore" | "finalScore", candidates = rows) => [...candidates].sort((a, b) => b[field] - a[field])[0]?.full_name ?? null;
  const summary: MonthlyPerformanceSummary = {
    month: reportMonth.month,
    monthLabel: reportMonth.monthLabel,
    totalTeamTickets: rows.reduce((sum, row) => sum + row.totalTickets, 0),
    totalTeamChats: rows.reduce((sum, row) => sum + row.totalChats, 0),
    totalTestingTasks: rows.reduce((sum, row) => sum + row.totalTestingTasks, 0),
    totalBugsFound: rows.reduce((sum, row) => sum + row.bugsFound, 0),
    averageSupportScore: average(supportRows.map((row) => row.supportScore)),
    averageTestingScore: average(rows.map((row) => row.testingScore)),
    averageFinalScore: average(rows.map((row) => row.finalScore)),
    bestSupportPerformer: bestBy("supportScore", supportRows),
    bestTestingPerformer: bestBy("testingScore"),
    overallBestPerformer: bestBy("finalScore"),
    expectedWorkingDays: reportMonth.expectedWorkingDays,
  };

  return {
    month: reportMonth.month,
    monthLabel: reportMonth.monthLabel,
    expectedWorkingDays: reportMonth.expectedWorkingDays,
    summary,
    rows,
    error: null,
  };
}

export async function getDailyOperationsPageData(profile: UserProfile, date = todayIso()) {
  if (!isSupabaseConfigured()) {
    return {
      date,
      rows: [] as TeamMemberDailyRow[],
      error: "Supabase is not configured.",
    };
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
    return { date, rows: [], myOperation: null, error: profilesError.message };
  }

  const employeeIds = ((profiles ?? []) as unknown as ProfileRow[]).map((employee) => employee.id);
  let supportLogs: DailySupportLog[] = [];
  let testingLogs: DailyTestingLog[] = [];

  if (employeeIds.length > 0) {
    const [{ data: supportData, error: supportError }, { data: testingData, error: testingError }] = await Promise.all([
      supabase.from("daily_support_logs").select("*").eq("log_date", date).in("employee_id", employeeIds),
      supabase.from("daily_testing_logs").select("*").eq("log_date", date).in("employee_id", employeeIds),
    ]);

    if (supportError && isSchemaCacheError(supportError)) {
      const legacy = await fetchLegacyOperations(supabase, date, undefined, employeeIds);
      if (legacy.error) {
        return { date, rows: [], error: legacy.error.message };
      }
      supportLogs = legacy.data.map(toSupportLog);
    } else if (supportError) {
      return { date, rows: [], error: supportError.message };
    } else {
      supportLogs = (supportData ?? []) as DailySupportLog[];
    }

    if (testingError && isSchemaCacheError(testingError)) {
      const legacy = await fetchLegacyOperations(supabase, date, undefined, employeeIds);
      if (legacy.error) {
        return { date, rows: [], error: legacy.error.message };
      }
      testingLogs = legacy.data.map(toTestingLog);
    } else if (testingError) {
      return { date, rows: [], error: testingError.message };
    } else {
      testingLogs = (testingData ?? []) as DailyTestingLog[];
    }
  }

  const supportLogByEmployee = new Map(supportLogs.map((log) => [log.employee_id, log]));
  const testingLogByEmployee = new Map(testingLogs.map((log) => [log.employee_id, log]));
  const rows = ((profiles ?? []) as unknown as ProfileRow[]).map((employee) => {
    const roleRelation = Array.isArray(employee.roles) ? employee.roles[0] : employee.roles;
    return {
      employee_id: employee.id,
      full_name: employee.full_name,
      email: employee.email,
      role: roleRelation?.name ?? "support_engineer",
      shift: employee.shift,
      avatar_url: employee.avatar_url,
      supportLog: supportLogByEmployee.get(employee.id) ?? null,
      testingLog: testingLogByEmployee.get(employee.id) ?? null,
    };
  });

  return {
    date,
    rows,
    error: null,
  };
}

export async function getDailyOperationsDashboardData(profile: UserProfile, range: DashboardRange = "today") {
  if (!isSupabaseConfigured()) {
    return {
      range,
      startDate: todayIso(),
      endDate: todayIso(),
      rows: [] as TeamMemberDailyRow[],
      error: "Supabase is not configured.",
    };
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

  const employeeIds = ((profiles ?? []) as unknown as ProfileRow[]).map((employee) => employee.id);
  let supportLogs: DailySupportLog[] = [];
  let testingLogs: DailyTestingLog[] = [];

  if (employeeIds.length > 0) {
    const [{ data: supportData, error: supportError }, { data: testingData, error: testingError }] = await Promise.all([
      supabase.from("daily_support_logs").select("*").gte("log_date", startDate).lte("log_date", endDate).in("employee_id", employeeIds).order("log_date", { ascending: false }),
      supabase.from("daily_testing_logs").select("*").gte("log_date", startDate).lte("log_date", endDate).in("employee_id", employeeIds).order("log_date", { ascending: false }),
    ]);

    if (supportError && isSchemaCacheError(supportError)) {
      const legacy = await fetchLegacyOperations(supabase, startDate, endDate, employeeIds);
      if (legacy.error) {
        return { range, startDate, endDate, rows: [], error: legacy.error.message };
      }
      supportLogs = legacy.data.map(toSupportLog);
    } else if (supportError) {
      return { range, startDate, endDate, rows: [], error: supportError.message };
    } else {
      supportLogs = (supportData ?? []) as DailySupportLog[];
    }

    if (testingError && isSchemaCacheError(testingError)) {
      const legacy = await fetchLegacyOperations(supabase, startDate, endDate, employeeIds);
      if (legacy.error) {
        return { range, startDate, endDate, rows: [], error: legacy.error.message };
      }
      testingLogs = legacy.data.map(toTestingLog);
    } else if (testingError) {
      return { range, startDate, endDate, rows: [], error: testingError.message };
    } else {
      testingLogs = (testingData ?? []) as DailyTestingLog[];
    }
  }

  const latestSupportLogByEmployee = new Map<string, DailySupportLog>();
  for (const log of supportLogs) {
    if (!latestSupportLogByEmployee.has(log.employee_id)) {
      latestSupportLogByEmployee.set(log.employee_id, log);
    }
  }

  const latestTestingLogByEmployee = new Map<string, DailyTestingLog>();
  for (const log of testingLogs) {
    if (!latestTestingLogByEmployee.has(log.employee_id)) {
      latestTestingLogByEmployee.set(log.employee_id, log);
    }
  }

  const rows = ((profiles ?? []) as unknown as ProfileRow[]).map((employee) => {
    const roleRelation = Array.isArray(employee.roles) ? employee.roles[0] : employee.roles;
    return {
      employee_id: employee.id,
      full_name: employee.full_name,
      email: employee.email,
      role: roleRelation?.name ?? "support_engineer",
      shift: employee.shift,
      avatar_url: employee.avatar_url,
      supportLog: latestSupportLogByEmployee.get(employee.id) ?? null,
      testingLog: latestTestingLogByEmployee.get(employee.id) ?? null,
    };
  });

  return {
    range,
    rangeLabel: label,
    startDate,
    endDate,
    rows,
    error: null,
  };
}
