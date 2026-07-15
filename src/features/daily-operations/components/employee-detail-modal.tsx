"use client";

import { useActionState, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveMonthlyPerformanceAdjustmentAction } from "../actions";
import { roleLabels, type AppRole } from "@/lib/auth/roles";
import { starRatingStars } from "../performance";
import type { MonthlyPerformanceMetrics, MonthlyPerformanceSummary } from "../performance";
import { EmployeeDetailPanel } from "./employee-detail-panel";

type Props = {
  employee: MonthlyPerformanceMetrics | null;
  summary: MonthlyPerformanceSummary | null;
  open: boolean;
  onClose: () => void;
  role: AppRole;
  selectedMonth: string;
};

export function EmployeeDetailModal({ employee, summary, open, onClose, role, selectedMonth }: Props) {
  const [state, formAction, pending] = useActionState(saveMonthlyPerformanceAdjustmentAction, {});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (state.message) {
      if (state.message.includes("saved") || state.saved) {
        setSuccessMessage("Adjustments saved successfully.");
        const timer = setTimeout(() => setSuccessMessage(null), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [state.message, state.saved]);

  useEffect(() => {
    if (!open) return;
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open || !employee) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="my-4 w-full max-w-[90vw] rounded-lg bg-background shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border px-6 py-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Employee Performance Details</h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{employee.full_name}</span>
              <span>{roleLabels[employee.role]}</span>
              <span>{summary?.monthLabel ?? ""}</span>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold">{employee.finalScore.toFixed(2)} / 5</p>
              <p className="text-lg">{starRatingStars[employee.starRating]}</p>
              <p className="text-sm text-muted-foreground">{employee.ratingLabel}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body — reuses existing EmployeeDetailPanel */}
        <div className="max-h-[65vh] overflow-y-auto p-6 space-y-6">
          <EmployeeDetailPanel employee={employee} />

          {role === "manager" && (
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Manager Performance Adjustments</h3>
              <form action={formAction} className="space-y-4">
                <input type="hidden" name="employee_id" value={employee.employee_id} />
                <input type="hidden" name="report_month" value={`${selectedMonth}-01`} />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="support_adjustment">Support Adjustment (-10 to +10)</Label>
                    <Input
                      id="support_adjustment"
                      name="support_adjustment"
                      type="number"
                      min="-10"
                      max="10"
                      defaultValue={employee.supportAdjustment}
                      disabled={pending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="testing_adjustment">Testing Adjustment (-10 to +10)</Label>
                    <Input
                      id="testing_adjustment"
                      name="testing_adjustment"
                      type="number"
                      min="-10"
                      max="10"
                      defaultValue={employee.testingAdjustment}
                      disabled={pending}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manager_remarks">Manager Remarks / Feedback Notes</Label>
                  <textarea
                    id="manager_remarks"
                    name="manager_remarks"
                    defaultValue={employee.managerRemarks}
                    placeholder="Enter performance feedback notes for this month..."
                    className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={pending}
                  />
                </div>

                {successMessage ? (
                  <p className="text-sm text-emerald-600 font-medium">{successMessage}</p>
                ) : state.message ? (
                  <p className="text-sm text-destructive font-medium">{state.message}</p>
                ) : null}

                <div className="flex justify-end">
                  <Button type="submit" disabled={pending}>
                    {pending ? "Saving..." : "Save Adjustments"}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
          <Button type="button" variant="outline" disabled>
            Export PDF
          </Button>
          <Button type="button" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
