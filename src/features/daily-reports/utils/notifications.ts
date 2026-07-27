/**
 * Simulates sending confirmation email to employee and notification email to manager.
 */
export async function sendDailyReportNotifications({
  employeeName,
  employeeEmail,
  workDate,
  tickets,
  chats,
  isLate,
}: {
  employeeName: string;
  employeeEmail: string;
  workDate: string;
  tickets: number;
  chats: number;
  isLate: boolean;
}) {
  console.log(`[EMAIL NOTIFICATION] Confirmation sent to Employee (${employeeEmail}):`);
  console.log(`  Subject: Daily Report Submitted Successfully (${workDate})`);
  console.log(`  Body: Hi ${employeeName}, your daily report for ${workDate} has been recorded.`);
  console.log(`        Summary: ${tickets} Tickets Closed, ${chats} Chats Handled. ${isLate ? "[Late Submission]" : ""}`);

  console.log(`[EMAIL NOTIFICATION] Alert sent to Manager:`);
  console.log(`  Subject: New Daily Report Submitted by ${employeeName} (${workDate})`);
  console.log(`  Body: ${employeeName} submitted daily log for ${workDate}. ${tickets} Tickets, ${chats} Chats.`);
}
