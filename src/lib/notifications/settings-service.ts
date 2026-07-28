import { createClient } from "@/lib/supabase/server";
import type { EmailSettings } from "./types";

export const DEFAULT_EMAIL_SETTINGS: EmailSettings = {
  resend_api_key: process.env.RESEND_API_KEY || "",
  sender_email: process.env.EMAIL_FROM || "SupportOps <onboarding@resend.dev>",
  primary_manager_email: process.env.MANAGER_EMAIL || "mane@thaliatechnologies.com",
  cc_recipients: [],
  admin_recipients: [],
  app_url: process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000",
  notify_employee_confirmation: true,
  notify_manager_submission: true,
  notify_daily_reminder: false,
  notify_late_submission: false,
  notify_missing_report: false,
  notify_weekly_summary: false,
  notify_monthly_summary: false,
};

export async function getEmailSettings(): Promise<EmailSettings> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("email_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return DEFAULT_EMAIL_SETTINGS;
    }

    return {
      id: data.id,
      resend_api_key: data.resend_api_key || DEFAULT_EMAIL_SETTINGS.resend_api_key,
      sender_email: data.sender_email || DEFAULT_EMAIL_SETTINGS.sender_email,
      primary_manager_email: data.primary_manager_email || DEFAULT_EMAIL_SETTINGS.primary_manager_email,
      cc_recipients: Array.isArray(data.cc_recipients) ? data.cc_recipients : [],
      admin_recipients: Array.isArray(data.admin_recipients) ? data.admin_recipients : [],
      app_url: data.app_url || DEFAULT_EMAIL_SETTINGS.app_url,
      notify_employee_confirmation: data.notify_employee_confirmation ?? true,
      notify_manager_submission: data.notify_manager_submission ?? true,
      notify_daily_reminder: data.notify_daily_reminder ?? false,
      notify_late_submission: data.notify_late_submission ?? false,
      notify_missing_report: data.notify_missing_report ?? false,
      notify_weekly_summary: data.notify_weekly_summary ?? false,
      notify_monthly_summary: data.notify_monthly_summary ?? false,
    };
  } catch {
    return DEFAULT_EMAIL_SETTINGS;
  }
}

export async function updateEmailSettings(settings: Partial<EmailSettings>): Promise<{ success: boolean; message?: string }> {
  try {
    const supabase = await createClient();
    const current = await getEmailSettings();

    const payload = {
      id: current.id || "00000000-0000-0000-0000-000000000001",
      resend_api_key: settings.resend_api_key ?? current.resend_api_key,
      sender_email: settings.sender_email ?? current.sender_email,
      primary_manager_email: settings.primary_manager_email ?? current.primary_manager_email,
      cc_recipients: settings.cc_recipients ?? current.cc_recipients,
      admin_recipients: settings.admin_recipients ?? current.admin_recipients,
      app_url: settings.app_url ?? current.app_url,
      notify_employee_confirmation: settings.notify_employee_confirmation ?? current.notify_employee_confirmation,
      notify_manager_submission: settings.notify_manager_submission ?? current.notify_manager_submission,
      notify_daily_reminder: settings.notify_daily_reminder ?? current.notify_daily_reminder,
      notify_late_submission: settings.notify_late_submission ?? current.notify_late_submission,
      notify_missing_report: settings.notify_missing_report ?? current.notify_missing_report,
      notify_weekly_summary: settings.notify_weekly_summary ?? current.notify_weekly_summary,
      notify_monthly_summary: settings.notify_monthly_summary ?? current.notify_monthly_summary,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("email_settings").upsert(payload);
    if (error) {
      if (error.message.includes("schema cache") || error.message.includes("does not exist")) {
        return {
          success: false,
          message: "Database tables missing in Supabase. Please run the provided SQL script in your Supabase SQL Editor.",
        };
      }
      return { success: false, message: error.message };
    }

    return { success: true, message: "Email settings saved successfully!" };
  } catch (err: any) {
    return { success: false, message: err?.message || "Failed to update settings." };
  }
}
