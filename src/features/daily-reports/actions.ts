"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/auth/session";
import { checkShiftReportingWindow, validateBackdatedLimit } from "./utils/shift-rules";
import type { Shift, AttendanceStatus } from "../daily-operations/types";
import { dailySupportLogSchema, testingEntrySchema } from "../daily-operations/schemas";
import { sendDailyReportNotification } from "@/lib/notifications/email-service";

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

  // Validate backdated restriction
  const dateCheck = validateBackdatedLimit(workDate);
  if (!dateCheck.allowed) {
    return { message: dateCheck.reason };
  }

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
  const shift = (String(formData.get("shift") ?? "day") as Shift);
  const attendanceStatus = String(formData.get("attendance_status") ?? "present");

  // Enforce 1-day backdated limit
  const dateCheck = validateBackdatedLimit(workDate);
  if (!dateCheck.allowed) {
    return { message: dateCheck.reason };
  }

  // Enforce 1 report per day limit — prevent duplicate submissions
  const { data: existingReport } = await supabase
    .from("daily_support_logs")
    .select("id")
    .eq("employee_id", profile.id)
    .eq("log_date", workDate)
    .maybeSingle();

  if (existingReport) {
    return {
      message: `You have already submitted a daily report for ${workDate}. Duplicate submissions for the same date are not allowed.`,
    };
  }

  const { isLate } = checkShiftReportingWindow(workDate, shift);

  const supportParsed = dailySupportLogSchema.safeParse({
    attendance_status: attendanceStatus,
    tickets_handled: Number(formData.get("tickets_handled") ?? 0),
    tickets_pending: Number(formData.get("tickets_pending") ?? 0),
    chats_handled: Number(formData.get("chats_handled") ?? 0),
    calls_handled: Number(formData.get("calls_handled") ?? 0),
    notes: String(formData.get("notes") ?? ""),
  });

  if (!supportParsed.success) {
    return {
      fieldErrors: supportParsed.error.flatten().fieldErrors,
      message: "Please fix the errors in your report form.",
    };
  }

  let testingEntriesRaw: any[] = [];
  try {
    const raw = String(formData.get("testing_entries_json") ?? "[]");
    testingEntriesRaw = JSON.parse(raw);
  } catch {
    testingEntriesRaw = [];
  }

  const validatedEntries = testingEntriesRaw
    .map((e) => testingEntrySchema.safeParse(e))
    .filter((r) => r.success)
    .map((r) => r.data!);

  // Upsert to ensure single entry per (employee_id, log_date) — prevents duplicates
  await supabase.from("daily_support_logs").upsert(
    {
      employee_id: profile.id,
      log_date: workDate,
      attendance_status: supportParsed.data.attendance_status,
      tickets_handled: supportParsed.data.tickets_handled,
      chats_handled: supportParsed.data.chats_handled,
      notes: String(formData.get("notes") ?? ""),
      created_by: profile.id,
      updated_by: profile.id,
    },
    { onConflict: "employee_id,log_date" }
  );

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
    // Graceful fallback
  }

  sendDailyReportNotification({
    employeeName: profile.full_name,
    employeeEmail: profile.email,
    workDate,
    shift: String(shift || "Day Shift"),
    attendance: String(formData.get("attendance_status") ?? "present"),
    ticketsHandled: Number(supportParsed.data.tickets_handled || 0),
    chatsHandled: Number(supportParsed.data.chats_handled || 0),
    contributions: [],
    testingCount: validatedEntries.length,
    testingEntries: validatedEntries.map((e: any) => ({
      platform: e.platform || "shopify",
      application_name: e.application_name || "App Testing",
      bugs_found: Number(e.bugs_found || 0),
      critical_bug: Boolean(e.critical_bug),
    })),
    notes: String(formData.get("notes") ?? ""),
    submissionTime: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
  }).catch((err) => {
    console.error("[Notification Service] Email trigger error:", err);
  });

  revalidatePath("/my-reports");
  revalidatePath("/operations");
  revalidatePath("/dashboard");
  revalidatePath("/reports");

  redirect(`/my-reports?submitted=true&date=${workDate}`);
}

export type PublicSubmittedReport = {
  email: string;
  fullName: string;
  workDate: string;
  ticketsHandled: number;
  chatsHandled: number;
  contributions: string[];
  testingCount: number;
  notes: string;
  isUpdate?: boolean;
};

export type PublicReportActionState = {
  message?: string;
  saved?: boolean;
  submittedReport?: PublicSubmittedReport;
};

export async function submitPublicDailyReportAction(
  _: PublicReportActionState,
  formData: FormData
): Promise<PublicReportActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const now = new Date();
  const localToday = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const workDate = String(formData.get("work_date") ?? localToday);
  const attendanceStatus = String(formData.get("attendance_status") ?? "present");
  const ticketsHandled = Math.max(0, Number(formData.get("tickets_handled") ?? 0));
  const chatsHandled = Math.max(0, Number(formData.get("chats_handled") ?? 0));
  const notes = String(formData.get("notes") ?? "");

  if (!email || !email.includes("@")) {
    return { message: "Please enter a valid work email address." };
  }

  // 1. Enforce 1-day backdated restriction
  const dateCheck = validateBackdatedLimit(workDate);
  if (!dateCheck.allowed) {
    return { message: dateCheck.reason };
  }

  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  // 2. Find or provision profile for this email (case-insensitive)
  let { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, role_id")
    .ilike("email", email)
    .maybeSingle();

  if (!profile) {
    const { data: exactProfile } = await supabase
      .from("profiles")
      .select("id, full_name, email, role_id")
      .eq("email", email)
      .maybeSingle();
    profile = exactProfile;
  }

  if (!profile) {
    const isQA = email.toLowerCase().includes("shivam") || email.toLowerCase().includes("qa");
    const roleName = isQA ? "qa_engineer" : "support_engineer";
    let { data: roleData } = await supabase.from("roles").select("id").eq("name", roleName).maybeSingle();
    
    if (!roleData) {
      const { data: fallbackRole } = await supabase.from("roles").select("id").limit(1).maybeSingle();
      roleData = fallbackRole;
    }

    const nameParts = email.split("@")[0].split(/[._-]/);
    const fullName = nameParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ") || email;
    
    const insertPayload: Record<string, any> = {
      full_name: fullName,
      email: email.toLowerCase().trim(),
      role: roleName,
      employment_status: "active",
      shift: "day",
    };
    if (roleData?.id) {
      insertPayload.role_id = roleData.id;
    }

    const { data: newProfile, error: insertError } = await supabase
      .from("profiles")
      .insert(insertPayload)
      .select("id, full_name, email, role_id")
      .maybeSingle();

    if (newProfile) {
      profile = newProfile;
    } else {
      if (insertError) {
        console.error("[submitPublicDailyReportAction] Auto-provision error:", insertError.message);
      }
      // Retry minimal insert without role_id if constraint failed
      const { data: retryProfile } = await supabase
        .from("profiles")
        .insert({
          full_name: fullName,
          email: email.toLowerCase().trim(),
          employment_status: "active",
        })
        .select("id, full_name, email, role_id")
        .maybeSingle();
      profile = retryProfile;
    }
  }

  if (!profile) {
    return { message: "Could not record profile for this email. Please check your email address or ensure database migration has been run." };
  }

  // Check if an existing report already exists for this (employee_id, workDate)
  const { data: existingLog } = await supabase
    .from("daily_support_logs")
    .select("id")
    .eq("employee_id", profile.id)
    .eq("log_date", workDate)
    .maybeSingle();

  if (existingLog) {
    return {
      message: `A daily report for ${workDate} has already been submitted for ${profile.full_name} (${email}). Only 1 report per day is allowed.`,
    };
  }

  // Contributions for Scoring
  const docUpdated = Boolean(formData.get("doc_updated"));
  const featureSuggestion = Boolean(formData.get("feature_suggestion"));
  const bugVerification = Boolean(formData.get("bug_verification"));
  const askedForReview = Boolean(formData.get("asked_for_review"));
  const gotReview = Boolean(formData.get("got_review"));
  const otherContribution = Boolean(formData.get("other_contribution"));
  const customContribution = String(formData.get("custom_contribution") ?? "").trim();

  const contributionList: string[] = [];
  if (docUpdated) contributionList.push("Doc / KB Updated (+Points)");
  if (featureSuggestion) contributionList.push("Feature Suggestion Logged");
  if (bugVerification) contributionList.push("Bug Verification Conducted");
  if (askedForReview) contributionList.push("Asked for Review");
  if (gotReview) contributionList.push("Received Customer Review ⭐");
  if (otherContribution) contributionList.push("Other Team Contribution");
  if (customContribution) contributionList.push(`Custom: ${customContribution}`);

  let testingEntriesRaw: any[] = [];
  try {
    const raw = String(formData.get("testing_entries_json") ?? "[]");
    testingEntriesRaw = JSON.parse(raw);
  } catch {
    testingEntriesRaw = [];
  }

  const combinedNotes = [
    notes,
    contributionList.length > 0 ? `Contributions: ${contributionList.join(", ")}` : "",
  ].filter(Boolean).join("\n\n");

  // 3. Upsert support log — prevents duplicate rows for same employee & date
  const { error: supportUpsertError } = await supabase.from("daily_support_logs").upsert(
    {
      employee_id: profile.id,
      log_date: workDate,
      attendance_status: attendanceStatus,
      tickets_handled: ticketsHandled,
      chats_handled: chatsHandled,
      tickets_pending: 0,
      calls_handled: 0,
      doc_updated: docUpdated,
      feature_suggestion: featureSuggestion,
      bug_verification: bugVerification,
      asked_for_review: askedForReview,
      got_review: gotReview,
      other_contribution: otherContribution,
      notes: combinedNotes,
    },
    { onConflict: "employee_id,log_date" }
  );

  if (supportUpsertError) {
    console.warn("[submitPublicDailyReportAction] Full upsert failed, retrying with core fields:", supportUpsertError.message);
    await supabase.from("daily_support_logs").upsert(
      {
        employee_id: profile.id,
        log_date: workDate,
        attendance_status: attendanceStatus,
        tickets_handled: ticketsHandled,
        chats_handled: chatsHandled,
        notes: combinedNotes,
      },
      { onConflict: "employee_id,log_date" }
    );
  }

  if (testingEntriesRaw.length > 0) {
    await supabase
      .from("daily_testing_logs")
      .delete()
      .eq("employee_id", profile.id)
      .eq("log_date", workDate);

    const testingRows = testingEntriesRaw.map((e: any) => ({
      employee_id: profile.id,
      log_date: workDate,
      platform: e.platform || "shopify",
      application_name: e.application_name || "App Testing",
      module_name: e.module_name || "",
      testing_type: e.testing_type || "functional",
      status: e.status || "completed",
      bugs_found: Number(e.bugs_found || 0),
      critical_bug: Boolean(e.critical_bug),
    }));

    await supabase.from("daily_testing_logs").insert(testingRows);
  }

  try {
    await supabase.from("daily_report_submissions").upsert(
      {
        employee_id: profile.id,
        work_date: workDate,
        shift: "day",
        status: "submitted",
        is_late: false,
        submitted_at: new Date().toISOString(),
        notes: notes,
      },
      { onConflict: "employee_id,work_date" }
    );
  } catch {
    // Ignore fallback
  }

  // 4. Trigger Email Notifications to Employee & Manager (Non-blocking)
  sendDailyReportNotification({
    employeeName: profile.full_name,
    employeeEmail: email,
    workDate,
    shift: "Day Shift (10 AM - 6 PM)",
    attendance: attendanceStatus,
    ticketsHandled,
    chatsHandled,
    contributions: contributionList,
    testingCount: testingEntriesRaw.length,
    testingEntries: testingEntriesRaw.map((e: any) => ({
      platform: e.platform || "shopify",
      application_name: e.application_name || "App Testing",
      bugs_found: Number(e.bugs_found || 0),
      critical_bug: Boolean(e.critical_bug),
    })),
    notes,
    submissionTime: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
  }).catch((err) => {
    console.error("[Notification Service] Email trigger error:", err);
  });

  revalidatePath("/dashboard");
  revalidatePath("/operations");
  revalidatePath("/reports");

  return {
    saved: true,
    message: "Daily report submitted successfully!",
    submittedReport: {
      email: profile.email,
      fullName: profile.full_name,
      workDate,
      ticketsHandled,
      chatsHandled,
      contributions: contributionList,
      testingCount: testingEntriesRaw.length,
      notes,
    },
  };
}

export async function resetAllDailyDataAction(): Promise<{ message: string; success: boolean }> {
  const { profile } = await requireUser();
  if (profile.role !== "manager") {
    return { success: false, message: "Only managers can reset daily report data." };
  }

  const supabase = await createClient();

  // Delete all daily support logs, testing logs, and submissions
  await supabase.from("daily_support_logs").delete().gte("created_at", "2000-01-01T00:00:00Z");
  await supabase.from("daily_testing_logs").delete().gte("created_at", "2000-01-01T00:00:00Z");
  try {
    await supabase.from("daily_report_submissions").delete().gte("created_at", "2000-01-01T00:00:00Z");
    await supabase.from("daily_operations").delete().gte("created_at", "2000-01-01T00:00:00Z");
  } catch {
    // Ignore fallback table errors
  }

  revalidatePath("/", "layout");
  revalidatePath("/dashboard");
  revalidatePath("/operations");
  revalidatePath("/reports");
  revalidatePath("/operations/submissions");

  return { success: true, message: "All daily report data & numbers have been reset to 0." };
}
