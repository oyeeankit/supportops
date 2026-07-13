"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { roleLabels } from "@/lib/auth/roles";
import { getScoreBadgeVariant, starRatingStars } from "../performance";
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
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">{metrics.full_name}</h2>
          <p className="text-sm text-muted-foreground">{roleLabels[metrics.role]} monthly performance summary</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{metrics.finalScore.toFixed(2)} / 5</p>
          <p className="text-lg">{starRatingStars[metrics.starRating]}</p>
          <p className="text-sm text-muted-foreground">{metrics.ratingLabel}</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Detail label="Support Days" value={metrics.supportDays} />
        <Detail label="Testing Days" value={metrics.testingDays} />
        <Detail label="Total Tickets" value={metrics.totalTickets} />
        <Detail label="Total Chats" value={metrics.totalChats} />
        <Detail label="Testing Entries" value={metrics.totalTestingEntries} />
        <Detail label="Apps Tested" value={metrics.appsTested} />
        <Detail label="Bugs Found" value={metrics.bugsFound} />
        <Detail label="Critical Bugs" value={metrics.criticalBugsFound} />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <ScoreCard label="Support Score (/5)" score={metrics.supportScore} na={metrics.supportDays === 0} />
        <ScoreCard label="Testing Score (/5)" score={metrics.testingScore} na={metrics.testingDays === 0} />
        <ScoreCard label="Avg Daily Score (/5)" score={metrics.averageDailyScore} />
        <ScoreCard label="Final Score (/5)" score={metrics.finalScore} />
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

function ScoreCard({ label, score, na = false }: { label: string; score: number; na?: boolean }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      {na ? (
        <Badge variant="outline" className="mt-2 inline-flex text-base">N/A</Badge>
      ) : (
        <Badge variant={getScoreBadgeVariant(score)} className="mt-2 inline-flex text-base">
          {score.toFixed(2)}
        </Badge>
      )}
    </div>
  );
}
