import { CalendarCheck, Coffee, Home, MessageSquare, TicketCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { TeamMemberDailyRow } from "../types";

export function OperationsKpis({ rows }: { rows: TeamMemberDailyRow[] }) {
  const present = rows.filter((row) => row.operation?.attendance_status === "present").length;
  const wfh = rows.filter((row) => row.operation?.attendance_status === "wfh").length;
  const leave = rows.filter((row) => row.operation?.attendance_status === "leave").length;
  const tickets = rows.reduce((sum, row) => sum + (row.operation?.tickets_resolved ?? 0), 0);
  const chats = rows.reduce((sum, row) => sum + (row.operation?.chats_handled ?? 0), 0);

  const items = [
    { label: "Present", value: present, icon: CalendarCheck },
    { label: "WFH", value: wfh, icon: Home },
    { label: "On Leave", value: leave, icon: Coffee },
    { label: "Tickets", value: tickets, icon: TicketCheck },
    { label: "Chats", value: chats, icon: MessageSquare },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label}>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold">{item.value}</p>
              </div>
              <Icon className="h-5 w-5 text-primary" />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
