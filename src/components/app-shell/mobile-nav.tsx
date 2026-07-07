"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Gauge, SquareActivity, Users } from "lucide-react";
import { useAppLoading } from "@/components/feedback/app-loading";
import { cn } from "@/lib/utils/cn";

const mobileItems = [
  { href: "/dashboard", label: "Home", icon: Gauge },
  { href: "/team", label: "Team", icon: Users },
  { href: "/operations", label: "Daily Log", icon: SquareActivity },
  { href: "/reports", label: "Reports", icon: FileText },
];

export function MobileNav() {
  const pathname = usePathname();
  const { startLoading } = useAppLoading();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-background lg:hidden">
      {mobileItems.map((item) => {
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
              "flex flex-col items-center gap-1 px-1 py-2 text-[11px] text-muted-foreground",
              active && "text-primary",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
