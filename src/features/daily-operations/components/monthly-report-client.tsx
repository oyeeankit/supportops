"use client";

import * as React from "react";
import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppLoading } from "@/components/feedback/app-loading";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { roleLabels, type AppRole } from "@/lib/auth/roles";
import type { MonthlyPerformanceMetrics, MonthlyPerformanceSummary } from "../performance";
import { EmployeeDetailModal } from "./employee-detail-modal";
import { MonthlyReportSummary } from "./monthly-report-summary";
import { MonthlyReportTable } from "./monthly-report-table";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 6 }, (_, index) => currentYear - 4 + index);
const months = [
  ["01", "January"], ["02", "February"], ["03", "March"], ["04", "April"],
  ["05", "May"], ["06", "June"], ["07", "July"], ["08", "August"],
  ["09", "September"], ["10", "October"], ["11", "November"], ["12", "December"],
] as const;

type Props = {
  rows: MonthlyPerformanceMetrics[];
  summary: MonthlyPerformanceSummary;
  selectedMonth: string;
  selectedYear: number;
  selectedMonthNumber: string;
  role: AppRole;
};

export function MonthlyReportClient({ rows, summary, selectedMonth, selectedYear, selectedMonthNumber, role }: Props) {
  const { startLoading } = useAppLoading();
  const [search, setSearch] = React.useState("");
  const [sort, setSort] = React.useState("finalScore");
  const [direction, setDirection] = React.useState<"asc" | "desc">("desc");
  const [selectedEmployee, setSelectedEmployee] = React.useState<MonthlyPerformanceMetrics | null>(null);

  function handleSort(field: string) {
    if (sort === field) {
      setDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSort(field);
    setDirection("desc");
  }

  function exportCsv() {
    const headers = [
      "Employee",
      "Role",
      "Support Days",
      "Testing Days",
      "Tickets",
      "Chats",
      "Testing Entries",
      "Apps Tested",
      "Bugs Found",
      "Critical Bugs",
      "Support Score (/5)",
      "Testing Score (/5)",
      "Manager Score (/5)",
      "Final Score (/5)",
      "Performance Rating",
    ];
    const csvRows = rows.map((row) => [
      row.full_name,
      roleLabels[row.role],
      row.supportDays,
      row.testingDays,
      row.totalTickets,
      row.totalChats,
      row.totalTestingEntries,
      row.appsTested,
      row.bugsFound,
      row.criticalBugsFound,
      row.supportDays === 0 ? "N/A" : row.supportScore.toFixed(2),
      row.testingDays === 0 ? "N/A" : row.testingScore.toFixed(2),
      row.managerScore.toFixed(2),
      row.finalScore.toFixed(2),
      row.ratingLabel,
    ]);
    const csv = [headers, ...csvRows]
      .map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `supportops-monthly-performance-${selectedMonth}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 lg:flex-row lg:items-end lg:justify-between">
        <form className="grid gap-3 items-end sm:grid-cols-[180px_140px_auto]" action="/reports" onSubmit={() => startLoading("Generating report...")}>
          <div className="space-y-1.5">
            <Label htmlFor="month" className="text-xs font-bold text-muted-foreground">Month</Label>
            <Select id="month" name="month" defaultValue={selectedMonthNumber} className="h-10 text-sm font-semibold">
              {months.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="year" className="text-xs font-bold text-muted-foreground">Year</Label>
            <Select id="year" name="year" defaultValue={String(selectedYear)} className="h-10 text-sm font-semibold">
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </Select>
          </div>
          <Button type="submit" className="h-10 px-5 text-sm font-extrabold cursor-pointer">Generate</Button>
        </form>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={exportCsv}>
            <Download className="h-4 w-4" /> CSV
          </Button>
          <Button type="button" variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> PDF
          </Button>
        </div>
      </div>

      <MonthlyReportSummary summary={summary} rows={rows} />

      {/* Score Weightage Breakdown Banner */}
      <div className="flex flex-wrap items-center gap-3 bg-muted/40 border border-border/80 rounded-xl px-4 py-2.5 text-xs font-semibold text-muted-foreground">
        <span className="font-extrabold text-foreground">Score Weightages:</span>
        <span className="bg-background px-2.5 py-1 rounded-lg border border-border/60 shadow-xs">
          <strong className="text-foreground">Support Engineers:</strong> 50% Support + 30% Testing + 20% Manager
        </span>
        <span className="bg-background px-2.5 py-1 rounded-lg border border-border/60 shadow-xs">
          <strong className="text-foreground">QA Engineers:</strong> 0% Support + 80% Testing + 20% Manager
        </span>
      </div>

      <MonthlyReportTable
        data={rows}
        search={search}
        setSearch={setSearch}
        sort={sort}
        direction={direction}
        onSort={handleSort}
        onSelectEmployee={(employee) => setSelectedEmployee(employee)}
      />

      {(() => {
        const currentEmployee = selectedEmployee
          ? rows.find((r) => r.employee_id === selectedEmployee.employee_id) || selectedEmployee
          : null;
        return (
          <EmployeeDetailModal
            employee={currentEmployee}
            summary={summary}
            open={selectedEmployee !== null}
            onClose={() => setSelectedEmployee(null)}
            role={role}
            selectedMonth={selectedMonth}
          />
        );
      })()}
    </div>
  );
}
