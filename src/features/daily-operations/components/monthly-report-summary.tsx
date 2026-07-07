import { Card, CardContent } from "@/components/ui/card";
import type { MonthlyPerformanceSummary } from "../performance";

export function MonthlyReportSummary({ summary }: { summary: MonthlyPerformanceSummary }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard label="Month" value={summary.monthLabel} />
      <StatCard label="Team tickets" value={summary.totalTeamTickets} />
      <StatCard label="Team chats" value={summary.totalTeamChats} />
      <StatCard label="Testing tasks" value={summary.totalTestingTasks} />
      <StatCard label="Bugs found" value={summary.totalBugsFound} />
      <StatCard label="Avg support score" value={summary.averageSupportScore.toFixed(1)} />
      <StatCard label="Avg testing score" value={summary.averageTestingScore.toFixed(1)} />
      <StatCard label="Avg final score" value={summary.averageFinalScore.toFixed(1)} />
      <StatCard label="Best support" value={summary.bestSupportPerformer ?? "-"} />
      <StatCard label="Best testing" value={summary.bestTestingPerformer ?? "-"} />
      <StatCard label="Overall best" value={summary.overallBestPerformer ?? "-"} />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-2 text-xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
