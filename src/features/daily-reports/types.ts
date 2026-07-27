import type { Shift, AppRole } from "@/lib/auth/roles";
import type { DailySupportLog, DailyTestingLog, AttendanceStatus } from "../daily-operations/types";

export type SubmissionStatus = "draft" | "submitted" | "late" | "missing";

export type DailyReportSubmission = {
  id: string;
  employee_id: string;
  work_date: string;
  shift: Shift;
  status: SubmissionStatus;
  is_late: boolean;
  submitted_at: string | null;
  draft_payload: Record<string, unknown> | null;
  notes: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined profile fields (optional)
  employee_name?: string;
  employee_email?: string;
  avatar_url?: string | null;
  role?: AppRole;
  // Joined support & testing entries
  supportLog?: DailySupportLog | null;
  testingLogs?: DailyTestingLog[];
  attachments?: DailyReportAttachment[];
};

export type DailyReportAttachment = {
  id: string;
  submission_id: string;
  employee_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  storage_bucket: string;
  created_at: string;
};

export type ShiftWindowInfo = {
  workDate: string;
  shift: Shift;
  isLate: boolean;
  deadlineIso: string;
};
