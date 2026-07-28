"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Gauge, Settings, SquareActivity, Users, ClipboardCheck, FileCheck2 } from "lucide-react";
import { useAppLoading } from "@/components/feedback/app-loading";
import { cn } from "@/lib/utils/cn";
import type { UserProfile } from "@/lib/auth/roles";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/my-reports", label: "My Reports", icon: ClipboardCheck, employeeOnly: true },
  { href: "/operations/submissions", label: "Submissions", icon: FileCheck2, managerOnly: true },
  { href: "/team", label: "Team", icon: Users },
  { href: "/operations", label: "Daily Log", icon: SquareActivity },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings, managerOnly: true },
];

export function Sidebar({ profile }: { profile: UserProfile }) {
  const pathname = usePathname();
  const { startLoading } = useAppLoading();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-card px-4 py-6 lg:flex lg:flex-col">
      <Link href="/dashboard" className="mb-6 flex items-center gap-3 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-black text-sm">
          SO
        </div>
        <div>
          <p className="font-extrabold tracking-tight text-foreground text-base">SupportOps</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Team Operations</p>
        </div>
      </Link>

      <nav className="space-y-1">
        {navItems
          .filter((item) => {
            if (item.managerOnly && profile.role !== "manager") return false;
            if (item.employeeOnly && profile.role === "manager") return false;
            return true;
          })
          .map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}`));

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
                  "flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-bold tracking-wide text-muted-foreground transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground",
                  active && "bg-slate-100 dark:bg-slate-800 text-foreground font-black"
                )}
              >
                <Icon className="h-4.5 w-4.5" />
                {item.label}
              </Link>
            );
          })}
      </nav>
    </aside>
  );
}
