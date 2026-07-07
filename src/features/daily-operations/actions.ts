"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { dailySupportLogSchema, dailyTestingLogSchema, monthlyPerformanceAdjustmentSchema } from "./schemas";

function isSchemaCacheError(error: { message?: string } | null) {
  if (!error?.message) {
    return false;
  }

  return /Could not find the table|relation "[^"]+" does not exist|schema cache/i.test(error.message);
}

type LegacySupportPayload = {
  employee_id: string;
  log_date: string;
  attendance_status: string;
  tickets_handled: number;
  chats_handled: number;
  notes?: string | null;
};

type LegacyTestingPayload = {
  employee_id: string;
  log_date: string;
  testing_task: string;
  notes?: string | null;
};

async function upsertLegacyDailyOperation(
  supabase: Awaited<ReturnType<typeof createClient>>,
  payload: LegacySupportPayload | LegacyTestingPayload,
  logType: string,
  profileId: string,
) {
  const row: Record<string, unknown> = {
    employee_id: payload.employee_id,
    operation_date: payload.log_date,
    created_by: profileId,
    updated_by: profileId,
  };

  if (logType === "testing") {
    const testingPayload = payload as LegacyTestingPayload;
    Object.assign(row, {
      attendance_status: "present",
      tickets_resolved: 0,
      chats_handled: 0,
      current_testing_task: testingPayload.testing_task,
      work_focus: "testing",
      notes: testingPayload.notes ?? null,
    });
  } else {
    const supportPayload = payload as LegacySupportPayload;
    Object.assign(row, {
      attendance_status: supportPayload.attendance_status,
      tickets_resolved: supportPayload.tickets_handled,
      chats_handled: supportPayload.chats_handled,
      current_testing_task: null,
      work_focus: "support",
      notes: supportPayload.notes ?? null,
    });
  }

  return supabase.from("daily_operations").upsert(row, { onConflict: "employee_id,operation_date" });
}

export type DailyOperationActionState = {
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  savedLogType?: "support" | "testing";
  savedEmployeeId?: string;
  resetKey?: number;
};

export async function saveDailyOperationAction(
  _: DailyOperationActionState,
  formData: FormData,
): Promise<DailyOperationActionState> {
  const { profile } = await requireUser();
  const submitAction = formData.get("submit_action") === "save_and_continue";
  const logType = String(formData.get("log_type") ?? "support");
  const supabase = await createClient();

  const payload = Object.fromEntries(formData.entries());
  const parsed = logType === "testing"
    ? dailyTestingLogSchema.safeParse(payload)
    : dailySupportLogSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      message: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  if (profile.role !== "manager" && parsed.data.employee_id !== profile.id) {
    return { message: "You can only update your own daily log." };
  }

  let error = null;

  if (logType === "testing") {
    const response = await supabase.from("daily_testing_logs").upsert(
      {
        ...parsed.data,
        updated_by: profile.id,
        created_by: profile.id,
      },
      {
        onConflict: "employee_id,log_date",
      },
    );

    if (response.error && isSchemaCacheError(response.error)) {
      const legacyResponse = await upsertLegacyDailyOperation(supabase, parsed.data, logType, profile.id);
      error = legacyResponse.error;
    } else {
      error = response.error;
    }
  } else {
    const response = await supabase.from("daily_support_logs").upsert(
      {
        ...parsed.data,
        updated_by: profile.id,
        created_by: profile.id,
      },
      {
        onConflict: "employee_id,log_date",
      },
    );

    if (response.error && isSchemaCacheError(response.error)) {
      const legacyResponse = await upsertLegacyDailyOperation(supabase, parsed.data, logType, profile.id);
      error = legacyResponse.error;
    } else {
      error = response.error;
    }
  }

  if (error) {
    return { message: error.message };
  }

  if (submitAction && profile.role === "manager") {
    const { data: employees, error: employeeError } = await supabase
      .from("profiles")
      .select("id")
      .eq("employment_status", "active")
      .order("full_name");

    if (!employeeError && employees) {
      const employeeIds = employees.map((employee) => employee.id);
      const currentIndex = employeeIds.indexOf(parsed.data.employee_id);
      if (currentIndex >= 0) {
        const nextEmployeeId = employeeIds[(currentIndex + 1) % employeeIds.length];
        revalidatePath("/operations");
        revalidatePath("/reports");
        redirect(`/operations?date=${parsed.data.log_date}&employee=${nextEmployeeId}`);
      }
    }
  }

  revalidatePath("/operations");
  revalidatePath("/reports");
  redirect(`/operations?date=${parsed.data.log_date}&employee=${parsed.data.employee_id}`);
}

export async function saveMonthlyPerformanceAdjustmentAction(
  _: DailyOperationActionState,
  formData: FormData,
): Promise<DailyOperationActionState> {
  const { profile } = await requireUser();

  if (profile.role !== "manager") {
    return { message: "Only managers can update monthly report adjustments." };
  }

  const parsed = monthlyPerformanceAdjustmentSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return {
      message: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("monthly_performance_adjustments").upsert(
    {
      ...parsed.data,
      created_by: profile.id,
      updated_by: profile.id,
    },
    {
      onConflict: "employee_id,report_month",
    },
  );

  if (error) {
    return { message: error.message };
  }

  revalidatePath("/reports");
  return { message: "Monthly adjustment saved." };
}
