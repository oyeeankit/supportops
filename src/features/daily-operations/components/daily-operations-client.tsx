"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, LogIn } from "lucide-react";
import { roleLabels } from "@/lib/auth/roles";
import type { AppRole } from "@/lib/auth/roles";
import type { DailySupportLog, DailyTestingLog } from "../types";
import { DailyOperationsModal } from "./daily-operations-modal";

export type TeamCardRow = {
  employee_id: string;
  full_name: string;
  email: string;
  role: AppRole;
  avatar_url: string | null;
  supportLog: DailySupportLog | null;
  testingLogs: DailyTestingLog[];
};

type Props = {
  rows: TeamCardRow[];
  initialDate: string;
  isManager: boolean;
};

type SupportStatus = "completed" | "partial" | "missing";
type TestingStatus = "completed" | "in_progress" | "missing";

function getSupportStatus(row: TeamCardRow): SupportStatus {
  if (!row.supportLog) return "missing";
  if (row.supportLog.attendance_status === "leave") return "completed";
  const hasWork = row.supportLog.tickets_handled > 0 || row.supportLog.chats_handled > 0;
  const hasNotes = row.supportLog.notes != null && row.supportLog.notes.trim() !== "";
  if (hasWork && hasNotes) return "completed";
  if (hasWork || hasNotes) return "partial";
  return "missing";
}

function getTestingStatus(row: TeamCardRow): TestingStatus {
  if (row.testingLogs.length === 0) return "missing";
  const allCompleted = row.testingLogs.every((log) => log.status === "completed");
  if (allCompleted) return "completed";
  return "in_progress";
}

function getLastUpdated(row: TeamCardRow): string | null {
  const supportUpdated = row.supportLog?.updated_at ?? null;
  const testingUpdated = row.testingLogs.length > 0
    ? row.testingLogs.reduce((latest, log) => (log.updated_at > latest ? log.updated_at : latest), row.testingLogs[0].updated_at)
    : null;
  if (supportUpdated && testingUpdated) {
    return supportUpdated > testingUpdated ? supportUpdated : testingUpdated;
  }
  return supportUpdated ?? testingUpdated;
}

function formatLastUpdated(iso: string | null): string {
  if (!iso) return "Never";
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en", { day: "2-digit", month: "short" });
}

function supportBadgeVariant(status: SupportStatus): "success" | "warning" | "danger" {
  if (status === "completed") return "success";
  if (status === "partial") return "warning";
  return "danger";
}

function testingBadgeVariant(status: TestingStatus): "success" | "warning" | "danger" {
  if (status === "completed") return "success";
  if (status === "in_progress") return "warning";
  return "danger";
}

export function DailyOperationsClient({ rows, initialDate, isManager }: Props) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [modalEmployee, setModalEmployee] = useState<TeamCardRow | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [optimisticRows, setOptimisticRows] = useState(rows);

  useEffect(() => {
    setOptimisticRows(rows);
  }, [rows]);

  function handleDateChange(newDate: string) {
    setSelectedDate(newDate);
    const params = new URLSearchParams({ date: newDate });
    router.push(`/operations?${params.toString()}`);
  }

  function openModal(row: TeamCardRow) {
    setModalEmployee(row);
  }

  function closeModal() {
    setModalEmployee(null);
  }

  function handleSaved() {
    setModalEmployee(null);
    setToast("Daily operations saved successfully.");
    router.refresh();
    window.setTimeout(() => setToast(null), 3000);
  }

  const today = new Date().toISOString().slice(0, 10);
  const pendingCount = optimisticRows.filter((row) => {
    const s = getSupportStatus(row);
    const t = getTestingStatus(row);
    return s === "missing" || t === "missing";
  }).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Log Date</CardTitle>
          <CardDescription>Select a date to view or add daily logs for the team.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-[240px_1fr]">
            <Field label="Date">
              <Input
                type="date"
                value={selectedDate}
                max={today}
                onChange={(e) => handleDateChange(e.target.value)}
              />
            </Field>
            {pendingCount > 0 ? (
              <div className="flex items-end">
                <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
                  {pendingCount} team member{pendingCount === 1 ? "" : "s"} still need a daily log for this date.
                </div>
              </div>
            ) : (
              <div className="flex items-end">
                <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                  All daily logs are complete for this date.
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Log Status</CardTitle>
          <CardDescription>
            Click &quot;Add Log&quot; or &quot;Edit Log&quot; to open the daily operations form for each employee.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {optimisticRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active team members found.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {optimisticRows.map((row) => {
                const supportStatus = getSupportStatus(row);
                const testingStatus = getTestingStatus(row);
                const isComplete = supportStatus === "completed" && testingStatus === "completed";
                const hasLog = row.supportLog !== null || row.testingLogs.length > 0;
                const lastUpdated = getLastUpdated(row);

                return (
                  <div
                    key={row.employee_id}
                    className={`rounded-lg border p-4 ${isComplete ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/30" : "border-border bg-background"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <p className="font-medium">{row.full_name}</p>
                        <p className="text-xs text-muted-foreground">{roleLabels[row.role]}</p>
                      </div>
                      {isComplete ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <LogIn className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>

                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground">Support:</span>
                        <Badge variant={supportBadgeVariant(supportStatus)}>
                          {supportStatus === "completed" ? "Completed" : supportStatus === "partial" ? "Partial" : "Missing"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground">Testing:</span>
                        <Badge variant={testingBadgeVariant(testingStatus)}>
                          {testingStatus === "completed" ? "Completed" : testingStatus === "in_progress" ? "In Progress" : "Missing"}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-xs text-muted-foreground">
                        {hasLog ? `Updated ${formatLastUpdated(lastUpdated)}` : "Not logged"}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant={hasLog ? "default" : "outline"}
                        onClick={() => openModal(row)}
                      >
                        {hasLog ? "Edit Log" : "Add Log"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {toast ? (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 shadow-lg dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
          {toast}
        </div>
      ) : null}

      {modalEmployee ? (
        <DailyOperationsModal
          open={true}
          onClose={closeModal}
          onSaved={handleSaved}
          employeeId={modalEmployee.employee_id}
          employeeName={modalEmployee.full_name}
          employeeRole={modalEmployee.role}
          initialDate={selectedDate}
          initialSupportLog={modalEmployee.supportLog}
          initialTestingLogs={modalEmployee.testingLogs}
        />
      ) : null}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
