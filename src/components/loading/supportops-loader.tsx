"use client";

import { useEffect, useMemo, useState } from "react";

const loadingMessages = [
  "Slow and steady wins the support race...",
  "Brewing today's dashboard...",
  "Counting yesterday's tickets...",
  "Reading customer chats...",
  "Looking for hidden bugs...",
  "Preparing your daily report...",
  "Warming up SupportOps...",
  "Calculating monthly performance...",
  "Chasing tiny bugs...",
  "Almost ready...",
];

type SupportOpsLoaderProps = {
  label?: string;
  fullScreen?: boolean;
  className?: string;
};

export function SupportOpsLoader({
  label = "Loading SupportOps...",
  fullScreen = true,
  className = "",
}: SupportOpsLoaderProps) {
  const initialIndex = useMemo(() => Math.floor(Math.random() * loadingMessages.length), []);
  const [messageIndex, setMessageIndex] = useState(initialIndex);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % loadingMessages.length);
    }, 2000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div
      className={[
        "flex items-center justify-center bg-[#FAF8F5] px-4 text-slate-900 dark:bg-slate-950 dark:text-slate-100",
        fullScreen ? "min-h-screen" : "min-h-[360px] rounded-lg",
        className,
      ].join(" ")}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white/90 p-6 text-center shadow-2xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-black/30">
        <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-[2rem] bg-[#FAF8F5] shadow-inner shadow-slate-900/10 dark:bg-slate-900">
          <img
            src="/turtle-mascot.svg"
            alt=""
            className="h-36 w-36 animate-[turtle-breathe_2.8s_ease-in-out_infinite] object-contain drop-shadow-xl motion-reduce:animate-none"
          />
        </div>

        <div className="mt-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">SupportOps</p>
          <p className="mt-2 text-lg font-semibold">{label}</p>
          <p key={messageIndex} className="mt-2 animate-[loader-message-fade_2s_ease-in-out] text-sm text-slate-600 dark:text-slate-300">
            {loadingMessages[messageIndex]}
          </p>
        </div>

        <div className="mt-6 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div className="h-2 w-1/2 animate-[loader-slide_1.4s_ease-in-out_infinite] rounded-full bg-primary motion-reduce:animate-pulse" />
        </div>
      </div>
    </div>
  );
}
