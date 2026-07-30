"use client";

import * as React from "react";
import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Search,
  MoreVertical,
  Copy,
  FileText,
  Trash2,
  Home,
  CalendarOff,
  Ticket,
  MessageSquare,
  Activity,
  ShieldAlert,
  CircleDashed,
  CheckSquare,
  Sparkles,
  Download
} from "lucide-react";
import { roleLabels } from "@/lib/auth/roles";
import type { AppRole } from "@/lib/auth/roles";
import type { DailySupportLog, DailyTestingLog } from "../types";
import type { TeamMemberMonthlyLogsRow } from "../queries";
import { DailyOperationsModal } from "./daily-operations-modal";
import { cn } from "@/lib/utils/cn";

export type TeamCardRow = {
  employee_id: string;
  full_name: string;
  email: string;
  role: AppRole;
  avatar_url: string | null;
  shift?: string;
  supportLog: DailySupportLog | null;
  testingLogs: DailyTestingLog[];
};

type Props = {
  rows: TeamCardRow[];
  initialDate: string;
  isManager: boolean;
  monthlyRows?: TeamMemberMonthlyLogsRow[];
};

type SupportStatus = "completed" | "missing";
type TestingStatus = "completed" | "in_progress" | "missing";

function getSupportStatus(row: TeamCardRow): SupportStatus {
  if (!row.supportLog) return "missing";
  return "completed";
}

function getTestingStatus(row: TeamCardRow): TestingStatus {
  const tLogs = row.testingLogs || [];
  if (tLogs.length === 0) return "completed";
  const allCompleted = tLogs.every((log) => log.status === "completed");
  if (allCompleted) return "completed";
  return "in_progress";
}

function getLastUpdatedTime(row: TeamCardRow): number {
  const sTime = row.supportLog?.updated_at ? new Date(row.supportLog.updated_at).getTime() : 0;
  const tLogs = row.testingLogs || [];
  const tTime =
    tLogs.length > 0
      ? Math.max(...tLogs.map((l) => (l.updated_at ? new Date(l.updated_at).getTime() : 0)))
      : 0;
  return Math.max(sTime, tTime);
}

function formatTimeOnly(iso: string | null): string {
  if (!iso) return "N/A";
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

// Action Dropdown Menu for single card & bulk actions
function ActionDropdown({
  onAction,
  isBulk = false,
}: {
  onAction: (action: string) => void;
  isBulk?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {isBulk ? (
        <Button
          variant="default"
          size="sm"
          data-testid="bulk-action-trigger"
          className="h-9 rounded-xl shadow-md text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground transition-all cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          Bulk Actions <ChevronRight className="ml-1 h-3.5 w-3.5 rotate-90" />
        </Button>
      ) : (
        <Button
          variant="outline"
          size="icon"
          data-testid="action-dropdown-btn"
          className="h-9 w-9 rounded-xl border-border/80 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          <MoreVertical className="h-4 w-4 text-muted-foreground" />
        </Button>
      )}

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border/40 rounded-xl shadow-xl z-50 flex flex-col p-1 animate-in fade-in zoom-in-95 duration-100">
          {isBulk ? (
            <>
              <div className="px-2 py-1.5 text-[9px] font-black uppercase tracking-wider text-muted-foreground">
                Mark Attendance
              </div>
              <button
                data-testid="bulk-mark-present"
                onClick={() => {
                  setOpen(false);
                  onAction("present");
                }}
                className="w-full text-left px-2.5 py-1.5 text-xs font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Present
              </button>
              <button
                data-testid="bulk-mark-wfh"
                onClick={() => {
                  setOpen(false);
                  onAction("wfh");
                }}
                className="w-full text-left px-2.5 py-1.5 text-xs font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
              >
                <Home className="h-3.5 w-3.5 text-blue-500" /> Work from Home
              </button>
              <button
                data-testid="bulk-mark-leave"
                onClick={() => {
                  setOpen(false);
                  onAction("leave");
                }}
                className="w-full text-left px-2.5 py-1.5 text-xs font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
              >
                <CalendarOff className="h-3.5 w-3.5 text-amber-500" /> On Leave
              </button>
              <div className="h-px bg-border/50 my-1"></div>
              <button
                data-testid="bulk-copy-yesterday"
                onClick={() => {
                  setOpen(false);
                  onAction("copy");
                }}
                className="w-full flex items-center px-2.5 py-1.5 text-xs font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Copy className="mr-2 h-3.5 w-3.5 text-muted-foreground" /> Copy Yesterday
              </button>
              <button
                data-testid="bulk-export"
                onClick={() => {
                  setOpen(false);
                  onAction("export");
                }}
                className="w-full flex items-center px-2.5 py-1.5 text-xs font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Download className="mr-2 h-3.5 w-3.5 text-muted-foreground" /> Export Selected
              </button>
              <div className="h-px bg-border/50 my-1"></div>
              <button
                data-testid="bulk-clear"
                onClick={() => {
                  setOpen(false);
                  onAction("clear");
                }}
                className="w-full flex items-center px-2.5 py-1.5 text-xs font-bold text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" /> Clear Selection
              </button>
            </>
          ) : (
            <>
              <button
                data-testid="action-view-details"
                onClick={() => {
                  setOpen(false);
                  onAction("view");
                }}
                className="w-full flex items-center px-2.5 py-1.5 text-xs font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <FileText className="mr-2 h-3.5 w-3.5 text-muted-foreground" /> View Details
              </button>
              <button
                data-testid="action-copy-yesterday"
                onClick={() => {
                  setOpen(false);
                  onAction("copy");
                }}
                className="w-full flex items-center px-2.5 py-1.5 text-xs font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Copy className="mr-2 h-3.5 w-3.5 text-muted-foreground" /> Copy Yesterday
              </button>
              <div className="h-px bg-border/50 my-1"></div>
              <button
                data-testid="action-delete-log"
                onClick={() => {
                  setOpen(false);
                  onAction("delete");
                }}
                className="w-full flex items-center px-2.5 py-1.5 text-xs font-bold text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete Log
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function DailyOperationsClient({ rows, initialDate, isManager, monthlyRows = [] }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [modalEmployee, setModalEmployee] = useState<TeamCardRow | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [optimisticRows, setOptimisticRows] = useState(rows);

  // Filters & Sorting States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("pending-first");
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());

  // Calendar States
  const [currentView, setCurrentView] = useState<"list" | "calendar">("list");
  const [calendarMonth, setCalendarMonth] = useState<string>(() => initialDate.slice(0, 7));
  const [calendarEmployeeId, setCalendarEmployeeId] = useState<string>(() => {
    if (isManager) return "all";
    return rows[0]?.employee_id ?? "";
  });

  useEffect(() => {
    setOptimisticRows(rows);
    setSelectedEmployees(new Set());
  }, [rows]);

  function handleDateChange(newDate: string) {
    setSelectedDate(newDate);
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", newDate);
    router.push(`/operations?${params.toString()}`);
  }

  function handlePrevDay() {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    handleDateChange(d.toISOString().slice(0, 10));
  }

  function handleNextDay() {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    handleDateChange(d.toISOString().slice(0, 10));
  }

  function handleToday() {
    const d = new Date();
    handleDateChange(d.toISOString().slice(0, 10));
  }

  function handleMonthChange(newMonth: string) {
    setCalendarMonth(newMonth);
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", `${newMonth}-01`);
    router.push(`/operations?${params.toString()}`);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function openModal(row: TeamCardRow, clearForm: boolean = false) {
    if (clearForm) {
      setModalEmployee({ ...row, supportLog: null, testingLogs: [] });
    } else {
      setModalEmployee(row);
    }
  }

  function handleSaved() {
    setModalEmployee(null);
    showToast("Daily operations saved successfully.");
    router.refresh();
  }

  function handleNextEmployee() {
    if (!modalEmployee) return;
    showToast("Daily operations saved successfully.");
    router.refresh();
    const currentIndex = filteredAndSortedRows.findIndex(
      (r) => r.employee_id === modalEmployee.employee_id
    );
    if (currentIndex >= 0 && currentIndex < filteredAndSortedRows.length - 1) {
      setModalEmployee(filteredAndSortedRows[currentIndex + 1]);
    } else {
      setModalEmployee(null);
    }
  }

  // --- Calculations for Summary & KPIs ---
  const todayStr = new Date().toISOString().slice(0, 10);
  const isToday = selectedDate === todayStr;

  let present = 0,
    wfh = 0,
    leave = 0,
    holiday = 0;
  let completedLogs = 0,
    pendingLogs = 0;
  let tickets = 0,
    chats = 0,
    testingEntries = 0,
    bugs = 0;

  optimisticRows.forEach((row) => {
    const s = getSupportStatus(row);
    const t = getTestingStatus(row);
    const isCompleted = s === "completed" && t === "completed";

    if (isCompleted) completedLogs++;
    else pendingLogs++;

    if (row.supportLog) {
      if (row.supportLog.attendance_status === "present") present++;
      if (row.supportLog.attendance_status === "wfh") wfh++;
      if (row.supportLog.attendance_status === "leave") leave++;
      if ((row.supportLog.attendance_status as any) === "holiday") holiday++;
      tickets += row.supportLog.tickets_handled ?? 0;
      chats += row.supportLog.chats_handled ?? 0;
    }

    const tLogs = row.testingLogs || [];
    testingEntries += tLogs.length;
    bugs += tLogs.reduce((sum, log) => sum + (log?.bugs_found ?? 0), 0);
  });

  const totalEmployees = optimisticRows.length;
  const progressPercent =
    totalEmployees === 0 ? 0 : Math.round((completedLogs / totalEmployees) * 100);

  // --- Filtering & Sorting ---
  const filteredAndSortedRows = useMemo(() => {
    let result = [...optimisticRows];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) => r.full_name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
      );
    }
    if (filterRole !== "all") {
      result = result.filter((r) => r.role === filterRole);
    }
    if (filterStatus !== "all") {
      result = result.filter((r) => {
        const s = getSupportStatus(r);
        const t = getTestingStatus(r);
        const isCompleted = s === "completed" && t === "completed";
        const rTLogs = r.testingLogs || [];
        const hasLog = s === "completed" || rTLogs.length > 0;
        if (filterStatus === "completed") return isCompleted;
        if (filterStatus === "pending") return !hasLog;
        if (filterStatus === "in_progress") return hasLog && !isCompleted;
        return true;
      });
    }

    result.sort((a, b) => {
      const aComp = getSupportStatus(a) === "completed" && getTestingStatus(a) === "completed";
      const bComp = getSupportStatus(b) === "completed" && getTestingStatus(b) === "completed";
      const aUpd = getLastUpdatedTime(a);
      const bUpd = getLastUpdatedTime(b);

      if (sortBy === "name") return a.full_name.localeCompare(b.full_name);
      if (sortBy === "last-updated") return bUpd - aUpd;
      if (sortBy === "pending-first") {
        if (aComp !== bComp) return aComp ? 1 : -1;
        return a.full_name.localeCompare(b.full_name);
      }
      if (sortBy === "completed-first") {
        if (aComp !== bComp) return aComp ? -1 : 1;
        return a.full_name.localeCompare(b.full_name);
      }
      return 0;
    });

    return result;
  }, [optimisticRows, searchQuery, filterRole, filterStatus, sortBy]);

  // --- Bulk Actions ---
  const toggleSelectAll = () => {
    if (selectedEmployees.size === filteredAndSortedRows.length) {
      setSelectedEmployees(new Set());
    } else {
      setSelectedEmployees(new Set(filteredAndSortedRows.map((r) => r.employee_id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedEmployees);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedEmployees(next);
  };

  const handleBulkAction = (action: string) => {
    if (action === "clear") {
      setSelectedEmployees(new Set());
      return;
    }
    showToast(`Action '${action}' performed on ${selectedEmployees.size} employees.`);
    setSelectedEmployees(new Set());
  };

  const handleRowAction = (action: string, row: TeamCardRow) => {
    if (action === "view") openModal(row);
    if (action === "delete") openModal(row, true);
    if (action === "copy") showToast(`Copied yesterday's log for ${row.full_name}`);
  };

  // --- Render Metric Card Component ---
  const MetricCard = ({
    label,
    value,
    icon: Icon,
    colorClass,
    testId,
  }: {
    label: string;
    value: number;
    icon: any;
    colorClass: string;
    testId: string;
  }) => (
    <div
      data-testid={testId}
      className="flex items-center gap-3 p-3 rounded-2xl border border-border/50 bg-card hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all duration-300"
    >
      <div className={cn("p-2.5 rounded-xl shadow-inner flex items-center justify-center", colorClass)}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xl font-extrabold tracking-tight leading-none text-foreground">{value}</p>
        <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mt-1">
          {label}
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* View Switcher Bar */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div className="flex items-center bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl border border-border/40 shadow-sm max-w-xs">
          <button
            data-testid="workspace-view-btn"
            onClick={() => setCurrentView("list")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer",
              currentView === "list"
                ? "bg-card shadow-sm border border-border/20 text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Workspace Console
          </button>
          <button
            data-testid="calendar-view-btn"
            onClick={() => setCurrentView("calendar")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer",
              currentView === "calendar"
                ? "bg-card shadow-sm border border-border/20 text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Calendar className="h-3.5 w-3.5" />
            Calendar
          </button>
        </div>
      </div>

      {currentView === "list" ? (
        <>
          {/* Top 9 KPI Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 animate-slide-in">
            <MetricCard label="Present" value={presentEmployees} icon={UserCheck} colorClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" testId="metric-present" />
            <MetricCard label="WFH" value={wfhEmployees} icon={Building2} colorClass="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" testId="metric-wfh" />
            <MetricCard label="On Leave" value={leaveEmployees} icon={CalendarOff} colorClass="bg-rose-500/10 text-rose-600 dark:text-rose-400" testId="metric-leave" />
            <MetricCard label="Completed Logs" value={completedLogs} icon={CheckCircle2} colorClass="bg-teal-500/10 text-teal-600 dark:text-teal-400" testId="metric-completed-logs" />
            <MetricCard label="Pending Logs" value={pendingLogs} icon={Clock} colorClass="bg-amber-500/10 text-amber-600 dark:text-amber-400" testId="metric-pending-logs" />
            <MetricCard label="Tickets" value={tickets} icon={Ticket} colorClass="bg-blue-500/10 text-blue-600 dark:text-blue-400" testId="metric-tickets" />
            <MetricCard label="Chats" value={chats} icon={MessageSquare} colorClass="bg-purple-500/10 text-purple-600 dark:text-purple-400" testId="metric-chats" />
            <MetricCard label="Testing" value={testingEntries} icon={Activity} colorClass="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" testId="metric-testing" />
            <MetricCard label="Bugs" value={bugs} icon={Bug} colorClass="bg-rose-500/10 text-rose-600 dark:text-rose-400" testId="metric-bugs" />
          </div>

          {/* Daily Progress Card & Log Date Section */}
          <div className="grid lg:grid-cols-[1fr_auto] gap-4 items-stretch animate-slide-in">
            <Card className="rounded-2xl border-border/60 shadow-sm overflow-hidden bg-card transition-all hover:shadow-md">
              <CardContent className="p-5 flex flex-col justify-center h-full">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-extrabold tracking-tight text-foreground flex items-center gap-2">
                    Today's Progress
                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      {progressPercent}% Complete
                    </span>
                  </h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Total: {totalEmployees} Employees
                  </p>
                </div>
                <div
                  data-testid="daily-progress-bar"
                  className="h-8 w-full bg-slate-100 dark:bg-slate-800/80 rounded-xl overflow-hidden flex relative shadow-inner border border-border/40"
                >
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-1000 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                  <div
                    data-testid="progress-text"
                    className="absolute inset-0 flex items-center justify-center text-[10px] font-black tracking-widest text-slate-900 dark:text-slate-100 mix-blend-overlay drop-shadow-sm uppercase"
                  >
                    {completedLogs} OF {totalEmployees} EMPLOYEES COMPLETED
                  </div>
                </div>
                <div className="flex justify-between mt-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Completed: {completedLogs}
                  </span>
                  <span className="text-amber-600 dark:text-amber-400">
                    Remaining: {pendingLogs}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/60 shadow-sm bg-card transition-all hover:shadow-md h-full">
              <CardContent className="p-5 h-full flex flex-col justify-center">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-extrabold tracking-tight text-foreground">Log Date</h3>
                  {isToday && (
                    <Badge
                      data-testid="today-badge"
                      className="bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-400 text-[10px] uppercase tracking-wider font-bold"
                    >
                      Today
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    data-testid="prev-day-btn"
                    onClick={handlePrevDay}
                    className="rounded-xl h-10 w-10 border-border/80 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Input
                    type="date"
                    data-testid="date-picker-input"
                    value={selectedDate}
                    max={todayStr}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="h-10 w-[140px] text-xs font-bold rounded-xl border-border/80 bg-background/50 focus:bg-background transition-colors"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    data-testid="next-day-btn"
                    onClick={handleNextDay}
                    className="rounded-xl h-10 w-10 border-border/80 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    disabled={selectedDate >= todayStr}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    data-testid="today-btn"
                    onClick={handleToday}
                    className="rounded-xl h-10 px-4 text-xs font-bold hidden sm:flex cursor-pointer"
                  >
                    Today
                  </Button>
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-3">
                  <span>Pending: {pendingLogs}</span>
                  <span>Completed: {completedLogs}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sticky Summary Bar & Filter Toolbar */}
          <div
            data-testid="sticky-summary-bar"
            className="sticky top-0 z-20 bg-background/85 backdrop-blur-xl border-y border-border/60 py-3 shadow-sm flex flex-col gap-3 transition-all animate-slide-in [animation-delay:200ms]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 px-1">
              <div className="flex items-center gap-3 w-full lg:w-auto flex-1">
                <div className="relative w-full max-w-xs">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    data-testid="search-employee-input"
                    placeholder="Search employee..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-xs rounded-xl bg-card border-border/60 focus:bg-background font-medium"
                  />
                </div>
                <div className="flex items-center bg-card rounded-xl border border-border/60 h-9 p-0.5 overflow-hidden shadow-sm hidden md:flex">
                  <select
                    data-testid="filter-status-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-transparent text-xs font-bold px-3 py-1 outline-none cursor-pointer text-muted-foreground border-r border-border/60 hover:text-foreground transition-colors"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="in_progress">In Progress</option>
                  </select>
                  <select
                    data-testid="filter-role-select"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="bg-transparent text-xs font-bold px-3 py-1 outline-none cursor-pointer text-muted-foreground border-r border-border/60 hover:text-foreground transition-colors"
                  >
                    <option value="all">All Roles</option>
                    <option value="support_engineer">Support Engineers</option>
                    <option value="qa_engineer">QA Engineers</option>
                  </select>
                  <select
                    data-testid="sort-by-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent text-xs font-bold px-3 py-1 outline-none cursor-pointer text-foreground hover:text-primary transition-colors"
                  >
                    <option value="pending-first">Sort: Pending First</option>
                    <option value="completed-first">Sort: Completed First</option>
                    <option value="name">Sort: Name (A-Z)</option>
                    <option value="last-updated">Sort: Last Updated</option>
                  </select>
                </div>
              </div>

              {selectedEmployees.size > 0 && (
                <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary mr-2 bg-primary/10 px-2 py-0.5 rounded-md">
                    {selectedEmployees.size} selected
                  </span>
                  <ActionDropdown isBulk onAction={handleBulkAction} />
                </div>
              )}
            </div>

            {/* Compact Sticky Context Summary */}
            <div className="flex flex-wrap items-center gap-4 px-3 py-1.5 bg-slate-50/80 dark:bg-slate-900/80 rounded-xl text-[10px] font-bold uppercase tracking-wider text-muted-foreground border border-border/40">
              <span className="flex items-center gap-1.5 border-r border-border/50 pr-4">
                <Calendar className="h-3 w-3" /> <span className="text-foreground">{selectedDate}</span>
              </span>
              <span>
                <span className="text-emerald-600 text-xs font-black mr-1">{completedLogs}</span> Completed
              </span>
              <span>
                <span className="text-amber-600 text-xs font-black mr-1">{pendingLogs}</span> Pending
              </span>
              <span>
                <span className="text-indigo-600 text-xs font-black mr-1">{tickets}</span> Tickets
              </span>
              <span>
                <span className="text-pink-600 text-xs font-black mr-1">{chats}</span> Chats
              </span>
              <span>
                <span className="text-cyan-600 text-xs font-black mr-1">{testingEntries}</span> Testing
              </span>
            </div>
          </div>

          {/* Employee Cards Grid */}
          {filteredAndSortedRows.length === 0 ? (
            <div
              data-testid="empty-state"
              className="flex flex-col items-center justify-center py-20 text-center animate-fade-in bg-card/40 rounded-2xl border border-dashed border-border/60 my-4"
            >
              <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4 shadow-inner border border-border/40">
                <Search className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-extrabold text-foreground tracking-tight">
                No logs found for this date
              </h3>
              <p className="text-sm font-medium text-muted-foreground mt-1 max-w-md">
                We couldn't find any team members matching your search or filters for this date.
              </p>
              <Button
                variant="outline"
                data-testid="clear-filters-btn"
                className="mt-6 rounded-xl font-bold border-border/80 shadow-sm cursor-pointer"
                onClick={() => {
                  setSearchQuery("");
                  setFilterRole("all");
                  setFilterStatus("all");
                }}
              >
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 flex-col pt-2 pb-10">
              <div className="flex items-center px-4 mb-1">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    data-testid="select-all-checkbox"
                    checked={
                      selectedEmployees.size > 0 &&
                      selectedEmployees.size === filteredAndSortedRows.length
                    }
                    onChange={toggleSelectAll}
                    className="rounded-[4px] h-4 w-4 border-slate-300 dark:border-slate-700 accent-primary cursor-pointer"
                  />
                  <span
                    className="text-[10px] font-black text-muted-foreground uppercase tracking-widest cursor-pointer"
                    onClick={toggleSelectAll}
                  >
                    Select All ({filteredAndSortedRows.length})
                  </span>
                </div>
              </div>

              {filteredAndSortedRows.map((row, index) => {
                const sStatus = getSupportStatus(row);
                const tStatus = getTestingStatus(row);
                const isComplete = sStatus === "completed" && tStatus === "completed";
                const hasLog = row.supportLog !== null || row.testingLogs.length > 0;

                let overallBadge = {
                  text: "Not Started",
                  color:
                    "bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50",
                  dot: "🔴",
                  testId: "status-badge-not-started",
                };
                if (isComplete) {
                  overallBadge = {
                    text: "Completed",
                    color:
                      "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50",
                    dot: "🟢",
                    testId: "status-badge-completed",
                  };
                } else if (hasLog) {
                  overallBadge = {
                    text: "In Progress",
                    color:
                      "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50",
                    dot: "🟡",
                    testId: "status-badge-in-progress",
                  };
                }

                const tickets = row.supportLog?.tickets_handled ?? 0;
                const chats = row.supportLog?.chats_handled ?? 0;
                const testing = row.testingLogs.length;
                const bugs = row.testingLogs.reduce((sum, l) => sum + (l.bugs_found ?? 0), 0);
                const isLeave =
                  row.supportLog?.attendance_status === "leave" ||
                  (row.supportLog?.attendance_status as any) === "holiday";

                const cardDelay = `${(index % 10) * 40}ms`;

                return (
                  <Card
                    key={row.employee_id}
                    data-testid={`employee-card-${row.employee_id}`}
                    className={cn(
                      "rounded-2xl border transition-all duration-300 hover:shadow-md animate-slide-in group overflow-hidden relative",
                      selectedEmployees.has(row.employee_id)
                        ? "border-primary/50 shadow-sm bg-primary/5 ring-1 ring-primary/20"
                        : isComplete
                        ? "border-border/40 bg-slate-50/30 dark:bg-slate-900/10"
                        : "border-border/80 bg-card shadow-sm hover:border-slate-300 dark:hover:border-slate-700"
                    )}
                    style={{ animationDelay: cardDelay }}
                  >
                    <div className="flex flex-col md:flex-row p-4 gap-4 items-start md:items-center">
                      {/* Left: Checkbox & Identity */}
                      <div className="flex items-center gap-4 min-w-[250px]">
                        <input
                          type="checkbox"
                          data-testid={`checkbox-${row.employee_id}`}
                          checked={selectedEmployees.has(row.employee_id)}
                          onChange={() => toggleSelect(row.employee_id)}
                          className="rounded-[4px] h-4 w-4 border-slate-300 dark:border-slate-700 accent-primary cursor-pointer"
                        />
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-sm font-black shadow-inner overflow-hidden border border-border/50">
                            {row.avatar_url ? (
                              <img src={row.avatar_url} alt="" className="h-full w-full object-cover" />
                            ) : (
                              row.full_name.charAt(0)
                            )}
                          </div>
                          <div>
                            <p className="font-extrabold text-foreground text-sm tracking-tight leading-tight">
                              {row.full_name}
                            </p>
                            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">
                              {roleLabels[row.role]}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Middle: Status Badge & Quick Micro-Stats */}
                      <div className="flex-1 flex flex-wrap md:flex-nowrap items-center gap-4 md:gap-6 w-full md:w-auto border-y md:border-y-0 border-border/40 py-3 md:py-0">
                        <Badge
                          variant="outline"
                          data-testid={overallBadge.testId}
                          className={cn(
                            "rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border shadow-sm flex items-center gap-1.5",
                            overallBadge.color
                          )}
                        >
                          <span className="text-[8px]">{overallBadge.dot}</span> {overallBadge.text}
                        </Badge>

                        {isLeave ? (
                          <div className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 rounded-lg border border-blue-200/50 dark:border-blue-900/50 shadow-sm flex items-center gap-1.5">
                            <CalendarOff className="h-3 w-3" /> On Leave Today
                          </div>
                        ) : (
                          <div className="flex gap-4 sm:gap-6 text-center divide-x divide-border/50">
                            <div className="flex flex-col pl-0" data-testid="quick-stat-tickets">
                              <span className="text-lg font-black text-foreground leading-none">
                                {tickets}
                              </span>
                              <span className="text-[8px] uppercase font-black tracking-widest text-muted-foreground mt-1">
                                Tickets
                              </span>
                            </div>
                            <div className="flex flex-col pl-4 sm:pl-6" data-testid="quick-stat-chats">
                              <span className="text-lg font-black text-foreground leading-none">
                                {chats}
                              </span>
                              <span className="text-[8px] uppercase font-black tracking-widest text-muted-foreground mt-1">
                                Chats
                              </span>
                            </div>
                            <div className="flex flex-col pl-4 sm:pl-6" data-testid="quick-stat-testing">
                              <span className="text-lg font-black text-foreground leading-none">
                                {testing}
                              </span>
                              <span className="text-[8px] uppercase font-black tracking-widest text-muted-foreground mt-1">
                                Testing
                              </span>
                            </div>
                            <div className="flex flex-col pl-4 sm:pl-6" data-testid="quick-stat-bugs">
                              <span className="text-lg font-black text-rose-600 dark:text-rose-400 leading-none">
                                {bugs}
                              </span>
                              <span className="text-[8px] uppercase font-black tracking-widest text-muted-foreground mt-1">
                                Bugs
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Completion Timeline & Action Buttons */}
                      <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                        <div className="text-right hidden sm:block min-w-[90px]">
                          {isComplete ? (
                            <>
                              <p className="text-[9px] uppercase font-black tracking-widest text-muted-foreground">
                                Completed at
                              </p>
                              <p className="text-xs font-bold text-foreground mt-0.5">
                                {formatTimeOnly(row.supportLog?.updated_at || null)}
                              </p>
                            </>
                          ) : hasLog ? (
                            <>
                              <p className="text-[9px] uppercase font-black tracking-widest text-muted-foreground">
                                Updated at
                              </p>
                              <p className="text-xs font-bold text-foreground mt-0.5">
                                {formatTimeOnly(
                                  row.supportLog?.updated_at || row.testingLogs[0]?.updated_at
                                )}
                              </p>
                            </>
                          ) : (
                            <p className="text-[9px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-500 mt-1">
                              No Activity
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant={hasLog ? "secondary" : "default"}
                            size="sm"
                            data-testid="continue-log-btn"
                            className={cn(
                              "rounded-xl text-xs font-bold shadow-sm transition-all h-9 px-4 hover:scale-[1.02] active:scale-[0.98] cursor-pointer",
                              hasLog ? "bg-slate-100 dark:bg-slate-800/80 border border-border/50" : ""
                            )}
                            onClick={() => openModal(row)}
                          >
                            {hasLog ? "Edit Log" : "Add Log"}
                          </Button>
                          <ActionDropdown onAction={(action) => handleRowAction(action, row)} />
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* Calendar View Panel */
        <div className="space-y-6 animate-fade-in pb-10">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border/60 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <button
                data-testid="calendar-prev-month"
                onClick={() => {
                  const d = new Date(
                    Number(calendarMonth.split("-")[0]),
                    Number(calendarMonth.split("-")[1]) - 2,
                    1
                  );
                  handleMonthChange(d.toISOString().slice(0, 7));
                }}
                className="rounded-xl p-2 border border-border/80 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-lg font-extrabold tracking-tight text-foreground px-2">
                {new Date(
                  Number(calendarMonth.split("-")[0]),
                  Number(calendarMonth.split("-")[1]) - 1,
                  1
                ).toLocaleDateString("en", { month: "long", year: "numeric" })}
              </span>
              <button
                data-testid="calendar-next-month"
                onClick={() => {
                  const d = new Date(
                    Number(calendarMonth.split("-")[0]),
                    Number(calendarMonth.split("-")[1]),
                    1
                  );
                  handleMonthChange(d.toISOString().slice(0, 7));
                }}
                className="rounded-xl p-2 border border-border/80 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            {isManager && (
              <div className="flex items-center gap-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  View For
                </Label>
                <select
                  value={calendarEmployeeId}
                  onChange={(e) => setCalendarEmployeeId(e.target.value)}
                  className="rounded-xl border border-border/80 bg-background px-4 py-2 text-xs font-bold shadow-sm outline-none cursor-pointer focus:border-primary transition-colors"
                >
                  <option value="all">All Team Members</option>
                  {rows.map((r) => (
                    <option key={r.employee_id} value={r.employee_id}>
                      {r.full_name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <Card className="rounded-2xl border border-border/60 shadow-sm bg-card overflow-hidden">
            <CardContent className="p-6">
              <div className="grid grid-cols-7 gap-3 mb-3 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/40 pb-4">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>
              <div className="grid grid-cols-7 gap-3">
                {Array.from({
                  length: new Date(
                    Number(calendarMonth.split("-")[0]),
                    Number(calendarMonth.split("-")[1]) - 1,
                    1
                  ).getDay(),
                }).map((_, i) => (
                  <div
                    key={`blank-${i}`}
                    className="bg-slate-50/40 dark:bg-slate-900/20 rounded-2xl border border-dashed border-border/40 min-h-[110px] opacity-40"
                  />
                ))}
                {Array.from({
                  length: new Date(
                    Number(calendarMonth.split("-")[0]),
                    Number(calendarMonth.split("-")[1]),
                    0
                  ).getDate(),
                }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${calendarMonth}-${day < 10 ? `0${day}` : day}`;
                  const isAll = calendarEmployeeId === "all";

                  let cellClass =
                    "border-border/60 bg-card hover:border-slate-300 dark:hover:border-slate-600";
                  let dotColor = "bg-slate-300 dark:bg-slate-700";
                  let badgeText = "0 / 0";

                  if (isAll) {
                    let cCount = 0;
                    const mRows = monthlyRows || [];
                    let tCount = mRows.length;
                    for (const empRow of mRows) {
                      const sLog = (empRow?.supportLogs || []).find((l) => String(l.log_date).split("T")[0] === dateStr);
                      const tLogs = (empRow?.testingLogs || []).filter((l) => String(l.log_date).split("T")[0] === dateStr);
                      const hasSupportLog = Boolean(sLog);
                      const hasTestingLog = tLogs.length > 0;
                      if (hasSupportLog || hasTestingLog) cCount++;
                    }
                    badgeText = `${cCount} / ${tCount}`;
                    if (tCount > 0 && cCount === tCount) {
                      cellClass =
                        "border-emerald-200/80 bg-emerald-50/30 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300";
                      dotColor = "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]";
                    } else if (cCount > 0) {
                      cellClass =
                        "border-amber-200/80 bg-amber-50/30 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300";
                      dotColor = "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]";
                    } else {
                      cellClass =
                        "border-rose-200/50 bg-rose-50/20 text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/10 dark:text-rose-300";
                      dotColor = "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]";
                    }
                  } else {
                    const empRow = (monthlyRows || []).find((r) => r.employee_id === calendarEmployeeId);
                    const sLog = (empRow?.supportLogs || []).find((l) => String(l.log_date).split("T")[0] === dateStr);
                    const tLogs = (empRow?.testingLogs || []).filter((l) => String(l.log_date).split("T")[0] === dateStr);
                    const isLeave =
                      sLog?.attendance_status === "leave" ||
                      (sLog?.attendance_status as any) === "holiday";
                    if (isLeave) {
                      cellClass =
                        "border-blue-200/80 bg-blue-50/30 text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-300";
                      dotColor = "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]";
                      badgeText = "LEAVE";
                    } else if (sLog || tLogs.length > 0) {
                      cellClass =
                        "border-emerald-200/80 bg-emerald-50/30 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300";
                      dotColor = "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]";
                      badgeText = "LOGGED";
                    } else {
                      cellClass =
                        "border-rose-200/50 bg-rose-50/20 text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/10 dark:text-rose-300";
                      dotColor = "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]";
                      badgeText = "MISSING";
                    }
                  }

                  return (
                    <div
                      key={day}
                      data-testid={`calendar-day-${dateStr}`}
                      onClick={() => {
                        setSelectedDate(dateStr);
                        setCurrentView("list");
                      }}
                      className={cn(
                        "relative p-3 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-1 hover:shadow-md min-h-[110px] group animate-slide-in",
                        cellClass
                      )}
                      style={{ animationDelay: `${(day % 7) * 40}ms` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={cn(
                            "h-3 w-3 rounded-full border border-white/20 dark:border-black/20",
                            dotColor
                          )}
                        />
                        <span className="text-xs font-black text-slate-400 group-hover:text-foreground transition-colors">
                          {day}
                        </span>
                      </div>
                      <div className="text-center pb-1">
                        <span className="text-[10px] font-black tracking-widest uppercase bg-background/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-border/40 shadow-sm">
                          {badgeText}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {toast && (
        <div
          data-testid="toast-notification"
          className="fixed bottom-6 right-6 z-50 rounded-xl border border-emerald-200/80 bg-emerald-50/90 backdrop-blur-md px-5 py-3.5 text-sm font-bold text-emerald-900 shadow-xl dark:border-emerald-900/80 dark:bg-emerald-950/90 dark:text-emerald-200 animate-in slide-in-from-bottom-5"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> {toast}
          </div>
        </div>
      )}

      {modalEmployee && (
        <DailyOperationsModal
          open={true}
          onClose={() => setModalEmployee(null)}
          onSaved={handleSaved}
          onNextEmployee={isManager ? handleNextEmployee : undefined}
          employeeId={modalEmployee.employee_id}
          employeeName={modalEmployee.full_name}
          employeeRole={modalEmployee.role}
          initialDate={selectedDate}
          initialSupportLog={modalEmployee.supportLog}
          initialTestingLogs={modalEmployee.testingLogs}
        />
      )}
    </div>
  );
}
