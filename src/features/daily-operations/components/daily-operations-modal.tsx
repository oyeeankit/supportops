"use client";

import * as React from "react";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SearchableSelect, type SearchableGroup } from "@/components/ui/searchable-select";
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Copy, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { canManageSupport, canManageTesting, type AppRole } from "@/lib/auth/roles";
import {
  appsByPlatform,
  isNoTestingAssigned,
  platformForApp,
  platformLabels,
  testingPlatforms,
  testingQualities,
  testingQualityLabels,
  testingStatuses,
  testingStatusLabels,
  testingTypes,
  testingTypeLabels,
  attendanceStatuses,
  attendanceStatusLabels,
  type AttendanceStatus,
  type DailySummaryStats,
  type DailySupportLog,
  type DailyTestingLog,
  type TestingEntryFormData,
  type TestingPlatform,
  emptyTestingEntry,
  type TestingQuality,
} from "../types";
import {
  saveDailyOperationAction,
  fetchEmployeeDailyDataAction,
  type DailyOperationActionState,
} from "../actions";

const initialState: DailyOperationActionState = {};

// Build grouped options for the SearchableSelect from the app catalogue.
// "Support Only" (No Testing Assigned) always appears first.
const appSelectGroups: SearchableGroup[] = testingPlatforms.map((platform) => ({
  label: platformLabels[platform],
  options: appsByPlatform[platform].map((app) => ({ value: app, label: app })),
}));

function logToFormEntry(log: DailyTestingLog): TestingEntryFormData {
  return {
    platform: log.platform,
    application_name: log.application_name,
    module_name: log.module_name,
    testing_type: log.testing_type,
    status: log.status,
    bugs_found: log.bugs_found,
    critical_bugs_found: log.critical_bugs_found,
    testing_quality: log.testing_quality,
    task_completion: log.task_completion ?? 5,
    started_at: log.started_at ?? "",
    ended_at: log.ended_at ?? "",
    notes: log.notes ?? "",
  };
}

function computeSummary(
  entries: TestingEntryFormData[],
  tickets: number,
  chats: number,
): DailySummaryStats {
  const uniqueApps = new Set(entries.map((e) => e.application_name).filter(Boolean));
  return {
    totalTickets: tickets,
    totalChats: chats,
    totalAppsTested: uniqueApps.size,
    totalTestingEntries: entries.length,
    totalBugs: entries.reduce((sum, e) => sum + e.bugs_found, 0),
    criticalBugs: entries.reduce((sum, e) => sum + e.critical_bugs_found, 0),
    completedTests: entries.filter((e) => e.status === "completed").length,
    inProgressTests: entries.filter((e) => e.status === "in_progress").length,
    blockedTests: entries.filter((e) => e.status === "blocked").length,
    onHoldTests: entries.filter((e) => e.status === "on_hold").length,
  };
}

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  employeeId: string;
  employeeName: string;
  employeeRole: AppRole;
  initialDate: string;
  // Pre-loaded data for the initial date (avoids a fetch on first open)
  initialSupportLog: DailySupportLog | null;
  initialTestingLogs: DailyTestingLog[];
};

export function DailyOperationsModal({
  open,
  onClose,
  onSaved,
  employeeId,
  employeeName,
  employeeRole,
  initialDate,
  initialSupportLog,
  initialTestingLogs,
}: Props) {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [supportLog, setSupportLog] = useState<DailySupportLog | null>(initialSupportLog);
  const [testingLogs, setTestingLogs] = useState<DailyTestingLog[]>(initialTestingLogs);
  const [loading, setLoading] = useState(false);
  const [dateChanged, setDateChanged] = useState(false);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // Lazy-load data when date changes
  async function handleDateChange(newDate: string) {
    setSelectedDate(newDate);
    setDateChanged(true);
    setLoading(true);
    const result = await fetchEmployeeDailyDataAction(employeeId, newDate);
    setSupportLog(result.supportLog);
    setTestingLogs(result.testingLogs);
    setLoading(false);
  }

  if (!open) return null;

  const isEdit = supportLog !== null || testingLogs.length > 0;
  const today = new Date().toISOString().slice(0, 10);
  const formattedDate = new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/45 backdrop-blur-md p-4 sm:p-6 transition-all duration-300">
      <div className="my-4 w-full max-w-4xl rounded-2xl bg-card border border-border/80 shadow-2xl transition-all duration-300 transform scale-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border/60 px-6 py-5 bg-slate-50/50 dark:bg-slate-900/30 rounded-t-2xl">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-foreground bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
              {isEdit ? "Edit Daily Operations" : "Daily Operations"}
            </h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
              Employee: <span className="font-semibold text-foreground bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs">{employeeName}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground transition-all duration-300 hover:rotate-90"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Date picker */}
        <div className="border-b border-border/60 px-6 py-4.5 bg-card">
          <div className="flex items-end gap-4">
            <div className="space-y-2 w-full sm:max-w-xs">
              <Label htmlFor="modal-date" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Log Date {isEdit && <span className="text-foreground font-medium">: {formattedDate}</span>}</Label>
              <Input
                id="modal-date"
                type="date"
                value={selectedDate}
                max={today}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full rounded-xl border-border/80 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Form body */}
        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <ModalFormBody
              key={`${employeeId}-${selectedDate}`}
              employeeId={employeeId}
              date={selectedDate}
              supportLog={supportLog}
              testingLogs={testingLogs}
              onSaved={onSaved}
              employeeRole={employeeRole}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ModalFormBody({
  employeeId,
  date,
  supportLog,
  testingLogs,
  onSaved,
  employeeRole,
}: {
  employeeId: string;
  date: string;
  supportLog: DailySupportLog | null;
  testingLogs: DailyTestingLog[];
  onSaved: () => void;
  employeeRole: AppRole;
}) {
  const [state, formAction, pending] = useActionState(saveDailyOperationAction, initialState);
  const testingEntriesRef = useRef<HTMLInputElement>(null);

  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>(
    supportLog?.attendance_status ?? "present"
  );
  const [ticketsHandled, setTicketsHandled] = useState(supportLog?.tickets_handled ?? 0);
  const [chatsHandled, setChatsHandled] = useState(supportLog?.chats_handled ?? 0);
  const [supportNotes, setSupportNotes] = useState(supportLog?.notes ?? "");

  const [testingEntries, setTestingEntries] = useState<TestingEntryFormData[]>(() => {
    if (testingLogs.length > 0) {
      return testingLogs.map(logToFormEntry);
    }
    return [emptyTestingEntry(date)];
  });

  const [supportOpen, setSupportOpen] = useState(true);
  const [testingOpen, setTestingOpen] = useState(true);
  const errorFor = (field: string) => state.fieldErrors?.[field]?.[0];

  const showSupport = canManageSupport(employeeRole);
  const showTesting = canManageTesting(employeeRole);

  const summary = useMemo(
    () => computeSummary(testingEntries, Number(ticketsHandled), Number(chatsHandled)),
    [testingEntries, ticketsHandled, chatsHandled],
  );

  function updateTestingEntry(index: number, field: keyof TestingEntryFormData, value: string | number | null) {
    setTestingEntries((prev) => prev.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry)));
  }
  function addTestingEntry() {
    setTestingEntries((prev) => [...prev, emptyTestingEntry(date)]);
  }
  function removeTestingEntry(index: number) {
    setTestingEntries((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }
  function duplicateTestingEntry(index: number) {
    setTestingEntries((prev) => [...prev, { ...prev[index] }]);
  }
  function moveTestingEntryUp(index: number) {
    if (index === 0) return;
    setTestingEntries((prev) => {
      const updated = [...prev];
      [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
      return updated;
    });
  }
  function moveTestingEntryDown(index: number) {
    setTestingEntries((prev) => {
      if (index >= prev.length - 1) return prev;
      const updated = [...prev];
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
      return updated;
    });
  }

  // Close modal on successful save
  useEffect(() => {
    if (state.saved && !pending) {
      onSaved();
    }
  }, [state.saved, pending, onSaved]);

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (testingEntriesRef.current) {
      testingEntriesRef.current.value = JSON.stringify(showTesting ? testingEntries : []);
    }
  }

  return (
    <form action={formAction} onSubmit={handleFormSubmit} className="space-y-5">
      <input type="hidden" name="employee_id" value={employeeId} />
      <input type="hidden" name="log_date" value={date} />
      <input type="hidden" name="log_type" value="daily_operations" />
      <input type="hidden" name="attendance_status" value={attendanceStatus} />
      <input type="hidden" name="testing_entries" ref={testingEntriesRef} />
      <input type="hidden" name="stay_on_page" value="1" />

      {/* Support Summary */}
      {showSupport && (
        <div className="rounded-2xl border border-border/70 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md bg-card">
          <button
            type="button"
            onClick={() => setSupportOpen(!supportOpen)}
            className="flex w-full items-center justify-between px-5 py-4 text-base font-bold tracking-tight text-foreground bg-slate-50/50 dark:bg-slate-900/30 border-l-4 border-l-blue-600 dark:border-l-blue-500 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-all duration-300"
          >
            <span>Support Summary</span>
            <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform duration-300", !supportOpen && "-rotate-90")} />
          </button>
          {supportOpen && (
            <div className="border-t border-border/50 px-5 pb-5 pt-4">
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Attendance Status" error={errorFor("attendance_status")}>
                  <Select
                    value={attendanceStatus}
                    onChange={(e) => setAttendanceStatus(e.target.value as AttendanceStatus)}
                    className="rounded-xl border-border/80 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                  >
                    {attendanceStatuses.map((status) => (
                      <option key={status} value={status}>
                        {attendanceStatusLabels[status]}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Ticket Count" error={errorFor("tickets_handled")}>
                  <Input
                    name="tickets_handled"
                    type="number"
                    min="0"
                    value={ticketsHandled}
                    onChange={(e) => setTicketsHandled(Number(e.target.value))}
                    className="rounded-xl border-border/80 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                  />
                </Field>
                <Field label="Chat Count" error={errorFor("chats_handled")}>
                  <Input
                    name="chats_handled"
                    type="number"
                    min="0"
                    value={chatsHandled}
                    onChange={(e) => setChatsHandled(Number(e.target.value))}
                    className="rounded-xl border-border/80 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                  />
                </Field>
                <Field label="Support Notes" error={errorFor("notes")}>
                  <textarea
                    name="notes"
                    value={supportNotes}
                    onChange={(e) => setSupportNotes(e.target.value)}
                    placeholder="Optional support context"
                    className="min-h-20 w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10 focus-visible:border-primary transition-all duration-200 resize-y"
                  />
                </Field>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Testing Activities */}
      {showTesting && (
        <div className="rounded-2xl border border-border/70 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md bg-card">
          <button
            type="button"
            onClick={() => setTestingOpen(!testingOpen)}
            className="flex w-full items-center justify-between px-5 py-4 text-base font-bold tracking-tight text-foreground bg-slate-50/50 dark:bg-slate-900/30 border-l-4 border-l-violet-600 dark:border-l-violet-500 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-all duration-300"
          >
            <span>Testing Activities</span>
            <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform duration-300", !testingOpen && "-rotate-90")} />
          </button>
          {testingOpen && (
            <div className="border-t border-border/50 px-5 pb-5 pt-4">
              <div className="space-y-4">
                <Button type="button" variant="outline" size="sm" onClick={addTestingEntry} disabled={pending} className="rounded-xl border-dashed border-2 hover:border-violet-400">
                  <Plus className="mr-1 h-4 w-4" /> Add Testing Activity
                </Button>

                {testingEntries.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No testing entries. Click &quot;Add Testing Activity&quot; to add one.</p>
                ) : (
                  <div className="space-y-4">
                    {testingEntries.map((entry, index) => (
                      <TestingEntryCard
                        key={index}
                        entry={entry}
                        index={index}
                        canRemove={testingEntries.length > 1}
                        canMoveUp={index > 0}
                        canMoveDown={index < testingEntries.length - 1}
                        onChange={(field, value) => updateTestingEntry(index, field, value)}
                        onRemove={() => removeTestingEntry(index)}
                        onDuplicate={() => duplicateTestingEntry(index)}
                        onMoveUp={() => moveTestingEntryUp(index)}
                        onMoveDown={() => moveTestingEntryDown(index)}
                      />
                    ))}
                  </div>
                )}

                <Button type="button" variant="outline" size="sm" onClick={addTestingEntry} disabled={pending} className="rounded-xl border-dashed border-2 hover:border-violet-400">
                  <Plus className="mr-1 h-4 w-4" /> Add Testing Activity
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Daily Summary */}
      <Card className="rounded-2xl border border-border/60 overflow-hidden shadow-sm">
        <CardHeader className="bg-slate-50/40 dark:bg-slate-900/10 px-5 py-4 border-b border-border/50">
          <CardTitle className="text-base font-bold tracking-tight">Daily Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {showSupport && <StatCard label="Total Tickets" value={summary.totalTickets} colorClass="text-blue-600 dark:text-blue-400" />}
            {showSupport && <StatCard label="Total Chats" value={summary.totalChats} colorClass="text-blue-600 dark:text-blue-400" />}
            {showTesting && <StatCard label="Apps Tested" value={summary.totalAppsTested} colorClass="text-violet-600 dark:text-violet-400" />}
            {showTesting && <StatCard label="Testing Entries" value={summary.totalTestingEntries} colorClass="text-violet-600 dark:text-violet-400" />}
            {showTesting && <StatCard label="Total Bugs" value={summary.totalBugs} colorClass="text-amber-500" />}
            {showTesting && <StatCard label="Critical Bugs" value={summary.criticalBugs} colorClass="text-red-500" />}
            {showTesting && <StatCard label="Completed" value={summary.completedTests} colorClass="text-emerald-500" />}
            {showTesting && <StatCard label="In Progress" value={summary.inProgressTests} colorClass="text-blue-500" />}
            {showTesting && <StatCard label="Blocked" value={summary.blockedTests} colorClass="text-rose-500" />}
            {showTesting && <StatCard label="On Hold" value={summary.onHoldTests} colorClass="text-slate-500" />}
          </div>
        </CardContent>
      </Card>

      {/* Error / Success messages */}
      {state.message ? (
        state.saved ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
            {state.message}
          </div>
        ) : (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {state.message}
          </div>
        )
      ) : null}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
        <Button type="button" variant="outline" onClick={onSaved} disabled={pending} className="rounded-xl px-5 hover:bg-slate-100">
          Cancel
        </Button>
        <Button type="submit" disabled={pending} className="rounded-xl px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium hover:-translate-y-0.5 shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 active:translate-y-0 active:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
          {pending ? "Saving..." : "Save Daily Operations"}
        </Button>
      </div>
    </form>
  );
}

const testingModulesList = [
  "Authentication & Profile",
  "Dashboard Analytics",
  "Report Generation & Exports",
  "Billing / Checkout Flow",
  "Search & Filter Grid",
  "API Integrations",
  "Database Migrations",
  "CI/CD Pipeline Configurations",
  "Responsive UI & Theme Toggling",
  "General Feature QA"
];

const qualityLevels: { value: TestingQuality; stars: number; label: string }[] = [
  { value: "poor", stars: 1, label: "Poor" },
  { value: "average", stars: 2, label: "Average" },
  { value: "good", stars: 3, label: "Good" },
  { value: "excellent", stars: 4, label: "Excellent" },
];

function StarRating({
  value,
  onChange,
  disabled,
}: {
  value: TestingQuality;
  onChange: (val: TestingQuality) => void;
  disabled?: boolean;
}) {
  const currentLevel = qualityLevels.find((q) => q.value === value);
  const currentStars = currentLevel ? currentLevel.stars : 3;

  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => {
            const found = qualityLevels.find((q) => q.stars === star);
            if (found) onChange(found.value);
          }}
          className="group rounded-md focus:outline-none transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Star
            className={cn(
              "h-6 w-6 transition-colors duration-150 cursor-pointer",
              star <= currentStars 
                ? "fill-yellow-400 text-yellow-400 group-hover:fill-yellow-500 group-hover:text-yellow-500" 
                : "text-muted-foreground hover:text-foreground"
            )}
          />
        </button>
      ))}
      <span className="ml-2 text-xs font-medium text-muted-foreground">
        {currentLevel?.label}
      </span>
    </div>
  );
}

function TestingEntryCard({
  entry,
  index,
  canRemove,
  canMoveUp,
  canMoveDown,
  onChange,
  onRemove,
  onDuplicate,
  onMoveUp,
  onMoveDown,
}: {
  entry: TestingEntryFormData;
  index: number;
  canRemove: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onChange: (field: keyof TestingEntryFormData, value: string | number | null) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const entryLabel = `Testing #${index + 1}`;

  return (
    <Card className="rounded-2xl border border-border/70 overflow-hidden shadow-sm bg-slate-50/20 dark:bg-slate-900/10">
      <div className="flex flex-row items-center justify-between space-y-0 border-b border-border/50 bg-slate-50/60 dark:bg-slate-900/40 px-5 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-950/60 text-xs font-bold text-violet-700 dark:text-violet-300 border border-violet-200/50 dark:border-violet-800/40">
            {index + 1}
          </span>
          <span className="text-sm font-bold tracking-tight text-foreground">Testing Activity</span>
        </div>
        <div className="flex items-center gap-1 bg-card border border-border/50 p-1 rounded-lg shadow-sm">
          {canMoveUp ? (
            <Button type="button" variant="ghost" size="sm" onClick={onMoveUp} className="h-7 w-7 p-0 rounded-md hover:bg-slate-100 hover:text-foreground">
              <ArrowUp className="h-4 w-4" />
            </Button>
          ) : null}
          {canMoveDown ? (
            <Button type="button" variant="ghost" size="sm" onClick={onMoveDown} className="h-7 w-7 p-0 rounded-md hover:bg-slate-100 hover:text-foreground">
              <ArrowDown className="h-4 w-4" />
            </Button>
          ) : null}
          <Button type="button" variant="ghost" size="sm" onClick={onDuplicate} className="h-7 w-7 p-0 rounded-md hover:bg-slate-100 hover:text-foreground">
            <Copy className="h-4 w-4" />
          </Button>
          {canRemove ? (
            <Button type="button" variant="ghost" size="sm" onClick={onRemove} className="h-7 w-7 p-0 rounded-md text-destructive hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30">
              <Minus className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>
      <CardContent className="space-y-4 pt-4 px-5 pb-5">
        {/* Row 1: App and Module */}
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Testing App">
            <SearchableSelect
              groups={appSelectGroups}
              value={entry.application_name}
              placeholder="Select app..."
              onChange={(value) => {
                const platform = platformForApp[value] ?? "shopify";
                if (isNoTestingAssigned(value)) {
                  // Reset all other fields to defaults/0 when No Testing Assigned
                  onChange("application_name", value);
                  onChange("platform", platform);
                  onChange("module_name", "");
                  onChange("testing_type", "functional");
                  onChange("status", "completed");
                  onChange("bugs_found", 0);
                  onChange("critical_bugs_found", 0);
                  onChange("testing_quality", "good");
                  onChange("task_completion", 5);
                  onChange("started_at", "");
                  onChange("ended_at", "");
                  onChange("notes", "");
                } else {
                  onChange("application_name", value);
                  onChange("platform", platform);
                }
              }}
            />
          </Field>
          <Field label="Module">
            <Select
              value={entry.module_name}
              onChange={(e) => onChange("module_name", e.target.value)}
              disabled={isNoTestingAssigned(entry.application_name)}
              className="rounded-xl border-border/80 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
            >
              <option value="">Select module...</option>
              {testingModulesList.map((mod) => (
                <option key={mod} value={mod}>
                  {mod}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        {/* Row 2: Bugs Found and Testing Quality */}
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Bugs Found">
            <Input
              type="number"
              min="0"
              value={entry.bugs_found}
              onChange={(e) => onChange("bugs_found", Number(e.target.value))}
              disabled={isNoTestingAssigned(entry.application_name)}
              className="rounded-xl border-border/80 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
            />
          </Field>
          <Field label="Testing Quality">
            <div className="flex h-10 items-center">
              <StarRating
                value={entry.testing_quality}
                onChange={(val) => onChange("testing_quality", val)}
                disabled={isNoTestingAssigned(entry.application_name)}
              />
            </div>
          </Field>
        </div>

        {/* Row 3: Started At and Ended At */}
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Testing Started">
            <Input
              type="datetime-local"
              value={entry.started_at}
              onChange={(e) => onChange("started_at", e.target.value)}
              disabled={isNoTestingAssigned(entry.application_name)}
              className="rounded-xl border-border/80 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
            />
          </Field>
          <Field label="Testing Ended">
            <Input
              type="datetime-local"
              value={entry.ended_at}
              onChange={(e) => onChange("ended_at", e.target.value)}
              disabled={isNoTestingAssigned(entry.application_name)}
              className="rounded-xl border-border/80 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
            />
          </Field>
        </div>

        {/* Row 4: Testing Notes */}
        <div>
          <Field label="Testing Notes">
            <textarea
              value={entry.notes}
              onChange={(e) => onChange("notes", e.target.value)}
              placeholder="Optional notes for this testing entry"
              className="min-h-20 w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10 focus-visible:border-primary transition-all duration-200 resize-y"
            />
          </Field>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({ label, value, colorClass }: { label: string; value: number; colorClass?: string }) {
  return (
    <div className="rounded-xl border border-border bg-slate-50/40 dark:bg-slate-900/10 p-3 transition-all duration-300 hover:shadow-md hover:bg-card">
      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{label}</p>
      <p className={cn("text-2xl font-extrabold tracking-tight mt-1", colorClass || "text-foreground")}>{value}</p>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
