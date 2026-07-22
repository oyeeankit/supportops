import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Trophy, Target, Sparkles, BookOpen, Lightbulb, CheckSquare, GitPullRequest, Eye } from "lucide-react";
import type { MonthlyPerformanceSummary, MonthlyPerformanceMetrics } from "../performance";
import { starRatingStars, getStarRating } from "../performance";

export function DashboardMonthlySnapshot({ 
  summary, 
  rows 
}: { 
  summary: MonthlyPerformanceSummary; 
  rows: MonthlyPerformanceMetrics[]; 
}) {
  const overallWinner = rows.find(r => r.full_name === summary.overallBestPerformer);
  const supportWinner = rows.find(r => r.full_name === summary.bestSupportPerformer);
  const testingWinner = rows.find(r => r.full_name === summary.bestTestingPerformer);

  return (
    <Card className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden animate-slide-in [animation-delay:600ms]">
      <CardHeader className="bg-slate-50/40 dark:bg-slate-900/10 px-6 py-5 border-b border-border/50">
        <CardTitle className="text-base font-bold tracking-tight">Monthly Performance Snapshot</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <PerformerCard title="Overall Best Performer" winner={overallWinner} monthLabel={summary.monthLabel} icon={Trophy} colorClass="text-amber-500" bgClass="bg-amber-50 dark:bg-amber-950/20" borderClass="border-amber-200 dark:border-amber-900/50" />
          <PerformerCard title="Top Support Performer" winner={supportWinner} monthLabel={summary.monthLabel} icon={Sparkles} colorClass="text-indigo-500" bgClass="bg-indigo-50 dark:bg-indigo-950/20" borderClass="border-indigo-200 dark:border-indigo-900/50" />
          <PerformerCard title="Top Testing Performer" winner={testingWinner} monthLabel={summary.monthLabel} icon={Target} colorClass="text-violet-500" bgClass="bg-violet-50 dark:bg-violet-950/20" borderClass="border-violet-200 dark:border-violet-900/50" />
        </div>
      </CardContent>
    </Card>
  );
}

function PerformerCard({ 
  title, 
  winner, 
  monthLabel,
  icon: Icon,
  colorClass,
  bgClass,
  borderClass
}: { 
  title: string; 
  winner?: MonthlyPerformanceMetrics; 
  monthLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}) {
  if (!winner) {
    return (
      <div className={`rounded-xl border ${borderClass} ${bgClass} p-4 flex flex-col items-center justify-center text-center opacity-70`}>
        <Icon className={`h-6 w-6 mb-2 ${colorClass}`} />
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{title}</p>
        <p className="text-sm font-semibold mt-1">Pending</p>
      </div>
    );
  }

  const ratingInfo = getStarRating(winner.finalScore);

  return (
    <div className={`rounded-xl border ${borderClass} ${bgClass} p-4 flex flex-col items-center justify-center text-center hover:-translate-y-0.5 transition-transform`}>
      <Icon className={`h-6 w-6 mb-2 ${colorClass}`} />
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">{title}</p>
      <p className="text-lg font-extrabold text-foreground mt-1">{winner.full_name}</p>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-yellow-500 tracking-widest text-sm">{starRatingStars[ratingInfo.rating]}</span>
        <span className="text-xs font-semibold">{winner.finalScore.toFixed(1)} / 5</span>
      </div>
      <p className="text-[10px] font-medium text-muted-foreground mt-2">{monthLabel}</p>
    </div>
  );
}

export function SupportContributionSummary({ rows }: { rows: MonthlyPerformanceMetrics[] }) {
  const totals = rows.reduce((acc, row) => {
    acc.docUpdates += row.docUpdates;
    acc.featureSuggestions += row.featureSuggestions;
    acc.bugVerifications += row.bugVerifications;
    acc.askedForReviews += row.askedForReviews;
    acc.gotReviews += row.gotReviews;
    return acc;
  }, { docUpdates: 0, featureSuggestions: 0, bugVerifications: 0, askedForReviews: 0, gotReviews: 0 });

  return (
    <Card className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden animate-slide-in [animation-delay:700ms]">
      <CardHeader className="bg-slate-50/40 dark:bg-slate-900/10 px-6 py-5 border-b border-border/50">
        <CardTitle className="text-base font-bold tracking-tight">Support Contributions</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <ContributionItem label="Documentation Updates" value={totals.docUpdates} icon={BookOpen} color="text-blue-500" />
          <ContributionItem label="Feature Suggestions" value={totals.featureSuggestions} icon={Lightbulb} color="text-amber-500" />
          <ContributionItem label="Bug Verifications" value={totals.bugVerifications} icon={CheckSquare} color="text-rose-500" />
          <ContributionItem label="Review Requests" value={totals.askedForReviews} icon={GitPullRequest} color="text-indigo-500" />
          <ContributionItem label="Reviews Received" value={totals.gotReviews} icon={Eye} color="text-emerald-500" />
        </div>
      </CardContent>
    </Card>
  );
}

function ContributionItem({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ComponentType<{ className?: string }>; color: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-3 text-center border rounded-xl bg-slate-50/30 dark:bg-slate-900/10">
      <Icon className={`h-5 w-5 mb-2 ${color}`} />
      <span className="text-xl font-bold">{value}</span>
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-1">{label}</span>
    </div>
  );
}

export function TeamPerformance({ summary }: { summary: MonthlyPerformanceSummary }) {
  const avg = summary.averageFinalScore;
  const ratingInfo = getStarRating(avg);

  return (
    <Card className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden animate-slide-in [animation-delay:800ms] h-full flex flex-col">
      <CardHeader className="bg-slate-50/40 dark:bg-slate-900/10 px-6 py-5 border-b border-border/50">
        <CardTitle className="text-base font-bold tracking-tight">Team Performance</CardTitle>
      </CardHeader>
      <CardContent className="p-6 flex-1 flex flex-col items-center justify-center text-center">
        <span className="text-yellow-500 tracking-widest text-3xl mb-3">{starRatingStars[ratingInfo.rating]}</span>
        <span className="text-4xl font-extrabold mb-1">{avg.toFixed(1)} / 5</span>
        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{ratingInfo.label}</span>
      </CardContent>
    </Card>
  );
}
