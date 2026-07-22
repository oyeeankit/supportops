import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TeamMemberDailyRow } from "../types";

export function TeamActivityOverview({ rows }: { rows: TeamMemberDailyRow[] }) {
  return (
    <Card className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden animate-slide-in [animation-delay:400ms]">
      <CardHeader className="bg-slate-50/40 dark:bg-slate-900/10 px-6 py-5 border-b border-border/50">
        <CardTitle className="text-base font-bold tracking-tight">Team Activity Overview</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 dark:bg-slate-900/20 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-semibold">Employee</th>
                <th className="px-6 py-3 font-semibold">Tickets</th>
                <th className="px-6 py-3 font-semibold">Chats</th>
                <th className="px-6 py-3 font-semibold">Testing Entries</th>
                <th className="px-6 py-3 font-semibold">Daily Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {rows.map((row) => (
                <tr key={row.employee_id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/10 transition-colors">
                  <td className="px-6 py-3 font-medium text-foreground">{row.full_name}</td>
                  <td className="px-6 py-3">{row.supportLog?.tickets_handled ?? "-"}</td>
                  <td className="px-6 py-3">{row.supportLog?.chats_handled ?? "-"}</td>
                  <td className="px-6 py-3">{row.testingLogs?.length || "-"}</td>
                  <td className="px-6 py-3">
                    {row.supportLog ? (
                      <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50">
                        Completed
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50">
                        Pending
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export function ActiveTestingOverview({ rows }: { rows: TeamMemberDailyRow[] }) {
  // Flatten testing logs
  const allTestingLogs = rows.flatMap((row) => 
    (row.testingLogs || []).map((log) => ({
      employeeName: row.full_name,
      app: log.application_name,
      module: log.module_name,
      testingType: log.testing_type,
    }))
  );

  return (
    <Card className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden animate-slide-in [animation-delay:500ms]">
      <CardHeader className="bg-slate-50/40 dark:bg-slate-900/10 px-6 py-5 border-b border-border/50">
        <CardTitle className="text-base font-bold tracking-tight">Active Testing Overview</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {allTestingLogs.length === 0 ? (
          <div className="p-8 text-center text-sm font-medium text-muted-foreground">
            No testing activities logged today.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/50 dark:bg-slate-900/20 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 font-semibold">Employee</th>
                  <th className="px-6 py-3 font-semibold">App</th>
                  <th className="px-6 py-3 font-semibold">Module</th>
                  <th className="px-6 py-3 font-semibold">Testing Type</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {allTestingLogs.map((log, i) => (
                  <tr key={i} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/10 transition-colors">
                    <td className="px-6 py-3 font-medium text-foreground">{log.employeeName}</td>
                    <td className="px-6 py-3">{log.app}</td>
                    <td className="px-6 py-3">{log.module || "-"}</td>
                    <td className="px-6 py-3 capitalize">{log.testingType.replace("_", " ")}</td>
                    <td className="px-6 py-3">
                      <Badge variant="outline" className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50">
                        Completed
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
