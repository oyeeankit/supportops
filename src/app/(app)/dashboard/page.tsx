import { Activity, CalendarDays, CheckCircle2, ClipboardList, Headphones, Home, Timer, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/app-shell/page-header";
import { requireUser } from "@/lib/auth/session";

const kpis = [
  { label: "Present Today", value: "0", icon: Users, tone: "text-emerald-600" },
  { label: "On Leave", value: "0", icon: CalendarDays, tone: "text-amber-600" },
  { label: "WFH", value: "0", icon: Home, tone: "text-sky-600" },
  { label: "Tickets Today", value: "0", icon: Headphones, tone: "text-blue-600" },
  { label: "Chats Today", value: "0", icon: Activity, tone: "text-indigo-600" },
  { label: "Testing Pending", value: "0", icon: Timer, tone: "text-orange-600" },
  { label: "Testing Completed", value: "0", icon: CheckCircle2, tone: "text-emerald-600" },
  { label: "Monthly Goals", value: "0%", icon: ClipboardList, tone: "text-violet-600" },
];

const team = [
  { name: "Lalit", role: "Support Engineer" },
  { name: "Rupali", role: "Support Engineer" },
  { name: "Prathmesh", role: "Support Engineer" },
  { name: "Gaurav", role: "Support Engineer" },
  { name: "Shivam", role: "QA Engineer" },
];

export default async function DashboardPage() {
  const { profile } = await requireUser();

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Daily team visibility for employee status, support work, QA tasks, and simple performance context."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label}>
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <p className="mt-2 text-2xl font-semibold">{kpi.value}</p>
                </div>
                <Icon className={`h-5 w-5 ${kpi.tone}`} />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Team</CardTitle>
            <CardDescription>
              Foundation view for employee status, support work, and daily assignment context.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {team.map((member) => (
              <div
                key={member.name}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
                <Badge variant="outline">Not recorded</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Foundation Status</CardTitle>
            <CardDescription>
              Module 1 establishes the secure product shell before feature data entry begins.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-md bg-muted px-3 py-2">Signed in as {profile.full_name}</div>
            <div className="rounded-md bg-muted px-3 py-2">Role: {profile.role}</div>
            <div className="rounded-md bg-muted px-3 py-2">Auth: Supabase session protected</div>
            <div className="rounded-md bg-muted px-3 py-2">Scoring: role-specific by design</div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
