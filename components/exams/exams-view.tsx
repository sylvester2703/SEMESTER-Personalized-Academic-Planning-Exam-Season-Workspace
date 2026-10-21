'use client';

import React, { useState } from 'react';
import { usePlanner } from '@/lib/context/planner-context';
import { Subject } from '@/types';
import { format, parseISO, differenceInDays } from 'date-fns';
import { calculateSubjectReadiness } from '@/lib/calculations';
import {
  GraduationCap,
  Plus,
  Calendar,
  Clock,
  MapPin,
  Edit2,
  Trash2,
  Target,
  BookOpen,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface ExamsViewProps {
  onOpenNewSubject: () => void;
  onEditSubject: (subject: Subject) => void;
  onOpenNewTopic: (subjectId: string) => void;
}

export function ExamsView({
  onOpenNewSubject,
  onEditSubject,
  onOpenNewTopic,
}: ExamsViewProps) {
  const { data, deleteSubject, setActiveView } = usePlanner();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const now = new Date();

  // Sort subjects by nearest exam date
  const sortedSubjects = [...data.subjects].sort((a, b) => {
    return new Date(a.examDate).getTime() - new Date(b.examDate).getTime();
  });

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-paper-300 dark:border-paper-800">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-ink-950 dark:text-ink-50">
            Exams & Course Modules
          </h2>
          <p className="text-xs text-ink-500 dark:text-ink-400 mt-1">
            Keep track of your critical exam dates, venues, target grades, and syllabus breakdown.
          </p>
        </div>

        <button
          onClick={onOpenNewSubject}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-forest hover:bg-forest-hover text-white text-xs font-medium shadow-subtle transition-all self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Empty State */}
      {sortedSubjects.length === 0 ? (
        <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-lg p-10 text-center shadow-subtle">
          <GraduationCap className="w-10 h-10 text-ink-400 mx-auto mb-3 opacity-60" />
          <h3 className="font-serif text-xl font-medium text-ink-950 dark:text-ink-50">
            No subjects added yet
          </h3>
          <p className="text-xs text-ink-500 dark:text-ink-400 max-w-sm mx-auto mt-1 mb-5">
            Add your semester courses, upcoming examination dates, and syllabus topics to unlock preparation workflows.
          </p>
          <button
            onClick={onOpenNewSubject}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-forest text-white text-xs font-medium shadow-sm hover:bg-forest-hover transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add your first subject</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {sortedSubjects.map((subj) => {
            const readiness = calculateSubjectReadiness(data.topics, subj.id);
            const daysRemaining = differenceInDays(parseISO(subj.examDate), now);
            const isToday = daysRemaining === 0;
            const isPast = daysRemaining < 0;

            const isConfirmingDelete = deleteConfirmId === subj.id;

            return (
              <div
                key={subj.id}
                className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-lg p-5 shadow-subtle flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-card"
              >
                {/* Accent Top Border */}
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: subj.color || '#2D5541' }}
                />

                <div>
                  {/* Top row: Code + Countdown pill */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded text-white"
                      style={{ backgroundColor: subj.color || '#2D5541' }}
                    >
                      {subj.code || 'Course'}
                    </span>

                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        isPast
                          ? 'bg-paper-200 dark:bg-paper-800 text-ink-500'
                          : isToday
                          ? 'bg-amber-light text-amber-badge border border-amber-border'
                          : daysRemaining <= 7
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/60'
                          : 'bg-paper-100 dark:bg-paper-800 text-ink-700 dark:text-ink-300'
                      }`}
                    >
                      {isPast
                        ? 'Exam Concluded'
                        : isToday
                        ? 'Exam is Today!'
                        : `${daysRemaining} days remaining`}
                    </span>
                  </div>

                  {/* Subject Name */}
                  <h3 className="font-serif text-xl font-semibold text-ink-950 dark:text-ink-50 leading-snug">
                    {subj.name}
                  </h3>

                  {/* Exam logistics */}
                  <div className="mt-3 space-y-1.5 text-xs text-ink-600 dark:text-ink-300">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-forest dark:text-emerald-400 shrink-0" />
                      <span>
                        {format(parseISO(subj.examDate), 'EEEE, d MMMM yyyy')}
                        {subj.examTime ? ` at ${subj.examTime}` : ''}
                      </span>
                    </div>

                    {subj.examLocation && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-ink-400 shrink-0" />
                        <span>{subj.examLocation}</span>
                      </div>
                    )}

                    {subj.targetGrade && (
                      <div className="flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-ink-400 shrink-0" />
                        <span>Target Grade: <strong>{subj.targetGrade}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Notes if any */}
                  {subj.notes && (
                    <p className="mt-3 p-2 rounded bg-paper-50 dark:bg-paper-800/60 text-xs text-ink-600 dark:text-ink-300 italic border border-paper-200 dark:border-paper-700">
                      "{subj.notes}"
                    </p>
                  )}

                  {/* Syllabus progress bar */}
                  <div className="mt-4 pt-3 border-t border-paper-200 dark:border-paper-800">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-ink-600 dark:text-ink-400">
                        Readiness: <strong>{readiness.percentage}%</strong>
                      </span>
                      <span className="text-ink-500 font-mono text-[11px]">
                        {readiness.confidentCount}/{readiness.totalTopics} confident
                      </span>
                    </div>
                    <div className="w-full bg-paper-200 dark:bg-paper-800 h-2 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-forest dark:bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${readiness.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-5 pt-3 border-t border-paper-200 dark:border-paper-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenNewTopic(subj.id)}
                      className="text-xs text-forest dark:text-emerald-400 font-medium hover:underline inline-flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add topic</span>
                    </button>
                    <span className="text-paper-300 dark:text-paper-700">•</span>
                    <button
                      onClick={() => setActiveView('readiness')}
                      className="text-xs text-ink-600 dark:text-ink-400 hover:text-ink-950 dark:hover:text-ink-100"
                    >
                      View syllabus
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onEditSubject(subj)}
                      className="p-1.5 text-ink-500 hover:text-ink-900 dark:hover:text-white rounded hover:bg-paper-100 dark:hover:bg-paper-800 transition-colors"
                      title="Edit subject"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {isConfirmingDelete ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            deleteSubject(subj.id);
                            setDeleteConfirmId(null);
                          }}
                          className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-medium"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-1.5 py-0.5 text-ink-400 hover:text-ink-700 text-[10px]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(subj.id)}
                        className="p-1.5 text-ink-500 hover:text-rose-600 rounded hover:bg-paper-100 dark:hover:bg-paper-800 transition-colors"
                        title="Delete subject"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
