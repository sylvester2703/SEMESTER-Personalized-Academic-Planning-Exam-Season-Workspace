'use client';

import React, { useState, useEffect } from 'react';
import { usePlanner } from '@/lib/context/planner-context';
import { calculateExamCountdown } from '@/lib/dates';
import {
  Sparkles,
  ArrowRight,
  Compass,
  MapPin,
  ShieldCheck,
  Calendar,
  Clock,
  User,
  UserPlus,
  LogIn,
  LogOut,
  CheckCircle2,
  Coffee,
  BookOpen,
  Layers,
  Bell,
  Check,
} from 'lucide-react';

export function LandingView() {
  const { data, setActiveView, setIsOnboardingOpen, setIsAuthModalOpen, currentUser, signOut } = usePlanner();

  // Live ticking countdown for "Extra Marks for Effort"
  const [countdown, setCountdown] = useState(() => calculateExamCountdown(data.subjects));

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(calculateExamCountdown(data.subjects));
    }, 1000);
    return () => clearInterval(timer);
  }, [data.subjects]);

  // Fallback demo timer if student hasn't entered exams yet
  const nextExam = countdown.nextExam || {
    name: 'Distributed Systems & Cloud Computing',
    code: 'CS 301',
    examDate: 'Final Examinations',
    examTime: '09:30 AM',
    examLocation: 'Hall B, Main Campus',
  };

  const displayDays = countdown.nextExam ? countdown.days : 14;
  const displayHours = countdown.nextExam ? countdown.hours : 6;
  const displayMins = countdown.nextExam ? countdown.minutes : 32;
  const displaySecs = countdown.nextExam ? countdown.seconds : 45;

  return (
    <div className="space-y-8 sm:space-y-14 py-2 sm:py-6 animate-in fade-in-50 duration-200">
      {/* 1. HERO SECTION (Must-Have: Hero with one clear line and a sign up button) */}
      <section className="text-center max-w-4xl mx-auto px-4 sm:px-6">
        {/* Above-the-fold Live Exam Countdown Notification Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-forest/30 dark:border-forest/50 bg-forest/10 dark:bg-forest/20 text-forest dark:text-emerald-300 text-xs font-semibold mb-4 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <Clock className="w-3.5 h-3.5" />
          <span suppressHydrationWarning>
            Next Exam in {displayDays}d {displayHours}h {displayMins}m {displaySecs}s · {nextExam.name} ({nextExam.code})
          </span>
        </div>

        {/* Clear One-Line Headline */}
        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-ink-950 dark:text-ink-50 leading-[1.15] mb-3">
          Your exams have dates. <br className="hidden sm:inline" />
          Your preparation needs a plan.
        </h1>

        <p className="font-serif italic text-base sm:text-lg text-forest dark:text-emerald-300 font-medium mb-3">
          "Make a plan. Find your focus. Walk in prepared."
        </p>

        <p className="text-xs sm:text-sm text-ink-600 dark:text-ink-300 max-w-2xl mx-auto leading-relaxed mb-6">
          Turn a crowded university exam timetable into a realistic study routine, one focused session at a time. No complex setup, no fake metrics, no guilt.
        </p>

        {/* Primary CTAs: Conditionally renders Login/Sign Up vs Logout based on authentication */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {currentUser ? (
            <>
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-forest/10 dark:bg-forest/20 text-forest dark:text-emerald-300 text-sm font-medium border border-forest/30">
                <User className="w-4 h-4 shrink-0" />
                <span>Logged in as <strong>{currentUser.email}</strong></span>
              </div>

              <button
                onClick={() => signOut()}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-sm font-semibold transition-colors shadow-subtle cursor-pointer"
                title="Sign out of your account"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>

              <button
                onClick={() => setActiveView('dashboard')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-forest hover:bg-forest-hover text-white text-sm font-bold shadow-card hover:shadow-dropdown transition-all cursor-pointer ring-2 ring-forest/30"
              >
                <Sparkles className="w-4 h-4" />
                <span>Open Study Planner</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-forest hover:bg-forest-hover text-white text-sm font-bold shadow-card hover:shadow-dropdown transition-all cursor-pointer ring-2 ring-forest/30"
              >
                <UserPlus className="w-4 h-4" />
                <span>Sign Up Free</span>
              </button>

              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-900 text-ink-900 dark:text-ink-100 text-sm font-semibold hover:bg-paper-100 dark:hover:bg-paper-800 transition-colors shadow-subtle cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-forest dark:text-emerald-400" />
                <span>Sign In / Login</span>
              </button>

              <button
                onClick={() => setIsOnboardingOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-forest/30 bg-forest/5 dark:bg-forest/20 text-forest dark:text-emerald-300 text-sm font-semibold hover:bg-forest/10 transition-colors shadow-subtle cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Build My Study Plan</span>
              </button>
            </>
          )}

          <button
            onClick={() => setActiveView('dashboard')}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 text-xs font-semibold text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white transition-colors"
          >
            <span>Explore Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-[11px] text-ink-500 dark:text-ink-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-forest dark:text-emerald-400" />
            <span className="font-semibold">100% Free for students</span>
          </span>
          <span>•</span>
          <span>Runs in browser with Supabase cloud backup</span>
          <span>•</span>
          <span>Automated Email & WhatsApp schedule updates</span>
        </div>
      </section>

      {/* 2. EXTRA MARKS FOR EFFORT: LIVE COUNTDOWN TO NEXT EXAM */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 shadow-card relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-forest via-emerald-500 to-amber-500" />

          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-forest/10 dark:bg-forest/25 text-forest dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-forest dark:bg-emerald-400 animate-ping" />
                <span>Countdown to Next Exam · Live</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-ink-950 dark:text-ink-50">
                {nextExam.name}
              </h3>
              <p className="text-xs text-ink-500 dark:text-ink-400 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <span className="font-semibold text-forest dark:text-emerald-400">{nextExam.code}</span>
                <span>•</span>
                <span>{nextExam.examDate}</span>
                <span>•</span>
                <span>{nextExam.examLocation}</span>
              </p>
            </div>

            {/* Live Ticking Countdown Digits */}
            <div className="grid grid-cols-4 gap-2.5 sm:gap-3 text-center">
              <div className="flex flex-col items-center bg-paper-100 dark:bg-paper-800 border border-paper-300 dark:border-paper-700 rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 min-w-[62px] sm:min-w-[74px]">
                <span suppressHydrationWarning className="tabular-nums font-serif text-2xl sm:text-4xl font-bold text-ink-950 dark:text-white leading-none">
                  {String(displayDays).padStart(2, '0')}
                </span>
                <span className="text-[10px] uppercase font-semibold text-ink-500 dark:text-ink-400 mt-1">
                  Days
                </span>
              </div>

              <div className="flex flex-col items-center bg-paper-100 dark:bg-paper-800 border border-paper-300 dark:border-paper-700 rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 min-w-[62px] sm:min-w-[74px]">
                <span suppressHydrationWarning className="tabular-nums font-serif text-2xl sm:text-4xl font-bold text-ink-950 dark:text-white leading-none">
                  {String(displayHours).padStart(2, '0')}
                </span>
                <span className="text-[10px] uppercase font-semibold text-ink-500 dark:text-ink-400 mt-1">
                  Hours
                </span>
              </div>

              <div className="flex flex-col items-center bg-paper-100 dark:bg-paper-800 border border-paper-300 dark:border-paper-700 rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 min-w-[62px] sm:min-w-[74px]">
                <span suppressHydrationWarning className="tabular-nums font-serif text-2xl sm:text-4xl font-bold text-ink-950 dark:text-white leading-none">
                  {String(displayMins).padStart(2, '0')}
                </span>
                <span className="text-[10px] uppercase font-semibold text-ink-500 dark:text-ink-400 mt-1">
                  Mins
                </span>
              </div>

              <div className="flex flex-col items-center bg-forest/15 dark:bg-emerald-950/70 border border-forest/30 dark:border-emerald-700/60 rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 min-w-[62px] sm:min-w-[74px]">
                <span suppressHydrationWarning className="tabular-nums font-serif text-2xl sm:text-4xl font-bold text-forest dark:text-emerald-400 leading-none">
                  {String(displaySecs).padStart(2, '0')}
                </span>
                <span className="text-[10px] uppercase font-bold text-forest dark:text-emerald-400 mt-1">
                  Secs
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SAMPLE TIMETABLE PREVIEW (Must-Have Requirement) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-forest dark:text-emerald-400">
            Intelligent Scheduling
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-ink-950 dark:text-ink-50 mt-1">
            Sample Timetable Preview
          </h2>
          <p className="text-xs sm:text-sm text-ink-600 dark:text-ink-300 max-w-xl mx-auto mt-2 leading-relaxed">
            A realistic daily rhythm that respects your fixed college lectures, sleep, and meals while spacing revision sessions with restorative breaks.
          </p>
        </div>

        <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-2xl p-5 sm:p-7 shadow-subtle space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-paper-200 dark:border-paper-800 text-xs text-ink-500">
            <span className="font-semibold text-ink-900 dark:text-white font-serif text-sm">
              Today's Schedule · Tuesday Revision Rhythm
            </span>
            <span className="font-mono text-forest dark:text-emerald-400 font-bold">
              3.5 Study Hours · 2 Fixed Commitments
            </span>
          </div>

          <div className="space-y-2.5">
            {/* Block 1: Fixed Routine */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-paper-200 dark:border-paper-800 bg-paper-50 dark:bg-paper-850 text-xs">
              <div className="flex items-center gap-3">
                <Coffee className="w-4 h-4 text-ink-400 shrink-0" />
                <div>
                  <div className="font-semibold text-ink-800 dark:text-ink-200 flex items-center gap-2">
                    <span>Morning Walk, Breakfast & Ready</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-paper-200 dark:bg-paper-700 text-ink-600 dark:text-ink-300 font-bold">
                      FIXED ROUTINE
                    </span>
                  </div>
                  <div className="text-[11px] text-ink-500 font-mono mt-0.5">
                    08:00 AM – 09:00 AM · 60m
                  </div>
                </div>
              </div>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Completed</span>
              </span>
            </div>

            {/* Block 2: Revision Session 1 */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border-2 border-forest/30 dark:border-emerald-600/40 bg-forest/5 dark:bg-emerald-950/20 text-xs shadow-2xs">
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-forest dark:text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-ink-950 dark:text-white flex items-center gap-2">
                    <span>CS 301: Distributed Systems</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-forest/15 text-forest dark:text-emerald-300 font-mono font-bold">
                      UNIT 2
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                      HIGH PRIORITY
                    </span>
                  </div>
                  <div className="text-[11px] text-ink-600 dark:text-ink-300 font-mono mt-0.5">
                    09:15 AM – 10:45 AM (90 mins) · Topic: 2-Phase Commit & Raft Consensus
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveView('focus')}
                className="px-3 py-1 bg-forest hover:bg-forest-hover text-white text-xs font-semibold rounded-md shadow-2xs cursor-pointer transition-all"
              >
                Start Focus Timer
              </button>
            </div>

            {/* Buffer break */}
            <div className="flex items-center justify-center py-1 text-[11px] text-ink-400 dark:text-ink-500 font-mono italic">
              — 15-Minute Buffer Break & Hydration —
            </div>

            {/* Block 3: Revision Session 2 */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 text-xs shadow-2xs">
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4 text-forest dark:text-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold text-ink-950 dark:text-white flex items-center gap-2">
                    <span>MATH 204: Probability & Statistics</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-forest/10 text-forest dark:text-emerald-300 font-mono">
                      UNIT 1
                    </span>
                  </div>
                  <div className="text-[11px] text-ink-600 dark:text-ink-300 font-mono mt-0.5">
                    11:00 AM – 12:15 PM (75 mins) · Topic: Bayes' Theorem & Conditional Variance
                  </div>
                </div>
              </div>
              <span className="text-xs text-ink-500 dark:text-ink-400 font-medium">
                Up Next Today
              </span>
            </div>

            {/* Block 4: Lunch */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-paper-200 dark:border-paper-800 bg-paper-50 dark:bg-paper-850 text-xs">
              <div className="flex items-center gap-3">
                <Coffee className="w-4 h-4 text-ink-400 shrink-0" />
                <div>
                  <div className="font-semibold text-ink-800 dark:text-ink-200 flex items-center gap-2">
                    <span>Campus Lunch & Social Rest</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-paper-200 dark:bg-paper-700 text-ink-600 dark:text-ink-300 font-bold">
                      FIXED ROUTINE
                    </span>
                  </div>
                  <div className="text-[11px] text-ink-500 font-mono mt-0.5">
                    12:30 PM – 01:30 PM · 60m
                  </div>
                </div>
              </div>
              <span className="text-xs text-ink-400">Scheduled</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
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
              Upload or paste your course syllabus. Create unit containers for each lesson and its contents with automated extraction.
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
              Revise With Focus Mode & Automated Alerts
            </h3>
            <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
              Launch distraction-free timers, mark syllabus topics, and receive automated schedule updates on WhatsApp & Email.
            </p>
          </div>
        </div>
      </section>

      {/* 5. CORE FEATURES EDITORIAL PRESENTATION */}
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

      {/* 6. FREE FOR STUDENTS SECTION (Must-Have Requirement) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="p-8 sm:p-12 rounded-2xl bg-forest text-white shadow-elevated">
          <span className="text-xs uppercase tracking-widest font-semibold text-emerald-300">
            Free & Open Tool
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold mt-2 mb-4">
            Your plan, your pace. 100% Free for students.
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl mx-auto leading-relaxed mb-6">
            SEMESTER runs entirely in your web browser. No subscriptions, no gated premium tiers, no personal data harvesting, and no account barriers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {currentUser ? (
              <>
                <button
                  onClick={() => setActiveView('dashboard')}
                  className="px-6 py-3 rounded-lg bg-white text-forest hover:bg-paper-100 text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Open Your Planner</span>
                </button>
                <button
                  onClick={() => signOut()}
                  className="px-5 py-3 rounded-lg border border-white/60 hover:bg-white/10 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout ({currentUser.email?.split('@')[0]})</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-6 py-3 rounded-lg bg-white text-forest hover:bg-paper-100 text-xs font-semibold shadow-sm transition-all cursor-pointer"
                >
                  Sign Up & Create Study Plan
                </button>
                <button
                  onClick={() => setActiveView('dashboard')}
                  className="px-6 py-3 rounded-lg border border-white/40 hover:bg-white/10 text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  Open Workspace
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 border-t border-paper-300 dark:border-paper-800 text-xs text-ink-500 dark:text-ink-400 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-serif text-base font-semibold text-ink-950 dark:text-white">
            SEMESTER
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
