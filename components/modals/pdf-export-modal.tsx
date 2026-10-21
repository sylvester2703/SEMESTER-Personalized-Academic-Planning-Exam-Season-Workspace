'use client';

import React, { useState } from 'react';
import { usePlanner } from '@/lib/context/planner-context';
import { generateStudyPlannerPdf, PdfExportType } from '@/lib/pdf/generate-pdf';
import {
  FileDown,
  X,
  CheckCircle2,
  Calendar,
  BookOpen,
  ListTodo,
  Clock,
  Sparkles,
  Printer,
  ChevronRight,
} from 'lucide-react';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PdfExportModal({ isOpen, onClose }: PdfExportModalProps) {
  const { data, addToast } = usePlanner();

  const [selectedType, setSelectedType] = useState<PdfExportType>('full');
  const [includeCompleted, setIncludeCompleted] = useState<boolean>(true);
  const [includeNotes, setIncludeNotes] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  if (!isOpen) return null;

  const presets: {
    id: PdfExportType;
    title: string;
    description: string;
    pages: string;
    icon: any;
  }[] = [
    {
      id: 'full',
      title: 'Full Exam Season Planner',
      description: 'Complete multi-page booklet with editorial cover, exam calendar, timetable, syllabus tracker & notes.',
      pages: '4–5 pages',
      icon: BookOpen,
    },
    {
      id: 'timetable',
      title: 'Weekly Timetable',
      description: 'Clean, structured 7-day schedule designed for your desk or pinboard.',
      pages: '1–2 pages',
      icon: Calendar,
    },
    {
      id: 'daily',
      title: 'Daily Study Sheet',
      description: 'Today’s sessions checklist with times, duration, checkboxes & space for handwritten notes.',
      pages: '1 page',
      icon: ListTodo,
    },
    {
      id: 'exams',
      title: 'Exam Countdown & Revision Plan',
      description: 'Chronological exam deadlines, countdown badges, venues & revision status.',
      pages: '1 page',
      icon: Clock,
    },
    {
      id: 'syllabus',
      title: 'Printable Revision Tracker',
      description: 'Checklist of all topics, units, and active recall status with printable check boxes.',
      pages: '1–2 pages',
      icon: Printer,
    },
  ];

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const success = await generateStudyPlannerPdf(data, {
        type: selectedType,
        includeCompletedSessions: includeCompleted,
        includeNotes,
      });

      if (success) {
        addToast({
          type: 'success',
          title: 'Planner downloaded',
          description: 'Your print-ready PDF is ready to open, print, or review offline.',
        });
        onClose();
      } else {
        addToast({
          type: 'error',
          title: 'PDF generation failed',
          description: 'An unexpected error occurred while compiling your planner. Please retry.',
        });
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Export error',
        description: 'Could not create PDF file.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-modal-title"
    >
      <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-xl max-w-xl w-full p-6 shadow-elevated animate-in zoom-in-95 duration-150 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Close export dialog"
          className="absolute top-4 right-4 p-1.5 rounded text-ink-400 hover:text-ink-800 dark:hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-forest/10 dark:bg-emerald-950/40 text-forest dark:text-emerald-300 text-[11px] font-semibold tracking-wider uppercase">
            <FileDown className="w-3.5 h-3.5" />
            <span>Print-Ready Document</span>
          </div>
        </div>

        <h3 id="pdf-modal-title" className="font-serif text-2xl font-bold text-ink-950 dark:text-ink-50">
          Download My Study Planner
        </h3>
        <p className="text-sm text-ink-600 dark:text-ink-400 mt-1 mb-5">
          Your plan, wherever you need it. High-resolution vector PDF generated client-side from your saved routine and syllabus.
        </p>

        {/* Presets List */}
        <div className="space-y-2 mb-5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-1.5">
            Select Planner Layout
          </label>
          <div className="grid grid-cols-1 gap-2">
            {presets.map((p) => {
              const Icon = p.icon;
              const isSelected = selectedType === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedType(p.id)}
                  type="button"
                  className={`flex items-start gap-3 p-3 text-left rounded-lg border transition-all ${
                    isSelected
                      ? 'border-forest dark:border-emerald-500 bg-forest/5 dark:bg-emerald-950/20 ring-1 ring-forest/30'
                      : 'border-paper-300 dark:border-paper-800 hover:border-paper-400 dark:hover:border-paper-700 bg-paper-50/50 dark:bg-paper-850/50'
                  }`}
                >
                  <div
                    className={`p-2 rounded-md shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-forest text-white'
                        : 'bg-paper-200 dark:bg-paper-800 text-ink-700 dark:text-ink-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-ink-950 dark:text-ink-100">
                        {p.title}
                      </span>
                      <span className="text-[11px] font-mono text-ink-400 dark:text-ink-500">
                        {p.pages}
                      </span>
                    </div>
                    <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5 leading-relaxed">
                      {p.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Options */}
        <div className="bg-paper-100/70 dark:bg-paper-850 rounded-lg p-3.5 border border-paper-200 dark:border-paper-800 mb-6 space-y-2.5">
          <div className="text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-1">
            Document Options
          </div>
          <label className="flex items-center gap-2.5 text-xs text-ink-800 dark:text-ink-200 cursor-pointer">
            <input
              type="checkbox"
              checked={includeCompleted}
              onChange={(e) => setIncludeCompleted(e.target.checked)}
              className="rounded border-paper-300 text-forest focus:ring-forest dark:border-paper-700"
            />
            <span>Include completed study sessions</span>
          </label>
          <label className="flex items-center gap-2.5 text-xs text-ink-800 dark:text-ink-200 cursor-pointer">
            <input
              type="checkbox"
              checked={includeNotes}
              onChange={(e) => setIncludeNotes(e.target.checked)}
              className="rounded border-paper-300 text-forest focus:ring-forest dark:border-paper-700"
            />
            <span>Include personal reflections and handwritten blank note lines</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-paper-200 dark:border-paper-800">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 text-xs font-medium text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            type="button"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-forest hover:bg-forest-dark text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating Document...</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                <span>Download PDF Planner</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
