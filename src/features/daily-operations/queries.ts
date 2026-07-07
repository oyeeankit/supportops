import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { AppRole, UserProfile } from "@/lib/auth/roles";
import type { Shift } from "@/features/employees/types";
import type { DailyOperation, TeamMemberDailyRow } from "./types";

type ProfileRow = {
  id: string;
  full_name: string;
  email: string;
  shift: Shift;
  avatar_url: string | null;
  roles:
    | {
        name: AppRole;
      }
    | {
        name: AppRole;
      }[]
    | null;
};

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export async function getDailyOperationsPageData(profile: UserProfile, date = todayIso()) {
  if (!isSupabaseConfigured()) {
    return {
      date,
      rows: [] as TeamMemberDailyRow[],
      myOperation: null as DailyOperation | null,
      error: "Supabase is not configured.",
    };
  }

  const supabase = await createClient();
  const isManager = profile.role === "manager";

  const profileQuery = supabase
    .from("profiles")
    .select("id, full_name, email, shift, avatar_url, roles(name)")
    .eq("employment_status", "active")
    .order("full_name");

  const { data: profiles, error: profilesError } = isManager
    ? await profileQuery
    : await profileQuery.eq("id", profile.id);

  if (profilesError) {
    return { date, rows: [], myOperation: null, error: profilesError.message };
  }

  const employeeIds = ((profiles ?? []) as unknown as ProfileRow[]).map((employee) => employee.id);
  let operations: DailyOperation[] = [];

  if (employeeIds.length > 0) {
    const { data, error } = await supabase
      .from("daily_operations")
      .select("*")
      .eq("operation_date", date)
      .in("employee_id", employeeIds);

    if (error) {
      return { date, rows: [], myOperation: null, error: error.message };
    }

    operations = (data ?? []) as DailyOperation[];
  }

  const operationByEmployee = new Map(operations.map((operation) => [operation.employee_id, operation]));
  const rows = ((profiles ?? []) as unknown as ProfileRow[]).map((employee) => {
    const roleRelation = Array.isArray(employee.roles) ? employee.roles[0] : employee.roles;
    return {
      employee_id: employee.id,
      full_name: employee.full_name,
      email: employee.email,
      role: roleRelation?.name ?? "support_engineer",
      shift: employee.shift,
      avatar_url: employee.avatar_url,
      operation: operationByEmployee.get(employee.id) ?? null,
    };
  });

  return {
    date,
    rows,
    myOperation: operationByEmployee.get(profile.id) ?? null,
    error: null,
  };
}
