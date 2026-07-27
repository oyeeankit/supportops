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

  const isTrue = (val: FormDataEntryValue | null) => val === "on" || val === "true" || val === "1" || val === true;

  // Parse support data
  const supportPayload = {
    employee_id: employeeId,
    log_date: logDate,
    attendance_status: String(formData.get("attendance_status") ?? "present"),
    tickets_handled: formData.get("tickets_handled"),
    chats_handled: formData.get("chats_handled"),
    doc_updated: isTrue(formData.get("doc_updated")),
    feature_suggestion: isTrue(formData.get("feature_suggestion")),
    bug_verification: isTrue(formData.get("bug_verification")),
    asked_for_review: isTrue(formData.get("asked_for_review")),
    got_review: isTrue(formData.get("got_review")),
    other_contribution: isTrue(formData.get("other_contribution")),
    support_quality: String(formData.get("support_quality") ?? "good"),
    testing_quality: String(formData.get("testing_quality") ?? "good"),
    testing_notes: formData.get("testing_notes"),
  };

  const supportParsed = dailySupportLogSchema.safeParse(supportPayload);
  if (!supportParsed.success) {
    return {
      message: "Please fix the highlighted fields.",
      fieldErrors: supportParsed.error.flatten().fieldErrors,
    };
  }

  const safeTestingTypeForDb = (type: string): string => {
    const allowed = ["functional", "regression", "bug_verification", "exploratory"];
    const t = String(type).trim().toLowerCase();
    if (allowed.includes(t)) {
      return t;
    }
    if (t === "smoke") return "functional";
    if (t === "ui_ux") return "exploratory";
    if (t === "performance") return "regression";
    if (t === "integration") return "functional";
    if (t === "api") return "functional";
    if (t === "database") return "functional";
    if (t === "security") return "functional";
    return "functional";
  };

  const safeTestingStatusForDb = (status: string): string => {
    const allowed = ["in_progress", "completed"];
    const s = String(status).trim().toLowerCase();
    if (allowed.includes(s)) {
      return s;
    }
    if (s === "blocked" || s === "on_hold") {
      return "in_progress";
    }
    return "in_progress";
  };

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
    const rawEntry = testingEntries[i] as Record<string, unknown> | null;
    if (!rawEntry) continue;
    const appName = String(rawEntry.application_name ?? "").trim();
    
    // Skip empty or "No Testing Assigned" entries so they don't block saving
    if (!appName || appName === "No Testing Assigned") {
      continue;
    }

    const parsed = testingEntrySchema.safeParse(rawEntry);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[] | undefined>;
      const fieldKeys = Object.keys(fieldErrors);
      return {
        message: `Entry #${i + 1}: ${fieldKeys.map((k) => fieldErrors[k]?.[0]).filter(Boolean).join(", ")}`,
      };
    }
    validatedEntries.push({
      ...parsed.data,
      testing_type: safeTestingTypeForDb(parsed.data.testing_type),
      status: safeTestingStatusForDb(parsed.data.status),
    });
  }

  // Validation of testing entries complete

  // Call the RPC function for transactional save
  const { data: rpcResult, error: rpcError } = await supabase.rpc("save_daily_operations", {
    p_employee_id: employeeId,
    p_log_date: logDate,
    p_attendance_status: supportParsed.data.attendance_status,
    p_tickets_handled: supportParsed.data.tickets_handled,
    p_chats_handled: supportParsed.data.chats_handled,
    p_doc_updated: supportParsed.data.doc_updated,
    p_feature_suggestion: supportParsed.data.feature_suggestion,
    p_bug_verification: supportParsed.data.bug_verification,
    p_asked_for_review: supportParsed.data.asked_for_review,
    p_got_review: supportParsed.data.got_review,
    p_other_contribution: supportParsed.data.other_contribution,
    p_support_quality: supportParsed.data.support_quality,
    p_testing_quality: supportParsed.data.testing_quality,
    p_testing_notes: supportParsed.data.testing_notes ?? null,
    p_testing_entries: validatedEntries,
    p_profile_id: profile.id,
  });

  const rpcSuccess = !rpcError && (rpcResult as { success?: boolean })?.success === true;

  if (!rpcSuccess) {
    // If RPC fails or returns error in json (e.g. function missing/mismatch in Supabase schema cache), execute direct table upsert fallback
    const { error: supportUpsertErr } = await supabase
      .from("daily_support_logs")
      .upsert(
        {
          employee_id: employeeId,
          log_date: logDate,
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
          testing_notes: supportParsed.data.testing_notes ?? null,
          created_by: profile.id,
          updated_by: profile.id,
        },
        { onConflict: "employee_id,log_date" },
      );

    if (supportUpsertErr) {
      // If redesign columns (e.g. asked_for_review) don't exist in remote table yet, fall back to legacy columns
      const { error: legacyErr } = await supabase
        .from("daily_support_logs")
        .upsert(
          {
            employee_id: employeeId,
            log_date: logDate,
            attendance_status: supportParsed.data.attendance_status,
            tickets_handled: supportParsed.data.tickets_handled,
            chats_handled: supportParsed.data.chats_handled,
            notes: supportParsed.data.testing_notes ?? null,
            created_by: profile.id,
            updated_by: profile.id,
          },
          { onConflict: "employee_id,log_date" },
        );

      if (legacyErr) {
        return { message: supportUpsertErr.message };
      }
    }

    // Delete existing testing logs for this date
    await supabase
      .from("daily_testing_logs")
      .delete()
      .eq("employee_id", employeeId)
      .eq("log_date", logDate);

    // Insert new testing entries
    if (validatedEntries.length > 0) {
      const testingRows = validatedEntries.map((e) => ({
        employee_id: employeeId,
        log_date: logDate,
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

      const { error: testingErr } = await supabase
        .from("daily_testing_logs")
        .insert(testingRows);

      if (testingErr) {
        // Fallback Tier 2: Try with legacy column critical_bugs_found + platform
        const legacyTestingRows = validatedEntries.map((e) => ({
          employee_id: employeeId,
          log_date: logDate,
          platform: (e.platform as string) || "shopify",
          application_name: (e.application_name as string) || "",
          module_name: (e.module_name as string) || "",
          testing_type: (e.testing_type as string) || "functional",
          status: (e.status as string) || "in_progress",
          bugs_found: Number(e.bugs_found || 0),
          critical_bugs_found: Number(e.critical_bug ? 1 : 0),
          created_by: profile.id,
          updated_by: profile.id,
        }));

        const { error: legacyTestingErr } = await supabase
          .from("daily_testing_logs")
          .insert(legacyTestingRows);

        if (legacyTestingErr) {
          // Fallback Tier 3: Try with bare essential columns guaranteed in all schema versions
          const bareTestingRows = validatedEntries.map((e) => ({
            employee_id: employeeId,
            log_date: logDate,
            application_name: (e.application_name as string) || "",
            module_name: (e.module_name as string) || "",
            testing_type: (e.testing_type as string) || "functional",
            status: (e.status as string) || "in_progress",
            bugs_found: Number(e.bugs_found || 0),
            created_by: profile.id,
            updated_by: profile.id,
          }));

          const { error: bareTestingErr } = await supabase
            .from("daily_testing_logs")
            .insert(bareTestingRows);

          if (bareTestingErr) {
            return { message: bareTestingErr.message };
          }
        }
      }
    }
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

  let supportLog: DailySupportLog | null = (sr.data as DailySupportLog | null) ?? null;
  let testingLogs: DailyTestingLog[] = (tr.data as DailyTestingLog[] | null) ?? [];

  if (sr.error) {
    const { data: fallbackSupport } = await supabase
      .from("daily_support_logs")
      .select("id, employee_id, log_date, attendance_status, tickets_handled, chats_handled, notes, created_at, updated_at")
      .eq("employee_id", employeeId)
      .eq("log_date", logDate)
      .maybeSingle();

    if (fallbackSupport) {
      supportLog = {
        ...fallbackSupport,
        doc_updated: false,
        feature_suggestion: false,
        bug_verification: false,
        asked_for_review: false,
        got_review: false,
        other_contribution: false,
        support_quality: "average" as const,
        testing_quality: "average" as const,
        testing_notes: (fallbackSupport as { notes?: string | null }).notes ?? null,
        created_by: null,
        updated_by: null,
      } as DailySupportLog;
    }
  }

  if (tr.error) {
    const { data: fallbackTesting } = await supabase
      .from("daily_testing_logs")
      .select("id, employee_id, log_date, application_name, module_name, testing_type, status, bugs_found, created_at, updated_at")
      .eq("employee_id", employeeId)
      .eq("log_date", logDate)
      .order("created_at", { ascending: true });

    if (fallbackTesting) {
      testingLogs = fallbackTesting.map((row) => ({
        ...row,
        platform: "shopify" as const,
        critical_bug: false,
        created_by: null,
        updated_by: null,
      })) as DailyTestingLog[];
    }
  }

  return {
    supportLog,
    testingLogs,
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
