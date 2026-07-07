import { notFound } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/auth/roles";
import { roles } from "@/lib/auth/roles";
import {
  employmentStatusOptions,
  shiftOptions,
  type Employee,
  type EmployeeListParams,
  type EmploymentStatus,
  type Shift,
} from "./types";

type EmployeeRow = Omit<Employee, "role"> & {
  roles:
    | {
        name: AppRole;
      }
    | {
        name: AppRole;
      }[]
    | null;
};

const sortFields = [
  "full_name",
  "email",
  "role",
  "shift",
  "employment_status",
  "joined_at",
] as const;

function toEmployee(row: EmployeeRow): Employee {
  const roleRelation = Array.isArray(row.roles) ? row.roles[0] : row.roles;

  return {
    ...row,
    role: roleRelation?.name ?? "support_engineer",
  };
}

export function parseEmployeeListParams(params: Record<string, string | string[] | undefined>): EmployeeListParams {
  const get = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const role = get("role");
  const status = get("status");
  const shift = get("shift");
  const sort = get("sort");
  const direction = get("direction");
  const page = Number(get("page") ?? "1");

  return {
    query: get("query")?.trim() ?? "",
    role: role && roles.includes(role as AppRole) ? (role as AppRole) : "all",
    status:
      status && employmentStatusOptions.includes(status as EmploymentStatus)
        ? (status as EmploymentStatus)
        : "all",
    shift: shift && shiftOptions.includes(shift as Shift) ? (shift as Shift) : "all",
    sort: sort && sortFields.includes(sort as EmployeeListParams["sort"]) ? (sort as EmployeeListParams["sort"]) : "full_name",
    direction: direction === "desc" ? "desc" : "asc",
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: 10,
  };
}

export async function getRoleOptions() {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = await createClient();
  const { data } = await supabase.from("roles").select("id, name").order("name");
  return data ?? [];
}

export async function getEmployees(params: EmployeeListParams) {
  if (!isSupabaseConfigured()) {
    return { employees: [], total: 0, error: "Supabase is not configured." };
  }

  const supabase = await createClient();
  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize - 1;

  let query = supabase
    .from("profiles")
    .select(
      "id, auth_user_id, employee_code, full_name, email, role_id, shift, employment_status, avatar_url, joined_at, created_at, updated_at, roles(name)",
      { count: "exact" },
    );

  if (params.query) {
    const safeQuery = params.query.replaceAll("%", "\\%").replaceAll("_", "\\_");
    query = query.or(`full_name.ilike.%${safeQuery}%,email.ilike.%${safeQuery}%,employee_code.ilike.%${safeQuery}%`);
  }

  if (params.status !== "all") {
    query = query.eq("employment_status", params.status);
  }

  if (params.shift !== "all") {
    query = query.eq("shift", params.shift);
  }

  if (params.role !== "all") {
    const { data: role } = await supabase.from("roles").select("id").eq("name", params.role).single();
    if (role) {
      query = query.eq("role_id", role.id);
    }
  }

  const sortColumn = params.sort === "role" ? "role_id" : params.sort;
  const { data, count, error } = await query
    .order(sortColumn, { ascending: params.direction === "asc", nullsFirst: false })
    .range(from, to);

  if (error) {
    return { employees: [], total: 0, error: error.message };
  }

  return {
    employees: ((data ?? []) as unknown as EmployeeRow[]).map(toEmployee),
    total: count ?? 0,
    error: null,
  };
}

export async function getEmployeeById(id: string) {
  if (!isSupabaseConfigured()) {
    return { employee: null, error: "Supabase is not configured." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, auth_user_id, employee_code, full_name, email, role_id, shift, employment_status, avatar_url, joined_at, created_at, updated_at, roles(name)",
    )
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      notFound();
    }
    return { employee: null, error: error.message };
  }

  return { employee: toEmployee(data as unknown as EmployeeRow), error: null };
}
