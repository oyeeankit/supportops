import { z } from "zod";
import {
  attendanceStatuses,
  testingStatuses,
  testingTypes,
  testingQualities,
  supportQualities,
  testingPlatforms,
  NO_TESTING_ASSIGNED,
  isNoTestingAssigned,
} from "./types";

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date.");

export const dailySupportLogSchema = z.object({
  employee_id: z.string().uuid("Invalid employee."),
  log_date: dateString,
  attendance_status: z.enum(attendanceStatuses, "Select a valid attendance status."),
  tickets_handled: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? 0 : val),
    z.coerce.number().int().min(0, "Tickets cannot be negative.").max(999, "Tickets look too high."),
  ),
  chats_handled: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? 0 : val),
    z.coerce.number().int().min(0, "Chats cannot be negative.").max(999, "Chats look too high."),
  ),
  doc_updated: z.boolean().default(false),
  feature_suggestion: z.boolean().default(false),
  bug_verification: z.boolean().default(false),
  asked_for_review: z.boolean().default(false),
  got_review: z.boolean().default(false),
  other_contribution: z.boolean().default(false),
  support_quality: z.enum(supportQualities).default("good"),
  testing_quality: z.enum(testingQualities).default("good"),
  testing_notes: z
    .string()
    .trim()
    .max(1000, "Notes must be 1000 characters or less.")
    .optional()
    .nullable()
    .transform((value) => (value ? value : null)),
});

// ---------------------------------------------------------------------------
// Testing entry schema (server-side)
// ---------------------------------------------------------------------------
// When "No Testing Assigned" is selected, all other fields become optional
// and are filled with sensible defaults so the entry can still be saved.
// ---------------------------------------------------------------------------
export const testingEntrySchema = z
  .object({
    platform: z.string().optional().default("shopify"),
    application_name: z.string().trim().max(120, "App name must be 120 characters or less."),
    module_name: z.string().trim().max(120, "Module name must be 120 characters or less.").optional().default(""),
    testing_type: z.enum(testingTypes, "Select a valid testing type.").optional().default("functional"),
    status: z.enum(testingStatuses, "Select a valid testing status.").optional().default("completed"),
    bugs_found: z.coerce.number().int().min(0, "Bugs cannot be negative.").max(9999, "Bugs look too high.").default(0),
    critical_bug: z.boolean().default(false),
  });

export const testingEntryClientSchema = z
  .object({
    platform: z.string().default("shopify"),
    application_name: z.string().trim().min(1, "App name is required.").max(120, "App name must be 120 characters or less."),
    module_name: z.string().trim().max(120, "Module name must be 120 characters or less."),
    testing_type: z.enum(testingTypes, "Select a valid testing type.").default("functional"),
    status: z.enum(testingStatuses, "Select a valid testing status.").default("completed"),
    bugs_found: z.coerce.number().int().min(0, "Bugs cannot be negative.").max(9999, "Bugs look too high.").default(0),
    critical_bug: z.boolean().default(false),
  });

export const monthlyPerformanceAdjustmentSchema = z.object({
  employee_id: z.string().uuid("Invalid employee."),
  report_month: z.string().regex(/^\d{4}-\d{2}-01$/, "Use a valid report month."),
  initiative_rating: z.coerce.number().int().min(1, "Minimum initiative rating is 1.").max(5, "Maximum initiative rating is 5."),
  communication_rating: z.coerce.number().int().min(1, "Minimum communication rating is 1.").max(5, "Maximum communication rating is 5."),
  ownership_rating: z.coerce.number().int().min(1, "Minimum ownership rating is 1.").max(5, "Maximum ownership rating is 5."),
  discipline_rating: z.coerce.number().int().min(1, "Minimum discipline rating is 1.").max(5, "Maximum discipline rating is 5."),
  manager_remarks: z
    .string()
    .trim()
    .max(500, "Remarks must be 500 characters or less.")
    .optional()
    .nullable()
    .transform((value) => (value ? value : null)),
});
