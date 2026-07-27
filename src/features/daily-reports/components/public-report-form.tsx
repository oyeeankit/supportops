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
import {
  Plus,
  Trash2,
  TestTube,
  Headphones
} from "lucide-react";

function SubmitButton({ isQARole }: { isQARole: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className={`w-full h-11 text-white font-bold text-xs rounded-xl transition-colors shadow-sm cursor-pointer ${
        isQARole ? "bg-violet-600 hover:bg-violet-500" : "bg-emerald-600 hover:bg-emerald-500"
      }`}
    >
      {pending
        ? "Submitting Daily Log..."
        : isQARole
        ? "Submit QA Testing Log for Monthly Scoring"
        : "Submit Daily Log for Monthly Scoring"}
    </Button>
  );
}

// Preset Team Members (Manager excluded)
const PRESET_TEAM_EMAILS = [
  { name: "Lalit (Support Engineer)", email: "lalit@thaliatechnologies.com" },
  { name: "Gaurav (Support Engineer)", email: "gaurav@thaliatechnologies.com" },
  { name: "Rupali (Support Engineer)", email: "rupali@thaliatechnologies.com" },
  { name: "Prathmesh (Support Engineer)", email: "prathmesh@thaliatechnologies.com" },
  { name: "Shivam (QA Engineer)", email: "shivam@thaliatechnologies.com" },
];

type TestingRow = {
  id: string;
  platform: string;
  custom_platform?: string;
  application_name: string;
  module_name: string;
  bugs_found: number;
  critical_bug: boolean;
};

export function PublicReportForm() {
  const [state, formAction] = useActionState(submitPublicDailyReportAction, {});
  const [selectedEmail, setSelectedEmail] = React.useState("lalit@thaliatechnologies.com");
  const [customEmail, setCustomEmail] = React.useState("");
  const [isCustomEmail, setIsCustomEmail] = React.useState(false);

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const todayStr = today.toISOString().split("T")[0];
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  const finalEmail = isCustomEmail ? customEmail : selectedEmail;

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

  // Map testing entries so custom_platform overrides platform string if set
  const preparedTestingEntries = testingEntries.map((row) => ({
    ...row,
    platform: row.platform === "custom" ? row.custom_platform || "Custom Platform" : row.platform,
  }));

  return (
    <div className="max-w-2xl mx-auto space-y-6 font-sans" suppressHydrationWarning>
      <div className="text-center space-y-1.5">
        <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg text-white font-black text-base shadow-sm ${
          isQARole ? "bg-violet-600" : "bg-blue-600"
        }`}>
          {isQARole ? <TestTube className="h-5 w-5" /> : <Headphones className="h-5 w-5" />}
        </div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">
          {isQARole ? "QA Engineering Daily Report Portal" : "Support Daily Report Portal"}
        </h1>
        <p className="text-xs text-muted-foreground font-medium">
          {isQARole
            ? "Log your app testing work, bug discoveries, and QA accomplishments."
            : "Log your daily support tickets, chats, and team contributions below."}
        </p>
      </div>

      <Card className="rounded-xl border border-border bg-card shadow-sm p-6 space-y-6">
        <form action={formAction} className="space-y-6" suppressHydrationWarning>
          {/* Hidden JSON for Testing Entries */}
          <input
            type="hidden"
            name="testing_entries_json"
            value={JSON.stringify(preparedTestingEntries)}
          />

          {/* 1. Employee Email Selection */}
          <div className="space-y-1.5 border-b border-border pb-5">
            <Label htmlFor="email" className="text-xs font-bold text-foreground">
              Select Your Work Email
            </Label>

            {!isCustomEmail ? (
              <Select
                id="email_select"
                suppressHydrationWarning
                value={selectedEmail}
                onChange={(e) => {
                  if (e.target.value === "custom") {
                    setIsCustomEmail(true);
                  } else {
                    setSelectedEmail(e.target.value);
                  }
                }}
                className="rounded-xl border-border bg-background text-foreground text-xs font-medium h-10"
              >
                {PRESET_TEAM_EMAILS.map((t) => (
                  <option key={t.email} value={t.email}>
                    {t.name} — {t.email}
                  </option>
                ))}
                <option value="custom">+ Enter Custom Work Email</option>
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
                  className="rounded-xl border-border bg-background text-foreground text-xs font-medium h-10"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCustomEmail(false)}
                  className="rounded-xl text-xs font-bold cursor-pointer shrink-0"
                >
                  Select Presets
                </Button>
              </div>
            )}
            <input type="hidden" name="email" value={finalEmail} />
          </div>

          {/* QA Role Notice Banner */}
          {isQARole && (
            <div className="p-3 rounded-xl border border-violet-200 dark:border-violet-900/50 bg-violet-50/60 dark:bg-violet-950/30 flex items-center justify-between text-xs">
              <span className="font-bold text-violet-700 dark:text-violet-300 flex items-center gap-1.5">
                🧪 <strong>QA Engineer Mode Active</strong> — Support ticket inputs hidden. Click "+ Add Testing Entry" to log testing.
              </span>
            </div>
          )}

          {/* 2. Work Date & Attendance */}
          <div className="grid grid-cols-2 gap-4 border-b border-border pb-5">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="work_date" className="text-xs font-bold text-foreground">
                  Work Date
                </Label>
                <span className="text-[10px] text-muted-foreground font-semibold">Max 1 Day Backdate</span>
              </div>
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

            <div className="space-y-1.5">
              <Label htmlFor="attendance_status" className="text-xs font-bold text-foreground">
                Attendance
              </Label>
              <Select
                id="attendance_status"
                name="attendance_status"
                suppressHydrationWarning
                defaultValue="present"
                className="rounded-xl border-border bg-background text-foreground text-xs font-medium h-10"
              >
                <option value="present">Present (In Office)</option>
                <option value="wfh">Work From Home (WFH)</option>
                <option value="half_day">Half Day</option>
                <option value="leave">Leave</option>
              </Select>
            </div>
          </div>

          {/* SECTION 1: SUPPORT WORK OUTPUT (Displayed for Support Engineers) */}
          {!isQARole ? (
            <div className="space-y-3 border-b border-border pb-5">
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                1. Core Support Work Output
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="tickets_handled" className="text-xs font-bold text-foreground">
                    Tickets Solved / Closed
                  </Label>
                  <Input
                    id="tickets_handled"
                    name="tickets_handled"
                    suppressHydrationWarning
                    type="number"
                    min="0"
                    defaultValue="0"
                    required
                    className="rounded-xl border-border bg-background text-foreground text-xs font-medium h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="chats_handled" className="text-xs font-bold text-foreground">
                    Chats Handled
                  </Label>
                  <Input
                    id="chats_handled"
                    name="chats_handled"
                    suppressHydrationWarning
                    type="number"
                    min="0"
                    defaultValue="0"
                    required
                    className="rounded-xl border-border bg-background text-foreground text-xs font-medium h-10"
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Hidden Support Fields for QA Engineer */}
              <input type="hidden" name="tickets_handled" value="0" />
              <input type="hidden" name="chats_handled" value="0" />
            </>
          )}

          {/* SECTION 2 FOR SUPPORT / SECTION 1 FOR QA */}
          {isQARole ? (
            /* QA SECTION 1: QA & APP TESTING WORK */
            <div className="space-y-3 border-b border-border pb-5">
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                1. QA & App Testing Work
              </h3>

              {testingEntries.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-border bg-slate-50/50 dark:bg-slate-900/30 text-center space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">
                    No app testing entries added yet.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTestingRow}
                    className="rounded-xl text-xs font-bold gap-1.5 cursor-pointer bg-card"
                  >
                    <Plus className="h-3.5 w-3.5 text-violet-600" /> Add Testing Entry
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {testingEntries.map((row) => (
                    <div key={row.id} className="p-3.5 border border-border bg-slate-50/50 dark:bg-slate-900/30 rounded-xl space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-foreground">Testing Entry #{testingEntries.indexOf(row) + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTestingRow(row.id)}
                          className="text-rose-500 hover:text-rose-600 h-7 px-2 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div>
                          <Label className="text-[10px] font-bold text-muted-foreground">Platform</Label>
                          <Select
                            value={row.platform}
                            onChange={(e) => updateTestingRow(row.id, "platform", e.target.value)}
                            className="h-9 text-xs rounded-lg border-border"
                          >
                            <option value="shopify">Shopify</option>
                            <option value="ecommerce">E commerce</option>
                            <option value="wix">Wix</option>
                            <option value="csv">CSV</option>
                            <option value="custom">+ Custom Platform</option>
                          </Select>

                          {row.platform === "custom" && (
                            <Input
                              placeholder="Enter Platform Name"
                              value={row.custom_platform || ""}
                              onChange={(e) => updateTestingRow(row.id, "custom_platform", e.target.value)}
                              className="mt-1.5 h-8 text-xs rounded-lg border-border"
                            />
                          )}
                        </div>

                        <div>
                          <Label className="text-[10px] font-bold text-muted-foreground">App / Extension Name</Label>
                          <Input
                            placeholder="e.g. Order Tracker"
                            value={row.application_name}
                            onChange={(e) => updateTestingRow(row.id, "application_name", e.target.value)}
                            className="h-9 text-xs rounded-lg border-border"
                          />
                        </div>

                        <div>
                          <Label className="text-[10px] font-bold text-muted-foreground">Bugs Found</Label>
                          <Input
                            type="number"
                            min="0"
                            value={row.bugs_found}
                            onChange={(e) => updateTestingRow(row.id, "bugs_found", Number(e.target.value))}
                            className="h-9 text-xs rounded-lg border-border"
                          />
                        </div>
                      </div>

                      <label className="flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400 cursor-pointer pt-1">
                        <Checkbox
                          checked={row.critical_bug}
                          onCheckedChange={(c) => updateTestingRow(row.id, "critical_bug", Boolean(c))}
                        />
                        <span>Critical Bug Detected 🚨</span>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* SUPPORT SECTION 2: EXTRA CONTRIBUTIONS */
            <div className="space-y-3 border-b border-border pb-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  2. Extra Contributions (Adds Points to Monthly Score)
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer p-2 rounded-lg border border-border bg-slate-50/50 dark:bg-slate-900/30">
                  <Checkbox
                    name="doc_updated"
                    checked={docUpdated}
                    onCheckedChange={(c) => setDocUpdated(Boolean(c))}
                  />
                  <span>Updated Doc / Knowledge Base (+Points)</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer p-2 rounded-lg border border-border bg-slate-50/50 dark:bg-slate-900/30">
                  <Checkbox
                    name="feature_suggestion"
                    checked={featureSuggestion}
                    onCheckedChange={(c) => setFeatureSuggestion(Boolean(c))}
                  />
                  <span>Logged Feature Suggestion</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer p-2 rounded-lg border border-border bg-slate-50/50 dark:bg-slate-900/30">
                  <Checkbox
                    name="bug_verification"
                    checked={bugVerification}
                    onCheckedChange={(c) => setBugVerification(Boolean(c))}
                  />
                  <span>Conducted Bug Verification</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer p-2 rounded-lg border border-border bg-slate-50/50 dark:bg-slate-900/30">
                  <Checkbox
                    name="asked_for_review"
                    checked={askedForReview}
                    onCheckedChange={(c) => setAskedForReview(Boolean(c))}
                  />
                  <span>Asked Customer for Review</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer p-2 rounded-lg border border-border bg-slate-50/50 dark:bg-slate-900/30">
                  <Checkbox
                    name="got_review"
                    checked={gotReview}
                    onCheckedChange={(c) => setGotReview(Boolean(c))}
                  />
                  <span>Received Positive Customer Review ⭐</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer p-2 rounded-lg border border-border bg-slate-50/50 dark:bg-slate-900/30">
                  <Checkbox
                    name="other_contribution"
                    checked={otherContribution}
                    onCheckedChange={(c) => setOtherContribution(Boolean(c))}
                  />
                  <span>Other Team Contribution</span>
                </label>

                {/* Custom Contribution Option */}
                <div className="sm:col-span-2 space-y-2 pt-1 border-t border-border/50">
                  <label className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer">
                    <Checkbox
                      checked={showCustomContrib}
                      onCheckedChange={(c) => setShowCustomContrib(Boolean(c))}
                    />
                    <span className="font-bold text-blue-600 dark:text-blue-400">+ Add Custom Contribution</span>
                  </label>
                  {showCustomContrib && (
                    <Input
                      name="custom_contribution"
                      placeholder="Enter custom contribution (e.g. Conducted team training, created script...)"
                      value={customContribText}
                      onChange={(e) => setCustomContribText(e.target.value)}
                      className="text-xs rounded-xl border-border bg-background"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3 FOR SUPPORT / SECTION 2 FOR QA */}
          {isQARole ? (
            /* QA SECTION 2: EXTRA QA CONTRIBUTIONS */
            <div className="space-y-3 border-b border-border pb-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  2. Extra QA Contributions
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer p-2 rounded-lg border border-border bg-slate-50/50 dark:bg-slate-900/30">
                  <Checkbox
                    name="doc_updated"
                    checked={docUpdated}
                    onCheckedChange={(c) => setDocUpdated(Boolean(c))}
                  />
                  <span>Updated Doc / Knowledge Base (+Points)</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer p-2 rounded-lg border border-border bg-slate-50/50 dark:bg-slate-900/30">
                  <Checkbox
                    name="feature_suggestion"
                    checked={featureSuggestion}
                    onCheckedChange={(c) => setFeatureSuggestion(Boolean(c))}
                  />
                  <span>Logged Feature Suggestion</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer p-2 rounded-lg border border-border bg-slate-50/50 dark:bg-slate-900/30">
                  <Checkbox
                    name="bug_verification"
                    checked={bugVerification}
                    onCheckedChange={(c) => setBugVerification(Boolean(c))}
                  />
                  <span>Conducted Bug Verification</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer p-2 rounded-lg border border-border bg-slate-50/50 dark:bg-slate-900/30">
                  <Checkbox
                    name="other_contribution"
                    checked={otherContribution}
                    onCheckedChange={(c) => setOtherContribution(Boolean(c))}
                  />
                  <span>Other Team Contribution</span>
                </label>

                {/* Custom Contribution Option */}
                <div className="sm:col-span-2 space-y-2 pt-1 border-t border-border/50">
                  <label className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer">
                    <Checkbox
                      checked={showCustomContrib}
                      onCheckedChange={(c) => setShowCustomContrib(Boolean(c))}
                    />
                    <span className="font-bold text-violet-600 dark:text-violet-400">+ Add Custom Contribution</span>
                  </label>
                  {showCustomContrib && (
                    <Input
                      name="custom_contribution"
                      placeholder="Enter custom QA contribution (e.g. Built automated test script, security audit...)"
                      value={customContribText}
                      onChange={(e) => setCustomContribText(e.target.value)}
                      className="text-xs rounded-xl border-border bg-background"
                    />
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* SUPPORT SECTION 3: QA & APP TESTING WORK (OPTIONAL) */
            <div className="space-y-3 border-b border-border pb-5">
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                3. QA & App Testing Work (Optional)
              </h3>

              {testingEntries.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-border bg-slate-50/50 dark:bg-slate-900/30 text-center space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">
                    No app testing entries added yet.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTestingRow}
                    className="rounded-xl text-xs font-bold gap-1.5 cursor-pointer bg-card"
                  >
                    <Plus className="h-3.5 w-3.5 text-blue-600" /> Add Testing Entry
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {testingEntries.map((row) => (
                    <div key={row.id} className="p-3.5 border border-border bg-slate-50/50 dark:bg-slate-900/30 rounded-xl space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-foreground">Testing Entry #{testingEntries.indexOf(row) + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTestingRow(row.id)}
                          className="text-rose-500 hover:text-rose-600 h-7 px-2 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div>
                          <Label className="text-[10px] font-bold text-muted-foreground">Platform</Label>
                          <Select
                            value={row.platform}
                            onChange={(e) => updateTestingRow(row.id, "platform", e.target.value)}
                            className="h-9 text-xs rounded-lg border-border"
                          >
                            <option value="shopify">Shopify</option>
                            <option value="ecommerce">E commerce</option>
                            <option value="wix">Wix</option>
                            <option value="csv">CSV</option>
                            <option value="custom">+ Custom Platform</option>
                          </Select>

                          {row.platform === "custom" && (
                            <Input
                              placeholder="Enter Platform Name"
                              value={row.custom_platform || ""}
                              onChange={(e) => updateTestingRow(row.id, "custom_platform", e.target.value)}
                              className="mt-1.5 h-8 text-xs rounded-lg border-border"
                            />
                          )}
                        </div>

                        <div>
                          <Label className="text-[10px] font-bold text-muted-foreground">App / Extension Name</Label>
                          <Input
                            placeholder="e.g. Order Tracker"
                            value={row.application_name}
                            onChange={(e) => updateTestingRow(row.id, "application_name", e.target.value)}
                            className="h-9 text-xs rounded-lg border-border"
                          />
                        </div>

                        <div>
                          <Label className="text-[10px] font-bold text-muted-foreground">Bugs Found</Label>
                          <Input
                            type="number"
                            min="0"
                            value={row.bugs_found}
                            onChange={(e) => updateTestingRow(row.id, "bugs_found", Number(e.target.value))}
                            className="h-9 text-xs rounded-lg border-border"
                          />
                        </div>
                      </div>

                      <label className="flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400 cursor-pointer pt-1">
                        <Checkbox
                          checked={row.critical_bug}
                          onCheckedChange={(c) => updateTestingRow(row.id, "critical_bug", Boolean(c))}
                        />
                        <span>Critical Bug Detected 🚨</span>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notes & Accomplishments */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs font-bold text-foreground">
              {isQARole ? "QA Accomplishments & Testing Notes" : "Key Accomplishments / Blockers / Notes"}
            </Label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder={isQARole ? "Summary of app modules tested, test scenarios verified, or blockers..." : "Summary of today's achievements, customer feedback, or any blockers..."}
              className="w-full text-xs font-medium bg-background border border-border rounded-xl p-3 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          {state.message && (
            <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-xs font-semibold text-rose-700 dark:text-rose-300">
              {state.message}
            </div>
          )}

          <SubmitButton isQARole={isQARole} />
        </form>
      </Card>
    </div>
  );
}
