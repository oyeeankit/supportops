import Link from "next/link";
import { PageHeader } from "@/components/app-shell/page-header";
import { buttonVariants } from "@/components/ui/button";
import { ErrorState } from "@/components/feedback/error-state";
import { EmployeeProfile } from "@/features/employees/components/employee-profile";
import { getEmployeeById } from "@/features/employees/queries";
import { requireUser } from "@/lib/auth/session";
import { cn } from "@/lib/utils/cn";

export default async function EmployeeProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { profile } = await requireUser();
  const { id } = await params;
  const { employee, error } = await getEmployeeById(id);

  return (
    <>
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <PageHeader
          title={employee?.full_name ?? "Employee profile"}
          description="Profile details for role, shift, employment status, and future module activity."
        />
        <Link href="/team" className={cn(buttonVariants({ variant: "outline" }))}>
          Back to team
        </Link>
      </div>
      {error ? <ErrorState title="Unable to load employee" description={error} /> : null}
      {employee ? <EmployeeProfile employee={employee} currentProfile={profile} /> : null}
    </>
  );
}
