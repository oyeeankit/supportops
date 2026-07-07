import Link from "next/link";
import { PageHeader } from "@/components/app-shell/page-header";
import { buttonVariants } from "@/components/ui/button";
import { EmployeeForm } from "@/features/employees/components/employee-form";
import { requireRole } from "@/lib/auth/session";
import { cn } from "@/lib/utils/cn";

export default async function NewEmployeePage() {
  await requireRole(["manager"]);

  return (
    <>
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <PageHeader
          title="Add employee"
          description="Create a SupportOps profile and Supabase Auth user for a team member."
        />
        <Link href="/team" className={cn(buttonVariants({ variant: "outline" }))}>
          Back to team
        </Link>
      </div>
      <EmployeeForm />
    </>
  );
}
