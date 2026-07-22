"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { canManageSupport, canManageTesting, roleLabels } from "@/lib/auth/roles";
import { getScoreBadgeVariant, starRatingStars, getStarRating } from "../performance";
import type { MonthlyPerformanceMetrics } from "../performance";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function EmployeeDetailPanel({ employee }: { employee: MonthlyPerformanceMetrics | null }) {
  const metrics = useMemo(() => employee, [employee]);

  if (!metrics) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
        Select an employee to view the monthly summary.
      </div>
    );
  }

  const showSupport = canManageSupport(metrics.role);
  const showTesting = canManageTesting(metrics.role);

  // Use pre-normalized ratings from queries
  const remarks = metrics.managerRemarks;
  const initiative = metrics.initiativeRating;
  const communication = metrics.communicationRating;
  const ownership = metrics.ownershipRating;
  const discipline = metrics.disciplineRating;

  return (
    <div className="space-y-6">
      {/* 1. Summary Card */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-base font-semibold mb-4 text-muted-foreground uppercase tracking-wider">Summary Card</h3>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <Detail label="Employee Name" value={metrics.full_name} />
          <Detail label="Role" value={roleLabels[metrics.role]} />
          <Detail label="Working Days" value={metrics.workingDays ?? 0} />
          {showSupport && <Detail label="Support Days" value={metrics.supportDays} />}
          {showTesting && <Detail label="Testing Days" value={metrics.testingDays} />}
        </div>
      </div>

      {/* 2. Support Performance (Only if Support Engineer / Manager) */}
      {showSupport && (
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-base font-semibold mb-4 text-muted-foreground uppercase tracking-wider">Support Performance</h3>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <Detail label="Total Tickets Resolved" value={metrics.totalTickets} />
            <Detail label="Total Chats Handled" value={metrics.totalChats} />
            <Detail label="Average Support Quality" value={metrics.supportScore === 0 ? "N/A" : `${metrics.supportScore.toFixed(2)} / 5`} />
            <Detail label="Documentation Updates" value={metrics.docUpdates} />
            <Detail label="Feature Suggestions" value={metrics.featureSuggestions} />
            <Detail label="Bug Verifications" value={metrics.bugVerifications} />
            <Detail label="Asked For Review" value={metrics.askedForReviews} />
            <Detail label="Got Review" value={metrics.gotReviews} />
            <Detail label="Other Contributions" value={metrics.otherContributions} />
          </div>
        </div>
      )}

      {/* 3. Testing Performance (If QA / Support) */}
      {showTesting && (
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-base font-semibold mb-4 text-muted-foreground uppercase tracking-wider">Testing Performance</h3>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <Detail label="Total Testing Tasks" value={metrics.totalTestingEntries} />
            <Detail label="Testing Apps Covered" value={metrics.appsTested} />
            <Detail label="Total Bugs Found" value={metrics.bugsFound} />
            <Detail label="Average Testing Quality" value={metrics.testingDays === 0 ? "N/A" : starRatingStars[getStarRating(metrics.testingScore).rating]} />
            <Detail label="Total Testing Hours" value="N/A" />
          </div>
        </div>
      )}

      {/* 4. Overall Performance */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-base font-semibold mb-4 text-muted-foreground uppercase tracking-wider">Overall Performance</h3>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {showSupport && <ScoreCard label="Support Score" score={metrics.supportScore} na={metrics.supportDays === 0} />}
          {showTesting && <ScoreCard label="Testing Score" score={metrics.testingScore} na={metrics.testingDays === 0} />}
          <ScoreCard label="Manager Eval" score={metrics.managerScore} />
          <ScoreCard label="Final Score" score={metrics.finalScore} />
          <div className="rounded-lg border border-border bg-background p-4 md:col-span-4">
            <p className="text-sm text-muted-foreground font-medium">Performance Rating</p>
            <p className="mt-2 text-lg font-semibold">{metrics.ratingLabel}</p>
          </div>
        </div>
      </div>

      {/* 5. Manager Evaluation */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-base font-semibold mb-4 text-muted-foreground uppercase tracking-wider">Manager Evaluation</h3>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <RatingDisplay label="Initiative" value={initiative} />
            <RatingDisplay label="Communication" value={communication} />
            <RatingDisplay label="Ownership" value={ownership} />
            <RatingDisplay label="Discipline" value={discipline} />
          </div>
          <div className="grid gap-4 md:grid-cols-1">
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-sm text-muted-foreground font-medium">Manager Remarks</p>
              <p className="mt-2 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {remarks || <span className="text-muted-foreground italic">No feedback remarks entered.</span>}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <p className="text-sm text-muted-foreground font-medium">{label}</p>
      <p className="mt-1.5 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}

function ScoreCard({ label, score, na = false }: { label: string; score: number; na?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <p className="text-sm text-muted-foreground font-medium">{label}</p>
      {na ? (
        <Badge variant="outline" className="mt-2 inline-flex text-base">N/A</Badge>
      ) : (
        <Badge variant={getScoreBadgeVariant(score)} className="mt-2 inline-flex text-base">
          {score.toFixed(2)}
        </Badge>
      )}
    </div>
  );
}

function RatingDisplay({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <p className="text-sm text-muted-foreground font-medium mb-2">{label}</p>
      {value === 0 ? (
        <span className="text-sm text-muted-foreground italic">Not Rated</span>
      ) : (
        <div className="flex items-center gap-0.5 text-yellow-400">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                "h-4 w-4",
                star <= value ? "fill-yellow-400" : "text-muted-foreground/30 fill-none"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
