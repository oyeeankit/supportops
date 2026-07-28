import { roleLabels } from "@/lib/auth/roles";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/data/data-table";
import { EmptyState } from "@/components/feedback/empty-state";
import { attendanceStatusLabels, shiftLabelsFallback, type TeamMemberDailyRow } from "./overview-helpers";

export function ManagerOverview({
  rows,
  date,
  showDate = false,
  title = "Today's team overview",
  description = `Manager view for ${date}: attendance, workload, and current focus.`,
}: {
  rows: TeamMemberDailyRow[];
  date: string;
  showDate?: boolean;
  title?: string;
  description?: string;
}) {
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
    { key: "shift", label: "Shift", render: (row) => shiftLabelsFallback[row.shift as keyof typeof shiftLabelsFallback] || row.shift },
    {
      key: "attendance",
      label: "Employee Status",
      render: (row) =>
        row.supportLog ? (
          <Badge variant={row.supportLog.attendance_status === "leave" ? "warning" : "success"}>
            {attendanceStatusLabels[row.supportLog.attendance_status]}
          </Badge>
        ) : (
          <Badge variant="outline">Not logged</Badge>
        ),
    },
    { key: "tickets", label: "Tickets", render: (row) => row.supportLog?.tickets_handled ?? 0 },
    { key: "chats", label: "Chats", render: (row) => row.supportLog?.chats_handled ?? 0 },
    {
      key: "testing",
      label: "Testing",
      render: (row) => {
        const tasks = row.testingLogs.filter((log) => log.application_name.trim() || log.module_name.trim());
        return tasks.length > 0 ? `${tasks.length} task${tasks.length > 1 ? "s" : ""}` : "—";
      },
    },
  ];

  if (showDate) {
    columns.splice(3, 0, {
      key: "activity_date",
      label: "Date",
      render: (row) => row.supportLog?.log_date ?? row.testingLogs[0]?.log_date ?? date,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
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
