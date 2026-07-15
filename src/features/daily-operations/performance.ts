import type { AppRole } from "@/lib/auth/roles";
import { testingQualityToScore } from "./types";

// ---------------------------------------------------------------------------
// Star rating thresholds (score is 1.0 – 5.0)
// ---------------------------------------------------------------------------
export type StarRating = "outstanding" | "excellent" | "good" | "average" | "needs_improvement";

export const starRatingThresholds = {
  outstanding: 4.8,
  excellent: 4.3,
  good: 3.8,
  average: 3.0,
} as const;

export const starRatingLabels: Record<StarRating, string> = {
  outstanding: "Outstanding",
  excellent: "Excellent",
  good: "Good",
  average: "Average",
  needs_improvement: "Needs Improvement",
};

export const starRatingStars: Record<StarRating, string> = {
  outstanding: "★★★★★",
  excellent: "★★★★☆",
  good: "★★★★",
  average: "★★★",
  needs_improvement: "★★",
};

// ---------------------------------------------------------------------------
// Configurable weightages for support and testing sub-scores
// ---------------------------------------------------------------------------
export const SUPPORT_WEIGHTS = {
  ticket: 0.4, // 40%
  chat: 0.4, // 40%
  documentation: 0.2, // 20%
} as const;

export const TESTING_WEIGHTS = {
  taskCompletion: 0.6, // 60%
  quality: 0.4, // 40%
} as const;

// When both support + testing work was done on the same day
export const DAILY_WEIGHTS = {
  support: 0.6, // 60%
  testing: 0.4, // 40%
} as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type MonthlyPerformanceMetrics = {
  employee_id: string;
  full_name: string;
  role: AppRole;
  supportDays: number;
  testingDays: number;
  workingDays?: number;
  supportScore: number; // 1-5 average across support days
  testingScore: number; // 1-5 average across testing days
  averageDailyScore: number; // 1-5 average of daily final scores
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
  supportAdjustment: number;
  testingAdjustment: number;
  managerRemarks: string;
  behaviorRating: number;
  communicationRating: number;
  ownershipRating: number;
  disciplineRating: number;
  managerPoints: number;
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
  averageDailyScore: number; // 1-5
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
  if (score >= starRatingThresholds.excellent) return { rating: "excellent", label: starRatingLabels.excellent };
  if (score >= starRatingThresholds.good) return { rating: "good", label: starRatingLabels.good };
  if (score >= starRatingThresholds.average) return { rating: "average", label: starRatingLabels.average };
  return { rating: "needs_improvement", label: starRatingLabels.needs_improvement };
}

// ---------------------------------------------------------------------------
// 1. Daily Support Score (1-5)
// ---------------------------------------------------------------------------
// Support Score = (Ticket Rating × 40%) + (Chat Rating × 40%) + (Doc Rating × 20%)
//
// Ticket Rating:  manager's 1-5 rating of ticket handling
// Chat Rating:    manager's 1-5 rating of chat handling
// Doc Rating:     manager's 1-5 rating of documentation quality
//
// If a rating is null (not yet set), it defaults to 3 (average).
// ---------------------------------------------------------------------------
export function calculateDailySupportScore(
  ticketRating: number | null,
  chatRating: number | null,
  documentationRating: number | null,
): number {
  const t = ticketRating ?? 3;
  const c = chatRating ?? 3;
  const d = documentationRating ?? 3;
  const score = t * SUPPORT_WEIGHTS.ticket + c * SUPPORT_WEIGHTS.chat + d * SUPPORT_WEIGHTS.documentation;
  return round(clamp(score), 2);
}

// ---------------------------------------------------------------------------
// 2. Daily Testing Score (1-5)
// ---------------------------------------------------------------------------
// Testing Score = (Task Completion × 60%) + (Quality Score × 40%)
//
// Task Completion:  manager's 1-5 rating (Completed=5, Mostly=4, Partial=3, Blocked=2, NotDone=1)
// Quality Score:    mapped from testing_quality (excellent=5, good=4, average=3, poor=2)
//
// For multiple testing entries on the same day, the average is taken.
// ---------------------------------------------------------------------------
export function calculateDailyTestingScore(
  taskCompletionRatings: number[],
  qualityScores: number[],
): number {
  if (taskCompletionRatings.length === 0 && qualityScores.length === 0) return 0;

  const avgTask = taskCompletionRatings.length > 0
    ? taskCompletionRatings.reduce((a, b) => a + b, 0) / taskCompletionRatings.length
    : 3;
  const avgQuality = qualityScores.length > 0
    ? qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length
    : 3;

  const score = avgTask * TESTING_WEIGHTS.taskCompletion + avgQuality * TESTING_WEIGHTS.quality;
  return round(clamp(score), 2);
}

// ---------------------------------------------------------------------------
// 3. Daily Final Score (1-5)
// ---------------------------------------------------------------------------
// Support only  → Final = Support Score
// Testing only  → Final = Testing Score
// Both          → Final = (Support × 60%) + (Testing × 40%)
// Neither       → Final = 0 (no work logged)
// ---------------------------------------------------------------------------
export function calculateDailyFinalScore(
  supportScore: number,
  testingScore: number,
  hasSupportWork: boolean,
  hasTestingWork: boolean,
): number {
  if (hasSupportWork && hasTestingWork) {
    return round(clamp(supportScore * DAILY_WEIGHTS.support + testingScore * DAILY_WEIGHTS.testing), 2);
  }
  if (hasSupportWork) return supportScore;
  if (hasTestingWork) return testingScore;
  return 0;
}

// ---------------------------------------------------------------------------
// Badge variant for UI components
// ---------------------------------------------------------------------------
export function getScoreBadgeVariant(score: number) {
  if (score >= 4.3) return "success";
  if (score >= 3.8) return "secondary";
  if (score >= 3.0) return "warning";
  return "danger";
}
