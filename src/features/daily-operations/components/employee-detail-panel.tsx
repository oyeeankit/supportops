"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { roleLabels } from "@/lib/auth/roles";
import type { MonthlyPerformanceMetrics } from "../performance";

export function EmployeeDetailPanel({ employee }: { employee: MonthlyPerformanceMetrics | null }) {
  const metrics = useMemo(() => employee, [employee]);

  if (!metrics) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
        Select an employee to view the monthly summary.
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-lg border border-border bg-card p-6">
      <div>
        <h2 className="text-lg font-semibold">{metrics.full_name}</h2>
        <p className="text-sm text-muted-foreground">{roleLabels[metrics.role]} monthly performance summary</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Detail label="Support Days" value={metrics.supportDays} />
        <Detail label="Testing Days" value={metrics.testingDays} />
        <Detail label="Total Tickets" value={metrics.totalTickets} />
        <Detail label="Total Chats" value={metrics.totalChats} />
        <Detail label="Avg Tickets" value={metrics.avgTicketsPerSupportDay.toFixed(1)} />
        <Detail label="Avg Chats" value={metrics.avgChatsPerSupportDay.toFixed(1)} />
        <Detail label="Testing Tasks" value={metrics.totalTestingTasks} />
        <Detail label="Completed" value={metrics.completedTestingTasks} />
        <Detail label="Bugs Found" value={metrics.bugsFound} />
        <Detail label="Critical Bugs" value={metrics.criticalBugsFound} />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {metrics.role === "qa_engineer" ? <NotApplicableScoreCard label="Support Score" /> : <ScoreCard label="Support Score" score={metrics.supportScore} />}
        <ScoreCard label="Testing Score" score={metrics.testingScore} />
        <ScoreCard label="Final Score" score={metrics.finalScore} />
      </div>
      <div className="rounded-lg border border-border bg-muted p-4">
        <p className="text-sm font-medium">Manager Remarks</p>
        <p className="mt-2 text-sm text-muted-foreground">{metrics.managerRemarks || "No remarks added."}</p>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}

function ScoreCard({ label, score }: { label: string; score: number }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <Badge variant={getVariant(score)} className="mt-2 inline-flex text-base">
        {score}
      </Badge>
    </div>
  );
}

function NotApplicableScoreCard({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <Badge variant="outline" className="mt-2 inline-flex text-base">
        N/A
      </Badge>
    </div>
  );
}

function getVariant(score: number) {
  if (score >= 90) return "success";
  if (score >= 80) return "secondary";
  if (score >= 70) return "warning";
  return "danger";
}
