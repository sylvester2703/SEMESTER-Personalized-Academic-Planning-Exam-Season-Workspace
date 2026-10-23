'use client';

import React, { useState, useEffect } from 'react';
import { Subject, CountdownResult } from '@/types';
import { calculateExamCountdown, getLocalTimeZone } from '@/lib/dates';
import { Calendar, Clock, MapPin, Sparkles, AlertCircle } from 'lucide-react';

interface CountdownBannerProps {
  subjects: Subject[];
  onAddSubject?: () => void;
  onViewSubject?: (subjectId: string) => void;
}

export function CountdownBanner({ subjects, onAddSubject, onViewSubject }: CountdownBannerProps) {
  const [countdown, setCountdown] = useState<CountdownResult>(() => calculateExamCountdown(subjects));
  const [localTz, setLocalTz] = useState<string>('Local Time');

  useEffect(() => {
    setLocalTz(getLocalTimeZone());

    // Live tick every second
    const interval = setInterval(() => {
      setCountdown(calculateExamCountdown(subjects));
    }, 1000);

    return () => clearInterval(interval);
  }, [subjects]);

  // Empty state
  if (!countdown.nextExam && !countdown.isPassed) {
    return (
      <div className="bg-paper-50 dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-lg p-6 sm:p-8 text-center shadow-subtle">
        <div className="w-10 h-10 rounded-full bg-forest/10 dark:bg-forest/20 text-forest dark:text-emerald-400 mx-auto flex items-center justify-center mb-3">
          <Calendar className="w-5 h-5" />
        </div>
        <h3 className="font-serif text-xl font-medium text-ink-950 dark:text-ink-50">
          No upcoming exams scheduled
        </h3>
        <p className="text-sm text-ink-600 dark:text-ink-400 max-w-md mx-auto mt-1 mb-5">
          Add your subjects and examination dates to activate the live countdown and generate your study plan.
        </p>
        {onAddSubject && (
          <button
            onClick={onAddSubject}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-forest hover:bg-forest-hover text-white text-xs font-medium shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Add an upcoming exam</span>
          </button>
        )}
      </div>
    );
  }

  // All exams passed
  if (countdown.isPassed) {
    return (
      <div className="bg-sage-light dark:bg-paper-900 border border-sage-border dark:border-forest/30 rounded-lg p-6 text-center">
        <h3 className="font-serif text-2xl font-medium text-forest dark:text-emerald-300">
          All examinations concluded
        </h3>
        <p className="text-sm text-ink-700 dark:text-ink-300 mt-2 max-w-lg mx-auto">
          {countdown.reassuringMessage}
        </p>
      </div>
    );
  }

  const { nextExam, days, hours, minutes, seconds, isToday, formattedTarget, reassuringMessage } = countdown;

  return (
    <section
      aria-label="Upcoming Exam Countdown"
      className="relative overflow-hidden bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-lg shadow-card p-5 sm:p-7 transition-all"
    >
      {/* Decorative top accent rule */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: nextExam?.color || '#2D5541' }}
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Exam Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-forest/10 dark:bg-forest/25 text-forest dark:text-emerald-400">
              Next Examination
            </span>
            {isToday && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-light dark:bg-amber-950/60 text-amber-badge dark:text-amber-300 border border-amber-border dark:border-amber-700/50">
                Today
              </span>
            )}
            <span className="text-xs text-ink-500 dark:text-ink-400">
              {nextExam?.code}
            </span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-ink-950 dark:text-ink-50 tracking-tight leading-snug">
            {nextExam?.name}
          </h2>

          <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 mt-2.5 text-xs text-ink-600 dark:text-ink-300">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-forest dark:text-emerald-400 shrink-0" />
              <span>{formattedTarget}</span>
            </div>
            {nextExam?.examLocation && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-ink-400 shrink-0" />
                <span>{nextExam.examLocation}</span>
              </div>
            )}
            {nextExam?.confidence && (
              <span className="capitalize px-2 py-0.5 rounded text-[10px] bg-paper-200 dark:bg-paper-800 text-ink-700 dark:text-ink-300">
                Confidence: {nextExam.confidence}
              </span>
            )}
          </div>

          <p className="mt-3 text-xs sm:text-sm text-ink-700 dark:text-ink-300 italic font-serif">
            "{reassuringMessage}"
          </p>
        </div>

        {/* Right: Big Tabular Countdown Clock */}
        <div className="flex flex-col items-start lg:items-end shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-paper-200 dark:border-paper-800">
          <span className="text-[11px] font-bold uppercase tracking-widest text-forest dark:text-emerald-400 mb-2 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-forest dark:bg-emerald-400 animate-pulse" />
            <span>Time Left For Exam</span>
          </span>

          <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
            {/* Days */}
            <div className="flex flex-col items-center justify-center bg-paper-50 dark:bg-paper-800/80 border border-paper-300 dark:border-paper-700 rounded-xl px-3.5 py-2.5 sm:px-5 sm:py-3.5 min-w-[64px] sm:min-w-[80px] shadow-2xs">
              <span className="tabular-nums font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-ink-950 dark:text-white leading-none">
                {String(days).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-ink-500 dark:text-ink-400 mt-1.5 font-semibold">
                Days
              </span>
            </div>

            {/* Hours */}
            <div className="flex flex-col items-center justify-center bg-paper-50 dark:bg-paper-800/80 border border-paper-300 dark:border-paper-700 rounded-xl px-3.5 py-2.5 sm:px-5 sm:py-3.5 min-w-[64px] sm:min-w-[80px] shadow-2xs">
              <span className="tabular-nums font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-ink-950 dark:text-white leading-none">
                {String(hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-ink-500 dark:text-ink-400 mt-1.5 font-semibold">
                Hours
              </span>
            </div>

            {/* Minutes */}
            <div className="flex flex-col items-center justify-center bg-paper-50 dark:bg-paper-800/80 border border-paper-300 dark:border-paper-700 rounded-xl px-3.5 py-2.5 sm:px-5 sm:py-3.5 min-w-[64px] sm:min-w-[80px] shadow-2xs">
              <span className="tabular-nums font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-ink-950 dark:text-white leading-none">
                {String(minutes).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-ink-500 dark:text-ink-400 mt-1.5 font-semibold">
                Mins
              </span>
            </div>

            {/* Seconds */}
            <div className="flex flex-col items-center justify-center bg-forest/10 dark:bg-emerald-950/50 border border-forest/30 dark:border-emerald-700/50 rounded-xl px-3.5 py-2.5 sm:px-5 sm:py-3.5 min-w-[64px] sm:min-w-[80px] shadow-2xs">
              <span className="tabular-nums font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-forest dark:text-emerald-400 leading-none">
                {String(seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-forest dark:text-emerald-400 mt-1.5 font-bold">
                Secs
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between w-full text-[11px] text-ink-400 dark:text-ink-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{localTz}</span>
            </span>
            {nextExam?.targetGrade && (
              <span className="font-medium text-forest dark:text-emerald-400">
                Target: {nextExam.targetGrade}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
