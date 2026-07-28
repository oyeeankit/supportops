export type TestingEntryItem = {
  platform: string;
  application_name: string;
  bugs_found: number;
  critical_bug: boolean;
};

export type ReportNotificationData = {
  employeeName: string;
  employeeEmail: string;
  workDate: string;
  shift: string;
  attendance: string;
  ticketsHandled: number;
  chatsHandled: number;
  contributions: string[];
  testingCount: number;
  testingEntries: TestingEntryItem[];
  notes?: string;
  submissionTime: string;
  managerEmail?: string;
};

export type EmailSettings = {
  id?: string;
  resend_api_key: string;
  sender_email: string;
  primary_manager_email: string;
  cc_recipients: string[];
  admin_recipients: string[];
  app_url: string;
  notify_employee_confirmation: boolean;
  notify_manager_submission: boolean;
  notify_daily_reminder: boolean;
  notify_late_submission: boolean;
  notify_missing_report: boolean;
  notify_weekly_summary: boolean;
  notify_monthly_summary: boolean;
};

export type EmailQueueItem = {
  id: string;
  report_id?: string | null;
  recipient_email: string;
  cc_emails: string[];
  email_type: string;
  subject: string;
  html_body: string;
  status: "pending" | "sent" | "failed";
  attempts: number;
  max_attempts: number;
  error_message?: string | null;
  scheduled_at: string;
  sent_at?: string | null;
  created_at: string;
};
