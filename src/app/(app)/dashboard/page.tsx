import { requireUser } from "@/lib/auth/session";
import { 
  getDailyOperationsPageData, 
  todayIso, 
  getDashboardTrendData,
  getMonthlyPerformanceReport
} from "@/features/daily-operations/queries";
import { getEmployeeSubmissions } from "@/features/daily-reports/queries";
import { ManagerCommandCenter } from "@/features/daily-operations/components/manager-command-center";
import { EmployeeDashboard } from "@/features/daily-reports/components/employee-dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { profile } = await requireUser();
  const today = todayIso();

  const d = new Date();
  const currentMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

  // Non-manager Team Members (Support & QA Engineers) see their tailored Employee Dashboard
  if (profile.role !== "manager") {
    const { submissions } = await getEmployeeSubmissions(profile, currentMonth);
    return (
      <div className="p-4 md:p-6 lg:p-8 w-full">
        <EmployeeDashboard
          profile={profile}
          submissions={submissions}
          todayStr={today}
        />
      </div>
    );
  }

  // Manager Command Center Overview
  const [todayResponse, trendResponse, monthlyResponse] = await Promise.all([
    getDailyOperationsPageData(profile, today),
    getDashboardTrendData(profile, 14),
    getMonthlyPerformanceReport(profile, currentMonth)
  ]);

  if (todayResponse.error) {
    return <div className="p-6 text-destructive">Error loading today's data: {todayResponse.error}</div>;
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 w-full">
      <ManagerCommandCenter 
        profile={profile}
        todayData={todayResponse.rows}
        trendData={trendResponse.data}
        monthlySummary={monthlyResponse.summary}
        monthlyRows={monthlyResponse.rows}
      />
    </div>
  );
}
