import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Home,
  CalendarOff,
  Palmtree,
  Ticket,
  MessageSquare,
  Activity,
  ShieldAlert,
  FileCheck,
  Sparkles,
  ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { TeamMemberDailyRow } from "../types";

function MetricCard({
  label,
  value,
  icon: Icon,
  iconColor,
  bgClass,
  href,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  bgClass: string;
  href?: string;
}) {
  const content = (
    <Card className="rounded-2xl border border-border/60 bg-card p-4 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 shadow-sm overflow-hidden group cursor-pointer">
      <CardContent className="flex flex-col p-0">
        <div className="flex justify-between items-start">
          <p className="text-2xl font-black tracking-tight text-foreground">{value}</p>
          <div className="flex items-center gap-1">
            <div className={cn("p-2 rounded-xl shadow-inner", bgClass, iconColor)}>
              <Icon className="h-4 w-4" />
            </div>
            {href && (
              <ArrowUpRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
            )}
          </div>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-2">
          {label}
        </p>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

export function TodayTeamSummary({ rows }: { rows: TeamMemberDailyRow[] }) {
  let present = 0;
  let wfh = 0;
  let leave = 0;
  let holiday = 0;

  rows.forEach((row) => {
    if (!row.supportLog) return;
    switch (row.supportLog.attendance_status) {
      case "present":
        present++;
        break;
      case "wfh":
        wfh++;
        break;
      case "leave":
        leave++;
        break;
      case "holiday" as any:
        holiday++;
        break;
    }
  });

  const total = rows.length;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 bg-card border border-border/60 px-3.5 py-1.5 rounded-xl shadow-sm">
        <Users className="h-4 w-4 text-primary" />
        <span className="text-xs font-black text-foreground">{total}</span>
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Team Members</span>
      </div>
      <div className="flex items-center gap-2 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/50 px-3.5 py-1.5 rounded-xl shadow-sm">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">{present}</span>
        <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Present</span>
      </div>
      <div className="flex items-center gap-2 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/50 px-3.5 py-1.5 rounded-xl shadow-sm">
        <Home className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
        <span className="text-xs font-black text-blue-700 dark:text-blue-400">{wfh}</span>
        <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">WFH</span>
      </div>
      <div className="flex items-center gap-2 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/50 px-3.5 py-1.5 rounded-xl shadow-sm">
        <CalendarOff className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
        <span className="text-xs font-black text-amber-700 dark:text-amber-400">{leave}</span>
        <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">Leave</span>
      </div>
    </div>
  );
}

export function TodayWorkSummary({ rows }: { rows: TeamMemberDailyRow[] }) {
  let tickets = 0;
  let chats = 0;
  let testingEntries = 0;
  let bugsFound = 0;
  let criticalBugs = 0;
  let docUpdates = 0;

  rows.forEach((row) => {
    if (row.supportLog) {
      tickets += row.supportLog.tickets_handled ?? 0;
      chats += row.supportLog.chats_handled ?? 0;
      if (row.supportLog.doc_updated) docUpdates++;
    }
    if (row.testingLogs && row.testingLogs.length > 0) {
      testingEntries += row.testingLogs.length;
      bugsFound += row.testingLogs.reduce((sum, log) => sum + (log.bugs_found ?? 0), 0);
      criticalBugs += row.testingLogs.filter((log) => log.critical_bug).length;
    }
  });

  return (
    <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6 animate-slide-in">
      <MetricCard
        label="Tickets Closed"
        value={tickets}
        icon={Ticket}
        iconColor="text-indigo-600 dark:text-indigo-400"
        bgClass="bg-indigo-50 dark:bg-indigo-950/30"
        href="/operations"
      />
      <MetricCard
        label="Chats Handled"
        value={chats}
        icon={MessageSquare}
        iconColor="text-pink-600 dark:text-pink-400"
        bgClass="bg-pink-50 dark:bg-pink-950/30"
        href="/operations"
      />
      <MetricCard
        label="Testing Entries"
        value={testingEntries}
        icon={Activity}
        iconColor="text-violet-600 dark:text-violet-400"
        bgClass="bg-violet-50 dark:bg-violet-950/30"
        href="/operations"
      />
      <MetricCard
        label="Bugs Found"
        value={bugsFound}
        icon={ShieldAlert}
        iconColor="text-rose-600 dark:text-rose-400"
        bgClass="bg-rose-50 dark:bg-rose-950/30"
        href="/operations"
      />
      <MetricCard
        label="Critical Bugs"
        value={criticalBugs}
        icon={Sparkles}
        iconColor="text-red-600 dark:text-red-400"
        bgClass="bg-red-50 dark:bg-red-950/30"
        href="/operations"
      />
      <MetricCard
        label="Doc Updates"
        value={docUpdates}
        icon={FileCheck}
        iconColor="text-cyan-600 dark:text-cyan-400"
        bgClass="bg-cyan-50 dark:bg-cyan-950/30"
        href="/operations"
      />
    </div>
  );
}
