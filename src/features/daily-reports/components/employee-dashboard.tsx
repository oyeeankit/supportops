"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FilePlus,
  ClipboardCheck,
  CheckCircle2,
  Clock,
  Ticket,
  MessageSquare,
  Activity,
  ArrowRight,
  Calendar,
  Sparkles
} from "lucide-react";
import type { UserProfile } from "@/lib/auth/roles";
import type { DailyReportSubmission } from "../types";

export function EmployeeDashboard({
  profile,
  submissions,
  todayStr,
}: {
  profile: UserProfile;
  submissions: DailyReportSubmission[];
  todayStr: string;
}) {
  const currentDate = new Date();
  const dateStr = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Check if user submitted report today
  const todaySubmission = submissions.find((s) => s.work_date === todayStr);
  const isSubmittedToday = todaySubmission?.status === "submitted" || todaySubmission?.status === "late";

  // Calculate monthly stats
  const totalTickets = submissions.reduce((acc, s) => acc + (s.tickets_handled || 0), 0);
  const totalChats = submissions.reduce((acc, s) => acc + (s.chats_handled || 0), 0);
  const totalSubmissions = submissions.filter((s) => s.status === "submitted" || s.status === "late").length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans">
      {/* 1. Header & Primary CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Good Morning, {profile.full_name.split(" ")[0]} 👋
          </h1>
          <p className="text-xs font-semibold text-muted-foreground mt-0.5">
            {dateStr} • {profile.role.replace("_", " ").toUpperCase()} PORTAL
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/my-reports/new">
            <Button variant="default" size="sm" className="rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-sm">
              <FilePlus className="mr-1.5 h-3.5 w-3.5" /> Submit Today's Report
            </Button>
          </Link>
          <Link href="/my-reports">
            <Button variant="outline" size="sm" className="rounded-xl font-bold text-xs cursor-pointer">
              <ClipboardCheck className="mr-1.5 h-3.5 w-3.5" /> My History
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Today's Status Banner */}
      <Card className={`rounded-xl border p-4 shadow-sm ${
        isSubmittedToday
          ? "border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-900/50"
          : "border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900/50"
      }`}>
        <CardContent className="p-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isSubmittedToday ? (
              <div className="p-2 rounded-xl bg-emerald-500 text-white">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-amber-500 text-white">
                <Clock className="h-5 w-5" />
              </div>
            )}
            <div>
              <p className="text-sm font-extrabold text-foreground">
                {isSubmittedToday ? "Report Submitted for Today" : "Today's Daily Report Pending"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isSubmittedToday
                  ? `Logged ${todaySubmission?.tickets_handled || 0} tickets, ${todaySubmission?.chats_handled || 0} chats.`
                  : "Please submit your daily log before your shift ends (takes < 2 minutes)."}
              </p>
            </div>
          </div>

          {!isSubmittedToday && (
            <Link href="/my-reports/new">
              <Button size="sm" className="rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white cursor-pointer">
                Complete Report Now <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>

      {/* 3. Monthly Operational Output KPIs */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <CardContent className="p-0 flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-foreground">{totalSubmissions}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">Reports Submitted This Month</p>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
              <ClipboardCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <CardContent className="p-0 flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-foreground">{totalTickets}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">Tickets Solved This Month</p>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
              <Ticket className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <CardContent className="p-0 flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-foreground">{totalChats}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">Chats Handled This Month</p>
            </div>
            <div className="p-2.5 rounded-xl bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400">
              <MessageSquare className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Recent Submission History Table */}
      <Card className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/20 px-6 py-4 border-b border-border flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-extrabold tracking-tight">My Recent Submissions</CardTitle>
            <CardDescription className="text-xs">Your personal daily report history for this month.</CardDescription>
          </div>
          <Link href="/my-reports" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            View All Reports <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {submissions.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground font-medium">
              No reports submitted yet this month. Click <strong>Submit Today's Report</strong> above to get started!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/60 dark:bg-slate-900/30 text-[10px] font-black uppercase tracking-wider text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-6 py-3">Work Date</th>
                    <th className="px-6 py-3">Tickets Closed</th>
                    <th className="px-6 py-3">Chats Handled</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {submissions.slice(0, 5).map((report) => (
                    <tr key={report.id || report.work_date} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                      <td className="px-6 py-3.5 font-extrabold text-foreground text-xs flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        {report.work_date}
                      </td>
                      <td className="px-6 py-3.5 text-xs font-semibold">
                        {report.tickets_handled ?? 0}
                      </td>
                      <td className="px-6 py-3.5 text-xs font-semibold">
                        {report.chats_handled ?? 0}
                      </td>
                      <td className="px-6 py-3.5">
                        {report.status === "submitted" && (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] font-extrabold uppercase">
                            Submitted
                          </Badge>
                        )}
                        {report.status === "late" && (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 text-[10px] font-extrabold uppercase">
                            Late
                          </Badge>
                        )}
                        {report.status === "draft" && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 text-[10px] font-extrabold uppercase">
                            Draft
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <Link href="/my-reports">
                          <Button variant="ghost" size="sm" className="text-xs font-bold text-primary">
                            View <ArrowRight className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
