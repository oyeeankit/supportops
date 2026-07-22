import { PageHeader } from "@/components/app-shell/page-header";
import { ErrorState } from "@/components/feedback/error-state";
import { OperationsKpis } from "@/features/daily-operations/components/operations-kpis";
import { DailyOperationsClient } from "@/features/daily-operations/components/daily-operations-client";
import { getDailyOperationsPageData, getDailyOperationsMonthData, todayIso } from "@/features/daily-operations/queries";
import { requireUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function OperationsPage({
  searchParams,
}: {
  searchParams?: Promise<{ date?: string; employee?: string; error?: string }>;
}) {
  const { profile } = await requireUser();
  const params = await searchParams;
  const date = params?.date?.match(/^\d{4}-\d{2}-\d{2}$/) ? params.date : todayIso();
  
  const [dailyResult, monthlyResult] = await Promise.all([
    getDailyOperationsPageData(profile, date),
    getDailyOperationsMonthData(profile, date.slice(0, 7))
  ]);

  const { rows, error } = dailyResult;
  const isManager = profile.role === "manager";

  const clientRows = rows.map((row) => ({
    employee_id: row.employee_id,
    full_name: row.full_name,
    email: row.email,
    role: row.role,
    avatar_url: row.avatar_url,
    supportLog: row.supportLog,
    testingLogs: row.testingLogs,
  }));

  const clientMonthlyRows = (monthlyResult.rows ?? []).map((row) => ({
    employee_id: row.employee_id,
    full_name: row.full_name,
    email: row.email,
    role: row.role,
    avatar_url: row.avatar_url,
    shift: row.shift,
    supportLogs: row.supportLogs,
    testingLogs: row.testingLogs,
  }));

  const finalError = error || monthlyResult.error;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Log"
        description="A fast daily workflow for noting tickets, chats, testing, and notes for each employee."
      />

      {params?.error ? (
        <ErrorState title="Operation could not be completed" description={params.error.replaceAll("-", " ")} />
      ) : null}
      {finalError ? <ErrorState title="Unable to load daily operations" description={finalError} /> : null}

      {isManager ? <OperationsKpis rows={rows} /> : null}

      <DailyOperationsClient
        rows={clientRows}
        initialDate={date}
        isManager={isManager}
        monthlyRows={clientMonthlyRows}
      />
    </div>
  );
}
