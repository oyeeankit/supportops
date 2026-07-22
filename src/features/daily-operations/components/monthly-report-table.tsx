"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable, type DataTableColumn } from "@/components/data/data-table";
import { canManageSupport, canManageTesting, roleLabels } from "@/lib/auth/roles";
import { getScoreBadgeVariant, starRatingStars, getStarRating } from "../performance";
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
      ? data.filter((row) => row.full_name.toLowerCase().includes(query))
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
    { key: "employee", label: "Employee", render: (row) => <span className="font-medium">{row.full_name}</span> },
    { key: "role", label: "Role", render: (row) => roleLabels[row.role] },
    { key: "workingDays", label: "Working Days", render: (row) => row.workingDays ?? 0 },
    { key: "supportDays", label: "Support Days", render: (row) => !canManageSupport(row.role) ? <span className="text-muted-foreground">-</span> : row.supportDays },
    { key: "testingDays", label: "Testing Days", render: (row) => !canManageTesting(row.role) ? <span className="text-muted-foreground">-</span> : row.testingDays },
    { key: "tickets", label: "Tickets", render: (row) => !canManageSupport(row.role) ? <span className="text-muted-foreground">-</span> : row.totalTickets },
    { key: "chats", label: "Chats", render: (row) => !canManageSupport(row.role) ? <span className="text-muted-foreground">-</span> : row.totalChats },
    { key: "testingTasks", label: "Testing Tasks", render: (row) => !canManageTesting(row.role) ? <span className="text-muted-foreground">-</span> : row.totalTestingEntries },
    {
      key: "testingQuality",
      label: "Testing Quality",
      render: (row) => !canManageTesting(row.role) ? (
        <span className="text-muted-foreground">-</span>
      ) : row.testingDays === 0 ? (
        <Badge variant="outline">N/A</Badge>
      ) : (
        <span>{starRatingStars[getStarRating(row.testingScore).rating]}</span>
      ),
    },
    {
      key: "supportScore",
      label: "Support Score",
      render: (row) => !canManageSupport(row.role) ? (
        <span className="text-muted-foreground">-</span>
      ) : row.supportDays === 0 ? (
        <Badge variant="outline">N/A</Badge>
      ) : (
        <Badge variant={getScoreBadgeVariant(row.supportScore)}>{row.supportScore.toFixed(2)}</Badge>
      ),
    },
    {
      key: "testingScore",
      label: "Testing Score",
      render: (row) => !canManageTesting(row.role) ? (
        <span className="text-muted-foreground">-</span>
      ) : row.testingDays === 0 ? (
        <Badge variant="outline">N/A</Badge>
      ) : (
        <Badge variant={getScoreBadgeVariant(row.testingScore)}>{row.testingScore.toFixed(2)}</Badge>
      ),
    },
    {
      key: "managerScore",
      label: "Manager Score",
      render: (row) => (
        <Badge variant={getScoreBadgeVariant(row.managerScore)}>{row.managerScore.toFixed(2)}</Badge>
      ),
    },
    {
      key: "finalScore",
      label: "Final Score",
      render: (row) => (
        <span className="font-semibold" title={row.ratingLabel}>
          {row.finalScore.toFixed(2)}
        </span>
      ),
    },
    { key: "ratingLabel", label: "Rating", render: (row) => row.ratingLabel },
    { key: "details", label: "", render: (row) => <Button variant="outline" size="sm" onClick={() => onSelectEmployee(row)}>View</Button> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-80">
          <Input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employee" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => onSort("finalScore")}>Sort by Final</Button>
          <Button variant="outline" size="sm" onClick={() => onSort("managerScore")}>Sort by Manager Score</Button>
        </div>
      </div>
      <DataTable data={sorted} columns={columns} empty={<div className="rounded-md bg-muted px-3 py-4 text-sm">No results found.</div>} />
    </div>
  );
}
