import Link from "next/link";
import { FileText, Headphones, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/app-shell/page-header";
import { requireUser } from "@/lib/auth/session";
import { getDailyOperationsDashboardData } from "@/features/daily-operations/queries";
import { getDailyOperationsPageData, todayIso } from "@/features/daily-operations/queries";
import { ManagerOverview } from "@/features/daily-operations/components/manager-overview";

export default async function DashboardPage() {
  const { profile } = await requireUser();
  const today = todayIso();
  const yesterdayData = await getDailyOperationsDashboardData(profile, "yesterday");
  const todayData = await getDailyOperationsPageData(profile, today);

  const yesterdayTickets = yesterdayData.rows.reduce((sum, row) => sum + (row.supportLog?.tickets_handled ?? 0), 0);
  const yesterdayChats = yesterdayData.rows.reduce((sum, row) => sum + (row.supportLog?.chats_handled ?? 0), 0);
  const yesterdayTesting = yesterdayData.rows.filter((row) => row.testingLogs.length > 0).length;
  const missingEntries = todayData.rows.filter((row) => !row.supportLog);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Yesterday&apos;s summary, yesterday&apos;s team activity, and today&apos;s missing entries for a fast end-of-day manager routine."
      />

      {yesterdayData.error ? <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{yesterdayData.error}</div> : null}

      <div className="grid gap-5 md:grid-cols-3">
        <Card className="rounded-2xl border border-border/60 hover:-translate-y-1 hover:shadow-md transition-all duration-300 shadow-sm bg-card overflow-hidden animate-slide-in">
          <CardContent className="flex items-center justify-between p-5">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Yesterday Tickets</p>
              <p className="text-3xl font-extrabold tracking-tight text-foreground">{yesterdayTickets}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shadow-sm">
              <Headphones className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-border/60 hover:-translate-y-1 hover:shadow-md transition-all duration-300 shadow-sm bg-card overflow-hidden animate-slide-in [animation-delay:100ms]">
          <CardContent className="flex items-center justify-between p-5">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Yesterday Chats</p>
              <p className="text-3xl font-extrabold tracking-tight text-foreground">{yesterdayChats}</p>
            </div>
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shadow-sm">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-border/60 hover:-translate-y-1 hover:shadow-md transition-all duration-300 shadow-sm bg-card overflow-hidden animate-slide-in [animation-delay:200ms]">
          <CardContent className="flex items-center justify-between p-5">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Testing Logs</p>
              <p className="text-3xl font-extrabold tracking-tight text-foreground">{yesterdayTesting}</p>
            </div>
            <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 shadow-sm">
              <FileText className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-2xl border border-border/60 overflow-hidden shadow-sm bg-card animate-slide-in [animation-delay:300ms]">
          <CardContent className="p-6">
            <ManagerOverview rows={yesterdayData.rows} date={today} title="Yesterday&apos;s team activity" description="Tickets, chats, and testing notes captured for each employee." />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border/60 overflow-hidden shadow-sm bg-card animate-slide-in [animation-delay:400ms]">
          <CardHeader className="bg-slate-50/40 dark:bg-slate-900/10 px-6 py-5 border-b border-border/50">
            <CardTitle className="text-base font-bold tracking-tight">Today&apos;s missing entries</CardTitle>
            <CardDescription>Employees still missing a log entry for today.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-3.5">
            {missingEntries.length > 0 ? (
              missingEntries.map((entry) => (
                <div key={entry.employee_id} className="flex items-center justify-between rounded-xl border border-border/50 bg-slate-50/30 dark:bg-slate-900/10 px-4 py-3 hover:shadow-sm transition-all duration-200">
                  <span className="text-sm font-semibold text-foreground">{entry.full_name}</span>
                  <Link href="/operations" className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3.5 py-1.5 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                    Log now
                  </Link>
                </div>
              ))
            ) : (
              <div className="rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-dashed border-border/70 p-4 text-center text-sm font-medium text-muted-foreground">
                🎉 All employees have a log entry for today.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
