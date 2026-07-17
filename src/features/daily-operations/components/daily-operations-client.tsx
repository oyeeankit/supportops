"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, LogIn, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { roleLabels } from "@/lib/auth/roles";
import type { AppRole } from "@/lib/auth/roles";
import type { DailySupportLog, DailyTestingLog } from "../types";
import { DailyOperationsModal } from "./daily-operations-modal";
import { cn } from "@/lib/utils/cn";

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

export function DailyOperationsClient({ rows, initialDate, isManager, monthlyRows = [] }: Props) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [modalEmployee, setModalEmployee] = useState<TeamCardRow | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [optimisticRows, setOptimisticRows] = useState(rows);

  // Calendar States
  const [currentView, setCurrentView] = useState<"list" | "calendar">("list");
  const [calendarMonth, setCalendarMonth] = useState<string>(() => initialDate.slice(0, 7));
  const [calendarEmployeeId, setCalendarEmployeeId] = useState<string>(() => {
    if (isManager) return "all";
    return rows[0]?.employee_id ?? "";
  });

  useEffect(() => {
    setOptimisticRows(rows);
  }, [rows]);

  function handleDateChange(newDate: string) {
    setSelectedDate(newDate);
    const params = new URLSearchParams({ date: newDate });
    router.push(`/operations?${params.toString()}`);
  }

  function handleMonthChange(newMonth: string) {
    setCalendarMonth(newMonth);
    const params = new URLSearchParams({ date: `${newMonth}-01` });
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

  const openCalendarModal = (employeeId: string, dateStr: string) => {
    setSelectedDate(dateStr);
    const empRow = monthlyRows.find((r) => r.employee_id === employeeId);
    if (empRow) {
      const sLog = empRow.supportLogs.find((l) => l.log_date === dateStr) ?? null;
      const tLogs = empRow.testingLogs.filter((l) => l.log_date === dateStr);
      openModal({
        employee_id: empRow.employee_id,
        full_name: empRow.full_name,
        email: empRow.email,
        role: empRow.role,
        avatar_url: empRow.avatar_url,
        supportLog: sLog,
        testingLogs: tLogs,
      });
    }
  };

  const today = new Date().toISOString().slice(0, 10);
  const pendingCount = optimisticRows.filter((row) => {
    const s = getSupportStatus(row);
    const t = getTestingStatus(row);
    return s === "missing" || t === "missing";
  }).length;

  // Calendar Calculations
  const year = Number(calendarMonth.split("-")[0]);
  const month = Number(calendarMonth.split("-")[1]) - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const blanks = Array.from({ length: firstDayOfWeek });
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const dateStrForDay = (dayNum: number) => {
    const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
    return `${calendarMonth}-${formattedDay}`;
  };

  const getTeamCompletionForDay = (dayDateStr: string) => {
    let completedCount = 0;
    const totalCount = monthlyRows.length;
    if (totalCount === 0) return { completed: 0, total: 0 };

    for (const empRow of monthlyRows) {
      const sLog = empRow.supportLogs.find((l) => l.log_date === dayDateStr) ?? null;
      const tLogs = empRow.testingLogs.filter((l) => l.log_date === dayDateStr);

      const supportStatus = sLog ? (sLog.attendance_status === "leave" ? "completed" : (sLog.tickets_handled > 0 || sLog.chats_handled > 0 ? "completed" : "missing")) : "missing";
      const testingStatus = tLogs.length > 0 ? (tLogs.every((l) => l.status === "completed") ? "completed" : "in_progress") : "missing";
      
      if (supportStatus === "completed" && testingStatus === "completed") {
        completedCount++;
      }
    }
    return { completed: completedCount, total: totalCount };
  };

  const getEmployeeLogStateForDay = (empId: string, dayDateStr: string) => {
    const empRow = monthlyRows.find((r) => r.employee_id === empId);
    if (!empRow) return { status: "missing", tickets: 0, chats: 0, bugs: 0, leave: false };

    const sLog = empRow.supportLogs.find((l) => l.log_date === dayDateStr) ?? null;
    const tLogs = empRow.testingLogs.filter((l) => l.log_date === dayDateStr);

    const isLeave = sLog?.attendance_status === "leave";
    const tickets = sLog?.tickets_handled ?? 0;
    const chats = sLog?.chats_handled ?? 0;
    const bugs = tLogs.reduce((sum, t) => sum + t.bugs_found, 0);

    const hasSupport = sLog !== null;
    const hasTesting = tLogs.length > 0;

    let status: "completed" | "partial" | "missing" = "missing";
    if (isLeave) {
      status = "completed";
    } else {
      const supportOk = !hasSupport || sLog.attendance_status === "leave" || tickets > 0 || chats > 0 || sLog.notes !== "";
      const testingOk = !hasTesting || tLogs.every((t) => t.status === "completed");
      
      if (hasSupport && hasTesting) {
        if (supportOk && testingOk) status = "completed";
        else if (supportOk || testingOk) status = "partial";
      } else if (hasSupport) {
        status = supportOk ? "completed" : "missing";
      } else if (hasTesting) {
        status = testingOk ? "completed" : "missing";
      }
    }

    return { status, tickets, chats, bugs, leave: isLeave };
  };

  return (
    <div className="space-y-6">
      {/* View Switcher Toggle */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div className="flex items-center bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl border border-border/40 shadow-sm max-w-xs">
          <button
            onClick={() => setCurrentView("list")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200",
              currentView === "list"
                ? "bg-card shadow-sm border border-border/20 text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            List View
          </button>
          <button
            onClick={() => setCurrentView("calendar")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200",
              currentView === "calendar"
                ? "bg-card shadow-sm border border-border/20 text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Calendar className="h-3.5 w-3.5" />
            Calendar View
          </button>
        </div>
      </div>

      {currentView === "list" ? (
        <>
          {/* List View Date Picker Panel */}
          <Card className="rounded-2xl border border-border/60 overflow-hidden shadow-sm">
            <CardHeader className="bg-slate-50/40 dark:bg-slate-900/10 px-5 py-4 border-b border-border/50">
              <CardTitle className="text-base font-bold tracking-tight">Log Date</CardTitle>
              <CardDescription>Select a date to view or add daily logs for the team.</CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid gap-4 sm:grid-cols-[240px_1fr]">
                <Field label="Date">
                  <Input
                    type="date"
                    value={selectedDate}
                    max={today}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="rounded-xl border-border/80 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                  />
                </Field>
                {pendingCount > 0 ? (
                  <div className="flex items-end">
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200 shadow-sm">
                      {pendingCount} team member{pendingCount === 1 ? "" : "s"} still need a daily log for this date.
                    </div>
                  </div>
                ) : (
                  <div className="flex items-end">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 shadow-sm">
                      All daily logs are complete for this date.
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* List View Team Status Grid */}
          <Card className="rounded-2xl border border-border/60 overflow-hidden shadow-sm">
            <CardHeader className="bg-slate-50/40 dark:bg-slate-900/10 px-5 py-4 border-b border-border/50">
              <CardTitle className="text-base font-bold tracking-tight">Team Log Status</CardTitle>
              <CardDescription>
                Click &quot;Add Log&quot; or &quot;Edit Log&quot; to open the daily operations form for each employee.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              {optimisticRows.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active team members found.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {optimisticRows.map((row) => {
                    const supportStatus = getSupportStatus(row);
                    const testingStatus = getTestingStatus(row);
                    const isComplete = supportStatus === "completed" && testingStatus === "completed";
                    const hasLog = row.supportLog !== null || row.testingLogs.length > 0;
                    const lastUpdated = getLastUpdated(row);

                    return (
                      <div
                        key={row.employee_id}
                        className={cn(
                          "rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md animate-slide-in",
                          isComplete
                            ? "border-emerald-200/80 bg-gradient-to-br from-emerald-50/60 to-card dark:from-emerald-950/20 dark:border-emerald-900/50 shadow-sm"
                            : "border-border/85 bg-card"
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="font-semibold text-foreground tracking-tight">{row.full_name}</p>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{roleLabels[row.role]}</p>
                          </div>
                          {isComplete ? (
                            <span className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200/40">
                              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </span>
                          ) : (
                            <span className="p-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/40">
                              <LogIn className="h-5 w-5 text-muted-foreground" />
                            </span>
                          )}
                        </div>

                        <div className="mt-4 space-y-2 border-t border-border/40 pt-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground font-medium">Support:</span>
                            <Badge variant={supportBadgeVariant(supportStatus)} className="rounded-full px-2.5 py-0.5">
                              {supportStatus === "completed" ? "Completed" : supportStatus === "partial" ? "Partial" : "Missing"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground font-medium">Testing:</span>
                            <Badge variant={testingBadgeVariant(testingStatus)} className="rounded-full px-2.5 py-0.5">
                              {testingStatus === "completed" ? "Completed" : testingStatus === "in_progress" ? "In Progress" : "Missing"}
                            </Badge>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between gap-3">
                          <span className="text-xs text-muted-foreground font-medium">
                            {hasLog ? `Updated ${formatLastUpdated(lastUpdated)}` : "Not logged"}
                          </span>
                          <Button
                            type="button"
                            size="sm"
                            variant={hasLog ? "default" : "outline"}
                            onClick={() => openModal(row)}
                            className="rounded-xl px-4 font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
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
        </>
      ) : (
        /* Calendar Monthly View Panel */
        <div className="space-y-6">
          {/* Calendar Picker Panel */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/30 border border-border/60 p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const prevMonthDate = new Date(year, month - 1, 1);
                  handleMonthChange(prevMonthDate.toISOString().slice(0, 7));
                }}
                className="rounded-xl p-2 border hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-base font-bold tracking-tight text-foreground bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
                {new Date(year, month, 1).toLocaleDateString("en", { month: "long", year: "numeric" })}
              </span>
              <button
                onClick={() => {
                  const nextMonthDate = new Date(year, month + 1, 1);
                  handleMonthChange(nextMonthDate.toISOString().slice(0, 7));
                }}
                className="rounded-xl p-2 border hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            
            {isManager && (
              <div className="flex items-center gap-2">
                <Label htmlFor="calendar-employee-select" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">View for:</Label>
                <select
                  id="calendar-employee-select"
                  value={calendarEmployeeId}
                  onChange={(e) => setCalendarEmployeeId(e.target.value)}
                  className="rounded-xl border border-border/80 bg-background px-3 py-1.5 text-xs font-medium shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-200 cursor-pointer"
                >
                  <option value="all">All Team Members</option>
                  {rows.map((row) => (
                    <option key={row.employee_id} value={row.employee_id}>
                      {row.full_name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Calendar Grid Sheet */}
          <Card className="rounded-2xl border border-border/60 overflow-hidden shadow-sm bg-card">
            <div className="p-5">
              {/* Days Header */}
              <div className="grid grid-cols-7 gap-3 mb-2 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-3">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>

              {/* Grid Cells */}
              <div className="grid grid-cols-7 gap-3">
                {blanks.map((_, i) => (
                  <div key={`blank-${i}`} className="bg-slate-50/20 dark:bg-slate-900/5 rounded-2xl border border-border/30 min-h-[90px] md:min-h-[110px] opacity-40" />
                ))}
                {days.map((day) => {
                  const dateStr = dateStrForDay(day);
                  const isAll = calendarEmployeeId === "all";
                  const teamData = isAll ? getTeamCompletionForDay(dateStr) : null;
                  const empData = !isAll ? getEmployeeLogStateForDay(calendarEmployeeId, dateStr) : null;

                  let cellClass = "border-border bg-slate-50/10";
                  let dotColor = "bg-slate-300 dark:bg-slate-700";
                  let badgeText = "";
                  let detailEl = null;

                  if (isAll && teamData) {
                    const ratio = teamData.total > 0 ? teamData.completed / teamData.total : 0;
                    badgeText = `${teamData.completed} / ${teamData.total}`;
                    if (ratio === 1) {
                      cellClass = "border-emerald-200/80 bg-emerald-50/15 text-emerald-800 dark:text-emerald-300 dark:bg-emerald-950/10";
                      dotColor = "bg-emerald-500 animate-pulse-green";
                    } else if (ratio > 0) {
                      cellClass = "border-amber-200/80 bg-amber-50/15 text-amber-800 dark:text-amber-300 dark:bg-amber-950/10";
                      dotColor = "bg-amber-500 animate-pulse-blue";
                    } else {
                      cellClass = "border-slate-200 dark:border-slate-800 bg-slate-50/10 text-muted-foreground";
                      dotColor = "bg-slate-300 dark:bg-slate-700";
                    }
                  } else if (empData) {
                    if (empData.leave) {
                      cellClass = "border-blue-200/80 bg-blue-50/10 text-blue-800 dark:text-blue-300 dark:bg-blue-950/10";
                      dotColor = "bg-blue-500 animate-pulse-blue";
                      detailEl = <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mt-1">🏝️ LEAVE</div>;
                    } else if (empData.status === "completed") {
                      cellClass = "border-emerald-200/80 bg-emerald-50/15 text-emerald-800 dark:text-emerald-300 dark:bg-emerald-950/10";
                      dotColor = "bg-emerald-500 animate-pulse-green";
                    } else if (empData.status === "partial") {
                      cellClass = "border-amber-200/80 bg-amber-50/15 text-amber-800 dark:text-amber-300 dark:bg-amber-950/10";
                      dotColor = "bg-amber-500 animate-pulse-blue";
                    } else {
                      cellClass = "border-slate-200 dark:border-slate-800 bg-slate-50/10 text-muted-foreground";
                      dotColor = "bg-slate-300 dark:bg-slate-700";
                    }
                  }

                  if (!empData?.leave && empData?.status !== "missing" && empData) {
                    detailEl = (
                      <div className="mt-1 space-y-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-400">
                        {(empData.tickets > 0 || empData.chats > 0) && (
                          <div className="flex items-center gap-0.5">
                            <span>🎫</span>
                            <span>{empData.tickets + empData.chats}</span>
                          </div>
                        )}
                        {empData.bugs > 0 && (
                          <div className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400">
                            <span>🐛</span>
                            <span>{empData.bugs}</span>
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={`day-${day}`}
                      onClick={() => {
                        if (!isAll) {
                          openCalendarModal(calendarEmployeeId, dateStr);
                        } else {
                          setSelectedDate(dateStr);
                          const params = new URLSearchParams({ date: dateStr });
                          router.push(`/operations?${params.toString()}`);
                          setCurrentView("list");
                        }
                      }}
                      className={cn(
                        "relative p-3 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between group min-h-[90px] md:min-h-[110px] animate-slide-in",
                        cellClass,
                        "hover:shadow-md hover:-translate-y-0.5"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className={cn("h-2 w-2 rounded-full shadow-sm", dotColor)} />
                        <span className="text-xs font-bold text-slate-500 group-hover:text-foreground transition-colors">{day}</span>
                      </div>
                      
                      {isAll ? (
                        <div className="text-center py-2.5">
                          <span className="text-xs font-bold tracking-tight bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            {badgeText}
                          </span>
                          <span className="block text-[8px] font-semibold text-muted-foreground uppercase mt-1 tracking-wider">Logged</span>
                        </div>
                      ) : (
                        <div className="flex flex-col justify-end h-full">
                          {detailEl}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      )}

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
