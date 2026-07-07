import type { AppRole } from "@/lib/auth/roles";

export const shiftOptions = ["morning", "day", "evening"] as const;
export const employmentStatusOptions = ["active", "inactive"] as const;

export type Shift = (typeof shiftOptions)[number];
export type EmploymentStatus = (typeof employmentStatusOptions)[number];

export const shiftLabels: Record<Shift, string> = {
  morning: "Morning",
  day: "Day",
  evening: "Evening",
};

export const employmentStatusLabels: Record<EmploymentStatus, string> = {
  active: "Active",
  inactive: "Inactive",
};

export type Employee = {
  id: string;
  auth_user_id: string;
  employee_code: string | null;
  full_name: string;
  email: string;
  role: AppRole;
  role_id: string;
  shift: Shift;
  employment_status: EmploymentStatus;
  avatar_url: string | null;
  joined_at: string | null;
  created_at: string;
  updated_at: string;
};

export type EmployeeListParams = {
  query: string;
  role: AppRole | "all";
  status: EmploymentStatus | "all";
  shift: Shift | "all";
  sort: "full_name" | "email" | "role" | "shift" | "employment_status" | "joined_at";
  direction: "asc" | "desc";
  page: number;
  pageSize: number;
};
