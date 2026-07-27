import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();

    // Delete all daily support logs
    const { error: err1 } = await supabase.from("daily_support_logs").delete().gte("created_at", "2000-01-01T00:00:00Z");

    // Delete all daily testing logs
    const { error: err2 } = await supabase.from("daily_testing_logs").delete().gte("created_at", "2000-01-01T00:00:00Z");

    // Delete all daily report submissions
    try {
      await supabase.from("daily_report_submissions").delete().gte("created_at", "2000-01-01T00:00:00Z");
    } catch {
      // Ignore fallback
    }

    // Delete all daily operations (legacy)
    try {
      await supabase.from("daily_operations").delete().gte("created_at", "2000-01-01T00:00:00Z");
    } catch {
      // Ignore fallback
    }

    revalidatePath("/", "layout");
    revalidatePath("/dashboard");
    revalidatePath("/operations");
    revalidatePath("/reports");
    revalidatePath("/operations/submissions");

    return NextResponse.json({
      success: true,
      message: "All report and log data reset successfully for a fresh start!",
      errors: [err1?.message, err2?.message].filter(Boolean),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to reset data." },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
