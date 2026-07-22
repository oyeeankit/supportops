import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, CircleDashed, ArrowRight } from "lucide-react";
import type { TeamMemberDailyRow } from "../types";

export function DailyLogProgress({ rows }: { rows: TeamMemberDailyRow[] }) {
  const total = rows.length;
  const completed = rows.filter((r) => !!r.supportLog).length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <Card className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden animate-slide-in [animation-delay:200ms]">
      <CardHeader className="bg-slate-50/40 dark:bg-slate-900/10 px-6 py-5 border-b border-border/50">
        <CardTitle className="text-base font-bold tracking-tight">Daily Log Progress</CardTitle>
        <CardDescription>Manager completion status for today.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-end justify-between mb-2">
          <div className="space-y-1">
            <p className="text-3xl font-extrabold tracking-tight text-foreground">{completed} / {total}</p>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Employees Completed</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{percentage}%</span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-4 shadow-inner">
          <div 
            className="h-full bg-emerald-500 transition-all duration-1000 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function PendingDailyLogs({ rows }: { rows: TeamMemberDailyRow[] }) {
  const pending = rows.filter((r) => !r.supportLog);

  return (
    <Card className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden animate-slide-in [animation-delay:300ms]">
      <CardHeader className="bg-slate-50/40 dark:bg-slate-900/10 px-6 py-5 border-b border-border/50 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-bold tracking-tight">Pending Logs</CardTitle>
          <CardDescription>Employees missing today's entry.</CardDescription>
        </div>
        <div className="bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-bold">
          {pending.length} Remaining
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {pending.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-sm font-semibold text-foreground">All Caught Up!</p>
            <p className="text-xs text-muted-foreground">Every employee has a log for today.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/50">
            {pending.map((emp) => (
              <li key={emp.employee_id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                <div className="flex items-center gap-3">
                  <CircleDashed className="h-5 w-5 text-amber-500" />
                  <span className="text-sm font-semibold">{emp.full_name}</span>
                </div>
                <Link 
                  href="/operations"
                  className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-1"
                >
                  Log Now
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
