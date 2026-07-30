"use client";

import * as React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitPublicDailyReportAction } from "../actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { appSelectGroups, testingModulesList } from "@/features/daily-operations/components/daily-operations-modal";
import { platformForApp } from "@/features/daily-operations/types";
import {
  Plus,
  Trash2,
  TestTube,
  Headphones,
  ArrowUp,
  ArrowDown,
  Copy,
  Minus
} from "lucide-react";

function SubmitButton({ isQARole, hasEmail }: { isQARole: boolean; hasEmail: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending || !hasEmail}
      className={`w-full h-11 text-white font-bold text-xs rounded-xl transition-colors shadow-sm cursor-pointer ${
        !hasEmail
          ? "bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-60"
          : isQARole
          ? "bg-violet-600 hover:bg-violet-500"
          : "bg-emerald-600 hover:bg-emerald-500"
      }`}
    >
      {pending
        ? "Submitting Daily Log..."
        : !hasEmail
        ? "Select Work Email Above to Submit Report"
        : isQARole
        ? "Submit QA Testing Log for Monthly Scoring"
        : "Submit Daily Log for Monthly Scoring"}
    </Button>
  );
}

// Preset Team Members (Manager excluded)
const PRESET_TEAM_EMAILS = [
  { name: "Lalit (Support Engineer)", email: "lalit@thaliatechnologies.com" },
  { name: "Gaurav (Support Engineer)", email: "gauravsalvi@thaliatechnologies.com" },
  { name: "Rupali (Support Engineer)", email: "rupali@thaliatechnologies.com" },
  { name: "Prathamesh (Support Engineer)", email: "prathamesh@thaliatechnologies.com" },
  { name: "Shivam (QA Engineer)", email: "shivam@thaliatechnologies.com" },
];

type TestingRow = {
  id: string;
  platform: string;
  custom_platform?: string;
  application_name: string;
  module_name: string;
  testing_type: string;
  status: string;
  bugs_found: number;
  critical_bug: boolean;
};

export function PublicReportForm() {
  const [state, formAction] = useActionState(submitPublicDailyReportAction, {});
  const [selectedEmail, setSelectedEmail] = React.useState("");
  const [customEmail, setCustomEmail] = React.useState("");
  const [isCustomEmail, setIsCustomEmail] = React.useState(false);
  const [emailError, setEmailError] = React.useState("");

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const todayStr = today.toISOString().split("T")[0];
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  const finalEmail = isCustomEmail ? customEmail.toLowerCase().trim() : selectedEmail;

  // Detect QA Engineer role (Shivam or email containing qa)
  const isQARole = finalEmail.includes("shivam") || finalEmail.includes("qa");

  // Contributions Checkboxes
  const [docUpdated, setDocUpdated] = React.useState(false);
  const [featureSuggestion, setFeatureSuggestion] = React.useState(false);
  const [bugVerification, setBugVerification] = React.useState(false);
  const [askedForReview, setAskedForReview] = React.useState(false);
  const [gotReview, setGotReview] = React.useState(false);
  const [otherContribution, setOtherContribution] = React.useState(false);

  // Custom Contribution Text
  const [showCustomContrib, setShowCustomContrib] = React.useState(false);
  const [customContribText, setCustomContribText] = React.useState("");

  // QA Testing Entries — empty by default for all users
  const [testingEntries, setTestingEntries] = React.useState<TestingRow[]>([]);

  const addTestingRow = () => {
    setTestingEntries([
      ...testingEntries,
      {
        id: String(Date.now()),
        platform: "shopify",
        custom_platform: "",
        application_name: "",
        module_name: "",
        testing_type: "functional",
        status: "completed",
        bugs_found: 0,
        critical_bug: false,
      },
    ]);
  };

  const removeTestingRow = (id: string) => {
    setTestingEntries(testingEntries.filter((r) => r.id !== id));
  };

  const updateTestingRow = (id: string, field: keyof TestingRow, val: any) => {
    setTestingEntries(
      testingEntries.map((r) => (r.id === id ? { ...r, [field]: val } : r))
    );
  };

  if (state.saved && state.submittedReport) {
    const report = state.submittedReport;
    return (
      <div className="max-w-xl mx-auto space-y-6 animate-fade-in font-sans">
        <Card className="rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 p-6 sm:p-8 text-center space-y-6 shadow-sm">
          <div className="h-14 w-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto text-2xl font-black shadow-md">
            ✓
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-foreground">Daily Report Submitted!</h2>
            <p className="text-xs text-muted-foreground font-medium">
              Your daily log & monthly scoring metrics have been recorded.
            </p>
          </div>

          {/* Submitted Summary Receipt */}
          <div className="bg-card border border-border rounded-xl p-5 text-left space-y-3 shadow-sm text-xs">
            <div className="flex justify-between border-b border-border pb-2">
              <span className="font-extrabold text-foreground">Employee:</span>
              <span className="font-medium text-muted-foreground">{report.fullName} ({report.email})</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="font-extrabold text-foreground">Work Date:</span>
              <span className="font-medium text-muted-foreground">{report.workDate}</span>
            </div>
            {!isQARole && (
              <>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="font-extrabold text-foreground">Tickets Closed:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{report.ticketsHandled} Tickets</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="font-extrabold text-foreground">Chats Handled:</span>
                  <span className="font-bold text-pink-600 dark:text-pink-400">{report.chatsHandled} Chats</span>
                </div>
              </>
            )}
            {report.testingCount > 0 ? (
              <div className="flex justify-between border-b border-border pb-2">
                <span className="font-extrabold text-foreground">QA Testing Logged:</span>
                <span className="font-bold text-violet-600 dark:text-violet-400">{report.testingCount} App Modules Tested</span>
              </div>
            ) : (
              <div className="flex justify-between border-b border-border pb-2">
                <span className="font-extrabold text-foreground">QA Testing Logged:</span>
                <span className="text-muted-foreground">No testing work submitted</span>
              </div>
            )}
            {report.contributions.length > 0 && (
              <div className="border-b border-border pb-2">
                <span className="font-extrabold text-foreground block mb-1">Contributions Added:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {report.contributions.map((c, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                      ✓ {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {report.notes && (
              <div>
                <span className="font-extrabold text-foreground block mb-1">Notes & Accomplishments:</span>
                <p className="text-muted-foreground font-medium whitespace-pre-wrap">{report.notes}</p>
              </div>
            )}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white cursor-pointer px-6"
            >
              Submit Another Report
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const preparedTestingEntries = testingEntries.map((row) => ({
    ...row,
    platform: row.platform === "custom" ? row.custom_platform || "Custom Platform" : row.platform,
  }));

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 font-sans px-2 sm:px-4 pb-12" suppressHydrationWarning>
      {/* Top Banner Header */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-bl from-blue-500/10 via-violet-500/5 to-transparent rounded-bl-full pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-white font-black shadow-md ${
              isQARole ? "bg-gradient-to-tr from-violet-600 to-indigo-600" : "bg-gradient-to-tr from-blue-600 to-indigo-600"
            }`}>
              {isQARole ? <TestTube className="h-6 w-6" /> : <Headphones className="h-6 w-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-900/60">
                  SupportOps Portal
                </span>
                <span className="text-[11px] font-bold text-muted-foreground">Daily Operations</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground mt-0.5">
                {isQARole ? "QA Engineering Daily Report" : "Daily Support Operations Log"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-border/60">
              📅 {todayStr}
            </span>
          </div>
        </div>
      </div>

      <form action={formAction} className="space-y-6" suppressHydrationWarning>
        {/* Hidden JSON for Testing Entries */}
        <input
          type="hidden"
          name="testing_entries_json"
          value={JSON.stringify(preparedTestingEntries)}
        />

        {/* STEP 1: EMPLOYEE IDENTITY & SHIFT */}
        <Card className="rounded-2xl border border-border/80 bg-card shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-extrabold text-xs flex items-center justify-center">1</span>
              <h2 className="text-sm font-extrabold text-foreground tracking-tight">Employee Identity & Work Context</h2>
            </div>
            {!finalEmail && (
              <span className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/50 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-900/50">
                Required Selection
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Field 1: Work Email */}
            <div className="space-y-1.5 sm:col-span-1">
              <Label htmlFor="email" className="text-xs font-bold text-foreground">
                Select Email <span className="text-rose-500 font-extrabold">*</span>
              </Label>
              {!isCustomEmail ? (
                <Select
                  id="email_select"
                  suppressHydrationWarning
                  required
                  value={selectedEmail}
                  onChange={(e) => {
                    if (e.target.value === "custom") {
                      setIsCustomEmail(true);
                    } else {
                      setSelectedEmail(e.target.value);
                    }
                  }}
                  className={`rounded-xl border-border bg-background text-foreground text-xs font-medium h-9 px-2.5 truncate ${
                    !selectedEmail ? "border-amber-400 dark:border-amber-600 ring-2 ring-amber-400/20" : ""
                  }`}
                >
                  <option value="" disabled className="text-xs font-normal">-- Select Work Email --</option>
                  {PRESET_TEAM_EMAILS.map((t) => (
                    <option key={t.email} value={t.email} className="text-xs font-normal">
                      {t.name}
                    </option>
                  ))}
                  <option value="custom" className="text-xs font-medium text-blue-600">+ Custom Work Email</option>
                </Select>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    id="custom_email"
                    type="email"
                    required
                    placeholder="name@thaliatechnologies.com"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="rounded-xl border-border bg-background text-foreground text-xs font-medium h-9"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCustomEmail(false)}
                    className="rounded-xl text-[11px] font-bold cursor-pointer shrink-0 h-9"
                  >
                    Presets
                  </Button>
                </div>
              )}
              <input type="hidden" name="email" value={finalEmail} />
              {finalEmail && (
                <p className="text-[10px] text-muted-foreground font-medium truncate mt-1">
                  Selected: <span className="font-bold text-primary">{finalEmail}</span>
                </p>
              )}
            </div>

            {/* Field 2: Work Date */}
            <div className="space-y-1.5">
              <Label htmlFor="work_date" className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>Work Date</span>
                <span className="text-[10px] text-muted-foreground">Max 1 Day Backdate</span>
              </Label>
              <Select
                id="work_date"
                name="work_date"
                suppressHydrationWarning
                defaultValue={todayStr}
                className="rounded-xl border-border bg-background text-foreground text-xs font-medium h-10"
              >
                <option value={todayStr}>Today ({todayStr})</option>
                <option value={yesterdayStr}>Yesterday ({yesterdayStr})</option>
              </Select>
            </div>

            {/* Field 3: Attendance Status */}
            <div className="space-y-1.5">
              <Label htmlFor="attendance_status" className="text-xs font-bold text-foreground">
                Attendance Status
              </Label>
              <Select
                id="attendance_status"
                name="attendance_status"
                suppressHydrationWarning
                defaultValue="present"
                className="rounded-xl border-border bg-background text-foreground text-xs font-medium h-10"
              >
                <option value="present">🟢 Present (In Office)</option>
                <option value="wfh">🔵 Work From Home (WFH)</option>
                <option value="half_day">🟠 Half Day</option>
                <option value="leave">🟡 Leave</option>
              </Select>
            </div>
          </div>
        </Card>

        {/* STEP 2: SUPPORT WORK OUTPUT & METRICS (Displayed for Support Engineers) */}
        {!isQARole ? (
          <Card className="rounded-2xl border border-indigo-200 dark:border-indigo-900/50 bg-card shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs flex items-center justify-center">2</span>
                <h2 className="text-sm font-extrabold text-foreground tracking-tight flex items-center gap-2">
                  <Headphones className="h-4 w-4 text-indigo-600" /> Support Work Output & Contributions
                </h2>
              </div>
              <span className="text-xs font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-900/50">
                Support Metrics
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-2">
                <Label htmlFor="tickets_handled" className="text-xs font-extrabold text-indigo-950 dark:text-indigo-200">
                  🎟️ Tickets Solved / Closed Today
                </Label>
                <Input
                  id="tickets_handled"
                  name="tickets_handled"
                  suppressHydrationWarning
                  type="number"
                  min="0"
                  defaultValue="0"
                  required
                  className="rounded-xl border-indigo-200 dark:border-indigo-800 bg-background text-foreground text-sm font-black h-11"
                />
              </div>

              <div className="p-4 rounded-xl border border-pink-100 dark:border-pink-900/40 bg-pink-50/40 dark:bg-pink-950/20 space-y-2">
                <Label htmlFor="chats_handled" className="text-xs font-extrabold text-pink-950 dark:text-pink-200">
                  💬 Customer Chats Handled Today
                </Label>
                <Input
                  id="chats_handled"
                  name="chats_handled"
                  suppressHydrationWarning
                  type="number"
                  min="0"
                  defaultValue="0"
                  required
                  className="rounded-xl border-pink-200 dark:border-pink-800 bg-background text-foreground text-sm font-black h-11"
                />
              </div>
            </div>

            {/* Extra Contributions */}
            <div className="space-y-3 pt-2">
              <Label className="text-xs font-bold text-foreground">Extra Support Contributions (Adds Score Points)</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <label className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer p-3 rounded-xl border border-border bg-slate-50/40 dark:bg-slate-900/20 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <Checkbox name="doc_updated" checked={docUpdated} onCheckedChange={(c) => setDocUpdated(Boolean(c))} />
                  <span>Doc / KB Updated (+Points)</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer p-3 rounded-xl border border-border bg-slate-50/40 dark:bg-slate-900/20 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <Checkbox name="feature_suggestion" checked={featureSuggestion} onCheckedChange={(c) => setFeatureSuggestion(Boolean(c))} />
                  <span>Feature Suggestion Logged</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer p-3 rounded-xl border border-border bg-slate-50/40 dark:bg-slate-900/20 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <Checkbox name="bug_verification" checked={bugVerification} onCheckedChange={(c) => setBugVerification(Boolean(c))} />
                  <span>Bug Verification Conducted</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer p-3 rounded-xl border border-border bg-slate-50/40 dark:bg-slate-900/20 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <Checkbox name="asked_for_review" checked={askedForReview} onCheckedChange={(c) => setAskedForReview(Boolean(c))} />
                  <span>Asked Customer for Review</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer p-3 rounded-xl border border-border bg-slate-50/40 dark:bg-slate-900/20 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <Checkbox name="got_review" checked={gotReview} onCheckedChange={(c) => setGotReview(Boolean(c))} />
                  <span>Received Review ⭐</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer p-3 rounded-xl border border-border bg-slate-50/40 dark:bg-slate-900/20 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <Checkbox name="other_contribution" checked={otherContribution} onCheckedChange={(c) => setOtherContribution(Boolean(c))} />
                  <span>Other Team Contribution</span>
                </label>
              </div>

              {/* Custom Contribution Input */}
              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 cursor-pointer">
                  <Checkbox checked={showCustomContrib} onCheckedChange={(c) => setShowCustomContrib(Boolean(c))} />
                  <span>+ Add Custom Contribution</span>
                </label>
                {showCustomContrib && (
                  <Input
                    name="custom_contribution"
                    placeholder="Enter custom contribution (e.g. Built script, conducted training...)"
                    value={customContribText}
                    onChange={(e) => setCustomContribText(e.target.value)}
                    className="mt-2 text-xs rounded-xl border-border bg-background"
                  />
                )}
              </div>
            </div>
          </Card>
        ) : (
          <>
            <input type="hidden" name="tickets_handled" value="0" />
            <input type="hidden" name="chats_handled" value="0" />
          </>
        )}

        {/* STEP 3: QA & APP TESTING WORK */}
        <Card className="rounded-2xl border border-violet-200 dark:border-violet-900/50 bg-card shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-extrabold text-xs flex items-center justify-center">
                {isQARole ? "2" : "3"}
              </span>
              <h2 className="text-sm font-extrabold text-foreground tracking-tight flex items-center gap-2">
                <TestTube className="h-4 w-4 text-violet-600" /> QA & App Testing Activity
              </h2>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addTestingRow}
              className="rounded-xl text-xs font-extrabold gap-1.5 border-violet-300 dark:border-violet-800 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/40 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Add Testing Entry
            </Button>
          </div>

          {testingEntries.length === 0 ? (
            <div className="p-6 rounded-2xl border border-dashed border-border bg-slate-50/50 dark:bg-slate-900/20 text-center space-y-3">
              <p className="text-xs text-muted-foreground font-medium">
                No app testing entries logged yet for today. Click below to add a testing task.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTestingRow}
                className="rounded-xl text-xs font-bold gap-1.5 bg-card cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 text-violet-600" /> Add Testing Entry
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {testingEntries.map((row, idx) => (
                <div key={row.id} className="p-4 border border-border/70 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-950 text-[10px] font-bold text-violet-700 dark:text-violet-300">
                        {idx + 1}
                      </span>
                      <span className="font-extrabold text-foreground text-xs">Testing Activity</span>
                    </div>
                    <div className="flex items-center gap-1 bg-card border border-border/50 p-1 rounded-lg shadow-sm">
                      {idx > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const updated = [...testingEntries];
                            [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
                            setTestingEntries(updated);
                          }}
                          className="h-6 w-6 p-0 rounded hover:bg-slate-100"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {idx < testingEntries.length - 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const updated = [...testingEntries];
                            [updated[idx], updated[idx + 1]] = [updated[idx + 1], updated[idx]];
                            setTestingEntries(updated);
                          }}
                          className="h-6 w-6 p-0 rounded hover:bg-slate-100"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setTestingEntries([...testingEntries, { ...row, id: String(Date.now()) }]);
                        }}
                        className="h-6 w-6 p-0 rounded hover:bg-slate-100"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTestingRow(row.id)}
                        className="h-6 w-6 p-0 rounded text-rose-600 hover:bg-rose-50"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[11px] font-bold text-muted-foreground">Testing App</Label>
                      <Select
                        value={row.application_name}
                        onChange={(e) => {
                          const val = e.target.value;
                          const platform = platformForApp[val] ?? "shopify";
                          updateTestingRow(row.id, "application_name", val);
                          updateTestingRow(row.id, "platform", platform);
                        }}
                        className="h-10 text-xs font-semibold rounded-xl border-border mt-1 bg-background text-foreground shadow-sm"
                      >
                        <option value="">Select Testing App...</option>
                        {row.application_name &&
                          !appSelectGroups.some((g) => g.options.some((o) => o.value === row.application_name)) && (
                            <option value={row.application_name}>{row.application_name}</option>
                          )}
                        {appSelectGroups.map((group) => (
                          <optgroup key={group.label} label={group.label}>
                            {group.options.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </Select>
                    </div>

                    <div>
                      <Label className="text-[11px] font-bold text-muted-foreground">Module / Feature</Label>
                      <Select
                        value={row.module_name || ""}
                        onChange={(e) => updateTestingRow(row.id, "module_name", e.target.value)}
                        className="h-10 text-xs font-semibold rounded-xl border-border mt-1"
                      >
                        <option value="">Select module...</option>
                        {testingModulesList.map((mod) => (
                          <option key={mod} value={mod}>
                            {mod}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-[11px] font-bold text-muted-foreground">Testing Type</Label>
                      <Select
                        value={row.testing_type || "functional"}
                        onChange={(e) => updateTestingRow(row.id, "testing_type", e.target.value)}
                        className="h-10 text-xs font-semibold rounded-xl border-border mt-1"
                      >
                        <option value="functional">Functional Testing</option>
                        <option value="regression">Regression Testing</option>
                        <option value="integration">Integration Testing</option>
                        <option value="smoke">Smoke Testing</option>
                        <option value="sanity">Sanity Testing</option>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-[11px] font-bold text-muted-foreground">Status</Label>
                      <Select
                        value={row.status || "completed"}
                        onChange={(e) => updateTestingRow(row.id, "status", e.target.value)}
                        className="h-10 text-xs font-semibold rounded-xl border-border mt-1"
                      >
                        <option value="completed">Completed</option>
                        <option value="in_progress">In Progress</option>
                        <option value="blocked">Blocked</option>
                        <option value="on_hold">On Hold</option>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-[11px] font-bold text-muted-foreground">Bugs Found</Label>
                      <Input
                        type="number"
                        min="0"
                        value={row.bugs_found}
                        onChange={(e) => updateTestingRow(row.id, "bugs_found", Number(e.target.value))}
                        className="h-10 text-xs font-bold rounded-xl border-border mt-1"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs font-extrabold text-rose-600 dark:text-rose-400 cursor-pointer pt-1">
                    <Checkbox
                      checked={row.critical_bug}
                      onCheckedChange={(c) => updateTestingRow(row.id, "critical_bug", Boolean(c))}
                    />
                    <span>🚨 Critical Bug Flagged (Requires Manager Attention)</span>
                  </label>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTestingRow}
                className="w-full rounded-xl text-xs font-bold gap-1.5 cursor-pointer border-dashed border-violet-300 dark:border-violet-800 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/40 py-2.5"
              >
                <Plus className="h-3.5 w-3.5" /> + Add Another Testing Entry
              </Button>
            </div>
          )}
        </Card>

        {/* STEP 4: NOTES & SUBMISSION */}
        <Card className="rounded-2xl border border-border/80 bg-card shadow-sm p-6 space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs font-bold text-foreground">
              {isQARole ? "QA Testing Notes & Key Accomplishments" : "Daily Accomplishments & General Notes"}
            </Label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder={isQARole ? "Summary of app modules tested, test scenarios verified, or blockers..." : "Summary of today's achievements, customer feedback, or any blockers..."}
              className="w-full text-xs font-medium bg-background border border-border rounded-xl p-3.5 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[90px]"
            />
          </div>

          {state.message && (
            <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-xs font-bold text-rose-700 dark:text-rose-300">
              {state.message}
            </div>
          )}

          <SubmitButton isQARole={isQARole} hasEmail={Boolean(finalEmail)} />
        </Card>
      </form>
    </div>
  );
}
