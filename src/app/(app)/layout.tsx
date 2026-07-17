import { Header } from "@/components/app-shell/header";
import { MobileNav } from "@/components/app-shell/mobile-nav";
import { Sidebar } from "@/components/app-shell/sidebar";
import { AppLoadingProvider } from "@/components/feedback/app-loading";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { DailyLogReminder } from "@/features/daily-operations/components/daily-log-reminder";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireUser();

  const today = new Date().toISOString().slice(0, 10);
  const supabase = await createClient();
  const { data: log } = await supabase
    .from("daily_support_logs")
    .select("id")
    .eq("employee_id", profile.id)
    .eq("log_date", today)
    .maybeSingle();

  const hasLoggedToday = !!log;

  return (
    <AppLoadingProvider>
      <div className="min-h-screen bg-background">
        <div className="flex min-h-screen">
          <Sidebar profile={profile} />
          <div className="flex min-w-0 flex-1 flex-col">
            <Header profile={profile} />
            <main className="flex-1 px-4 pb-24 pt-6 sm:px-6 lg:pb-8">{children}</main>
          </div>
        </div>
        <MobileNav />
        <DailyLogReminder hasLogged={hasLoggedToday} />
      </div>
    </AppLoadingProvider>
  );
}
