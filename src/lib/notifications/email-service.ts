import type { ReportNotificationData } from "./types";
import { getEmailSettings } from "./settings-service";
import { generateEmployeeConfirmationHtml } from "./templates/employee-confirmation-html";
import { generateManagerNotificationHtml } from "./templates/manager-notification-html";
import { enqueueEmail } from "./queue-processor";

export async function sendDailyReportNotification(data: ReportNotificationData): Promise<{
  success: boolean;
  employeeEmailQueued: boolean;
  managerEmailQueued: boolean;
  message?: string;
}> {
  const settings = await getEmailSettings();
  const appUrl = settings.app_url || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  let employeeEmailQueued = false;
  let managerEmailQueued = false;

  console.log(`[Notification Service] Processing report submission notifications for ${data.employeeName} (${data.employeeEmail})`);

  const empEmail = (data.employeeEmail || "").toLowerCase().trim();
  const managerRecipient = (data.managerEmail || settings.primary_manager_email || "").toLowerCase().trim();

  const isSelfSubmission = empEmail && empEmail === managerRecipient;

  // Filter CC list to remove primary manager and submitter email to avoid duplicate sends
  const combinedCC = Array.from(
    new Set([...(settings.cc_recipients || []), ...(settings.admin_recipients || [])])
  )
    .map((e) => e.toLowerCase().trim())
    .filter((e) => e && e !== managerRecipient && e !== empEmail);

  // 1. Employee Confirmation Email (if enabled and NOT self-submission)
  if (settings.notify_employee_confirmation && empEmail && !isSelfSubmission) {
    const empHtml = generateEmployeeConfirmationHtml(data);
    const empRes = await enqueueEmail({
      recipientEmail: empEmail,
      emailType: "employee_confirmation",
      subject: `Daily Report Submitted Successfully – ${data.workDate}`,
      htmlBody: empHtml,
    });
    employeeEmailQueued = empRes.success;
  }

  // 2. Manager & Admin Notification Email (if preference enabled)
  if (settings.notify_manager_submission && managerRecipient) {
    const mgrHtml = generateManagerNotificationHtml(data, appUrl);
    const mgrRes = await enqueueEmail({
      recipientEmail: managerRecipient,
      ccEmails: combinedCC,
      emailType: "manager_notification",
      subject: isSelfSubmission
        ? `Daily Report Submitted Successfully – ${data.workDate}`
        : `New Daily Report Submitted – ${data.employeeName} (${data.workDate})`,
      htmlBody: mgrHtml,
    });
    managerEmailQueued = mgrRes.success;
  }

  return {
    success: true,
    employeeEmailQueued,
    managerEmailQueued,
    message: "Email notification queued cleanly without duplicate hits.",
  };
}
