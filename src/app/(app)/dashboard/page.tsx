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

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Yesterday tickets</p>
              <p className="mt-2 text-2xl font-semibold">{yesterdayTickets}</p>
            </div>
            <Headphones className="h-5 w-5 text-primary" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Yesterday chats</p>
              <p className="mt-2 text-2xl font-semibold">{yesterdayChats}</p>
            </div>
            <Users className="h-5 w-5 text-primary" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Testing notes</p>
              <p className="mt-2 text-2xl font-semibold">{yesterdayTesting}</p>
            </div>
            <FileText className="h-5 w-5 text-primary" />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardContent>
            <ManagerOverview rows={yesterdayData.rows} date={today} title="Yesterday&apos;s team activity" description="Tickets, chats, and testing notes captured for each employee." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s missing entries</CardTitle>
            <CardDescription>Employees still missing a log entry for today.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {missingEntries.length > 0 ? (
              missingEntries.map((entry) => (
                <div key={entry.employee_id} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                  <span className="text-sm font-medium">{entry.full_name}</span>
                  <Link href="/operations" className="text-sm text-primary hover:underline">
                    Log now
                  </Link>
                </div>
              ))
            ) : (
              <div className="rounded-md bg-muted px-3 py-2 text-sm">All employees have a log entry for today.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
