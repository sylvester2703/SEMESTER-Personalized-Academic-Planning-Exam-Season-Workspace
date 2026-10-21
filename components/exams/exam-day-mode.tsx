'use client';

import React, { useState } from 'react';
import { usePlanner } from '@/lib/context/planner-context';
import { Subject, ExamDayChecklistItem } from '@/types';
import { differenceInDays, differenceInHours, parseISO, format } from 'date-fns';
import {
  Bell,
  Clock,
  MapPin,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Archive,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export function ExamDayMode() {
  const { data, toggleChecklistItem, addChecklistItem, deleteChecklistItem, updateSubject, addToast, setActiveView } = usePlanner();

  const [newItemText, setNewItemText] = useState('');
  const now = new Date();

  // Find if any exam is within 48 hours or today
  const upcomingSoon = data.subjects
    .map((s) => {
      const timeStr = s.examTime || '09:00';
      const [h, m] = timeStr.split(':').map(Number);
      const d = parseISO(s.examDate);
      d.setHours(h, m, 0, 0);
      return {
        subject: s,
        targetDate: d,
        hoursRemaining: Math.round((d.getTime() - now.getTime()) / (1000 * 60 * 60)),
        daysRemaining: differenceInDays(d, now),
      };
    })
    .filter((item) => item.hoursRemaining >= -6 && item.hoursRemaining <= 72)
    .sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime());

  if (upcomingSoon.length === 0) return null;

  const currentFocus = upcomingSoon[0];
  const s = currentFocus.subject;
  const isToday = currentFocus.daysRemaining === 0;
  const isPast = currentFocus.hoursRemaining < 0;

  const checklist = (data.profile.examChecklist || []).filter(
    (item) => item.subjectId === s.id || item.subjectId === 'all'
  );

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    addChecklistItem({
      subjectId: s.id,
      text: newItemText.trim(),
      checked: false,
      category: 'notes',
    });
    setNewItemText('');
  };

  const handleArchive = () => {
    addToast({
      type: 'info',
      title: 'Exam archived',
      description: `${s.name} moved to completed study records. All focus history retained!`,
    });
  };

  return (
    <div className="bg-paper-100/80 dark:bg-paper-850 border border-forest/30 dark:border-emerald-900/50 rounded-xl p-5 mb-6 relative overflow-hidden shadow-card">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-forest dark:bg-emerald-500" />

      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="px-2 py-0.5 rounded bg-forest text-white text-[10px] font-bold tracking-wider uppercase">
            {isToday ? 'EXAM DAY MODE' : 'IMMINENT EXAM PREPARATION'}
          </div>
          <span className="text-xs font-semibold text-forest dark:text-emerald-400">
            {s.name} ({s.code || 'Course'})
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <Clock className="w-3.5 h-3.5 text-forest dark:text-emerald-400" />
          <span className="font-bold text-ink-900 dark:text-white">
            {isPast
              ? 'Exam Concluded'
              : currentFocus.hoursRemaining <= 24
              ? `In ${currentFocus.hoursRemaining} hours`
              : `In ${currentFocus.daysRemaining} days`}
          </span>
        </div>
      </div>

      {/* Details Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 bg-white dark:bg-paper-900 rounded-lg border border-paper-200 dark:border-paper-800 mb-4">
        <div>
          <span className="text-[10px] uppercase font-semibold text-ink-400 block">Date & Time</span>
          <span className="text-xs font-semibold text-ink-900 dark:text-white">
            {format(currentFocus.targetDate, 'EEEE, dd MMM yyyy')} at {s.examTime || '09:00'}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-semibold text-ink-400 block">Venue / Hall</span>
          <span className="text-xs font-semibold text-ink-900 dark:text-white flex items-center gap-1">
            <MapPin className="w-3 h-3 text-forest dark:text-emerald-400" />
            {s.examLocation || 'University Examination Hall'}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-semibold text-ink-400 block">Target Grade</span>
          <span className="text-xs font-semibold text-forest dark:text-emerald-400">
            {s.targetGrade || 'A'} · Calming review only
          </span>
        </div>
      </div>

      {/* Dismissible Checklist */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-ink-700 dark:text-ink-300">
            Exam Day Essentials & Physical Checklist
          </h4>
          <span className="text-[11px] text-ink-400 font-mono">
            {checklist.filter((c) => c.checked).length}/{checklist.length} verified
          </span>
        </div>

        <div className="space-y-1.5 mb-3">
          {checklist.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-2 rounded bg-white/70 dark:bg-paper-900/70 border border-paper-200 dark:border-paper-800 text-xs"
            >
              <button
                onClick={() => toggleChecklistItem(item.id)}
                className="flex items-center gap-2.5 text-left flex-1"
              >
                {item.checked ? (
                  <CheckSquare className="w-4 h-4 text-forest dark:text-emerald-400 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-ink-300 dark:text-ink-600 shrink-0" />
                )}
                <span
                  className={`${
                    item.checked
                      ? 'line-through text-ink-400 dark:text-ink-600'
                      : 'text-ink-800 dark:text-ink-200'
                  }`}
                >
                  {item.text}
                </span>
              </button>
              <button
                onClick={() => deleteChecklistItem(item.id)}
                className="text-ink-400 hover:text-red-500 p-1"
                aria-label="Remove item"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Add custom item */}
        <form onSubmit={handleAddChecklist} className="flex gap-2">
          <input
            type="text"
            placeholder="Add item to remember (e.g. Graphic calculator, student bus pass)..."
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-900 text-ink-900 dark:text-white"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-forest text-white text-xs font-semibold hover:bg-forest-dark"
          >
            Add
          </button>
        </form>
      </div>

      {/* Post-exam Archive Option */}
      {isPast && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-100/60 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs">
          <div>
            <span className="font-semibold text-emerald-900 dark:text-emerald-200 block">
              Exam Complete!
            </span>
            <span className="text-emerald-700 dark:text-emerald-400">
              Would you like to archive this subject while retaining its study history?
            </span>
          </div>
          <button
            onClick={handleArchive}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-forest text-white text-xs font-semibold hover:bg-forest-dark"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Archive Exam</span>
          </button>
        </div>
      )}
    </div>
  );
}
