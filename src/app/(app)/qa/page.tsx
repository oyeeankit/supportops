import { ModulePlaceholder } from "@/components/app-shell/module-placeholder";

export default function QaPage() {
  return (
    <ModulePlaceholder
      title="QA Operations"
      description="Testing task tracking based on completed work, quality, bugs, and regression coverage."
      scope={["Testing task board", "Bug severity tracking", "Regression coverage", "Assigned task updates"]}
    />
  );
}
