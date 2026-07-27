import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getEmployeeSubmissions } from "@/features/daily-reports/queries";
import { MyReportsList } from "@/features/daily-reports/components/my-reports-list";

export const dynamic = "force-dynamic";

export default async function MyReportsPage({
  searchParams,
}: {
  searchParams?: Promise<{ month?: string }>;
}) {
  const { profile } = await requireUser();

  // Managers do not submit personal daily reports; redirect to Submissions console
  if (profile.role === "manager") {
    redirect("/operations/submissions");
  }

  const params = await searchParams;
  const currentMonth = params?.month || new Date().toISOString().substring(0, 7);

  const { submissions, error } = await getEmployeeSubmissions(profile, currentMonth);

  if (error) {
    return <div className="p-6 text-destructive">Error loading report history: {error}</div>;
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 w-full">
      <MyReportsList submissions={submissions} monthFilter={currentMonth} />
    </div>
  );
}
