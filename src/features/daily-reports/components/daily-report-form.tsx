"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Send,
  Save,
  Plus,
  Trash2,
  Calendar,
  Clock,
  MessageSquare,
  Ticket,
  Activity,
  CheckCircle2,
  ArrowLeft,
  FileText,
  AlertCircle,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Copy,
  Minus
} from "lucide-react";
import { submitDailyReportAction, saveDailyReportDraftAction } from "../actions";
import { getAvailableWorkDates, checkShiftReportingWindow } from "../utils/shift-rules";
import { AttachmentUploader } from "./attachment-uploader";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { appSelectGroups, testingModulesList } from "@/features/daily-operations/components/daily-operations-modal";
import { platformForApp } from "@/features/daily-operations/types";
import type { UserProfile } from "@/lib/auth/roles";
import type { AttendanceStatus, TestingType, TestingStatus, TestingPlatform, Shift } from "../../daily-operations/types";

type TestingRowItem = {
  id: string;
  platform: TestingPlatform;
  application_name: string;
  module_name: string;
  testing_type: TestingType;
  status: TestingStatus;
  bugs_found: number;
  critical_bug: boolean;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="rounded-xl shadow-md font-bold px-6 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
    >
      <Send className="mr-2 h-4 w-4" />
      {pending ? "Submitting Report..." : "Submit Daily Report"}
    </Button>
  );
}

export function DailyReportForm({
  profile,
  initialDraft,
}: {
  profile: UserProfile;
  initialDraft?: Record<string, unknown> | null;
}) {
  const [state, formAction] = useFormState(submitDailyReportAction, {});
  const [draftSavedMessage, setDraftSavedMessage] = React.useState<string | null>(null);

  const workDateOptions = getAvailableWorkDates();
  const [workDate, setWorkDate] = React.useState<string>(
    String(initialDraft?.work_date ?? workDateOptions[0].value)
  );
  const [shift, setShift] = React.useState<Shift>("day");
  const [attendance, setAttendance] = React.useState<AttendanceStatus>("present");

  const [tickets, setTickets] = React.useState<string>(String(initialDraft?.tickets_handled ?? "0"));
  const [chats, setChats] = React.useState<string>(String(initialDraft?.chats_handled ?? "0"));

  // Checkboxes
  const [docUpdated, setDocUpdated] = React.useState<boolean>(Boolean(initialDraft?.doc_updated));
  const [featureSuggestion, setFeatureSuggestion] = React.useState<boolean>(Boolean(initialDraft?.feature_suggestion));
  const [bugVerification, setBugVerification] = React.useState<boolean>(Boolean(initialDraft?.bug_verification));
  const [askedForReview, setAskedForReview] = React.useState<boolean>(Boolean(initialDraft?.asked_for_review));
  const [gotReview, setGotReview] = React.useState<boolean>(Boolean(initialDraft?.got_review));
  const [otherContribution, setOtherContribution] = React.useState<boolean>(Boolean(initialDraft?.other_contribution));

  // Testing Entries
  const [testingEntries, setTestingEntries] = React.useState<TestingRowItem[]>([
    {
      id: "1",
      platform: "shopify",
      application_name: "",
      module_name: "",
      testing_type: "functional",
      status: "completed",
      bugs_found: 0,
      critical_bug: false,
    },
  ]);

  const [notes, setNotes] = React.useState<string>(String(initialDraft?.notes ?? ""));

  // Shift window check
  const { isLate, deadlineLabel } = checkShiftReportingWindow(workDate, shift);

  // Auto-save draft every 30 seconds
  React.useEffect(() => {
    const timer = setInterval(() => {
      handleManualSaveDraft();
    }, 30000);
    return () => clearInterval(timer);
  }, [workDate, shift, attendance, tickets, chats, testingEntries, notes]);

  const handleManualSaveDraft = async () => {
    const fd = new FormData();
    fd.append("work_date", workDate);
    fd.append("shift", shift);
    fd.append("attendance_status", attendance);
    fd.append("tickets_handled", tickets);
    fd.append("chats_handled", chats);
    fd.append("doc_updated", String(docUpdated));
    fd.append("feature_suggestion", String(featureSuggestion));
    fd.append("bug_verification", String(bugVerification));
    fd.append("asked_for_review", String(askedForReview));
    fd.append("got_review", String(gotReview));
    fd.append("other_contribution", String(otherContribution));
    fd.append("testing_entries", JSON.stringify(testingEntries));
    fd.append("notes", notes);

    const res = await saveDailyReportDraftAction({}, fd);
    if (res.draftSaved) {
      setDraftSavedMessage("Draft auto-saved");
      setTimeout(() => setDraftSavedMessage(null), 3000);
    }
  };

  const addTestingEntry = () => {
    setTestingEntries([
      ...testingEntries,
      {
        id: Math.random().toString(36).substring(7),
        platform: "shopify",
        application_name: "",
        module_name: "",
        testing_type: "functional",
        status: "completed",
        bugs_found: 0,
        critical_bug: false,
      },
    ]);
  };

  const removeTestingEntry = (id: string) => {
    setTestingEntries(testingEntries.filter((e) => e.id !== id));
  };

  const updateTestingEntry = (id: string, field: keyof TestingRowItem, value: any) => {
    setTestingEntries(
      testingEntries.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  return (
    <form action={formAction} className="space-y-6 w-full max-w-6xl mx-auto pb-16">
      {/* Hidden inputs */}
      <input type="hidden" name="work_date" value={workDate} />
      <input type="hidden" name="shift" value={shift} />
      <input type="hidden" name="attendance_status" value={attendance} />
      <input type="hidden" name="tickets_handled" value={tickets} />
      <input type="hidden" name="chats_handled" value={chats} />
      {docUpdated && <input type="hidden" name="doc_updated" value="true" />}
      {featureSuggestion && <input type="hidden" name="feature_suggestion" value="true" />}
      {bugVerification && <input type="hidden" name="bug_verification" value="true" />}
      {askedForReview && <input type="hidden" name="asked_for_review" value="true" />}
      {gotReview && <input type="hidden" name="got_review" value="true" />}
      {otherContribution && <input type="hidden" name="other_contribution" value="true" />}
      <input type="hidden" name="testing_entries" value={JSON.stringify(testingEntries)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/my-reports"
              className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to My Reports
            </Link>
            {draftSavedMessage && (
              <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md animate-fade-in">
                ✓ {draftSavedMessage}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground mt-1">
            Submit Daily Report
          </h1>
          <p className="text-xs text-muted-foreground font-medium">
            Log your daily support and QA testing work in under 2 minutes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleManualSaveDraft}
            className="rounded-xl text-xs font-bold border-border/80 cursor-pointer"
          >
            <Save className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> Save Draft
          </Button>
          <SubmitButton />
        </div>
      </div>

      {state.message && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-center gap-3 text-xs font-semibold text-rose-700 dark:text-rose-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}

      {/* 1. Employee & Date Information */}
      <Card className="rounded-2xl border border-border/60 bg-card shadow-sm">
        <CardHeader className="bg-slate-50/40 dark:bg-slate-900/10 px-6 py-4 border-b border-border/50">
          <CardTitle className="text-base font-extrabold tracking-tight flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" /> Shift & Date Details
          </CardTitle>
          <CardDescription className="text-xs">
            Submitting as <span className="font-bold text-foreground">{profile.full_name}</span> ({profile.email})
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 grid gap-4 sm:grid-cols-3">
          <div>
            <Label className="text-xs font-bold">Work Date</Label>
            <Select
              value={workDate}
              onChange={(e) => setWorkDate(e.target.value)}
              className="mt-1 rounded-xl text-xs"
            >
              {workDateOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label className="text-xs font-bold">Shift</Label>
            <Select
              value={shift}
              onChange={(e) => setShift(e.target.value as Shift)}
              className="mt-1 rounded-xl text-xs"
            >
              <option value="morning">Morning Shift (9 AM - 5 PM)</option>
              <option value="day">Day Shift (10 AM - 6 PM)</option>
              <option value="evening">Evening / Night Shift (6 PM - 2 AM)</option>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-bold">Attendance Status</Label>
            <Select
              value={attendance}
              onChange={(e) => setAttendance(e.target.value as AttendanceStatus)}
              className="mt-1 rounded-xl text-xs"
            >
              <option value="present">🟢 Present</option>
              <option value="wfh">🔵 Working From Home (WFH)</option>
              <option value="half_day">🟠 Half Day</option>
              <option value="leave">🟡 Leave</option>
            </Select>
          </div>

          {isLate && (
            <div className="sm:col-span-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between text-xs font-medium text-amber-800 dark:text-amber-300">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                This submission is past the shift deadline ({deadlineLabel}). It will be marked as <strong className="font-bold">Late Submission</strong>.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Support Work & Metrics */}
      <Card className="rounded-2xl border border-indigo-200 dark:border-indigo-900/50 border-t-4 border-t-indigo-600 dark:border-t-indigo-500 bg-card shadow-sm">
        <CardHeader className="bg-indigo-50/40 dark:bg-indigo-950/20 px-6 py-4 border-b border-indigo-100 dark:border-indigo-900/40">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-extrabold tracking-tight flex items-center gap-2 text-indigo-950 dark:text-indigo-200">
                <Ticket className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400" /> Support Work & Metrics
              </CardTitle>
              <CardDescription className="text-xs text-indigo-700/80 dark:text-indigo-300/80 font-medium mt-0.5">
                Enter tickets closed, chats handled, and contributions today.
              </CardDescription>
            </div>
            <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 text-xs font-extrabold">
              Support Section
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-xs font-bold flex items-center gap-1.5">
                <Ticket className="h-3.5 w-3.5 text-indigo-500" /> Tickets Closed
              </Label>
              <Input
                type="number"
                min="0"
                max="999"
                value={tickets}
                onChange={(e) => setTickets(e.target.value)}
                className="mt-1 rounded-xl text-sm font-bold"
                placeholder="e.g. 15"
              />
            </div>

            <div>
              <Label className="text-xs font-bold flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-pink-500" /> Chats Handled
              </Label>
              <Input
                type="number"
                min="0"
                max="999"
                value={chats}
                onChange={(e) => setChats(e.target.value)}
                className="mt-1 rounded-xl text-sm font-bold"
                placeholder="e.g. 8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold">Support Contributions Today</Label>
            <div className="grid gap-3 sm:grid-cols-3 p-4 rounded-xl border border-border/50 bg-slate-50/30 dark:bg-slate-900/10">
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <Checkbox checked={docUpdated} onCheckedChange={(c) => setDocUpdated(Boolean(c))} />
                <span>Documentation Updated</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <Checkbox checked={featureSuggestion} onCheckedChange={(c) => setFeatureSuggestion(Boolean(c))} />
                <span>Feature Suggestion</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <Checkbox checked={bugVerification} onCheckedChange={(c) => setBugVerification(Boolean(c))} />
                <span>Bug Verification</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <Checkbox checked={askedForReview} onCheckedChange={(c) => setAskedForReview(Boolean(c))} />
                <span>Asked Customer for Review</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <Checkbox checked={gotReview} onCheckedChange={(c) => setGotReview(Boolean(c))} />
                <span>Received Review ⭐</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <Checkbox checked={otherContribution} onCheckedChange={(c) => setOtherContribution(Boolean(c))} />
                <span>Other Contributions</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Testing Work Entries */}
      <Card className="rounded-2xl border border-violet-200 dark:border-violet-900/50 border-t-4 border-t-violet-600 dark:border-t-violet-500 bg-card shadow-sm">
        <CardHeader className="bg-violet-50/40 dark:bg-violet-950/20 px-6 py-4 border-b border-violet-100 dark:border-violet-900/40 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-extrabold tracking-tight flex items-center gap-2 text-violet-950 dark:text-violet-200">
              <Activity className="h-4.5 w-4.5 text-violet-600 dark:text-violet-400" /> QA & Testing Work
            </CardTitle>
            <CardDescription className="text-xs text-violet-700/80 dark:text-violet-300/80 font-medium mt-0.5">
              Add one or multiple testing activities performed today.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addTestingEntry}
            className="rounded-xl text-xs font-bold border-border/80 cursor-pointer"
          >
            <Plus className="mr-1 h-3.5 w-3.5" /> Add Testing Entry
          </Button>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {testingEntries.map((entry, index) => (
            <div
              key={entry.id}
              className="p-4 rounded-xl border border-border/70 bg-slate-50/30 dark:bg-slate-900/10 space-y-4 relative group text-xs"
            >
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-950 text-[10px] font-bold text-violet-700 dark:text-violet-300">
                    {index + 1}
                  </span>
                  <span className="font-extrabold text-foreground text-xs">Testing Activity</span>
                </div>
                <div className="flex items-center gap-1 bg-card border border-border/50 p-1 rounded-lg shadow-sm">
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const updated = [...testingEntries];
                        [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
                        setTestingEntries(updated);
                      }}
                      className="h-6 w-6 p-0 rounded hover:bg-slate-100"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {index < testingEntries.length - 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const updated = [...testingEntries];
                        [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
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
                      setTestingEntries([...testingEntries, { ...entry, id: String(Date.now()) }]);
                    }}
                    className="h-6 w-6 p-0 rounded hover:bg-slate-100"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  {testingEntries.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTestingEntry(entry.id)}
                      className="h-6 w-6 p-0 rounded text-rose-600 hover:bg-rose-50"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-[11px] font-bold text-muted-foreground">Testing App</Label>
                  <Select
                    value={entry.application_name}
                    onChange={(e) => {
                      const val = e.target.value;
                      const platform = (platformForApp[val] ?? "shopify") as TestingPlatform;
                      updateTestingEntry(entry.id, "application_name", val);
                      updateTestingEntry(entry.id, "platform", platform);
                    }}
                    className="mt-1 rounded-xl text-xs font-semibold h-10 border-border bg-background text-foreground shadow-sm"
                  >
                    <option value="">Select Testing App...</option>
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
                    value={entry.module_name || ""}
                    onChange={(e) => updateTestingEntry(entry.id, "module_name", e.target.value)}
                    className="mt-1 rounded-xl text-xs font-semibold h-10 border-border"
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

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label className="text-[11px] font-bold text-muted-foreground">Testing Type</Label>
                  <Select
                    value={entry.testing_type}
                    onChange={(e) => updateTestingEntry(entry.id, "testing_type", e.target.value as any)}
                    className="mt-1 rounded-xl text-xs h-10 border-border"
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
                    value={entry.status}
                    onChange={(e) => updateTestingEntry(entry.id, "status", e.target.value as any)}
                    className="mt-1 rounded-xl text-xs h-10 border-border"
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
                    value={entry.bugs_found}
                    onChange={(e) => updateTestingEntry(entry.id, "bugs_found", Number(e.target.value))}
                    className="mt-1 rounded-xl text-xs font-bold h-10 border-border"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-extrabold text-rose-600 cursor-pointer pt-1">
                <Checkbox
                  checked={entry.critical_bug}
                  onCheckedChange={(c) => updateTestingEntry(entry.id, "critical_bug", Boolean(c))}
                />
                <span>🚨 Critical Bug Flagged (Requires Manager Attention)</span>
              </label>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addTestingEntry}
            className="w-full rounded-xl text-xs font-bold gap-1.5 cursor-pointer border-dashed border-violet-300 dark:border-violet-800 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/30"
          >
            <Plus className="h-3.5 w-3.5" /> + Add Another Testing Entry
          </Button>
        </CardContent>
      </Card>

      {/* 4. Attachments & General Notes */}
      <Card className="rounded-2xl border border-border/60 bg-card shadow-sm">
        <CardHeader className="bg-slate-50/40 dark:bg-slate-900/10 px-6 py-4 border-b border-border/50">
          <CardTitle className="text-base font-extrabold tracking-tight flex items-center gap-2">
            <FileText className="h-4 w-4 text-cyan-500" /> Attachments & General Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <AttachmentUploader />

          <div>
            <Label className="text-xs font-bold">General Notes / Daily Highlights</Label>
            <textarea
              name="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write any additional context, blockers, or highlights for today's shift..."
              className="mt-1.5 w-full rounded-xl border border-border/80 bg-background p-3 text-xs font-medium focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bottom Submit Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <Button
          type="button"
          variant="outline"
          onClick={handleManualSaveDraft}
          className="rounded-xl text-xs font-bold border-border/80 cursor-pointer"
        >
          <Save className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> Save Draft
        </Button>
        <SubmitButton />
      </div>
    </form>
  );
}
