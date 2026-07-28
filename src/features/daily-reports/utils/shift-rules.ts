import type { Shift } from "../../daily-operations/types";

/**
 * Validates that workDate is strictly Today or Yesterday (maximum 1 day backdated).
 */
export function validateBackdatedLimit(workDate: string): { allowed: boolean; reason?: string } {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayStr = today.toISOString().split("T")[0];
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  if (workDate > todayStr) {
    return { allowed: false, reason: "Future dates are not allowed for daily report submissions." };
  }

  if (workDate < yesterdayStr) {
    return {
      allowed: false,
      reason: `Backdated reports are restricted to a maximum of 1 previous day (${yesterdayStr}).`,
    };
  }

  return { allowed: true };
}

/**
 * Returns allowed work dates (YYYY-MM-DD) for a given shift.
 * Default allowed dates: Today and Yesterday.
 */
export function getAvailableWorkDates(): Array<{ value: string; label: string }> {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  return [
    { value: todayStr, label: `Today (${todayStr})` },
    { value: yesterdayStr, label: `Yesterday (${yesterdayStr})` },
  ];
}

/**
 * Calculates shift reporting window rules and checks whether a submission is late.
 */
export function checkShiftReportingWindow(
  workDate: string,
  shift: Shift,
  submissionTime: Date = new Date()
): { isLate: boolean; deadlineLabel: string } {
  const [year, month, day] = workDate.split("-").map(Number);
  const targetDate = new Date(year, month - 1, day);

  let deadlineHour = 21; // 9:00 PM default for day shift

  if (shift === "morning") {
    deadlineHour = 20; // 8:00 PM same day
  } else if (shift === "evening") {
    // Night shift (6 PM - 2 AM): Deadline is 12:00 PM next day
    targetDate.setDate(targetDate.getDate() + 1);
    deadlineHour = 12;
  }

  targetDate.setHours(deadlineHour, 0, 0, 0);

  const isLate = submissionTime.getTime() > targetDate.getTime();
  const deadlineLabel = targetDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  });

  return { isLate, deadlineLabel };
}
