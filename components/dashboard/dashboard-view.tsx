'use client';

import React from 'react';
import { usePlanner } from '@/lib/context/planner-context';
import { CountdownBanner } from './countdown-banner';
import { SmartNextStepCard } from './smart-next-step';
import { TodayPlan } from './today-plan';
import { ReadinessOverview } from './readiness-overview';
import { calculateWeeklyReview, calculateSubjectReadiness } from '@/lib/calculations';
import {
  Calendar,
  Sparkles,
  Plus,
  BarChart2,
  CheckCircle,
  Timer,
  BookOpen,
  Info,
  RefreshCw,
} from 'lucide-react';

interface DashboardViewProps {
  onOpenNewSession: () => void;
  onOpenNewSubject: () => void;
  onOpenSuggestPlan: () => void;
}

export function DashboardView({
  onOpenNewSession,
  onOpenNewSubject,
  onOpenSuggestPlan,
}: DashboardViewProps) {
  const {
    data,
    setActiveView,
    toggleSessionComplete,
    resetAllData,
  } = usePlanner();

  const weeklyMetrics = calculateWeeklyReview(
    data.sessions,
    data.focusRecords,
    data.subjects,
    data.topics,
    new Date()
  );

  const totalTopics = data.topics.length;
  const confidentTopics = data.topics.filter((t) => t.status === 'confident').length;
  const overallReadiness = totalTopics > 0 ? Math.round((confidentTopics / totalTopics) * 100) : 0;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-200">
      {/* Sample Data Callout Banner if active */}
      {data.profile.isSampleData && (
        <div className="p-3.5 rounded-lg border border-amber-border/80 bg-amber-light/80 dark:bg-amber-950/30 dark:border-amber-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-950 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-badge shrink-0" />
            <div>
              <span className="font-semibold">Demonstration Mode:</span> You are viewing realistic editable sample data for four university courses.
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => resetAllData(false)}
              className="px-2.5 py-1 rounded bg-white dark:bg-paper-900 border border-amber-border hover:bg-amber-50 text-ink-800 dark:text-ink-100 font-medium transition-colors"
            >
              Clear to clean slate
            </button>
            <button
              onClick={() => resetAllData(true)}
              className="px-2.5 py-1 rounded bg-amber-warm/20 hover:bg-amber-warm/30 font-medium transition-colors"
            >
              Reset sample data
            </button>
          </div>
        </div>
      )}

      {/* Hero Exam Countdown */}
      <CountdownBanner
        subjects={data.subjects}
        onAddSubject={onOpenNewSubject}
        onViewSubject={(id) => setActiveView('exams')}
      />

      {/* Answer question 4: What should I do next? */}
      <SmartNextStepCard
        subjects={data.subjects}
        topics={data.topics}
        sessions={data.sessions}
        onActionClick={(view) => setActiveView(view)}
      />

      {/* At-a-glance calm metrics strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-lg p-4 shadow-subtle">
          <div className="flex items-center justify-between text-ink-500 dark:text-ink-400 mb-1">
            <span className="text-xs uppercase font-medium tracking-wider">Scheduled Exams</span>
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-2xl font-bold text-ink-950 dark:text-white tabular-nums">
              {data.subjects.length}
            </span>
            <span className="text-xs text-ink-500">subjects</span>
          </div>
        </div>

        <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-lg p-4 shadow-subtle">
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

        <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-lg p-4 shadow-subtle">
          <div className="flex items-center justify-between text-ink-500 dark:text-ink-400 mb-1">
            <span className="text-xs uppercase font-medium tracking-wider">This Week's Plan</span>
            <CheckCircle className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-2xl font-bold text-ink-950 dark:text-white tabular-nums">
              {weeklyMetrics.completedSessionsCount}/{weeklyMetrics.plannedSessionsCount}
            </span>
            <span className="text-xs text-ink-500">completed</span>
          </div>
        </div>

        <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-lg p-4 shadow-subtle">
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
        {/* Left Column: Answer Question 2 (What should I study today?) & Question 3 (What have I completed?) */}
        <div className="lg:col-span-7 space-y-6">
          <TodayPlan
            sessions={data.sessions}
            subjects={data.subjects}
            onToggleComplete={toggleSessionComplete}
            onStartFocus={(sessId, subjId) => {
              setActiveView('focus');
            }}
            onAddSession={onOpenNewSession}
            onViewTimetable={() => setActiveView('timetable')}
          />
        </div>

        {/* Right Column: Syllabus Readiness & Planning Assistant */}
        <div className="lg:col-span-5 space-y-6">
          <ReadinessOverview
            subjects={data.subjects}
            topics={data.topics}
            onOpenReadinessMap={(subjectId) => {
              setActiveView('readiness');
            }}
            onAddSubject={onOpenNewSubject}
          />

          {/* Quick study planner action */}
          <div className="p-4 rounded-lg border border-paper-300 dark:border-paper-800 bg-paper-50 dark:bg-paper-900 text-xs">
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
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-forest hover:bg-forest-hover text-white font-medium shadow-subtle transition-colors"
                  >
                    <span>Generate 7-day study plan</span>
                  </button>
                  <button
                    onClick={() => setActiveView('timetable')}
                    className="px-2.5 py-1.5 text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-100 transition-colors"
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
