"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Gauge,
  Clock,
  ShieldCheck,
  Zap,
  Users,
  Activity,
  FileText,
  LineChart,
  ChevronRight,
  Star,
  Award,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingClient({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-blue-500 selection:text-white font-sans overflow-x-hidden">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[140px]" />
        <div className="absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[140px]" />
      </div>

      {/* Navigation Header */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <LineChart className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                SupportOps <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">Enterprise</span>
              </span>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Team Operations Engine</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button variant="default" className="rounded-xl shadow-lg shadow-blue-600/30 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold px-6 cursor-pointer">
                  Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="rounded-xl text-slate-300 hover:text-white font-bold cursor-pointer">
                    Sign In
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="default" className="rounded-xl shadow-lg shadow-blue-600/30 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold px-6 cursor-pointer">
                    Launch Portal <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-16 px-6 text-center max-w-5xl mx-auto space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-inner">
          <Sparkles className="h-4 w-4 text-blue-400 animate-pulse" />
          Streamline Support & QA Team Productivity
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400">
          The Enterprise Operations Workspace for Modern Teams
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 font-normal max-w-3xl mx-auto leading-relaxed">
          Eliminate manual reporting chaos. SupportOps automates daily log entries, shift tracking, multi-testing coverage, and monthly scorecards into an actionable manager decision console.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link href={isLoggedIn ? "/dashboard" : "/login"}>
            <Button size="lg" className="rounded-2xl h-14 px-8 text-base font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-xl shadow-blue-600/30 cursor-pointer">
              {isLoggedIn ? "Open Command Center" : "Get Started Now"} <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline" className="rounded-2xl h-14 px-8 text-base font-bold border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-200 cursor-pointer">
              Explore Capabilities
            </Button>
          </Link>
        </div>

        {/* Live Interactive Preview Box */}
        <div className="pt-12 relative max-w-5xl mx-auto">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-3 sm:p-5 shadow-2xl shadow-blue-900/20 backdrop-blur-2xl overflow-hidden">
            <div className="flex items-center justify-between pb-4 px-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">SupportOps Command Center</span>
              <div className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                🟢 Live Environment
              </div>
            </div>

            {/* Dashboard Mockup Grid */}
            <div className="p-4 sm:p-6 text-left space-y-6 bg-slate-950/60 rounded-2xl mt-4">
              {/* Header inside mockup */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h3 className="text-xl font-black text-white">Good Morning, Ankit 👋</h3>
                  <p className="text-xs text-slate-400 font-medium">Thursday, July 27, 2026 • Manager Operations Console</p>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-xl bg-blue-600 text-white text-xs font-bold">10 Team Members</span>
                  <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">8 Present</span>
                  <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">80% Completed</span>
                </div>
              </div>

              {/* Action Required Mock Card */}
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  <div>
                    <p className="text-xs font-black text-emerald-200">Everything looks good today.</p>
                    <p className="text-[11px] text-slate-400">All 8 daily logs submitted, 0 critical bugs detected.</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-lg">🟢 On Track</span>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
                  <p className="text-2xl font-black text-white">184</p>
                  <p className="text-[10px] font-bold uppercase text-slate-400 mt-1">Tickets Closed</p>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
                  <p className="text-2xl font-black text-pink-400">92</p>
                  <p className="text-[10px] font-bold uppercase text-slate-400 mt-1">Chats Handled</p>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
                  <p className="text-2xl font-black text-violet-400">28</p>
                  <p className="text-[10px] font-bold uppercase text-slate-400 mt-1">Testing Entries</p>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
                  <p className="text-2xl font-black text-rose-400">7</p>
                  <p className="text-[10px] font-bold uppercase text-slate-400 mt-1">Bugs Found</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Banner */}
      <section className="relative z-10 border-y border-slate-800/80 bg-slate-900/30 backdrop-blur-md py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">98%</p>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">Reduced Manager Effort</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">&lt; 2 Min</p>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">Employee Report Entry</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">100%</p>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">Operational Visibility</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">0</p>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">Missed QA Testing Tasks</p>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="relative z-10 py-24 px-6 max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Built for Modern Support & Engineering Workflows
          </h2>
          <p className="text-slate-400 font-normal">
            Everything your team needs to track daily tickets, testing tasks, shift windows, and monthly performance.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={Zap}
            iconColor="text-blue-400"
            title="2-Minute Employee Portal"
            description="Employees log tickets, chats, testing activities, and attachments directly. Includes 30s auto-saved drafts."
          />
          <FeatureCard
            icon={Gauge}
            iconColor="text-indigo-400"
            title="Manager Command Center"
            description="Prioritized 9-section dashboard answering what requires attention, today's output, team timeline, and trends."
          />
          <FeatureCard
            icon={Clock}
            iconColor="text-violet-400"
            title="Shift-Aware Reporting"
            description="Supports Morning, Day, and Night shifts (6 PM - 2 AM) with automated late submission detection."
          />
          <FeatureCard
            icon={Activity}
            iconColor="text-pink-400"
            title="QA & Multi-Testing Entries"
            description="Log multiple app testing activities per report with critical bug tagging and status tracking."
          />
          <FeatureCard
            icon={Award}
            iconColor="text-amber-400"
            title="Monthly Evaluations & Rankings"
            description="Automated scoring formula combining support output, QA quality, and 4-dimension manager evaluations."
          />
          <FeatureCard
            icon={FileText}
            iconColor="text-emerald-400"
            title="One-Click CSV & PDF Exports"
            description="Export monthly manager evaluation reports and operational summaries instantly for stakeholder reporting."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 bg-slate-950 py-12 text-slate-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-bold">
              SO
            </div>
            <span className="text-sm font-extrabold text-white">SupportOps Engine</span>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold">
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/my-reports" className="hover:text-white transition-colors">My Reports</Link>
            <Link href="/operations" className="hover:text-white transition-colors">Daily Log</Link>
            <Link href="/reports" className="hover:text-white transition-colors">Reports</Link>
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
          </div>

          <p className="text-xs font-medium text-slate-400">
            © 2026 SupportOps. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  iconColor,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-900/40 p-8 hover:border-slate-700 hover:bg-slate-900/80 transition-all duration-300 group">
      <div className={`h-12 w-12 rounded-2xl bg-slate-800/80 flex items-center justify-center mb-6 ${iconColor} group-hover:scale-110 transition-transform`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-sm text-slate-400 font-normal leading-relaxed">{description}</p>
    </div>
  );
}
