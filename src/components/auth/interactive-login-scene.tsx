"use client";

import React from "react";
import { CharacterProvider, useCharacterContext } from "./character-context";
import { InteractiveMascot } from "./interactive-mascot";
import { LoginForm } from "./login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Sparkles, Lock } from "lucide-react";

interface SceneProps {
  configured: boolean;
  error?: string;
}

function SceneContent({ configured, error }: SceneProps) {
  const { setMousePos } = useCharacterContext();

  const handlePointerMove = (e: React.PointerEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      className="relative min-h-screen w-full flex items-center justify-center p-4 select-none bg-slate-950 text-foreground overflow-hidden"
    >
      {/* Background Radial Glow & Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,#1e1b4b_0%,#020617_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#33415515_1px,transparent_1px),linear-gradient(to_bottom,#33415515_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      {/* Floating Ambient Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-blue-600/15 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-indigo-600/15 blur-[140px] pointer-events-none animate-pulse" />

      {/* Top Header */}
      <div className="absolute top-6 left-6 right-6 z-30 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 backdrop-blur-md shadow-xl">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-md shadow-blue-500/25">
            SO
          </div>
          <span className="text-sm font-semibold tracking-wide text-white">SupportOps</span>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/40 px-3.5 py-2 backdrop-blur-md text-xs font-medium text-slate-300 shadow-xl">
          <span className="flex items-center gap-1.5 text-blue-400">
            <Sparkles className="h-3.5 w-3.5" />
            Interactive Security Experience
          </span>
        </div>
      </div>

      {/* Glassmorphism Card with Mascot */}
      <div className="relative z-20 w-full max-w-md my-auto">
        <div className="rounded-3xl border border-white/15 bg-slate-900/80 p-2 backdrop-blur-2xl shadow-2xl ring-1 ring-white/10 transition-all duration-300">
          <Card className="border-0 bg-transparent shadow-none">
            <CardHeader className="space-y-1 text-center pb-2">
              {/* Interactive Security Buddy Mascot */}
              <InteractiveMascot />

              <CardTitle className="text-2xl font-bold tracking-tight text-white pt-2">
                SupportOps Portal
              </CardTitle>
              <CardDescription className="text-xs font-medium text-slate-400">
                Sign in to manage daily support and QA operations.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {!configured ? (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs font-medium text-amber-300">
                  Supabase environment variables missing. Add credentials to `.env.local`.
                </div>
              ) : null}

              {error === "profile" ? (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs font-medium text-red-300">
                  Your login exists, but no SupportOps profile is assigned yet. Contact your Manager.
                </div>
              ) : null}

              <LoginForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function InteractiveLoginScene(props: SceneProps) {
  return (
    <CharacterProvider>
      <SceneContent {...props} />
    </CharacterProvider>
  );
}
