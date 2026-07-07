"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileText,
  Gauge,
  LineChart,
  Settings,
  ShieldCheck,
  SquareActivity,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { UserProfile } from "@/lib/auth/roles";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/team", label: "Team", icon: Users },
  { href: "/operations", label: "Daily Operations", icon: SquareActivity },
  { href: "/qa", label: "QA Operations", icon: ShieldCheck },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings, managerOnly: true },
];

export function Sidebar({ profile }: { profile: UserProfile }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 border-r border-border bg-sidebar px-4 py-5 lg:flex lg:flex-col">
      <Link href="/dashboard" className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <LineChart className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-sidebar-foreground">SupportOps</p>
          <p className="text-xs text-muted-foreground">Team Operations</p>
        </div>
      </Link>

      <nav className="space-y-1">
        {navItems
          .filter((item) => !item.managerOnly || profile.role === "manager")
          .map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  active && "bg-sidebar-accent text-sidebar-foreground",
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
