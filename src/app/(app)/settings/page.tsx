import { requireRole } from "@/lib/auth/session";
import { getEmailSettings } from "@/lib/notifications/settings-service";
import { getEmailLogsAction } from "@/features/settings/actions";
import { SettingsClient } from "./settings-client";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireRole(["manager"]);

  const [emailSettings, emailLogs] = await Promise.all([
    getEmailSettings(),
    getEmailLogsAction(),
  ]);

  return <SettingsClient emailSettings={emailSettings} emailLogs={emailLogs} />;
}
