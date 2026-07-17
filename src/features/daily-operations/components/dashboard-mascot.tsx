"use client";

import * as React from "react";
import Link from "next/link";
import { X, Calendar } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Props = {
  count: number;
};

export function DashboardMascot({ count }: Props) {
  const [dismissed, setDismissed] = React.useState(true);
  const [mascotPos, setMascotPos] = React.useState({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = React.useState(false);
  const [facingRight, setFacingRight] = React.useState(true);

  // Mouse coordinate refs for lag-free 60fps tracking
  const cursorRef = React.useRef({ x: 0, y: 0 });

  // Initialize from sessionStorage on mount to prevent SSR hydration mismatch
  React.useEffect(() => {
    const isDismissed = sessionStorage.getItem("dashboard_mascot_dismissed");
    if (!isDismissed) {
      setDismissed(false);
    }
  }, []);

  // Update cursor coordinates on mousemove
  React.useEffect(() => {
    if (dismissed || count === 0) return;

    // Start coordinates at the bottom right corner
    cursorRef.current = {
      x: window.innerWidth - 120,
      y: window.innerHeight - 150,
    };

    const handleMouseMove = (e: MouseEvent) => {
      cursorRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [dismissed, count]);

  // RequestAnimationFrame lerp physics loop
  React.useEffect(() => {
    if (dismissed || count === 0) return;

    let animationFrameId: number;
    let currentX = window.innerWidth - 120;
    let currentY = window.innerHeight - 150;

    const tick = () => {
      // Sits 35px to the right and 35px below the cursor so it never blocks pointer events
      const targetX = cursorRef.current.x + 35;
      const targetY = cursorRef.current.y + 35;

      const dx = targetX - currentX;
      const dy = targetY - currentY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Lerping speed coefficient (0.085 produces a nice smooth trailing effect)
      if (dist > 8) {
        currentX += dx * 0.085;
        currentY += dy * 0.085;

        // Clamp to keep the mascot within the viewport boundary
        const maxX = window.innerWidth - 45;
        const maxY = window.innerHeight - 30;
        const clampedX = Math.max(45, Math.min(maxX, currentX));
        const clampedY = Math.max(120, Math.min(maxY, currentY));

        setMascotPos({ x: clampedX, y: clampedY });
        setIsMoving(true);

        if (Math.abs(dx) > 2) {
          setFacingRight(dx > 0);
        }
      } else {
        setIsMoving(false);
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    // Initialize position instantly on start
    setMascotPos({ x: currentX, y: currentY });

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [dismissed, count]);

  const handleDismiss = () => {
    sessionStorage.setItem("dashboard_mascot_dismissed", "1");
    setDismissed(true);
  };

  if (dismissed || count === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: mascotPos.x,
        top: mascotPos.y,
        transform: "translate(-50%, -100%)",
        zIndex: 9999,
      }}
      className="pointer-events-none flex flex-col items-center gap-1.5 transition-transform duration-75 select-none"
    >
      {/* Speech bubble */}
      <div className="pointer-events-auto animate-talk-bounce relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-border/80 px-4 py-2.5 rounded-2xl shadow-xl text-[10px] font-bold text-foreground flex items-center gap-2.5 whitespace-nowrap shadow-blue-500/5">
        <span className="flex items-center gap-1">
          <span>Log today's data!</span>
          <span className="text-blue-500 dark:text-blue-400 font-extrabold">({count} left)</span>
        </span>
        <Link
          href="/operations"
          className="rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-[9px] uppercase tracking-wider px-3 py-1 hover:opacity-95 transition-all shadow-sm shadow-blue-500/10"
        >
          Go
        </Link>
        <button
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
          title="Dismiss mascot"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      {/* Vector Cat Sprite Wrapper */}
      <div
        style={{
          transform: facingRight ? "scaleX(1)" : "scaleX(-1)",
        }}
        className={cn(
          "w-12 h-12 flex items-center justify-center transition-transform duration-100",
          isMoving ? "animate-run-wobble" : "animate-idle-breathe"
        )}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          {/* Ears */}
          <polygon points="20,40 10,10 40,25" fill="#f97316" stroke="#c2410c" strokeWidth="2.5" strokeLinejoin="round" />
          <polygon points="80,40 90,10 60,25" fill="#f97316" stroke="#c2410c" strokeWidth="2.5" strokeLinejoin="round" />
          {/* Inner Ears */}
          <polygon points="22,35 15,15 35,24" fill="#fda4af" />
          <polygon points="78,35 85,15 65,24" fill="#fda4af" />
          {/* Face Body */}
          <ellipse cx="50" cy="55" rx="36" ry="28" fill="#f97316" stroke="#c2410c" strokeWidth="2.5" />
          {/* Eyes */}
          <ellipse cx="36" cy="51" rx="5.5" ry="8" fill="#1e293b" />
          <ellipse cx="64" cy="51" rx="5.5" ry="8" fill="#1e293b" />
          {/* Eye Highlights */}
          <circle cx="34" cy="48" r="2.2" fill="#fff" />
          <circle cx="62" cy="48" r="2.2" fill="#fff" />
          {/* Cheeks */}
          <circle cx="26" cy="61" r="4.5" fill="#fecdd3" opacity="0.75" />
          <circle cx="74" cy="61" r="4.5" fill="#fecdd3" opacity="0.75" />
          {/* Nose */}
          <polygon points="47,59 53,59 50,63" fill="#e11d48" />
          {/* Mouth */}
          <path d="M45,66 Q50,71 55,66" fill="none" stroke="#9a3412" strokeWidth="2.2" strokeLinecap="round" />
          {/* Whiskers */}
          <line x1="8" y1="57" x2="23" y2="57" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" />
          <line x1="92" y1="57" x2="77" y2="57" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" />
          <line x1="10" y1="64" x2="24" y2="61" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" />
          <line x1="90" y1="64" x2="76" y2="61" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}
