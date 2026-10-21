'use client';

import React, { useState } from 'react';
import { usePlanner } from '@/lib/context/planner-context';
import { Topic, Subject } from '@/types';
import { addDays, format } from 'date-fns';
import {
  Brain,
  X,
  CheckCircle2,
  Clock,
  Sparkles,
  HelpCircle,
  Calendar,
  ThumbsUp,
  AlertCircle,
} from 'lucide-react';

interface ActiveRecallModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: Topic | null;
  subject?: Subject;
}

export function ActiveRecallModal({
  isOpen,
  onClose,
  topic,
  subject,
}: ActiveRecallModalProps) {
  const { updateTopic, recordFocusSession, addSession, addToast } = usePlanner();

  const [step, setStep] = useState<'prompt' | 'rating' | 'done'>('prompt');
  const [selectedRating, setSelectedRating] = useState<'difficult' | 'okay' | 'easy' | null>(null);

  if (!isOpen || !topic) return null;

  const handleFinishPrompt = () => {
    setStep('rating');
  };

  const handleRate = (rating: 'difficult' | 'okay' | 'easy') => {
    setSelectedRating(rating);

    const now = new Date();
    let daysToAdd = 1;
    let newStatus = topic.status;

    if (rating === 'difficult') {
      daysToAdd = 1;
      newStatus = 'needs_revision';
    } else if (rating === 'okay') {
      daysToAdd = 3;
      newStatus = 'learning';
    } else if (rating === 'easy') {
      daysToAdd = 7;
      newStatus = 'confident';
    }

    const nextReviewDate = format(addDays(now, daysToAdd), 'yyyy-MM-dd');

    // 1. Update topic state
    updateTopic(topic.id, {
      status: newStatus,
      difficultyRating: rating,
      lastStudiedAt: now.toISOString(),
      nextRecallReviewDate: nextReviewDate,
      recallReviewCount: (topic.recallReviewCount || 0) + 1,
    });

    // 2. Log focus record
    recordFocusSession({
      subjectId: topic.subjectId,
      topicId: topic.id,
      durationMinutes: 15,
      mode: 'focus',
      notes: `Active recall test rated ${rating.toUpperCase()}. Next review scheduled for ${nextReviewDate}.`,
    });

    // 3. Offer follow up session
    addSession({
      subjectId: topic.subjectId,
      title: `Spaced Recall: ${topic.title}`,
      date: nextReviewDate,
      startTime: '18:00',
      endTime: '18:25',
      durationMinutes: 25,
      completed: false,
      topicId: topic.id,
      notes: `Rule-based spaced recall interval (${rating} recall difficulty).`,
    });

    addToast({
      type: 'success',
      title: 'Recall session recorded',
      description: `Follow-up review scheduled for ${nextReviewDate}. Topic updated to ${newStatus.replace('_', ' ')}.`,
    });

    setStep('done');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="recall-modal-title"
    >
      <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-xl max-w-lg w-full p-6 shadow-elevated animate-in zoom-in-95 duration-150 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Close recall modal"
          className="absolute top-4 right-4 p-1.5 rounded text-ink-400 hover:text-ink-800 dark:hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 text-amber-800 dark:text-amber-300 text-[11px] font-semibold tracking-wider uppercase">
            <Brain className="w-3.5 h-3.5" />
            <span>Active Recall & Spaced Review</span>
          </div>
        </div>

        <h3 id="recall-modal-title" className="font-serif text-2xl font-bold text-ink-950 dark:text-ink-50">
          Self-Testing Practice
        </h3>
        <p className="text-xs text-ink-500 dark:text-ink-400 mt-1 mb-5">
          Retrieving knowledge from memory without looking at notes is the single most proven study method for long-term exam retention.
        </p>

        {/* STEP 1: PROMPT */}
        {step === 'prompt' && (
          <div className="space-y-4">
            <div className="p-5 rounded-xl border border-paper-300 dark:border-paper-800 bg-paper-50 dark:bg-paper-850 text-center">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">
                {subject?.name || 'Topic for Recall'}
              </span>
              <h4 className="font-serif text-xl font-bold text-ink-950 dark:text-white mt-1 mb-2">
                {topic.title}
              </h4>
              {topic.unitOrModule && (
                <span className="inline-block px-2.5 py-0.5 rounded text-xs bg-paper-200 dark:bg-paper-750 text-ink-700 dark:text-ink-300 font-mono">
                  {topic.unitOrModule}
                </span>
              )}
            </div>

            <div className="p-4 rounded-lg border border-amber-500/20 bg-amber-500/5 text-xs text-ink-700 dark:text-ink-300 leading-relaxed">
              <span className="font-semibold text-amber-900 dark:text-amber-300 block mb-1">
                Instructions for this recall check:
              </span>
              Close your lecture notes, textbook, or IDE. Spend 3 to 5 minutes explaining this concept out loud or jotting down key steps, edge cases, and formulas on blank scratch paper.
            </div>

            <button
              onClick={handleFinishPrompt}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-forest hover:bg-forest-dark text-white text-xs font-semibold shadow-xs transition-all"
            >
              <span>I Have Tested My Memory — Proceed to Rate</span>
            </button>
          </div>
        )}

        {/* STEP 2: RATING */}
        {step === 'rating' && (
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-1">
              How difficult was it to recall this topic?
            </div>

            <button
              onClick={() => handleRate('difficult')}
              className="w-full flex items-start gap-3 p-3.5 rounded-lg border border-red-200 dark:border-red-900/40 hover:bg-red-50/50 dark:hover:bg-red-950/20 text-left transition-all"
            >
              <div className="p-2 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 mt-0.5">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-sm text-ink-900 dark:text-white">
                  Difficult (Struggled or had blanks)
                </div>
                <div className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">
                  Next review scheduled in <strong>1 day</strong>. Topic marked as Needs Revision.
                </div>
              </div>
            </button>

            <button
              onClick={() => handleRate('okay')}
              className="w-full flex items-start gap-3 p-3.5 rounded-lg border border-amber-200 dark:border-amber-900/40 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 text-left transition-all"
            >
              <div className="p-2 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-sm text-ink-900 dark:text-white">
                  Okay (Remembered main concepts with slight effort)
                </div>
                <div className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">
                  Next review scheduled in <strong>3 days</strong>. Topic marked as Learning.
                </div>
              </div>
            </button>

            <button
              onClick={() => handleRate('easy')}
              className="w-full flex items-start gap-3 p-3.5 rounded-lg border border-emerald-200 dark:border-emerald-900/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 text-left transition-all"
            >
              <div className="p-2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 mt-0.5">
                <ThumbsUp className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-sm text-ink-900 dark:text-white">
                  Easy (Fluently recalled definitions and proofs)
                </div>
                <div className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">
                  Next review scheduled in <strong>7 days</strong>. Topic marked as Confident!
                </div>
              </div>
            </button>
          </div>
        )}

        {/* STEP 3: DONE */}
        {step === 'done' && (
          <div className="text-center py-4 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-forest dark:text-emerald-400 mx-auto" />
            <h4 className="font-serif text-lg font-bold text-ink-950 dark:text-white">
              Recall Logged Successfully
            </h4>
            <p className="text-xs text-ink-600 dark:text-ink-400 max-w-sm mx-auto leading-relaxed">
              Your memory retrieval effort has been logged to your focus history, and a follow-up session has been added to your timetable.
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-forest hover:bg-forest-dark text-white text-xs font-semibold shadow-xs"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
