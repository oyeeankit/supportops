"use client";

import * as React from "react";
import { Download, Printer } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { useAppLoading } from "@/components/feedback/app-loading";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { roleLabels } from "@/lib/auth/roles";
import { saveMonthlyPerformanceAdjustmentAction, type DailyOperationActionState } from "../actions";
import type { MonthlyPerformanceMetrics, MonthlyPerformanceSummary } from "../performance";
import { EmployeeDetailPanel } from "./employee-detail-panel";
import { MonthlyReportSummary } from "./monthly-report-summary";
import { MonthlyReportTable } from "./monthly-report-table";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 6 }, (_, index) => currentYear - 4 + index);
const months = [
  ["01", "January"],
  ["02", "February"],
  ["03", "March"],
  ["04", "April"],
  ["05", "May"],
  ["06", "June"],
  ["07", "July"],
  ["08", "August"],
  ["09", "September"],
  ["10", "October"],
  ["11", "November"],
  ["12", "December"],
] as const;

type Props = {
  rows: MonthlyPerformanceMetrics[];
  summary: MonthlyPerformanceSummary;
  selectedMonth: string;
  selectedYear: number;
  selectedMonthNumber: string;
};

export function MonthlyReportClient({ rows, summary, selectedMonth, selectedYear, selectedMonthNumber }: Props) {
  const { startLoading } = useAppLoading();
  const [search, setSearch] = React.useState("");
  const [sort, setSort] = React.useState("finalScore");
  const [direction, setDirection] = React.useState<"asc" | "desc">("desc");
  const [selectedEmployeeId, setSelectedEmployeeId] = React.useState("");
  const selectedEmployee = rows.find((row) => row.employee_id === selectedEmployeeId) ?? rows[0] ?? null;

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
      "Average Tickets per Support Day",
      "Average Chats per Support Day",
      "Testing Tasks",
      "Completed Testing Tasks",
      "Bugs Found",
      "Critical Bugs Found",
      "Support Score",
      "Testing Score",
      "Final Score",
      "Manager Remarks",
    ];
    const csvRows = rows.map((row) => [
      row.full_name,
      roleLabels[row.role],
      row.supportDays,
      row.testingDays,
      row.totalTickets,
      row.totalChats,
      row.avgTicketsPerSupportDay,
      row.avgChatsPerSupportDay,
      row.totalTestingTasks,
      row.completedTestingTasks,
      row.bugsFound,
      row.criticalBugsFound,
      row.role === "qa_engineer" ? "N/A" : row.supportScore,
      row.testingScore,
      row.finalScore,
      row.managerRemarks,
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
        <form className="grid gap-3 sm:grid-cols-[160px_120px_auto]" action="/reports" onSubmit={() => startLoading("Generating report...")}>
          <div className="space-y-2">
            <Label htmlFor="month">Month</Label>
            <Select id="month" name="month" defaultValue={selectedMonthNumber}>
              {months.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Select id="year" name="year" defaultValue={String(selectedYear)}>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Select>
          </div>
          <Button type="submit">Generate</Button>
        </form>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={exportCsv}>
            <Download className="h-4 w-4" />
            CSV
          </Button>
          <Button type="button" variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      <MonthlyReportSummary summary={summary} />

      <MonthlyReportTable
        data={rows}
        search={search}
        setSearch={setSearch}
        sort={sort}
        direction={direction}
        onSort={handleSort}
        onSelectEmployee={(employee) => setSelectedEmployeeId(employee.employee_id)}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <EmployeeDetailPanel employee={selectedEmployee} />
        <AdjustmentForm employee={selectedEmployee} reportMonth={`${selectedMonth}-01`} />
      </div>
    </div>
  );
}

function AdjustmentForm({ employee, reportMonth }: { employee: MonthlyPerformanceMetrics | null; reportMonth: string }) {
  const router = useRouter();
  const { startLoading, stopLoading } = useAppLoading();
  const [state, action, pending] = useActionState<DailyOperationActionState, FormData>(async (_, formData) => {
    const result = await saveMonthlyPerformanceAdjustmentAction(_, formData);
    router.refresh();
    return result;
  }, {});

  React.useEffect(() => {
    if (pending) {
      startLoading("Saving adjustment...");
      return;
    }

    stopLoading();
  }, [pending, startLoading, stopLoading]);

  if (!employee) {
    return null;
  }
  const isQaEngineer = employee.role === "qa_engineer";

  return (
    <form action={action} className="space-y-4 rounded-lg border border-border bg-card p-5">
      <div>
        <h2 className="text-base font-semibold">Manager Adjustment</h2>
        <p className="text-sm text-muted-foreground">{employee.full_name}</p>
      </div>
      <input type="hidden" name="employee_id" value={employee.employee_id} />
      <input type="hidden" name="report_month" value={reportMonth} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
        {isQaEngineer ? (
          <input type="hidden" name="support_adjustment" value="0" />
        ) : (
          <div className="space-y-2">
            <Label htmlFor="support_adjustment">Support adjustment</Label>
            <Input id="support_adjustment" name="support_adjustment" type="number" min={-10} max={10} defaultValue={employee.managerAdjustmentSupport} />
            {state.fieldErrors?.support_adjustment ? <p className="text-sm text-destructive">{state.fieldErrors.support_adjustment[0]}</p> : null}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="testing_adjustment">Testing adjustment</Label>
          <Input id="testing_adjustment" name="testing_adjustment" type="number" min={-10} max={10} defaultValue={employee.managerAdjustmentTesting} />
          {state.fieldErrors?.testing_adjustment ? <p className="text-sm text-destructive">{state.fieldErrors.testing_adjustment[0]}</p> : null}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="manager_remarks">Manager remarks</Label>
        <textarea
          id="manager_remarks"
          name="manager_remarks"
          defaultValue={employee.managerRemarks}
          className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {state.fieldErrors?.manager_remarks ? <p className="text-sm text-destructive">{state.fieldErrors.manager_remarks[0]}</p> : null}
      </div>
      {state.message ? <p className="text-sm text-muted-foreground">{state.message}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save Adjustment"}
      </Button>
    </form>
  );
}
