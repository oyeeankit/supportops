"use client";

import * as React from "react";
import Link from "next/link";
import { X, CheckCircle, Calendar, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type ReminderType =
  | "daily_log"
  | "pending_testing"
  | "missing_attendance"
  | "monthly_report"
  | "leave_approval"
  | "announcement";

type Props = {
  hasLogged: boolean;
  type?: ReminderType;
};

type ConfettiParticle = {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  style: React.CSSProperties;
};

const dailyLogPrompts = [
  "👋 Good morning! Don't forget today's work log.",
  "🚀 Ready to finish today's update? It only takes a minute.",
  "📋 Your Daily Log is waiting. Let's keep your progress updated.",
  "⭐ Great teams log their work daily. Click below to continue.",
  "💼 One small update today helps build your monthly report automatically.",
];

export function DailyLogReminder({ hasLogged, type = "daily_log" }: Props) {
  const [visible, setVisible] = React.useState(false);
  const [speechText, setSpeechText] = React.useState("");
  const [mascotState, setMascotState] = React.useState<"idle" | "waving" | "pointing" | "success">("idle");
  const [confetti, setConfetti] = React.useState<ConfettiParticle[]>([]);
  const [celebrating, setCelebrating] = React.useState(false);

  const prevLoggedRef = React.useRef(hasLogged);
  const todayStr = React.useMemo(() => new Date().toISOString().slice(0, 10), []);

  // 1. Initialise speech text & handle delay entrance
  React.useEffect(() => {
    // Select random prompt
    const randomIdx = Math.floor(Math.random() * dailyLogPrompts.length);
    setSpeechText(dailyLogPrompts[randomIdx]);

    if (hasLogged) {
      setVisible(false);
      return;
    }

    // Check storage filters
    const isDismissedToday = localStorage.getItem(`reminder_dismissed_${type}`) === todayStr;
    const isRemindLater = sessionStorage.getItem(`reminder_remind_later_${type}`) === "1";

    if (isDismissedToday || isRemindLater) {
      setVisible(false);
      return;
    }

    // Show after 2 seconds
    const timer = setTimeout(() => {
      setVisible(true);
      // Greet the user by waving
      setMascotState("waving");
      const waveTimer = setTimeout(() => setMascotState("pointing"), 3000);
      return () => clearTimeout(waveTimer);
    }, 2000);

    return () => clearTimeout(timer);
  }, [hasLogged, todayStr, type]);

  // 2. React to log submission success
  const triggerSuccessCelebration = React.useCallback(() => {
    setCelebrating(true);
    setVisible(true);
    setMascotState("success");
    setSpeechText("🎉 Great job! Today's work has been recorded. See you tomorrow!");

    // Generate confetti particles
    const particles: ConfettiParticle[] = Array.from({ length: 65 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const velocity = 50 + Math.random() * 120;
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity - 100; // Shoot upwards
      const size = 6 + Math.random() * 8;
      const delay = Math.random() * 0.2;
      const colors = ["#f59e0b", "#10b981", "#3b82f6", "#ec4899", "#8b5cf6", "#ef4444"];
      const color = colors[Math.floor(Math.random() * colors.length)];

      return {
        id: i,
        x: 0,
        y: 0,
        color,
        size,
        style: {
          position: "absolute",
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: color,
          borderRadius: Math.random() > 0.5 ? "50%" : "3px",
          transform: `translate3d(${tx}px, ${ty}px, 0) rotate(${Math.random() * 360}deg)`,
          transition: `transform 2.2s cubic-bezier(0.1, 0.8, 0.3, 1) ${delay}s, opacity 2s ease-out ${delay}s`,
          opacity: 0,
          left: "50%",
          top: "80%",
        },
      };
    });

    setConfetti(particles);

    // Fade out after 5 seconds
    const hideTimer = setTimeout(() => {
      setVisible(false);
      setCelebrating(false);
    }, 5500);

    return () => clearTimeout(hideTimer);
  }, []);

  // Monitor hasLogged prop change
  React.useEffect(() => {
    if (!prevLoggedRef.current && hasLogged) {
      triggerSuccessCelebration();
    }
    prevLoggedRef.current = hasLogged;
  }, [hasLogged, triggerSuccessCelebration]);

  // Monitor custom save operations event
  React.useEffect(() => {
    const handleSuccessEvent = () => {
      triggerSuccessCelebration();
    };
    window.addEventListener("daily_log_submitted", handleSuccessEvent);
    return () => window.removeEventListener("daily_log_submitted", handleSuccessEvent);
  }, [triggerSuccessCelebration]);

  const handleDismissToday = () => {
    localStorage.setItem(`reminder_dismissed_${type}`, todayStr);
    setVisible(false);
  };

  const handleRemindLater = () => {
    sessionStorage.setItem(`reminder_remind_later_${type}`, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[999] flex flex-col items-end gap-3 pointer-events-none select-none">
      {/* Speech Card */}
      <div className="pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-border/80 p-5 rounded-2xl shadow-xl max-w-sm text-xs font-bold text-foreground flex flex-col gap-3.5 transition-all duration-300 animate-talk-bounce shadow-blue-500/5">
        {!celebrating && (
          <button
            onClick={handleRemindLater}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground p-0.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Close reminder"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        <p className="pr-4 leading-relaxed text-sm tracking-tight text-slate-700 dark:text-slate-200">
          {speechText}
        </p>

        {!celebrating ? (
          <div className="flex flex-col gap-2">
            <Link
              href="/operations"
              className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-[10px] uppercase tracking-wider py-2.5 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/35 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              <Calendar className="h-3.5 w-3.5" />
              Log Today's Work
            </Link>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleRemindLater}
                className="rounded-xl border border-border/60 hover:bg-slate-50 dark:hover:bg-slate-800 text-[9px] uppercase tracking-wider font-extrabold text-muted-foreground py-2 hover:text-foreground transition-all"
              >
                Remind Me Later
              </button>
              <button
                onClick={handleDismissToday}
                className="rounded-xl border border-border/60 hover:bg-slate-50 dark:hover:bg-slate-800 text-[9px] uppercase tracking-wider font-extrabold text-muted-foreground py-2 hover:text-foreground transition-all"
              >
                Dismiss Today
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-extrabold mt-0.5 animate-pulse">
            <CheckCircle className="h-4 w-4" />
            <span>Success locked in!</span>
          </div>
        )}
      </div>

      {/* Confetti Container */}
      {celebrating && (
        <div className="absolute inset-0 pointer-events-none z-[1000]">
          {confetti.map((particle) => (
            <div
              key={particle.id}
              style={{
                ...particle.style,
                opacity: 1, // Will fade out with transition
              }}
              className="animate-confetti"
            />
          ))}
        </div>
      )}

      {/* Interactive Mascot Block */}
      <div className="relative pointer-events-auto cursor-pointer flex flex-col items-center">
        {/* Soft mascot depth shadow */}
        <div className="absolute bottom-[-2px] w-12 h-2.5 rounded-full bg-slate-900/10 dark:bg-black/20 animate-robot-shadow" />

        {/* Vector Robot */}
        <div className="animate-robot-float">
          <div className={cn("transition-transform duration-500", mascotState === "success" && "animate-robot-jump")}>
            <svg viewBox="0 0 120 120" className="w-24 h-24 drop-shadow-lg">
              {/* Antenna */}
              <line x1="60" y1="36" x2="60" y2="22" stroke="#475569" strokeWidth="3" />
              <circle
                cx="60"
                cy="19"
                r="4.5"
                className={cn(
                  "fill-blue-500 transition-colors",
                  mascotState === "success" ? "fill-emerald-500 animate-pulse" : "animate-pulse"
                )}
              />

              {/* Ears / Side Bolts */}
              <rect x="29" y="47" width="6" height="12" rx="2" fill="#94a3b8" />
              <rect x="85" y="47" width="6" height="12" rx="2" fill="#94a3b8" />

              {/* Head */}
              <rect
                x="32"
                y="36"
                width="56"
                height="40"
                rx="14"
                fill="#3b82f6"
                stroke="#1d4ed8"
                strokeWidth="3.5"
                className="transition-colors duration-500"
              />
              {/* Face Screen */}
              <rect x="40" y="44" width="40" height="24" rx="8" fill="#1e293b" />
              {/* Eyes */}
              <g className="animate-eyes-blink">
                <circle
                  cx="49"
                  cy="56"
                  r="4"
                  className={cn("fill-sky-400 transition-colors", mascotState === "success" && "fill-emerald-400")}
                />
                <circle
                  cx="71"
                  cy="56"
                  r="4"
                  className={cn("fill-sky-400 transition-colors", mascotState === "success" && "fill-emerald-400")}
                />
              </g>

              {/* Neck */}
              <rect x="54" y="76" width="12" height="6" fill="#64748b" />

              {/* Body */}
              <rect x="36" y="82" width="48" height="34" rx="10" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="3.5" />
              {/* Core chest light */}
              <circle
                cx="60"
                cy="98"
                r="5.5"
                className={cn(
                  "transition-colors",
                  mascotState === "success" ? "fill-emerald-500 animate-ping" : "fill-blue-400 animate-pulse"
                )}
              />

              {/* Left Arm (Waving) */}
              <g className={cn("transition-transform origin-[32px_88px]", mascotState === "waving" && "animate-arm-wave")}>
                <path d="M36,88 C25,84 20,80 20,80" fill="none" stroke="#3b82f6" strokeWidth="5.5" strokeLinecap="round" />
                <circle cx="19" cy="79" r="3.5" fill="#1d4ed8" />
              </g>

              {/* Right Arm (Pointing) */}
              <g className={cn("transition-transform origin-[84px_88px]", mascotState === "pointing" && "animate-arm-point")}>
                <path d="M84,88 C94,86 102,82 102,82" fill="none" stroke="#3b82f6" strokeWidth="5.5" strokeLinecap="round" />
                <circle cx="103" cy="81" r="3.5" fill="#1d4ed8" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
