"use client";

import React, { useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Float, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { LoginCharacter, type AnimationStep } from "./login-character";
import { LoginForm } from "./login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ShieldCheck, Play, Pause, RotateCcw } from "lucide-react";

interface SceneContentProps {
  step: AnimationStep;
  setStep: (step: AnimationStep) => void;
  configured: boolean;
  error?: string;
  isPaused: boolean;
}

function SceneContent({ step, setStep, configured, error, isPaused }: SceneContentProps) {
  const charGroupRef = useRef<THREE.Group>(null!);
  const formGroupRef = useRef<THREE.Group>(null!);
  const [charPos, setCharPos] = useState<[number, number, number]>([-7, -1, 0]);
  const [formPos, setFormPos] = useState<[number, number, number]>([-10, 0, 0]);
  const [isHovered, setIsHovered] = useState(false);

  useFrame((state, delta) => {
    // Smoothly interpolate positions based on current step
    let targetCharX = -7;
    let targetFormX = -10;
    let targetFormScale = 0.85;

    if (step === 0) {
      targetCharX = -2.2;
      targetFormX = -8;
    } else if (step === 1) {
      targetCharX = -1.8;
      targetFormX = -7;
    } else if (step === 2) {
      // Pulling form into center
      targetCharX = 2.4;
      targetFormX = 0;
      targetFormScale = 0.95;
    } else if (step === 3) {
      // Settling in center
      targetCharX = 2.4;
      targetFormX = 0;
      targetFormScale = 1.0;
    } else if (step === 4) {
      // Idle stage
      targetCharX = 2.5;
      targetFormX = 0;
      targetFormScale = 1.0;
    }

    if (charGroupRef.current) {
      charGroupRef.current.position.x = THREE.MathUtils.lerp(
        charGroupRef.current.position.x,
        targetCharX,
        delta * 3
      );
    }

    if (formGroupRef.current) {
      formGroupRef.current.position.x = THREE.MathUtils.lerp(
        formGroupRef.current.position.x,
        targetFormX,
        delta * 3.5
      );
      const currentScale = formGroupRef.current.scale.x;
      const newScale = THREE.MathUtils.lerp(currentScale, targetFormScale, delta * 3);
      formGroupRef.current.scale.set(newScale, newScale, newScale);
    }
  });

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[6, 8, 5]} intensity={1.4} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-6, 4, -4]} intensity={0.4} color="#38bdf8" />
      <pointLight position={[0, 2, 2]} intensity={0.8} color="#6366f1" />

      {/* Floating Ambient Lights / Visual Magic */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh position={[-3, 3, -2]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.6} transparent opacity={0.6} />
        </mesh>
        <mesh position={[4, -1, -2]}>
          <octahedronGeometry args={[0.4]} />
          <meshStandardMaterial color="#818cf8" emissive="#4f46e5" emissiveIntensity={0.6} transparent opacity={0.7} />
        </mesh>
      </Float>

      {/* 3D Character */}
      <group ref={charGroupRef} position={[-7, -1, 0]} onPointerOver={() => setIsHovered(true)} onPointerOut={() => setIsHovered(false)}>
        <LoginCharacter step={step} progress={0} isHovered={isHovered} />
      </group>

      {/* Login Form 3D Container */}
      <group ref={formGroupRef} position={[-10, 0, 0]}>
        <Html
          transform
          occlude="blending"
          distanceFactor={5.5}
          position={[0, 0, 0]}
          className="pointer-events-auto select-none"
        >
          <div className="w-[400px] rounded-3xl border border-white/20 bg-background/80 p-1 backdrop-blur-xl shadow-2xl transition-all duration-300 dark:border-white/10 dark:bg-slate-900/85">
            <Card className="border-0 bg-transparent shadow-none">
              <CardHeader className="space-y-1 text-center pb-4">
                <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 text-white shadow-lg shadow-blue-500/25 ring-4 ring-blue-500/10">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text">
                  SupportOps Portal
                </CardTitle>
                <CardDescription className="text-sm font-medium text-muted-foreground">
                  Sign in to manage daily support and QA operations.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!configured ? (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs font-medium text-amber-700 dark:text-amber-300">
                    Supabase environment variables missing. Add your project credentials to `.env.local`.
                  </div>
                ) : null}

                {error === "profile" ? (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs font-medium text-red-700 dark:text-red-300">
                    Your login exists, but no SupportOps profile is assigned yet. Ask a Manager to assign your role.
                  </div>
                ) : null}

                <LoginForm />
              </CardContent>
            </Card>
          </div>
        </Html>
      </group>

      {/* Floor Shadows */}
      <ContactShadows position={[0, -1.05, 0]} opacity={0.65} scale={12} blur={2.5} far={4} color="#0f172a" />
    </>
  );
}

export function LoginScene({ configured, error }: { configured: boolean; error?: string }) {
  const [step, setStep] = useState<AnimationStep>(0);
  const [isPaused, setIsPaused] = useState(false);

  // Control automated step sequence timer
  useEffect(() => {
    if (isPaused) return;

    const timers: NodeJS.Timeout[] = [];

    // Step 0 -> Step 1 (Walk to Wave) at 2.2s
    timers.push(setTimeout(() => setStep(1), 2200));

    // Step 1 -> Step 2 (Wave to Grab/Pull) at 4.2s
    timers.push(setTimeout(() => setStep(2), 4200));

    // Step 2 -> Step 3 (Pull to Place) at 6.8s
    timers.push(setTimeout(() => setStep(3), 6800));

    // Step 3 -> Step 4 (Place to Idle) at 8.2s
    timers.push(setTimeout(() => setStep(4), 8200));

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [isPaused]);

  const restartAnimation = () => {
    setStep(0);
    setIsPaused(false);
  };

  const stepLabels: Record<AnimationStep, string> = {
    0: "Mascot Walking In...",
    1: "Waving Hello!",
    2: "Bringing Login Form...",
    3: "Setting Up Form...",
    4: "Ready for Sign In",
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-foreground">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      {/* Top Brand Bar */}
      <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 backdrop-blur-md">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white shadow-md shadow-blue-500/30">
            SO
          </div>
          <span className="text-sm font-semibold tracking-wide text-white">SupportOps</span>
        </div>

        {/* Animation Controller / Replay Button */}
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/40 px-3 py-1.5 backdrop-blur-md">
          <span className="text-xs font-medium text-slate-300 px-2 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            {stepLabels[step]}
          </span>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            title={isPaused ? "Play" : "Pause"}
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>
          <button
            onClick={restartAnimation}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            title="Replay Entrance Animation"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas */}
      <Canvas
        camera={{ position: [0, 0.8, 6.5], fov: 45 }}
        className="h-full w-full"
        gl={{ antialias: true, alpha: true }}
      >
        <SceneContent
          step={step}
          setStep={setStep}
          configured={configured}
          error={error}
          isPaused={isPaused}
        />
      </Canvas>
    </div>
  );
}
