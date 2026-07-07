"use client";

import { ErrorState } from "@/components/feedback/error-state";

export default function TeamError({ error }: { error: Error }) {
  return <ErrorState title="Team module error" description={error.message} />;
}
