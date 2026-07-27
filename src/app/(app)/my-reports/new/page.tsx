import { requireUser } from "@/lib/auth/session";
import { getEmployeeDraft } from "@/features/daily-reports/queries";
import { DailyReportForm } from "@/features/daily-reports/components/daily-report-form";

export const dynamic = "force-dynamic";

export default async function NewDailyReportPage({
  searchParams,
}: {
  searchParams?: Promise<{ date?: string }>;
}) {
  const { profile } = await requireUser();
  const params = await searchParams;
  const targetDate = params?.date || new Date().toISOString().split("T")[0];

  const { draft } = await getEmployeeDraft(profile, targetDate);

  return (
    <div className="p-4 md:p-6 lg:p-8 w-full">
      <DailyReportForm profile={profile} initialDraft={draft} />
    </div>
  );
}
