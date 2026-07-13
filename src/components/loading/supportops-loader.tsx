import { cn } from "@/lib/utils/cn";

type SupportOpsLoaderProps = {
  label?: string;
  fullScreen?: boolean;
  className?: string;
};

export function SupportOpsLoader({
  label = "Loading...",
  fullScreen = true,
  className,
}: SupportOpsLoaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 bg-background px-4",
        fullScreen ? "min-h-screen" : "min-h-[360px] rounded-lg",
        className,
      )}
      role="status"
      aria-label={label}
    >
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      {label && (
        <p className="text-sm text-muted-foreground">{label}</p>
      )}
    </div>
  );
}
