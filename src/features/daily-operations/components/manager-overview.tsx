import { roleLabels } from "@/lib/auth/roles";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/data/data-table";
import { EmptyState } from "@/components/feedback/empty-state";
import { attendanceStatusLabels, shiftLabelsFallback, workFocusLabels, type TeamMemberDailyRow } from "./overview-helpers";

export function ManagerOverview({ rows, date }: { rows: TeamMemberDailyRow[]; date: string }) {
  const columns: DataTableColumn<TeamMemberDailyRow>[] = [
    {
      key: "employee",
      label: "Employee",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.full_name} src={row.avatar_url} />
          <div>
            <p className="font-medium">{row.full_name}</p>
            <p className="text-xs text-muted-foreground">{row.email}</p>
          </div>
        </div>
      ),
    },
    { key: "role", label: "Role", render: (row) => roleLabels[row.role] },
    { key: "shift", label: "Shift", render: (row) => shiftLabelsFallback[row.shift] },
    {
      key: "attendance",
      label: "Employee Status",
      render: (row) =>
        row.operation ? (
          <Badge variant={row.operation.attendance_status === "leave" ? "warning" : "success"}>
            {attendanceStatusLabels[row.operation.attendance_status]}
          </Badge>
        ) : (
          <Badge variant="outline">Not logged</Badge>
        ),
    },
    { key: "tickets", label: "Tickets", render: (row) => row.operation?.tickets_resolved ?? 0 },
    { key: "chats", label: "Chats", render: (row) => row.operation?.chats_handled ?? 0 },
    {
      key: "focus",
      label: "Focus",
      render: (row) => (row.operation ? workFocusLabels[row.operation.work_focus] : "Not logged"),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s team overview</CardTitle>
        <CardDescription>Manager view for {date}: attendance, workload, and current focus.</CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          data={rows}
          columns={columns}
          empty={<EmptyState title="No active employees" description="Add active employees before recording daily operations." />}
        />
      </CardContent>
    </Card>
  );
}
