import { PageHeader } from "@/components/app-shell/page-header";
import { ErrorState } from "@/components/feedback/error-state";
import { MonthlyReportClient } from "@/features/daily-operations/components/monthly-report-client";
import { getMonthlyPerformanceReport } from "@/features/daily-operations/queries";
import { requireUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

function getSelectedMonth(params?: { month?: string; year?: string }) {
  const today = new Date();
  const month = params?.month?.match(/^\d{2}$/) ? params.month : String(today.getMonth() + 1).padStart(2, "0");
  const year = params?.year?.match(/^\d{4}$/) ? Number(params.year) : today.getFullYear();

  return {
    month,
    year,
    value: `${year}-${month}`,
  };
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams?: Promise<{ month?: string; year?: string }>;
}) {
  const { profile } = await requireUser();
  const params = await searchParams;
  const selected = getSelectedMonth(params);
  const { rows, summary, error } = await getMonthlyPerformanceReport(profile, selected.value);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Monthly Performance Report"
        description="Review monthly support and testing performance, score employees, and export the manager report."
      />

      {error ? <ErrorState title="Unable to load monthly report" description={error} /> : null}

      <MonthlyReportClient
        rows={rows}
        summary={summary}
        selectedMonth={selected.value}
        selectedYear={selected.year}
        selectedMonthNumber={selected.month}
        role={profile.role}
      />
    </div>
  );
}
