"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const DynamicInteractiveLoginScene = dynamic(
  () => import("./interactive-login-scene").then((mod) => mod.InteractiveLoginScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/30 shadow-lg shadow-blue-500/20">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-semibold tracking-wide">Initializing 3D Human Avatar</h3>
            <p className="text-xs text-slate-400">Loading SupportOps portal environment...</p>
          </div>
        </div>
      </div>
    ),
  }
);

export function LoginSceneWrapper({
  configured,
  error,
}: {
  configured: boolean;
  error?: string;
}) {
  return <DynamicInteractiveLoginScene configured={configured} error={error} />;
}
