import type { AppRole } from "@/lib/auth/roles";
import type { Shift } from "@/features/employees/types";

export const attendanceStatuses = ["present", "wfh", "leave"] as const;
export const workFocusOptions = ["support", "testing", "mixed", "documentation", "training", "other"] as const;

export type AttendanceStatus = (typeof attendanceStatuses)[number];
export type WorkFocus = (typeof workFocusOptions)[number];

export const attendanceStatusLabels: Record<AttendanceStatus, string> = {
  present: "Present",
  wfh: "WFH",
  leave: "Leave",
};

export const workFocusLabels: Record<WorkFocus, string> = {
  support: "Support",
  testing: "Testing",
  mixed: "Mixed",
  documentation: "Documentation",
  training: "Training",
  other: "Other",
};

export type DailyOperation = {
  id: string;
  employee_id: string;
  operation_date: string;
  attendance_status: AttendanceStatus;
  tickets_resolved: number;
  chats_handled: number;
  work_focus: WorkFocus;
  current_testing_task: string | null;
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
  operation: DailyOperation | null;
};
