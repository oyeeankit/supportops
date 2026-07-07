import { ModulePlaceholder } from "@/components/app-shell/module-placeholder";

export default function AnalyticsPage() {
  return (
    <ModulePlaceholder
      title="Analytics"
      description="Role-specific monthly scorecards, trends, and fair leaderboards."
      scope={["Support scorecards", "QA scorecards", "Role-based leaderboards", "Transparent metric breakdowns"]}
    />
  );
}
