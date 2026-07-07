import { Search } from "lucide-react";
import { signOutAction } from "@/features/auth/actions";
import { roleLabels, type UserProfile } from "@/lib/auth/roles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";

export function Header({ profile }: { profile: UserProfile }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="hidden min-w-0 flex-1 items-center rounded-md border border-input bg-muted/40 px-3 py-2 text-sm text-muted-foreground md:flex">
          <Search className="mr-2 h-4 w-4" />
          Search people, reports, activity...
        </div>
        <div className="flex flex-1 items-center justify-between gap-3 md:flex-none">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{profile.full_name}</p>
            <Badge variant="secondary">{roleLabels[profile.role]}</Badge>
          </div>
          <ThemeToggle />
          <form action={signOutAction}>
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
