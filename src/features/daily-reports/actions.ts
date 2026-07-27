"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { checkShiftReportingWindow, validateBackdatedLimit } from "./utils/shift-rules";

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
  const shift = (String(formData.get("shift") ?? "day")) as Shift;
  const attendanceStatus = String(formData.get("attendance_status") ?? "present");

  // Enforce 1-day backdated limit
  const dateCheck = validateBackdatedLimit(workDate);
  if (!dateCheck.allowed) {
    return { message: dateCheck.reason };
  }

  const { isLate, allowed, reason } = checkShiftReportingWindow(shift, workDate);
  if (!allowed) {
    return { message: reason || "Reporting window for this shift has closed." };
  }

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
  if (supportParsed.data.attendance_status === "present" || supportParsed.data.attendance_status === "wfh") {
    await supabase.from("daily_support_logs").upsert(
      {
        employee_id: profile.id,
        log_date: workDate,
        attendance_status: supportParsed.data.attendance_status,
        tickets_handled: supportParsed.data.tickets_handled,
        tickets_pending: supportParsed.data.tickets_pending,
        chats_handled: supportParsed.data.chats_handled,
        calls_handled: supportParsed.data.calls_handled,
        notes: supportParsed.data.notes,
        created_by: profile.id,
        updated_by: profile.id,
      },
      { onConflict: "employee_id,log_date" }
    );
  }

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

  const supabase = await createClient();

  // 2. Find or provision profile for this email (case-insensitive)
  let { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, role_id")
    .ilike("email", email)
    .maybeSingle();

  if (!profile) {
    const isQA = email.includes("shivam") || email.includes("qa");
    const roleName = isQA ? "qa_engineer" : "support_engineer";
    const { data: roleData } = await supabase.from("roles").select("id").eq("name", roleName).single();
    
    if (roleData) {
      const nameParts = email.split("@")[0].split(".");
      const fullName = nameParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
      const { data: newProfile } = await supabase
        .from("profiles")
        .insert({
          full_name: fullName,
          email: email,
          role_id: roleData.id,
          employment_status: "active",
        })
        .select("id, full_name, email, role_id")
        .single();
      profile = newProfile;
    }
  }

  if (!profile) {
    return { message: "Could not record profile for this email. Please check your email address." };
  }

  // Check if an existing report already exists for this (employee_id, workDate)
  const { data: existingLog } = await supabase
    .from("daily_support_logs")
    .select("id")
    .eq("employee_id", profile.id)
    .eq("log_date", workDate)
    .maybeSingle();

  const isUpdate = Boolean(existingLog);

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
  await supabase.from("daily_support_logs").upsert(
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

  revalidatePath("/dashboard");
  revalidatePath("/operations");
  revalidatePath("/reports");

  return {
    saved: true,
    message: isUpdate
      ? `Existing report for ${workDate} updated successfully!`
      : "Daily report submitted successfully!",
    submittedReport: {
      email: profile.email,
      fullName: profile.full_name,
      workDate,
      ticketsHandled,
      chatsHandled,
      contributions: contributionList,
      testingCount: testingEntriesRaw.length,
      notes,
      isUpdate,
    },
  };
}
