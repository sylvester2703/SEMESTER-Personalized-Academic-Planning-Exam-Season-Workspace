'use client';

import React, { useState } from 'react';
import { usePlanner } from '@/lib/context/planner-context';
import { StudySession } from '@/types';
import { getAvailableFreeIntervals } from '@/lib/scheduling';
import { addDays, format, parseISO } from 'date-fns';
import {
  HeartHandshake,
  X,
  Calendar,
  Split,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface MissedSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: StudySession | null;
}

export function MissedSessionModal({
  isOpen,
  onClose,
  session,
}: MissedSessionModalProps) {
  const { data, rescheduleSession, splitSession, deleteSession, addToast } = usePlanner();

  const [mode, setMode] = useState<'options' | 'reschedule' | 'split'>('options');
  const [targetDate, setTargetDate] = useState<string>(
    format(addDays(new Date(), 1), 'yyyy-MM-dd')
  );
  const [startTime, setStartTime] = useState<string>('17:30');
  const [endTime, setEndTime] = useState<string>('18:30');

  // Split state
  const [splitPart1, setSplitPart1] = useState<number>(30);
  const [splitDate2, setSplitDate2] = useState<string>(
    format(addDays(new Date(), 2), 'yyyy-MM-dd')
  );
  const [splitStart2, setSplitStart2] = useState<string>('17:30');

  if (!isOpen || !session) return null;

  const parentSubject = data.subjects.find((s) => s.id === session.subjectId);
  const totalDuration = session.durationMinutes || 60;

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    rescheduleSession(session.id, targetDate, startTime, endTime);
    onClose();
  };

  const handleSplitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const part2 = Math.max(15, totalDuration - splitPart1);
    const [h, m] = splitStart2.split(':').map(Number);
    const endMins = h * 60 + m + part2;
    const end2 = `${Math.floor(endMins / 60)
      .toString()
      .padStart(2, '0')}:${(endMins % 60).toString().padStart(2, '0')}`;

    splitSession(session.id, splitPart1, part2, splitDate2, splitStart2, end2);
    onClose();
  };

  const handleDismiss = () => {
    deleteSession(session.id);
    addToast({
      type: 'info',
      title: 'Session dismissed',
      description: 'Removed from schedule without penalty.',
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="recovery-modal-title"
    >
      <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-xl max-w-lg w-full p-6 shadow-elevated animate-in zoom-in-95 duration-150 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Close recovery dialog"
          className="absolute top-4 right-4 p-1.5 rounded text-ink-400 hover:text-ink-800 dark:hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold tracking-wider uppercase">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Guilt-Free Recovery</span>
          </div>
        </div>

        <h3 id="recovery-modal-title" className="font-serif text-2xl font-bold text-ink-950 dark:text-ink-50">
          Missed Session Recovery
        </h3>

        <p className="text-xs text-ink-600 dark:text-ink-400 mt-1 mb-4 leading-relaxed">
          Life happens: exams, late lectures, or low energy are completely normal. Let’s adjust the schedule around your real life without guilt or overloading tomorrow.
        </p>

        {/* Missed session summary */}
        <div className="p-3.5 rounded-lg border border-paper-300 dark:border-paper-800 bg-paper-50 dark:bg-paper-850 mb-5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-400 mb-1">
            Missed Session
          </div>
          <div className="font-semibold text-sm text-ink-900 dark:text-ink-100">
            {session.title}
          </div>
          <div className="flex items-center gap-3 text-xs text-ink-500 dark:text-ink-400 mt-1 font-mono">
            <span>{parentSubject?.name || 'Subject'}</span>
            <span>·</span>
            <span>{session.date} ({session.startTime} - {session.endTime})</span>
            <span>·</span>
            <span>{totalDuration} mins</span>
          </div>
        </div>

        {/* MODE: OPTIONS */}
        {mode === 'options' && (
          <div className="space-y-2.5">
            <button
              onClick={() => setMode('reschedule')}
              className="w-full flex items-center justify-between p-3.5 rounded-lg border border-paper-300 dark:border-paper-800 hover:border-forest dark:hover:border-emerald-500 hover:bg-forest/5 text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-forest/10 dark:bg-emerald-950 text-forest dark:text-emerald-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-ink-900 dark:text-ink-100">
                    Reschedule to another day
                  </div>
                  <div className="text-xs text-ink-500 dark:text-ink-400">
                    Pick a convenient open slot in your weekly routine.
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-ink-400 group-hover:text-forest transition-transform group-hover:translate-x-0.5" />
            </button>

            <button
              onClick={() => setMode('split')}
              className="w-full flex items-center justify-between p-3.5 rounded-lg border border-paper-300 dark:border-paper-800 hover:border-forest dark:hover:border-emerald-500 hover:bg-forest/5 text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400">
                  <Split className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-ink-900 dark:text-ink-100">
                    Split into two lighter sessions
                  </div>
                  <div className="text-xs text-ink-500 dark:text-ink-400">
                    Halves the workload so studying feels manageable again.
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-ink-400 group-hover:text-forest transition-transform group-hover:translate-x-0.5" />
            </button>

            <button
              onClick={handleDismiss}
              className="w-full flex items-center justify-between p-3.5 rounded-lg border border-paper-300 dark:border-paper-800 hover:border-ink-400 text-left transition-all text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-paper-200 dark:bg-paper-800 text-ink-500">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Mark as no longer necessary</div>
                  <div className="text-xs text-ink-500">
                    If you already covered this material in class or revision.
                  </div>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* MODE: RESCHEDULE FORM */}
        {mode === 'reschedule' && (
          <form onSubmit={handleRescheduleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-1">
                New Target Date
              </label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 text-ink-900 dark:text-white focus:ring-1 focus:ring-forest"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 text-ink-900 dark:text-white focus:ring-1 focus:ring-forest"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 text-ink-900 dark:text-white focus:ring-1 focus:ring-forest"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-paper-200 dark:border-paper-800">
              <button
                type="button"
                onClick={() => setMode('options')}
                className="px-3 py-1.5 text-xs text-ink-500 hover:text-ink-800"
              >
                Back
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-forest hover:bg-forest-dark text-white text-xs font-semibold shadow-xs"
              >
                Confirm Reschedule
              </button>
            </div>
          </form>
        )}

        {/* MODE: SPLIT FORM */}
        {mode === 'split' && (
          <form onSubmit={handleSplitSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-1">
                Part 1 Duration ({splitPart1} mins on today’s calendar)
              </label>
              <input
                type="range"
                min="15"
                max={Math.max(15, totalDuration - 15)}
                step="5"
                value={splitPart1}
                onChange={(e) => setSplitPart1(Number(e.target.value))}
                className="w-full accent-forest"
              />
              <div className="flex justify-between text-[11px] font-mono text-ink-400 mt-1">
                <span>Part 1: {splitPart1}m</span>
                <span>Part 2: {totalDuration - splitPart1}m</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-1">
                  Part 2 Date
                </label>
                <input
                  type="date"
                  required
                  value={splitDate2}
                  onChange={(e) => setSplitDate2(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 text-ink-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-1">
                  Part 2 Start Time
                </label>
                <input
                  type="time"
                  required
                  value={splitStart2}
                  onChange={(e) => setSplitStart2(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 text-ink-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-paper-200 dark:border-paper-800">
              <button
                type="button"
                onClick={() => setMode('options')}
                className="px-3 py-1.5 text-xs text-ink-500 hover:text-ink-800"
              >
                Back
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-forest hover:bg-forest-dark text-white text-xs font-semibold shadow-xs"
              >
                Split Session
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
