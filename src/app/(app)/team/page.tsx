import { PageHeader } from "@/components/app-shell/page-header";
import { EmployeeList } from "@/features/employees/components/employee-list";
import { getEmployees, parseEmployeeListParams } from "@/features/employees/queries";
import { requireUser } from "@/lib/auth/session";

export default async function TeamPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { profile } = await requireUser();
  const params = parseEmployeeListParams((await searchParams) ?? {});
  const { employees, total, error } = await getEmployees(params);

  return (
    <>
      <PageHeader
        title="Team"
        description="Manage employee profiles, roles, shifts, and employment status with Manager-controlled CRUD."
      />
      <EmployeeList
        employees={employees}
        total={total}
        params={params}
        currentProfile={profile}
        error={error}
      />
    </>
  );
}
