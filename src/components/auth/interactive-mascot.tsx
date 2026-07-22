"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import confetti from "canvas-confetti";
import { useCharacterContext } from "./character-context";
import { Shield, Lock, Eye, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

export function InteractiveMascot() {
  const {
    activeInput,
    showPassword,
    isTyping,
    authStatus,
    mousePos,
  } = useCharacterContext();

  const [isFlipping, setIsFlipping] = useState(false);

  // Smooth springs for eye/head mouse tracking
  const mouseX = useSpring(0, { stiffness: 120, damping: 20 });
  const mouseY = useSpring(0, { stiffness: 120, damping: 20 });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const normX = (mousePos.x / window.innerWidth - 0.5) * 35;
      const normY = (mousePos.y / window.innerHeight - 0.5) * 25;
      mouseX.set(normX);
      mouseY.set(normY);
    }
  }, [mousePos, mouseX, mouseY]);

  // Trigger Confetti on Success
  useEffect(() => {
    if (authStatus === "success") {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#3b82f6", "#6366f1", "#38bdf8", "#ec4899", "#10b981"],
      });
    }
  }, [authStatus]);

  const handleMascotClick = () => {
    if (!isFlipping) {
      setIsFlipping(true);
      setTimeout(() => setIsFlipping(false), 800);
    }
  };

  const isPasswordFocused = activeInput === "password";
  const isEmailFocused = activeInput === "email";

  return (
    <div className="relative flex flex-col items-center justify-center py-2">
      {/* Interactive Mascot Container */}
      <motion.div
        onClick={handleMascotClick}
        animate={{
          rotateY: isFlipping ? 360 : 0,
          scale: isFlipping ? 1.15 : 1,
          y: authStatus === "success" ? [0, -20, 0] : isEmailFocused ? 8 : 0,
        }}
        transition={{
          rotateY: { duration: 0.8, ease: "easeInOut" },
          y: authStatus === "success" ? { repeat: Infinity, duration: 0.6 } : { duration: 0.3 },
        }}
        className="relative cursor-pointer select-none group"
        title="Click me for a surprise flip!"
      >
        {/* Glow Halo behind Mascot */}
        <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-sky-400/20 blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />

        {/* Mascot SVG Body */}
        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl overflow-visible">
            <defs>
              <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="50%" stopColor="#4f46e5" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>
              <linearGradient id="visorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
              <linearGradient id="antennaGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>
            </defs>

            {/* Antennas / Ears */}
            <motion.g
              animate={{
                rotate: isTyping ? [-4, 4, -4] : 0,
              }}
              transition={{ repeat: Infinity, duration: 0.4 }}
            >
              {/* Left Antenna */}
              <line x1="60" y1="50" x2="40" y2="25" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" />
              <circle cx="38" cy="22" r="9" fill="url(#antennaGlow)" className="animate-pulse" />

              {/* Right Antenna */}
              <line x1="140" y1="50" x2="160" y2="25" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" />
              <circle cx="162" cy="22" r="9" fill="url(#antennaGlow)" className="animate-pulse" />
            </motion.g>

            {/* Mascot Head & Torso Capsule */}
            <rect x="40" y="45" width="120" height="130" rx="60" fill="url(#bodyGrad)" stroke="#60a5fa" strokeWidth="3" />

            {/* Visor Screen */}
            <rect x="52" y="65" width="96" height="55" rx="27" fill="url(#visorGrad)" stroke="#38bdf8" strokeWidth="2.5" />

            {/* Dynamic Eyes Group (Mouse Tracking + Expressions) */}
            {!isPasswordFocused || showPassword ? (
              <motion.g
                style={{
                  x: mouseX,
                  y: mouseY,
                }}
              >
                {/* Left Eye */}
                <ellipse
                  cx="78"
                  cy="92"
                  rx={isEmailFocused ? 11 : 9}
                  ry={isEmailFocused ? 11 : 9}
                  fill="#38bdf8"
                />
                <circle cx="75" cy="89" r="3.5" fill="#ffffff" />

                {/* Right Eye */}
                <ellipse
                  cx="122"
                  cy="92"
                  rx={isEmailFocused ? 11 : 9}
                  ry={isEmailFocused ? 11 : 9}
                  fill="#38bdf8"
                />
                <circle cx="119" cy="89" r="3.5" fill="#ffffff" />
              </motion.g>
            ) : null}

            {/* Mouth Expressions */}
            {authStatus === "error" ? (
              /* Sad Frown */
              <path d="M 85 110 Q 100 100 115 110" fill="none" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" />
            ) : isPasswordFocused && showPassword ? (
              /* Gasping O Mouth */
              <ellipse cx="100" cy="106" rx="6" ry="7" fill="#38bdf8" />
            ) : (
              /* Happy Smile */
              <path d="M 85 104 Q 100 115 115 104" fill="none" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
            )}

            {/* Hands (Normal posture vs "No Peeking!" posture) */}
            {isPasswordFocused && !showPassword ? (
              /* "No Peeking!" Hands covering eyes */
              <motion.g
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.25 }}
              >
                {/* Left Hand covering left eye */}
                <circle cx="78" cy="92" r="18" fill="#2563eb" stroke="#60a5fa" strokeWidth="2.5" />
                {/* Right Hand covering right eye */}
                <circle cx="122" cy="92" r="18" fill="#2563eb" stroke="#60a5fa" strokeWidth="2.5" />
              </motion.g>
            ) : isPasswordFocused && showPassword ? (
              /* Peeking Hands (partially opened) */
              <motion.g initial={{ y: -5 }} animate={{ y: 12 }}>
                <circle cx="65" cy="102" r="16" fill="#2563eb" stroke="#60a5fa" strokeWidth="2" />
                <circle cx="135" cy="102" r="16" fill="#2563eb" stroke="#60a5fa" strokeWidth="2" />
              </motion.g>
            ) : (
              /* Normal Idle Hands on sides */
              <g>
                <circle cx="34" cy="125" r="12" fill="#2563eb" stroke="#60a5fa" strokeWidth="2" />
                <circle cx="166" cy="125" r="12" fill="#2563eb" stroke="#60a5fa" strokeWidth="2" />
              </g>
            )}

            {/* Chest Security Shield Badge */}
            <g transform="translate(86, 132)">
              <polygon points="14,0 28,6 28,18 14,26 0,18 0,6" fill="#3b82f6" opacity="0.9" />
              <polygon points="14,3 24,8 24,16 14,23 4,16 4,8" fill="#1d4ed8" />
              <path d="M10,13 L13,16 L19,10" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </svg>
        </div>
      </motion.div>

      {/* Mascot Speech Bubble Feedback */}
      <motion.div
        animate={{ scale: [0.95, 1, 0.95] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="mt-2 flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-slate-900/90 px-3.5 py-1 text-xs font-semibold text-blue-300 backdrop-blur-md shadow-lg shadow-blue-500/10"
      >
        {isPasswordFocused && !showPassword ? (
          <>
            <Lock className="h-3.5 w-3.5 text-indigo-400" />
            <span>No Peeking! Your password is safe.</span>
          </>
        ) : isPasswordFocused && showPassword ? (
          <>
            <Eye className="h-3.5 w-3.5 text-sky-400" />
            <span>Peeking through fingers...</span>
          </>
        ) : isEmailFocused ? (
          <>
            <Shield className="h-3.5 w-3.5 text-blue-400" />
            <span>Scanning work credentials...</span>
          </>
        ) : authStatus === "error" ? (
          <>
            <AlertCircle className="h-3.5 w-3.5 text-red-400" />
            <span>Access Denied. Please check your inputs.</span>
          </>
        ) : authStatus === "success" ? (
          <>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Welcome back! Signing in...</span>
          </>
        ) : (
          <>
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <span>Byte Security Buddy ready!</span>
          </>
        )}
      </motion.div>
    </div>
  );
}
