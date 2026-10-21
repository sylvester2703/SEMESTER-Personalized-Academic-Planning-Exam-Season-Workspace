'use client';

import React, { useState } from 'react';
import { usePlanner } from '@/lib/context/planner-context';
import { generateSuggestedWeeklyPlan } from '@/lib/scheduling';
import { StudySession } from '@/types';
import { Sparkles, X, Check, Calendar, AlertCircle } from 'lucide-react';

interface SuggestPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SuggestPlanModal({ isOpen, onClose }: SuggestPlanModalProps) {
  const { data, applySuggestedPlan, addSession, addToast } = usePlanner();

  const [replaceExisting, setReplaceExisting] = useState<boolean>(false);
  const [dailyHours, setDailyHours] = useState<number>(data.profile.dailyAvailabilityHours || 3);
  const [daysCount, setDaysCount] = useState<number>(7);

  if (!isOpen) return null;

  const preview = generateSuggestedWeeklyPlan(
    data.subjects,
    data.topics,
    dailyHours,
    new Date(),
    daysCount
  );

  const handleApply = () => {
    applySuggestedPlan({ replaceExisting });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-xl max-w-lg w-full p-6 shadow-elevated animate-in zoom-in-95 duration-150 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded text-ink-400 hover:text-ink-800 dark:hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-forest dark:text-emerald-400" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-forest dark:text-emerald-400">
            Rule-Based Assistant
          </span>
        </div>

        <h3 className="font-serif text-xl font-semibold text-ink-950 dark:text-ink-50">
          Generate Realistic Study Plan
        </h3>
        <p className="text-xs text-ink-500 dark:text-ink-400 mt-1 mb-4 leading-relaxed">
          Distributes revision blocks across the next {daysCount} days based on nearest examinations, unconfident topics, and your daily study availability.
        </p>

        {/* Configuration inputs */}
        <div className="p-3.5 rounded-lg bg-paper-50 dark:bg-paper-800 border border-paper-200 dark:border-paper-700 space-y-3 mb-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-ink-700 dark:text-ink-300 mb-1">
                Daily Study Hours ({dailyHours}h)
              </label>
              <input
                type="range"
                min={1}
                max={6}
                step={0.5}
                value={dailyHours}
                onChange={(e) => setDailyHours(Number(e.target.value))}
                className="w-full accent-forest"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-ink-700 dark:text-ink-300 mb-1">
                Horizon Length
              </label>
              <select
                value={daysCount}
                onChange={(e) => setDaysCount(Number(e.target.value))}
                className="w-full text-xs rounded border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-900 p-1.5 text-ink-900 dark:text-ink-100"
              >
                <option value={3}>Next 3 days</option>
                <option value={7}>Next 7 days (1 week)</option>
                <option value={14}>Next 14 days (2 weeks)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-paper-200 dark:border-paper-700">
            <input
              type="checkbox"
              id="replaceCheck"
              checked={replaceExisting}
              onChange={(e) => setReplaceExisting(e.target.checked)}
              className="rounded text-forest accent-forest"
            />
            <label htmlFor="replaceCheck" className="text-xs text-ink-700 dark:text-ink-300">
              Replace existing timetable sessions for this period (instead of appending)
            </label>
          </div>
        </div>

        {/* Plan Preview */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-ink-800 dark:text-ink-200 mb-2">
            <span>Generated Schedule ({preview.length} sessions)</span>
            <span className="text-[11px] font-normal text-ink-500">
              ~{preview.length * 1.5} total study hours
            </span>
          </div>

          <div className="max-h-56 overflow-y-auto space-y-2 pr-1 border border-paper-200 dark:border-paper-800 rounded-lg p-2.5 divide-y divide-paper-100 dark:divide-paper-800">
            {preview.map((sess, idx) => {
              const subj = data.subjects.find((s) => s.id === sess.subjectId);
              return (
                <div key={idx} className="pt-2 first:pt-0 text-xs flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 font-mono text-[10px] text-ink-400">
                      <span>{sess.date}</span>
                      <span>•</span>
                      <span>{sess.startTime}–{sess.endTime}</span>
                      {subj && (
                        <span
                          className="px-1 py-0.2 rounded text-[9px] text-white"
                          style={{ backgroundColor: subj.color }}
                        >
                          {subj.code || subj.name}
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-ink-900 dark:text-ink-100 mt-0.5">
                      {sess.title}
                    </p>
                  </div>
                  <span className="text-[10px] text-ink-500 font-mono shrink-0">
                    {sess.durationMinutes}m
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-[11px] text-ink-500 italic mt-3">
          *SEMESTER uses transparent, explainable heuristic rules without external AI dependencies.
        </p>

        {/* Footer actions */}
        <div className="pt-4 mt-4 flex items-center justify-end gap-2 border-t border-paper-200 dark:border-paper-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs text-ink-600 dark:text-ink-300 hover:text-ink-950 dark:hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-forest hover:bg-forest-hover text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply to Timetable</span>
          </button>
        </div>
      </div>
    </div>
  );
}
