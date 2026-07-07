"use client";

import type React from "react";
import { useActionState } from "react";
import { roleLabels, roles } from "@/lib/auth/roles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  createEmployeeAction,
  updateEmployeeAction,
  type EmployeeActionState,
} from "../actions";
import {
  employmentStatusLabels,
  employmentStatusOptions,
  shiftLabels,
  shiftOptions,
  type Employee,
} from "../types";

const initialState: EmployeeActionState = {};

export function EmployeeForm({ employee }: { employee?: Employee }) {
  const isEditing = Boolean(employee);
  const [state, formAction, pending] = useActionState(
    isEditing ? updateEmployeeAction : createEmployeeAction,
    initialState,
  );

  const errorFor = (field: string) => state.fieldErrors?.[field]?.[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit employee" : "Add employee"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Update employee profile, role, shift, and employment status."
            : "Create an employee profile and Supabase Auth login for team access."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          {employee ? <input type="hidden" name="id" value={employee.id} /> : null}

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Full name" error={errorFor("full_name")}>
              <Input name="full_name" defaultValue={employee?.full_name} required />
            </Field>
            <Field label="Work email" error={errorFor("email")}>
              <Input name="email" type="email" defaultValue={employee?.email} required />
            </Field>
            {!isEditing ? (
              <Field label="Temporary password" error={errorFor("password")}>
                <Input name="password" type="password" minLength={8} required />
              </Field>
            ) : null}
            <Field label="Employee code" error={errorFor("employee_code")}>
              <Input name="employee_code" defaultValue={employee?.employee_code ?? ""} placeholder="Optional" />
            </Field>
            <Field label="Role" error={errorFor("role")}>
              <Select name="role" defaultValue={employee?.role ?? "support_engineer"} required>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {roleLabels[role]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Shift" error={errorFor("shift")}>
              <Select name="shift" defaultValue={employee?.shift ?? "day"} required>
                {shiftOptions.map((shift) => (
                  <option key={shift} value={shift}>
                    {shiftLabels[shift]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Employment status" error={errorFor("employment_status")}>
              <Select name="employment_status" defaultValue={employee?.employment_status ?? "active"} required>
                {employmentStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {employmentStatusLabels[status]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Joining date" error={errorFor("joined_at")}>
              <Input name="joined_at" type="date" defaultValue={employee?.joined_at ?? ""} />
            </Field>
            <Field label="Avatar URL" error={errorFor("avatar_url")}>
              <Input name="avatar_url" type="url" defaultValue={employee?.avatar_url ?? ""} placeholder="Optional placeholder" />
            </Field>
          </div>

          {state.message ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
              {state.message}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : isEditing ? "Save changes" : "Create employee"}
            </Button>
          </div>
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
