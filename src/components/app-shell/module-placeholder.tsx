import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "./page-header";

export function ModulePlaceholder({
  title,
  description,
  scope,
}: {
  title: string;
  description: string;
  scope: string[];
}) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <Card>
        <CardHeader>
          <CardTitle>Module planned</CardTitle>
          <CardDescription>
            This screen is part of the approved navigation foundation. Business functionality will
            be implemented module by module after approval.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3 sm:grid-cols-2">
            {scope.map((item) => (
              <li key={item} className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
