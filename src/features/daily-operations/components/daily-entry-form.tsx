"use client";

import type React from "react";
import { useActionState, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppLoading } from "@/components/feedback/app-loading";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SearchableSelect, type SearchableGroup } from "@/components/ui/searchable-select";
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Copy, Minus, Plus } from "lucide-react";
import type { AppRole } from "@/lib/auth/roles";
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
  type DailySummaryStats,
  type DailySupportLog,
  type DailyTestingLog,
  type TestingEntryFormData,
  emptyTestingEntry,
} from "../types";
import { saveDailyOperationAction, type DailyOperationActionState } from "../actions";

const initialState: DailyOperationActionState = {};

const appSelectGroups: SearchableGroup[] = testingPlatforms.map((platform) => ({
  label: platformLabels[platform],
  options: appsByPlatform[platform].map((app) => ({ value: app, label: app })),
}));

type EmployeeOption = {
  id: string;
  fullName: string;
  role: AppRole;
  supportLog: DailySupportLog | null;
  testingLogs: DailyTestingLog[];
};

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

export function DailyEntryForm({
  employeeId,
  date,
  supportLog,
  testingLogs = [],
  employees = [],
}: {
  employeeId: string;
  date: string;
  supportLog: DailySupportLog | null;
  testingLogs?: DailyTestingLog[];
  employees?: EmployeeOption[];
}) {
  const router = useRouter();
  const { startLoading, stopLoading } = useAppLoading();
  const [state, formAction, pending] = useActionState(saveDailyOperationAction, initialState);
  const [isNavigating, startTransition] = useTransition();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(employeeId);
  const testingEntriesRef = useRef<HTMLInputElement>(null);
  const scrollPosRef = useRef(0);
  const initialSnapshotRef = useRef("");
  const [snapshotReady, setSnapshotReady] = useState(false);
  const errorFor = (field: string) => state.fieldErrors?.[field]?.[0];

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

  useEffect(() => {
    initialSnapshotRef.current = JSON.stringify({
      ticketsHandled: Number(ticketsHandled),
      chatsHandled: Number(chatsHandled),
      supportNotes,
      testingEntries,
    });
    setSnapshotReady(true);
  }, []);

  const currentSnapshot = JSON.stringify({
    ticketsHandled: Number(ticketsHandled),
    chatsHandled: Number(chatsHandled),
    supportNotes,
    testingEntries,
  });

  const isDirty = snapshotReady && initialSnapshotRef.current !== currentSnapshot;

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  useEffect(() => {
    if (!pending && state.message) {
      window.scrollTo(0, scrollPosRef.current);
    }
  }, [pending, state.message]);

  useEffect(() => {
    if (pending) {
      startLoading("Saving daily operations...");
      return;
    }
    if (!isNavigating) {
      stopLoading();
    }
  }, [isNavigating, pending, startLoading, stopLoading]);

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId) ?? null;
  const selectedSupportLog = selectedEmployee?.supportLog ?? supportLog;
  const selectedTestingLogs = selectedEmployee?.testingLogs ?? testingLogs;
  const isManagerView = employees.length > 0;
  const hasSelectedEmployee = !isManagerView || Boolean(selectedEmployeeId);
  const isBusy = pending || isNavigating;

  const summary = useMemo(
    () => computeSummary(testingEntries, Number(ticketsHandled), Number(chatsHandled)),
    [testingEntries, ticketsHandled, chatsHandled],
  );

  function loadDailyLog(nextDate: string, nextEmployeeId = selectedEmployeeId, scrollToLogForm = false) {
    const params = new URLSearchParams({ date: nextDate });
    if (nextEmployeeId) {
      params.set("employee", nextEmployeeId);
    }
    const nextUrl = `/operations?${params.toString()}${scrollToLogForm ? "#daily-log-form" : ""}`;
    startLoading("Loading selected log...");
    startTransition(() => {
      router.push(nextUrl);
    });
    if (scrollToLogForm) {
      window.setTimeout(() => {
        document.getElementById("daily-log-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }

  function handleTopEmployeeChange(nextEmployeeId: string) {
    setSelectedEmployeeId(nextEmployeeId);
    loadDailyLog(date, nextEmployeeId);
  }

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
    setTestingEntries((prev) => {
      const copy = { ...prev[index] };
      return [...prev, copy];
    });
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

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    scrollPosRef.current = window.scrollY;
    if (testingEntriesRef.current) {
      testingEntriesRef.current.value = JSON.stringify(testingEntries);
    }
  }

  return (
    <div className="relative space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Log date</CardTitle>
          <CardDescription>Select today or a previous date before entering support or testing work.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-[240px_minmax(260px,1fr)] md:items-end">
            <Field label="Date">
              <Input
                name="date"
                type="date"
                value={date}
                max={new Date().toISOString().slice(0, 10)}
                disabled={isBusy}
                onChange={(event) => loadDailyLog(event.target.value)}
              />
            </Field>
            {isManagerView ? (
              <Field label="Employee">
                <EmployeeSelect
                  name="employee"
                  employees={employees}
                  selectedEmployeeId={selectedEmployeeId}
                  disabled={isBusy}
                  onChange={handleTopEmployeeChange}
                />
              </Field>
            ) : (
              <input type="hidden" name="employee" value={selectedEmployeeId} />
            )}
          </div>
        </CardContent>
      </Card>

      {isManagerView ? (
        <TeamLogStatus
          rows={employees}
          selectedEmployeeId={selectedEmployeeId}
          disabled={isBusy}
          onSelectEmployee={(nextEmployeeId) => {
            setSelectedEmployeeId(nextEmployeeId);
            loadDailyLog(date, nextEmployeeId, true);
          }}
        />
      ) : null}

      <div id="daily-log-form" className="scroll-mt-6" />

      {hasSelectedEmployee ? (
        <form action={formAction} onSubmit={handleFormSubmit} className="space-y-6">
          <input type="hidden" name="employee_id" value={selectedEmployeeId} />
          <input type="hidden" name="log_date" value={date} />
          <input type="hidden" name="log_type" value="daily_operations" />
          <input type="hidden" name="attendance_status" value="present" />
          <input type="hidden" name="testing_entries" ref={testingEntriesRef} />

          <div className="rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setSupportOpen(!supportOpen)}
              className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium"
            >
              <span>Support Summary</span>
              {supportOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            {supportOpen && (
              <div className="border-t border-border px-4 pb-4 pt-3">
                <div className="grid gap-4 md:grid-cols-3">
                  <Field label="Ticket Count" error={errorFor("tickets_handled")}>
                    <Input
                      name="tickets_handled"
                      type="number"
                      min="0"
                      value={ticketsHandled}
                      onChange={(e) => setTicketsHandled(Number(e.target.value))}
                    />
                  </Field>
                  <Field label="Chat Count" error={errorFor("chats_handled")}>
                    <Input
                      name="chats_handled"
                      type="number"
                      min="0"
                      value={chatsHandled}
                      onChange={(e) => setChatsHandled(Number(e.target.value))}
                    />
                  </Field>
                  <Field label="Support Notes" error={errorFor("notes")}>
                    <textarea
                      name="notes"
                      value={supportNotes}
                      onChange={(e) => setSupportNotes(e.target.value)}
                      placeholder="Optional support context"
                      className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </Field>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setTestingOpen(!testingOpen)}
              className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium"
            >
              <span>Testing Activities</span>
              {testingOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            {testingOpen && (
              <div className="border-t border-border px-4 pb-4 pt-3">
                <div className="space-y-4">
                  <Button type="button" variant="outline" size="sm" onClick={addTestingEntry} disabled={isBusy}>
                    <Plus className="mr-1 h-4 w-4" /> Add Testing
                  </Button>

                  {testingEntries.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No testing entries. Click "Add Testing" to add one.</p>
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

                  <Button type="button" variant="outline" size="sm" onClick={addTestingEntry} disabled={isBusy}>
                    <Plus className="mr-1 h-4 w-4" /> Add Testing
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DailySummaryCard summary={summary} />

          {state.message ? (
            state.saved ? (
              <SuccessMessage message={state.message} />
            ) : (
              <ErrorMessage message={state.message} />
            )
          ) : null}

          <Button type="submit" disabled={isBusy} className="w-full sm:w-auto">
            {pending ? "Saving..." : "Save Daily Operations"}
          </Button>
        </form>
      ) : (
        <Card>
          <CardContent className="p-5 text-sm text-muted-foreground">
            Select an employee to add daily operations.
          </CardContent>
        </Card>
      )}
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
  const gridClass = "grid gap-4 md:grid-cols-2 xl:grid-cols-3";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base font-semibold">{entryLabel}</CardTitle>
        <div className="flex items-center gap-1">
          {canMoveUp ? (
            <Button type="button" variant="ghost" size="sm" onClick={onMoveUp}>
              <ArrowUp className="h-4 w-4" />
            </Button>
          ) : null}
          {canMoveDown ? (
            <Button type="button" variant="ghost" size="sm" onClick={onMoveDown}>
              <ArrowDown className="h-4 w-4" />
            </Button>
          ) : null}
          <Button type="button" variant="ghost" size="sm" onClick={onDuplicate}>
            <Copy className="h-4 w-4" />
          </Button>
          {canRemove ? (
            <Button type="button" variant="ghost" size="sm" onClick={onRemove} className="text-destructive hover:text-destructive">
              <Minus className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={gridClass}>
          <Field label="App Name">
            <SearchableSelect
              groups={appSelectGroups}
              value={entry.application_name}
              placeholder="Select app..."
              onChange={(value) => {
                const platform = platformForApp[value] ?? "shopify";
                if (isNoTestingAssigned(value)) {
                  onChange("application_name", value);
                  onChange("platform", platform);
                  onChange("module_name", "");
                  onChange("testing_type", "functional");
                  onChange("status", "in_progress");
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
          <Field label="Module / Feature Tested">
            <Input
              value={entry.module_name}
              onChange={(e) => onChange("module_name", e.target.value)}
              placeholder={isNoTestingAssigned(entry.application_name) ? "Optional (no testing assigned)" : "e.g. Import Products"}
              disabled={isNoTestingAssigned(entry.application_name)}
            />
          </Field>
        </div>

        <div className={gridClass}>
          <Field label="Testing Type">
            <Select
              value={entry.testing_type}
              onChange={(e) => onChange("testing_type", e.target.value)}
            >
              {testingTypes.map((type) => (
                <option key={type} value={type}>
                  {testingTypeLabels[type]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Testing Status">
            <Select
              value={entry.status}
              onChange={(e) => onChange("status", e.target.value)}
            >
              {testingStatuses.map((status) => (
                <option key={status} value={status}>
                  {testingStatusLabels[status]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Testing Quality">
            <Select
              value={entry.testing_quality}
              onChange={(e) => onChange("testing_quality", e.target.value)}
            >
              {testingQualities.map((quality) => (
                <option key={quality} value={quality}>
                  {testingQualityLabels[quality]}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Start Date & Time">
            <Input
              type="datetime-local"
              value={entry.started_at}
              onChange={(e) => onChange("started_at", e.target.value)}
            />
          </Field>
          <Field label="End Date & Time">
            <Input
              type="datetime-local"
              value={entry.ended_at}
              onChange={(e) => onChange("ended_at", e.target.value)}
            />
          </Field>
        </div>

        <div className={gridClass}>
          <Field label="Bugs Found (Total)">
            <Input
              type="number"
              min="0"
              value={entry.bugs_found}
              onChange={(e) => onChange("bugs_found", Number(e.target.value))}
            />
          </Field>
          <Field label="Critical Bugs">
            <Input
              type="number"
              min="0"
              value={entry.critical_bugs_found}
              onChange={(e) => onChange("critical_bugs_found", Number(e.target.value))}
            />
          </Field>
        </div>

        <div>
          <Field label="Additional Notes">
            <textarea
              value={entry.notes}
              onChange={(e) => onChange("notes", e.target.value)}
              placeholder="Optional notes for this testing entry"
              className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </Field>
        </div>
      </CardContent>
    </Card>
  );
}

function DailySummaryCard({ summary }: { summary: DailySummaryStats }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Summary</CardTitle>
        <CardDescription>Automatically computed from the current form data.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          <StatCard label="Total Tickets" value={summary.totalTickets} />
          <StatCard label="Total Chats" value={summary.totalChats} />
          <StatCard label="Apps Tested" value={summary.totalAppsTested} />
          <StatCard label="Testing Entries" value={summary.totalTestingEntries} />
          <StatCard label="Total Bugs" value={summary.totalBugs} />
          <StatCard label="Critical Bugs" value={summary.criticalBugs} />
          <StatCard label="Completed" value={summary.completedTests} />
          <StatCard label="In Progress" value={summary.inProgressTests} />
          <StatCard label="Blocked" value={summary.blockedTests} />
          <StatCard label="On Hold" value={summary.onHoldTests} />
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function EmployeeSelect({
  name = "employee_id",
  employees,
  selectedEmployeeId,
  disabled = false,
  onChange,
}: {
  name?: string;
  employees: EmployeeOption[];
  selectedEmployeeId: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <Select name={name} value={selectedEmployeeId} disabled={disabled} onChange={(event) => onChange(event.target.value)} required>
      <option value="">Select employee</option>
      {employees.map((employee) => (
        <option key={employee.id} value={employee.id}>
          {employee.fullName}
        </option>
      ))}
    </Select>
  );
}

function TeamLogStatus({
  rows,
  selectedEmployeeId,
  disabled,
  onSelectEmployee,
}: {
  rows: EmployeeOption[];
  selectedEmployeeId: string;
  disabled: boolean;
  onSelectEmployee: (value: string) => void;
}) {
  const pendingRows = rows.filter((employee) =>
    employee.role === "qa_engineer" ? employee.testingLogs.length === 0 : !employee.supportLog,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team log status</CardTitle>
        <CardDescription>
          Use Add when no log exists for this date. Use Edit after a log has already been saved.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingRows.length > 0 ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
            {pendingRows.length} team member{pendingRows.length === 1 ? "" : "s"} still need a daily log for this date.
          </div>
        ) : (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
            Required daily logs are complete for this date.
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((employee) => {
            const isQaEngineer = employee.role === "qa_engineer";
            const primaryLog = isQaEngineer ? employee.testingLogs[0] : employee.supportLog;
            const selected = selectedEmployeeId === employee.id;

            return (
              <div key={employee.id} className="rounded-md border border-border bg-background p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{employee.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {isQaEngineer ? "QA Engineer" : "Support Engineer"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={selected ? "default" : "outline"}
                    disabled={disabled}
                    onClick={() => onSelectEmployee(employee.id)}
                  >
                    {primaryLog ? "Edit log" : "Add log"}
                  </Button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>{isQaEngineer ? "Testing" : "Support"}: {primaryLog ? "Logged" : "Missing"}</span>
                  {!isQaEngineer && employee.testingLogs.length > 0 ? <span>Testing: {employee.testingLogs.length}</span> : null}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function SuccessMessage({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
      {message}
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {message}
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
