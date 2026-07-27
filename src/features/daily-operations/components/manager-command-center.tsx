import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  PlusCircle,
  FileText,
  FileCheck2,
  ArrowRight,
  Ticket,
  MessageSquare
} from "lucide-react";
import type { UserProfile } from "@/lib/auth/roles";
import type { TeamMemberDailyRow } from "../types";
import type { DashboardTrendData } from "../queries";
import type { MonthlyPerformanceSummary, MonthlyPerformanceMetrics } from "../performance";

type CommandProps = {
  profile: UserProfile;
  todayData: TeamMemberDailyRow[];
  trendData: DashboardTrendData[];
  monthlySummary: MonthlyPerformanceSummary;
  monthlyRows: MonthlyPerformanceMetrics[];
};

export function ManagerCommandCenter({
  profile,
  todayData,
}: CommandProps) {
  const currentDate = new Date();
  const dateStr = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Calculate MVP Summary KPIs
  const totalEmployees = todayData.length;
  const presentCount = todayData.filter(
    (r) => r.supportLog && (r.supportLog.attendance_status === "present" || r.supportLog.attendance_status === "wfh")
  ).length;
  const submittedCount = todayData.filter((r) => !!r.supportLog).length;
  const pendingCount = todayData.filter((r) => !r.supportLog).length;
  const lateCount = todayData.filter((r) => r.supportLog && (r.supportLog as any).is_late).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Good Morning, {profile.full_name.split(" ")[0]} 👋
          </h1>
          <p className="text-xs font-semibold text-muted-foreground mt-0.5">
            {dateStr}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/operations">
            <Button variant="default" size="sm" className="rounded-xl font-bold text-xs cursor-pointer">
              <PlusCircle className="mr-1.5 h-3.5 w-3.5" /> Add Daily Log
            </Button>
          </Link>
          <Link href="/operations/submissions">
            <Button variant="outline" size="sm" className="rounded-xl font-bold text-xs cursor-pointer">
              <FileCheck2 className="mr-1.5 h-3.5 w-3.5" /> Submissions
            </Button>
          </Link>
          <Link href="/team">
            <Button variant="outline" size="sm" className="rounded-xl font-bold text-xs cursor-pointer">
              <Users className="mr-1.5 h-3.5 w-3.5" /> Team
            </Button>
          </Link>
          <Link href="/reports">
            <Button variant="outline" size="sm" className="rounded-xl font-bold text-xs cursor-pointer">
              <FileText className="mr-1.5 h-3.5 w-3.5" /> Reports
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. 4 MVP Quick Summary Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <MvpCard
          label="Present Employees"
          value={`${presentCount} / ${totalEmployees}`}
          icon={Users}
          color="text-emerald-600 dark:text-emerald-400"
          bg="bg-emerald-50 dark:bg-emerald-950/20"
        />
        <MvpCard
          label="Reports Submitted"
          value={submittedCount}
          icon={CheckCircle2}
          color="text-blue-600 dark:text-blue-400"
          bg="bg-blue-50 dark:bg-blue-950/20"
        />
        <MvpCard
          label="Pending Reports"
          value={pendingCount}
          icon={AlertCircle}
          color="text-amber-600 dark:text-amber-400"
          bg="bg-amber-50 dark:bg-amber-950/20"
        />
        <MvpCard
          label="Late Reports"
          value={lateCount}
          icon={Clock}
          color="text-rose-600 dark:text-rose-400"
          bg="bg-rose-50 dark:bg-rose-950/20"
        />
      </div>

      {/* 3. Recent Daily Reports Table */}
      <Card className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/20 px-6 py-4 border-b border-border flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-extrabold tracking-tight">Today's Daily Reports</CardTitle>
            <CardDescription className="text-xs">Summary of daily logs submitted by team members today.</CardDescription>
          </div>
          <Link href="/operations" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            View All Logs <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/60 dark:bg-slate-900/30 text-[10px] font-black uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-3">Employee</th>
                  <th className="px-6 py-3">Tickets Closed</th>
                  <th className="px-6 py-3">Chats Handled</th>
                  <th className="px-6 py-3">Testing Work</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {todayData.map((row) => {
                  const hasLog = !!row.supportLog;
                  const tickets = row.supportLog?.tickets_handled ?? 0;
                  const chats = row.supportLog?.chats_handled ?? 0;
                  const testingCount = row.testingLogs?.length ?? 0;

                  return (
                    <tr key={row.employee_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                      <td className="px-6 py-3.5 font-bold text-foreground">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-extrabold text-foreground">
                            {row.full_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-extrabold text-xs">{row.full_name}</p>
                            <p className="text-[10px] text-muted-foreground font-medium">{row.role.replace("_", " ")}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 font-semibold">
                        {hasLog ? (
                          <span className="flex items-center gap-1 text-xs">
                            <Ticket className="h-3.5 w-3.5 text-indigo-500" /> {tickets}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-3.5 font-semibold">
                        {hasLog ? (
                          <span className="flex items-center gap-1 text-xs">
                            <MessageSquare className="h-3.5 w-3.5 text-pink-500" /> {chats}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-xs text-muted-foreground font-medium">
                        {testingCount > 0 ? `${testingCount} Entries` : "-"}
                      </td>
                      <td className="px-6 py-3.5">
                        {hasLog ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] font-extrabold uppercase">
                            Submitted
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 text-[10px] font-extrabold uppercase">
                            Pending
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <Link href={`/operations?employee=${row.employee_id}`}>
                          <Button variant="ghost" size="sm" className="text-xs font-bold text-primary">
                            {hasLog ? "View Log" : "Add Log"} <ArrowRight className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MvpCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
}) {
  return (
    <Card className="rounded-xl border border-border bg-card p-4 shadow-sm">
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
