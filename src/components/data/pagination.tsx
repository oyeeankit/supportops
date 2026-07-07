import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export function Pagination({
  page,
  pageSize,
  total,
  basePath,
  searchParams,
}: {
  page: number;
  pageSize: number;
  total: number;
  basePath: string;
  searchParams: URLSearchParams;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const previousParams = new URLSearchParams(searchParams);
  const nextParams = new URLSearchParams(searchParams);
  previousParams.set("page", String(Math.max(1, page - 1)));
  nextParams.set("page", String(Math.min(totalPages, page + 1)));

  return (
    <div className="flex flex-col items-start justify-between gap-3 pt-4 text-sm text-muted-foreground sm:flex-row sm:items-center">
      <p>
        Page {page} of {totalPages} · {total} total
      </p>
      <div className="flex gap-2">
        {page <= 1 ? (
          <Button type="button" variant="outline" size="sm" disabled>
            Previous
          </Button>
        ) : (
          <Link
            href={`${basePath}?${previousParams.toString()}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Previous
          </Link>
        )}
        {page >= totalPages ? (
          <Button type="button" variant="outline" size="sm" disabled>
            Next
          </Button>
        ) : (
          <Link
            href={`${basePath}?${nextParams.toString()}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Next
          </Link>
        )}
      </div>
    </div>
  );
}
