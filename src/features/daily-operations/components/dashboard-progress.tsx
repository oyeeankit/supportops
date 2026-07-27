import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  CircleDashed,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  FileCheck2
} from "lucide-react";
import type { TeamMemberDailyRow } from "../types";

export function RequiresAttention({ rows }: { rows: TeamMemberDailyRow[] }) {
  const pendingLogs = rows.filter((r) => !r.supportLog);
  const missingTesting = rows.filter((r) => r.testingLogs && r.testingLogs.length === 0);
  
  let criticalBugs = 0;
  rows.forEach((r) => {
    if (r.testingLogs) {
      criticalBugs += r.testingLogs.filter((l) => l.critical_bug).length;
    }
  });

  const alerts = [];

  if (pendingLogs.length > 0) {
    alerts.push({
      id: "pending-logs",
      type: "error",
      dot: "🔴",
      title: `${pendingLogs.length} ${pendingLogs.length === 1 ? "Employee" : "Employees"} Pending Daily Log`,
      description: "Logs need to be submitted for today's shift.",
      actionText: "Open Pending Logs",
      href: "/operations?filter=pending",
    });
  }

  if (criticalBugs > 0) {
    alerts.push({
      id: "critical-bugs",
      type: "error",
      dot: "🔴",
      title: `${criticalBugs} Critical ${criticalBugs === 1 ? "Bug" : "Bugs"} Reported Today`,
      description: "Immediate resolution or escalation required.",
      actionText: "View Critical Bugs",
      href: "/operations?filter=critical",
    });
  }

  if (missingTesting.length > 0 && missingTesting.length < rows.length) {
    alerts.push({
      id: "missing-testing",
      type: "warning",
      dot: "🟡",
      title: `${missingTesting.length} ${missingTesting.length === 1 ? "Employee" : "Employees"} Missing Testing Entry`,
      description: "Testing activities should be logged for current tasks.",
      actionText: "Check Testing Activity",
      href: "/operations?filter=testing",
    });
  }

  const isAllGood = alerts.length === 0;

  return (
    <Card className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden animate-slide-in">
      <CardHeader className="bg-slate-50/40 dark:bg-slate-900/10 px-6 py-4 border-b border-border/50 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          {isAllGood ? (
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
          ) : (
            <ShieldAlert className="h-5 w-5 text-rose-500 animate-pulse" />
          )}
          <div>
            <CardTitle className="text-base font-extrabold tracking-tight">Requires Attention</CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Actionable operational alerts for immediate decision making
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        {isAllGood ? (
          <div className="py-6 flex items-center justify-between px-4 bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold shadow-inner">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-emerald-950 dark:text-emerald-200">
                  Everything looks good today.
                </p>
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mt-0.5">
                  All daily operations logs are submitted and zero critical issues detected.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-3 py-1 rounded-md hidden sm:inline-block">
              🟢 On Track
            </span>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-border/50 bg-slate-50/40 dark:bg-slate-900/20 hover:border-slate-300 dark:hover:border-slate-700 transition-all gap-3"
              >
                <div className="flex items-start gap-3">
                  <span className="text-sm mt-0.5">{alert.dot}</span>
                  <div>
                    <p className="text-xs font-extrabold text-foreground tracking-tight">
                      {alert.title}
                    </p>
                    <p className="text-[11px] font-medium text-muted-foreground mt-0.5">
                      {alert.description}
                    </p>
                  </div>
                </div>
                <Link
                  href={alert.href}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1 self-end sm:self-center shrink-0 bg-background px-3 py-1.5 rounded-lg border border-border/60 shadow-sm"
                >
                  {alert.actionText} <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DailyLogProgress({ rows }: { rows: TeamMemberDailyRow[] }) {
  const total = rows.length;
  const completed = rows.filter((r) => !!r.supportLog).length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
        <span className="text-muted-foreground">Today's Progress</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{percentage}% Completed</span>
      </div>
      <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner border border-border/40 relative">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-[11px] font-semibold text-muted-foreground">
        <span>{completed} of {total} Logs Completed</span>
        <span>{total - completed} Remaining</span>
      </div>
    </div>
  );
}

export function PendingDailyLogs({ rows }: { rows: TeamMemberDailyRow[] }) {
  const pending = rows.filter((r) => !r.supportLog);

  return (
    <Card className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden animate-slide-in">
      <CardHeader className="bg-slate-50/40 dark:bg-slate-900/10 px-6 py-4 border-b border-border/50 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-bold tracking-tight">Pending Logs</CardTitle>
          <CardDescription className="text-xs">Employees missing today's entry.</CardDescription>
        </div>
        <div className="bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-bold">
          {pending.length} Remaining
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {pending.length === 0 ? (
          <div className="p-6 text-center flex flex-col items-center justify-center space-y-2">
            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-xs font-bold text-foreground">No Pending Logs</p>
            <p className="text-[11px] text-muted-foreground">All team members have completed daily entries.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/50">
            {pending.map((emp) => (
              <li
                key={emp.employee_id}
                className="p-3.5 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <CircleDashed className="h-4 w-4 text-amber-500" />
                  <span className="text-xs font-extrabold">{emp.full_name}</span>
                </div>
                <Link
                  href="/operations"
                  className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1"
                >
                  Log Now <ArrowRight className="h-3 w-3" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
