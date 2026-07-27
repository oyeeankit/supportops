import Link from "next/link";
import { Search } from "lucide-react";
import { signOutAction } from "@/features/auth/actions";
import { roleLabels, type UserProfile } from "@/lib/auth/roles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { ShareTeamModal } from "./share-team-modal";
import { ResetDataButton } from "./reset-data-button";

export function Header({ profile }: { profile: UserProfile }) {
  const isManager = profile.role === "manager";

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="hidden min-w-0 flex-1 items-center rounded-xl border border-border bg-slate-50/50 dark:bg-slate-900/30 px-4 py-2 text-xs font-medium text-muted-foreground md:flex">
          <Search className="mr-2.5 h-4 w-4 text-muted-foreground" />
          Search people, reports, activity...
        </div>
        <div className="flex flex-1 items-center justify-between gap-3 md:flex-none">
          <ShareTeamModal />
          {isManager && <ResetDataButton />}
          <div className="min-w-0 text-right">
            <p className="truncate text-sm font-bold text-foreground">{profile.full_name}</p>
            <Badge variant="secondary" className="mt-0.5 rounded-full px-2 py-0 text-[10px] font-bold uppercase tracking-wider">
              {roleLabels[profile.role]}
            </Badge>
          </div>
          <ThemeToggle />
          <form action={signOutAction}>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="rounded-xl px-3 text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
