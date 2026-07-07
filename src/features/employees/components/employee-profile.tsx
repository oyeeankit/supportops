import Link from "next/link";
import type React from "react";
import { Calendar, Mail, UserRoundCog } from "lucide-react";
import { roleLabels, type UserProfile } from "@/lib/auth/roles";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { deactivateEmployeeAction } from "../actions";
import { employmentStatusLabels, shiftLabels, type Employee } from "../types";

export function EmployeeProfile({
  employee,
  currentProfile,
}: {
  employee: Employee;
  currentProfile: UserProfile;
}) {
  const isManager = currentProfile.role === "manager";

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <Card>
        <CardHeader className="items-center text-center">
          <Avatar name={employee.full_name} src={employee.avatar_url} className="h-20 w-20 text-xl" />
          <CardTitle>{employee.full_name}</CardTitle>
          <p className="text-sm text-muted-foreground">{roleLabels[employee.role]}</p>
          <Badge variant={employee.employment_status === "active" ? "success" : "secondary"}>
            {employmentStatusLabels[employee.employment_status]}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          {isManager ? (
            <div className="grid gap-2">
              <Link href={`/team/${employee.id}/edit`} className={cn(buttonVariants({ variant: "outline" }))}>
                Edit profile
              </Link>
              {employee.employment_status === "active" ? (
                <form action={deactivateEmployeeAction}>
                  <input type="hidden" name="id" value={employee.id} />
                  <Button type="submit" variant="secondary" className="w-full">
                    Deactivate employee
                  </Button>
                </form>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Employee details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Detail icon={<Mail className="h-4 w-4" />} label="Email" value={employee.email} />
            <Detail icon={<UserRoundCog className="h-4 w-4" />} label="Role" value={roleLabels[employee.role]} />
            <Detail label="Shift" value={shiftLabels[employee.shift]} />
            <Detail label="Employee code" value={employee.employee_code ?? "Not set"} />
            <Detail icon={<Calendar className="h-4 w-4" />} label="Joined" value={employee.joined_at ?? "Not set"} />
            <Detail label="Auth user id" value={employee.auth_user_id} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming module connections</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm md:grid-cols-2">
            <div className="rounded-md bg-muted px-3 py-2">Attendance history will appear here.</div>
            <div className="rounded-md bg-muted px-3 py-2">Leave history will appear here.</div>
            <div className="rounded-md bg-muted px-3 py-2">Support logs will appear here.</div>
            <div className="rounded-md bg-muted px-3 py-2">QA tasks and scorecards will appear here.</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-border p-3">
      <p className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="break-all text-sm font-medium">{value}</p>
    </div>
  );
}
