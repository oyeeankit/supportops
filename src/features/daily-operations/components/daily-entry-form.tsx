"use client";

import type React from "react";
import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppLoading } from "@/components/feedback/app-loading";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { AppRole } from "@/lib/auth/roles";
import { attendanceStatusLabels, attendanceStatuses, testingStatusLabels, testingStatuses, testingTypeLabels, testingTypes, type DailySupportLog, type DailyTestingLog } from "../types";
import { saveDailyOperationAction, type DailyOperationActionState } from "../actions";

const initialState: DailyOperationActionState = {};

type EmployeeOption = {
  id: string;
  fullName: string;
  role: AppRole;
  supportLog: DailySupportLog | null;
  testingLog: DailyTestingLog | null;
};

export function DailyEntryForm({
  employeeId,
  date,
  supportLog,
  testingLog,
  employees = [],
}: {
  employeeId: string;
  date: string;
  supportLog: DailySupportLog | null;
  testingLog: DailyTestingLog | null;
  employees?: EmployeeOption[];
}) {
  const router = useRouter();
  const { startLoading, stopLoading } = useAppLoading();
  const [state, formAction, pending] = useActionState(saveDailyOperationAction, initialState);
  const [isNavigating, startTransition] = useTransition();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(employeeId);
  const errorFor = (field: string) => state.fieldErrors?.[field]?.[0];

  const selectedEmployee = employees.find((employee) => employee.id === selectedEmployeeId) ?? null;
  const selectedSupportLog = selectedEmployee?.supportLog ?? supportLog;
  const selectedTestingLog = selectedEmployee?.testingLog ?? testingLog;
  const isManagerView = employees.length > 0;
  const hasSelectedEmployee = !isManagerView || Boolean(selectedEmployeeId);
  const isQaEngineer = selectedEmployee?.role === "qa_engineer";
  const supportFormKey = `support-${selectedEmployeeId}-${date}-${selectedSupportLog?.id ?? "new"}`;
  const testingFormKey = `testing-${selectedEmployeeId}-${date}-${selectedTestingLog?.id ?? "new"}`;
  const supportActionLabel = selectedSupportLog ? "Update support log" : "Add support log";
  const testingActionLabel = selectedTestingLog ? "Update testing log" : "Add testing log";
  const isBusy = pending || isNavigating;

  useEffect(() => {
    if (pending) {
      startLoading("Saving log...");
      return;
    }

    if (!isNavigating) {
      stopLoading();
    }
  }, [isNavigating, pending, startLoading, stopLoading]);

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

      {hasSelectedEmployee && !isQaEngineer ? (
        <Card>
          <CardHeader>
            <CardTitle>{selectedSupportLog ? "Edit support log" : "Add support log"}</CardTitle>
            <CardDescription>
              {selectedSupportLog
                ? "This employee already has a support log for the selected date. Update the saved data here."
                : "Record support tickets, chats, attendance, and support notes for the selected employee."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form key={supportFormKey} action={formAction} className="space-y-5">
              <input type="hidden" name="employee_id" value={selectedEmployeeId} />
              <input type="hidden" name="log_date" value={date} />
              <input type="hidden" name="log_type" value="support" />
              <input type="hidden" name="attendance_status" value={selectedSupportLog?.attendance_status ?? "present"} />

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Field label="Status" error={errorFor("attendance_status")}>
                  <Select name="attendance_status" defaultValue={selectedSupportLog?.attendance_status ?? "present"}>
                    {attendanceStatuses.map((status) => (
                      <option key={status} value={status}>
                        {attendanceStatusLabels[status]}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Tickets handled" error={errorFor("tickets_handled")}>
                  <Input name="tickets_handled" type="number" min="0" defaultValue={selectedSupportLog?.tickets_handled ?? 0} />
                </Field>
                <Field label="Chats handled" error={errorFor("chats_handled")}>
                  <Input name="chats_handled" type="number" min="0" defaultValue={selectedSupportLog?.chats_handled ?? 0} />
                </Field>
                <Field label="Support notes" error={errorFor("notes")}>
                  <Input name="notes" defaultValue={selectedSupportLog?.notes ?? ""} placeholder="Optional support context" />
                </Field>
              </div>

              {state.savedLogType === "support" && state.message ? (
                <SuccessMessage message={state.message} />
              ) : null}

              <div className="flex flex-wrap gap-2">
                <Button type="submit" name="submit_action" value="save" disabled={isBusy || !hasSelectedEmployee}>
                  {pending ? "Saving..." : supportActionLabel}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {hasSelectedEmployee ? (
        <Card>
          <CardHeader>
            <CardTitle>{selectedTestingLog ? "Edit testing log" : "Add testing log"}</CardTitle>
            <CardDescription>
              {selectedTestingLog
                ? "This employee already has a testing log for the selected date. Update the saved data here."
                : "Only fill this when the selected employee performed testing work today."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form key={testingFormKey} action={formAction} className="space-y-5">
              <input type="hidden" name="employee_id" value={selectedEmployeeId} />
            <input type="hidden" name="log_date" value={date} />
            <input type="hidden" name="log_type" value="testing" />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Field label="Application / Project" error={errorFor("application_name")}>
                <Input name="application_name" defaultValue={selectedTestingLog?.application_name ?? ""} placeholder="e.g. CSVBox" />
              </Field>
              <Field label="Module" error={errorFor("module_name")}>
                <Input name="module_name" defaultValue={selectedTestingLog?.module_name ?? ""} placeholder="e.g. OCR" />
              </Field>
              <Field label="Testing type" error={errorFor("testing_type")}>
                <Select name="testing_type" defaultValue={selectedTestingLog?.testing_type ?? "functional"}>
                  {testingTypes.map((type) => (
                    <option key={type} value={type}>
                      {testingTypeLabels[type]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Status" error={errorFor("status")}>
                <Select name="status" defaultValue={selectedTestingLog?.status ?? "in_progress"}>
                  {testingStatuses.map((status) => (
                    <option key={status} value={status}>
                      {testingStatusLabels[status]}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Field label="Testing task" error={errorFor("testing_task")}>
                <Input name="testing_task" defaultValue={selectedTestingLog?.testing_task ?? ""} placeholder="Regression testing" />
              </Field>
              <Field label="Bugs found" error={errorFor("bugs_found")}>
                <Input name="bugs_found" type="number" min="0" defaultValue={selectedTestingLog?.bugs_found ?? 0} />
              </Field>
              <Field label="Critical bugs" error={errorFor("critical_bugs_found")}>
                <Input name="critical_bugs_found" type="number" min="0" defaultValue={selectedTestingLog?.critical_bugs_found ?? 0} />
              </Field>
              <Field label="Testing notes" error={errorFor("notes")}>
                <Input name="notes" defaultValue={selectedTestingLog?.notes ?? ""} placeholder="Optional testing context" />
              </Field>
            </div>

            {state.savedLogType === "testing" && state.message ? (
              <SuccessMessage message={state.message} />
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button type="submit" name="submit_action" value="save" disabled={isBusy || !hasSelectedEmployee}>
                {pending ? "Saving..." : testingActionLabel}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      ) : (
        <Card>
          <CardContent className="p-5 text-sm text-muted-foreground">
            Select an employee to add daily support or testing logs.
          </CardContent>
        </Card>
      )}
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
    employee.role === "qa_engineer" ? !employee.testingLog : !employee.supportLog,
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
            const primaryLog = isQaEngineer ? employee.testingLog : employee.supportLog;
            const secondaryLog = isQaEngineer ? null : employee.testingLog;
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
                  {secondaryLog ? <span>Testing: Logged</span> : null}
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
