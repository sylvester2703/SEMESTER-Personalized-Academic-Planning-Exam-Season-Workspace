'use client';

import React, { useState, useEffect } from 'react';
import { usePlanner } from '@/lib/context/planner-context';
import { Topic, TopicStatus } from '@/types';
import { X } from 'lucide-react';

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
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (topicToEdit) {
      setSubjectId(topicToEdit.subjectId);
      setTitle(topicToEdit.title);
      setUnitOrModule(topicToEdit.unitOrModule || '');
      setStatus(topicToEdit.status);
      setNotes(topicToEdit.notes || '');
    } else {
      setSubjectId(initialSubjectId || (data.subjects[0]?.id ?? ''));
      setTitle('');
      setUnitOrModule('');
      setStatus('not_started');
      setNotes('');
    }
  }, [topicToEdit, initialSubjectId, data.subjects, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subjectId) return;

    if (topicToEdit) {
      updateTopic(topicToEdit.id, {
        subjectId,
        title: title.trim(),
        unitOrModule: unitOrModule.trim() || undefined,
        status,
        notes: notes.trim() || undefined,
      });
    } else {
      addTopic({
        subjectId,
        title: title.trim(),
        unitOrModule: unitOrModule.trim() || undefined,
        status,
        notes: notes.trim() || undefined,
      });
    }

    onClose();
  };

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
          {topicToEdit ? 'Edit Syllabus Topic' : 'Add Topic to Syllabus'}
        </h3>
        <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5 mb-4">
          Break your courses down into discrete revision concepts.
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
              Topic or Syllabus Unit Name *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Raft Consensus Algorithm & Log Replication"
              className="w-full text-xs rounded border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 p-2 text-ink-900 dark:text-ink-100"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
              Module / Chapter / Unit (optional)
            </label>
            <input
              type="text"
              value={unitOrModule}
              onChange={(e) => setUnitOrModule(e.target.value)}
              placeholder="e.g. Module 2: Fault Tolerance"
              className="w-full text-xs rounded border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 p-2 text-ink-900 dark:text-ink-100"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
              Current Mastery Status
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
              Notes / References (optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Textbook chapter 5, slides 10-24"
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
