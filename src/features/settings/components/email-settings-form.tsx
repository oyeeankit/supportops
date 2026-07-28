"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { updateEmailSettingsAction } from "../actions";
import type { EmailSettings } from "@/lib/notifications/types";
import { Mail, Key, Shield, Eye, EyeOff, Save, CheckCircle2, AlertCircle, Users, Bell } from "lucide-react";

interface EmailSettingsFormProps {
  initialSettings: EmailSettings;
}

export function EmailSettingsForm({ initialSettings }: EmailSettingsFormProps) {
  const [settings, setSettings] = useState<EmailSettings>(initialSettings);
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    const formData = new FormData(e.currentTarget);
    const res = await updateEmailSettingsAction(formData);

    setIsSaving(false);
    setFeedback(res);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl font-sans">
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm font-semibold border ${
            feedback.success
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
              : "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
          }`}
        >
          {feedback.success ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <AlertCircle className="h-5 w-5 text-rose-600" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* 1. Resend API Credentials */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Key className="h-5 w-5 text-primary" />
          <h2 className="text-base font-extrabold text-foreground">Resend Email API Credentials</h2>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span>Resend API Key</span>
            <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
              Active Provider
            </Badge>
          </Label>
          <div className="relative">
            <Input
              type={showKey ? "text" : "password"}
              name="resend_api_key"
              defaultValue={settings.resend_api_key}
              placeholder="re_xxxxxxxxxxxxxxxxxxxx"
              className="pr-10 font-mono text-xs rounded-xl"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Generate your API key at <a href="https://resend.com/api-keys" target="_blank" rel="noreferrer" className="text-primary underline">resend.com/api-keys</a>.
          </p>
        </div>
      </div>

      {/* 2. Recipient & Server Routing Configuration */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-base font-extrabold text-foreground">Email Routing & Recipients</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-foreground">Sender Email (From)</Label>
            <Input
              type="text"
              name="sender_email"
              defaultValue={settings.sender_email}
              placeholder="SupportOps <onboarding@resend.dev>"
              className="rounded-xl text-xs"
            />
            <p className="text-[11px] text-muted-foreground">Default dev address: onboarding@resend.dev</p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-foreground">Primary Manager Email</Label>
            <Input
              type="email"
              name="primary_manager_email"
              defaultValue={settings.primary_manager_email}
              placeholder="mane@thaliatechnologies.com"
              className="rounded-xl text-xs"
            />
            <p className="text-[11px] text-muted-foreground">Receives all daily report submission alerts.</p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-foreground">CC Recipients (Comma Separated)</Label>
            <Input
              type="text"
              name="cc_recipients"
              defaultValue={settings.cc_recipients.join(", ")}
              placeholder="lead@company.com, coo@company.com"
              className="rounded-xl text-xs"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-foreground">Admin / HR Recipients (Comma Separated)</Label>
            <Input
              type="text"
              name="admin_recipients"
              defaultValue={settings.admin_recipients.join(", ")}
              placeholder="hr@company.com"
              className="rounded-xl text-xs"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-xs font-bold text-foreground">App Base URL</Label>
            <Input
              type="text"
              name="app_url"
              defaultValue={settings.app_url}
              placeholder="http://localhost:3000"
              className="rounded-xl text-xs"
            />
            <p className="text-[11px] text-muted-foreground">Used for direct "View Report in SupportOps" links in manager emails.</p>
          </div>
        </div>
      </div>

      {/* 3. Notification Preferences */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Bell className="h-5 w-5 text-primary" />
          <h2 className="text-base font-extrabold text-foreground">Notification Preferences</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-start gap-3 p-3.5 border border-border rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/30">
            <input
              type="checkbox"
              name="notify_employee_confirmation"
              defaultChecked={settings.notify_employee_confirmation}
              className="mt-0.5 h-4 w-4 accent-primary rounded"
            />
            <div>
              <p className="text-xs font-extrabold text-foreground">Employee Confirmation Email</p>
              <p className="text-[11px] text-muted-foreground">Sends submission receipt to employee after report log.</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3.5 border border-border rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/30">
            <input
              type="checkbox"
              name="notify_manager_submission"
              defaultChecked={settings.notify_manager_submission}
              className="mt-0.5 h-4 w-4 accent-primary rounded"
            />
            <div>
              <p className="text-xs font-extrabold text-foreground">Manager Submission Alert</p>
              <p className="text-[11px] text-muted-foreground">Alerts manager and CC list when report is submitted.</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3.5 border border-border rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/30 opacity-75">
            <input
              type="checkbox"
              name="notify_daily_reminder"
              defaultChecked={settings.notify_daily_reminder}
              className="mt-0.5 h-4 w-4 accent-primary rounded"
            />
            <div>
              <p className="text-xs font-extrabold text-foreground">Daily Shift Reminder</p>
              <p className="text-[11px] text-muted-foreground">Automated reminder before shift ends.</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3.5 border border-border rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/30 opacity-75">
            <input
              type="checkbox"
              name="notify_late_submission"
              defaultChecked={settings.notify_late_submission}
              className="mt-0.5 h-4 w-4 accent-primary rounded"
            />
            <div>
              <p className="text-xs font-extrabold text-foreground">Late Submission Reminder</p>
              <p className="text-[11px] text-muted-foreground">Nudge employees if deadline is approaching.</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3.5 border border-border rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/30 opacity-75">
            <input
              type="checkbox"
              name="notify_missing_report"
              defaultChecked={settings.notify_missing_report}
              className="mt-0.5 h-4 w-4 accent-primary rounded"
            />
            <div>
              <p className="text-xs font-extrabold text-foreground">Missing Report Alert</p>
              <p className="text-[11px] text-muted-foreground">Alert manager if employee misses submission deadline.</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3.5 border border-border rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/30 opacity-75">
            <input
              type="checkbox"
              name="notify_weekly_summary"
              defaultChecked={settings.notify_weekly_summary}
              className="mt-0.5 h-4 w-4 accent-primary rounded"
            />
            <div>
              <p className="text-xs font-extrabold text-foreground">Weekly Performance Summary</p>
              <p className="text-[11px] text-muted-foreground">Weekly digest sent every Monday morning.</p>
            </div>
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSaving}
          className="rounded-xl px-6 font-bold bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer shadow-md"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving Settings..." : "Save Email Settings"}
        </Button>
      </div>
    </form>
  );
}
