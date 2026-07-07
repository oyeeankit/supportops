import Link from "next/link";
import { Edit, Eye, UserPlus } from "lucide-react";
import { roleLabels, type UserProfile } from "@/lib/auth/roles";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { DataTable, SortLink, type DataTableColumn } from "@/components/data/data-table";
import { Pagination } from "@/components/data/pagination";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { cn } from "@/lib/utils/cn";
import { deactivateEmployeeAction } from "../actions";
import { employmentStatusLabels, shiftLabels, type Employee, type EmployeeListParams } from "../types";
import { EmployeeFilters } from "./employee-filters";

export function EmployeeList({
  employees,
  total,
  params,
  currentProfile,
  error,
}: {
  employees: Employee[];
  total: number;
  params: EmployeeListParams;
  currentProfile: UserProfile;
  error: string | null;
}) {
  const isManager = currentProfile.role === "manager";
  const searchParams = new URLSearchParams({
    query: params.query,
    role: params.role,
    status: params.status,
    shift: params.shift,
    sort: params.sort,
    direction: params.direction,
    page: String(params.page),
  });

  const sortableHeader = (label: string, field: EmployeeListParams["sort"]) => (
    <SortLink
      label={label}
      field={field}
      currentSort={params.sort}
      currentDirection={params.direction}
      basePath="/team"
      searchParams={searchParams}
    />
  );

  const columns: DataTableColumn<Employee>[] = [
    {
      key: "employee",
      label: sortableHeader("Employee", "full_name"),
      render: (employee) => (
        <div className="flex items-center gap-3">
          <Avatar name={employee.full_name} src={employee.avatar_url} />
          <div>
            <Link href={`/team/${employee.id}`} className="font-medium hover:text-primary">
              {employee.full_name}
            </Link>
            <p className="text-xs text-muted-foreground">{employee.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: sortableHeader("Role", "role"),
      render: (employee) => roleLabels[employee.role],
    },
    {
      key: "shift",
      label: sortableHeader("Shift", "shift"),
      render: (employee) => shiftLabels[employee.shift],
    },
    {
      key: "status",
      label: sortableHeader("Status", "employment_status"),
      render: (employee) => (
        <Badge variant={employee.employment_status === "active" ? "success" : "secondary"}>
          {employmentStatusLabels[employee.employment_status]}
        </Badge>
      ),
    },
    {
      key: "joined",
      label: sortableHeader("Joined", "joined_at"),
      render: (employee) => employee.joined_at ?? "Not set",
    },
    {
      key: "actions",
      label: "Actions",
      className: "text-right",
      render: (employee) => (
        <div className="flex justify-end gap-2">
          <Link href={`/team/${employee.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            <Eye className="h-4 w-4" />
            View
          </Link>
          {isManager ? (
            <>
              <Link href={`/team/${employee.id}/edit`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                <Edit className="h-4 w-4" />
                Edit
              </Link>
              {employee.employment_status === "active" ? (
                <form action={deactivateEmployeeAction}>
                  <input type="hidden" name="id" value={employee.id} />
                  <Button type="submit" variant="secondary" size="sm">
                    Deactivate
                  </Button>
                </form>
              ) : null}
            </>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <EmployeeFilters params={params} />
        {isManager ? (
          <Link href="/team/new" className={cn(buttonVariants({ size: "default" }), "shrink-0")}>
            <UserPlus className="h-4 w-4" />
            Add employee
          </Link>
        ) : null}
      </div>

      {error ? <ErrorState title="Unable to load employees" description={error} /> : null}

      <DataTable
        data={employees}
        columns={columns}
        empty={
          <EmptyState
            title="No employees found"
            description="Try adjusting your filters, or add the first employee if you are signed in as Manager."
            action={
              isManager ? (
                <Link href="/team/new" className={cn(buttonVariants())}>
                  Add employee
                </Link>
              ) : null
            }
          />
        }
      />

      <Pagination page={params.page} pageSize={params.pageSize} total={total} basePath="/team" searchParams={searchParams} />
    </div>
  );
}
