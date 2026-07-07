"use client";

import type React from "react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  attendanceStatusLabels,
  attendanceStatuses,
  workFocusLabels,
  workFocusOptions,
  type DailyOperation,
} from "../types";
import { saveDailyOperationAction, type DailyOperationActionState } from "../actions";

const initialState: DailyOperationActionState = {};

export function DailyEntryForm({
  employeeId,
  date,
  operation,
}: {
  employeeId: string;
  date: string;
  operation: DailyOperation | null;
}) {
  const [state, formAction, pending] = useActionState(saveDailyOperationAction, initialState);
  const errorFor = (field: string) => state.fieldErrors?.[field]?.[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily status update</CardTitle>
        <CardDescription>
          Quickly record today&apos;s employee status, support workload, testing focus, and notes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5">
          <input type="hidden" name="employee_id" value={employeeId} />
          <input type="hidden" name="operation_date" value={date} />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Employee Status" error={errorFor("attendance_status")}>
              <Select name="attendance_status" defaultValue={operation?.attendance_status ?? "present"}>
                {attendanceStatuses.map((status) => (
                  <option key={status} value={status}>
                    {attendanceStatusLabels[status]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Tickets" error={errorFor("tickets_resolved")}>
              <Input name="tickets_resolved" type="number" min="0" defaultValue={operation?.tickets_resolved ?? 0} />
            </Field>
            <Field label="Chats" error={errorFor("chats_handled")}>
              <Input name="chats_handled" type="number" min="0" defaultValue={operation?.chats_handled ?? 0} />
            </Field>
            <Field label="Work focus" error={errorFor("work_focus")}>
              <Select name="work_focus" defaultValue={operation?.work_focus ?? "support"}>
                {workFocusOptions.map((focus) => (
                  <option key={focus} value={focus}>
                    {workFocusLabels[focus]}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Current testing task" error={errorFor("current_testing_task")}>
              <Input
                name="current_testing_task"
                defaultValue={operation?.current_testing_task ?? ""}
                placeholder="Optional"
              />
            </Field>
            <Field label="Notes" error={errorFor("notes")}>
              <Input name="notes" defaultValue={operation?.notes ?? ""} placeholder="Optional daily context" />
            </Field>
          </div>

          {state.message ? (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
              {state.message}
            </div>
          ) : null}

          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save daily entry"}
          </Button>
        </form>
      </CardContent>
    </Card>
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
