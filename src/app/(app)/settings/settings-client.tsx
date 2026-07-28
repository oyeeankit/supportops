"use client";

import { useState } from "react";
import { EmailSettingsForm } from "@/features/settings/components/email-settings-form";
import { EmailLogsTable } from "@/features/settings/components/email-logs-table";
import type { EmailSettings, EmailQueueItem } from "@/lib/notifications/types";
import { Settings, Mail, History, Shield, Sliders } from "lucide-react";

interface SettingsClientProps {
  emailSettings: EmailSettings;
  emailLogs: EmailQueueItem[];
}

export function SettingsClient({ emailSettings, emailLogs }: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState<"email" | "logs" | "general">("email");

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" /> System Settings & Notifications
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Manager portal for configuring email delivery, Resend API key, multi-recipient routing, and audit logs.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-2">
        <button
          onClick={() => setActiveTab("email")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold border-b-2 transition-colors cursor-pointer ${
            activeTab === "email"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Mail className="h-4 w-4" /> Email Routing & Preferences
        </button>

        <button
          onClick={() => setActiveTab("logs")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold border-b-2 transition-colors cursor-pointer ${
            activeTab === "logs"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <History className="h-4 w-4" /> Email Delivery Logs
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "email" && <EmailSettingsForm initialSettings={emailSettings} />}
      {activeTab === "logs" && <EmailLogsTable initialLogs={emailLogs} />}
    </div>
  );
}
