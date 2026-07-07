"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { dailyOperationSchema } from "./schemas";

export type DailyOperationActionState = {
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

export async function saveDailyOperationAction(
  _: DailyOperationActionState,
  formData: FormData,
): Promise<DailyOperationActionState> {
  const { profile } = await requireUser();
  const parsed = dailyOperationSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return {
      message: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  if (profile.role !== "manager" && parsed.data.employee_id !== profile.id) {
    return { message: "You can only update your own daily operation log." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("daily_operations").upsert(
    {
      ...parsed.data,
      updated_by: profile.id,
      created_by: profile.id,
    },
    {
      onConflict: "employee_id,operation_date",
    },
  );

  if (error) {
    return { message: error.message };
  }

  revalidatePath("/operations");
  return { message: "Daily operation saved." };
}
