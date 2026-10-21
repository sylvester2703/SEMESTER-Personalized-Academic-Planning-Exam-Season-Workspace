'use client';

import React, { useState, useEffect } from 'react';
import { usePlanner } from '@/lib/context/planner-context';
import { Topic, TopicStatus } from '@/types';
import { X, Clock, AlertCircle } from 'lucide-react';

interface TopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicToEdit?: Topic | null;
  initialSubjectId?: string;
}

export function TopicModal({
  isOpen,
  onClose,
  topicToEdit,
  initialSubjectId,
}: TopicModalProps) {
  const { data, addTopic, updateTopic } = usePlanner();

  const [subjectId, setSubjectId] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [unitOrModule, setUnitOrModule] = useState<string>('');
  const [status, setStatus] = useState<TopicStatus>('not_started');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(45);
  const [isProvisionalEstimate, setIsProvisionalEstimate] = useState<boolean>(true);
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [subtopicsStr, setSubtopicsStr] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (topicToEdit) {
      setSubjectId(topicToEdit.subjectId);
      setTitle(topicToEdit.title);
      setUnitOrModule(topicToEdit.unitOrModule || '');
      setStatus(topicToEdit.status);
      setEstimatedMinutes(topicToEdit.estimatedMinutes || 45);
      setIsProvisionalEstimate(topicToEdit.isProvisionalEstimate ?? false);
      setPriority(topicToEdit.priority || 'medium');
      setSubtopicsStr(topicToEdit.subtopics?.join(', ') || '');
      setNotes(topicToEdit.notes || '');
    } else {
      setSubjectId(initialSubjectId || (data.subjects[0]?.id ?? ''));
      setTitle('');
      setUnitOrModule('');
      setStatus('not_started');
      setEstimatedMinutes(45);
      setIsProvisionalEstimate(true);
      setPriority('medium');
      setSubtopicsStr('');
      setNotes('');
    }
  }, [topicToEdit, initialSubjectId, data.subjects, isOpen]);

  if (!isOpen) return null;

  const currentSubject = data.subjects.find((s) => s.id === subjectId);
  const subjectUnits = currentSubject?.units || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subjectId) return;

    const subtopics = subtopicsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (topicToEdit) {
      updateTopic(topicToEdit.id, {
        subjectId,
        title: title.trim(),
        unitOrModule: unitOrModule.trim() || undefined,
        status,
        estimatedMinutes: Number(estimatedMinutes) || 45,
        isProvisionalEstimate,
        priority,
        subtopics: subtopics.length > 0 ? subtopics : undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      addTopic({
        subjectId,
        title: title.trim(),
        unitOrModule: unitOrModule.trim() || undefined,
        status,
        estimatedMinutes: Number(estimatedMinutes) || 45,
        isProvisionalEstimate,
        priority,
        subtopics: subtopics.length > 0 ? subtopics : undefined,
        notes: notes.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-xl max-w-md w-full p-6 shadow-elevated animate-in zoom-in-95 duration-150 relative my-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded text-ink-400 hover:text-ink-800 dark:hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="font-serif text-xl font-semibold text-ink-950 dark:text-ink-50">
          {topicToEdit ? 'Edit Syllabus Topic' : 'Add Topic to Syllabus'}
        </h3>
        <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5 mb-4">
          Break your courses down into discrete revision concepts and set realistic study durations.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
              Course Subject *
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
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

          <div>
            <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
              Topic Name *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Normalization: 1NF, 2NF, 3NF and BCNF"
              className="w-full text-xs rounded border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 p-2 text-ink-900 dark:text-ink-100"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
              Unit / Module / Chapter (optional)
            </label>
            {subjectUnits.length > 0 && (
              <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                <span className="text-[10px] text-ink-400">Quick select:</span>
                {subjectUnits.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setUnitOrModule(`${u.unitNumber ? `${u.unitNumber}: ` : ''}${u.title}`)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-paper-100 dark:bg-paper-800 hover:bg-paper-200 text-ink-700 dark:text-ink-300"
                  >
                    {u.unitNumber || u.title}
                  </button>
                ))}
              </div>
            )}
            <input
              type="text"
              value={unitOrModule}
              onChange={(e) => setUnitOrModule(e.target.value)}
              placeholder="e.g. Unit 2: Relational Database Design"
              className="w-full text-xs rounded border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 p-2 text-ink-900 dark:text-ink-100"
            />
          </div>

          {/* Duration & Provisional Indicator */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
                Estimated Study Time
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="10"
                  max="360"
                  step="5"
                  value={estimatedMinutes}
                  onChange={(e) => {
                    setEstimatedMinutes(parseInt(e.target.value) || 45);
                    setIsProvisionalEstimate(false);
                  }}
                  className="w-full text-xs rounded border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 p-2 text-ink-900 dark:text-ink-100"
                />
                <span className="text-xs text-ink-500 font-mono">min</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'high' | 'medium' | 'low')}
                className="w-full text-xs rounded border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 p-2 text-ink-900 dark:text-ink-100"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
              Current Preparation Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { val: 'not_started', label: 'Not started' },
                  { val: 'learning', label: 'Learning' },
                  { val: 'needs_revision', label: 'Needs revision' },
                  { val: 'confident', label: 'Confident' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setStatus(opt.val)}
                  className={`py-1.5 px-2 rounded text-xs transition-colors ${
                    status === opt.val
                      ? 'bg-forest text-white font-semibold'
                      : 'bg-paper-50 dark:bg-paper-800 border border-paper-300 dark:border-paper-700 text-ink-700 dark:text-ink-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
              Subtopics / Key Concepts (optional, comma-separated)
            </label>
            <input
              type="text"
              value={subtopicsStr}
              onChange={(e) => setSubtopicsStr(e.target.value)}
              placeholder="e.g. Lossless join, Dependency preservation, Multi-valued dependencies"
              className="w-full text-xs rounded border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 p-2 text-ink-900 dark:text-ink-100"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
              Notes / Textbook Reference (optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Korth Ch 8, Slide set 14"
              className="w-full text-xs rounded border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 p-2 text-ink-900 dark:text-ink-100"
            />
          </div>

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
              {topicToEdit ? 'Save Changes' : 'Add Topic'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
