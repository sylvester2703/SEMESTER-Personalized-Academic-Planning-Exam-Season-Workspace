'use client';

import React from 'react';
import { usePlanner } from '@/lib/context/planner-context';
import { CountdownBanner } from './countdown-banner';
import { SmartNextStepCard } from './smart-next-step';
import { TodayPlan } from './today-plan';
import { ReadinessOverview } from './readiness-overview';
import { ExamDayMode } from '../exams/exam-day-mode';
import { calculateWeeklyReview } from '@/lib/calculations';
import { StudySession } from '@/types';
import {
  Calendar,
  Sparkles,
  Plus,
  BarChart2,
  CheckCircle,
  Timer,
  BookOpen,
  Info,
  Compass,
  FileDown,
  RotateCcw,
  ArrowRight,
  Shield,
  Clock,
  GraduationCap,
} from 'lucide-react';

interface DashboardViewProps {
  onOpenNewSession: () => void;
  onOpenNewSubject: () => void;
  onOpenSuggestPlan: () => void;
  onOpenWhatToStudy?: () => void;
  onOpenPdfExport?: () => void;
  onRecoverSession?: (session: StudySession) => void;
}

export function DashboardView({
  onOpenNewSession,
  onOpenNewSubject,
  onOpenSuggestPlan,
  onOpenWhatToStudy,
  onOpenPdfExport,
  onRecoverSession,
}: DashboardViewProps) {
  const {
    data,
    setActiveView,
    toggleSessionComplete,
    setIsOnboardingOpen,
    loadSamplePlan,
    leaveSamplePlan,
  } = usePlanner();

  const subjects = data.subjects;
  const topics = data.topics;
  const sessions = data.sessions;
  const focusRecords = data.focusRecords;

  const totalTopics = topics.length;
  const confidentTopics = topics.filter((t) => t.status === 'confident').length;
  const overallReadiness = totalTopics > 0 ? Math.round((confidentTopics / totalTopics) * 100) : 0;

  const weeklyMetrics = calculateWeeklyReview(
    sessions,
    focusRecords,
    subjects,
    topics,
    new Date()
  );

  // If new user with ZERO subjects, show intentional, beautiful empty state
  if (subjects.length === 0) {
    return (
      <div className="space-y-8 animate-in fade-in-50 duration-200">
        {/* Intentional Empty State Container */}
        <div className="rounded-2xl border border-paper-300 dark:border-paper-750 bg-paper-50 dark:bg-paper-900/60 p-6 sm:p-10 shadow-sm">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest/10 dark:bg-forest/20 text-forest dark:text-emerald-400 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Clean Academic Workspace</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ink-950 dark:text-white">
              Your semester starts here.
            </h1>

            <p className="text-sm sm:text-base text-ink-600 dark:text-ink-300 leading-relaxed">
              Add your exams, tell us about your daily routine, and we&apos;ll help you build a study plan that fits your life. No fabricated data, no unrealistic 12-hour cramming sessions.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setIsOnboardingOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-forest hover:bg-forest-hover text-white text-sm font-semibold shadow-md transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Build my study plan</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={loadSamplePlan}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 text-ink-800 dark:text-ink-200 hover:bg-paper-100 dark:hover:bg-paper-750 text-sm font-medium transition-all cursor-pointer"
              >
                <span>Explore a sample plan</span>
              </button>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenNewSubject}
                className="text-xs text-forest dark:text-emerald-400 hover:underline font-medium"
              >
                Or + manually add a single examination
              </button>
            </div>
          </div>

          {/* 3 Core Architecture Pillars */}
          <div className="mt-10 pt-8 border-t border-paper-200 dark:border-paper-800 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-4 rounded-xl bg-white dark:bg-paper-850 border border-paper-200 dark:border-paper-750 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-forest/10 dark:bg-forest/20 text-forest dark:text-emerald-400 flex items-center justify-center mb-3">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="font-serif font-bold text-ink-950 dark:text-white text-sm">
                1. Your Real Routine
              </h3>
              <p className="text-xs text-ink-600 dark:text-ink-400 mt-1 leading-relaxed">
                Protect sleep, lectures, meals, and commute hours. Study sessions are only placed in your genuine availability.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-paper-850 border border-paper-200 dark:border-paper-750 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-3">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="font-serif font-bold text-ink-950 dark:text-white text-sm">
                2. Syllabus Intelligence
              </h3>
              <p className="text-xs text-ink-600 dark:text-ink-400 mt-1 leading-relaxed">
                Enter or paste course units. Track topics by confidence level, estimated duration, and active recall needs.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-paper-850 border border-paper-200 dark:border-paper-750 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-3">
                <Shield className="w-4 h-4" />
              </div>
              <h3 className="font-serif font-bold text-ink-950 dark:text-white text-sm">
                3. Calm Next Actions
              </h3>
              <p className="text-xs text-ink-600 dark:text-ink-400 mt-1 leading-relaxed">
                Zero guilt or shame. Transparent local scheduling highlights exactly what to revise next without panic.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Populated state with personal or sample data
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-200">
      {/* Imminent Exam-Day Preparation Mode if exam within 48h */}
      <ExamDayMode />

      {/* Persistent Sample Demonstration Banner */}
      {data.profile.isSampleData && (
        <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-500/10 dark:bg-amber-950/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-950 dark:text-amber-200 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <span className="font-bold">Demonstration Mode Active:</span> You are exploring a sample university course plan with 4 subjects.
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={leaveSamplePlan}
              className="px-3 py-1.5 rounded-lg bg-forest hover:bg-forest-hover text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Leave Demo & Start My Real Plan</span>
            </button>
          </div>
        </div>
      )}

      {/* Personalized Plan Explanation Statement */}
      {data.profile.planExplanation && (
        <div className="p-4 rounded-xl border border-forest/30 bg-forest/5 dark:bg-emerald-950/20 text-xs text-ink-800 dark:text-ink-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <Compass className="w-4 h-4 text-forest dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold uppercase tracking-wider text-forest dark:text-emerald-400 block text-[10px]">
                Personalized Plan Rationale
              </span>
              <p className="leading-relaxed mt-0.5">{data.profile.planExplanation}</p>
            </div>
          </div>
          {onOpenPdfExport && (
            <button
              onClick={onOpenPdfExport}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest hover:bg-forest-dark text-white font-medium text-xs shadow-2xs"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          )}
        </div>
      )}

      {/* Hero Exam Countdown */}
      <CountdownBanner
        subjects={subjects}
        onAddSubject={onOpenNewSubject}
        onViewSubject={(id) => setActiveView('exams')}
      />

      {/* Prominent Next Action & What should I study now? trigger */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-serif text-lg font-bold text-ink-950 dark:text-white">
            Recommended Action
          </h3>
          {onOpenWhatToStudy && (
            <button
              onClick={onOpenWhatToStudy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-xs font-semibold shadow-2xs transition-all"
            >
              <Compass className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>What should I study now?</span>
            </button>
          )}
        </div>

        <SmartNextStepCard
          subjects={subjects}
          topics={topics}
          sessions={sessions}
          onActionClick={(view) => setActiveView(view)}
        />
      </div>

      {/* Metrics strip based strictly on real records */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-paper-850 border border-paper-300 dark:border-paper-750 rounded-xl p-4 shadow-subtle">
          <div className="flex items-center justify-between text-ink-500 dark:text-ink-400 mb-1">
            <span className="text-xs uppercase font-medium tracking-wider">Scheduled Exams</span>
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-2xl font-bold text-ink-950 dark:text-white tabular-nums">
              {subjects.length}
            </span>
            <span className="text-xs text-ink-500">subjects</span>
          </div>
        </div>

        <div className="bg-white dark:bg-paper-850 border border-paper-300 dark:border-paper-750 rounded-xl p-4 shadow-subtle">
          <div className="flex items-center justify-between text-ink-500 dark:text-ink-400 mb-1">
            <span className="text-xs uppercase font-medium tracking-wider">Overall Readiness</span>
            <BarChart2 className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-2xl font-bold text-forest dark:text-emerald-400 tabular-nums">
              {overallReadiness}%
            </span>
            <span className="text-xs text-ink-500">
              ({confidentTopics}/{totalTopics} confident)
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-paper-850 border border-paper-300 dark:border-paper-750 rounded-xl p-4 shadow-subtle">
          <div className="flex items-center justify-between text-ink-500 dark:text-ink-400 mb-1">
            <span className="text-xs uppercase font-medium tracking-wider">This Week&apos;s Plan</span>
            <CheckCircle className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-2xl font-bold text-ink-950 dark:text-white tabular-nums">
              {weeklyMetrics.completedSessionsCount}/{weeklyMetrics.plannedSessionsCount}
            </span>
            <span className="text-xs text-ink-500">completed</span>
          </div>
        </div>

        <div className="bg-white dark:bg-paper-850 border border-paper-300 dark:border-paper-750 rounded-xl p-4 shadow-subtle">
          <div className="flex items-center justify-between text-ink-500 dark:text-ink-400 mb-1">
            <span className="text-xs uppercase font-medium tracking-wider">Logged Focus</span>
            <Timer className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-2xl font-bold text-ink-950 dark:text-white tabular-nums">
              {weeklyMetrics.focusHoursFormatted}
            </span>
            <span className="text-xs text-ink-500">this week</span>
          </div>
        </div>
      </div>

      {/* Main 2-column workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        <div className="lg:col-span-7 space-y-6">
          <TodayPlan
            sessions={sessions}
            subjects={subjects}
            onToggleComplete={toggleSessionComplete}
            onStartFocus={(sessId, subjId) => {
              setActiveView('focus');
            }}
            onAddSession={onOpenNewSession}
            onViewTimetable={() => setActiveView('timetable')}
            onRecoverMissedSession={onRecoverSession}
          />
        </div>

        <div className="lg:col-span-5 space-y-6">
          <ReadinessOverview
            subjects={subjects}
            topics={topics}
            onOpenReadinessMap={(subjectId) => {
              setActiveView('readiness');
            }}
            onAddSubject={onOpenNewSubject}
          />

          <div className="p-4 rounded-xl border border-paper-300 dark:border-paper-750 bg-paper-50 dark:bg-paper-850 text-xs shadow-2xs">
            <div className="flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-forest dark:text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-serif font-semibold text-ink-950 dark:text-ink-50 text-sm">
                  Realistic Weekly Planner
                </h4>
                <p className="text-ink-600 dark:text-ink-400 mt-1 leading-relaxed">
                  Need a balanced schedule for the next 7 days? SEMESTER generates structured revision slots tailored to your daily capacity.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={onOpenSuggestPlan}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest hover:bg-forest-hover text-white font-medium shadow-subtle transition-colors cursor-pointer"
                  >
                    <span>Generate 7-day study plan</span>
                  </button>
                  <button
                    onClick={() => setActiveView('timetable')}
                    className="px-2.5 py-1.5 text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-100 transition-colors cursor-pointer"
                  >
                    View timetable
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
