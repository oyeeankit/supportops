"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Gauge, LineChart, Settings, SquareActivity, Users } from "lucide-react";
import { useAppLoading } from "@/components/feedback/app-loading";
import { cn } from "@/lib/utils/cn";
import type { UserProfile } from "@/lib/auth/roles";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/team", label: "Team", icon: Users },
  { href: "/operations", label: "Daily Log", icon: SquareActivity },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings, managerOnly: true },
];

export function Sidebar({ profile }: { profile: UserProfile }) {
  const pathname = usePathname();
  const { startLoading } = useAppLoading();

  return (
    <aside className="hidden w-80 shrink-0 border-r border-border/60 bg-slate-50/40 dark:bg-slate-900/15 backdrop-blur-md px-4 py-6 lg:flex lg:flex-col">
      <Link href="/dashboard" className="mb-8 flex items-center gap-3 px-2 transition-all hover:opacity-90">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
          <LineChart className="h-5 w-5" />
        </div>
        <div>
          <p className="font-extrabold tracking-tight text-sidebar-foreground">SupportOps</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Team Operations</p>
        </div>
      </Link>

      <nav className="space-y-1.5">
        {navItems
          .filter((item) => !item.managerOnly || profile.role === "manager")
          .map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (!active) {
                    startLoading(`Loading ${item.label}...`);
                  }
                }}
                className={cn(
                  "relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wider text-muted-foreground transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-sidebar-foreground hover:translate-x-0.5",
                  active
                    ? "bg-slate-100 dark:bg-slate-800 text-sidebar-foreground border-l-4 border-l-blue-600 dark:border-l-blue-500 shadow-sm"
                    : "border-l-4 border-l-transparent",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
      </nav>
    </aside>
  );
}
