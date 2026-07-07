import Link from "next/link";
import type React from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type DataTableColumn<T> = {
  key: string;
  label: React.ReactNode;
  sortable?: boolean;
  className?: string;
  render: (row: T) => React.ReactNode;
};

export function SortLink({
  label,
  field,
  currentSort,
  currentDirection,
  basePath,
  searchParams,
}: {
  label: string;
  field: string;
  currentSort: string;
  currentDirection: "asc" | "desc";
  basePath: string;
  searchParams: URLSearchParams;
}) {
  const nextParams = new URLSearchParams(searchParams);
  const isActive = currentSort === field;
  const nextDirection = isActive && currentDirection === "asc" ? "desc" : "asc";
  nextParams.set("sort", field);
  nextParams.set("direction", nextDirection);
  nextParams.set("page", "1");
  const Icon = isActive ? (currentDirection === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;

  return (
    <Link
      href={`${basePath}?${nextParams.toString()}`}
      className="inline-flex items-center gap-1 hover:text-foreground"
    >
      {label}
      <Icon className="h-3.5 w-3.5" />
    </Link>
  );
}

export function DataTable<T>({
  data,
  columns,
  empty,
}: {
  data: T[];
  columns: DataTableColumn<T>[];
  empty: React.ReactNode;
}) {
  if (data.length === 0) {
    return <>{empty}</>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={cn("px-4 py-3 font-semibold", column.className)}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((row, index) => (
              <tr key={index} className="bg-card transition-colors hover:bg-muted/50">
                {columns.map((column) => (
                  <td key={column.key} className={cn("px-4 py-3 align-middle", column.className)}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
