import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, Clock, CheckCircle2, FileText, Bug, MessageSquare, ArrowRight } from "lucide-react";
import type { TeamMemberDailyRow } from "../types";

type ActivityItem = {
  id: string;
  time: string;
  timestamp: number;
  employeeName: string;
  avatarUrl: string | null;
  action: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  badgeClass: string;
};

function formatTime(iso: string): { timeStr: string; timestamp: number } {
  const d = new Date(iso);
  return {
    timeStr: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    timestamp: d.getTime(),
  };
}

export function TeamActivityFeed({ rows }: { rows: TeamMemberDailyRow[] }) {
  const activities: ActivityItem[] = [];

  rows.forEach((row) => {
    if (row.supportLog) {
      const { timeStr, timestamp } = formatTime(row.supportLog.updated_at);
      activities.push({
        id: `support-${row.employee_id}-${row.supportLog.id}`,
        time: timeStr,
        timestamp,
        employeeName: row.full_name,
        avatarUrl: row.avatar_url,
        action: "completed Daily Log",
        detail: `${row.supportLog.tickets_handled} Tickets, ${row.supportLog.chats_handled} Chats`,
        icon: CheckCircle2,
        colorClass: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50",
        badgeClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400",
      });

      if (row.supportLog.doc_updated) {
        activities.push({
          id: `doc-${row.employee_id}`,
          time: timeStr,
          timestamp: timestamp + 1,
          employeeName: row.full_name,
          avatarUrl: row.avatar_url,
          action: "updated Documentation",
          detail: "Support Knowledge Base Updated",
          icon: FileText,
          colorClass: "text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/50",
          badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400",
        });
      }
    }

    if (row.testingLogs && row.testingLogs.length > 0) {
      row.testingLogs.forEach((log) => {
        const { timeStr, timestamp } = formatTime(log.updated_at);
        activities.push({
          id: `testing-${log.id}`,
          time: timeStr,
          timestamp,
          employeeName: row.full_name,
          avatarUrl: row.avatar_url,
          action: `added Testing Entry`,
          detail: `${log.application_name} ${log.module_name ? `• ${log.module_name}` : ""} (${log.bugs_found} bugs)`,
          icon: log.bugs_found > 0 ? Bug : Activity,
          colorClass: log.bugs_found > 0 
            ? "text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50" 
            : "text-violet-500 bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-900/50",
          badgeClass: log.bugs_found > 0 
            ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400" 
            : "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-400",
        });
      });
    }
  });

  // Sort chronologically (most recent first)
  activities.sort((a, b) => b.timestamp - a.timestamp);

  return (
    <Card className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden animate-slide-in">
      <CardHeader className="bg-slate-50/40 dark:bg-slate-900/10 px-6 py-4 border-b border-border/50 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-extrabold tracking-tight flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Team Activity Feed
          </CardTitle>
          <CardDescription className="text-xs mt-0.5">Real-time log events for today</CardDescription>
        </div>
        <Link
          href="/operations"
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          View All Logs <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="p-5">
        {activities.length === 0 ? (
          <div className="py-8 text-center flex flex-col items-center justify-center space-y-2">
            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-muted-foreground">
              <Clock className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-foreground">No activity logged today yet</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              As team members submit daily operations and testing logs, activity timestamps will appear here.
            </p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
            {activities.slice(0, 6).map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="relative flex items-start justify-between gap-4 group">
                  {/* Circle dot on timeline */}
                  <div className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary ring-4 ring-background" />

                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold shrink-0 border border-border/50">
                      {item.avatarUrl ? (
                        <img src={item.avatarUrl} alt="" className="h-full w-full rounded-lg object-cover" />
                      ) : (
                        item.employeeName.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">
                        <span className="font-extrabold">{item.employeeName}</span>{" "}
                        <span className="font-medium text-muted-foreground">{item.action}</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground font-medium truncate mt-0.5">
                        {item.detail}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-muted-foreground bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md shrink-0">
                    {item.time}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
