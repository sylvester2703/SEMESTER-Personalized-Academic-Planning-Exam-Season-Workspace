'use client';

import React, { useState } from 'react';
import { Subject, Topic } from '@/types';
import {
  simulateGradeTarget,
  GRADE_TARGETS,
  TargetGradeLevel,
  GradeSimulationResult,
} from '@/lib/calculations/grade-simulation';
import { Target, TrendingUp, Sparkles, Clock, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

interface GradeSimulatorProps {
  subject: Subject;
  topics: Topic[];
  onStartFocusOnTopic?: (subjectId: string, topicId?: string) => void;
  className?: string;
}

export function GradeSimulator({
  subject,
  topics,
  onStartFocusOnTopic,
  className = '',
}: GradeSimulatorProps) {
  const [selectedTarget, setSelectedTarget] = useState<TargetGradeLevel>('A');

  const simulation: GradeSimulationResult = simulateGradeTarget(
    subject,
    topics,
    selectedTarget
  );

  return (
    <div
      className={`p-5 rounded-2xl border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 shadow-2xs ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-forest/10 dark:bg-emerald-950/70 text-forest dark:text-emerald-400">
              <Target className="w-4 h-4" />
            </span>
            <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-forest dark:text-emerald-400">
              Interactive "What-If" Engine
            </span>
          </div>
          <h3 className="font-serif text-lg font-bold text-ink-950 dark:text-white mt-1">
            Target Grade & Readiness Simulator
          </h3>
          <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">
            Simulate your target examination grade to see the exact daily study hours and highest-impact topics needed to cross the boundary.
          </p>
        </div>

        {/* Current Projected Grade Badge */}
        <div className="text-right shrink-0">
          <span className="text-[10px] uppercase font-semibold text-ink-400 block">Current Status</span>
          <span className="font-serif text-lg font-bold text-ink-900 dark:text-ink-100">
            {simulation.currentProjectedGrade}{' '}
            <span className="text-xs font-mono font-normal text-ink-500">
              ({simulation.currentReadinessPct}%)
            </span>
          </span>
        </div>
      </div>

      {/* Target Grade Selector */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300 mb-2">
          Select Target Grade for {subject.name}:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {GRADE_TARGETS.map((g) => {
            const isSelected = selectedTarget === g.grade;
            return (
              <button
                key={g.grade}
                type="button"
                onClick={() => setSelectedTarget(g.grade)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-forest bg-forest/5 dark:bg-emerald-950/40 text-forest dark:text-emerald-300 ring-1 ring-forest shadow-xs'
                    : 'border-paper-200 dark:border-paper-700 bg-paper-50 dark:bg-paper-900 text-ink-700 dark:text-ink-300 hover:border-paper-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-sm">{g.grade}</span>
                  <span className="text-[10px] font-mono opacity-80">{g.minReadinessPct}%</span>
                </div>
                <div className="text-[10px] text-ink-500 dark:text-ink-400 mt-0.5 line-clamp-1">
                  {g.label.split('(')[1]?.replace(')', '') || g.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Simulation Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-paper-50 dark:bg-paper-900/60 border border-paper-200 dark:border-paper-700 mb-5">
        {/* Metric 1 */}
        <div>
          <span className="text-[10px] uppercase font-semibold text-ink-400 block">Readiness Gap</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-serif font-bold text-ink-950 dark:text-white">
              {simulation.readinessGapPct > 0 ? `+${simulation.readinessGapPct}%` : 'Target Achieved!'}
            </span>
            <span className="text-[11px] font-mono text-ink-500">
              (to {simulation.targetReadinessPct}%)
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div>
          <span className="text-[10px] uppercase font-semibold text-ink-400 block">Required Pace</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-serif font-bold text-forest dark:text-emerald-400">
              {simulation.requiredDailyStudyHours}h / day
            </span>
            <span className="text-[11px] font-mono text-ink-500">
              over {simulation.daysRemaining} days
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div>
          <span className="text-[10px] uppercase font-semibold text-ink-400 block">Feasibility Rating</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={`w-2 h-2 rounded-full ${
                simulation.feasibility === 'comfortable'
                  ? 'bg-emerald-500'
                  : simulation.feasibility === 'intense'
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
            />
            <span
              className={`text-xs font-semibold capitalize ${
                simulation.feasibility === 'comfortable'
                  ? 'text-emerald-700 dark:text-emerald-300'
                  : simulation.feasibility === 'intense'
                  ? 'text-amber-700 dark:text-amber-300'
                  : 'text-rose-700 dark:text-rose-300'
              }`}
            >
              {simulation.feasibility}
            </span>
          </div>
        </div>
      </div>

      {/* Fastest Path to Grade */}
      {simulation.highestLeverageTopics.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-600 dark:text-ink-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Fastest Path to Grade {simulation.targetGrade} (Highest-Leverage Topics)</span>
            </span>
            <span className="text-[11px] text-ink-400">Mastering these creates the highest leap</span>
          </div>

          <div className="space-y-2">
            {simulation.highestLeverageTopics.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl border border-paper-200 dark:border-paper-700 bg-white dark:bg-paper-900 text-xs shadow-2xs hover:border-forest/40 transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink-950 dark:text-white">
                      {item.topic.title}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-forest/10 text-forest dark:text-emerald-300">
                      +{item.impactGainPct}% Readiness
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-500 dark:text-ink-400 mt-0.5">
                    {item.recommendedAction}
                  </p>
                </div>

                {onStartFocusOnTopic && (
                  <button
                    type="button"
                    onClick={() => onStartFocusOnTopic(subject.id, item.topic.id)}
                    className="px-2.5 py-1.5 rounded-lg bg-forest/10 hover:bg-forest hover:text-white text-forest dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white text-[11px] font-semibold flex items-center gap-1 transition-all"
                  >
                    <span>Launch Focus</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
