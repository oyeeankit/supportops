"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { Trophy, Ticket, MessageSquare, Activity, ShieldAlert, Sparkles, Star, Award, Share2, FileText, CheckCircle2 } from "lucide-react";
import type { MonthlyPerformanceSummary, MonthlyPerformanceMetrics } from "../performance";

type Props = {
  summary: MonthlyPerformanceSummary;
  rows: MonthlyPerformanceMetrics[];
};

type GoldSparkle = {
  id: number;
  left: number;
  delay: number;
  size: number;
};

type AvatarConfig = {
  image: string;
};

// Dynamically resolve avatar configuration based on winner name
const getAvatarConfig = (name: string, fallbackUrl?: string | null): AvatarConfig => {
  const normalized = name.toLowerCase();
  if (normalized.includes("lalit")) {
    return { image: "/avatars/lalit_photo.png" };
  }
  // For other employees, use their DB avatar_url if available, or fall back to standard asset
  return { image: fallbackUrl || "/avatars/default.png" };
};

export function MonthlyReportSummary({ summary, rows }: Props) {
  const [fireworks, setFireworks] = React.useState<{ id: number; x: number; y: number; particles: any[] }[]>([]);
  const [ceremony, setCeremony] = React.useState<{ title: string; name: string; type: string } | null>(null);
  const [ceremonyStep, setCeremonyStep] = React.useState<number>(1);
  const [sparkles, setSparkles] = React.useState<GoldSparkle[]>([]);

  // Find detailed statistics for the winner
  const winnerRow = React.useMemo(() => {
    if (!ceremony || !ceremony.name) return null;
    return rows.find((r) => r.full_name === ceremony.name) ?? null;
  }, [ceremony, rows]);

  // Resolve avatar configuration
  const avatarConfig = React.useMemo(() => {
    if (!ceremony) return null;
    return getAvatarConfig(ceremony.name, winnerRow?.avatar_url);
  }, [ceremony, winnerRow]);

  // Sparkles generator
  React.useEffect(() => {
    const arr: GoldSparkle[] = Array.from({ length: 35 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 6,
      size: 4 + Math.random() * 6,
    }));
    setSparkles(arr);
  }, []);

  const triggerFireworks = () => {
    const delayTimes = [0, 250, 500, 750, 1000, 1250, 1500];
    const colors = ["#ff0055", "#00ffcc", "#ffcc00", "#ff00ff", "#39ff14", "#00ffff", "#ff3300", "#9d00ff"];

    delayTimes.forEach((delay, idx) => {
      window.setTimeout(() => {
        const x = 10 + Math.random() * 80;
        const y = 10 + Math.random() * 45;
        const color = colors[Math.floor(Math.random() * colors.length)];

        const sparks = Array.from({ length: 85 }).map((_, sparkIdx) => {
          const angle = Math.random() * Math.PI * 2;
          const speed = 80 + Math.random() * 230;
          const tx = Math.cos(angle) * speed;
          const ty = Math.sin(angle) * speed + 30;

          return {
            id: sparkIdx,
            tx,
            ty,
            color,
            size: 5 + Math.random() * 8,
          };
        });

        const newExplosion = {
          id: Date.now() + idx,
          x,
          y,
          particles: sparks,
        };

        setFireworks((prev) => [...prev, newExplosion]);

        window.setTimeout(() => {
          setFireworks((prev) => prev.filter((exp) => exp.id !== newExplosion.id));
        }, 3200);
      }, delay);
    });
  };

  const startCeremony = (type: string, name: string) => {
    setCeremony({ title: "Employee of the Month", name, type });
    setCeremonyStep(1);

    // Timeline steps:
    // Step 1 (0.0s - 2.0s): Lights dim, Spotlight turns on.
    // Step 2 (2.0s - 4.5s): Medal walks/slides onto stage.
    // Step 3 (4.5s - 6.5s): Stops at center, waves/sweeps. Winner details fade in.
    // Step 4 (6.5s - 8.5s): Trophy badge scales up at the corner of the card.
    // Step 5 (8.5s - 10.5s): Fireworks and confetti explode.
    // Step 6 (10.5s - 13.5s): Achievement cards slide in.
    // Step 7 (13.5s+): Congratulations message and buttons display.
    
    const timers = [
      window.setTimeout(() => setCeremonyStep(2), 2000),
      window.setTimeout(() => setCeremonyStep(3), 4500),
      window.setTimeout(() => setCeremonyStep(4), 6500),
      window.setTimeout(() => {
        setCeremonyStep(5);
        triggerFireworks();
      }, 8500),
      window.setTimeout(() => setCeremonyStep(6), 10500),
      window.setTimeout(() => setCeremonyStep(7), 13500),
    ];

    return () => timers.forEach(clearTimeout);
  };

  const closeCeremony = () => {
    setCeremony(null);
    setCeremonyStep(1);
  };

  return (
    <div className="space-y-6">
      {/* FULLSCREEN CORPORATE CELEBRATION */}
      {ceremony && avatarConfig && (
        <div className="fixed inset-0 bg-slate-950 z-[9998] flex flex-col items-center justify-between p-6 select-none overflow-hidden animate-fade-in pointer-events-auto">
          {/* STAGE BACKDROP AND SPOTLIGHT */}
          <div className="absolute top-0 left-1/2 w-[70vw] h-[100vh] bg-gradient-to-b from-white/15 to-transparent pointer-events-none origin-top -translate-x-1/2 animate-pulse" />
          
          {/* Stage floor line */}
          <div className="absolute bottom-[26%] left-1/2 -translate-x-1/2 w-[85vw] h-12 bg-slate-900/50 border-t border-white/10 rounded-full blur-[1px] pointer-events-none" />

          {/* Falling Gold Glitter Particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
            {sparkles.map((sp) => (
              <div
                key={sp.id}
                style={{
                  position: "absolute",
                  left: `${sp.left}%`,
                  width: `${sp.size}px`,
                  height: `${sp.size}px`,
                  backgroundColor: "#fbbf24",
                  borderRadius: "50%",
                  boxShadow: "0 0 8px #fbbf24",
                  animationDelay: `${sp.delay}s`,
                  top: "-10px",
                }}
                className="animate-gold-drift"
              />
            ))}
          </div>

          {/* Close button */}
          <button
            onClick={closeCeremony}
            className="absolute top-6 right-6 p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors pointer-events-auto z-[9999]"
            title="Close ceremony"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          {/* AWARD HEADER DETAILS - SHOWS SPECIFIC BEST PERFORMANCE CATEGORY */}
          <div className="text-center mt-10 space-y-2 z-20">
            <span className="px-5 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black tracking-widest uppercase animate-pulse">
              🏆 {ceremony.type} 🏆
            </span>
            <h3 className="text-xl md:text-2xl font-black text-slate-100 tracking-tight pt-1">
              Monthly Performance Accolades
            </h3>
          </div>

          {/* STAGE & MEDAL CONTAINER */}
          <div className="relative w-full max-w-4xl flex flex-col items-center justify-end h-80 my-2">
            
            {/* PERSONALIZED EMPLOYEE PORTRAIT MEDAL CARD */}
            <div
              className={cn(
                "relative z-20 transition-all duration-1000 ease-out origin-bottom flex flex-col items-center",
                ceremonyStep === 1 ? "-translate-x-[100vw] opacity-0" : "translate-x-0 opacity-100"
              )}
            >
              <div className={cn("origin-bottom flex flex-col items-center", ceremonyStep >= 3 && "animate-human-cheer")}>
                
                {/* Glowing Circular Portrait Medal */}
                <div className="relative w-36 h-36 md:w-48 md:h-48 rounded-full border-[5px] border-amber-400 bg-slate-900 shadow-[0_0_35px_rgba(251,191,36,0.6)] overflow-hidden">
                  {avatarConfig.image ? (
                    <img 
                      src={avatarConfig.image} 
                      alt={ceremony.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to generic vector profile picture if URL fails
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : null}

                  {/* Fallback Vector Headshot */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-slate-800 to-slate-950 flex items-center justify-center text-white z-0">
                    <svg viewBox="0 0 100 100" className="w-20 h-20 opacity-80 fill-current">
                      <path d="M15,90 C15,65 30,55 50,55 C70,55 85,65 85,90" />
                      <circle cx="50" cy="32" r="18" />
                    </svg>
                  </div>

                  {/* Sweeping Glass Reflection Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-pulse" style={{ transform: "skewX(-25deg)" }} />
                </div>

                {/* OVERLAPPING GOLD TROPHY BADGE (STEPS 4+) */}
                {ceremonyStep >= 4 && (
                  <div className="absolute bottom-0 right-0 z-30 translate-x-2 translate-y-2 bg-slate-950 border-4 border-amber-400 rounded-full p-2.5 shadow-lg shadow-amber-500/20 scale-100 animate-trophy-glow">
                    <Trophy className="h-6 w-6 text-amber-400" />
                  </div>
                )}
                
              </div>
            </div>

          </div>

          {/* LOWER STATS AND BUTTONS AREA */}
          <div className="w-full max-w-4xl min-h-[140px] flex flex-col items-center justify-center z-30">
            {/* STEP 3: NAME PLATE DISPLAY */}
            {ceremonyStep === 3 && (
              <div className="text-center animate-slide-in space-y-1">
                <p className="text-amber-400 text-xs font-black tracking-widest uppercase">
                  🏆 Winner Unveiled 🏆
                </p>
                <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 drop-shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-pulse tracking-wide uppercase">
                  {ceremony.name}
                </h2>
                <p className="text-slate-400 text-xs font-medium max-w-xs mx-auto pt-1">
                  Presented for outstanding dedication and metrics leadership in this category.
                </p>
              </div>
            )}

            {/* STEP 5: CELEBRATION DETONATION */}
            {ceremonyStep === 5 && (
              <div className="text-center animate-slide-in space-y-1.5">
                <p className="text-amber-400 text-xs font-black tracking-widest uppercase">
                  ⭐ Celebration ⭐
                </p>
                <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-amber-400 via-yellow-100 to-amber-500 tracking-wide uppercase">
                  Fireworks and Confetti Burst!
                </h2>
                <p className="text-slate-300 text-xs font-extrabold animate-pulse">
                  Unveiling achievement statistics next...
                </p>
              </div>
            )}

            {/* STEP 6: STAGGERED METRIC CARDS */}
            {ceremonyStep === 6 && winnerRow && (
              <div className="w-full grid grid-cols-2 md:grid-cols-5 gap-3 px-4">
                <MetricSlideCard label="Tickets Closed" value={winnerRow.totalTickets} icon={Ticket} color="border-blue-500/40 text-blue-400" delay="0ms" />
                <MetricSlideCard label="Chats Handled" value={winnerRow.totalChats} icon={MessageSquare} color="border-indigo-500/40 text-indigo-400" delay="150ms" />
                <MetricSlideCard label="Testing Tasks" value={winnerRow.totalTestingEntries} icon={Activity} color="border-violet-500/40 text-violet-400" delay="300ms" />
                <MetricSlideCard label="Bugs Found" value={winnerRow.bugsFound} icon={ShieldAlert} color="border-amber-500/40 text-amber-400" delay="450ms" />
                <MetricSlideCard label="Final Score" value={winnerRow.finalScore.toFixed(2)} icon={Star} color="border-emerald-500/40 text-emerald-400" delay="600ms" />
              </div>
            )}

            {/* STEP 7: CONGRATULATIONS OUTRO */}
            {ceremonyStep === 7 && (
              <div className="text-center animate-slide-in space-y-4">
                <div className="space-y-1">
                  <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-amber-400 via-yellow-100 to-amber-500 tracking-wide uppercase">
                    🏆 Congratulations {ceremony.name}! 🏆
                  </h2>
                  <p className="text-slate-300 text-sm font-extrabold tracking-tight">
                    Outstanding Performers accolades locked in for {summary.monthLabel}.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pointer-events-auto">
                  <button
                    onClick={closeCeremony}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider px-6 py-3 shadow-md shadow-emerald-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    View Performance Report
                  </button>
                  <button
                    onClick={() => {
                      alert(`Shared accomplishment: ${ceremony.name} awarded Employee of the Month!`);
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-wider px-6 py-3 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    Share Achievement
                  </button>
                  <button
                    onClick={closeCeremony}
                    className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-wider px-6 py-3 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fullscreen Fireworks Overlay */}
      {fireworks.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
          {fireworks.map((exp) => (
            <React.Fragment key={exp.id}>
              {/* Viewport-level Rocket Ascent */}
              <div
                style={{
                  position: "absolute",
                  left: `${exp.x}%`,
                  width: "5px",
                  height: "18px",
                  borderRadius: "50% 50% 0 0",
                  backgroundColor: "#ffffff",
                  boxShadow: `0 0 10px #ffffff, 0 4px 12px ${exp.particles[0]?.color || "#ffd700"}`,
                  marginLeft: "-2.5px",
                  "--target-y": `${exp.y}%`,
                } as React.CSSProperties}
                className="animate-rocket-rise-dynamic"
              />

              {/* Explosion Center */}
              <div
                style={{
                  position: "absolute",
                  left: `${exp.x}%`,
                  top: `${exp.y}%`,
                }}
              >
                {/* Exploding sparks */}
                {exp.particles.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      position: "absolute",
                      width: `${p.size}px`,
                      height: `${p.size}px`,
                      borderRadius: "50%",
                      backgroundColor: p.color,
                      boxShadow: `0 0 8px ${p.color}, 0 0 16px ${p.color}, 0 0 32px ${p.color}`,
                      "--tx": `${p.tx}px`,
                      "--ty": `${p.ty}px`,
                    } as React.CSSProperties}
                    className="animate-firework-spark-delayed"
                  />
                ))}
              </div>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* SECTION 1: PERFORMANCE AVERAGES (CIRCULAR PROGRESS GAUGES) */}
      <div>
        <p className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500/10" />
          Performance Averages
        </p>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4 animate-slide-in">
          <ScoreGauge label="Avg Support" score={summary.averageSupportScore} colorClass="text-indigo-600 dark:text-indigo-400" />
          <ScoreGauge label="Avg Testing" score={summary.averageTestingScore} colorClass="text-violet-600 dark:text-violet-400" />
          <ScoreGauge label="Avg Daily Score" score={summary.averageDailyScore} colorClass="text-blue-600 dark:text-blue-400" />
          <ScoreGauge label="Avg Final Score" score={summary.averageFinalScore} colorClass="text-emerald-600 dark:text-emerald-500" />
        </div>
      </div>

      {/* SECTION 2: OPERATIONAL OUTPUT STATS */}
      <div>
        <p className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-blue-500" />
          Team Operational Output
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 animate-slide-in [animation-delay:150ms]">
          <MetricCard label="Team Tickets" value={summary.totalTeamTickets} icon={Ticket} iconColor="text-blue-600 dark:text-blue-400" bgClass="bg-blue-50/50 dark:bg-blue-950/20" />
          <MetricCard label="Team Chats" value={summary.totalTeamChats} icon={MessageSquare} iconColor="text-indigo-600 dark:text-indigo-400" bgClass="bg-indigo-50/50 dark:bg-indigo-950/20" />
          <MetricCard label="Testing Tasks" value={summary.totalTestingEntries} icon={Activity} iconColor="text-violet-600 dark:text-violet-400" bgClass="bg-violet-50/50 dark:bg-violet-950/20" />
          <MetricCard label="Bugs Found" value={summary.totalBugsFound} icon={BugIcon} iconColor="text-amber-600 dark:text-amber-400" bgClass="bg-amber-50/50 dark:bg-amber-950/20" />
          <MetricCard label="Critical Bugs" value={summary.totalCriticalBugs} icon={ShieldAlert} iconColor="text-rose-600 dark:text-rose-400" bgClass="bg-rose-50/50 dark:bg-rose-950/20" />
        </div>
      </div>

      {/* SECTION 3: STAR PERFORMERS / TROPHIES */}
      <div>
        <p className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          Star Performers
        </p>
        <div className="grid gap-4 sm:grid-cols-3 animate-slide-in [animation-delay:300ms]">
          <TrophyCard
            title="Overall Best Performer"
            name={summary.overallBestPerformer}
            subtitle="Top Daily Metrics Average"
            gradient="border-amber-200 dark:border-amber-900/50 bg-gradient-to-tr from-amber-500/10 via-card to-card text-amber-800 dark:text-amber-300 shadow-md shadow-amber-500/5"
            iconColor="text-amber-500 dark:text-amber-400"
            onClick={() => startCeremony("Overall Best Performer", summary.overallBestPerformer || "")}
          />
          <TrophyCard
            title="Best Support Performer"
            name={summary.bestSupportPerformer}
            subtitle="Top Support Scores"
            gradient="border-indigo-200 dark:border-indigo-900/50 bg-gradient-to-tr from-indigo-500/10 via-card to-card text-indigo-800 dark:text-indigo-300 shadow-md shadow-indigo-500/5"
            iconColor="text-indigo-500 dark:text-indigo-400"
            onClick={() => startCeremony("Best Support Performer", summary.bestSupportPerformer || "")}
          />
          <TrophyCard
            title="Best Testing Performer"
            name={summary.bestTestingPerformer}
            subtitle="Top Quality Ratings"
            gradient="border-violet-200 dark:border-violet-900/50 bg-gradient-to-tr from-violet-500/10 via-card to-card text-violet-800 dark:text-violet-300 shadow-md shadow-violet-500/5"
            iconColor="text-violet-500 dark:text-violet-400"
            onClick={() => startCeremony("Best Testing Performer", summary.bestTestingPerformer || "")}
          />
        </div>
      </div>
    </div>
  );
}

// 1. Circular score gauge component
function ScoreGauge({ label, score, colorClass }: { label: string; score: number; colorClass: string }) {
  const percentage = (score / 5) * 100;
  const radius = 38;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Card className="rounded-2xl border border-border/60 bg-card p-5 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-4">{label}</p>
      <div className="relative flex items-center justify-center select-none">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          <circle
            stroke="var(--border)"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="opacity-70 dark:opacity-30"
          />
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + " " + circumference}
            style={{ strokeDashoffset }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeLinecap="round"
            className={cn("transition-all duration-1000 ease-out", colorClass)}
          />
        </svg>
        <span className="absolute text-lg font-extrabold tracking-tight text-foreground">{score.toFixed(2)}</span>
      </div>
    </Card>
  );
}

// 2. Metrics summary count card
function MetricCard({
  label,
  value,
  icon: Icon,
  iconColor,
  bgClass,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  bgClass: string;
}) {
  return (
    <Card className="rounded-2xl border border-border/60 bg-card p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 shadow-sm overflow-hidden">
      <CardContent className="flex items-center justify-between p-0">
        <div className="space-y-1">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="text-2xl font-extrabold tracking-tight text-foreground">{value}</p>
        </div>
        <div className={cn("p-2.5 rounded-xl shadow-inner", bgClass, iconColor)}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

// 3. Outstanding Performers Trophy card
function TrophyCard({
  title,
  name,
  subtitle,
  gradient,
  iconColor,
  onClick,
}: {
  title: string;
  name: string | null;
  subtitle: string;
  gradient: string;
  iconColor: string;
  onClick: () => void;
}) {
  const hasWinner = name && name !== "-";

  return (
    <Card
      onClick={onClick}
      className={cn(
        "rounded-2xl border overflow-hidden p-5 flex items-center gap-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer active:scale-[0.98]",
        gradient
      )}
    >
      <div className={cn("p-3 rounded-2xl bg-white/70 dark:bg-slate-900/60 shadow-sm border border-border/20 text-xl", iconColor)}>
        <Trophy className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground/90">{title}</p>
        <p className="text-base font-extrabold tracking-tight truncate mt-0.5 text-foreground">{hasWinner ? name : "Pending"}</p>
        <p className="text-[10px] font-medium text-muted-foreground truncate">{subtitle}</p>
      </div>
    </Card>
  );
}

// 4. Staggered Slide-in Metric Card for Ceremony
function MetricSlideCard({
  label,
  value,
  icon: Icon,
  color,
  delay,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  delay: string;
}) {
  return (
    <div
      style={{ animationDelay: delay }}
      className={cn(
        "bg-white/5 border rounded-2xl p-4 flex flex-col items-center justify-center text-center animate-slide-in opacity-0",
        color
      )}
    >
      <Icon className="h-5 w-5 mb-1.5" />
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
      <span className="text-xl font-black text-slate-100 mt-1">{value}</span>
    </div>
  );
}

// Custom Bug Icon
function BugIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <rect width="8" height="14" x="8" y="6" rx="4" />
      <path d="m19 7-3 2" />
      <path d="m5 7 3 2" />
      <path d="m19 19-3-2" />
      <path d="m5 19 3-2" />
      <path d="M20 13h-4" />
      <path d="M4 13h4" />
      <path d="m12 6 1-4" />
      <path d="m12 6-1-4" />
    </svg>
  );
}
