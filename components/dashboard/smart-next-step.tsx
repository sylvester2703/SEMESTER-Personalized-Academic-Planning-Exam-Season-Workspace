'use client';

import React from 'react';
import { Subject, Topic, StudySession } from '@/types';
import { getSmartNextStep } from '@/lib/recommendations';
import { usePlanner, ActiveView } from '@/lib/context/planner-context';
import { Compass, ArrowRight, HelpCircle, Sparkles } from 'lucide-react';

interface SmartNextStepCardProps {
  subjects: Subject[];
  topics: Topic[];
  sessions: StudySession[];
  onActionClick?: (view: ActiveView, meta?: { subjectId?: string; topicId?: string; sessionId?: string }) => void;
}

export function SmartNextStepCard({
  subjects,
  topics,
  sessions,
  onActionClick,
}: SmartNextStepCardProps) {
  const { setActiveView } = usePlanner();
  const rec = getSmartNextStep(subjects, topics, sessions, new Date());

  const handleAction = () => {
    if (onActionClick) {
      onActionClick(rec.actionView, {
        subjectId: rec.targetSubjectId,
        topicId: rec.targetTopicId,
        sessionId: rec.targetSessionId,
      });
    } else {
      setActiveView(rec.actionView);
    }
  };

  return (
    <div className="bg-paper-50 dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-lg p-5 sm:p-6 shadow-subtle relative overflow-hidden transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-forest/15 dark:bg-forest/30 text-forest dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-forest dark:text-emerald-400">
              Smart Next Step
            </span>
            <span className="ml-2 text-[10px] text-ink-400 dark:text-ink-500 font-mono">
              (Rule-based priority)
            </span>
          </div>
        </div>

        {rec.priority === 'high' && (
          <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded bg-amber-light dark:bg-amber-950/50 text-amber-badge dark:text-amber-300 border border-amber-border/70 dark:border-amber-700/40">
            Recommended Now
          </span>
        )}
      </div>

      <div className="mt-3.5">
        <h3 className="font-serif text-lg sm:text-xl font-semibold text-ink-950 dark:text-ink-50">
          {rec.title}
        </h3>

        <p className="mt-1.5 text-xs sm:text-sm text-ink-600 dark:text-ink-300 leading-relaxed">
          {rec.explanation}
        </p>

        <div className="mt-4 pt-3 border-t border-paper-200 dark:border-paper-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-ink-400 dark:text-ink-500">
            <HelpCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Derived from your active syllabus progress and calendar.</span>
          </div>

          <button
            onClick={handleAction}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-forest hover:bg-forest-hover text-white text-xs font-medium shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-forest"
          >
            <span>{rec.actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
