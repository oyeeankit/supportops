import { z } from "zod";
import {
  attendanceStatuses,
  testingStatuses,
  testingTypes,
  testingQualities,
  testingPlatforms,
  workFocusOptions,
  dayStatusOptions,
  NO_TESTING_ASSIGNED,
  isNoTestingAssigned,
  managerRatingOptions,
  taskCompletionOptions,
} from "./types";

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date.");

const ratingSchema = z
  .union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)])
  .nullable()
  .optional();

export const dailySupportLogSchema = z.object({
  employee_id: z.string().uuid("Invalid employee."),
  log_date: dateString,
  attendance_status: z.enum(attendanceStatuses, "Select a valid attendance status."),
  tickets_handled: z.coerce.number().int().min(0, "Tickets cannot be negative.").max(999, "Tickets look too high."),
  chats_handled: z.coerce.number().int().min(0, "Chats cannot be negative.").max(999, "Chats look too high."),
  notes: z
    .string()
    .trim()
    .max(500, "Notes must be 500 characters or less.")
    .optional()
    .transform((value) => (value ? value : null)),
  work_focus: z.enum(workFocusOptions).optional().default("support"),
  day_status: z.enum(dayStatusOptions).optional().default("support"),
  daily_remarks: z
    .string()
    .trim()
    .max(1000, "Daily remarks must be 1000 characters or less.")
    .optional()
    .transform((value) => (value ? value : null)),
  ticket_rating: ratingSchema,
  chat_rating: ratingSchema,
  documentation_rating: ratingSchema,
});

// ---------------------------------------------------------------------------
// Testing entry schema (server-side)
// ---------------------------------------------------------------------------
// When "No Testing Assigned" is selected, all other fields become optional
// and are filled with sensible defaults so the entry can still be saved.
// ---------------------------------------------------------------------------
export const testingEntrySchema = z
  .object({
    platform: z.enum(testingPlatforms).optional().default("shopify"),
    application_name: z.string().trim().max(120, "App name must be 120 characters or less."),
    module_name: z.string().trim().max(120, "Module name must be 120 characters or less.").optional().default(""),
    testing_type: z.enum(testingTypes, "Select a valid testing type."),
    status: z.enum(testingStatuses, "Select a valid testing status."),
    bugs_found: z.coerce.number().int().min(0, "Bugs cannot be negative.").max(9999, "Bugs look too high."),
    critical_bugs_found: z.coerce.number().int().min(0, "Critical bugs cannot be negative.").max(9999, "Critical bugs look too high."),
    testing_quality: z.enum(testingQualities, "Select a valid testing quality."),
    task_completion: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).optional().default(5),
    started_at: z.string().optional().nullable().default(""),
    ended_at: z.string().optional().nullable().default(""),
    notes: z
      .string()
      .trim()
      .max(1000, "Notes must be 1000 characters or less.")
      .optional()
      .transform((value) => (value ? value : null)),
  })
  .superRefine((data, ctx) => {
    if (!isNoTestingAssigned(data.application_name)) {
      if (!data.module_name || data.module_name.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["module_name"],
          message: "Module / feature tested is required when an app is selected.",
        });
      }
    }
  });

export const testingEntryClientSchema = z
  .object({
    platform: z.enum(testingPlatforms),
    application_name: z.string().trim().min(1, "App name is required.").max(120, "App name must be 120 characters or less."),
    module_name: z.string().trim().max(120, "Module name must be 120 characters or less."),
    testing_type: z.enum(testingTypes, "Select a valid testing type."),
    status: z.enum(testingStatuses, "Select a valid testing status."),
    bugs_found: z.coerce.number().int().min(0, "Bugs cannot be negative.").max(9999, "Bugs look too high."),
    critical_bugs_found: z.coerce.number().int().min(0, "Critical bugs cannot be negative.").max(9999, "Critical bugs look too high."),
    testing_quality: z.enum(testingQualities, "Select a valid testing quality."),
    task_completion: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).default(5),
    started_at: z.string().optional().nullable().default(""),
    ended_at: z.string().optional().nullable().default(""),
    notes: z
      .string()
      .trim()
      .max(1000, "Notes must be 1000 characters or less.")
      .optional()
      .transform((value) => (value ? value : null)),
  })
  .superRefine((data, ctx) => {
    if (!isNoTestingAssigned(data.application_name)) {
      if (!data.module_name || data.module_name.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["module_name"],
          message: "Module / feature tested is required when an app is selected.",
        });
      }
    }
  });

export const monthlyPerformanceAdjustmentSchema = z.object({
  employee_id: z.string().uuid("Invalid employee."),
  report_month: z.string().regex(/^\d{4}-\d{2}-01$/, "Use a valid report month."),
  behavior_rating: z.coerce.number().int().min(1, "Minimum behavior rating is 1.").max(5, "Maximum behavior rating is 5."),
  communication_rating: z.coerce.number().int().min(1, "Minimum communication rating is 1.").max(5, "Maximum communication rating is 5."),
  ownership_rating: z.coerce.number().int().min(1, "Minimum ownership rating is 1.").max(5, "Maximum ownership rating is 5."),
  discipline_rating: z.coerce.number().int().min(1, "Minimum discipline rating is 1.").max(5, "Maximum discipline rating is 5."),
  manager_points: z.coerce.number().int().min(-10, "Minimum points is -10.").max(10, "Maximum points is +10."),
  manager_remarks: z
    .string()
    .trim()
    .max(500, "Remarks must be 500 characters or less.")
    .optional()
    .nullable()
    .transform((value) => (value ? value : null)),
  // @deprecated - replaced by behavior_rating, communication_rating, etc. and manager_points. Keep for backward compatibility.
  support_adjustment: z.coerce.number().int().optional().default(0),
  // @deprecated - replaced by normalized rating fields. Keep for backward compatibility.
  testing_adjustment: z.coerce.number().int().optional().default(0),
});
