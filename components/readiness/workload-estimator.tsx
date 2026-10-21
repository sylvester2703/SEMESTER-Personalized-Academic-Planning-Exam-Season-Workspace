'use client';

import React from 'react';
import { usePlanner } from '@/lib/context/planner-context';
import { calculateWorkloadEstimates } from '@/lib/calculations';
import {
  Scale,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Info,
} from 'lucide-react';

export function WorkloadEstimator() {
  const { data } = usePlanner();

  const estimates = calculateWorkloadEstimates(
    data.subjects,
    data.topics,
    data.profile.preferences?.dailyAvailabilityHours || 3.5,
    new Date()
  );

  if (estimates.length === 0) return null;

  return (
    <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-xl p-5 shadow-card mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-forest dark:text-emerald-400" />
          <h3 className="font-serif text-base font-bold text-ink-950 dark:text-white">
            Syllabus Workload vs. Available Study Time
          </h3>
        </div>
        <span className="text-[11px] font-mono text-ink-500 dark:text-ink-400">
          Based on {data.profile.preferences?.dailyAvailabilityHours || 3.5}h daily study window
        </span>
      </div>

      <p className="text-xs text-ink-500 dark:text-ink-400 mb-4 leading-relaxed">
        Compares remaining syllabus requirements against your realistic available study time before each exam date. Planned hours are guidance estimates, not exam score guarantees.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {estimates.map((est) => {
          const hoursNeeded = (est.estimatedRemainingMinutes / 60).toFixed(1);
          const hoursAvailable = (est.availableStudyMinutesBeforeExam / 60).toFixed(1);

          return (
            <div
              key={est.subjectId}
              className={`p-3.5 rounded-lg border transition-all ${
                est.isFeasible
                  ? 'border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 shadow-2xs'
                  : 'border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: est.color }}
                    />
                    <span className="font-semibold text-xs text-ink-900 dark:text-ink-100">
                      {est.subjectName}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-ink-400 dark:text-ink-500 ml-4">
                    {est.subjectCode || 'No code'} · {est.daysUntilExam} days until exam
                  </span>
                </div>

                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    est.isFeasible
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {est.isFeasible ? 'Realistic Pacing' : 'High Workload'}
                </span>
              </div>

              {/* Progress & metrics */}
              <div className="grid grid-cols-3 gap-2 py-2 border-y border-paper-200 dark:border-paper-800 text-center my-2 text-xs">
                <div>
                  <span className="text-[10px] uppercase text-ink-400 block">Topics Left</span>
                  <span className="font-mono font-bold text-ink-900 dark:text-white">
                    {est.uncompletedTopics} / {est.totalTopics}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-ink-400 block">Est. Needed</span>
                  <span className="font-mono font-bold text-ink-900 dark:text-white">
                    ~{hoursNeeded}h
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-ink-400 block">Available</span>
                  <span className="font-mono font-bold text-forest dark:text-emerald-400">
                    ~{hoursAvailable}h
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-ink-600 dark:text-ink-400 leading-normal flex items-start gap-1.5 mt-2">
                {est.isFeasible ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-forest dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                )}
                <span>{est.guidanceText}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
