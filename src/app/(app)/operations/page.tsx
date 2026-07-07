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
  searchParams?: Promise<{ date?: string; employee?: string; error?: string }>;
}) {
  const { profile } = await requireUser();
  const params = await searchParams;
  const date = params?.date?.match(/^\d{4}-\d{2}-\d{2}$/) ? params.date : todayIso();
  const { rows, error } = await getDailyOperationsPageData(profile, date);
  const isManager = profile.role === "manager";
  const availableEmployeeIds = rows.map((row) => row.employee_id);
  const initialEmployeeId = isManager
    ? (params?.employee && availableEmployeeIds.includes(params.employee) ? params.employee : "")
    : profile.id;
  const selectedSupportLog = rows.find((row) => row.employee_id === initialEmployeeId)?.supportLog ?? null;
  const selectedTestingLog = rows.find((row) => row.employee_id === initialEmployeeId)?.testingLog ?? null;

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

      <DailyEntryForm
        key={`${date}-${initialEmployeeId || "no-employee"}`}
        employeeId={initialEmployeeId}
        date={date}
        supportLog={selectedSupportLog}
        testingLog={selectedTestingLog}
        employees={isManager ? rows.map((row) => ({ id: row.employee_id, fullName: row.full_name, role: row.role, supportLog: row.supportLog, testingLog: row.testingLog })) : []}
      />

      {isManager ? <ManagerOverview rows={rows} date={date} /> : null}
    </div>
  );
}
