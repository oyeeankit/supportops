"use client";

import * as React from "react";
import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, LogIn, ChevronLeft, ChevronRight, Calendar, Search, ArrowUpDown, MoreVertical, Copy, FileText, Settings2, Trash2, Home, CalendarOff, Ticket, MessageSquare, Activity, ShieldAlert, CircleDashed, CheckSquare } from "lucide-react";
import { roleLabels } from "@/lib/auth/roles";
import type { AppRole } from "@/lib/auth/roles";
import type { DailySupportLog, DailyTestingLog, AttendanceStatus } from "../types";
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

type SupportStatus = "completed" | "partial" | "missing";
type TestingStatus = "completed" | "in_progress" | "missing";

function getSupportStatus(row: TeamCardRow): SupportStatus {
  if (!row.supportLog) return "missing";
  if (row.supportLog.attendance_status === "leave" || (row.supportLog.attendance_status as any) === "holiday") return "completed";
  const hasWork = row.supportLog.tickets_handled > 0 || row.supportLog.chats_handled > 0;
  const hasNotes = row.supportLog.testing_notes != null && row.supportLog.testing_notes.trim() !== "";
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

function getLastUpdatedTime(row: TeamCardRow): number {
  const sTime = row.supportLog?.updated_at ? new Date(row.supportLog.updated_at).getTime() : 0;
  const tTime = row.testingLogs.length > 0
    ? Math.max(...row.testingLogs.map(l => new Date(l.updated_at).getTime()))
    : 0;
  return Math.max(sTime, tTime);
}

function formatTimeOnly(iso: string | null): string {
  if (!iso) return "N/A";
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

// Simple Custom Dropdown Component
function ActionDropdown({ onAction, isBulk = false }: { onAction: (action: string) => void, isBulk?: boolean }) {
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
        <Button variant="default" size="sm" className="h-9 rounded-xl shadow-md text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground transition-all" onClick={() => setOpen(!open)}>
          Bulk Actions <ChevronRight className="ml-1 h-3 w-3 rotate-90"/>
        </Button>
      ) : (
        <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-border/80 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => setOpen(!open)}>
          <MoreVertical className="h-4 w-4 text-muted-foreground"/>
        </Button>
      )}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border/40 rounded-xl shadow-xl z-50 flex flex-col p-1 animate-in fade-in zoom-in-95 duration-100">
          {isBulk ? (
            <>
              <div className="px-2 py-1.5 text-[9px] font-black uppercase tracking-wider text-muted-foreground">Mark Attendance</div>
              <button onClick={() => { setOpen(false); onAction("present"); }} className="w-full text-left px-2 py-1.5 text-xs font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">Present</button>
              <button onClick={() => { setOpen(false); onAction("wfh"); }} className="w-full text-left px-2 py-1.5 text-xs font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">Work from Home</button>
              <button onClick={() => { setOpen(false); onAction("leave"); }} className="w-full text-left px-2 py-1.5 text-xs font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">On Leave</button>
              <div className="h-px bg-border/50 my-1"></div>
              <button onClick={() => { setOpen(false); onAction("copy"); }} className="w-full flex items-center px-2 py-1.5 text-xs font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><Copy className="mr-2 h-3.5 w-3.5 text-muted-foreground"/> Copy Yesterday</button>
              <button onClick={() => { setOpen(false); onAction("export"); }} className="w-full flex items-center px-2 py-1.5 text-xs font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><FileText className="mr-2 h-3.5 w-3.5 text-muted-foreground"/> Export Selected</button>
              <div className="h-px bg-border/50 my-1"></div>
              <button onClick={() => { setOpen(false); onAction("clear"); }} className="w-full flex items-center px-2 py-1.5 text-xs font-bold text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50"><Trash2 className="mr-2 h-3.5 w-3.5"/> Clear Selection</button>
            </>
          ) : (
            <>
              <button onClick={() => { setOpen(false); onAction("view"); }} className="w-full flex items-center px-2 py-1.5 text-xs font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><FileText className="mr-2 h-3.5 w-3.5 text-muted-foreground"/> View Details</button>
              <button onClick={() => { setOpen(false); onAction("copy"); }} className="w-full flex items-center px-2 py-1.5 text-xs font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><Copy className="mr-2 h-3.5 w-3.5 text-muted-foreground"/> Copy Yesterday</button>
              <div className="h-px bg-border/50 my-1"></div>
              <button onClick={() => { setOpen(false); onAction("delete"); }} className="w-full flex items-center px-2 py-1.5 text-xs font-bold text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50"><Trash2 className="mr-2 h-3.5 w-3.5"/> Clear Log</button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export function DailyOperationsClient({ rows, initialDate, isManager, monthlyRows = [] }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [modalEmployee, setModalEmployee] = useState<TeamCardRow | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [optimisticRows, setOptimisticRows] = useState(rows);

  // New Filters & States
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
    const currentIndex = filteredAndSortedRows.findIndex((r) => r.employee_id === modalEmployee.employee_id);
    if (currentIndex >= 0 && currentIndex < filteredAndSortedRows.length - 1) {
      setModalEmployee(filteredAndSortedRows[currentIndex + 1]);
    } else {
      setModalEmployee(null);
    }
  }

  // --- Calculations for Summary ---
  const todayStr = new Date().toISOString().slice(0, 10);
  const isToday = selectedDate === todayStr;

  let present = 0, wfh = 0, leave = 0, holiday = 0;
  let completedLogs = 0, pendingLogs = 0;
  let tickets = 0, chats = 0, testingEntries = 0, bugs = 0;

  optimisticRows.forEach(row => {
    const s = getSupportStatus(row);
    const t = getTestingStatus(row);
    const isCompleted = s === "completed" && t === "completed";
    
    if (isCompleted) completedLogs++; else pendingLogs++;
    
    if (row.supportLog) {
      if (row.supportLog.attendance_status === "present") present++;
      if (row.supportLog.attendance_status === "wfh") wfh++;
      if (row.supportLog.attendance_status === "leave") leave++;
      if ((row.supportLog.attendance_status as any) === "holiday") holiday++;
      tickets += row.supportLog.tickets_handled ?? 0;
      chats += row.supportLog.chats_handled ?? 0;
    }
    
    testingEntries += row.testingLogs.length;
    bugs += row.testingLogs.reduce((sum, log) => sum + (log.bugs_found ?? 0), 0);
  });

  const totalEmployees = optimisticRows.length;
  const progressPercent = totalEmployees === 0 ? 0 : Math.round((completedLogs / totalEmployees) * 100);

  // --- Filtering & Sorting ---
  const filteredAndSortedRows = useMemo(() => {
    let result = [...optimisticRows];
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => r.full_name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q));
    }
    if (filterRole !== "all") {
      result = result.filter(r => r.role === filterRole);
    }
    if (filterStatus !== "all") {
      result = result.filter(r => {
        const s = getSupportStatus(r);
        const t = getTestingStatus(r);
        const isCompleted = s === "completed" && t === "completed";
        if (filterStatus === "completed") return isCompleted;
        if (filterStatus === "pending") return !isCompleted;
        if (filterStatus === "in_progress") return (s === "partial" || t === "in_progress");
        return true;
      });
    }
    
    result.sort((a, b) => {
      const aComp = (getSupportStatus(a) === "completed" && getTestingStatus(a) === "completed");
      const bComp = (getSupportStatus(b) === "completed" && getTestingStatus(b) === "completed");
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
      setSelectedEmployees(new Set(filteredAndSortedRows.map(r => r.employee_id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedEmployees);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedEmployees(next);
  };

  const handleBulkAction = (action: string) => {
    if (action === "clear") {
      setSelectedEmployees(new Set());
      return;
    }
    showToast(`Action '${action}' performed on ${selectedEmployees.size} employees. (Simulated)`);
    setSelectedEmployees(new Set());
  };

  const handleRowAction = (action: string, row: TeamCardRow) => {
    if (action === "view") openModal(row);
    if (action === "delete") openModal(row, true);
    if (action === "copy") showToast(`Copied yesterday's log for ${row.full_name}`);
  };

  // --- Render Helpers ---
  const MetricCard = ({ label, value, icon: Icon, colorClass }: { label: string, value: number, icon: any, colorClass: string }) => (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card/50 hover:bg-card hover:shadow-sm transition-all duration-300">
      <div className={cn("p-2 rounded-lg shadow-inner", colorClass)}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xl font-extrabold tracking-tight leading-none">{value}</p>
        <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mt-1">{label}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in relative">
      
      {/* View Switcher */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div className="flex items-center bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl border border-border/40 shadow-sm max-w-xs">
          <button
            onClick={() => setCurrentView("list")}
            className={cn("flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200", currentView === "list" ? "bg-card shadow-sm border border-border/20 text-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            Workspace
          </button>
          <button
            onClick={() => setCurrentView("calendar")}
            className={cn("flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200", currentView === "calendar" ? "bg-card shadow-sm border border-border/20 text-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            <Calendar className="h-3.5 w-3.5" />
            Calendar
          </button>
        </div>
      </div>

      {currentView === "list" ? (
        <>
          {/* Top Summary Cards (KPIs) */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 animate-slide-in">
             <MetricCard label="Present" value={present} icon={CheckCircle2} colorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" />
             <MetricCard label="WFH" value={wfh} icon={Home} colorClass="bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400" />
             <MetricCard label="Leave" value={leave} icon={CalendarOff} colorClass="bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400" />
             <MetricCard label="Holidays" value={holiday} icon={CalendarOff} colorClass="bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400" />
             <MetricCard label="Completed Logs" value={completedLogs} icon={CheckSquare} colorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" />
             <MetricCard label="Pending Logs" value={pendingLogs} icon={CircleDashed} colorClass="bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400" />
             <MetricCard label="Tickets Today" value={tickets} icon={Ticket} colorClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400" />
             <MetricCard label="Chats Today" value={chats} icon={MessageSquare} colorClass="bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400" />
             <MetricCard label="Testing Entries" value={testingEntries} icon={Activity} colorClass="bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400" />
             <MetricCard label="Bugs Found" value={bugs} icon={ShieldAlert} colorClass="bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400" />
          </div>

          {/* Daily Progress Card & Log Date Section */}
          <div className="grid lg:grid-cols-[1fr_auto] gap-4 items-stretch animate-slide-in [animation-delay:100ms]">
            <Card className="rounded-2xl border-border/60 shadow-sm overflow-hidden bg-card transition-all hover:shadow-md">
              <CardContent className="p-5 flex flex-col justify-center h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-extrabold tracking-tight text-foreground flex items-center gap-2">
                    Today's Progress 
                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 px-2 py-0.5 rounded-md uppercase tracking-wider">{progressPercent}% Complete</span>
                  </h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{totalEmployees} Employees</p>
                </div>
                <div className="h-8 w-full bg-slate-100 dark:bg-slate-800/80 rounded-xl overflow-hidden flex relative shadow-inner border border-border/40">
                  <div className="h-full bg-emerald-500 transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }} />
                  {/* Text overlay on progress bar */}
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black tracking-widest text-slate-900 dark:text-slate-100 mix-blend-overlay drop-shadow-sm uppercase">
                    {completedLogs} OF {totalEmployees} EMPLOYEES COMPLETED
                  </div>
                </div>
                <div className="flex justify-between mt-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <span>{completedLogs} Completed</span>
                  <span className="text-amber-600 dark:text-amber-400">{pendingLogs} Remaining</span>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/60 shadow-sm bg-card transition-all hover:shadow-md h-full">
              <CardContent className="p-5 h-full flex flex-col justify-center">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-extrabold tracking-tight text-foreground">Log Date</h3>
                  {isToday && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-400 text-[10px] uppercase tracking-wider font-bold">Today</Badge>}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={handlePrevDay} className="rounded-xl h-10 w-10 border-border/80 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"><ChevronLeft className="h-4 w-4"/></Button>
                  <Input type="date" value={selectedDate} max={todayStr} onChange={(e) => handleDateChange(e.target.value)} className="h-10 w-[140px] text-xs font-bold rounded-xl border-border/80 bg-background/50 focus:bg-background transition-colors" />
                  <Button variant="outline" size="icon" onClick={handleNextDay} className="rounded-xl h-10 w-10 border-border/80 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" disabled={selectedDate >= todayStr}><ChevronRight className="h-4 w-4"/></Button>
                  <Button variant="secondary" size="sm" onClick={handleToday} className="rounded-xl h-10 px-4 text-xs font-bold hidden sm:flex">Today</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sticky Summary & Toolbar */}
          <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-y border-border/60 py-3 shadow-sm flex flex-col gap-3 transition-all animate-slide-in [animation-delay:200ms]">
            <div className="flex flex-wrap items-center justify-between gap-3 px-1">
              <div className="flex items-center gap-3 w-full lg:w-auto flex-1">
                <div className="relative w-full max-w-xs">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search employee..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9 text-xs rounded-xl bg-card border-border/60 focus:bg-background font-medium" />
                </div>
                <div className="flex items-center bg-card rounded-xl border border-border/60 h-9 p-0.5 overflow-hidden shadow-sm hidden md:flex">
                   <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-transparent text-xs font-bold px-3 py-1 outline-none cursor-pointer text-muted-foreground border-r border-border/60 hover:text-foreground transition-colors">
                     <option value="all">All Status</option>
                     <option value="pending">Pending</option>
                     <option value="completed">Completed</option>
                     <option value="in_progress">In Progress</option>
                   </select>
                   <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="bg-transparent text-xs font-bold px-3 py-1 outline-none cursor-pointer text-muted-foreground border-r border-border/60 hover:text-foreground transition-colors">
                     <option value="all">All Roles</option>
                     <option value="support_engineer">Support Engineers</option>
                     <option value="qa_engineer">QA Engineers</option>
                   </select>
                   <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent text-xs font-bold px-3 py-1 outline-none cursor-pointer text-foreground hover:text-primary transition-colors">
                     <option value="pending-first">Sort: Pending First</option>
                     <option value="completed-first">Sort: Completed First</option>
                     <option value="name">Sort: Name (A-Z)</option>
                     <option value="last-updated">Sort: Last Updated</option>
                   </select>
                </div>
              </div>

              {selectedEmployees.size > 0 && (
                <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary mr-2 bg-primary/10 px-2 py-0.5 rounded-md">{selectedEmployees.size} selected</span>
                  <ActionDropdown isBulk onAction={handleBulkAction} />
                </div>
              )}
            </div>
            {/* Compact summary for sticky state */}
            <div className="flex flex-wrap items-center gap-4 px-3 py-1.5 bg-slate-50/80 dark:bg-slate-900/80 rounded-xl text-[10px] font-bold uppercase tracking-wider text-muted-foreground border border-border/40">
              <span className="flex items-center gap-1.5 border-r border-border/50 pr-4"><Calendar className="h-3 w-3"/> <span className="text-foreground">{selectedDate}</span></span>
              <span><span className="text-emerald-600 text-xs mr-1">{completedLogs}</span> Completed</span>
              <span><span className="text-amber-600 text-xs mr-1">{pendingLogs}</span> Pending</span>
              <span><span className="text-indigo-600 text-xs mr-1">{tickets}</span> Tickets</span>
              <span><span className="text-pink-600 text-xs mr-1">{chats}</span> Chats</span>
              <span><span className="text-blue-600 text-xs mr-1">{testingEntries}</span> Testing</span>
            </div>
          </div>

          {/* Employee Cards Grid */}
          {filteredAndSortedRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
              <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4 shadow-inner border border-border/40">
                <Search className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-extrabold text-foreground tracking-tight">No employees found</h3>
              <p className="text-sm font-medium text-muted-foreground mt-1 max-w-md">We couldn't find any team members matching your current filters for this date.</p>
              <Button variant="outline" className="mt-6 rounded-xl font-bold border-border/80 shadow-sm" onClick={() => { setSearchQuery(""); setFilterRole("all"); setFilterStatus("all"); }}>Clear All Filters</Button>
            </div>
          ) : (
            <div className="grid gap-3 flex-col pt-2 pb-10">
              <div className="flex items-center px-4 mb-1">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedEmployees.size > 0 && selectedEmployees.size === filteredAndSortedRows.length}
                    onChange={toggleSelectAll}
                    className="rounded-[4px] h-4 w-4 border-slate-300 dark:border-slate-700 accent-primary cursor-pointer"
                  />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest cursor-pointer" onClick={toggleSelectAll}>Select All ({filteredAndSortedRows.length})</span>
                </div>
              </div>
              
              {filteredAndSortedRows.map((row, index) => {
                const sStatus = getSupportStatus(row);
                const tStatus = getTestingStatus(row);
                const isComplete = sStatus === "completed" && tStatus === "completed";
                const hasLog = row.supportLog !== null || row.testingLogs.length > 0;
                
                let overallBadge = { text: "Not Started", color: "bg-slate-100 text-slate-700 border-slate-200/80 dark:bg-slate-900/80 dark:text-slate-400 dark:border-slate-800", dot: "🔴" };
                if (isComplete) overallBadge = { text: "Completed", color: "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50", dot: "🟢" };
                else if (hasLog) overallBadge = { text: "In Progress", color: "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50", dot: "🟡" };

                const tickets = row.supportLog?.tickets_handled ?? 0;
                const chats = row.supportLog?.chats_handled ?? 0;
                const testing = row.testingLogs.length;
                const bugs = row.testingLogs.reduce((sum, l) => sum + (l.bugs_found ?? 0), 0);
                const isLeave = row.supportLog?.attendance_status === "leave" || (row.supportLog?.attendance_status as any) === "holiday";
                
                const cardDelay = `${(index % 10) * 50}ms`;

                return (
                  <Card key={row.employee_id} className={cn(
                    "rounded-2xl border transition-all duration-300 hover:shadow-md animate-slide-in group overflow-hidden relative",
                    selectedEmployees.has(row.employee_id) ? "border-primary/50 shadow-sm bg-primary/5 ring-1 ring-primary/20" : (isComplete ? "border-border/40 bg-slate-50/30 dark:bg-slate-900/10" : "border-border/80 bg-card shadow-sm hover:border-slate-300 dark:hover:border-slate-700")
                  )} style={{ animationDelay: cardDelay }}>
                    <div className="flex flex-col md:flex-row p-4 gap-4 items-start md:items-center">
                      
                      {/* Left: Checkbox & Identity */}
                      <div className="flex items-center gap-4 min-w-[260px]">
                        <input
                          type="checkbox"
                          checked={selectedEmployees.has(row.employee_id)}
                          onChange={() => toggleSelect(row.employee_id)}
                          className="rounded-[4px] h-4 w-4 border-slate-300 dark:border-slate-700 accent-primary cursor-pointer"
                        />
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-sm font-black shadow-inner overflow-hidden border border-border/50">
                            {row.avatar_url ? <img src={row.avatar_url} alt="" className="h-full w-full object-cover" /> : row.full_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-extrabold text-foreground text-sm tracking-tight leading-tight">{row.full_name}</p>
                            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">{roleLabels[row.role]}</p>
                          </div>
                        </div>
                      </div>

                      {/* Middle: Quick Stats & Status */}
                      <div className="flex-1 flex flex-wrap md:flex-nowrap items-center gap-4 md:gap-8 w-full md:w-auto border-y md:border-y-0 border-border/40 py-3 md:py-0">
                        <Badge variant="outline" className={cn("rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border shadow-sm", overallBadge.color)}>
                          <span className="mr-1.5 text-[8px]">{overallBadge.dot}</span> {overallBadge.text}
                        </Badge>

                        {isLeave ? (
                          <div className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 rounded-lg border border-blue-200/50 dark:border-blue-900/50 shadow-sm flex items-center gap-1.5">
                            <CalendarOff className="h-3 w-3" /> On Leave Today
                          </div>
                        ) : (
                          <div className="flex gap-4 sm:gap-6 text-center divide-x divide-border/50">
                            <div className="flex flex-col pl-0"><span className="text-xl font-black text-foreground leading-none">{tickets}</span><span className="text-[8px] uppercase font-black tracking-widest text-muted-foreground mt-1.5">Tickets</span></div>
                            <div className="flex flex-col pl-4 sm:pl-6"><span className="text-xl font-black text-foreground leading-none">{chats}</span><span className="text-[8px] uppercase font-black tracking-widest text-muted-foreground mt-1.5">Chats</span></div>
                            <div className="flex flex-col pl-4 sm:pl-6"><span className="text-xl font-black text-foreground leading-none">{testing}</span><span className="text-[8px] uppercase font-black tracking-widest text-muted-foreground mt-1.5">Testing</span></div>
                            <div className="flex flex-col pl-4 sm:pl-6"><span className="text-xl font-black text-rose-600 dark:text-rose-400 leading-none">{bugs}</span><span className="text-[8px] uppercase font-black tracking-widest text-muted-foreground mt-1.5">Bugs</span></div>
                          </div>
                        )}
                      </div>

                      {/* Right: Timeline & Actions */}
                      <div className="flex items-center justify-between md:justify-end gap-5 w-full md:w-auto">
                        <div className="text-right hidden sm:block min-w-[80px]">
                          {isComplete ? (
                            <>
                              <p className="text-[9px] uppercase font-black tracking-widest text-muted-foreground">Completed At</p>
                              <p className="text-xs font-bold text-foreground mt-0.5">{formatTimeOnly(row.supportLog?.updated_at || null)}</p>
                            </>
                          ) : hasLog ? (
                            <>
                              <p className="text-[9px] uppercase font-black tracking-widest text-muted-foreground">Updated At</p>
                              <p className="text-xs font-bold text-foreground mt-0.5">{formatTimeOnly(row.supportLog?.updated_at || row.testingLogs[0]?.updated_at)}</p>
                            </>
                          ) : (
                            <p className="text-[9px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-500 mt-2">No Activity</p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button 
                            variant={hasLog ? "secondary" : "default"} 
                            size="sm" 
                            className={cn("rounded-xl text-xs font-bold shadow-sm transition-all h-9 px-4 hover:scale-[1.02] active:scale-[0.98]", hasLog ? "bg-slate-100 dark:bg-slate-800/80 border border-border/50" : "")}
                            onClick={() => openModal(row)}
                          >
                            {hasLog ? "Continue Log" : "Add Log"}
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
        /* Calendar Monthly View Panel */
        <div className="space-y-6 animate-fade-in pb-10">
           <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border/60 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => { const d = new Date(selectedDate.slice(0,4) as any, Number(calendarMonth.split("-")[1]) - 2, 1); handleMonthChange(d.toISOString().slice(0, 7)); }}
                className="rounded-xl p-2 border border-border/80 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-sm"
              ><ChevronLeft className="h-4 w-4" /></button>
              <span className="text-lg font-extrabold tracking-tight text-foreground bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400 px-2">
                {new Date(Number(calendarMonth.split("-")[0]), Number(calendarMonth.split("-")[1]) - 1, 1).toLocaleDateString("en", { month: "long", year: "numeric" })}
              </span>
              <button
                onClick={() => { const d = new Date(selectedDate.slice(0,4) as any, Number(calendarMonth.split("-")[1]), 1); handleMonthChange(d.toISOString().slice(0, 7)); }}
                className="rounded-xl p-2 border border-border/80 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-sm"
              ><ChevronRight className="h-4 w-4" /></button>
            </div>
            {isManager && (
              <div className="flex items-center gap-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">View For</Label>
                <select value={calendarEmployeeId} onChange={(e) => setCalendarEmployeeId(e.target.value)} className="rounded-xl border border-border/80 bg-background px-4 py-2 text-xs font-bold shadow-sm outline-none cursor-pointer focus:border-primary transition-colors">
                  <option value="all">All Team Members</option>
                  {rows.map((r) => (<option key={r.employee_id} value={r.employee_id}>{r.full_name}</option>))}
                </select>
              </div>
            )}
          </div>
          
          <Card className="rounded-2xl border border-border/60 shadow-sm bg-card overflow-hidden">
             <CardContent className="p-6">
               <div className="grid grid-cols-7 gap-3 mb-3 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/40 pb-4">
                 <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
               </div>
               <div className="grid grid-cols-7 gap-3">
                 {Array.from({ length: new Date(Number(calendarMonth.split("-")[0]), Number(calendarMonth.split("-")[1]) - 1, 1).getDay() }).map((_, i) => (
                   <div key={`blank-${i}`} className="bg-slate-50/40 dark:bg-slate-900/20 rounded-2xl border border-dashed border-border/40 min-h-[110px] opacity-40" />
                 ))}
                 {Array.from({ length: new Date(Number(calendarMonth.split("-")[0]), Number(calendarMonth.split("-")[1]), 0).getDate() }).map((_, i) => {
                   const day = i + 1;
                   const dateStr = `${calendarMonth}-${day < 10 ? `0${day}` : day}`;
                   const isAll = calendarEmployeeId === "all";
                   
                   let cellClass = "border-border/60 bg-card hover:border-slate-300 dark:hover:border-slate-600";
                   let dotColor = "bg-slate-200 dark:bg-slate-800";
                   let badgeText = "0 / 0";
                   
                   if (isAll) {
                     let cCount = 0; let tCount = monthlyRows.length;
                     for (const empRow of monthlyRows) {
                       const sLog = empRow.supportLogs.find((l) => l.log_date === dateStr);
                       const tLogs = empRow.testingLogs.filter((l) => l.log_date === dateStr);
                       const sOk = sLog ? (sLog.attendance_status === "leave" || (sLog.attendance_status as any) === "holiday" || sLog.tickets_handled > 0 || sLog.chats_handled > 0) : false;
                       const tOk = tLogs.length > 0 && tLogs.every(l => l.status === "completed");
                       if (sOk && tOk) cCount++;
                     }
                     badgeText = `${cCount} / ${tCount}`;
                     if (tCount > 0 && cCount === tCount) { cellClass = "border-emerald-200/80 bg-emerald-50/30 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300"; dotColor = "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"; }
                     else if (cCount > 0) { cellClass = "border-amber-200/80 bg-amber-50/30 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300"; dotColor = "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"; }
                   } else {
                     const empRow = monthlyRows.find((r) => r.employee_id === calendarEmployeeId);
                     const sLog = empRow?.supportLogs.find((l) => l.log_date === dateStr);
                     const isLeave = sLog?.attendance_status === "leave" || (sLog?.attendance_status as any) === "holiday";
                     if (isLeave) { cellClass = "border-blue-200/80 bg-blue-50/30 text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-300"; dotColor = "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"; badgeText = "LEAVE"; }
                     else if (sLog) { cellClass = "border-emerald-200/80 bg-emerald-50/30 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300"; dotColor = "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"; badgeText = "LOGGED"; }
                   }

                   return (
                     <div key={day} onClick={() => { setSelectedDate(dateStr); setCurrentView("list"); }} className={cn("relative p-3 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-1 hover:shadow-md min-h-[110px] animate-slide-in group", cellClass)} style={{animationDelay: `${(day % 7) * 50}ms`}}>
                       <div className="flex items-center justify-between mb-2">
                         <span className={cn("h-3 w-3 rounded-full border border-white/20 dark:border-black/20", dotColor)} />
                         <span className="text-xs font-black text-slate-400 group-hover:text-foreground transition-colors">{day}</span>
                       </div>
                       <div className="text-center pb-1">
                         <span className="text-[10px] font-black tracking-widest uppercase bg-background/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-border/40 shadow-sm">{badgeText}</span>
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
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-emerald-200/80 bg-emerald-50/90 backdrop-blur-md px-5 py-3.5 text-sm font-bold text-emerald-900 shadow-xl dark:border-emerald-900/80 dark:bg-emerald-950/90 dark:text-emerald-200 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4"/> {toast}</div>
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
