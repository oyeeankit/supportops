import { z } from "zod";
import { attendanceStatuses, workFocusOptions } from "./types";

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date.");

export const dailyOperationSchema = z.object({
  employee_id: z.string().uuid("Invalid employee."),
  operation_date: dateString,
  attendance_status: z.enum(attendanceStatuses, "Select a valid attendance status."),
  tickets_resolved: z.coerce.number().int().min(0, "Tickets cannot be negative.").max(999, "Tickets look too high."),
  chats_handled: z.coerce.number().int().min(0, "Chats cannot be negative.").max(999, "Chats look too high."),
  work_focus: z.enum(workFocusOptions, "Select a valid work focus."),
  current_testing_task: z
    .string()
    .trim()
    .max(120, "Testing task must be 120 characters or less.")
    .optional()
    .transform((value) => (value ? value : null)),
  notes: z
    .string()
    .trim()
    .max(500, "Notes must be 500 characters or less.")
    .optional()
    .transform((value) => (value ? value : null)),
});
