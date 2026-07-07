import { ModulePlaceholder } from "@/components/app-shell/module-placeholder";

export default function ReportsPage() {
  return (
    <ModulePlaceholder
      title="Reports"
      description="Monthly team reports, employee scorecards, and export-ready summaries."
      scope={["Monthly report filters", "CSV/PDF-ready structure", "Locked scorecard data", "Employee history"]}
    />
  );
}
