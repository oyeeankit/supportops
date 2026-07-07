"use client";

import { ErrorState } from "@/components/feedback/error-state";

export default function OperationsError({ error }: { error: Error }) {
  return <ErrorState title="Daily Operations error" description={error.message} />;
}
