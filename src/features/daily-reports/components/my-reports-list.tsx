"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, CheckCircle2, Clock, CircleDashed, ArrowRight, Calendar, Ticket, MessageSquare } from "lucide-react";
import type { DailyReportSubmission } from "../types";

export function MyReportsList({
  submissions,
  monthFilter,
}: {
  submissions: DailyReportSubmission[];
  monthFilter: string;
}) {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">My Daily Reports</h1>
          <p className="text-xs text-muted-foreground font-medium">
            View your submitted reports, drafts, and submission history.
          </p>
        </div>
        <Link href="/my-reports/new">
          <Button variant="default" className="rounded-xl shadow-md font-bold text-xs bg-emerald-600 hover:bg-emerald-700 cursor-pointer">
            <PlusCircle className="mr-1.5 h-4 w-4" /> Submit Today's Report
          </Button>
        </Link>
      </div>

      <Card className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/40 dark:bg-slate-900/10 px-6 py-4 border-b border-border/50 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-extrabold tracking-tight">Submission History</CardTitle>
          </div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {monthFilter}
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {submissions.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-muted-foreground">
                <CircleDashed className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-foreground">No reports found for this period</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Submit your daily operations and testing report to start tracking your performance.
              </p>
              <Link href="/my-reports/new">
                <Button variant="outline" className="rounded-xl text-xs font-bold mt-2">
                  Submit First Report
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/60 dark:bg-slate-900/30 text-[10px] font-black uppercase tracking-wider text-muted-foreground border-b border-border/40">
                  <tr>
                    <th className="px-6 py-3.5">Work Date</th>
                    <th className="px-6 py-3.5">Shift</th>
                    <th className="px-6 py-3.5">Tickets Closed</th>
                    <th className="px-6 py-3.5">Chats Handled</th>
                    <th className="px-6 py-3.5">Testing Work</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {submissions.map((sub) => {
                    const tickets = sub.supportLog?.tickets_handled ?? 0;
                    const chats = sub.supportLog?.chats_handled ?? 0;
                    const testingCount = sub.testingLogs?.length ?? 0;

                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                        <td className="px-6 py-4 font-extrabold text-foreground">{sub.work_date}</td>
                        <td className="px-6 py-4 text-xs font-bold capitalize text-muted-foreground">{sub.shift}</td>
                        <td className="px-6 py-4 font-semibold text-foreground">
                          <span className="flex items-center gap-1.5">
                            <Ticket className="h-3.5 w-3.5 text-indigo-500" /> {tickets}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-foreground">
                          <span className="flex items-center gap-1.5">
                            <MessageSquare className="h-3.5 w-3.5 text-pink-500" /> {chats}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-muted-foreground">
                          {testingCount > 0 ? `${testingCount} Entries` : "-"}
                        </td>
                        <td className="px-6 py-4">
                          {sub.status === "submitted" && (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50 text-[10px] font-extrabold uppercase tracking-wider">
                              ✅ Submitted
                            </Badge>
                          )}
                          {sub.status === "late" && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50 text-[10px] font-extrabold uppercase tracking-wider">
                              🟠 Late Submission
                            </Badge>
                          )}
                          {sub.status === "draft" && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50 text-[10px] font-extrabold uppercase tracking-wider">
                              🟡 Draft
                            </Badge>
                          )}
                          {sub.status === "missing" && (
                            <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50 text-[10px] font-extrabold uppercase tracking-wider">
                              🔴 Missing
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/my-reports/new?date=${sub.work_date}`}>
                            <Button variant="ghost" size="sm" className="text-xs font-bold text-primary">
                              {sub.status === "draft" ? "Continue Draft" : "View / Edit"} <ArrowRight className="h-3.5 w-3.5 ml-1" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
