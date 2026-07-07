import { z } from "zod";
import { roles } from "@/lib/auth/roles";
import { employmentStatusOptions, shiftOptions } from "./types";

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : null))
  .pipe(z.string().url("Avatar must be a valid URL.").nullable());

const joinedAt = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : null));

export const createEmployeeSchema = z.object({
  full_name: z.string().trim().min(2, "Employee name must be at least 2 characters."),
  email: z.string().trim().email("Enter a valid work email address.").toLowerCase(),
  password: z.string().min(8, "Temporary password must be at least 8 characters."),
  role: z.enum(roles, "Select a valid role."),
  shift: z.enum(shiftOptions, "Select a valid shift."),
  employment_status: z.enum(employmentStatusOptions, "Select a valid employment status."),
  employee_code: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value.toUpperCase() : null)),
  joined_at: joinedAt,
  avatar_url: optionalUrl,
});

export const updateEmployeeSchema = createEmployeeSchema.omit({ password: true }).extend({
  id: z.string().uuid("Invalid employee id."),
});

export const deactivateEmployeeSchema = z.object({
  id: z.string().uuid("Invalid employee id."),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
