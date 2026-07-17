import { Search } from "lucide-react";
import { signOutAction } from "@/features/auth/actions";
import { roleLabels, type UserProfile } from "@/lib/auth/roles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";

export function Header({ profile }: { profile: UserProfile }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="hidden min-w-0 flex-1 items-center rounded-xl border border-border bg-slate-50/50 dark:bg-slate-900/30 px-4 py-2 text-xs font-medium text-muted-foreground md:flex transition-all hover:border-border/90">
          <Search className="mr-2.5 h-4 w-4 text-muted-foreground/80" />
          Search people, reports, activity...
        </div>
        <div className="flex flex-1 items-center justify-between gap-4 md:flex-none">
          <div className="min-w-0 text-right">
            <p className="truncate text-sm font-bold text-foreground tracking-tight">{profile.full_name}</p>
            <Badge variant="secondary" className="mt-0.5 rounded-full px-2 py-0 text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {roleLabels[profile.role]}
            </Badge>
          </div>
          <ThemeToggle />
          <form action={signOutAction}>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="rounded-xl px-4 font-semibold text-xs uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
