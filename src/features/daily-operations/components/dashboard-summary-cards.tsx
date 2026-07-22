import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Home, CalendarOff, Palmtree, Ticket, MessageSquare, Activity, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { TeamMemberDailyRow } from "../types";

function MetricCard({
  label,
  value,
  icon: Icon,
  iconColor,
  bgClass,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  bgClass: string;
}) {
  return (
    <Card className="rounded-2xl border border-border/60 bg-card p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 shadow-sm overflow-hidden">
      <CardContent className="flex flex-col p-0">
        <div className="flex justify-between items-start">
          <p className="text-3xl font-extrabold tracking-tight text-foreground">{value}</p>
          <div className={cn("p-2 rounded-xl shadow-inner", bgClass, iconColor)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-2">{label}</p>
      </CardContent>
    </Card>
  );
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
    }
  });

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-4 animate-slide-in">
      <MetricCard label="Present" value={present} icon={Users} iconColor="text-emerald-600 dark:text-emerald-400" bgClass="bg-emerald-50/50 dark:bg-emerald-950/20" />
      <MetricCard label="Working From Home" value={wfh} icon={Home} iconColor="text-blue-600 dark:text-blue-400" bgClass="bg-blue-50/50 dark:bg-blue-950/20" />
      <MetricCard label="On Leave" value={leave} icon={CalendarOff} iconColor="text-amber-600 dark:text-amber-400" bgClass="bg-amber-50/50 dark:bg-amber-950/20" />
      <MetricCard label="Holiday" value={holiday} icon={Palmtree} iconColor="text-violet-600 dark:text-violet-400" bgClass="bg-violet-50/50 dark:bg-violet-950/20" />
    </div>
  );
}

export function TodayWorkSummary({ rows }: { rows: TeamMemberDailyRow[] }) {
  let tickets = 0;
  let chats = 0;
  let testingEntries = 0;
  let bugsFound = 0;

  rows.forEach((row) => {
    if (row.supportLog) {
      tickets += row.supportLog.tickets_handled ?? 0;
      chats += row.supportLog.chats_handled ?? 0;
    }
    if (row.testingLogs && row.testingLogs.length > 0) {
      testingEntries += row.testingLogs.length;
      bugsFound += row.testingLogs.reduce((sum, log) => sum + (log.bugs_found ?? 0), 0);
    }
  });

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-4 animate-slide-in [animation-delay:100ms]">
      <MetricCard label="Tickets Closed" value={tickets} icon={Ticket} iconColor="text-indigo-600 dark:text-indigo-400" bgClass="bg-indigo-50/50 dark:bg-indigo-950/20" />
      <MetricCard label="Chats Handled" value={chats} icon={MessageSquare} iconColor="text-pink-600 dark:text-pink-400" bgClass="bg-pink-50/50 dark:bg-pink-950/20" />
      <MetricCard label="Testing Entries" value={testingEntries} icon={Activity} iconColor="text-violet-600 dark:text-violet-400" bgClass="bg-violet-50/50 dark:bg-violet-950/20" />
      <MetricCard label="Bugs Found" value={bugsFound} icon={ShieldAlert} iconColor="text-rose-600 dark:text-rose-400" bgClass="bg-rose-50/50 dark:bg-rose-950/20" />
    </div>
  );
}
