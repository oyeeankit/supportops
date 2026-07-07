import { ModulePlaceholder } from "@/components/app-shell/module-placeholder";
import { requireRole } from "@/lib/auth/session";

export default async function SettingsPage() {
  await requireRole(["manager"]);

  return (
    <ModulePlaceholder
      title="Settings"
      description="Manager-only configuration for roles, permissions, scoring rules, and app preferences."
      scope={["Role management", "Permission matrix", "Scoring settings", "App preferences"]}
    />
  );
}
