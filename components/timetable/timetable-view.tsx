'use client';

import React, { useState } from 'react';
import { usePlanner } from '@/lib/context/planner-context';
import { StudySession, Subject } from '@/types';
import {
  format,
  addWeeks,
  subWeeks,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  parseISO,
  addDays,
} from 'date-fns';
import { detectSessionConflicts } from '@/lib/scheduling';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Play,
  Edit2,
  Trash2,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface TimetableViewProps {
  onOpenNewSession: (initialDate?: string) => void;
  onEditSession: (session: StudySession) => void;
  onOpenSuggestPlan: () => void;
}

export function TimetableView({
  onOpenNewSession,
  onEditSession,
  onOpenSuggestPlan,
}: TimetableViewProps) {
  const {
    data,
    toggleSessionComplete,
    deleteSession,
    setActiveView,
  } = usePlanner();

  const [currentWeekReference, setCurrentWeekReference] = useState<Date>(new Date());
  const [selectedMobileDay, setSelectedMobileDay] = useState<Date>(new Date());
  const [filterSubjectId, setFilterSubjectId] = useState<string>('all');

  const weekStart = startOfWeek(currentWeekReference, { weekStartsOn: 1 }); // Monday start
  const weekEnd = endOfWeek(currentWeekReference, { weekStartsOn: 1 }); // Sunday
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Conflict detection
  const conflictMap = detectSessionConflicts(data.sessions);

  // Filtered sessions
  const filteredSessions = filterSubjectId === 'all'
    ? data.sessions
    : data.sessions.filter((s) => s.subjectId === filterSubjectId);

  const prevWeek = () => setCurrentWeekReference((d) => subWeeks(d, 1));
  const nextWeek = () => setCurrentWeekReference((d) => addWeeks(d, 1));
  const resetToToday = () => {
    const today = new Date();
    setCurrentWeekReference(today);
    setSelectedMobileDay(today);
  };

  const isCurrentWeek = isSameDay(startOfWeek(new Date(), { weekStartsOn: 1 }), weekStart);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-paper-300 dark:border-paper-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl font-semibold text-ink-950 dark:text-ink-50">
              Timetable & Study Sessions
            </h2>
            {isCurrentWeek && (
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-forest/10 dark:bg-forest/25 text-forest dark:text-emerald-400">
                Current Week
              </span>
            )}
          </div>
          <p className="text-xs text-ink-500 dark:text-ink-400 mt-1">
            {format(weekStart, 'd MMMM')} – {format(weekEnd, 'd MMMM yyyy')}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Subject Filter */}
          <select
            value={filterSubjectId}
            onChange={(e) => setFilterSubjectId(e.target.value)}
            className="text-xs rounded-md border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-900 text-ink-800 dark:text-ink-200 px-2.5 py-1.5 focus-visible:ring-1 focus-visible:ring-forest"
            aria-label="Filter sessions by subject"
          >
            <option value="all">All Subjects</option>
            {data.subjects.map((subj) => (
              <option key={subj.id} value={subj.id}>
                {subj.code ? `${subj.code} — ` : ''}{subj.name}
              </option>
            ))}
          </select>

          {/* Week navigation buttons */}
          <div className="flex items-center bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-700 rounded-md p-0.5">
            <button
              onClick={prevWeek}
              className="p-1.5 text-ink-600 hover:text-ink-950 dark:text-ink-400 dark:hover:text-white rounded hover:bg-paper-100 dark:hover:bg-paper-800 transition-colors"
              aria-label="Previous week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={resetToToday}
              className="px-2.5 py-1 text-xs font-medium text-ink-700 dark:text-ink-300 hover:text-forest dark:hover:text-emerald-400"
            >
              Today
            </button>
            <button
              onClick={nextWeek}
              className="p-1.5 text-ink-600 hover:text-ink-950 dark:text-ink-400 dark:hover:text-white rounded hover:bg-paper-100 dark:hover:bg-paper-800 transition-colors"
              aria-label="Next week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onOpenSuggestPlan}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-forest/30 dark:border-forest/50 bg-forest/5 hover:bg-forest/10 text-forest dark:text-emerald-400 text-xs font-medium transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate plan</span>
          </button>

          <button
            onClick={() => onOpenNewSession(format(new Date(), 'yyyy-MM-dd'))}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-forest hover:bg-forest-hover text-white text-xs font-medium shadow-subtle transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Session</span>
          </button>
        </div>
      </div>

      {/* Mobile Day Selector Bar (< 768px) */}
      <div className="md:hidden flex items-center justify-between gap-1 overflow-x-auto pb-2 border-b border-paper-200 dark:border-paper-800">
        {daysInWeek.map((day) => {
          const isSelected = isSameDay(day, selectedMobileDay);
          const isToday = isSameDay(day, new Date());
          const dateStr = format(day, 'yyyy-MM-dd');
          const daySessions = filteredSessions.filter((s) => s.date === dateStr);

          return (
            <button
              key={dateStr}
              onClick={() => setSelectedMobileDay(day)}
              className={`flex-1 min-w-[42px] py-2 px-1 rounded flex flex-col items-center transition-all text-center ${
                isSelected
                  ? 'bg-forest text-white font-semibold shadow-sm'
                  : isToday
                  ? 'bg-paper-200 dark:bg-paper-800 text-forest dark:text-emerald-400'
                  : 'text-ink-600 dark:text-ink-400 hover:bg-paper-100 dark:hover:bg-paper-900'
              }`}
            >
              <span className="text-[10px] uppercase">{format(day, 'EEE')}</span>
              <span className="text-sm font-serif tabular-nums">{format(day, 'd')}</span>
              {daySessions.length > 0 && (
                <span
                  className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                    isSelected ? 'bg-white' : 'bg-forest dark:bg-emerald-400'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Mobile Single Day View */}
      <div className="md:hidden space-y-3">
        <div className="flex items-center justify-between text-xs text-ink-500">
          <span>{format(selectedMobileDay, 'EEEE, d MMMM yyyy')}</span>
          <button
            onClick={() => onOpenNewSession(format(selectedMobileDay, 'yyyy-MM-dd'))}
            className="text-forest dark:text-emerald-400 font-medium"
          >
            + Add session to this day
          </button>
        </div>

        {(() => {
          const mobileDateStr = format(selectedMobileDay, 'yyyy-MM-dd');
          const daySessions = filteredSessions
            .filter((s) => s.date === mobileDateStr)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          if (daySessions.length === 0) {
            return (
              <div className="py-10 text-center bg-white dark:bg-paper-900 rounded-lg border border-paper-300 dark:border-paper-800">
                <p className="text-xs text-ink-500 dark:text-ink-400">
                  No revision sessions scheduled for {format(selectedMobileDay, 'EEE, d MMM')}.
                </p>
                <button
                  onClick={() => onOpenNewSession(mobileDateStr)}
                  className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-forest text-white"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add session</span>
                </button>
              </div>
            );
          }

          return (
            <div className="space-y-2.5">
              {daySessions.map((sess) => (
                <SessionCard
                  key={sess.id}
                  session={sess}
                  subjects={data.subjects}
                  hasConflict={Boolean(conflictMap.get(sess.id)?.length)}
                  onToggleComplete={() => toggleSessionComplete(sess.id)}
                  onEdit={() => onEditSession(sess)}
                  onDelete={() => deleteSession(sess.id)}
                  onStartFocus={() => setActiveView('focus')}
                />
              ))}
            </div>
          );
        })()}
      </div>

      {/* Desktop Week Grid View (>= 768px) */}
      <div className="hidden md:grid md:grid-cols-7 gap-3">
        {daysInWeek.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isToday = isSameDay(day, new Date());
          const daySessions = filteredSessions
            .filter((s) => s.date === dateStr)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          const totalMins = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

          return (
            <div
              key={dateStr}
              className={`flex flex-col min-h-[480px] rounded-lg border transition-all ${
                isToday
                  ? 'bg-paper-50 dark:bg-paper-900/90 border-forest/40 dark:border-emerald-500/40 shadow-subtle'
                  : 'bg-white dark:bg-paper-900 border-paper-300 dark:border-paper-800'
              }`}
            >
              {/* Day column header */}
              <div
                className={`p-3 border-b flex items-baseline justify-between ${
                  isToday
                    ? 'border-forest/20 dark:border-emerald-500/20 bg-forest/5 dark:bg-forest/15'
                    : 'border-paper-200 dark:border-paper-800'
                }`}
              >
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-ink-500 dark:text-ink-400">
                    {format(day, 'EEE')}
                  </p>
                  <p
                    className={`font-serif text-lg font-bold leading-tight ${
                      isToday
                        ? 'text-forest dark:text-emerald-400'
                        : 'text-ink-950 dark:text-ink-50'
                    }`}
                  >
                    {format(day, 'd')}
                  </p>
                </div>
                {totalMins > 0 && (
                  <span className="text-[10px] font-mono text-ink-400">
                    {Math.round(totalMins / 60 * 10) / 10}h
                  </span>
                )}
              </div>

              {/* Sessions container */}
              <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[620px]">
                {daySessions.map((sess) => (
                  <SessionCard
                    key={sess.id}
                    session={sess}
                    subjects={data.subjects}
                    hasConflict={Boolean(conflictMap.get(sess.id)?.length)}
                    onToggleComplete={() => toggleSessionComplete(sess.id)}
                    onEdit={() => onEditSession(sess)}
                    onDelete={() => deleteSession(sess.id)}
                    onStartFocus={() => setActiveView('focus')}
                  />
                ))}

                {daySessions.length === 0 && (
                  <div className="h-24 flex items-center justify-center text-center">
                    <button
                      onClick={() => onOpenNewSession(dateStr)}
                      className="text-[11px] text-ink-400 hover:text-forest dark:hover:text-emerald-400 py-1 px-2 rounded hover:bg-paper-100 dark:hover:bg-paper-800 transition-colors"
                    >
                      + Add session
                    </button>
                  </div>
                )}
              </div>

              {/* Footer quick add */}
              <div className="p-2 border-t border-paper-200 dark:border-paper-800/60 mt-auto">
                <button
                  onClick={() => onOpenNewSession(dateStr)}
                  className="w-full py-1 text-center text-[11px] text-ink-500 hover:text-ink-900 dark:hover:text-white rounded hover:bg-paper-100 dark:hover:bg-paper-800 transition-colors"
                >
                  + Add
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface SessionCardProps {
  session: StudySession;
  subjects: Subject[];
  hasConflict: boolean;
  onToggleComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStartFocus: () => void;
}

function SessionCard({
  session,
  subjects,
  hasConflict,
  onToggleComplete,
  onEdit,
  onDelete,
  onStartFocus,
}: SessionCardProps) {
  const subj = subjects.find((s) => s.id === session.subjectId);

  return (
    <div
      className={`group relative rounded-md p-2.5 border transition-all text-left ${
        hasConflict
          ? 'border-amber-warm dark:border-amber-500 bg-amber-light/30 dark:bg-amber-950/20'
          : session.completed
          ? 'bg-paper-100/60 dark:bg-paper-950/40 border-paper-200 dark:border-paper-800/80 opacity-70'
          : 'bg-paper-50 dark:bg-paper-800 border-paper-200 dark:border-paper-700 hover:border-forest/50'
      }`}
    >
      {/* Conflict banner */}
      {hasConflict && (
        <div className="flex items-center gap-1 text-[10px] text-amber-badge dark:text-amber-300 font-semibold mb-1">
          <AlertTriangle className="w-3 h-3 shrink-0" />
          <span>Schedule overlap</span>
        </div>
      )}

      {/* Subject pill & time */}
      <div className="flex items-center justify-between gap-1 mb-1">
        <span
          className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded text-white truncate max-w-[110px]"
          style={{ backgroundColor: subj?.color || '#2D5541' }}
          title={subj?.name}
        >
          {subj?.code || subj?.name || 'Study'}
        </span>
        <span className="text-[10px] text-ink-500 dark:text-ink-400 font-mono">
          {session.startTime}
        </span>
      </div>

      {/* Title */}
      <h4
        className={`text-xs font-medium leading-snug line-clamp-2 ${
          session.completed
            ? 'line-through text-ink-500 dark:text-ink-400'
            : 'text-ink-900 dark:text-ink-50'
        }`}
      >
        {session.title}
      </h4>

      {/* Meta: duration */}
      <div className="mt-1.5 flex items-center justify-between text-[10px] text-ink-400">
        <span className="flex items-center gap-0.5">
          <Clock className="w-2.5 h-2.5" />
          <span>{session.durationMinutes}m</span>
        </span>

        {/* Hover / tap actions */}
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onToggleComplete}
            className="p-0.5 text-ink-400 hover:text-forest dark:hover:text-emerald-400 rounded"
            title={session.completed ? 'Mark incomplete' : 'Mark completed'}
          >
            {session.completed ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-forest dark:text-emerald-400" />
            ) : (
              <Circle className="w-3.5 h-3.5" />
            )}
          </button>
          {!session.completed && (
            <button
              onClick={onStartFocus}
              className="p-0.5 text-ink-400 hover:text-forest dark:hover:text-emerald-400 rounded"
              title="Launch focus timer"
            >
              <Play className="w-3 h-3 fill-current" />
            </button>
          )}
          <button
            onClick={onEdit}
            className="p-0.5 text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 rounded"
            title="Edit session"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={onDelete}
            className="p-0.5 text-ink-400 hover:text-rose-600 rounded"
            title="Delete session"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
