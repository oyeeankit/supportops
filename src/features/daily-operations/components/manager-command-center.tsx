import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, Users, Activity } from "lucide-react";
import type { UserProfile } from "@/lib/auth/roles";
import type { TeamMemberDailyRow } from "../types";
import type { DashboardTrendData } from "../queries";
import type { MonthlyPerformanceSummary, MonthlyPerformanceMetrics } from "../performance";

// Components
import { TodayTeamSummary, TodayWorkSummary } from "./dashboard-summary-cards";
import { DailyLogProgress, PendingDailyLogs } from "./dashboard-progress";
import { TeamActivityOverview, ActiveTestingOverview } from "./dashboard-tables";
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
  const dateStr = currentDate.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const monthStr = currentDate.toLocaleDateString("en-US", { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. Welcome Section & Quick Actions */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Good Morning, {profile.full_name.split(" ")[0]} 👋
          </h1>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {dateStr} • {monthStr}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/operations">
            <Button variant="default" className="rounded-xl shadow-md">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Daily Log
            </Button>
          </Link>
          <Link href="/reports">
            <Button variant="outline" className="rounded-xl">
              <FileText className="mr-2 h-4 w-4" /> Reports
            </Button>
          </Link>
          <Link href="/team">
            <Button variant="outline" className="rounded-xl">
              <Users className="mr-2 h-4 w-4" /> Team
            </Button>
          </Link>
          <Link href="/operations">
            <Button variant="outline" className="rounded-xl">
              <Activity className="mr-2 h-4 w-4" /> Operations
            </Button>
          </Link>
        </div>
      </div>

      {/* 2 & 3. Today's Summary Cards */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-2">Today's Team & Work Summary</h2>
        <div className="grid gap-4 xl:grid-cols-2">
          <TodayTeamSummary rows={todayData} />
          <TodayWorkSummary rows={todayData} />
        </div>
      </div>

      {/* 4 & 10. Progress and Pending */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <DailyLogProgress rows={todayData} />
        <PendingDailyLogs rows={todayData} />
      </div>

      {/* 5 & 6. Activity Tables */}
      <div className="grid gap-6 xl:grid-cols-2">
        <TeamActivityOverview rows={todayData} />
        <ActiveTestingOverview rows={todayData} />
      </div>

      {/* 9. Trend Charts */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-2">14-Day Performance Trends</h2>
        <DashboardCharts data={trendData} />
      </div>

      {/* 7, 8 & 12. Monthly Snapshot */}
      <div className="space-y-4 pb-12">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-2">Monthly Performance Snapshot</h2>
        <div className="grid gap-6 xl:grid-cols-[1fr_1.5fr_0.8fr]">
          <DashboardMonthlySnapshot summary={monthlySummary} rows={monthlyRows} />
          <SupportContributionSummary rows={monthlyRows} />
          <TeamPerformance summary={monthlySummary} />
        </div>
      </div>

    </div>
  );
}
