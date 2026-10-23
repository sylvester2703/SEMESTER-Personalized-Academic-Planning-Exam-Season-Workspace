'use client';

import React, { useState } from 'react';
import { usePlanner } from '@/lib/context/planner-context';
import { Subject, Topic } from '@/types';
import { generateExamTriagePlan, ExamTriagePlan } from '@/lib/scheduling/triage';
import {
  Flame,
  X,
  AlertTriangle,
  Clock,
  Moon,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface ExamTriageModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSubjectId?: string;
}

export function ExamTriageModal({
  isOpen,
  onClose,
  initialSubjectId,
}: ExamTriageModalProps) {
  const { data, addSession, addToast } = usePlanner();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    initialSubjectId || (data.subjects.length > 0 ? data.subjects[0].id : '')
  );

  if (!isOpen) return null;

  const currentSubject =
    data.subjects.find((s) => s.id === selectedSubjectId) || data.subjects[0];

  if (!currentSubject) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
        <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-700 rounded-2xl max-w-md w-full p-6 text-center">
          <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h3 className="text-lg font-serif font-bold text-ink-950 dark:text-white">
            No Subjects Found
          </h3>
          <p className="text-xs text-ink-500 dark:text-ink-400 mt-2 mb-4">
            Add at least one course with an exam date to launch Exam Triage Mode.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-forest text-white rounded-lg text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const triagePlan: ExamTriagePlan = generateExamTriagePlan(
    currentSubject,
    data.topics
  );

  const handleApplyToTimetable = () => {
    let count = 0;
    triagePlan.schedule.forEach((block) => {
      if (block.type === 'study') {
        addSession({
          subjectId: currentSubject.id,
          title: block.title,
          date: block.date,
          startTime: block.startTime, // 12h
          endTime: block.endTime,     // 12h
          durationMinutes: block.durationMinutes,
          completed: false,
        });
        count++;
      }
    });

    addToast({
      type: 'success',
      title: 'Triage plan added to timetable',
      description: `Added ${count} high-yield cram revision blocks with sleep protection.`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-700 rounded-2xl max-w-3xl w-full p-6 my-8 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-ink-400 hover:text-ink-900 dark:hover:text-white p-1 rounded-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3.5 mb-6">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Flame className="w-6 h-6 fill-current animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                Panic Button · Exam Triage
              </span>
              <span className="text-xs text-ink-400 font-mono">
                {triagePlan.hoursUntilExam}h until exam hall doors open
              </span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-ink-950 dark:text-ink-50 mt-1">
              48-Hour High-Yield Emergency Survival Plan
            </h3>
            <p className="text-xs text-ink-600 dark:text-ink-400 mt-0.5">
              Cut out low-yield fluff, focus 100% on high-scoring topics, and protect 6 hours of sleep to avoid exam-room mental paralysis.
            </p>
          </div>
        </div>

        {/* Course Selector */}
        <div className="mb-5 flex items-center gap-3">
          <label className="text-xs font-semibold text-ink-700 dark:text-ink-300">
            Target Course:
          </label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 text-ink-900 dark:text-white"
          >
            {data.subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code || 'Course'}) · Exam {s.examDate}
              </option>
            ))}
          </select>
        </div>

        {/* Key Metrics Strip */}
        <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-paper-50 dark:bg-paper-800/60 border border-paper-200 dark:border-paper-700 mb-6">
          <div className="text-center">
            <span className="text-[10px] uppercase font-semibold text-ink-400 block">Time Left</span>
            <span className="text-lg font-serif font-bold text-rose-600 dark:text-rose-400">
              {triagePlan.hoursUntilExam} Hours
            </span>
          </div>
          <div className="text-center border-x border-paper-200 dark:border-paper-700">
            <span className="text-[10px] uppercase font-semibold text-ink-400 block">Cram Study Budget</span>
            <span className="text-lg font-serif font-bold text-forest dark:text-emerald-400">
              {triagePlan.totalCramStudyHours}h Focused
            </span>
          </div>
          <div className="text-center">
            <span className="text-[10px] uppercase font-semibold text-ink-400 block">Protected Sleep</span>
            <span className="text-lg font-serif font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-1">
              <Moon className="w-4 h-4" />
              <span>{triagePlan.guaranteedSleepHours}h Minimum</span>
            </span>
          </div>
        </div>

        {/* Yield Matrix */}
        <div className="space-y-4 mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
            Syllabus Triage Yield Matrix
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Critical */}
            <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Tier 1: High Yield ({triagePlan.classifiedTopics.critical.length})</span>
                </span>
              </div>
              <p className="text-[11px] text-rose-600 dark:text-rose-300/80 mb-2.5">
                Maximum marks return. Non-negotiable core concepts.
              </p>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {triagePlan.classifiedTopics.critical.map((c, i) => (
                  <div key={i} className="text-xs p-1.5 rounded bg-white dark:bg-paper-900 border border-rose-200/60 dark:border-rose-800/40 font-medium text-ink-900 dark:text-ink-100">
                    {c.topic.title} ({c.recommendedMinutes}m)
                  </div>
                ))}
                {triagePlan.classifiedTopics.critical.length === 0 && (
                  <div className="text-xs text-ink-400 italic">No critical topics flagged.</div>
                )}
              </div>
            </div>

            {/* Quick Wins */}
            <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-forest dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Tier 2: Quick Marks ({triagePlan.classifiedTopics.quickWins.length})</span>
                </span>
              </div>
              <p className="text-[11px] text-forest dark:text-emerald-300/80 mb-2.5">
                Fast 20-30 min review secures quick scoring marks.
              </p>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {triagePlan.classifiedTopics.quickWins.map((q, i) => (
                  <div key={i} className="text-xs p-1.5 rounded bg-white dark:bg-paper-900 border border-emerald-200/60 dark:border-emerald-800/40 font-medium text-ink-900 dark:text-ink-100">
                    {q.topic.title} ({q.recommendedMinutes}m)
                  </div>
                ))}
                {triagePlan.classifiedTopics.quickWins.length === 0 && (
                  <div className="text-xs text-ink-400 italic">No quick-win topics remaining.</div>
                )}
              </div>
            </div>

            {/* Pruned */}
            <div className="p-3.5 rounded-xl border border-paper-200 dark:border-paper-700 bg-paper-50 dark:bg-paper-800/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-ink-500 dark:text-ink-400">
                  Tier 3: Skip / Confident ({triagePlan.classifiedTopics.pruned.length})
                </span>
              </div>
              <p className="text-[11px] text-ink-500 dark:text-ink-400 mb-2.5">
                Pruned to avoid cognitive overload under time crunch.
              </p>
              <div className="space-y-1.5 max-h-36 overflow-y-auto text-xs text-ink-500 dark:text-ink-400">
                {triagePlan.classifiedTopics.pruned.map((p, i) => (
                  <div key={i} className="p-1 line-through truncate" title={p.reason}>
                    {p.topic.title}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Survival Rules */}
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6 text-xs text-ink-800 dark:text-ink-200">
          <span className="font-bold block text-amber-700 dark:text-amber-400 mb-1">
            4 Golden Emergency Cram Rules:
          </span>
          <ul className="list-disc list-inside space-y-1 text-[11px]">
            {triagePlan.survivalRules.map((rule, idx) => (
              <li key={idx}>{rule}</li>
            ))}
          </ul>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-paper-200 dark:border-paper-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-ink-600 hover:text-ink-950 dark:text-ink-400 dark:hover:text-white"
          >
            Dismiss
          </button>
          <button
            onClick={handleApplyToTimetable}
            className="px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-dark text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition-all"
          >
            <Calendar className="w-4 h-4" />
            <span>Apply Triage Blocks to Timetable</span>
          </button>
        </div>
      </div>
    </div>
  );
}
