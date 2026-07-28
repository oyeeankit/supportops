import type { ReportNotificationData } from "../types";

export function generateManagerNotificationHtml(data: ReportNotificationData, appUrl: string): string {
  const totalBugs = data.testingEntries.reduce((sum, t) => sum + (t.bugs_found || 0), 0);
  const criticalBugs = data.testingEntries.filter((t) => t.critical_bug).length;

  const contributionsList = data.contributions.length > 0
    ? data.contributions.map((c) => `<li style="margin-bottom: 4px; color: #047857; font-weight: 600;">✓ ${c}</li>`).join("")
    : `<li style="color: #6b7280; font-style: italic;">No extra contributions</li>`;

  const testingSummaryRows = data.testingEntries.length > 0
    ? data.testingEntries.map((t, idx) => `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 8px 12px; font-weight: 600;">#${idx + 1} ${t.application_name || 'App Module'}</td>
          <td style="padding: 8px 12px;">${t.platform}</td>
          <td style="padding: 8px 12px; font-weight: 700; color: #4f46e5;">${t.bugs_found} bugs</td>
          <td style="padding: 8px 12px;">${t.critical_bug ? '<span style="background-color: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; padding: 2px 8px; border-radius: 4px; font-weight: 800; font-size: 11px;">🚨 CRITICAL BUG</span>' : '<span style="color: #16a34a;">Normal</span>'}</td>
        </tr>
      `).join("")
    : `<tr><td colspan="4" style="padding: 12px; text-align: center; color: #6b7280; font-style: italic;">No testing work logged for this shift</td></tr>`;

  const submissionsConsoleUrl = `${appUrl}/operations/submissions`;

  // Dynamic recommendation based on submission
  let recommendationNote = "Standard daily performance logged.";
  if (criticalBugs > 0) {
    recommendationNote = "🚨 Critical bugs reported in app testing. Priority manager review required.";
  } else if (data.ticketsHandled >= 50 || data.chatsHandled >= 40) {
    recommendationNote = "🌟 Exceptional support volume handled today!";
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Daily Report Submitted – ${data.employeeName}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <!-- Header Banner -->
    <tr>
      <td style="background-color: #0f172a; padding: 28px 32px; text-align: center;">
        <div style="font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; margin-bottom: 4px;">SupportOps</div>
        <div style="font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Manager Notification Center</div>
      </td>
    </tr>

    <!-- Main Content -->
    <tr>
      <td style="padding: 32px;">
        <div style="display: inline-block; background-color: #e0e7ff; border: 1px solid #c7d2fe; border-radius: 8px; padding: 6px 12px; font-size: 13px; font-weight: 700; color: #4338ca; margin-bottom: 16px;">
          📢 New Team Report Received
        </div>

        <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0;">
          ${data.employeeName} submitted a Daily Report
        </h1>
        <p style="font-size: 14px; line-height: 1.5; color: #475569; margin: 0 0 24px 0;">
          A new daily report has been recorded for <strong>${data.workDate}</strong>. Below is the full submission breakdown.
        </p>

        <!-- KPI Highlight Box -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
          <tr>
            <td width="32%" style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; text-align: center;">
              <div style="font-size: 22px; font-weight: 900; color: #1d4ed8;">${data.ticketsHandled}</div>
              <div style="font-size: 11px; font-weight: 700; color: #3b82f6; text-transform: uppercase; margin-top: 2px;">Tickets</div>
            </td>
            <td width="2%"></td>
            <td width="32%" style="background-color: #fdf2f8; border: 1px solid #fbcfe8; border-radius: 12px; padding: 16px; text-align: center;">
              <div style="font-size: 22px; font-weight: 900; color: #be185d;">${data.chatsHandled}</div>
              <div style="font-size: 11px; font-weight: 700; color: #ec4899; text-transform: uppercase; margin-top: 2px;">Chats</div>
            </td>
            <td width="2%"></td>
            <td width="32%" style="background-color: ${criticalBugs > 0 ? '#fef2f2' : '#f5f3ff'}; border: 1px solid ${criticalBugs > 0 ? '#fca5a5' : '#ddd6fe'}; border-radius: 12px; padding: 16px; text-align: center;">
              <div style="font-size: 22px; font-weight: 900; color: ${criticalBugs > 0 ? '#dc2626' : '#6d28d9'};">${totalBugs}</div>
              <div style="font-size: 11px; font-weight: 700; color: ${criticalBugs > 0 ? '#ef4444' : '#8b5cf6'}; text-transform: uppercase; margin-top: 2px;">
                ${criticalBugs > 0 ? `🚨 ${criticalBugs} Critical` : 'Bugs Found'}
              </div>
            </td>
          </tr>
        </table>

        <!-- Details Table -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 24px; font-size: 13px;">
          <tr>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #64748b; width: 40%;">Employee:</td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #0f172a;">${data.employeeName} (${data.employeeEmail})</td>
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
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #64748b;">Critical Bugs Flagged:</td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 800; color: ${criticalBugs > 0 ? '#dc2626' : '#16a34a'};">
              ${criticalBugs > 0 ? `🚨 ${criticalBugs} Critical Bug(s)` : 'None (0)'}
            </td>
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
                  <th style="padding: 8px 12px;">Flag</th>
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

        <!-- Final Recommendation -->
        <div style="margin-bottom: 24px; background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 14px 16px; border-radius: 10px;">
          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #166534; letter-spacing: 0.5px; margin-bottom: 2px;">System Recommendation</div>
          <div style="font-size: 13px; font-weight: 700; color: #15803d;">${recommendationNote}</div>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #f1f5f9; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
        Sent via SupportOps Manager Notification System &bull; Thalia Technologies
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
