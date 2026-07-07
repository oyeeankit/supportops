import Link from "next/link";
import { PageHeader } from "@/components/app-shell/page-header";
import { buttonVariants } from "@/components/ui/button";
import { ErrorState } from "@/components/feedback/error-state";
import { EmployeeForm } from "@/features/employees/components/employee-form";
import { getEmployeeById } from "@/features/employees/queries";
import { requireRole } from "@/lib/auth/session";
import { cn } from "@/lib/utils/cn";

export default async function EditEmployeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["manager"]);
  const { id } = await params;
  const { employee, error } = await getEmployeeById(id);

  return (
    <>
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <PageHeader
          title="Edit employee"
          description="Update employee details, role assignment, shift, and employment status."
        />
        <Link href={employee ? `/team/${employee.id}` : "/team"} className={cn(buttonVariants({ variant: "outline" }))}>
          Cancel
        </Link>
      </div>
      {error ? <ErrorState title="Unable to load employee" description={error} /> : null}
      {employee ? <EmployeeForm employee={employee} /> : null}
    </>
  );
}
