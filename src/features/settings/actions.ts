"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getEmailSettings, updateEmailSettings } from "@/lib/notifications/settings-service";
import { processSingleQueueItem, processPendingQueue } from "@/lib/notifications/queue-processor";
import type { EmailSettings, EmailQueueItem } from "@/lib/notifications/types";

export async function getEmailSettingsAction(): Promise<EmailSettings> {
  return await getEmailSettings();
}

export async function updateEmailSettingsAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  const parseList = (val: string) =>
    val
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const settings: Partial<EmailSettings> = {
    resend_api_key: String(formData.get("resend_api_key") || "").trim(),
    sender_email: String(formData.get("sender_email") || "").trim(),
    primary_manager_email: String(formData.get("primary_manager_email") || "").trim(),
    cc_recipients: parseList(String(formData.get("cc_recipients") || "")),
    admin_recipients: parseList(String(formData.get("admin_recipients") || "")),
    app_url: String(formData.get("app_url") || "").trim(),
    notify_employee_confirmation: formData.get("notify_employee_confirmation") === "on",
    notify_manager_submission: formData.get("notify_manager_submission") === "on",
    notify_daily_reminder: formData.get("notify_daily_reminder") === "on",
    notify_late_submission: formData.get("notify_late_submission") === "on",
    notify_missing_report: formData.get("notify_missing_report") === "on",
    notify_weekly_summary: formData.get("notify_weekly_summary") === "on",
    notify_monthly_summary: formData.get("notify_monthly_summary") === "on",
  };

  const res = await updateEmailSettings(settings);

  revalidatePath("/settings");
  return {
    success: res.success,
    message: res.message || (res.success ? "Settings saved!" : "Failed to save settings."),
  };
}

export async function getEmailLogsAction(): Promise<EmailQueueItem[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("email_queue")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    return (data as EmailQueueItem[]) || [];
  } catch {
    return [];
  }
}

export async function retryQueuedEmailAction(queueId: string): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();
    // Reset attempt counter so queue processor re-runs
    await supabase
      .from("email_queue")
      .update({ status: "pending", error_message: null })
      .eq("id", queueId);

    const ok = await processSingleQueueItem(queueId);
    revalidatePath("/settings");

    return {
      success: ok,
      message: ok ? "Email resent successfully!" : "Failed to resend email. Check log output.",
    };
  } catch (err: any) {
    return { success: false, message: err?.message || "Failed to retry email." };
  }
}

export async function processEmailQueueNowAction(): Promise<{ success: boolean; message: string }> {
  const result = await processPendingQueue();
  revalidatePath("/settings");
  return {
    success: true,
    message: `Queue processed: ${result.sent} sent, ${result.failed} failed out of ${result.processed} items.`,
  };
}
