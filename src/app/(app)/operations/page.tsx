import { PageHeader } from "@/components/app-shell/page-header";
import { ErrorState } from "@/components/feedback/error-state";
import { DailyEntryForm } from "@/features/daily-operations/components/daily-entry-form";
import { ManagerOverview } from "@/features/daily-operations/components/manager-overview";
import { OperationsKpis } from "@/features/daily-operations/components/operations-kpis";
import { getDailyOperationsPageData, todayIso } from "@/features/daily-operations/queries";
import { requireUser } from "@/lib/auth/session";

export default async function OperationsPage({
  searchParams,
}: {
  searchParams?: Promise<{ date?: string; error?: string }>;
}) {
  const { profile } = await requireUser();
  const params = await searchParams;
  const date = params?.date?.match(/^\d{4}-\d{2}-\d{2}$/) ? params.date : todayIso();
  const { rows, myOperation, error } = await getDailyOperationsPageData(profile, date);
  const isManager = profile.role === "manager";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Operations"
        description="One daily workspace for support tickets, chats, testing focus, simple employee status, and team visibility."
      />

      {params?.error ? (
        <ErrorState title="Operation could not be completed" description={params.error.replaceAll("-", " ")} />
      ) : null}
      {error ? <ErrorState title="Unable to load daily operations" description={error} /> : null}

      {isManager ? <OperationsKpis rows={rows} /> : null}

      <DailyEntryForm employeeId={profile.id} date={date} operation={myOperation} />

      {isManager ? <ManagerOverview rows={rows} date={date} /> : null}
    </div>
  );
}
