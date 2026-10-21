'use client';

import React from 'react';
import { Subject, Topic } from '@/types';
import { calculateSubjectReadiness } from '@/lib/calculations';
import { differenceInDays, parseISO } from 'date-fns';
import { MapPin, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface ReadinessOverviewProps {
  subjects: Subject[];
  topics: Topic[];
  onOpenReadinessMap: (subjectId?: string) => void;
  onAddSubject: () => void;
}

export function ReadinessOverview({
  subjects,
  topics,
  onOpenReadinessMap,
  onAddSubject,
}: ReadinessOverviewProps) {
  if (subjects.length === 0) {
    return (
      <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-lg p-5 sm:p-6 shadow-subtle">
        <h3 className="font-serif text-lg font-semibold text-ink-950 dark:text-ink-50">
          Syllabus Readiness
        </h3>
        <p className="text-xs text-ink-500 dark:text-ink-400 mt-1 mb-4">
          Break subjects down into syllabus units and mark your confidence level transparently.
        </p>
        <button
          onClick={onAddSubject}
          className="text-xs font-medium text-forest dark:text-emerald-400 hover:underline"
        >
          + Add your first subject to start tracking syllabus readiness &rarr;
        </button>
      </div>
    );
  }

  const now = new Date();

  return (
    <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-lg p-5 sm:p-6 shadow-subtle">
      <div className="flex items-center justify-between pb-3.5 border-b border-paper-200 dark:border-paper-800">
        <div>
          <h3 className="font-serif text-lg font-semibold text-ink-950 dark:text-ink-50">
            Syllabus Readiness Map
          </h3>
          <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">
            Transparent completion based on topics marked "Confident".
          </p>
        </div>
        <button
          onClick={() => onOpenReadinessMap()}
          className="text-xs font-medium text-forest dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
        >
          <span>Open map</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {subjects.map((subj) => {
          const stats = calculateSubjectReadiness(topics, subj.id);
          const daysLeft = differenceInDays(parseISO(subj.examDate), now);

          return (
            <div
              key={subj.id}
              className="p-3.5 rounded-md border border-paper-200 dark:border-paper-800 hover:border-paper-300 dark:hover:border-paper-700 bg-paper-50/50 dark:bg-paper-950/20 transition-all cursor-pointer group"
              onClick={() => onOpenReadinessMap(subj.id)}
            >
              <div className="flex items-baseline justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: subj.color || '#2D5541' }}
                  />
                  <h4 className="text-sm font-semibold text-ink-900 dark:text-ink-100 group-hover:text-forest dark:group-hover:text-emerald-400 transition-colors truncate">
                    {subj.name}
                  </h4>
                  {subj.code && (
                    <span className="text-[11px] font-mono text-ink-500 shrink-0">
                      ({subj.code})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono font-semibold text-ink-900 dark:text-white">
                    {stats.percentage}%
                  </span>
                  <span className="text-[11px] text-ink-400">
                    ({stats.confidentCount}/{stats.totalTopics})
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-paper-200 dark:bg-paper-800 rounded-full h-2 mt-2.5 overflow-hidden flex">
                <div
                  className="h-full bg-forest dark:bg-emerald-500 transition-all duration-500 rounded-full"
                  style={{ width: `${stats.percentage}%` }}
                />
              </div>

              {/* Status details */}
              <div className="mt-2 flex items-center justify-between text-[11px] text-ink-500 dark:text-ink-400">
                <span>
                  {daysLeft >= 0 ? `${daysLeft} days to exam` : 'Exam completed'}
                </span>
                <span>
                  {stats.needsRevisionCount > 0 ? (
                    <span className="text-amber-badge dark:text-amber-400 font-medium">
                      {stats.needsRevisionCount} need revision
                    </span>
                  ) : stats.notStartedCount > 0 ? (
                    <span>{stats.notStartedCount} unstarted</span>
                  ) : (
                    <span className="text-forest dark:text-emerald-400 font-medium">
                      All confident
                    </span>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
