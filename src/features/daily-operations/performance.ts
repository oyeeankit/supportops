import type { AppRole } from "@/lib/auth/roles";

export type MonthlyPerformanceMetrics = {
  employee_id: string;
  full_name: string;
  role: AppRole;
  supportDays: number;
  testingDays: number;
  totalTickets: number;
  totalChats: number;
  avgTicketsPerSupportDay: number;
  avgChatsPerSupportDay: number;
  totalTestingTasks: number;
  completedTestingTasks: number;
  bugsFound: number;
  criticalBugsFound: number;
  supportScore: number;
  testingScore: number;
  finalScore: number;
  managerAdjustmentSupport: number;
  managerAdjustmentTesting: number;
  managerRemarks: string;
};

export type MonthlyPerformanceSummary = {
  month: string;
  monthLabel: string;
  totalTeamTickets: number;
  totalTeamChats: number;
  totalTestingTasks: number;
  totalBugsFound: number;
  averageSupportScore: number;
  averageTestingScore: number;
  averageFinalScore: number;
  bestSupportPerformer: string | null;
  bestTestingPerformer: string | null;
  overallBestPerformer: string | null;
  expectedWorkingDays: number;
};

export type TeamAverages = {
  averageTicketsPerSupportDay: number;
  averageChatsPerSupportDay: number;
  averageBugsFoundPerTestingDay: number;
  averageCriticalBugsFoundPerTestingDay: number;
};

export function getExpectedWorkingDays(year: number, month: number) {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0));
  let days = 0;

  for (let current = new Date(start); current <= end; current.setUTCDate(current.getUTCDate() + 1)) {
    const day = current.getUTCDay();
    if (day !== 0 && day !== 6) {
      days += 1;
    }
  }

  return days;
}

export function round(value: number, decimals = 1) {
  return Math.round(value * 10 ** decimals) / 10;
}

export function clamp(value: number, min = 0, max = 100) {
  return Math.min(Math.max(value, min), max);
}

export function calculateSupportScore(
  supportDays: number,
  avgTicketsPerSupportDay: number,
  avgChatsPerSupportDay: number,
  teamAverages: TeamAverages,
  expectedWorkingDays: number,
  managerAdjustment = 0,
) {
  const ticketScore = teamAverages.averageTicketsPerSupportDay > 0
    ? clamp((avgTicketsPerSupportDay / teamAverages.averageTicketsPerSupportDay) * 40, 0, 40)
    : 0;
  const chatScore = teamAverages.averageChatsPerSupportDay > 0
    ? clamp((avgChatsPerSupportDay / teamAverages.averageChatsPerSupportDay) * 40, 0, 40)
    : 0;
  const attendanceScore = expectedWorkingDays > 0
    ? clamp((supportDays / expectedWorkingDays) * 10, 0, 10)
    : 0;

  return clamp(round(ticketScore + chatScore + attendanceScore + managerAdjustment, 1), 0, 100);
}

export function calculateTestingScore(
  testingDays: number,
  totalTestingTasks: number,
  completedTestingTasks: number,
  bugsFound: number,
  criticalBugsFound: number,
  teamAverages: TeamAverages,
  expectedWorkingDays: number,
  managerAdjustment = 0,
) {
  const taskCompletionRate = totalTestingTasks > 0 ? completedTestingTasks / totalTestingTasks : 0;
  const taskScore = clamp(taskCompletionRate * 30, 0, 30);
  const bugsPerTestingDay = testingDays > 0 ? bugsFound / testingDays : 0;
  const criticalBugsPerTestingDay = testingDays > 0 ? criticalBugsFound / testingDays : 0;
  const bugScore = teamAverages.averageBugsFoundPerTestingDay > 0
    ? clamp((bugsPerTestingDay / teamAverages.averageBugsFoundPerTestingDay) * 30, 0, 30)
    : 0;
  const criticalBugScore = teamAverages.averageCriticalBugsFoundPerTestingDay > 0
    ? clamp((criticalBugsPerTestingDay / teamAverages.averageCriticalBugsFoundPerTestingDay) * 20, 0, 20)
    : 0;
  const daysScore = expectedWorkingDays > 0
    ? clamp((testingDays / expectedWorkingDays) * 10, 0, 10)
    : 0;

  return clamp(round(taskScore + bugScore + criticalBugScore + daysScore + managerAdjustment, 1), 0, 100);
}

export function calculateFinalScore(
  supportScore: number,
  testingScore: number,
  supportDays: number,
  testingDays: number,
  expectedWorkingDays: number,
) {
  if (expectedWorkingDays <= 0) {
    return 0;
  }

  const totalDays = supportDays + testingDays;
  if (totalDays === 0) {
    return 0;
  }

  const supportWeight = supportDays / expectedWorkingDays;
  const testingWeight = testingDays / expectedWorkingDays;

  return clamp(round(supportScore * supportWeight + testingScore * testingWeight, 1), 0, 100);
}

export function getScoreBadgeVariant(score: number) {
  if (score >= 90) return "success";
  if (score >= 80) return "secondary";
  if (score >= 70) return "warning";
  return "danger";
}
