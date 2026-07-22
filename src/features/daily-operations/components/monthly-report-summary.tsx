"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { Trophy, Ticket, MessageSquare, Activity, ShieldAlert, Sparkles, Star, Award } from "lucide-react";
import type { MonthlyPerformanceSummary, MonthlyPerformanceMetrics } from "../performance";

type Props = {
  summary: MonthlyPerformanceSummary;
  rows: MonthlyPerformanceMetrics[];
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
  return { image: fallbackUrl || "/avatars/default.png" };
};

export function MonthlyReportSummary({ summary, rows }: Props) {
  const [fireworks, setFireworks] = React.useState<{ id: number; x: number; y: number; particles: any[] }[]>([]);

  // Retrieve all three top performers
  const overallRow = React.useMemo(() => rows.find((r) => r.full_name === summary.overallBestPerformer) ?? null, [summary.overallBestPerformer, rows]);
  const supportRow = React.useMemo(() => rows.find((r) => r.full_name === summary.bestSupportPerformer) ?? null, [summary.bestSupportPerformer, rows]);
  const testingRow = React.useMemo(() => rows.find((r) => r.full_name === summary.bestTestingPerformer) ?? null, [summary.bestTestingPerformer, rows]);

  const overallAvatar = React.useMemo(() => getAvatarConfig(summary.overallBestPerformer || "", overallRow?.avatar_url), [summary.overallBestPerformer, overallRow]);
  const supportAvatar = React.useMemo(() => getAvatarConfig(summary.bestSupportPerformer || "", supportRow?.avatar_url), [summary.bestSupportPerformer, supportRow]);
  const testingAvatar = React.useMemo(() => getAvatarConfig(summary.bestTestingPerformer || "", testingRow?.avatar_url), [summary.bestTestingPerformer, testingRow]);

  const hasOverallWinner = Boolean(summary.overallBestPerformer);

  const triggerFireworks = React.useCallback(() => {
    const delayTimes = [0, 500, 1000, 1500, 2000];
    const colors = ["#ff0055", "#00ffcc", "#ffcc00", "#ff00ff", "#39ff14", "#00ffff", "#ff3300", "#9d00ff"];

    delayTimes.forEach((delay, idx) => {
      window.setTimeout(() => {
        const x = 10 + Math.random() * 80;
        const y = 10 + Math.random() * 80;
        const color = colors[Math.floor(Math.random() * colors.length)];

        const sparks = Array.from({ length: 50 }).map((_, sparkIdx) => {
          const angle = Math.random() * Math.PI * 2;
          const speed = 80 + Math.random() * 150;
          const tx = Math.cos(angle) * speed;
          const ty = Math.sin(angle) * speed + 30;

          return {
            id: sparkIdx,
            tx,
            ty,
            color,
            size: 5 + Math.random() * 6,
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
  }, []);

  React.useEffect(() => {
    if (hasOverallWinner) {
      triggerFireworks();
      const interval = setInterval(() => triggerFireworks(), 8000); // Trigger again every 8s
      return () => clearInterval(interval);
    }
  }, [hasOverallWinner, triggerFireworks]);

  return (
    <div className="space-y-6 relative">
      
      {/* PERSISTENT BEST PERFORMER BANNER WITH FIREWORKS */}
      {summary.overallBestPerformer && (
        <div className="space-y-4">
          <Card className="relative overflow-hidden border-amber-200 dark:border-amber-900/50 bg-gradient-to-tr from-amber-500/10 via-card to-card p-6 shadow-md shadow-amber-500/5 rounded-2xl min-h-[220px] flex flex-col justify-center">
            {/* Fireworks Layer */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
              {fireworks.map((exp) => (
                <React.Fragment key={exp.id}>
                  <div
                    style={{
                      position: "absolute",
                      left: `${exp.x}%`,
                      top: `${exp.y}%`,
                    }}
                  >
                    {exp.particles.map((p) => (
                      <div
                        key={p.id}
                        style={{
                          position: "absolute",
                          width: `${p.size}px`,
                          height: `${p.size}px`,
                          borderRadius: "50%",
                          backgroundColor: p.color,
                          boxShadow: `0 0 8px ${p.color}, 0 0 16px ${p.color}`,
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

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 justify-center text-center md:text-left">
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-[4px] border-amber-400 bg-slate-900 shadow-[0_0_20px_rgba(251,191,36,0.5)] overflow-hidden shrink-0">
                 {overallAvatar.image ? (
                   <img 
                     src={overallAvatar.image} 
                     alt={summary.overallBestPerformer} 
                     className="w-full h-full object-cover"
                     onError={(e) => {
                       (e.target as HTMLElement).style.display = "none";
                     }}
                   />
                 ) : null}
                 <div className="absolute inset-0 bg-gradient-to-tr from-slate-800 to-slate-950 flex items-center justify-center text-white -z-10">
                   <svg viewBox="0 0 100 100" className="w-16 h-16 opacity-80 fill-current">
                     <path d="M15,90 C15,65 30,55 50,55 C70,55 85,65 85,90" />
                     <circle cx="50" cy="32" r="18" />
                   </svg>
                 </div>
              </div>
              
              <div className="space-y-3">
                <span className="px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-500 text-xs font-black tracking-widest uppercase inline-block">
                  🏆 Overall Best Performer 🏆
                </span>
                <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 uppercase">
                  Congratulations, {summary.overallBestPerformer}!
                </h2>
                <p className="text-sm font-semibold text-muted-foreground max-w-xl leading-relaxed">
                  Your outstanding performance and dedication this month have earned you the top spot. Keep up the excellent work!
                </p>
              </div>
            </div>
          </Card>
          
          {/* Secondary Best Performers (Support & Testing) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {summary.bestSupportPerformer && summary.bestSupportPerformer !== summary.overallBestPerformer && (
              <Card className="relative overflow-hidden border-indigo-200 dark:border-indigo-900/50 bg-gradient-to-tr from-indigo-500/10 via-card to-card p-4 shadow-sm rounded-2xl flex items-center gap-4">
                 <div className="relative w-14 h-14 rounded-full border-[3px] border-indigo-400 bg-slate-900 overflow-hidden shrink-0 shadow-sm">
                    {supportAvatar.image && (
                      <img src={supportAvatar.image} alt={summary.bestSupportPerformer} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLElement).style.display = "none"; }} />
                    )}
                 </div>
                 <div>
                    <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-500 text-[9px] font-black tracking-widest uppercase inline-block mb-1.5">
                      ⭐ Best Support
                    </span>
                    <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-indigo-500 to-indigo-700 dark:from-indigo-400 dark:to-indigo-500">
                      {summary.bestSupportPerformer}
                    </h3>
                 </div>
              </Card>
            )}
            
            {summary.bestTestingPerformer && summary.bestTestingPerformer !== summary.overallBestPerformer && (
              <Card className="relative overflow-hidden border-violet-200 dark:border-violet-900/50 bg-gradient-to-tr from-violet-500/10 via-card to-card p-4 shadow-sm rounded-2xl flex items-center gap-4">
                 <div className="relative w-14 h-14 rounded-full border-[3px] border-violet-400 bg-slate-900 overflow-hidden shrink-0 shadow-sm">
                    {testingAvatar.image && (
                      <img src={testingAvatar.image} alt={summary.bestTestingPerformer} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLElement).style.display = "none"; }} />
                    )}
                 </div>
                 <div>
                    <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-500 text-[9px] font-black tracking-widest uppercase inline-block mb-1.5">
                      ⭐ Best Tester
                    </span>
                    <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-violet-500 to-violet-700 dark:from-violet-400 dark:to-violet-500">
                      {summary.bestTestingPerformer}
                    </h3>
                 </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* SECTION 1: PERFORMANCE AVERAGES */}
      <div>
        <p className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500/10" />
          Performance Averages
        </p>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <ScoreGauge label="Avg Support" score={summary.averageSupportScore} colorClass="text-indigo-600 dark:text-indigo-400" />
          <ScoreGauge label="Avg Testing" score={summary.averageTestingScore} colorClass="text-violet-600 dark:text-violet-400" />
          <ScoreGauge label="Avg Manager Eval" score={summary.averageManagerScore} colorClass="text-blue-600 dark:text-blue-400" />
          <ScoreGauge label="Avg Final Score" score={summary.averageFinalScore} colorClass="text-emerald-600 dark:text-emerald-500" />
        </div>
      </div>

      {/* SECTION 2: OPERATIONAL OUTPUT STATS */}
      <div>
        <p className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-blue-500" />
          Team Operational Output
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCard label="Team Tickets" value={summary.totalTeamTickets} icon={Ticket} iconColor="text-blue-600 dark:text-blue-400" bgClass="bg-blue-50/50 dark:bg-blue-950/20" />
          <MetricCard label="Team Chats" value={summary.totalTeamChats} icon={MessageSquare} iconColor="text-indigo-600 dark:text-indigo-400" bgClass="bg-indigo-50/50 dark:bg-indigo-950/20" />
          <MetricCard label="Testing Tasks" value={summary.totalTestingEntries} icon={Activity} iconColor="text-violet-600 dark:text-violet-400" bgClass="bg-violet-50/50 dark:bg-violet-950/20" />
          <MetricCard label="Bugs Found" value={summary.totalBugsFound} icon={BugIcon} iconColor="text-amber-600 dark:text-amber-400" bgClass="bg-amber-50/50 dark:bg-amber-950/20" />
          <MetricCard label="Critical Bugs" value={summary.totalCriticalBugs} icon={ShieldAlert} iconColor="text-rose-600 dark:text-rose-400" bgClass="bg-rose-50/50 dark:bg-rose-950/20" />
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
    <Card className="rounded-2xl border border-border/60 bg-card p-5 flex flex-col items-center justify-center text-center shadow-sm">
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
            className={colorClass}
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
    <Card className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm overflow-hidden">
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
}: {
  title: string;
  name: string | null;
  subtitle: string;
  gradient: string;
  iconColor: string;
}) {
  const hasWinner = name && name !== "-";

  return (
    <Card
      className={cn(
        "rounded-2xl border overflow-hidden p-5 flex items-center gap-4 shadow-sm",
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
