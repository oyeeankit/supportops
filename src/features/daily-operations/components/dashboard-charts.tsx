"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, Line, 
  BarChart, Bar, 
  XAxis, YAxis, 
  CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend 
} from "recharts";
import type { DashboardTrendData } from "../queries";

// Helper to format date string to short format (e.g. "Jul 15")
const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export function DashboardCharts({ data }: { data: DashboardTrendData[] }) {
  const chartData = data.map(d => ({
    ...d,
    formattedDate: formatDate(d.date),
  }));

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
      <SupportTrendChart data={chartData} />
      <TestingTrendChart data={chartData} />
      <AttendanceTrendChart data={chartData} />
    </div>
  );
}

function SupportTrendChart({ data }: { data: any[] }) {
  return (
    <Card className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden animate-slide-in [animation-delay:400ms]">
      <CardHeader className="bg-slate-50/40 dark:bg-slate-900/10 px-6 py-5 border-b border-border/50">
        <CardTitle className="text-base font-bold tracking-tight">Support Trend</CardTitle>
      </CardHeader>
      <CardContent className="p-6 h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
            <XAxis dataKey="formattedDate" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
              itemStyle={{ fontSize: '12px', fontWeight: 600 }}
              labelStyle={{ fontSize: '11px', color: 'var(--muted-foreground)', marginBottom: '4px' }}
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Line type="monotone" name="Tickets" dataKey="tickets" stroke="#4f46e5" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            <Line type="monotone" name="Chats" dataKey="chats" stroke="#ec4899" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function TestingTrendChart({ data }: { data: any[] }) {
  return (
    <Card className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden animate-slide-in [animation-delay:500ms]">
      <CardHeader className="bg-slate-50/40 dark:bg-slate-900/10 px-6 py-5 border-b border-border/50">
        <CardTitle className="text-base font-bold tracking-tight">Testing Trend</CardTitle>
      </CardHeader>
      <CardContent className="p-6 h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
            <XAxis dataKey="formattedDate" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
              itemStyle={{ fontSize: '12px', fontWeight: 600 }}
              labelStyle={{ fontSize: '11px', color: 'var(--muted-foreground)', marginBottom: '4px' }}
              cursor={{ fill: 'currentColor', opacity: 0.05 }}
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Bar name="Entries" dataKey="testingEntries" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            <Bar name="Bugs Found" dataKey="bugsFound" fill="#f43f5e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function AttendanceTrendChart({ data }: { data: any[] }) {
  return (
    <Card className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden animate-slide-in [animation-delay:600ms]">
      <CardHeader className="bg-slate-50/40 dark:bg-slate-900/10 px-6 py-5 border-b border-border/50">
        <CardTitle className="text-base font-bold tracking-tight">Attendance Trend</CardTitle>
      </CardHeader>
      <CardContent className="p-6 h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
            <XAxis dataKey="formattedDate" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
              itemStyle={{ fontSize: '12px', fontWeight: 600 }}
              labelStyle={{ fontSize: '11px', color: 'var(--muted-foreground)', marginBottom: '4px' }}
              cursor={{ fill: 'currentColor', opacity: 0.05 }}
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Bar name="Present" dataKey="present" stackId="a" fill="#10b981" />
            <Bar name="WFH" dataKey="wfh" stackId="a" fill="#3b82f6" />
            <Bar name="Leave" dataKey="leave" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
