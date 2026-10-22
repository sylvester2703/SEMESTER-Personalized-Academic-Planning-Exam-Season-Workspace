'use client';

import React from 'react';
import { usePlanner } from '@/lib/context/planner-context';
import {
  Sparkles,
  ArrowRight,
  Calendar,
  Clock,
  Compass,
  MapPin,
  Timer,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  Award,
  Laptop,
} from 'lucide-react';
import { format } from 'date-fns';

export function LandingView() {
  const { setActiveView, setIsOnboardingOpen } = usePlanner();

  return (
    <div className="space-y-16 sm:space-y-24 py-6 sm:py-12 animate-in fade-in-50 duration-200">
      {/* HERO SECTION */}
      <section className="text-center max-w-4xl mx-auto px-4 sm:px-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-forest/20 dark:border-forest/40 bg-forest/5 dark:bg-forest/15 text-forest dark:text-emerald-400 text-xs font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Every semester deserves a better plan.</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-ink-950 dark:text-ink-50 leading-[1.1] mb-6">
          Your exams have dates. <br className="hidden sm:inline" />
          Your preparation needs a plan.
        </h1>

        <p className="font-serif italic text-lg sm:text-xl text-forest dark:text-emerald-300 font-medium mb-4">
          "Make a plan. Find your focus. Walk in prepared."
        </p>

        <p className="text-sm sm:text-base text-ink-600 dark:text-ink-300 max-w-2xl mx-auto leading-relaxed mb-8">
          Turn a crowded university exam timetable into a realistic study routine, one focused session at a time. No complex setup, no fake metrics, no guilt.
        </p>

        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md bg-forest hover:bg-forest-hover text-white text-sm font-semibold shadow-card hover:shadow-dropdown transition-all focus-visible:ring-2 focus-visible:ring-forest"
          >
            <Sparkles className="w-4 h-4" />
            <span>Build my study plan</span>
          </button>

          <button
            onClick={() => setActiveView('dashboard')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-900 text-ink-900 dark:text-ink-100 text-sm font-medium hover:bg-paper-100 dark:hover:bg-paper-800 transition-colors shadow-subtle"
          >
            <span>Explore the planner</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-ink-500 dark:text-ink-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-forest dark:text-emerald-400" />
            <span>100% Free for students</span>
          </span>
          <span>•</span>
          <span>Runs entirely in your browser</span>
          <span>•</span>
          <span>No login required</span>
        </div>
      </section>

      {/* BELIEVABLE TIMETABLE PREVIEW FRAGMENT */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="rounded-xl border border-paper-300 dark:border-paper-800 bg-white dark:bg-paper-900 shadow-card p-5 sm:p-7 overflow-hidden">
          {/* Header of preview */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-paper-200 dark:border-paper-800">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-forest dark:text-emerald-400">
                Interactive Schedule Preview
              </span>
              <h3 className="font-serif text-xl font-semibold text-ink-950 dark:text-white mt-0.5">
                Week 12 • Final Revision Block
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] bg-paper-100 dark:bg-paper-800 text-ink-600 dark:text-ink-400 font-mono">
                Sample Schedule
              </span>
              <button
                onClick={() => setActiveView('timetable')}
                className="text-xs font-semibold text-forest dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Open full timetable</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Three representative realistic sessions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-5">
            <div className="p-4 rounded-lg border border-forest/30 bg-forest/5 dark:bg-forest/15 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-forest text-white">
                    CS 301
                  </span>
                  <span className="text-xs font-mono text-ink-500">09:00 – 10:30</span>
                </div>
                <h4 className="font-serif text-base font-semibold text-ink-950 dark:text-white">
                  Raft Consensus Traces & Leader Election
                </h4>
                <p className="text-xs text-ink-600 dark:text-ink-300 mt-1 line-clamp-2">
                  Walk through unpartitioned election proofs and log matching edge cases.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-forest/20 flex items-center justify-between text-[11px] text-forest dark:text-emerald-300 font-medium">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Completed today</span>
                </span>
                <span>90m</span>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-amber-border/70 bg-amber-light/40 dark:bg-amber-950/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-warm text-white">
                    MATH 204
                  </span>
                  <span className="text-xs font-mono text-ink-500">14:30 – 16:00</span>
                </div>
                <h4 className="font-serif text-base font-semibold text-ink-950 dark:text-white">
                  Markov Chains & Transition Matrices
                </h4>
                <p className="text-xs text-ink-600 dark:text-ink-300 mt-1 line-clamp-2">
                  Practicing stationary distribution derivations from chapter 4 problem set.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-amber-border/50 flex items-center justify-between text-[11px] text-amber-badge dark:text-amber-300 font-medium">
                <span>Scheduled next</span>
                <span>90m</span>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-paper-300 dark:border-paper-700 bg-paper-50 dark:bg-paper-800/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-700 text-white">
                    CS 315
                  </span>
                  <span className="text-xs font-mono text-ink-500">Tomorrow • 10:00</span>
                </div>
                <h4 className="font-serif text-base font-semibold text-ink-950 dark:text-white">
                  B+ Tree Index Concurrency & Lock Coupling
                </h4>
                <p className="text-xs text-ink-600 dark:text-ink-300 mt-1 line-clamp-2">
                  Review buffer pool pinning protocols and tree reorganization rules.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-paper-200 dark:border-paper-700 flex items-center justify-between text-[11px] text-ink-500 font-medium">
                <span>Upcoming</span>
                <span>75m</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-forest dark:text-emerald-400">
            Three Steps to Clarity
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-ink-950 dark:text-ink-50 mt-1">
            How SEMESTER works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 shadow-subtle">
            <span className="font-serif text-3xl font-light text-forest dark:text-emerald-400 block mb-3">
              01.
            </span>
            <h3 className="font-serif text-lg font-semibold text-ink-950 dark:text-white mb-2">
              Input Your Exam Dates & Syllabus
            </h3>
            <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
              Enter course names, examination dates, and syllabus topics. Live countdowns update instantly in your local timezone.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 shadow-subtle">
            <span className="font-serif text-3xl font-light text-forest dark:text-emerald-400 block mb-3">
              02.
            </span>
            <h3 className="font-serif text-lg font-semibold text-ink-950 dark:text-white mb-2">
              Generate a Realistic Schedule
            </h3>
            <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
              Our transparent rule-based planner respects your declared daily hours and buffers breaks between revision blocks.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 shadow-subtle">
            <span className="font-serif text-3xl font-light text-forest dark:text-emerald-400 block mb-3">
              03.
            </span>
            <h3 className="font-serif text-lg font-semibold text-ink-950 dark:text-white mb-2">
              Revise With Focus Mode
            </h3>
            <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
              Launch distraction-free timers, mark syllabus topics from Learning to Confident, and review real study progress each week.
            </p>
          </div>
        </div>
      </section>

      {/* CORE FEATURES EDITORIAL PRESENTATION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center mb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-forest dark:text-emerald-400">
            Thoughtful Tools
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-ink-950 dark:text-ink-50 mt-1">
            Designed for the emotional reality of exam season
          </h2>
        </div>

        {/* Feature 1: Readiness Map */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white dark:bg-paper-900 p-6 sm:p-8 rounded-xl border border-paper-300 dark:border-paper-800 shadow-subtle">
          <div>
            <div className="w-8 h-8 rounded-full bg-forest/10 dark:bg-forest/20 text-forest dark:text-emerald-400 flex items-center justify-center mb-3">
              <MapPin className="w-4 h-4" />
            </div>
            <h3 className="font-serif text-2xl font-semibold text-ink-950 dark:text-ink-50">
              Syllabus Readiness Map
            </h3>
            <p className="text-xs sm:text-sm text-ink-600 dark:text-ink-300 mt-2 leading-relaxed">
              Never wonder what you have or haven’t covered. Track each syllabus unit across four honest, self-assessed states: <em>Not started</em>, <em>Learning</em>, <em>Needs revision</em>, and <em>Confident</em>.
            </p>
            <p className="text-xs text-ink-500 mt-2 italic">
              *Transparent math: Confident topics divided by total topics. No opaque AI percentages or fake predictions.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-paper-50 dark:bg-paper-800/60 border border-paper-200 dark:border-paper-700 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-ink-900 dark:text-white">Distributed Systems Readiness</span>
              <span className="font-mono font-bold text-forest dark:text-emerald-400">60%</span>
            </div>
            <div className="w-full bg-paper-200 dark:bg-paper-700 h-2 rounded-full overflow-hidden">
              <div className="bg-forest dark:bg-emerald-500 h-full w-3/5 rounded-full" />
            </div>
            <div className="text-[11px] text-ink-500 flex justify-between">
              <span>3 of 5 topics marked Confident</span>
              <span className="text-amber-badge dark:text-amber-300">1 needs revision</span>
            </div>
          </div>
        </div>

        {/* Feature 2: Smart Next Step & Focus Mode */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white dark:bg-paper-900 p-6 sm:p-8 rounded-xl border border-paper-300 dark:border-paper-800 shadow-subtle">
          <div className="order-2 md:order-1 p-4 rounded-lg bg-paper-50 dark:bg-paper-800/60 border border-paper-200 dark:border-paper-700 space-y-3">
            <div className="flex items-center gap-2 text-forest dark:text-emerald-400 text-xs font-semibold">
              <Compass className="w-4 h-4" />
              <span>Smart Next Step Engine</span>
            </div>
            <h4 className="font-serif text-sm font-semibold text-ink-900 dark:text-ink-100">
              "Review high-priority topic: 2-Phase Commit"
            </h4>
            <p className="text-xs text-ink-600 dark:text-ink-300">
              Derived from your active calendar: CS 301 is in 8 days and this topic is marked 'Needs revision'.
            </p>
          </div>

          <div className="order-1 md:order-2">
            <div className="w-8 h-8 rounded-full bg-forest/10 dark:bg-forest/20 text-forest dark:text-emerald-400 flex items-center justify-center mb-3">
              <Compass className="w-4 h-4" />
            </div>
            <h3 className="font-serif text-2xl font-semibold text-ink-950 dark:text-ink-50">
              Smart Next Step & Distraction-Free Focus
            </h3>
            <p className="text-xs sm:text-sm text-ink-600 dark:text-ink-300 mt-2 leading-relaxed">
              When overwhelmed, decision paralysis is the biggest enemy. SEMESTER provides one explainable recommendation at a time, backed by an intentional Pomodoro focus timer with gentle synthetic chimes.
            </p>
          </div>
        </div>
      </section>

      {/* WHY SEMESTER SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-paper-50 dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-xl p-6 sm:p-10 shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-forest dark:text-emerald-400">
            Brand Philosophy
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-ink-950 dark:text-ink-50 mt-1 mb-4">
            Why SEMESTER?
          </h2>
          <p className="text-sm text-ink-700 dark:text-ink-300 leading-relaxed font-serif text-base sm:text-lg mb-4 italic">
            "SEMESTER was created around a simple belief: students don't always need to study harder; they need a clearer way to plan, prioritise, and prepare. By turning scattered exam dates and revision tasks into a realistic daily plan, SEMESTER helps students approach exam season with greater clarity and confidence."
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-paper-200 dark:border-paper-800 text-xs text-ink-600 dark:text-ink-400">
            <div>
              <strong className="block text-ink-900 dark:text-white mb-1">Clarity over Clutter</strong>
              <span>Every element answers: what exam is next, and what should I study today?</span>
            </div>
            <div>
              <strong className="block text-ink-900 dark:text-white mb-1">Progress without Guilt</strong>
              <span>Missed a session? Simply adjust availability without punitive broken streaks.</span>
            </div>
            <div>
              <strong className="block text-ink-900 dark:text-white mb-1">Zero Lock-in</strong>
              <span>Export and import your complete workspace in standard JSON anytime.</span>
            </div>
          </div>
        </div>
      </section>

      {/* FREE FOR STUDENTS SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="p-8 sm:p-12 rounded-xl bg-forest text-white shadow-elevated">
          <span className="text-xs uppercase tracking-widest font-semibold text-emerald-300">
            Free & Open Tool
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold mt-2 mb-4">
            Your plan, your pace. Free for students.
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl mx-auto leading-relaxed mb-6">
            SEMESTER runs entirely in your web browser. No subscriptions, no gated premium tiers, no personal data harvesting, and no account barriers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="px-6 py-3 rounded-md bg-white text-forest hover:bg-paper-100 text-xs font-semibold shadow-sm transition-all"
            >
              Build my study plan now
            </button>
            <button
              onClick={() => setActiveView('dashboard')}
              className="px-6 py-3 rounded-md border border-white/40 hover:bg-white/10 text-white text-xs font-medium transition-colors"
            >
              Open workspace
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 border-t border-paper-300 dark:border-paper-800 text-xs text-ink-500 dark:text-ink-400 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-serif text-base font-semibold text-ink-950 dark:text-white">
            SEMESTER
          </span>
          <span className="ml-2">
            • Academic planning &amp; exam season workspace.
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveView('dashboard')}
            className="hover:text-forest dark:hover:text-emerald-400"
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveView('timetable')}
            className="hover:text-forest dark:hover:text-emerald-400"
          >
            Timetable
          </button>
          <button
            onClick={() => setActiveView('settings')}
            className="hover:text-forest dark:hover:text-emerald-400"
          >
            Data & Privacy
          </button>
        </div>
      </footer>
    </div>
  );
}
