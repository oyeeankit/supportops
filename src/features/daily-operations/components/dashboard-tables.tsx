import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, ArrowRight, ShieldCheck, Bug } from "lucide-react";
import type { TeamMemberDailyRow } from "../types";

export function ActiveTestingOverview({ rows }: { rows: TeamMemberDailyRow[] }) {
  // Flatten testing logs
  const allTestingLogs = rows.flatMap((row) =>
    (row.testingLogs || []).map((log) => ({
      id: log.id,
      employeeName: row.full_name,
      app: log.application_name,
      module: log.module_name,
      testingType: log.testing_type,
      status: log.status,
      bugsFound: log.bugs_found,
      criticalBug: log.critical_bug,
    }))
  );

  return (
    <Card className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden animate-slide-in">
      <CardHeader className="bg-slate-50/40 dark:bg-slate-900/10 px-6 py-4 border-b border-border/50 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-extrabold tracking-tight flex items-center gap-2">
            <Activity className="h-4 w-4 text-violet-500" /> Active Testing Overview
          </CardTitle>
          <CardDescription className="text-xs mt-0.5">Current test execution and coverage</CardDescription>
        </div>
        <Link
          href="/operations"
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          View Testing Logs <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {allTestingLogs.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center space-y-2">
            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-muted-foreground">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-foreground">No testing activity today</p>
            <p className="text-xs text-muted-foreground">
              Testing logs submitted by QA or support engineers will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/60 dark:bg-slate-900/30 text-[10px] font-black uppercase tracking-wider text-muted-foreground border-b border-border/40">
                <tr>
                  <th className="px-6 py-3">Employee</th>
                  <th className="px-6 py-3">App</th>
                  <th className="px-6 py-3">Module</th>
                  <th className="px-6 py-3">Testing Type</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {allTestingLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-foreground">{log.employeeName}</td>
                    <td className="px-6 py-3.5 font-semibold text-foreground/90">{log.app}</td>
                    <td className="px-6 py-3.5 text-xs text-muted-foreground font-medium">{log.module || "-"}</td>
                    <td className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {log.testingType.replace("_", " ")}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            log.status === "completed"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50 text-[10px] font-extrabold uppercase tracking-wider"
                              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50 text-[10px] font-extrabold uppercase tracking-wider"
                          }
                        >
                          {log.status.replace("_", " ")}
                        </Badge>
                        {log.criticalBug && (
                          <Badge className="bg-rose-600 text-white text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5">
                            Critical Bug
                          </Badge>
                        )}
                      </div>
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
