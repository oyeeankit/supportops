# Product Requirements Document

# Employee Daily Operations & Performance Scoring System

| Field | Value |
|-------|-------|
| Document version | 2.0 |
| Status | Implemented |
| Last updated | 2026-07-13 |
| Module | Daily Operations (Support + Testing) and Monthly Performance Reports |
| Tech stack | Next.js 16 (App Router, Turbopack), React 19, TypeScript, Supabase (Postgres + Auth), Zod v4, Tailwind CSS |

---

## 1. Overview

The Employee Daily Operations & Performance Scoring System lets support engineers and QA engineers log their daily work — support tickets/chats and testing activities — in a single merged form. A monthly report then evaluates each employee on a **0.0-5.0 star scale** that reflects how well they completed the work assigned to them, rather than raw output volume.

The scoring engine considers the employee's actual work profile for each day (support only, testing only, support + testing, meetings/documentation, or leave) and only evaluates them on the work they were assigned.

---

## 2. Goals & Non-goals

### Goals

- Merge support and testing logging into a single form per employee per day.
- Allow multiple testing entries per day with start/end datetime pickers.
- Provide a daily summary of work completed.
- Save support + testing data atomically (transactional) via a single Save button.
- Evaluate employees fairly on a **0-5 star scale** based on assigned work.
- Calculate scores dynamically from raw metrics — no scores stored in the database.
- Make scoring weightages configurable.
- Display a monthly report with completion %, sub-scores, final score, and star rating.
- Support manager adjustments (+/-10) and remarks per employee per month.
- Export the monthly report to CSV.

### Non-goals

- Storing computed scores in the database (all scores are calculated on the fly).
- Using bug count as a direct score multiplier (bugs are supporting evidence only).
- Real-time collaborative editing of the same day's form.
- Automatic scoring of meeting/training days beyond "attended = completed".

---

## 3. User personas & roles

| Role | Key | Capabilities |
|------|-----|-------------|
| Manager | `manager` | View all team members' daily logs, fill/edit logs for any team member, view monthly reports for the whole team, apply manager adjustments and remarks |
| Support Engineer | `support_engineer` | View and fill own daily logs (support + testing), view own monthly report |
| QA Engineer | `qa_engineer` | View and fill own daily logs (testing-focused), view own monthly report |

Managers do not appear in their own team reports (excluded from the monthly report query).

---

## 4. Functional requirements

### 4.1 Daily operations form (merged)

**FR-1: Single merged form per employee per day**

The form at `/operations` displays one card per active team member (manager view) or a single card (self view). Each card is a single `<form>` containing two collapsible sections:

1. **Support section** (collapsible)
   - Attendance status (Present / WFH / Leave) — default Present
   - Tickets handled (number)
   - Chats handled (number)
   - Support notes (text)

2. **Testing activities section** (collapsible)
   - Dynamic list of testing entries (add / duplicate / delete / reorder)
   - Each entry has:
     - Application name
     - Module name
     - Testing task description
     - Testing type (functional, regression, smoke, UI/UX, performance, integration, API, database, security, other)
     - Status (In Progress, Completed, Blocked, On Hold)
     - Bugs found, critical bugs, major bugs, minor bugs
     - Testing quality (Excellent, Good, Average, Poor)
     - Started at (datetime-local)
     - Ended at (datetime-local)
     - Notes (text)

3. **Daily summary card** (always visible)
   - Auto-computed totals: tickets, chats, apps tested, testing entries, bugs, bugs breakdown, test status counts

4. **Daily summary section**
   - Work focus (Support, Testing, Support + Testing, Meeting, Training, Leave)
   - Day status (same options)
   - Daily remarks (textarea)

5. **Single Save button** — saves all support + testing data atomically via a PostgreSQL RPC function.

**FR-2: Unsaved changes warning**

The form warns the user via `beforeunload` if they navigate away with unsaved changes.

**FR-3: Work profile inference**

When `work_focus` is not explicitly set on a support log, the system infers it from the data:
- Support log exists + testing entries exist -> `support_testing`
- Only testing entries exist -> `testing`
- Only support log exists -> `support`
- Neither -> `support` (default)

---

### 4.2 Transactional save

**FR-4: Atomic save via PostgreSQL RPC**

The server action `saveDailyOperationAction` calls the Postgres function `public.save_daily_operations(employee_id, log_date, support_payload, testing_entries)`:

1. Upserts the support log (sets `created_by` only on insert, protected by trigger).
2. Deletes all existing testing entries for `(employee_id, log_date)`.
3. Inserts the new testing entries.
4. All within a single `BEGIN / COMMIT` transaction — any error rolls back everything.

---

### 4.3 Scoring system

**FR-5: Final score is 0.0-5.0 stars**

The final score is calculated as:

```
Final = (WorkCompletion * 0.60 + WorkQuality * 0.25 + Productivity * 0.15) / 100 * 5
```

Weightages are configurable via `DEFAULT_SCORING_WEIGHTS` and can be overridden per report.

#### 4.3.1 Work Completion (60%)

**Definition:** Did the employee complete the work assigned to them?

Each assigned task has a completion value:

| Status | Completion value |
|--------|------------------|
| Completed | 1.0 |
| In Progress | 0.5 |
| On Hold | 0.25 |
| Blocked / Not Done | 0.0 |

Task types:
- **Support task:** 1 per support day. Completed if tickets > 0, chats > 0, or notes filled.
- **Testing task:** 1 per testing entry. Scored by status (Completed=1.0, In Progress=0.5, On Hold=0.25, Blocked=0.0).
- **Meeting / Training / Leave:** Always 1.0 (they showed up).

```
Completion % = (sum of completion values / total assigned tasks) * 100
```

Only metrics for work actually assigned are counted. An employee with no testing entries is not penalised for testing.

#### 4.3.2 Work Quality (25%)

**Definition:** How well was the work done?

Quality metrics (only counted for assigned work):

| Metric | Source | Score |
|--------|--------|-------|
| Testing quality | Per-entry `testing_quality` field | excellent=100, good=80, average=60, poor=40 |
| Support notes quality | % of support days with notes filled | 0-100 |
| Bug reporting quality | Consistency: critical + major + minor = total bugs | consistent=100, inconsistent=50 |
| Testing notes quality | % of entries with notes filled | 0-100 |

**Bug count does NOT increase the score.** Bugs are only used as supporting evidence to check reporting quality (consistency of breakdown).

#### 4.3.3 Productivity (15%)

**Definition:** Raw output relative to team averages.

Each metric is normalised against the team average and capped at 150% to prevent outliers:

```
metric_score = min(employee_value / team_average, 1.5) * 100
```

| Work type | Metrics |
|-----------|---------|
| Support assigned | Ticket productivity, Chat productivity |
| Testing assigned | Testing entry productivity, Apps tested productivity |

Only metrics for assigned work are counted.

#### 4.3.4 Manager adjustments

Manager adjustments (+/-10) are applied to the final 0-5 score:

```
adjustment_effect = adjustment / 20   (so +10 -> +0.5, -10 -> -0.5)
final += (support_adjustment + testing_adjustment) / 2
```

Support adjustment only applies if support work was assigned. Testing adjustment only applies if testing work was assigned.

#### 4.3.5 Sub-scores

The system also calculates per-domain sub-scores (0-5):

- **Support Score (0-5):** Based on support task completion, work output presence, and notes rate. Returns 0 if no support was assigned.
- **Testing Score (0-5):** Based on testing completion rate, average testing quality, and app coverage. Returns 0 if no testing was assigned.
- **Quality Score (0-5):** Work quality percentage converted to 0-5.
- **Productivity Score (0-5):** Productivity percentage converted to 0-5.

---

### 4.4 Star rating

**FR-6: Star rating thresholds**

| Score range | Rating label | Stars |
|-------------|-------------|-------|
| 4.8 - 5.0 | Outstanding | 5 stars |
| 4.3 - 4.7 | Excellent | 4.5 stars |
| 3.8 - 4.2 | Good | 4 stars |
| 3.0 - 3.7 | Average | 3 stars |
| Below 3.0 | Needs Improvement | 2 stars |

---

### 4.5 Monthly report

**FR-7: Monthly report at `/reports`**

The report displays the following columns per employee:

| Column | Description |
|--------|-------------|
| Employee | Full name |
| Role | Manager / Support Engineer / QA Engineer |
| Support Days | Number of days with support work |
| Testing Days | Number of days with testing work |
| Support Tasks Completed | Count of completed support tasks |
| Testing Tasks Completed | Count of completed testing tasks |
| Assigned Tasks | Total tasks assigned for the month |
| Completed Tasks | Total tasks completed (weighted: in progress=0.5, on hold=0.25) |
| Completion % | completedTasks / assignedTasks * 100 |
| Support Score (0-5) | Sub-score, N/A if no support assigned |
| Testing Score (0-5) | Sub-score, N/A if no testing assigned |
| Quality Score (0-5) | Work quality sub-score |
| Productivity Score (0-5) | Productivity sub-score |
| Final Score (0-5) | Weighted final score with manager adjustments |
| Performance Rating | Star rating label (Outstanding / Excellent / Good / Average / Needs Improvement) |

**FR-8: Report features**

- Month/year selector with Generate button.
- Search by employee name or manager remarks.
- Sortable columns (by final score, completion %, quality score, etc.).
- Summary cards: team totals, averages, best performers.
- Employee detail panel: full metrics breakdown + star rating display.
- Manager adjustment form: +/-10 for support and testing, remarks textarea.
- CSV export with all columns.
- PDF export via browser print.

---

## 5. Scoring algorithm details

### 5.1 Reusable scoring functions

All scoring logic lives in `src/features/daily-operations/performance.ts` and is designed to be reusable:

| Function | Input | Output | Description |
|----------|-------|--------|-------------|
| `calculateWorkCompletion(input)` | `EmployeeScoringInput` | 0-100 | Completion % of assigned tasks |
| `calculateWorkQuality(input)` | `EmployeeScoringInput` | 0-100 | Average quality score across assigned work |
| `calculateProductivity(input, teamAverages)` | `EmployeeScoringInput`, `TeamAverages` | 0-100 | Productivity vs team average |
| `calculateSupportScore(input)` | `EmployeeScoringInput` | 0-5 | Support sub-score |
| `calculateTestingScore(input)` | `EmployeeScoringInput` | 0-5 | Testing sub-score |
| `calculateFinalScore(...)` | completion, quality, productivity, adjustments, flags, weights | 0-5 | Final weighted score |
| `computeEmployeeScore(input, teamAverages, weights?)` | `EmployeeScoringInput`, `TeamAverages`, optional `ScoringWeights` | All scores + star rating | Single entry point |
| `getStarRating(score)` | 0-5 | `{ rating, label }` | Star rating from score |

### 5.2 EmployeeScoringInput

The `EmployeeScoringInput` type carries all raw metrics needed for scoring:

```typescript
type EmployeeScoringInput = {
  hasSupportWork: boolean;
  hasTestingWork: boolean;
  assignedTasks: number;
  completedTasks: number;
  supportTasksCompleted: number;
  testingTasksCompleted: number;
  totalTickets: number;
  totalChats: number;
  supportDays: number;
  supportNotesFilled: number;
  supportDaysTotal: number;
  totalTestingEntries: number;
  completedTests: number;
  inProgressTests: number;
  blockedTests: number;
  onHoldTests: number;
  appsTested: number;
  testingQualityScores: number[];
  testingNotesFilled: number;
  testingEntriesTotal: number;
  bugsFound: number;
  criticalBugsFound: number;
  bugsMajor: number;
  bugsMinor: number;
  managerAdjustmentSupport: number;
  managerAdjustmentTesting: number;
};
```

### 5.3 Configurable weights

```typescript
const DEFAULT_SCORING_WEIGHTS = {
  workCompletion: 0.6,  // 60%
  workQuality: 0.25,    // 25%
  productivity: 0.15,  // 15%
};
```

To change the weightages, pass a custom `ScoringWeights` object to `computeEmployeeScore()`.

### 5.4 Fairness rules

- Employees are only evaluated on work they were assigned.
- If no support was assigned, support score = 0 and support metrics are excluded from productivity.
- If no testing was assigned, testing score = 0 and testing metrics are excluded from productivity.
- Bug count does not directly increase any score.
- Meeting/training/leave days count as completed tasks (the employee showed up).
- If no quality metrics are available, quality defaults to 100 (neutral).
- If no productivity metrics are available, productivity defaults to 100 (neutral).

---

## 6. Database schema

### 6.1 Tables

**`daily_support_logs`**

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| employee_id | uuid FK -> profiles | |
| log_date | date | Part of unique constraint with employee_id |
| attendance_status | text | present, wfh, leave |
| tickets_handled | int | Default 0 |
| chats_handled | int | Default 0 |
| notes | text | Nullable |
| work_focus | text | support, testing, support_testing, meeting, training, leave |
| day_status | text | Same options as work_focus |
| daily_remarks | text | Nullable |
| created_by | uuid | Set on insert only, protected by trigger |
| updated_by | uuid | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

Unique constraint: `(employee_id, log_date)`

**`daily_testing_logs`**

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| employee_id | uuid FK -> profiles | |
| log_date | date | |
| application_name | text | |
| module_name | text | |
| testing_task | text | |
| testing_type | text | functional, regression, smoke, ui_ux, performance, integration, api, database, security, other |
| status | text | in_progress, completed, blocked, on_hold |
| bugs_found | int | Default 0 |
| critical_bugs_found | int | Default 0 |
| bugs_major | int | Default 0 |
| bugs_minor | int | Default 0 |
| testing_quality | text | excellent, good, average, poor |
| started_at | timestamptz | Nullable |
| ended_at | timestamptz | Nullable |
| notes | text | Nullable |
| created_by | uuid | Set on insert only |
| updated_by | uuid | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

No unique constraint — unlimited testing entries per day per employee.

**`monthly_performance_adjustments`**

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| employee_id | uuid FK | |
| report_month | date | First day of month |
| support_adjustment | int | -10 to +10 |
| testing_adjustment | int | -10 to +10 |
| manager_remarks | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

Unique constraint: `(employee_id, report_month)`

### 6.2 RPC function

`public.save_daily_operations(p_employee_id, p_log_date, p_support_payload, p_testing_entries)`

Saves support log + testing entries atomically. Returns `{ success: boolean, error: text }`.

### 6.3 Triggers

- `prevent_created_by_update()` — blocks updates to `created_by` on support and testing logs.
- `set_updated_at()` — auto-updates `updated_at` on row update.

### 6.4 RLS policies

- Managers: full access to all support logs, testing logs, and adjustments.
- Support/QA engineers: can read own logs and adjustments; can insert/update own logs.

---

## 7. Non-functional requirements

| Requirement | Detail |
|-------------|--------|
| Performance | Monthly report for 20 employees loads in < 2s |
| Transactional integrity | Save is atomic — partial saves are impossible |
| Type safety | Full TypeScript, Zod validation on server + client |
| Idempotent migrations | Migration 008 creates tables if missing, safe to re-run |
| Responsive | Form and report work on mobile, tablet, desktop |
| Accessibility | Labels, semantic HTML, keyboard navigable |
| Build | `npm run build` (Turbopack) passes cleanly |

---

## 8. Technical implementation

### 8.1 File structure

```
src/features/daily-operations/
  types.ts              Types, constants, label maps, emptyTestingEntry()
  schemas.ts            Zod validation schemas (server + client)
  actions.ts           Server actions (saveDailyOperationAction, saveMonthlyPerformanceAdjustmentAction)
  queries.ts           Data fetching (getDailyOperationsPageData, getMonthlyPerformanceReport)
  performance.ts       Scoring algorithm (all calculation functions)
  components/
    daily-entry-form.tsx          Merged form UI
    monthly-report-table.tsx      Report table with star ratings
    monthly-report-summary.tsx     Summary stat cards
    employee-detail-panel.tsx     Employee detail with star rating
    monthly-report-client.tsx     Report page client (CSV export, adjustments)
    manager-overview.tsx          Manager daily overview
```

### 8.2 Data flow

1. User fills the merged form at `/operations`.
2. On save, `saveDailyOperationAction` validates with Zod, then calls `supabase.rpc("save_daily_operations")`.
3. The RPC function saves support + testing atomically.
4. At `/reports`, `getMonthlyPerformanceReport` fetches raw support logs, testing logs, and adjustments.
5. Per employee, `EmployeeScoringInput` is built from raw data (per-day work profile inference).
6. Team averages are computed for productivity normalisation.
7. `computeEmployeeScore()` calculates all sub-scores + final score + star rating.
8. The report table, summary, and detail panel render the computed scores.

### 8.3 Scoring is dynamic

Scores are never stored in the database. Every time the monthly report loads, scores are recalculated from the raw metrics. This ensures:
- Score formula changes take effect immediately.
- No stale scores.
- No need for score recalculation jobs.

---

## 9. Acceptance criteria

- [x] Single merged form with collapsible Support and Testing sections.
- [x] Multiple testing entries per day with add/duplicate/delete/reorder.
- [x] Start/end datetime pickers per testing entry.
- [x] Daily summary card auto-computes totals.
- [x] Work focus, day status, and daily remarks fields.
- [x] Single Save button saves atomically via RPC.
- [x] Empty `work_focus` defaults to "support" instead of failing validation.
- [x] `created_by` is set on insert only and protected by DB trigger.
- [x] Final score is 0.0-5.0 with star rating.
- [x] Work completion weighted at 60%.
- [x] Work quality weighted at 25%.
- [x] Productivity weighted at 15%.
- [x] Bug count does not directly increase score.
- [x] Employees only evaluated on assigned work.
- [x] Star rating thresholds: 4.8/4.3/3.8/3.0.
- [x] Monthly report shows all required columns.
- [x] CSV export with all columns.
- [x] Manager adjustments (+/-10) and remarks.
- [x] Scoring weightages are configurable.
- [x] Scoring algorithm is reusable (`computeEmployeeScore`).
- [x] Raw metrics stored in DB, scores calculated dynamically.
- [x] TypeScript compiles cleanly (`tsc --noEmit`).
- [x] Production build passes (`next build`).

---

## 10. Future enhancements (not in scope)

- Auto-save drafts to localStorage.
- Copy yesterday's testing entries button.
- Toast notifications for save success/error.
- Trend charts showing score progression over months.
- Configurable scoring weights via admin UI (currently code-level).
- Testing entry templates per application.
- Time tracking integration for started_at/ended_at auto-fill.
