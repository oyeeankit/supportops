import { Card, CardContent } from "@/components/ui/card";
import type { MonthlyPerformanceSummary } from "../performance";

export function MonthlyReportSummary({ summary }: { summary: MonthlyPerformanceSummary }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard label="Month" value={summary.monthLabel} />
      <StatCard label="Team tickets" value={summary.totalTeamTickets} />
      <StatCard label="Team chats" value={summary.totalTeamChats} />
      <StatCard label="Testing entries" value={summary.totalTestingEntries} />
      <StatCard label="Apps tested" value={summary.totalAppsTested} />
      <StatCard label="Bugs found" value={summary.totalBugsFound} />
      <StatCard label="Critical bugs" value={summary.totalCriticalBugs} />
      <StatCard label="Avg support (/5)" value={summary.averageSupportScore.toFixed(2)} />
      <StatCard label="Avg testing (/5)" value={summary.averageTestingScore.toFixed(2)} />
      <StatCard label="Avg daily score (/5)" value={summary.averageDailyScore.toFixed(2)} />
      <StatCard label="Avg final score (/5)" value={summary.averageFinalScore.toFixed(2)} />
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
