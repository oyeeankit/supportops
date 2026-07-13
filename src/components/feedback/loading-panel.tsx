import { cn } from "@/lib/utils/cn";

type LoadingPanelProps = {
  label?: string;
  variant?: "card" | "table" | "stats" | "form";
};

export function LoadingPanel({ label = "Loading...", variant = "card" }: LoadingPanelProps) {
  if (variant === "table") {
    return (
      <div className="space-y-4" aria-label={label} role="status">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-10 flex-1 animate-pulse rounded-md bg-muted" />
              <div className="h-10 w-24 animate-pulse rounded-md bg-muted" />
              <div className="h-10 w-20 animate-pulse rounded-md bg-muted" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "stats") {
    return (
      <div className="space-y-4" aria-label={label} role="status">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-3 rounded-lg border border-border p-4">
              <div className="h-3 w-20 animate-pulse rounded bg-muted" />
              <div className="h-8 w-16 animate-pulse rounded bg-muted" />
              <div className="h-2 w-full animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "form") {
    return (
      <div className="space-y-5" aria-label={label} role="status">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-16 animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
            </div>
          ))}
        </div>
        <div className="h-10 w-32 animate-pulse rounded-md bg-muted" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-3")} aria-label={label} role="status">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="h-28 animate-pulse rounded-lg bg-muted" />
      <div className="h-28 animate-pulse rounded-lg bg-muted" />
    </div>
  );
}
