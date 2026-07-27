import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getManagerSubmissions } from "@/features/daily-reports/queries";
import { ManagerSubmissions } from "@/features/daily-reports/components/manager-submissions";

export const dynamic = "force-dynamic";

export default async function ManagerSubmissionsPage({
  searchParams,
}: {
  searchParams: { date?: string; shift?: string; status?: string; employee?: string };
}) {
  const { profile } = await requireUser();

  if (profile.role !== "manager") {
    redirect("/my-reports");
  }

  const todayStr = searchParams.date || new Date().toISOString().split("T")[0];

  const { submissions, error } = await getManagerSubmissions(profile, {
    date: searchParams.date,
    shift: searchParams.shift,
    status: searchParams.status,
    employeeId: searchParams.employee,
  });

  if (error) {
    return <div className="p-6 text-destructive">Error loading submissions: {error}</div>;
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 w-full">
      <ManagerSubmissions submissions={submissions} todayStr={todayStr} />
    </div>
  );
}
