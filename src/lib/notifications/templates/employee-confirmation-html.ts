import type { ReportNotificationData } from "../types";

export function generateEmployeeConfirmationHtml(data: ReportNotificationData): string {
  const contributionsList = data.contributions.length > 0
    ? data.contributions.map((c) => `<li style="margin-bottom: 4px; color: #047857; font-weight: 600;">✓ ${c}</li>`).join("")
    : `<li style="color: #6b7280; font-style: italic;">No extra contributions added</li>`;

  const testingSummaryRows = data.testingEntries.length > 0
    ? data.testingEntries.map((t, idx) => `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 8px 12px; font-weight: 600;">#${idx + 1} ${t.application_name || 'App Test'}</td>
          <td style="padding: 8px 12px;">${t.platform}</td>
          <td style="padding: 8px 12px; font-weight: 700; color: #4f46e5;">${t.bugs_found} bugs</td>
          <td style="padding: 8px 12px;">${t.critical_bug ? '<span style="color: #dc2626; font-weight: 800;">🚨 Critical</span>' : '<span style="color: #16a34a;">Normal</span>'}</td>
        </tr>
      `).join("")
    : `<tr><td colspan="4" style="padding: 12px; text-align: center; color: #6b7280; font-style: italic;">No testing work submitted</td></tr>`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Report Submitted Successfully</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <!-- Header Banner -->
    <tr>
      <td style="background-color: #2563eb; padding: 28px 32px; text-align: center;">
        <div style="font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; margin-bottom: 4px;">SupportOps</div>
        <div style="font-size: 12px; font-weight: 700; color: #bfdbfe; text-transform: uppercase; letter-spacing: 1px;">Daily Report Confirmation</div>
      </td>
    </tr>

    <!-- Main Content -->
    <tr>
      <td style="padding: 32px;">
        <div style="display: inline-block; background-color: #dcfce7; border: 1px solid #86efac; border-radius: 8px; padding: 6px 12px; font-size: 13px; font-weight: 700; color: #15803d; margin-bottom: 16px;">
          ✓ Submission Confirmed
        </div>

        <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0;">Hello ${data.employeeName},</h1>
        <p style="font-size: 14px; line-height: 1.5; color: #475569; margin: 0 0 24px 0;">
          Your Daily Report for <strong>${data.workDate}</strong> has been received and logged into SupportOps successfully. Below is your submission receipt.
        </p>

        <!-- Receipt Table -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 24px; font-size: 13px;">
          <tr>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #64748b; width: 40%;">Employee Email:</td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #0f172a;">${data.employeeEmail}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #64748b;">Work Date & Shift:</td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #0f172a;">${data.workDate} (${data.shift})</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #64748b;">Attendance:</td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #0f172a;">${data.attendance}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #64748b;">Tickets Solved:</td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 800; color: #2563eb;">${data.ticketsHandled} Tickets</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #64748b;">Chats Handled:</td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 800; color: #db2777;">${data.chatsHandled} Chats</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-weight: 700; color: #64748b;">Submission Time:</td>
            <td style="padding: 12px 16px; font-weight: 600; color: #0f172a;">${data.submissionTime}</td>
          </tr>
        </table>

        <!-- QA Testing Summary -->
        ${data.testingCount > 0 ? `
          <div style="margin-bottom: 24px;">
            <h3 style="font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 8px;">QA App Testing Logged (${data.testingCount})</h3>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; font-size: 12px;">
              <thead>
                <tr style="background-color: #f1f5f9; text-align: left; color: #475569;">
                  <th style="padding: 8px 12px;">App / Module</th>
                  <th style="padding: 8px 12px;">Platform</th>
                  <th style="padding: 8px 12px;">Bugs</th>
                  <th style="padding: 8px 12px;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${testingSummaryRows}
              </tbody>
            </table>
          </div>
        ` : ''}

        <!-- Contributions -->
        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 8px;">Extra Contributions</h3>
          <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
            ${contributionsList}
          </ul>
        </div>

        ${data.notes ? `
          <div style="margin-bottom: 24px; background-color: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #2563eb;">
            <h4 style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #64748b; margin: 0 0 4px 0;">Notes / Accomplishments</h4>
            <p style="font-size: 13px; color: #334155; margin: 0; white-space: pre-wrap;">${data.notes}</p>
          </div>
        ` : ''}

        <p style="font-size: 13px; color: #64748b; margin: 0;">
          Thank you for your daily submission! Your metrics have been added to your monthly score.
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #f1f5f9; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
        Sent via SupportOps Daily Reporting Service &bull; Thalia Technologies
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
