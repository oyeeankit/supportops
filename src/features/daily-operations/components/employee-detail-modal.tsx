"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { roleLabels } from "@/lib/auth/roles";
import { starRatingStars } from "../performance";
import type { MonthlyPerformanceMetrics, MonthlyPerformanceSummary } from "../performance";
import { EmployeeDetailPanel } from "./employee-detail-panel";

type Props = {
  employee: MonthlyPerformanceMetrics | null;
  summary: MonthlyPerformanceSummary | null;
  open: boolean;
  onClose: () => void;
};

export function EmployeeDetailModal({ employee, summary, open, onClose }: Props) {
  React.useEffect(() => {
    if (!open) return;
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  React.useEffect(() => {
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
        <div className="max-h-[65vh] overflow-y-auto p-6">
          <EmployeeDetailPanel employee={employee} />
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
