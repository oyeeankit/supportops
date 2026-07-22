import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { 
  getDailyOperationsPageData, 
  todayIso, 
  getDashboardTrendData,
  getMonthlyPerformanceReport
} from "@/features/daily-operations/queries";
import { ManagerCommandCenter } from "@/features/daily-operations/components/manager-command-center";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { profile } = await requireUser();

  // If not a manager, they should not see this Command Center.
  // We can redirect them to /operations or a simple employee dashboard.
  if (profile.role !== "manager") {
    redirect("/operations");
  }

  const today = todayIso();
  
  // Current month string "YYYY-MM"
  const d = new Date();
  const currentMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

  // Fetch all necessary data points
  const [todayResponse, trendResponse, monthlyResponse] = await Promise.all([
    getDailyOperationsPageData(profile, today),
    getDashboardTrendData(profile, 14),
    getMonthlyPerformanceReport(profile, currentMonth)
  ]);

  if (todayResponse.error) {
    return <div className="p-6 text-destructive">Error loading today's data: {todayResponse.error}</div>;
  }
  if (trendResponse.error) {
    return <div className="p-6 text-destructive">Error loading trend data: {trendResponse.error}</div>;
  }
  if (monthlyResponse.error) {
    return <div className="p-6 text-destructive">Error loading monthly metrics: {monthlyResponse.error}</div>;
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
