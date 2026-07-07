import { AlertCircle } from "lucide-react";

export function ErrorState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
      <div className="flex gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-1 text-sm">{description}</p>
        </div>
      </div>
    </div>
  );
}
