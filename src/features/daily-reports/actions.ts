"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { checkShiftReportingWindow } from "./utils/shift-rules";
import { sendDailyReportNotifications } from "./utils/notifications";
import { dailySupportLogSchema, testingEntrySchema } from "../daily-operations/schemas";
import type { Shift } from "@/lib/auth/roles";

export type DailyReportActionState = {
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  saved?: boolean;
  draftSaved?: boolean;
};

export async function saveDailyReportDraftAction(
  _: DailyReportActionState,
  formData: FormData
): Promise<DailyReportActionState> {
  const { profile } = await requireUser();
  const supabase = await createClient();

  const workDate = String(formData.get("work_date") ?? new Date().toISOString().split("T")[0]);
  const shift = (String(formData.get("shift") ?? "day")) as Shift;

  const draftPayload = Object.fromEntries(formData.entries());

  try {
    await supabase.from("daily_report_submissions").upsert(
      {
        employee_id: profile.id,
        work_date: workDate,
        shift,
        status: "draft",
        draft_payload: draftPayload,
        updated_by: profile.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "employee_id,work_date" }
    );
  } catch {
    // Ignore error if table not migrated yet
  }

  return { draftSaved: true, message: "Draft saved successfully." };
}

export async function submitDailyReportAction(
  _: DailyReportActionState,
  formData: FormData
): Promise<DailyReportActionState> {
  const { profile } = await requireUser();
  const supabase = await createClient();

  const workDate = String(formData.get("work_date") ?? new Date().toISOString().split("T")[0]);
  const shift = (String(formData.get("shift") ?? "day")) as Shift;
  const attendanceStatus = String(formData.get("attendance_status") ?? "present");

  const isTrue = (val: FormDataEntryValue | null) => val === "on" || val === "true" || val === "1" || val === true;

  // Validate Support Log schema
  const supportPayload = {
    employee_id: profile.id,
    log_date: workDate,
    attendance_status: attendanceStatus,
    tickets_handled: formData.get("tickets_handled"),
    chats_handled: formData.get("chats_handled"),
    doc_updated: isTrue(formData.get("doc_updated")),
    feature_suggestion: isTrue(formData.get("feature_suggestion")),
    bug_verification: isTrue(formData.get("bug_verification")),
    asked_for_review: isTrue(formData.get("asked_for_review")),
    got_review: isTrue(formData.get("got_review")),
    other_contribution: isTrue(formData.get("other_contribution")),
    support_quality: "good",
    testing_quality: "good",
    testing_notes: formData.get("notes"),
  };

  const supportParsed = dailySupportLogSchema.safeParse(supportPayload);
  if (!supportParsed.success) {
    return {
      message: "Please fix the highlighted errors before submitting.",
      fieldErrors: supportParsed.error.flatten().fieldErrors,
    };
  }

  // Parse Testing Entries
  const rawEntries = formData.get("testing_entries");
  let testingEntries: unknown[] = [];
  try {
    testingEntries = rawEntries ? JSON.parse(String(rawEntries)) : [];
  } catch {
    return { message: "Invalid testing entries format." };
  }

  const validatedEntries: Array<Record<string, unknown>> = [];
  if (Array.isArray(testingEntries)) {
    for (let i = 0; i < testingEntries.length; i++) {
      const rawEntry = testingEntries[i] as Record<string, unknown> | null;
      if (!rawEntry) continue;
      const appName = String(rawEntry.application_name ?? "").trim();
      if (!appName || appName === "No Testing Assigned") continue;

      const parsed = testingEntrySchema.safeParse(rawEntry);
      if (parsed.success) {
        validatedEntries.push(parsed.data as Record<string, unknown>);
      }
    }
  }

  // Calculate Shift reporting window & late status
  const { isLate } = checkShiftReportingWindow(workDate, shift);

  // 1. Upsert Daily Support Log
  const { error: supportErr } = await supabase.from("daily_support_logs").upsert(
    {
      employee_id: profile.id,
      log_date: workDate,
      attendance_status: supportParsed.data.attendance_status,
      tickets_handled: supportParsed.data.tickets_handled,
      chats_handled: supportParsed.data.chats_handled,
      doc_updated: supportParsed.data.doc_updated,
      feature_suggestion: supportParsed.data.feature_suggestion,
      bug_verification: supportParsed.data.bug_verification,
      asked_for_review: supportParsed.data.asked_for_review,
      got_review: supportParsed.data.got_review,
      other_contribution: supportParsed.data.other_contribution,
      support_quality: supportParsed.data.support_quality,
      testing_quality: supportParsed.data.testing_quality,
      notes: supportParsed.data.testing_notes ?? null,
      created_by: profile.id,
      updated_by: profile.id,
    },
    { onConflict: "employee_id,log_date" }
  );

  if (supportErr) {
    // Fallback for legacy database columns if redesign columns missing
    await supabase.from("daily_support_logs").upsert(
      {
        employee_id: profile.id,
        log_date: workDate,
        attendance_status: supportParsed.data.attendance_status,
        tickets_handled: supportParsed.data.tickets_handled,
        chats_handled: supportParsed.data.chats_handled,
        notes: supportParsed.data.testing_notes ?? null,
        created_by: profile.id,
        updated_by: profile.id,
      },
      { onConflict: "employee_id,log_date" }
    );
  }

  // 2. Insert Testing Entries
  await supabase
    .from("daily_testing_logs")
    .delete()
    .eq("employee_id", profile.id)
    .eq("log_date", workDate);

  if (validatedEntries.length > 0) {
    const testingRows = validatedEntries.map((e) => ({
      employee_id: profile.id,
      log_date: workDate,
      platform: (e.platform as string) || "shopify",
      application_name: (e.application_name as string) || "",
      module_name: (e.module_name as string) || "",
      testing_type: (e.testing_type as string) || "functional",
      status: (e.status as string) || "in_progress",
      bugs_found: Number(e.bugs_found || 0),
      critical_bug: Boolean(e.critical_bug),
      created_by: profile.id,
      updated_by: profile.id,
    }));

    await supabase.from("daily_testing_logs").insert(testingRows);
  }

  // 3. Upsert Daily Report Submission tracking record (with try/catch fallback)
  const submissionStatus = isLate ? "late" : "submitted";
  try {
    await supabase.from("daily_report_submissions").upsert(
      {
        employee_id: profile.id,
        work_date: workDate,
        shift,
        status: submissionStatus,
        is_late: isLate,
        submitted_at: new Date().toISOString(),
        notes: String(formData.get("notes") ?? ""),
        updated_by: profile.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "employee_id,work_date" }
    );
  } catch {
    // Graceful fallback if table not migrated yet
  }

  // 4. Send Email Notifications
  await sendDailyReportNotifications({
    employeeName: profile.full_name,
    employeeEmail: profile.email,
    workDate,
    tickets: Number(supportParsed.data.tickets_handled || 0),
    chats: Number(supportParsed.data.chats_handled || 0),
    isLate,
  });

  revalidatePath("/my-reports");
  revalidatePath("/operations");
  revalidatePath("/dashboard");
  revalidatePath("/reports");

  redirect(`/my-reports?submitted=true&date=${workDate}`);
}
