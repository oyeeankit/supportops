import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Star,
  Trophy,
  Target,
  Sparkles,
  BookOpen,
  Lightbulb,
  CheckSquare,
  GitPullRequest,
  Eye,
  ArrowUpRight
} from "lucide-react";
import type { MonthlyPerformanceSummary, MonthlyPerformanceMetrics } from "../performance";
import { starRatingStars, getStarRating } from "../performance";

export function DashboardMonthlySnapshot({
  summary,
  rows,
}: {
  summary: MonthlyPerformanceSummary;
  rows: MonthlyPerformanceMetrics[];
}) {
  const overallWinner = rows.find((r) => r.full_name === summary.overallBestPerformer);
  const supportWinner = rows.find((r) => r.full_name === summary.bestSupportPerformer);
  const testingWinner = rows.find((r) => r.full_name === summary.bestTestingPerformer);

  return (
    <Card className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden animate-slide-in">
      <CardHeader className="bg-slate-50/40 dark:bg-slate-900/10 px-6 py-4 border-b border-border/50 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-extrabold tracking-tight">Team Performance</CardTitle>
          <CardDescription className="text-xs mt-0.5">Top monthly evaluation rankings</CardDescription>
        </div>
        <Link
          href="/reports"
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          Open Reports <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <PerformerCard
            title="Top Performer"
            winner={overallWinner}
            monthLabel={summary.monthLabel}
            icon={Trophy}
            colorClass="text-amber-500"
            bgClass="bg-amber-50 dark:bg-amber-950/20"
            borderClass="border-amber-200 dark:border-amber-900/50"
          />
          <PerformerCard
            title="Support Champion"
            winner={supportWinner}
            monthLabel={summary.monthLabel}
            icon={Sparkles}
            colorClass="text-indigo-500"
            bgClass="bg-indigo-50 dark:bg-indigo-950/20"
            borderClass="border-indigo-200 dark:border-indigo-900/50"
          />
          <PerformerCard
            title="Most Active Tester"
            winner={testingWinner}
            monthLabel={summary.monthLabel}
            icon={Target}
            colorClass="text-violet-500"
            bgClass="bg-violet-50 dark:bg-violet-950/20"
            borderClass="border-violet-200 dark:border-violet-900/50"
          />
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
  borderClass,
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
      <Link href="/reports">
        <div
          className={`rounded-xl border ${borderClass} ${bgClass} p-4 flex flex-col items-center justify-center text-center opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
        >
          <Icon className={`h-6 w-6 mb-1.5 ${colorClass}`} />
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{title}</p>
          <p className="text-xs font-bold mt-1 text-foreground">Pending Evaluation</p>
        </div>
      </Link>
    );
  }

  const ratingInfo = getStarRating(winner.finalScore);

  return (
    <Link href="/reports">
      <div
        className={`rounded-xl border ${borderClass} ${bgClass} p-4 flex flex-col items-center justify-center text-center hover:-translate-y-0.5 transition-all cursor-pointer group`}
      >
        <Icon className={`h-6 w-6 mb-1.5 ${colorClass}`} />
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground/80">
          {title}
        </p>
        <p className="text-base font-black text-foreground mt-1 group-hover:text-primary transition-colors">
          {winner.full_name}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-yellow-500 tracking-widest text-xs">
            {starRatingStars[ratingInfo.rating]}
          </span>
          <span className="text-xs font-extrabold text-foreground">{winner.finalScore.toFixed(1)} / 5</span>
        </div>
        <p className="text-[10px] font-bold text-muted-foreground mt-1.5 uppercase tracking-wider">
          {monthLabel}
        </p>
      </div>
    </Link>
  );
}

export function SupportContributionSummary({ rows }: { rows: MonthlyPerformanceMetrics[] }) {
  const totals = rows.reduce(
    (acc, row) => {
      acc.docUpdates += row.docUpdates;
      acc.featureSuggestions += row.featureSuggestions;
      acc.bugVerifications += row.bugVerifications;
      acc.askedForReviews += row.askedForReviews;
      acc.gotReviews += row.gotReviews;
      return acc;
    },
    { docUpdates: 0, featureSuggestions: 0, bugVerifications: 0, askedForReviews: 0, gotReviews: 0 }
  );

  return (
    <Card className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden animate-slide-in">
      <CardHeader className="bg-slate-50/40 dark:bg-slate-900/10 px-6 py-4 border-b border-border/50">
        <CardTitle className="text-base font-extrabold tracking-tight">Team Contributions</CardTitle>
        <CardDescription className="text-xs mt-0.5">
          Valuable work beyond raw ticket counts
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5">
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          <ContributionItem
            label="Documentation"
            value={totals.docUpdates}
            icon={BookOpen}
            color="text-blue-500"
          />
          <ContributionItem
            label="Feature Suggestions"
            value={totals.featureSuggestions}
            icon={Lightbulb}
            color="text-amber-500"
          />
          <ContributionItem
            label="Bug Verification"
            value={totals.bugVerifications}
            icon={CheckSquare}
            color="text-rose-500"
          />
          <ContributionItem
            label="Reviews Received"
            value={totals.gotReviews}
            icon={Star}
            color="text-emerald-500"
            suffix=" ⭐"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function ContributionItem({
  label,
  value,
  icon: Icon,
  color,
  suffix = "",
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  suffix?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-3.5 text-center border border-border/50 rounded-xl bg-slate-50/30 dark:bg-slate-900/10 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
      <Icon className={`h-5 w-5 mb-1.5 ${color}`} />
      <span className="text-2xl font-black text-foreground">
        {value}
        {suffix}
      </span>
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">
        {label}
      </span>
    </div>
  );
}

export function TeamPerformance({ summary }: { summary: MonthlyPerformanceSummary }) {
  const avg = summary.averageFinalScore;
  const ratingInfo = getStarRating(avg);

  return (
    <Card className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden animate-slide-in h-full flex flex-col">
      <CardHeader className="bg-slate-50/40 dark:bg-slate-900/10 px-6 py-4 border-b border-border/50">
        <CardTitle className="text-base font-extrabold tracking-tight">Overall Rating</CardTitle>
      </CardHeader>
      <CardContent className="p-6 flex-1 flex flex-col items-center justify-center text-center">
        <span className="text-yellow-500 tracking-widest text-3xl mb-2">
          {starRatingStars[ratingInfo.rating]}
        </span>
        <span className="text-4xl font-black text-foreground mb-1">{avg.toFixed(1)} / 5</span>
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          {ratingInfo.label}
        </span>
      </CardContent>
    </Card>
  );
}
