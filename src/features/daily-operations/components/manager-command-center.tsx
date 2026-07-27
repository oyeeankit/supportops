import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, Users, Activity, Filter, Download, ArrowRight } from "lucide-react";
import type { UserProfile } from "@/lib/auth/roles";
import type { TeamMemberDailyRow } from "../types";
import type { DashboardTrendData } from "../queries";
import type { MonthlyPerformanceSummary, MonthlyPerformanceMetrics } from "../performance";

// Components
import { TodayTeamSummary, TodayWorkSummary } from "./dashboard-summary-cards";
import { DailyLogProgress, RequiresAttention } from "./dashboard-progress";
import { TeamActivityFeed } from "./dashboard-activity-feed";
import { ActiveTestingOverview } from "./dashboard-tables";
import { DashboardMonthlySnapshot, SupportContributionSummary, TeamPerformance } from "./dashboard-monthly-snapshot";
import { DashboardCharts } from "./dashboard-charts";

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
  trendData,
  monthlySummary,
  monthlyRows,
}: CommandProps) {
  const currentDate = new Date();
  const dateStr = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8 animate-fade-in max-w-[1600px] mx-auto pb-16">
      {/* Header & Section 9: Quick Actions */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-border/40 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Good Morning, {profile.full_name.split(" ")[0]} 👋
          </h1>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {dateStr}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/operations">
            <Button variant="default" className="rounded-xl shadow-md font-bold text-xs cursor-pointer">
              <PlusCircle className="mr-1.5 h-4 w-4" /> Add Daily Log
            </Button>
          </Link>
          <Link href="/operations?filter=pending">
            <Button variant="outline" className="rounded-xl font-bold text-xs border-border/80 cursor-pointer">
              <Filter className="mr-1.5 h-3.5 w-3.5" /> Pending Logs
            </Button>
          </Link>
          <Link href="/team">
            <Button variant="outline" className="rounded-xl font-bold text-xs border-border/80 cursor-pointer">
              <Users className="mr-1.5 h-3.5 w-3.5" /> Team Management
            </Button>
          </Link>
          <Link href="/reports">
            <Button variant="outline" className="rounded-xl font-bold text-xs border-border/80 cursor-pointer">
              <FileText className="mr-1.5 h-3.5 w-3.5" /> Monthly Reports
            </Button>
          </Link>
        </div>
      </div>

      {/* Section 1: Hero Manager Overview & Today's Progress */}
      <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <TodayTeamSummary rows={todayData} />
        </div>
        <DailyLogProgress rows={todayData} />
      </div>

      {/* Section 2: Requires Attention (Action Center) */}
      <RequiresAttention rows={todayData} />

      {/* Section 3: Today's Operations (Operational KPIs) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            Today's Operational Output
          </h2>
          <Link href="/operations" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            Open Operations <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <TodayWorkSummary rows={todayData} />
      </div>

      {/* Section 4 & 6: Activity Feed & Active Testing */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TeamActivityFeed rows={todayData} />
        <ActiveTestingOverview rows={todayData} />
      </div>

      {/* Section 5 & 7: Team Performance & Contributions */}
      <div className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-2">
          Monthly Performance & Contributions
        </h2>
        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <DashboardMonthlySnapshot summary={monthlySummary} rows={monthlyRows} />
          <TeamPerformance summary={monthlySummary} />
        </div>
        <SupportContributionSummary rows={monthlyRows} />
      </div>

      {/* Section 8: Trends */}
      <div className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-2">
          14-Day Performance Trends
        </h2>
        <DashboardCharts data={trendData} />
      </div>
    </div>
  );
}
