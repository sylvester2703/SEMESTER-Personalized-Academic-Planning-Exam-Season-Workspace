'use client';

import React, { useState } from 'react';
import { usePlanner } from '@/lib/context/planner-context';
import { calculateWeeklyReview } from '@/lib/calculations';
import {
  format,
  subWeeks,
  addWeeks,
  startOfWeek,
  endOfWeek,
  parseISO,
  isSameDay,
} from 'date-fns';
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface WeeklyReviewViewProps {
  onOpenSuggestPlan: () => void;
}

export function WeeklyReviewView({ onOpenSuggestPlan }: WeeklyReviewViewProps) {
  const { data, setActiveView } = usePlanner();
  const [referenceDate, setReferenceDate] = useState<Date>(new Date());
  const [showTableAlternative, setShowTableAlternative] = useState<boolean>(false);

  const prevWeek = () => setReferenceDate((d) => subWeeks(d, 1));
  const nextWeek = () => setReferenceDate((d) => addWeeks(d, 1));
  const resetToCurrent = () => setReferenceDate(new Date());

  const metrics = calculateWeeklyReview(
    data.sessions,
    data.focusRecords,
    data.subjects,
    data.topics,
    referenceDate
  );

  const isCurrentWeek = isSameDay(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
    startOfWeek(referenceDate, { weekStartsOn: 1 })
  );

  // Intentional empty state: do not show zero-value charts when no underlying data exists
  if (data.sessions.length === 0 && data.focusRecords.length === 0) {
    return (
      <div className="space-y-6 animate-in fade-in-50 duration-200">
        <div className="pb-4 border-b border-paper-300 dark:border-paper-800">
          <h2 className="font-serif text-2xl font-semibold text-ink-950 dark:text-ink-50">
            Weekly Review & Study Insights
          </h2>
          <p className="text-xs text-ink-500 dark:text-ink-400 mt-1">
            Grounded entirely in your actual recorded study activity.
          </p>
        </div>

        <div className="p-8 sm:p-12 text-center rounded-2xl border border-dashed border-paper-300 dark:border-paper-750 bg-paper-50 dark:bg-paper-850/60 max-w-2xl mx-auto space-y-4">
          <div className="w-12 h-12 mx-auto rounded-xl bg-forest/10 dark:bg-forest/20 text-forest dark:text-emerald-400 flex items-center justify-center">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-bold text-ink-950 dark:text-white">
            Your study insights will appear after you complete some sessions.
          </h3>
          <p className="text-xs sm:text-sm text-ink-600 dark:text-ink-300 leading-relaxed max-w-md mx-auto">
            SEMESTER doesn&apos;t invent fake streaks or fabricated productivity scores. Once you generate a plan and mark sessions or log focus time, comprehensive comparisons and completion trends will appear here.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onOpenSuggestPlan}
              className="px-4 py-2.5 rounded-xl bg-forest hover:bg-forest-hover text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate 7-Day Plan</span>
            </button>
            <button
              onClick={() => setActiveView('focus')}
              className="px-4 py-2.5 rounded-xl border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 text-ink-800 dark:text-ink-200 text-xs font-medium hover:bg-paper-100"
            >
              <span>Start Focus Timer</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-200">
      {/* Header & Week Nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-paper-300 dark:border-paper-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl font-semibold text-ink-950 dark:text-ink-50">
              Weekly Review & Study Insights
            </h2>
            {isCurrentWeek && (
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-forest/10 dark:bg-forest/25 text-forest dark:text-emerald-400">
                This Week
              </span>
            )}
          </div>
          <p className="text-xs text-ink-500 dark:text-ink-400 mt-1">
            Review of {format(parseISO(metrics.weekStart), 'd MMMM')} – {format(parseISO(metrics.weekEnd), 'd MMMM yyyy')}. Grounded entirely in saved session data.
          </p>
        </div>

        {/* Week navigation */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-700 rounded-md p-0.5">
            <button
              onClick={prevWeek}
              className="p-1.5 text-ink-600 hover:text-ink-950 dark:text-ink-400 dark:hover:text-white rounded hover:bg-paper-100 dark:hover:bg-paper-800 transition-colors"
              aria-label="Previous week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={resetToCurrent}
              className="px-2.5 py-1 text-xs font-medium text-ink-700 dark:text-ink-300 hover:text-forest dark:hover:text-emerald-400"
            >
              Current Week
            </button>
            <button
              onClick={nextWeek}
              className="p-1.5 text-ink-600 hover:text-ink-950 dark:text-ink-400 dark:hover:text-white rounded hover:bg-paper-100 dark:hover:bg-paper-800 transition-colors"
              aria-label="Next week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Honest Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Planned Sessions */}
        <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-lg p-4 sm:p-5 shadow-subtle">
          <span className="text-[11px] uppercase tracking-wider text-ink-500 dark:text-ink-400 font-medium">
            Planned Sessions
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-semibold text-ink-950 dark:text-white tabular-nums">
              {metrics.plannedSessionsCount}
            </span>
            <span className="text-xs text-ink-500">sessions</span>
          </div>
          <p className="text-[11px] text-ink-400 mt-1">Scheduled for this 7-day interval</p>
        </div>

        {/* Completed Sessions */}
        <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-lg p-4 sm:p-5 shadow-subtle">
          <span className="text-[11px] uppercase tracking-wider text-ink-500 dark:text-ink-400 font-medium">
            Completed Sessions
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-semibold text-forest dark:text-emerald-400 tabular-nums">
              {metrics.completedSessionsCount}
            </span>
            <span className="text-xs text-ink-500">
              ({metrics.completionRate}%)
            </span>
          </div>
          <p className="text-[11px] text-ink-400 mt-1">Marked completed by you</p>
        </div>

        {/* Focus Time */}
        <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-lg p-4 sm:p-5 shadow-subtle">
          <span className="text-[11px] uppercase tracking-wider text-ink-500 dark:text-ink-400 font-medium">
            Logged Focus Time
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-semibold text-ink-950 dark:text-white tabular-nums">
              {metrics.focusHoursFormatted}
            </span>
          </div>
          <p className="text-[11px] text-ink-400 mt-1">Recorded via Focus Mode timer</p>
        </div>

        {/* Pending or Missed */}
        <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-lg p-4 sm:p-5 shadow-subtle">
          <span className="text-[11px] uppercase tracking-wider text-ink-500 dark:text-ink-400 font-medium">
            Missed or Pending
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-semibold text-ink-950 dark:text-white tabular-nums">
              {metrics.missedPendingCount}
            </span>
            <span className="text-xs text-ink-500">sessions</span>
          </div>
          <p className="text-[11px] text-ink-400 mt-1">Unchecked or remaining</p>
        </div>
      </div>

      {/* Subject-Wise Time Allocation */}
      <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-lg p-5 sm:p-6 shadow-subtle">
        <div className="flex items-center justify-between pb-3.5 border-b border-paper-200 dark:border-paper-800">
          <div>
            <h3 className="font-serif text-lg font-semibold text-ink-950 dark:text-ink-50">
              Subject-wise Revision Allocation
            </h3>
            <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">
              Comparison of study minutes planned vs actually completed this week.
            </p>
          </div>

          <button
            onClick={() => setShowTableAlternative(!showTableAlternative)}
            className="text-xs text-forest dark:text-emerald-400 font-medium hover:underline"
          >
            {showTableAlternative ? 'Show visual bars' : 'Show tabular view'}
          </button>
        </div>

        {/* Visual Bar Breakdown */}
        {!showTableAlternative ? (
          <div className="mt-5 space-y-4">
            {metrics.subjectBreakdown.map((item) => {
              const plannedHours = Math.round(item.plannedMinutes / 60 * 10) / 10;
              const completedHours = Math.round(item.completedMinutes / 60 * 10) / 10;
              const progressPct = item.plannedMinutes > 0
                ? Math.min(100, Math.round((item.completedMinutes / item.plannedMinutes) * 100))
                : 0;

              return (
                <div key={item.subjectId} className="space-y-1.5">
                  <div className="flex items-baseline justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color || '#2D5541' }}
                      />
                      <span className="font-medium text-ink-900 dark:text-ink-100">
                        {item.subjectName}
                      </span>
                      {item.subjectCode && (
                        <span className="text-[11px] text-ink-500 font-mono">
                          ({item.subjectCode})
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-semibold text-ink-900 dark:text-white">
                        {completedHours}h
                      </span>
                      <span className="text-ink-400 font-mono text-[11px]">
                        {' '}of {plannedHours}h ({progressPct}%)
                      </span>
                    </div>
                  </div>

                  {/* Proportional dual bar */}
                  <div className="w-full bg-paper-200 dark:bg-paper-800 h-2.5 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-forest dark:bg-emerald-500 transition-all duration-300 rounded-full"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Accessible Table Alternative */
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-paper-300 dark:border-paper-700 text-ink-500 font-medium">
                  <th className="py-2 pr-4">Subject</th>
                  <th className="py-2 px-3 text-right">Planned (min)</th>
                  <th className="py-2 px-3 text-right">Completed (min)</th>
                  <th className="py-2 px-3 text-right">Sessions Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-200 dark:divide-paper-800">
                {metrics.subjectBreakdown.map((item) => (
                  <tr key={item.subjectId}>
                    <td className="py-2.5 pr-4 font-medium text-ink-900 dark:text-ink-100">
                      {item.subjectName} ({item.subjectCode})
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-ink-700 dark:text-ink-300">
                      {item.plannedMinutes}m
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-forest dark:text-emerald-400">
                      {item.completedMinutes}m
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-ink-700 dark:text-ink-300">
                      {item.completedSessions}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Next Week Planning Call to Action */}
      <div className="bg-paper-50 dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-lg p-6 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-lg font-semibold text-ink-950 dark:text-ink-50">
            Ready to plan the upcoming week?
          </h3>
          <p className="text-xs text-ink-600 dark:text-ink-400 mt-1 max-w-lg">
            SEMESTER can examine your nearest examinations and unfinished syllabus topics to generate a balanced 7-day study schedule.
          </p>
        </div>

        <button
          onClick={onOpenSuggestPlan}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-forest hover:bg-forest-hover text-white text-xs font-medium shadow-sm transition-all shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Generate Next Week's Plan</span>
        </button>
      </div>
    </div>
  );
}
