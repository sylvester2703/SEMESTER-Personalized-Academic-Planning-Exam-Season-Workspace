'use client';

import React, { useState, useEffect } from 'react';
import { usePlanner } from '@/lib/context/planner-context';
import { StudySession, Subject, Topic } from '@/types';
import { doSessionsOverlap } from '@/lib/scheduling';
import { X, Calendar, Clock, BookOpen, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { TimeInput12H } from '@/components/shared/time-input-12h';

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionToEdit?: StudySession | null;
  initialDate?: string;
  initialSubjectId?: string;
}

export function SessionModal({
  isOpen,
  onClose,
  sessionToEdit,
  initialDate,
  initialSubjectId,
}: SessionModalProps) {
  const { data, addSession, updateSession } = usePlanner();

  const [subjectId, setSubjectId] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('09:30');
  const [endTime, setEndTime] = useState<string>('11:00');
  const [topicId, setTopicId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [completed, setCompleted] = useState<boolean>(false);

  useEffect(() => {
    if (sessionToEdit) {
      setSubjectId(sessionToEdit.subjectId);
      setTitle(sessionToEdit.title);
      setDate(sessionToEdit.date);
      setStartTime(sessionToEdit.startTime);
      setEndTime(sessionToEdit.endTime);
      setTopicId(sessionToEdit.topicId || '');
      setNotes(sessionToEdit.notes || '');
      setCompleted(sessionToEdit.completed);
    } else {
      setSubjectId(initialSubjectId || (data.subjects[0]?.id ?? ''));
      setTitle('');
      setDate(initialDate || format(new Date(), 'yyyy-MM-dd'));
      setStartTime('09:30');
      setEndTime('11:00');
      setTopicId('');
      setNotes('');
      setCompleted(false);
    }
  }, [sessionToEdit, initialDate, initialSubjectId, data.subjects, isOpen]);

  if (!isOpen) return null;

  // Calculate duration in minutes
  const calcDuration = () => {
    try {
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      return Math.max(15, (eh * 60 + em) - (sh * 60 + sm));
    } catch {
      return 60;
    }
  };

  // Real-time conflict check against other sessions
  const hasConflict = data.sessions.some((other) => {
    if (sessionToEdit && other.id === sessionToEdit.id) return false;
    return doSessionsOverlap(date, startTime, endTime, other.date, other.startTime, other.endTime);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subjectId || !date) return;

    const duration = calcDuration();

    if (sessionToEdit) {
      updateSession(sessionToEdit.id, {
        subjectId,
        title: title.trim(),
        date,
        startTime,
        endTime,
        durationMinutes: duration,
        topicId: topicId || undefined,
        notes: notes.trim() || undefined,
        completed,
      });
    } else {
      addSession({
        subjectId,
        title: title.trim(),
        date,
        startTime,
        endTime,
        durationMinutes: duration,
        completed,
        topicId: topicId || undefined,
        notes: notes.trim() || undefined,
      });
    }

    onClose();
  };

  const subjectTopics = data.topics.filter((t) => t.subjectId === subjectId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-xl max-w-md w-full p-6 shadow-elevated animate-in zoom-in-95 duration-150 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded text-ink-400 hover:text-ink-800 dark:hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="font-serif text-xl font-semibold text-ink-950 dark:text-ink-50">
          {sessionToEdit ? 'Edit Study Session' : 'Schedule Study Session'}
        </h3>
        <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5 mb-4">
          Plan a dedicated revision block for your calendar.
        </p>

        {hasConflict && (
          <div className="mb-4 p-2.5 rounded bg-amber-light dark:bg-amber-950/40 border border-amber-border dark:border-amber-700/50 flex items-center gap-2 text-xs text-amber-badge dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Time conflict: Another session is already scheduled in this slot.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Subject */}
          <div>
            <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
              Course Subject *
            </label>
            <select
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value);
                setTopicId('');
              }}
              required
              className="w-full text-xs rounded border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 p-2 text-ink-900 dark:text-ink-100"
            >
              {data.subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code ? `${s.code} — ` : ''}{s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
              Session Title / Revision Goal *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Past paper timed run on Consensus proofs"
              className="w-full text-xs rounded border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 p-2 text-ink-900 dark:text-ink-100"
            />
          </div>

          {/* Date & Times */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full text-xs rounded border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 p-2 text-ink-900 dark:text-ink-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
                Start *
              </label>
              <TimeInput12H
                value={startTime}
                onChange={setStartTime}
                required
                className="w-full justify-between"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
                End *
              </label>
              <TimeInput12H
                value={endTime}
                onChange={setEndTime}
                required
                className="w-full justify-between"
              />
            </div>
          </div>

          {/* Link to Syllabus Topic */}
          {subjectTopics.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
                Associate with Syllabus Topic (optional)
              </label>
              <select
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                className="w-full text-xs rounded border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 p-2 text-ink-900 dark:text-ink-100"
              >
                <option value="">None / Broad course review</option>
                {subjectTopics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.status.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
              Notes (optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Bring formula sheet and practice problem set"
              className="w-full text-xs rounded border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 p-2 text-ink-900 dark:text-ink-100"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-paper-200 dark:border-paper-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-ink-600 dark:text-ink-300 hover:text-ink-950 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-md bg-forest hover:bg-forest-hover text-white text-xs font-medium shadow-sm transition-all"
            >
              {sessionToEdit ? 'Save Changes' : 'Schedule Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
