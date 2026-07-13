"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import type { DailySupportLog, DailyTestingLog } from "./types";
import { dailySupportLogSchema, testingEntrySchema, monthlyPerformanceAdjustmentSchema } from "./schemas";

export type DailyOperationActionState = {
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  saved?: boolean;
};

export type EmployeeDailyData = {
  supportLog: DailySupportLog | null;
  testingLogs: DailyTestingLog[];
  error?: string;
};

export async function saveDailyOperationAction(
  _: DailyOperationActionState,
  formData: FormData,
): Promise<DailyOperationActionState> {
  const { profile } = await requireUser();
  const supabase = await createClient();

  const employeeId = String(formData.get("employee_id") ?? "");
  const logDate = String(formData.get("log_date") ?? "");

  if (profile.role !== "manager" && employeeId !== profile.id) {
    return { message: "You can only update your own daily log." };
  }

  // Parse support data - convert empty strings to defaults for enum fields
  const rawWorkFocus = String(formData.get("work_focus") ?? "");
  const rawDayStatus = String(formData.get("day_status") ?? "");
  const rawTicketRating = formData.get("ticket_rating");
  const rawChatRating = formData.get("chat_rating");
  const rawDocRating = formData.get("documentation_rating");
  const supportPayload = {
    employee_id: employeeId,
    log_date: logDate,
    attendance_status: String(formData.get("attendance_status") ?? "present"),
    tickets_handled: formData.get("tickets_handled"),
    chats_handled: formData.get("chats_handled"),
    notes: formData.get("notes"),
    work_focus: rawWorkFocus || "support",
    day_status: rawDayStatus || "support",
    daily_remarks: String(formData.get("daily_remarks") ?? ""),
    ticket_rating: rawTicketRating ? Number(rawTicketRating) : null,
    chat_rating: rawChatRating ? Number(rawChatRating) : null,
    documentation_rating: rawDocRating ? Number(rawDocRating) : null,
  };

  const supportParsed = dailySupportLogSchema.safeParse(supportPayload);
  if (!supportParsed.success) {
    return {
      message: "Please fix the highlighted fields.",
      fieldErrors: supportParsed.error.flatten().fieldErrors,
    };
  }

  // Parse testing entries
  const rawEntries = formData.get("testing_entries");
  let testingEntries: unknown[];
  try {
    testingEntries = rawEntries ? JSON.parse(String(rawEntries)) : [];
  } catch {
    return { message: "Invalid testing entries format." };
  }

  if (!Array.isArray(testingEntries)) {
    return { message: "Testing entries must be an array." };
  }

  const validatedEntries: Array<Record<string, unknown>> = [];
  for (let i = 0; i < testingEntries.length; i++) {
    const parsed = testingEntrySchema.safeParse(testingEntries[i]);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[] | undefined>;
      const fieldKeys = Object.keys(fieldErrors);
      return {
        message: `Entry #${i + 1}: ${fieldKeys.map((k) => fieldErrors[k]?.[0]).filter(Boolean).join(", ")}`,
      };
    }
    validatedEntries.push({ ...parsed.data });
  }

  // Validate end >= start for each entry
  for (let i = 0; i < validatedEntries.length; i++) {
    const entry = validatedEntries[i];
    if (entry.started_at && entry.ended_at && String(entry.ended_at) < String(entry.started_at)) {
      return { message: `Entry #${i + 1}: End time cannot be before start time.` };
    }
  }

  // Call the RPC function for transactional save
  const { data: rpcResult, error: rpcError } = await supabase.rpc("save_daily_operations", {
    p_employee_id: employeeId,
    p_log_date: logDate,
    p_attendance_status: supportParsed.data.attendance_status,
    p_tickets_handled: supportParsed.data.tickets_handled,
    p_chats_handled: supportParsed.data.chats_handled,
    p_notes: supportParsed.data.notes ?? null,
    p_work_focus: supportParsed.data.work_focus ?? "support",
    p_day_status: supportParsed.data.day_status ?? "support",
    p_daily_remarks: supportParsed.data.daily_remarks ?? null,
    p_testing_entries: JSON.stringify(validatedEntries),
    p_profile_id: profile.id,
    p_ticket_rating: supportParsed.data.ticket_rating ?? null,
    p_chat_rating: supportParsed.data.chat_rating ?? null,
    p_documentation_rating: supportParsed.data.documentation_rating ?? null,
  });

  if (rpcError) {
    return { message: rpcError.message };
  }

  const result = rpcResult as { success?: boolean; error?: string } | null;
  if (!result?.success) {
    return { message: result?.error ?? "Failed to save daily operations." };
  }

  revalidatePath("/operations");
  revalidatePath("/reports");
  revalidatePath("/dashboard");

  // Stay on page (modal workflow) instead of redirecting
  const stayOnPage = String(formData.get("stay_on_page") ?? "") === "1";
  if (stayOnPage) {
    return { message: "Daily operations saved.", saved: true };
  }

  redirect(`/operations?date=${logDate}&employee=${employeeId}`);
}

// Fetch a single employee's daily data for a specific date.
// Used by the modal to lazy-load data when opened.
export async function fetchEmployeeDailyDataAction(
  employeeId: string,
  logDate: string,
): Promise<EmployeeDailyData> {
  const { profile } = await requireUser();
  const supabase = await createClient();

  if (profile.role !== "manager" && employeeId !== profile.id) {
    return { supportLog: null, testingLogs: [], error: "You can only view your own daily logs." };
  }

  const [sr, tr] = await Promise.all([
    supabase.from("daily_support_logs").select("*").eq("employee_id", employeeId).eq("log_date", logDate).maybeSingle(),
    supabase.from("daily_testing_logs").select("*").eq("employee_id", employeeId).eq("log_date", logDate).order("created_at", { ascending: true }),
  ]);

  if (sr.error) {
    return { supportLog: null, testingLogs: [], error: sr.error.message };
  }
  if (tr.error) {
    return { supportLog: null, testingLogs: [], error: tr.error.message };
  }

  return {
    supportLog: (sr.data as DailySupportLog | null) ?? null,
    testingLogs: (tr.data as DailyTestingLog[] | null) ?? [],
  };
}

export async function saveMonthlyPerformanceAdjustmentAction(
  _: DailyOperationActionState,
  formData: FormData,
): Promise<DailyOperationActionState> {
  const { profile } = await requireUser();

  if (profile.role !== "manager") {
    return { message: "Only managers can update monthly report adjustments." };
  }

  const parsed = monthlyPerformanceAdjustmentSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return {
      message: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();

  const { data: existingAdjustment } = await supabase
    .from("monthly_performance_adjustments")
    .select("created_by")
    .eq("employee_id", parsed.data.employee_id)
    .eq("report_month", parsed.data.report_month)
    .maybeSingle();

  const payload: Record<string, unknown> = {
    ...parsed.data,
    updated_by: profile.id,
  };

  if (!existingAdjustment) {
    payload.created_by = profile.id;
  }

  const { error } = await supabase.from("monthly_performance_adjustments").upsert(
    payload,
    { onConflict: "employee_id,report_month" },
  );

  if (error) {
    return { message: error.message };
  }

  revalidatePath("/reports");
  return { message: "Monthly adjustment saved." };
}
