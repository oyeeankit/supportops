"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable, type DataTableColumn } from "@/components/data/data-table";
import { roleLabels } from "@/lib/auth/roles";
import type { MonthlyPerformanceMetrics } from "../performance";

type Props = {
  data: MonthlyPerformanceMetrics[];
  search: string;
  setSearch: (value: string) => void;
  sort: string;
  direction: "asc" | "desc";
  onSort: (field: string) => void;
  onSelectEmployee: (employee: MonthlyPerformanceMetrics) => void;
};

export function MonthlyReportTable({ data, search, setSearch, sort, direction, onSort, onSelectEmployee }: Props) {
  const filtered = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return query
      ? data.filter((row) => row.full_name.toLowerCase().includes(query) || row.managerRemarks.toLowerCase().includes(query))
      : data;
  }, [data, search]);

  const sorted = React.useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aValue = a[sort as keyof MonthlyPerformanceMetrics];
      const bValue = b[sort as keyof MonthlyPerformanceMetrics];
      if (typeof aValue === "string" && typeof bValue === "string") {
        return direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      if (typeof aValue === "number" && typeof bValue === "number") {
        return direction === "asc" ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });
  }, [filtered, sort, direction]);

  const columns: DataTableColumn<MonthlyPerformanceMetrics>[] = [
    {
      key: "employee",
      label: "Employee",
      render: (row) => <span className="font-medium">{row.full_name}</span>,
    },
    { key: "role", label: "Role", render: (row) => roleLabels[row.role] },
    { key: "supportDays", label: "Support Days", render: (row) => row.supportDays },
    { key: "testingDays", label: "Testing Days", render: (row) => row.testingDays },
    { key: "totalTickets", label: "Total Tickets", render: (row) => row.totalTickets },
    { key: "totalChats", label: "Total Chats", render: (row) => row.totalChats },
    { key: "avgTicketsPerSupportDay", label: "Avg Tickets / Support Day", render: (row) => row.avgTicketsPerSupportDay.toFixed(1) },
    { key: "avgChatsPerSupportDay", label: "Avg Chats / Support Day", render: (row) => row.avgChatsPerSupportDay.toFixed(1) },
    { key: "totalTestingTasks", label: "Testing Tasks", render: (row) => row.totalTestingTasks },
    { key: "completedTestingTasks", label: "Completed", render: (row) => row.completedTestingTasks },
    { key: "bugsFound", label: "Bugs Found", render: (row) => row.bugsFound },
    { key: "criticalBugsFound", label: "Critical Bugs", render: (row) => row.criticalBugsFound },
    {
      key: "supportScore",
      label: "Support Score",
      render: (row) => row.role === "qa_engineer" ? <Badge variant="outline">N/A</Badge> : <Badge variant={getScoreVariant(row.supportScore)}>{row.supportScore}</Badge>,
    },
    {
      key: "testingScore",
      label: "Testing Score",
      render: (row) => <Badge variant={getScoreVariant(row.testingScore)}>{row.testingScore}</Badge>,
    },
    {
      key: "finalScore",
      label: "Final Score",
      render: (row) => <Badge variant={getScoreVariant(row.finalScore)}>{row.finalScore}</Badge>,
    },
    { key: "managerRemarks", label: "Manager Remarks", render: (row) => row.managerRemarks || "-" },
    { key: "details", label: "Details", render: (row) => <Button variant="outline" size="sm" onClick={() => onSelectEmployee(row)}>View</Button> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-80">
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search employee or remarks"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => onSort("supportScore")}>Sort by Support</Button>
          <Button variant="outline" size="sm" onClick={() => onSort("testingScore")}>Sort by Testing</Button>
          <Button variant="outline" size="sm" onClick={() => onSort("finalScore")}>Sort by Final</Button>
        </div>
      </div>

      <DataTable data={sorted} columns={columns} empty={<div className="rounded-md bg-muted px-3 py-4 text-sm">No results found.</div>} />
    </div>
  );
}

function getScoreVariant(score: number) {
  if (score >= 90) return "success";
  if (score >= 80) return "secondary";
  if (score >= 70) return "warning";
  return "danger";
}
