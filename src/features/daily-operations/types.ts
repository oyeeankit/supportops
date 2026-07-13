import type { AppRole } from "@/lib/auth/roles";
import type { Shift } from "@/features/employees/types";

export const attendanceStatuses = ["present", "wfh", "leave"] as const;

export type AttendanceStatus = (typeof attendanceStatuses)[number];

export const attendanceStatusLabels: Record<AttendanceStatus, string> = {
  present: "Present",
  wfh: "WFH",
  leave: "Leave",
};

export const testingTypes = [
  "functional",
  "regression",
  "smoke",
  "ui_ux",
  "performance",
  "integration",
  "api",
  "database",
  "security",
  "other",
] as const;

export const testingStatuses = ["in_progress", "completed", "blocked", "on_hold"] as const;

export const testingQualities = ["excellent", "good", "average", "poor"] as const;

export const workFocusOptions = ["support", "testing", "support_testing", "meeting", "training", "leave"] as const;

export type TestingType = (typeof testingTypes)[number];
export type TestingStatus = (typeof testingStatuses)[number];
export type TestingQuality = (typeof testingQualities)[number];
export type WorkFocus = (typeof workFocusOptions)[number];

// ---------------------------------------------------------------------------
// Platform definitions and app catalogue
// ---------------------------------------------------------------------------
export const testingPlatforms = [
  "support_only",
  "shopify",
  "wix",
  "bigcommerce",
  "woocommerce",
] as const;

export type TestingPlatform = (typeof testingPlatforms)[number];

export const platformLabels: Record<TestingPlatform, string> = {
  support_only: "Support Only",
  shopify: "Shopify Apps",
  wix: "Wix Apps",
  bigcommerce: "BigCommerce Apps",
  woocommerce: "WooCommerce Apps",
};

// Apps grouped by platform, sorted alphabetically within each group.
// "No Testing Assigned" always appears first under "Support Only".
export const appsByPlatform: Record<TestingPlatform, readonly string[]> = {
  support_only: ["No Testing Assigned"],
  shopify: [
    "Bolt",
    "Clean Table",
    "Clever",
    "Connectr",
    "Dual",
    "Duplicate SKU Sync",
    "Exporter",
    "Flo",
    "Neo",
    "Outlink",
    "Prime Product Badges",
    "Pro Price Editor",
    "Robo",
    "Shipr",
    "Sleek",
    "Smart",
    "Spreadr",
    "Watchlyst",
  ],
  wix: ["Pro Bulk Editor", "Spreadr"],
  bigcommerce: ["Spreadr", "Supr"],
  woocommerce: ["Spreadr"],
} as const;

// Lookup: app name -> platform
export const platformForApp: Record<string, TestingPlatform> = Object.fromEntries(
  Object.entries(appsByPlatform).flatMap(([platform, apps]) =>
    apps.map((app) => [app, platform as TestingPlatform]),
  ),
) as Record<string, TestingPlatform>;

export const NO_TESTING_ASSIGNED = "No Testing Assigned";

export function isNoTestingAssigned(appName: string): boolean {
  return appName === NO_TESTING_ASSIGNED || appName === "";
}

export const testingTypeLabels: Record<TestingType, string> = {
  functional: "Functional",
  regression: "Regression",
  smoke: "Smoke",
  ui_ux: "UI/UX",
  performance: "Performance",
  integration: "Integration",
  api: "API",
  database: "Database",
  security: "Security",
  other: "Other",
};

export const testingStatusLabels: Record<TestingStatus, string> = {
  in_progress: "In Progress",
  completed: "Completed",
  blocked: "Blocked",
  on_hold: "On Hold",
};

export const testingQualityLabels: Record<TestingQuality, string> = {
  excellent: "Excellent",
  good: "Good",
  average: "Average",
  poor: "Poor",
};

export const workFocusLabels: Record<WorkFocus, string> = {
  support: "Support",
  testing: "Testing",
  support_testing: "Support + Testing",
  meeting: "Meeting",
  training: "Training",
  leave: "Leave",
};

export const dayStatusOptions = workFocusOptions;
export type DayStatus = WorkFocus;
export const dayStatusLabels = workFocusLabels;

// ---------------------------------------------------------------------------
// Manager rating scale (1-5) used for daily scoring
// ---------------------------------------------------------------------------
export const managerRatingOptions = [1, 2, 3, 4, 5] as const;
export type ManagerRating = (typeof managerRatingOptions)[number];

export const managerRatingLabels: Record<number, string> = {
  5: "Excellent",
  4: "Good",
  3: "Average",
  2: "Poor",
  1: "Unsatisfactory",
};

// Testing task completion rating (per testing entry)
export const taskCompletionOptions = [1, 2, 3, 4, 5] as const;
export type TaskCompletion = (typeof taskCompletionOptions)[number];

export const taskCompletionLabels: Record<number, string> = {
  5: "Completed",
  4: "Mostly Completed",
  3: "Partially Completed",
  2: "Blocked",
  1: "Not Done",
};

// Map testing_quality values to 1-5 numeric scores
export const testingQualityToScore: Record<TestingQuality, number> = {
  excellent: 5,
  good: 4,
  average: 3,
  poor: 2,
};

export type DailySupportLog = {
  id: string;
  employee_id: string;
  log_date: string;
  attendance_status: AttendanceStatus;
  tickets_handled: number;
  chats_handled: number;
  notes: string | null;
  work_focus: string | null;
  day_status: string | null;
  daily_remarks: string | null;
  // Manager ratings (1-5)
  ticket_rating: number | null;
  chat_rating: number | null;
  documentation_rating: number | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type DailyTestingLog = {
  id: string;
  employee_id: string;
  log_date: string;
  platform: TestingPlatform;
  application_name: string;
  module_name: string;
  testing_type: TestingType;
  status: TestingStatus;
  bugs_found: number;
  critical_bugs_found: number;
  testing_quality: TestingQuality;
  // Manager rating (1-5)
  task_completion: number | null;
  started_at: string | null;
  ended_at: string | null;
  notes: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type TestingEntryFormData = {
  id?: string;
  platform: TestingPlatform;
  application_name: string;
  module_name: string;
  testing_type: TestingType;
  status: TestingStatus;
  bugs_found: number;
  critical_bugs_found: number;
  testing_quality: TestingQuality;
  task_completion: number;
  started_at: string;
  ended_at: string;
  notes: string;
};

export function emptyTestingEntry(date: string): TestingEntryFormData {
  const dateStart = `${date}T09:00:00`;
  const dateEnd = `${date}T17:00:00`;
  return {
    platform: "shopify",
    application_name: "",
    module_name: "",
    testing_type: "functional",
    status: "in_progress",
    bugs_found: 0,
    critical_bugs_found: 0,
    testing_quality: "good",
    task_completion: 5,
    started_at: dateStart,
    ended_at: dateEnd,
    notes: "",
  };
}

export type TeamMemberDailyRow = {
  employee_id: string;
  full_name: string;
  email: string;
  role: AppRole;
  shift: Shift;
  avatar_url: string | null;
  supportLog: DailySupportLog | null;
  testingLogs: DailyTestingLog[];
};

export type DailySummaryStats = {
  totalTickets: number;
  totalChats: number;
  totalAppsTested: number;
  totalTestingEntries: number;
  totalBugs: number;
  criticalBugs: number;
  completedTests: number;
  inProgressTests: number;
  blockedTests: number;
  onHoldTests: number;
};

// Re-export scoring types for convenience
export type { StarRating } from "./performance";
export { starRatingLabels, starRatingStars, getStarRating } from "./performance";
