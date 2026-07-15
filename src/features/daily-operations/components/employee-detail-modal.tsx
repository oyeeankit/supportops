"use client";

import { useActionState, useEffect, useState } from "react";
import { X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveMonthlyPerformanceAdjustmentAction } from "../actions";
import { roleLabels, type AppRole } from "@/lib/auth/roles";
import { starRatingStars } from "../performance";
import type { MonthlyPerformanceMetrics, MonthlyPerformanceSummary } from "../performance";
import { EmployeeDetailPanel } from "./employee-detail-panel";
import { cn } from "@/lib/utils/cn";

type Props = {
  employee: MonthlyPerformanceMetrics | null;
  summary: MonthlyPerformanceSummary | null;
  open: boolean;
  onClose: () => void;
  role: AppRole;
  selectedMonth: string;
};

function RatingStars({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (val: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange(star)}
          className="group rounded-md focus:outline-none transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Star
            className={cn(
              "h-5 w-5 transition-colors duration-150 cursor-pointer",
              star <= value 
                ? "fill-yellow-400 text-yellow-400 group-hover:fill-yellow-500 group-hover:text-yellow-500" 
                : "text-muted-foreground hover:text-foreground"
            )}
          />
        </button>
      ))}
    </div>
  );
}

export function EmployeeDetailModal({ employee, summary, open, onClose, role, selectedMonth }: Props) {
  const [state, formAction, pending] = useActionState(saveMonthlyPerformanceAdjustmentAction, {});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Parse manager remarks & ratings
  const initialRemarks = employee?.managerRemarks || "";
  let initialRemarksText = initialRemarks;
  let initialBehaviour = employee?.behaviorRating ?? 3;
  let initialCommunication = employee?.communicationRating ?? 3;
  let initialOwnership = employee?.ownershipRating ?? 3;
  let initialDiscipline = employee?.disciplineRating ?? 3;

  if (initialRemarks && initialRemarks.startsWith("{\"ratings\":")) {
    try {
      const parsedJSON = JSON.parse(initialRemarks);
      if (parsedJSON && typeof parsedJSON === "object" && parsedJSON.ratings) {
        initialRemarksText = parsedJSON.remarks ?? "";
        initialBehaviour = parsedJSON.ratings.behaviour ?? initialBehaviour;
        initialCommunication = parsedJSON.ratings.communication ?? initialCommunication;
        initialOwnership = parsedJSON.ratings.ownership ?? initialOwnership;
        initialDiscipline = parsedJSON.ratings.discipline ?? initialDiscipline;
      }
    } catch {
      // not JSON, fallback
    }
  }

  const [behaviour, setBehaviour] = useState(initialBehaviour);
  const [communication, setCommunication] = useState(initialCommunication);
  const [ownership, setOwnership] = useState(initialOwnership);
  const [discipline, setDiscipline] = useState(initialDiscipline);
  const [managerPoints, setManagerPoints] = useState(employee?.managerPoints || 0);
  const [remarks, setRemarks] = useState(initialRemarksText);

  // Sync state when active employee profile switches
  useEffect(() => {
    if (employee) {
      let rText = employee.managerRemarks || "";
      let b = employee.behaviorRating ?? 3;
      let c = employee.communicationRating ?? 3;
      let o = employee.ownershipRating ?? 3;
      let d = employee.disciplineRating ?? 3;
      if (employee.managerRemarks && employee.managerRemarks.startsWith("{\"ratings\":")) {
        try {
          const parsedJSON = JSON.parse(employee.managerRemarks);
          if (parsedJSON && typeof parsedJSON === "object" && parsedJSON.ratings) {
            rText = parsedJSON.remarks ?? "";
            b = parsedJSON.ratings.behaviour ?? b;
            c = parsedJSON.ratings.communication ?? c;
            o = parsedJSON.ratings.ownership ?? o;
            d = parsedJSON.ratings.discipline ?? d;
          }
        } catch {}
      }
      setBehaviour(b);
      setCommunication(c);
      setOwnership(o);
      setDiscipline(d);
      setManagerPoints(employee.managerPoints || 0);
      setRemarks(rText);
    }
  }, [employee]);

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
              <h3 className="text-lg font-semibold mb-4 text-foreground">Manager Monthly Evaluation</h3>
              <form action={formAction} className="space-y-4">
                <input type="hidden" name="employee_id" value={employee.employee_id} />
                <input type="hidden" name="report_month" value={`${selectedMonth}-01`} />
                <input type="hidden" name="behavior_rating" value={behaviour} />
                <input type="hidden" name="communication_rating" value={communication} />
                <input type="hidden" name="ownership_rating" value={ownership} />
                <input type="hidden" name="discipline_rating" value={discipline} />
                <input type="hidden" name="manager_points" value={managerPoints} />
                {/* @deprecated - support_adjustment kept for database trigger/legacy compatibility */}
                <input type="hidden" name="support_adjustment" value={managerPoints} />
                {/* @deprecated - testing_adjustment kept for database trigger/legacy compatibility */}
                <input type="hidden" name="testing_adjustment" value="0" />

                {/* Star Ratings Grid */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Team Behaviour Rating</Label>
                    <RatingStars value={behaviour} onChange={setBehaviour} disabled={pending} />
                  </div>
                  <div className="space-y-2">
                    <Label>Communication Rating</Label>
                    <RatingStars value={communication} onChange={setCommunication} disabled={pending} />
                  </div>
                  <div className="space-y-2">
                    <Label>Ownership Rating</Label>
                    <RatingStars value={ownership} onChange={setOwnership} disabled={pending} />
                  </div>
                  <div className="space-y-2">
                    <Label>Discipline Rating</Label>
                    <RatingStars value={discipline} onChange={setDiscipline} disabled={pending} />
                  </div>
                </div>

                {/* Manager Points input */}
                <div className="space-y-2">
                  <Label htmlFor="support_adjustment_view">Overall Manager Points (-10 to +10)</Label>
                  <Input
                    id="support_adjustment_view"
                    type="number"
                    min="-10"
                    max="10"
                    value={managerPoints}
                    onChange={(e) => setManagerPoints(Number(e.target.value))}
                    disabled={pending}
                  />
                  <p className="text-xs text-muted-foreground">
                    Award reward points or deduct penalty points based on overall monthly behavior.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="remarks_view">Manager Remarks / Feedback Notes</Label>
                  <textarea
                    id="remarks_view"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
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
                    {pending ? "Saving..." : "Save Evaluation"}
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
