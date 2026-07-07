"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  createEmployeeSchema,
  deactivateEmployeeSchema,
  updateEmployeeSchema,
  type CreateEmployeeInput,
  type UpdateEmployeeInput,
} from "./schemas";

export type EmployeeActionState = {
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

async function getRoleId(admin: ReturnType<typeof createAdminClient>, role: CreateEmployeeInput["role"]) {
  const { data, error } = await admin.from("roles").select("id").eq("name", role).single();

  if (error || !data) {
    throw new Error("Selected role does not exist.");
  }

  return data.id as string;
}

async function ensureEmployeeCodeIsUnique(
  admin: ReturnType<typeof createAdminClient>,
  employeeCode: string | null,
  currentId?: string,
) {
  if (!employeeCode) {
    return;
  }

  let query = admin.from("profiles").select("id").eq("employee_code", employeeCode).limit(1);
  if (currentId) {
    query = query.neq("id", currentId);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }
  if (data && data.length > 0) {
    throw new Error("Employee code already exists.");
  }
}

export async function createEmployeeAction(
  _: EmployeeActionState,
  formData: FormData,
): Promise<EmployeeActionState> {
  await requireRole(["manager"]);

  if (!isSupabaseConfigured()) {
    return { message: "Supabase is not configured." };
  }

  const parsed = createEmployeeSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return {
      message: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  let createdAuthUserId: string | null = null;

  try {
    const admin = createAdminClient();
    const roleId = await getRoleId(admin, parsed.data.role);
    await ensureEmployeeCodeIsUnique(admin, parsed.data.employee_code);

    const { data: existing } = await admin
      .from("profiles")
      .select("id")
      .eq("email", parsed.data.email)
      .limit(1);

    if (existing && existing.length > 0) {
      return { message: "An employee with this email already exists." };
    }

    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      email_confirm: true,
      user_metadata: {
        full_name: parsed.data.full_name,
        role: parsed.data.role,
      },
    });

    if (authError || !authData.user) {
      return { message: authError?.message ?? "Unable to create auth user." };
    }

    createdAuthUserId = authData.user.id;

    const profile = toProfileInsert(parsed.data, roleId, authData.user.id);
    const { error: profileError } = await admin.from("profiles").insert(profile);

    if (profileError) {
      await admin.auth.admin.deleteUser(authData.user.id);
      return { message: profileError.message };
    }
  } catch (error) {
    if (createdAuthUserId) {
      try {
        await createAdminClient().auth.admin.deleteUser(createdAuthUserId);
      } catch {
        // Best effort cleanup only.
      }
    }

    return { message: error instanceof Error ? error.message : "Unable to create employee." };
  }

  revalidatePath("/team");
  redirect("/team");
}

export async function updateEmployeeAction(
  _: EmployeeActionState,
  formData: FormData,
): Promise<EmployeeActionState> {
  await requireRole(["manager"]);

  const parsed = updateEmployeeSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return {
      message: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const admin = createAdminClient();
    const roleId = await getRoleId(admin, parsed.data.role);
    await ensureEmployeeCodeIsUnique(admin, parsed.data.employee_code, parsed.data.id);

    const { data: current, error: currentError } = await admin
      .from("profiles")
      .select("auth_user_id")
      .eq("id", parsed.data.id)
      .single();

    if (currentError || !current) {
      return { message: currentError?.message ?? "Employee not found." };
    }

    const { error: authError } = await admin.auth.admin.updateUserById(current.auth_user_id, {
      email: parsed.data.email,
      user_metadata: {
        full_name: parsed.data.full_name,
        role: parsed.data.role,
      },
    });

    if (authError) {
      return { message: authError.message };
    }

    const { error } = await admin
      .from("profiles")
      .update(toProfileUpdate(parsed.data, roleId))
      .eq("id", parsed.data.id);

    if (error) {
      return { message: error.message };
    }
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Unable to update employee." };
  }

  revalidatePath("/team");
  revalidatePath(`/team/${parsed.data.id}`);
  redirect(`/team/${parsed.data.id}`);
}

export async function deactivateEmployeeAction(formData: FormData) {
  await requireRole(["manager"]);

  const parsed = deactivateEmployeeSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    redirect("/team?error=invalid-employee");
  }

  const admin = createAdminClient();
  await admin
    .from("profiles")
    .update({ employment_status: "inactive", updated_at: new Date().toISOString() })
    .eq("id", parsed.data.id);

  revalidatePath("/team");
  revalidatePath(`/team/${parsed.data.id}`);
}

function toProfileInsert(input: CreateEmployeeInput, roleId: string, authUserId: string) {
  return {
    auth_user_id: authUserId,
    full_name: input.full_name,
    email: input.email,
    role_id: roleId,
    shift: input.shift,
    employment_status: input.employment_status,
    employee_code: input.employee_code,
    joined_at: input.joined_at,
    avatar_url: input.avatar_url,
  };
}

function toProfileUpdate(input: UpdateEmployeeInput, roleId: string) {
  return {
    full_name: input.full_name,
    email: input.email,
    role_id: roleId,
    shift: input.shift,
    employment_status: input.employment_status,
    employee_code: input.employee_code,
    joined_at: input.joined_at,
    avatar_url: input.avatar_url,
    updated_at: new Date().toISOString(),
  };
}
