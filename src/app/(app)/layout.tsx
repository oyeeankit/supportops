import { Header } from "@/components/app-shell/header";
import { MobileNav } from "@/components/app-shell/mobile-nav";
import { Sidebar } from "@/components/app-shell/sidebar";
import { requireUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireUser();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <Sidebar profile={profile} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header profile={profile} />
          <main className="flex-1 px-4 pb-24 pt-6 sm:px-6 lg:pb-8">{children}</main>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
