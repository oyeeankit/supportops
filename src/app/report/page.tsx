"use client";

import dynamic from "next/dynamic";

const PublicReportForm = dynamic(
  () => import("@/features/daily-reports/components/public-report-form").then((mod) => mod.PublicReportForm),
  { ssr: false }
);

export default function PublicReportPage() {
  return (
    <main className="min-h-screen bg-background text-foreground py-10 px-4">
      <PublicReportForm />
    </main>
  );
}
