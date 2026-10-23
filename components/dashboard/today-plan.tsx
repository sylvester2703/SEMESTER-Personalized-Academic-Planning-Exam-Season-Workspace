'use client';

import React from 'react';
import { StudySession, Subject } from '@/types';
import { format } from 'date-fns';
import { formatTimeRange } from '@/lib/dates';
import { CheckCircle2, Circle, Clock, Play, Plus, BookOpen, AlertCircle, HeartHandshake } from 'lucide-react';

interface TodayPlanProps {
  sessions: StudySession[];
  subjects: Subject[];
  onToggleComplete: (sessionId: string) => void;
  onStartFocus: (sessionId: string, subjectId: string) => void;
  onAddSession: () => void;
  onViewTimetable: () => void;
  onRecoverMissedSession?: (session: StudySession) => void;
}

export function TodayPlan({
  sessions,
  subjects,
  onToggleComplete,
  onStartFocus,
  onAddSession,
  onViewTimetable,
  onRecoverMissedSession,
}: TodayPlanProps) {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todaySessions = sessions
    .filter((s) => s.date === todayStr)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const completedCount = todaySessions.filter((s) => s.completed).length;
  const totalMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  return (
    <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-lg p-5 sm:p-6 shadow-subtle">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-paper-200 dark:border-paper-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-lg font-semibold text-ink-950 dark:text-ink-50">
              Today's Study Plan
            </h3>
            {todaySessions.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-paper-100 dark:bg-paper-800 text-ink-600 dark:text-ink-300 font-mono">
                {completedCount}/{todaySessions.length} done
              </span>
            )}
          </div>
          <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">
            {format(new Date(), 'EEEE, d MMMM yyyy')} • {totalMinutes > 0 ? `${Math.round(totalMinutes / 60 * 10) / 10}h planned` : '0h planned'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAddSession}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-forest dark:text-emerald-400 bg-forest/10 hover:bg-forest/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add session</span>
          </button>
        </div>
      </div>

      {/* Session List */}
      <div className="mt-4">
        {todaySessions.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-paper-300 dark:border-paper-800 rounded-md">
            <BookOpen className="w-6 h-6 text-ink-400 mx-auto mb-2 opacity-60" />
            <p className="text-sm font-medium text-ink-700 dark:text-ink-300">
              No sessions scheduled for today
            </p>
            <p className="text-xs text-ink-500 dark:text-ink-400 max-w-xs mx-auto mt-1 mb-3">
              Maintain steady momentum by planning a 45-minute revision block or rest intentionally.
            </p>
            <button
              onClick={onAddSession}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-forest text-white text-xs font-medium shadow-sm hover:bg-forest-hover transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule today's session</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {todaySessions.map((sess) => {
              const subj = subjects.find((s) => s.id === sess.subjectId);

              return (
                <div
                  key={sess.id}
                  className={`group flex items-start justify-between gap-3 p-3.5 rounded-lg border transition-all shadow-2xs ${
                    sess.completed
                      ? 'bg-paper-100/60 dark:bg-paper-950/60 border-paper-200 dark:border-paper-800/80 opacity-75'
                      : 'bg-white dark:bg-paper-800 border-paper-300 dark:border-paper-700 hover:border-forest/50 dark:hover:border-emerald-600/70'
                  }`}
                >
                  {/* Left: Complete toggle */}
                  <button
                    onClick={() => onToggleComplete(sess.id)}
                    className="mt-0.5 text-ink-400 hover:text-forest dark:hover:text-emerald-400 transition-colors shrink-0"
                    aria-label={sess.completed ? `Mark ${sess.title} as incomplete` : `Mark ${sess.title} as completed`}
                  >
                    {sess.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-forest dark:text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 hover:scale-105 transition-transform" />
                    )}
                  </button>

                  {/* Middle: Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded text-white shadow-2xs"
                        style={{ backgroundColor: subj?.color || '#2D5541' }}
                      >
                        {subj?.code || subj?.name || 'Study'}
                      </span>
                      <span className="text-xs text-ink-600 dark:text-ink-300 font-mono font-medium">
                        {formatTimeRange(sess.startTime, sess.endTime)} ({sess.durationMinutes}m)
                      </span>
                    </div>

                    <h4
                      className={`text-sm font-semibold mt-1 leading-snug ${
                        sess.completed
                          ? 'line-through text-ink-500 dark:text-ink-400'
                          : 'text-ink-950 dark:text-white'
                      }`}
                    >
                      {sess.title}
                    </h4>

                    {sess.notes && (
                      <p className="text-xs text-ink-600 dark:text-ink-300 mt-1 line-clamp-1 italic">
                        {sess.notes}
                      </p>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 self-center">
                    {!sess.completed && onRecoverMissedSession && (
                      <button
                        onClick={() => onRecoverMissedSession(sess)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-ink-500 hover:text-ink-900 dark:hover:text-white hover:bg-paper-200 dark:hover:bg-paper-800 text-xs transition-colors"
                        title="Reschedule or split this session without guilt"
                      >
                        <HeartHandshake className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        <span className="hidden sm:inline">Adjust</span>
                      </button>
                    )}

                    {!sess.completed && (
                      <button
                        onClick={() => onStartFocus(sess.id, sess.subjectId)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-forest/10 hover:bg-forest/20 text-forest dark:text-emerald-400 text-xs font-medium transition-colors"
                        title="Open in Focus Mode timer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span className="hidden sm:inline">Focus</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-3.5 pt-3 border-t border-paper-200 dark:border-paper-800 flex justify-end">
          <button
            onClick={onViewTimetable}
            className="text-xs text-forest dark:text-emerald-400 font-medium hover:underline inline-flex items-center gap-1"
          >
            <span>View full week timetable</span>
            <span>&rarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
}
