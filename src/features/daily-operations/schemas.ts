import { z } from "zod";
import { attendanceStatuses, testingStatuses, testingTypes } from "./types";

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date.");

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
});

export const dailyTestingLogSchema = z.object({
  employee_id: z.string().uuid("Invalid employee."),
  log_date: dateString,
  application_name: z.string().trim().max(120, "Application name must be 120 characters or less."),
  module_name: z.string().trim().max(120, "Module name must be 120 characters or less."),
  testing_task: z.string().trim().max(160, "Testing task must be 160 characters or less."),
  testing_type: z.enum(testingTypes, "Select a valid testing type."),
  status: z.enum(testingStatuses, "Select a valid testing status."),
  bugs_found: z.coerce.number().int().min(0, "Bugs cannot be negative.").max(999, "Bugs look too high."),
  critical_bugs_found: z.coerce.number().int().min(0, "Critical bugs cannot be negative.").max(999, "Critical bugs look too high."),
  notes: z
    .string()
    .trim()
    .max(500, "Notes must be 500 characters or less.")
    .optional()
    .transform((value) => (value ? value : null)),
});

export const monthlyPerformanceAdjustmentSchema = z.object({
  employee_id: z.string().uuid("Invalid employee."),
  report_month: z.string().regex(/^\d{4}-\d{2}-01$/, "Use a valid report month."),
  support_adjustment: z.coerce.number().int().min(-10, "Minimum adjustment is -10.").max(10, "Maximum adjustment is +10."),
  testing_adjustment: z.coerce.number().int().min(-10, "Minimum adjustment is -10.").max(10, "Maximum adjustment is +10."),
  manager_remarks: z
    .string()
    .trim()
    .max(500, "Remarks must be 500 characters or less.")
    .optional()
    .transform((value) => (value ? value : null)),
});
