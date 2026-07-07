import { Search } from "lucide-react";
import { roleLabels, roles } from "@/lib/auth/roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { employmentStatusLabels, employmentStatusOptions, shiftLabels, shiftOptions, type EmployeeListParams } from "../types";

export function EmployeeFilters({ params }: { params: EmployeeListParams }) {
  return (
    <form className="grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-[1fr_160px_160px_160px_auto]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input name="query" defaultValue={params.query} placeholder="Search employees..." className="pl-9" />
      </div>
      <Select name="role" defaultValue={params.role}>
        <option value="all">All roles</option>
        {roles.map((role) => (
          <option key={role} value={role}>
            {roleLabels[role]}
          </option>
        ))}
      </Select>
      <Select name="status" defaultValue={params.status}>
        <option value="all">All statuses</option>
        {employmentStatusOptions.map((status) => (
          <option key={status} value={status}>
            {employmentStatusLabels[status]}
          </option>
        ))}
      </Select>
      <Select name="shift" defaultValue={params.shift}>
        <option value="all">All shifts</option>
        {shiftOptions.map((shift) => (
          <option key={shift} value={shift}>
            {shiftLabels[shift]}
          </option>
        ))}
      </Select>
      <input type="hidden" name="sort" value={params.sort} />
      <input type="hidden" name="direction" value={params.direction} />
      <Button type="submit">Filter</Button>
    </form>
  );
}
