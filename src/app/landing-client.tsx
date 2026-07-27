"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Zap,
  Gauge,
  Clock,
  Activity,
  Award,
  FileText,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MinimalLoginForm } from "@/app/(auth)/login/minimal-login-form";

export function LandingClient({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      {/* Navigation Header */}
      <header className="border-b border-border bg-card sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-black text-sm shadow-sm">
              SO
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-foreground">
                SupportOps
              </span>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Team Portal</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button variant="default" size="sm" className="rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-sm">
                  Go to Dashboard <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </Link>
            ) : (
              <a href="#login-section">
                <Button variant="default" size="sm" className="rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-sm">
                  Sign In <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Hero & Sign-In Section */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="grid gap-12 lg:grid-cols-12 items-center">
          {/* Hero Content Left */}
          <div className="lg:col-span-7 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
              <span>🚀 SupportOps Portal</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-tight">
              Simple Daily Reporting & Operations Workspace
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground font-normal leading-relaxed max-w-xl">
              Eliminate manual email reports. SupportOps gives your support engineers and QA testers a 2-minute daily portal for logging tickets, chats, testing work, and shift attendance.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-bold text-muted-foreground">
              <span className="flex items-center gap-1.5 text-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> &lt; 2 Minute Daily Form
              </span>
              <span className="flex items-center gap-1.5 text-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Shift-Aware Dates
              </span>
              <span className="flex items-center gap-1.5 text-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> 30s Auto-Save Drafts
              </span>
            </div>
          </div>

          {/* Embedded Sign In Card Right */}
          <div id="login-section" className="lg:col-span-5">
            {isLoggedIn ? (
              <div className="rounded-xl border border-border bg-card p-6 text-center space-y-4 shadow-sm">
                <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-base font-bold">
                  ✓
                </div>
                <h3 className="text-base font-extrabold text-foreground">You are Signed In</h3>
                <p className="text-xs text-muted-foreground">Access your command center or submit daily reports.</p>
                <Link href="/dashboard">
                  <Button className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-10 cursor-pointer">
                    Open Dashboard <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-sm">
                <div>
                  <h3 className="text-base font-extrabold text-foreground">Sign In to SupportOps</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Enter your email and password to log in.</p>
                </div>
                <MinimalLoginForm />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Simple 3-Column Features Grid */}
      <section className="py-12 border-t border-border bg-slate-50/50 dark:bg-slate-900/20 px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-1.5">
            <h2 className="text-2xl font-black text-foreground">Core Portal Capabilities</h2>
            <p className="text-xs text-muted-foreground font-medium">Designed for speed, clarity, and daily team productivity.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <SimpleFeatureCard
              icon={Zap}
              title="2-Minute Employee Portal"
              description="Log tickets, chats, and testing work with 30s auto-saved drafts and file attachments."
            />
            <SimpleFeatureCard
              icon={Gauge}
              title="Manager Command Center"
              description="Clean 4-card MVP dashboard displaying present count, submitted logs, pending reports, and late reports."
            />
            <SimpleFeatureCard
              icon={Clock}
              title="Shift-Aware Date Rules"
              description="Supports Morning, Day, and Night shifts (6 PM - 2 AM) with automated late submission detection."
            />
            <SimpleFeatureCard
              icon={Activity}
              title="QA Multi-Testing Entries"
              description="Log multiple app testing activities per daily report with critical bug tagging."
            />
            <SimpleFeatureCard
              icon={Award}
              title="Monthly Performance Scorecards"
              description="Automated scoring formula combining support output, QA quality, and monthly ratings."
            />
            <SimpleFeatureCard
              icon={FileText}
              title="CSV & PDF Reporting"
              description="Export monthly manager evaluation reports and operational summaries instantly."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 text-xs text-muted-foreground bg-card">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-blue-600 text-white font-bold text-xs">
              SO
            </div>
            <span className="font-extrabold text-foreground">SupportOps Engine</span>
          </div>

          <div className="flex items-center gap-6 font-semibold">
            <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
            <Link href="/my-reports" className="hover:text-foreground">My Reports</Link>
            <Link href="/operations" className="hover:text-foreground">Daily Log</Link>
            <Link href="/reports" className="hover:text-foreground">Reports</Link>
            <Link href="/login" className="hover:text-foreground">Sign In</Link>
          </div>

          <p className="font-medium text-slate-400">
            © 2026 SupportOps. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function SimpleFeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-2 shadow-sm">
      <div className="h-9 w-9 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="text-sm font-bold text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
