import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { getEmailSettings } from "./settings-service";
import type { EmailQueueItem } from "./types";

export async function enqueueEmail(params: {
  reportId?: string;
  recipientEmail: string;
  ccEmails?: string[];
  emailType: string;
  subject: string;
  htmlBody: string;
}): Promise<{ queueId?: string; success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const fifteenSecsAgo = new Date(Date.now() - 15000).toISOString();

    // Check if an identical email was queued in the last 15 seconds (prevents double submission hits)
    const { data: recentDuplicate } = await supabase
      .from("email_queue")
      .select("id")
      .eq("recipient_email", params.recipientEmail)
      .eq("subject", params.subject)
      .gte("created_at", fifteenSecsAgo)
      .maybeSingle();

    if (recentDuplicate) {
      console.log(`[EmailQueue] Skipping duplicate email dispatch to ${params.recipientEmail}`);
      return { success: true, queueId: recentDuplicate.id };
    }

    const payload = {
      report_id: params.reportId || null,
      recipient_email: params.recipientEmail,
      cc_emails: params.ccEmails || [],
      email_type: params.emailType,
      subject: params.subject,
      html_body: params.htmlBody,
      status: "pending",
      attempts: 0,
      max_attempts: 3,
      scheduled_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("email_queue")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      console.error("[EmailQueue] Insert failed:", error.message);
      return { success: false, error: error.message };
    }

    // Trigger immediate send processing
    if (data?.id) {
      processSingleQueueItem(data.id).catch((err) => {
        console.error("[EmailQueue] Immediate process error:", err);
      });
    }

    return { success: true, queueId: data?.id };
  } catch (err: any) {
    console.error("[EmailQueue] Enqueue exception:", err?.message || err);
    return { success: false, error: err?.message || "Failed to queue email" };
  }
}

export async function processSingleQueueItem(queueId: string): Promise<boolean> {
  const supabase = await createClient();
  const settings = await getEmailSettings();

  const { data: item } = await supabase
    .from("email_queue")
    .select("*")
    .eq("id", queueId)
    .maybeSingle();

  if (!item) return false;

  const resendKey = settings.resend_api_key;
  if (!resendKey) {
    await supabase
      .from("email_queue")
      .update({
        status: "failed",
        attempts: item.attempts + 1,
        error_message: "Resend API key missing in settings",
      })
      .eq("id", queueId);
    return false;
  }

  const resend = new Resend(resendKey);

  try {
    const res = await resend.emails.send({
      from: settings.sender_email,
      to: [item.recipient_email],
      cc: item.cc_emails && item.cc_emails.length > 0 ? item.cc_emails : undefined,
      subject: item.subject,
      html: item.html_body,
    });

    if (res.error) {
      const isDevFallback = res.error.message?.includes("onboarding@resend.dev") || res.error.name === "validation_error";
      await supabase
        .from("email_queue")
        .update({
          status: "failed",
          attempts: item.attempts + 1,
          error_message: res.error.message || "Resend API error",
        })
        .eq("id", queueId);

      console.error(`[EmailQueue] Delivery failed for ${item.recipient_email}:`, res.error.message);
      return false;
    }

    await supabase
      .from("email_queue")
      .update({
        status: "sent",
        attempts: item.attempts + 1,
        sent_at: new Date().toISOString(),
        error_message: null,
      })
      .eq("id", queueId);

    console.log(`[EmailQueue] Successfully sent email to ${item.recipient_email} (Queue ID: ${queueId})`);
    return true;
  } catch (err: any) {
    await supabase
      .from("email_queue")
      .update({
        status: "failed",
        attempts: item.attempts + 1,
        error_message: err?.message || "Delivery exception",
      })
      .eq("id", queueId);

    console.error(`[EmailQueue] Delivery exception for ${item.recipient_email}:`, err?.message || err);
    return false;
  }
}

export async function processPendingQueue(): Promise<{ processed: number; sent: number; failed: number }> {
  try {
    const supabase = await createClient();
    const { data: items } = await supabase
      .from("email_queue")
      .select("id")
      .or("status.eq.pending,status.eq.failed")
      .lt("attempts", 3)
      .order("created_at", { ascending: true })
      .limit(10);

    if (!items || items.length === 0) {
      return { processed: 0, sent: 0, failed: 0 };
    }

    let sentCount = 0;
    let failedCount = 0;

    for (const item of items) {
      const ok = await processSingleQueueItem(item.id);
      if (ok) sentCount++;
      else failedCount++;
    }

    return { processed: items.length, sent: sentCount, failed: failedCount };
  } catch {
    return { processed: 0, sent: 0, failed: 0 };
  }
}
