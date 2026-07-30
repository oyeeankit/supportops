import type { AppRole } from "@/lib/auth/roles";
import { testingQualityToScore } from "./types";

// ---------------------------------------------------------------------------
// Star rating thresholds (score is 1.0 – 5.0)
// ---------------------------------------------------------------------------
export type StarRating = "outstanding" | "very_good" | "good" | "needs_improvement" | "unsatisfactory";

export const starRatingThresholds = {
  outstanding: 4.5,
  very_good: 3.8,
  good: 3.0,
  needs_improvement: 2.0,
} as const;

export const starRatingLabels: Record<StarRating, string> = {
  outstanding: "Outstanding",
  very_good: "Very Good",
  good: "Good",
  needs_improvement: "Needs Improvement",
  unsatisfactory: "Unsatisfactory",
};

export const starRatingStars: Record<StarRating, string> = {
  outstanding: "★★★★★",
  very_good: "★★★★☆",
  good: "★★★☆☆",
  needs_improvement: "★★☆☆☆",
  unsatisfactory: "★☆☆☆☆",
};

// ---------------------------------------------------------------------------
// Configurable weightages for support and testing sub-scores
// ---------------------------------------------------------------------------
export const MONTHLY_WEIGHTS = {
  support: 0.5, // 50%
  testing: 0.3, // 30%
  manager: 0.2, // 20%
} as const;

export const QA_MONTHLY_WEIGHTS = {
  support: 0.0, // 0%
  testing: 0.8, // 80%
  manager: 0.2, // 20%
} as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type MonthlyPerformanceMetrics = {
  employee_id: string;
  full_name: string;
  email?: string;
  avatar_url?: string | null;
  role: AppRole;
  supportDays: number;
  testingDays: number;
  workingDays?: number;
  supportScore: number; // 1-5
  testingScore: number; // 1-5
  managerScore: number; // 1-5
  finalScore: number; // 1-5 monthly final
  starRating: StarRating;
  ratingLabel: string;
  // Raw metrics for display
  totalTickets: number;
  totalChats: number;
  totalTestingEntries: number;
  appsTested: number;
  bugsFound: number;
  criticalBugsFound: number;
  // Checkbox totals
  docUpdates: number;
  featureSuggestions: number;
  bugVerifications: number;
  askedForReviews: number;
  gotReviews: number;
  otherContributions: number;
  
  managerRemarks: string;
  initiativeRating: number;
  communicationRating: number;
  ownershipRating: number;
  disciplineRating: number;
};

export type MonthlyPerformanceSummary = {
  month: string;
  monthLabel: string;
  totalTeamTickets: number;
  totalTeamChats: number;
  totalTestingEntries: number;
  totalAppsTested: number;
  totalBugsFound: number;
  totalCriticalBugs: number;
  averageSupportScore: number; // 1-5
  averageTestingScore: number; // 1-5
  averageManagerScore: number; // 1-5
  averageFinalScore: number; // 1-5
  bestSupportPerformer: string | null;
  bestTestingPerformer: string | null;
  overallBestPerformer: string | null;
  expectedWorkingDays: number;
};

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------
export function getExpectedWorkingDays(year: number, month: number) {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0));
  let days = 0;
  for (let c = new Date(start); c <= end; c.setUTCDate(c.getUTCDate() + 1)) {
    if (c.getUTCDay() !== 0 && c.getUTCDay() !== 6) days += 1;
  }
  return days;
}

export function round(value: number, decimals = 1) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function clamp(value: number, min = 1, max = 5) {
  return Math.min(Math.max(value, min), max);
}

export function getStarRating(score: number): { rating: StarRating; label: string } {
  if (score >= starRatingThresholds.outstanding) return { rating: "outstanding", label: starRatingLabels.outstanding };
  if (score >= starRatingThresholds.very_good) return { rating: "very_good", label: starRatingLabels.very_good };
  if (score >= starRatingThresholds.good) return { rating: "good", label: starRatingLabels.good };
  if (score >= starRatingThresholds.needs_improvement) return { rating: "needs_improvement", label: starRatingLabels.needs_improvement };
  return { rating: "unsatisfactory", label: starRatingLabels.unsatisfactory };
}

// ---------------------------------------------------------------------------
// Final Monthly Score (1-5)
// ---------------------------------------------------------------------------
// Support Engineers: Support = 50%, Testing = 30%, Manager = 20%
// QA Engineers (or Testing-only): Support = 0%, Testing = 80%, Manager = 20%
// Support-only: Support = 80%, Testing = 0%, Manager = 20%
// ---------------------------------------------------------------------------
export function calculateMonthlyFinalScore(
  supportScore: number,
  testingScore: number,
  managerScore: number,
  hasSupport: boolean,
  hasTesting: boolean,
  role: AppRole = "support_engineer"
): number {
  if (!hasSupport && !hasTesting) return managerScore;
  
  if (role === "qa_engineer" || (!hasSupport && hasTesting)) {
    return round(testingScore * QA_MONTHLY_WEIGHTS.testing + managerScore * QA_MONTHLY_WEIGHTS.manager, 2);
  }
  if (hasSupport && !hasTesting) {
    return round(supportScore * 0.8 + managerScore * 0.2, 2);
  }
  return round(
    supportScore * MONTHLY_WEIGHTS.support +
    testingScore * MONTHLY_WEIGHTS.testing +
    managerScore * MONTHLY_WEIGHTS.manager,
    2
  );
}

// ---------------------------------------------------------------------------
// Badge variant for UI components
// ---------------------------------------------------------------------------
export function getScoreBadgeVariant(score: number) {
  if (score >= 4.5) return "success";
  if (score >= 3.8) return "secondary";
  if (score >= 3.0) return "warning";
  return "danger";
}
