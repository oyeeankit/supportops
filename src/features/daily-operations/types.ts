import type { AppRole } from "@/lib/auth/roles";
import type { Shift } from "@/features/employees/types";
export type { Shift };

export const attendanceStatuses = ["present", "wfh", "half_day", "leave"] as const;

export type AttendanceStatus = (typeof attendanceStatuses)[number];

export const attendanceStatusLabels: Record<AttendanceStatus, string> = {
  present: "Present",
  wfh: "WFH",
  half_day: "Half Day",
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

export const testingQualities = ["excellent", "good", "average", "needs_improvement"] as const;

export const supportQualities = ["excellent", "good", "average", "needs_improvement"] as const;

export type TestingType = (typeof testingTypes)[number];
export type TestingStatus = (typeof testingStatuses)[number];
export type TestingQuality = (typeof testingQualities)[number];
export type SupportQuality = (typeof supportQualities)[number];

// ---------------------------------------------------------------------------
// Platform definitions and app catalogue
// ---------------------------------------------------------------------------
export const testingPlatforms = [
  "shopify",
  "ecommerce",
  "wix",
  "csv",
  "other",
] as const;

export type TestingPlatform = string;

export const platformLabels: Record<string, string> = {
  shopify: "Shopify",
  ecommerce: "E commerce",
  wix: "Wix",
  csv: "CSV",
  other: "Other / Custom",
};

// Apps grouped by platform, sorted alphabetically within each group.
// "No Testing Assigned" always appears first under "Support Only".
export const appsByPlatform: Record<string, readonly string[]> = {
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
    "Shipr",
    "Sleek",
    "Smart",
    "Spreadr",
    "Watchlyst",
  ],
  ecommerce: ["Custom Store App"],
  wix: ["Pro Bulk Editor", "Spreadr"],
  csv: ["Bulk CSV Importer"],
  other: ["Custom Feature App"],
  bigcommerce: ["Spreadr", "Supr"],
  woocommerce: ["Spreadr"],
} as const;

// Lookup: app name -> platform
export const platformForApp: Record<string, TestingPlatform> = Object.fromEntries(
  Object.entries(appsByPlatform).flatMap(([platform, apps]) =>
    (apps || []).map((app) => [app, platform as TestingPlatform]),
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
  needs_improvement: "Needs Improvement",
};

export const supportQualityLabels: Record<SupportQuality, string> = {
  excellent: "Excellent",
  good: "Good",
  average: "Average",
  needs_improvement: "Needs Improvement",
};

// Manager rating scale (1-5) used for daily scoring
export const managerRatingOptions = [1, 2, 3, 4, 5] as const;
export type ManagerRating = (typeof managerRatingOptions)[number];

export const managerRatingLabels: Record<number, string> = {
  5: "Excellent",
  4: "Good",
  3: "Average",
  2: "Poor",
  1: "Unsatisfactory",
};

// Map testing_quality values to 1-5 numeric scores (used in performance formulas)
export const testingQualityToScore: Record<TestingQuality, number> = {
  excellent: 5,
  good: 4,
  average: 3,
  needs_improvement: 2,
};

export const supportQualityToScore: Record<SupportQuality, number> = {
  excellent: 5,
  good: 4,
  average: 3,
  needs_improvement: 2,
};

export type DailySupportLog = {
  id: string;
  employee_id: string;
  log_date: string;
  attendance_status: AttendanceStatus;
  tickets_handled: number;
  chats_handled: number;
  doc_updated: boolean;
  feature_suggestion: boolean;
  bug_verification: boolean;
  asked_for_review: boolean;
  got_review: boolean;
  other_contribution: boolean;
  support_quality: SupportQuality;
  testing_quality: TestingQuality;
  testing_notes: string | null;
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
  critical_bug: boolean;
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
  critical_bug: boolean;
};

export function emptyTestingEntry(): TestingEntryFormData {
  return {
    platform: "shopify",
    application_name: "",
    module_name: "",
    testing_type: "functional",
    status: "in_progress",
    bugs_found: 0,
    critical_bug: false,
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
