import type { AppRole } from "@/lib/auth/roles";
import type { Shift } from "@/features/employees/types";

export const attendanceStatuses = ["present", "wfh", "leave"] as const;

export type AttendanceStatus = (typeof attendanceStatuses)[number];

export const attendanceStatusLabels: Record<AttendanceStatus, string> = {
  present: "Present",
  wfh: "WFH",
  leave: "Leave",
};

export const testingTypes = ["functional", "regression", "bug_verification", "exploratory"] as const;
export const testingStatuses = ["in_progress", "completed"] as const;

export type TestingType = (typeof testingTypes)[number];
export type TestingStatus = (typeof testingStatuses)[number];

export const testingTypeLabels: Record<TestingType, string> = {
  functional: "Functional",
  regression: "Regression",
  bug_verification: "Bug Verification",
  exploratory: "Exploratory",
};

export const testingStatusLabels: Record<TestingStatus, string> = {
  in_progress: "In Progress",
  completed: "Completed",
};

export type DailySupportLog = {
  id: string;
  employee_id: string;
  log_date: string;
  attendance_status: AttendanceStatus;
  tickets_handled: number;
  chats_handled: number;
  notes: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type DailyTestingLog = {
  id: string;
  employee_id: string;
  log_date: string;
  application_name: string;
  module_name: string;
  testing_task: string;
  testing_type: TestingType;
  status: TestingStatus;
  bugs_found: number;
  critical_bugs_found: number;
  notes: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type TeamMemberDailyRow = {
  employee_id: string;
  full_name: string;
  email: string;
  role: AppRole;
  shift: Shift;
  avatar_url: string | null;
  supportLog: DailySupportLog | null;
  testingLog: DailyTestingLog | null;
};
