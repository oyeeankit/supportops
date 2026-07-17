import { CalendarCheck, Coffee, Home, MessageSquare, TicketCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { TeamMemberDailyRow } from "../types";

export function OperationsKpis({ rows }: { rows: TeamMemberDailyRow[] }) {
  const present = rows.filter((row) => row.supportLog?.attendance_status === "present").length;
  const wfh = rows.filter((row) => row.supportLog?.attendance_status === "wfh").length;
  const leave = rows.filter((row) => row.supportLog?.attendance_status === "leave").length;
  const tickets = rows.reduce((sum, row) => sum + (row.supportLog?.tickets_handled ?? 0), 0);
  const chats = rows.reduce((sum, row) => sum + (row.supportLog?.chats_handled ?? 0), 0);

  const items = [
    { label: "Present", value: present, icon: CalendarCheck, color: "emerald", iconClass: "text-emerald-600 dark:text-emerald-400", bgClass: "bg-emerald-50 dark:bg-emerald-950/40" },
    { label: "WFH", value: wfh, icon: Home, color: "blue", iconClass: "text-blue-600 dark:text-blue-400", bgClass: "bg-blue-50 dark:bg-blue-950/40" },
    { label: "On Leave", value: leave, icon: Coffee, color: "amber", iconClass: "text-amber-600 dark:text-amber-400", bgClass: "bg-amber-50 dark:bg-amber-950/40" },
    { label: "Tickets", value: tickets, icon: TicketCheck, color: "purple", iconClass: "text-purple-600 dark:text-purple-400", bgClass: "bg-purple-50 dark:bg-purple-950/40" },
    { label: "Chats", value: chats, icon: MessageSquare, color: "indigo", iconClass: "text-indigo-600 dark:text-indigo-400", bgClass: "bg-indigo-50 dark:bg-indigo-950/40" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label} className="rounded-2xl border border-border/60 hover:-translate-y-1 hover:shadow-md transition-all duration-300 shadow-sm bg-card overflow-hidden">
            <CardContent className="flex items-center justify-between p-5">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{item.label}</p>
                <p className="text-2xl font-extrabold tracking-tight text-foreground">{item.value}</p>
              </div>
              <div className={`p-2.5 rounded-xl shadow-sm ${item.bgClass} ${item.iconClass}`}>
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
