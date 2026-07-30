"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck2,
  Filter,
  Eye,
  ArrowUpRight,
  Ticket,
  MessageSquare,
  Activity,
  X
} from "lucide-react";
import type { DailyReportSubmission } from "../types";

export function ManagerSubmissions({
  submissions,
  todayStr,
}: {
  submissions: DailyReportSubmission[];
  todayStr: string;
}) {
  const [selectedDate, setSelectedDate] = React.useState<string>(todayStr);
  const [selectedShift, setSelectedShift] = React.useState<string>("all");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all");

  const [activeSubmission, setActiveSubmission] = React.useState<DailyReportSubmission | null>(null);

  // Stats calculation
  const total = submissions.length;
  const submittedCount = submissions.filter((s) => s.status === "submitted").length;
  const lateCount = submissions.filter((s) => s.is_late || s.status === "late").length;
  const draftCount = submissions.filter((s) => s.status === "draft").length;
  const pendingCount = submissions.filter((s) => s.status === "missing" || !s.submitted_at).length;

  const filteredSubmissions = submissions.filter((s) => {
    if (selectedDate && s.work_date !== selectedDate) return false;
    if (selectedShift !== "all" && s.shift !== selectedShift) return false;
    if (selectedStatus !== "all" && s.status !== selectedStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-16 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Employee Daily Reports Dashboard</h1>
          <p className="text-xs text-muted-foreground font-medium">
            Monitor, inspect, and approve daily report submissions across all team shifts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/operations">
            <Button variant="outline" className="rounded-xl text-xs font-bold border-border/80 cursor-pointer">
              Operations Console
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <StatCard
          label="Submitted Today"
          value={submittedCount}
          icon={CheckCircle2}
          color="text-emerald-500"
          bg="bg-emerald-50 dark:bg-emerald-950/20"
        />
        <StatCard
          label="Late Submissions"
          value={lateCount}
          icon={Clock}
          color="text-amber-500"
          bg="bg-amber-50 dark:bg-amber-950/20"
        />
        <StatCard
          label="Saved Drafts"
          value={draftCount}
          icon={FileCheck2}
          color="text-blue-500"
          bg="bg-blue-50 dark:bg-blue-950/20"
        />
        <StatCard
          label="Pending / Missing"
          value={pendingCount}
          icon={AlertCircle}
          color="text-rose-500"
          bg="bg-rose-50 dark:bg-rose-950/20"
        />
      </div>

      {/* Filter Bar */}
      <Card className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-foreground">Filters</span>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase">Work Date</Label>
              {selectedDate && (
                <button
                  type="button"
                  onClick={() => setSelectedDate("")}
                  className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-extrabold ml-2 cursor-pointer"
                >
                  Show All Dates
                </button>
              )}
            </div>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-8 text-xs font-bold rounded-lg"
            />
          </div>

          <div>
            <Label className="text-[10px] font-bold text-muted-foreground uppercase">Shift</Label>
            <Select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="h-8 text-xs font-bold rounded-lg"
            >
              <option value="all">All Shifts</option>
              <option value="morning">Morning Shift</option>
              <option value="day">Day Shift</option>
              <option value="evening">Evening Shift</option>
            </Select>
          </div>

          <div>
            <Label className="text-[10px] font-bold text-muted-foreground uppercase">Submission Status</Label>
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-8 text-xs font-bold rounded-lg"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="late">Late Submission</option>
              <option value="draft">Draft</option>
              <option value="missing">Missing</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Submissions List */}
      <Card className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/40 dark:bg-slate-900/10 px-6 py-4 border-b border-border/50 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-extrabold tracking-tight">Employee Submissions List</CardTitle>
          {selectedDate && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate("")}
              className="text-xs font-bold rounded-lg border-border/80 h-7"
            >
              View All Historical Submissions
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {filteredSubmissions.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">
                No daily reports match the selected date ({selectedDate || "All Dates"}) and filter parameters.
              </p>
              {selectedDate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDate("")}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Clear Date Filter to View All Submissions
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/60 dark:bg-slate-900/30 text-[10px] font-black uppercase tracking-wider text-muted-foreground border-b border-border/40">
                  <tr>
                    <th className="px-6 py-3.5">Employee</th>
                    <th className="px-6 py-3.5">Shift</th>
                    <th className="px-6 py-3.5">Work Date</th>
                    <th className="px-6 py-3.5">Tickets Closed</th>
                    <th className="px-6 py-3.5">Chats Handled</th>
                    <th className="px-6 py-3.5">QA Testing</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredSubmissions.map((sub) => {
                    const draft = (sub.draft_payload as any) ?? {};
                    const tickets = sub.supportLog?.tickets_handled || Number(draft.tickets_handled ?? draft.tickets ?? 0);
                    const chats = sub.supportLog?.chats_handled || Number(draft.chats_handled ?? draft.chats ?? 0);
                    const testingCount = sub.testingLogs?.length ?? 0;

                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                        <td className="px-6 py-4 font-bold text-foreground">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-extrabold text-foreground">
                              {sub.employee_name ? sub.employee_name.charAt(0) : "E"}
                            </div>
                            <div>
                              <p className="font-extrabold">{sub.employee_name}</p>
                              <p className="text-[10px] text-muted-foreground font-medium">{sub.employee_email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold capitalize text-muted-foreground">{sub.shift}</td>
                        <td className="px-6 py-4 font-semibold">{sub.work_date}</td>
                        <td className="px-6 py-4 font-extrabold text-indigo-600 dark:text-indigo-400">
                          <span className="flex items-center gap-1.5">
                            <Ticket className="h-3.5 w-3.5 text-indigo-500" /> {tickets}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-extrabold text-pink-600 dark:text-pink-400">
                          <span className="flex items-center gap-1.5">
                            <MessageSquare className="h-3.5 w-3.5 text-pink-500" /> {chats}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-violet-600 dark:text-violet-400">
                          {testingCount > 0 ? `${testingCount} Entries` : "-"}
                        </td>
                        <td className="px-6 py-4">
                          {sub.status === "submitted" && (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] font-extrabold uppercase">
                              ✅ Submitted
                            </Badge>
                          )}
                          {sub.status === "late" && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 text-[10px] font-extrabold uppercase">
                              🟠 Late
                            </Badge>
                          )}
                          {sub.status === "draft" && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 text-[10px] font-extrabold uppercase">
                              🟡 Draft
                            </Badge>
                          )}
                          {sub.status === "missing" && (
                            <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 text-[10px] font-extrabold uppercase">
                              🔴 Missing
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs font-bold rounded-lg cursor-pointer"
                            onClick={() => setActiveSubmission(sub)}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" /> Inspect
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Detail Inspection Drawer */}
      {activeSubmission && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/80 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-fade-in relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div>
                <h3 className="text-lg font-black text-foreground">
                  Report Detail: {activeSubmission.employee_name}
                </h3>
                <p className="text-xs text-muted-foreground font-medium">
                  Work Date: {activeSubmission.work_date} • Shift: {activeSubmission.shift}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setActiveSubmission(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid gap-3 grid-cols-2 p-4 rounded-xl border border-border/50 bg-slate-50/40 dark:bg-slate-900/20">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Submission Status</p>
                  <p className="text-sm font-extrabold capitalize text-foreground">{activeSubmission.status}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Submitted At</p>
                  <p className="text-xs font-bold text-foreground">
                    {activeSubmission.submitted_at ? new Date(activeSubmission.submitted_at).toLocaleString() : "-"}
                  </p>
                </div>
              </div>

              {/* Operational Output Metrics */}
              <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-3">
                <p className="text-xs font-extrabold text-indigo-950 dark:text-indigo-200 uppercase tracking-wider">
                  📊 Recorded Metrics Logged
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-background border border-indigo-200/60 dark:border-indigo-900/50">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Tickets Solved</p>
                    <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                      {activeSubmission.supportLog?.tickets_handled || Number(((activeSubmission.draft_payload as any) ?? {}).tickets_handled ?? 0)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border border-pink-200/60 dark:border-pink-900/50">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Chats Handled</p>
                    <p className="text-lg font-black text-pink-600 dark:text-pink-400">
                      {activeSubmission.supportLog?.chats_handled || Number(((activeSubmission.draft_payload as any) ?? {}).chats_handled ?? 0)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border border-violet-200/60 dark:border-violet-900/50">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">QA Modules Tested</p>
                    <p className="text-lg font-black text-violet-600 dark:text-violet-400">
                      {activeSubmission.testingLogs?.length ?? 0}
                    </p>
                  </div>
                </div>
              </div>

              {activeSubmission.notes && (
                <div className="p-4 rounded-xl border border-border/50 bg-slate-50/40 dark:bg-slate-900/20 space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">General Notes / Highlights</p>
                  <p className="text-xs font-medium text-foreground whitespace-pre-line">{activeSubmission.notes}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border/50 pt-4">
              <Link href={`/operations?date=${activeSubmission.work_date}&employee=${activeSubmission.employee_id}`}>
                <Button variant="default" className="rounded-xl text-xs font-bold">
                  Edit in Operations Console <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
              <Button variant="outline" className="rounded-xl text-xs font-bold" onClick={() => setActiveSubmission(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
}) {
  return (
    <Card className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <CardContent className="p-0 flex items-center justify-between">
        <div>
          <p className="text-2xl font-black text-foreground">{value}</p>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">{label}</p>
        </div>
        <div className={`p-2.5 rounded-xl ${bg} ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
