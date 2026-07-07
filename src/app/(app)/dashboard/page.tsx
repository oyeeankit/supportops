import Link from "next/link";
import { Activity, BriefcaseBusiness, ClipboardList, Headphones, Home, MessageSquare, Timer, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/app-shell/page-header";
import { requireUser } from "@/lib/auth/session";
import { getDailyOperationsPageData, todayIso } from "@/features/daily-operations/queries";
import { attendanceStatusLabels } from "@/features/daily-operations/types";
import { roleLabels } from "@/lib/auth/roles";

export default async function DashboardPage() {
  const { profile } = await requireUser();
  const today = todayIso();
  const { rows, error } = await getDailyOperationsPageData(profile, today);

  const present = rows.filter((row) => row.operation?.attendance_status === "present").length;
  const wfh = rows.filter((row) => row.operation?.attendance_status === "wfh").length;
  const leave = rows.filter((row) => row.operation?.attendance_status === "leave").length;
  const tickets = rows.reduce((sum, row) => sum + (row.operation?.tickets_resolved ?? 0), 0);
  const chats = rows.reduce((sum, row) => sum + (row.operation?.chats_handled ?? 0), 0);
  const testingTasks = rows.filter((row) => row.operation?.current_testing_task).length;

  const quickLinks = [
    { href: "/team", label: "Team", icon: Users },
    { href: "/operations", label: "Operations", icon: BriefcaseBusiness },
    { href: "/qa", label: "Testing", icon: ClipboardList },
    { href: "/reports", label: "Reports", icon: Activity },
  ];

  const recentOperations = rows
    .filter((row) => row.operation)
    .slice(0, 5)
    .map((row) => ({
      name: row.full_name,
      role: roleLabels[row.role],
      status: row.operation ? attendanceStatusLabels[row.operation.attendance_status] : "Not logged",
      tickets: row.operation?.tickets_resolved ?? 0,
      chats: row.operation?.chats_handled ?? 0,
    }));

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="A simple manager view for daily team status, workload, testing focus, and recent operations."
      />

      {error ? <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Present", value: present, icon: Users },
          { label: "WFH", value: wfh, icon: Home },
          { label: "Leave", value: leave, icon: Activity },
          { label: "Tickets Today", value: tickets, icon: Headphones },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label}>
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <p className="mt-2 text-2xl font-semibold">{kpi.value}</p>
                </div>
                <Icon className="h-5 w-5 text-primary" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Team Summary</CardTitle>
            <CardDescription>Current team presence, workload, and daily focus at a glance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {rows.map((member) => (
              <div key={member.employee_id} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{member.full_name}</p>
                  <p className="text-xs text-muted-foreground">{roleLabels[member.role]}</p>
                </div>
                <Badge variant={member.operation?.attendance_status === "leave" ? "warning" : "success"}>
                  {member.operation ? attendanceStatusLabels[member.operation.attendance_status] : "Not logged"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
              <CardDescription>Jump to the main daily-management areas.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              {quickLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm hover:bg-muted">
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </span>
                    <span className="text-muted-foreground">→</span>
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Testing Tasks</CardTitle>
              <CardDescription>Employees currently tracking active testing work.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {testingTasks > 0 ? (
                <div className="rounded-md bg-muted px-3 py-2 text-sm">{testingTasks} active testing task{testingTasks === 1 ? "" : "s"} logged today.</div>
              ) : (
                <div className="rounded-md bg-muted px-3 py-2 text-sm">No active testing tasks logged yet.</div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
                <span>{chats} chats today</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Timer className="h-4 w-4" />
                <span>{testingTasks} testing task entries tracked</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recent Daily Operations</CardTitle>
            <CardDescription>Latest team updates captured for today.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentOperations.length > 0 ? recentOperations.map((operation) => (
              <div key={operation.name} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{operation.name}</p>
                  <p className="text-xs text-muted-foreground">{operation.role}</p>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p>{operation.status}</p>
                  <p>{operation.tickets} tickets · {operation.chats} chats</p>
                </div>
              </div>
            )) : <div className="rounded-md bg-muted px-3 py-2 text-sm">No daily operations logged yet.</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manager Snapshot</CardTitle>
            <CardDescription>Current login context for the daily team manager.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-md bg-muted px-3 py-2">Signed in as {profile.full_name}</div>
            <div className="rounded-md bg-muted px-3 py-2">Role: {profile.role}</div>
            <div className="rounded-md bg-muted px-3 py-2">Today: {today}</div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
