'use client';

import React, { useState, useEffect } from 'react';
import { usePlanner } from '@/lib/context/planner-context';
import { Subject, ConfidenceLevel } from '@/types';
import { X, Calendar, Clock, MapPin, Tag } from 'lucide-react';
import { format, addDays } from 'date-fns';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectToEdit?: Subject | null;
}

const PALETTE = [
  '#2D5541', // Forest
  '#D99B38', // Warm Amber
  '#3B6B7A', // Slate Teal
  '#765C83', // Muted Plum
  '#A05245', // Terracotta
  '#4A6B82', // Denim
];

export function SubjectModal({ isOpen, onClose, subjectToEdit }: SubjectModalProps) {
  const { addSubject, updateSubject } = usePlanner();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [examDate, setExamDate] = useState(format(addDays(new Date(), 14), 'yyyy-MM-dd'));
  const [examTime, setExamTime] = useState('09:30');
  const [examLocation, setExamLocation] = useState('');
  const [confidence, setConfidence] = useState<ConfidenceLevel>('medium');
  const [color, setColor] = useState(PALETTE[0]);
  const [targetGrade, setTargetGrade] = useState('A');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (subjectToEdit) {
      setName(subjectToEdit.name);
      setCode(subjectToEdit.code);
      setExamDate(subjectToEdit.examDate);
      setExamTime(subjectToEdit.examTime || '09:30');
      setExamLocation(subjectToEdit.examLocation || '');
      setConfidence(subjectToEdit.confidence);
      setColor(subjectToEdit.color || PALETTE[0]);
      setTargetGrade(subjectToEdit.targetGrade || 'A');
      setNotes(subjectToEdit.notes || '');
    } else {
      setName('');
      setCode('');
      setExamDate(format(addDays(new Date(), 14), 'yyyy-MM-dd'));
      setExamTime('09:30');
      setExamLocation('');
      setConfidence('medium');
      setColor(PALETTE[0]);
      setTargetGrade('A');
      setNotes('');
    }
  }, [subjectToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !examDate) return;

    if (subjectToEdit) {
      updateSubject(subjectToEdit.id, {
        name: name.trim(),
        code: code.trim(),
        examDate,
        examTime: examTime || undefined,
        examLocation: examLocation.trim() || undefined,
        confidence,
        color,
        targetGrade: targetGrade.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      addSubject({
        name: name.trim(),
        code: code.trim(),
        examDate,
        examTime: examTime || undefined,
        examLocation: examLocation.trim() || undefined,
        confidence,
        color,
        targetGrade: targetGrade.trim() || undefined,
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
          {subjectToEdit ? 'Edit Subject' : 'Add New Subject'}
        </h3>
        <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5 mb-4">
          Record your course details and examination logistics.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
                Subject Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Distributed Systems"
                className="w-full text-xs rounded border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 p-2 text-ink-900 dark:text-ink-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
                Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="CS 301"
                className="w-full text-xs rounded border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 p-2 text-ink-900 dark:text-ink-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
                Exam Date *
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                required
                className="w-full text-xs rounded border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 p-2 text-ink-900 dark:text-ink-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
                Exam Time
              </label>
              <input
                type="time"
                value={examTime}
                onChange={(e) => setExamTime(e.target.value)}
                className="w-full text-xs rounded border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 p-2 text-ink-900 dark:text-ink-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
                Exam Hall / Room
              </label>
              <input
                type="text"
                value={examLocation}
                onChange={(e) => setExamLocation(e.target.value)}
                placeholder="Hall B, Room 204"
                className="w-full text-xs rounded border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 p-2 text-ink-900 dark:text-ink-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
                Target Grade
              </label>
              <input
                type="text"
                value={targetGrade}
                onChange={(e) => setTargetGrade(e.target.value)}
                placeholder="A / 1st Class"
                className="w-full text-xs rounded border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 p-2 text-ink-900 dark:text-ink-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
              Current Preparation Confidence
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as ConfidenceLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setConfidence(lvl)}
                  className={`py-1.5 rounded text-xs capitalize transition-colors ${
                    confidence === lvl
                      ? 'bg-forest text-white font-semibold'
                      : 'bg-paper-50 dark:bg-paper-800 border border-paper-300 dark:border-paper-700 text-ink-700 dark:text-ink-300'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Palette Color Selection */}
          <div>
            <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
              Subject Color Tag
            </label>
            <div className="flex items-center gap-2">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    color === c ? 'ring-2 ring-forest ring-offset-2 scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
              Notes / Key Reminders (optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Formula sheet permitted; focus on Section B proofs"
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
              {subjectToEdit ? 'Save Changes' : 'Create Subject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
