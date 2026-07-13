import { PageHeader } from "@/components/app-shell/page-header";
import { ErrorState } from "@/components/feedback/error-state";
import { OperationsKpis } from "@/features/daily-operations/components/operations-kpis";
import { DailyOperationsClient } from "@/features/daily-operations/components/daily-operations-client";
import { getDailyOperationsPageData, todayIso } from "@/features/daily-operations/queries";
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
  const { rows, error } = await getDailyOperationsPageData(profile, date);
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Log"
        description="A fast daily workflow for noting tickets, chats, testing, and notes for each employee."
      />

      {params?.error ? (
        <ErrorState title="Operation could not be completed" description={params.error.replaceAll("-", " ")} />
      ) : null}
      {error ? <ErrorState title="Unable to load daily operations" description={error} /> : null}

      {isManager ? <OperationsKpis rows={rows} /> : null}

      <DailyOperationsClient
        rows={clientRows}
        initialDate={date}
        isManager={isManager}
      />
    </div>
  );
}
