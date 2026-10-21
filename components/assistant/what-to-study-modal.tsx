'use client';

import React from 'react';
import { usePlanner } from '@/lib/context/planner-context';
import { calculateWhatShouldIStudyNow } from '@/lib/recommendations';
import {
  Compass,
  X,
  Clock,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  BookOpen,
  Calendar,
} from 'lucide-react';

interface WhatToStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTopicForFocus?: (subjectId: string, topicId?: string) => void;
}

export function WhatToStudyModal({
  isOpen,
  onClose,
  onSelectTopicForFocus,
}: WhatToStudyModalProps) {
  const { data, setActiveView } = usePlanner();

  if (!isOpen) return null;

  const result = calculateWhatShouldIStudyNow(
    data.subjects,
    data.topics,
    data.sessions,
    data.profile.routineCommitments,
    data.profile.preferences,
    new Date()
  );

  const handleStartSession = (subjectId: string, topicId?: string) => {
    if (onSelectTopicForFocus) {
      onSelectTopicForFocus(subjectId, topicId);
    }
    setActiveView('focus');
    onClose();
  };

  const primary = result.primaryRecommendation;
  const alt = result.alternativeRecommendation;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="what-to-study-title"
    >
      <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-xl max-w-xl w-full p-6 shadow-elevated animate-in zoom-in-95 duration-150 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Close assistant"
          className="absolute top-4 right-4 p-1.5 rounded text-ink-400 hover:text-ink-800 dark:hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-forest/10 dark:bg-emerald-950/40 text-forest dark:text-emerald-300 text-[11px] font-semibold tracking-wider uppercase">
            <Compass className="w-3.5 h-3.5" />
            <span>Real-Time Study Assistant</span>
          </div>
        </div>

        <h3 id="what-to-study-title" className="font-serif text-2xl font-bold text-ink-950 dark:text-ink-50">
          What should I study now?
        </h3>

        {/* Current Available Window */}
        <div className="flex items-center gap-2 text-xs text-ink-600 dark:text-ink-400 mt-1 mb-5">
          <Clock className="w-4 h-4 text-forest dark:text-emerald-400" />
          <span>
            {result.nextCommitmentName
              ? `You have ~${result.availableMinutesNow} minutes available before ${result.nextCommitmentName} at ${result.nextCommitmentTime}.`
              : `You have an open window of ~${result.availableMinutesNow} minutes right now.`}
          </span>
        </div>

        {/* Empty State if no subjects */}
        {!primary && (
          <div className="p-8 text-center bg-white dark:bg-paper-800 rounded-xl border border-paper-300 dark:border-paper-700">
            <BookOpen className="w-8 h-8 text-ink-400 mx-auto mb-2" />
            <h4 className="font-semibold text-sm text-ink-900 dark:text-white mb-1">
              No subjects or syllabus entered
            </h4>
            <p className="text-xs text-ink-500 dark:text-ink-400 mb-4 max-w-sm mx-auto">
              SEMESTER generates recommendations strictly from your real syllabus and exam dates, never guessing. Add your first course to begin.
            </p>
            <button
              onClick={() => {
                setActiveView('exams');
                onClose();
              }}
              className="px-4 py-2 rounded-lg bg-forest text-white text-xs font-semibold hover:bg-forest-dark"
            >
              Add Upcoming Exam
            </button>
          </div>
        )}

        {/* Primary Recommendation */}
        {primary && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-forest/30 bg-forest/5 dark:bg-emerald-950/20 relative">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-forest dark:text-emerald-400">
                  Primary Recommendation
                </span>
                <span className="text-xs font-mono font-semibold text-ink-700 dark:text-ink-300">
                  {primary.durationMinutes} minutes
                </span>
              </div>

              <div className="font-semibold text-base text-ink-950 dark:text-white mb-1">
                {primary.title}
              </div>

              <div className="text-xs font-medium text-forest dark:text-emerald-300 mb-2">
                {primary.subject.name} ({primary.subject.code || 'Course'})
              </div>

              <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed mb-4">
                {primary.explanation}
              </p>

              <button
                onClick={() => handleStartSession(primary.subject.id, primary.topic?.id)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-forest hover:bg-forest-dark text-white text-xs font-semibold shadow-xs transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start {primary.durationMinutes}-Minute Session Now</span>
              </button>
            </div>

            {/* Alternative Recommendation */}
            {alt && (
              <div className="p-4 rounded-xl border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                    Alternative Option
                  </span>
                  <span className="text-xs font-mono text-ink-600 dark:text-ink-400">
                    {alt.durationMinutes} minutes
                  </span>
                </div>

                <div className="font-semibold text-sm text-ink-900 dark:text-ink-100 mb-0.5">
                  {alt.title}
                </div>

                <div className="text-xs text-ink-500 dark:text-ink-400 mb-1.5">
                  {alt.subject.name}
                </div>

                <p className="text-xs text-ink-600 dark:text-ink-400 leading-relaxed mb-3">
                  {alt.explanation}
                </p>

                <button
                  onClick={() => handleStartSession(alt.subject.id, alt.topic?.id)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-paper-300 dark:border-paper-700 hover:border-forest text-ink-800 dark:text-ink-200 text-xs font-medium bg-white dark:bg-paper-800 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Switch to Alternative ({alt.durationMinutes}m)</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 mt-5 border-t border-paper-200 dark:border-paper-800 text-xs text-ink-500 dark:text-ink-400">
          <span>Deterministic recommendation based on exam dates & free time.</span>
          <button
            onClick={() => {
              setActiveView('timetable');
              onClose();
            }}
            className="flex items-center gap-1 font-medium text-forest dark:text-emerald-400 hover:underline"
          >
            <span>View timetable</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
