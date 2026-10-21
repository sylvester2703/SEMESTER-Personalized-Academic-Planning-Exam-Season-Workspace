'use client';

import React, { useState } from 'react';
import { usePlanner } from '@/lib/context/planner-context';
import { Subject, Topic, StudySession, ConfidenceLevel } from '@/types';
import { generateSuggestedWeeklyPlan } from '@/lib/scheduling';
import { format, addDays } from 'date-fns';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Check,
  Calendar,
  Clock,
  BookOpen,
  Plus,
  Trash2,
  CheckCircle2,
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanCreated: () => void;
}

export function OnboardingModal({ isOpen, onClose, onPlanCreated }: OnboardingModalProps) {
  const {
    data,
    updateProfile,
    addSubject,
    addTopic,
    addSession,
    resetAllData,
    addToast,
  } = usePlanner();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Name & Semester
  const [displayName, setDisplayName] = useState('');
  const [semesterTitle, setSemesterTitle] = useState('Final Semester Examinations');

  // Step 2: Subject builder
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [examDate, setExamDate] = useState(format(addDays(new Date(), 14), 'yyyy-MM-dd'));
  const [examTime, setExamTime] = useState('09:30');
  const [confidence, setConfidence] = useState<ConfidenceLevel>('medium');
  const [initialTopicNames, setInitialTopicNames] = useState<string>('Unit 1 Core Theory, Unit 2 Problem Solving');

  // Draft subjects list for multi-course entry
  const [draftSubjects, setDraftSubjects] = useState<
    {
      name: string;
      code: string;
      examDate: string;
      examTime: string;
      confidence: ConfidenceLevel;
      topics: string[];
    }[]
  >([]);

  // Step 3: Availability
  const [dailyHours, setDailyHours] = useState<number>(3);

  // Step 4: Preview plan
  const [previewSessions, setPreviewSessions] = useState<StudySession[]>([]);

  if (!isOpen) return null;

  // Add draft subject
  const handleAddDraftSubject = () => {
    if (!subjectName.trim()) return;

    const topicsArray = initialTopicNames
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    setDraftSubjects((prev) => [
      ...prev,
      {
        name: subjectName.trim(),
        code: subjectCode.trim(),
        examDate,
        examTime,
        confidence,
        topics: topicsArray.length > 0 ? topicsArray : ['Core Syllabus Review'],
      },
    ]);

    // Reset fields for next subject
    setSubjectName('');
    setSubjectCode('');
    setExamDate(format(addDays(new Date(), 21), 'yyyy-MM-dd'));
    setInitialTopicNames('');
  };

  const handleGeneratePreview = () => {
    // If user entered a subject in the inputs but didn't click "Add to list", add it now
    let allSubjects = [...draftSubjects];
    if (subjectName.trim()) {
      const topicsArray = initialTopicNames
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      allSubjects.push({
        name: subjectName.trim(),
        code: subjectCode.trim(),
        examDate,
        examTime,
        confidence,
        topics: topicsArray.length > 0 ? topicsArray : ['Core Syllabus Review'],
      });
      setDraftSubjects(allSubjects);
    }

    if (allSubjects.length === 0) {
      addToast({
        type: 'warning',
        title: 'Add at least one subject',
        description: 'Provide your subject name and exam date to generate a study plan.',
      });
      return;
    }

    // Convert draft subjects to temporary Subject and Topic models to run the rule generator
    const mockSubjects: Subject[] = allSubjects.map((s, idx) => ({
      id: `draft-subj-${idx}`,
      name: s.name,
      code: s.code,
      examDate: s.examDate,
      examTime: s.examTime,
      confidence: s.confidence,
      color: ['#2D5541', '#D99B38', '#3B6B7A', '#765C83'][idx % 4],
      createdAt: new Date().toISOString(),
    }));

    const mockTopics: Topic[] = [];
    allSubjects.forEach((s, subjIdx) => {
      s.topics.forEach((tTitle, topIdx) => {
        mockTopics.push({
          id: `draft-top-${subjIdx}-${topIdx}`,
          subjectId: `draft-subj-${subjIdx}`,
          title: tTitle,
          status: 'not_started',
        });
      });
    });

    const generated = generateSuggestedWeeklyPlan(mockSubjects, mockTopics, dailyHours, new Date(), 7);
    setPreviewSessions(generated);
    setStep(4);
  };

  // Final Commit & Save
  const handleSaveAndLaunch = () => {
    // 1. Update Profile
    updateProfile({
      displayName: displayName.trim() || 'Student',
      semesterName: semesterTitle.trim() || 'Exam Preparation',
      dailyAvailabilityHours: dailyHours,
      onboarded: true,
      isSampleData: false,
    });

    // 2. Clear old demo sessions & add real subjects + topics
    draftSubjects.forEach((s, idx) => {
      const createdSubj = addSubject({
        name: s.name,
        code: s.code,
        examDate: s.examDate,
        examTime: s.examTime,
        confidence: s.confidence,
        color: ['#2D5541', '#D99B38', '#3B6B7A', '#765C83'][idx % 4],
      });

      s.topics.forEach((tTitle) => {
        addTopic({
          subjectId: createdSubj.id,
          title: tTitle,
          status: 'not_started',
        });
      });
    });

    // 3. Add generated sessions
    previewSessions.forEach((sess) => {
      addSession({
        subjectId: sess.subjectId,
        title: sess.title,
        date: sess.date,
        startTime: sess.startTime,
        endTime: sess.endTime,
        durationMinutes: sess.durationMinutes,
        completed: false,
        notes: sess.notes,
      });
    });

    addToast({
      type: 'success',
      title: 'Study plan created!',
      description: 'Your subjects, countdowns, and weekly schedule are live.',
    });

    onPlanCreated();
    onClose();
  };

  const handleUseSampleData = () => {
    resetAllData(true);
    addToast({
      type: 'info',
      title: 'Loaded sample study workspace',
      description: 'You can customize or reset anytime from Settings.',
    });
    onPlanCreated();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-xl max-w-xl w-full p-6 sm:p-8 shadow-elevated animate-in zoom-in-95 duration-150 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded text-ink-400 hover:text-ink-800 dark:hover:text-white"
          aria-label="Cancel onboarding"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                i <= step ? 'bg-forest dark:bg-emerald-500' : 'bg-paper-200 dark:bg-paper-800'
              }`}
            />
          ))}
        </div>

        {/* STEP 1: Name & Semester */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-forest dark:text-emerald-400">
                Step 1 of 4 • Welcome
              </span>
              <h3
                id="onboarding-title"
                className="font-serif text-2xl font-semibold text-ink-950 dark:text-ink-50 mt-1"
              >
                Let’s set up your exam season
              </h3>
              <p className="text-xs text-ink-600 dark:text-ink-400 mt-1">
                SEMESTER keeps your preparation realistic and calm. Enter a display name or skip to continue.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
                  What should we call you? (optional)
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Jordan"
                  className="w-full text-xs rounded-md border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 p-2.5 text-ink-900 dark:text-ink-100 focus-visible:ring-1 focus-visible:ring-forest"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
                  Semester or Exam Period
                </label>
                <input
                  type="text"
                  value={semesterTitle}
                  onChange={(e) => setSemesterTitle(e.target.value)}
                  placeholder="e.g. Spring 2026 Finals"
                  className="w-full text-xs rounded-md border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 p-2.5 text-ink-900 dark:text-ink-100 focus-visible:ring-1 focus-visible:ring-forest"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-paper-200 dark:border-paper-800">
              <button
                type="button"
                onClick={handleUseSampleData}
                className="text-xs text-ink-500 hover:text-ink-800 dark:hover:text-ink-200 underline"
              >
                Or explore with sample data
              </button>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-forest hover:bg-forest-hover text-white text-xs font-medium shadow-sm transition-all"
              >
                <span>Next: Add Subjects</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Add Subjects */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-forest dark:text-emerald-400">
                Step 2 of 4 • Examination Dates
              </span>
              <h3 className="font-serif text-2xl font-semibold text-ink-950 dark:text-ink-50 mt-1">
                Add your upcoming examinations
              </h3>
              <p className="text-xs text-ink-600 dark:text-ink-400 mt-1">
                Enter your course code, date, and confidence level.
              </p>
            </div>

            {/* Subject Input Fields */}
            <div className="bg-paper-50 dark:bg-paper-800/60 p-3.5 rounded-lg border border-paper-300 dark:border-paper-700 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[11px] font-medium text-ink-700 dark:text-ink-300 mb-1">
                    Subject Name *
                  </label>
                  <input
                    type="text"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    placeholder="e.g. Operating Systems"
                    className="w-full text-xs rounded border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-900 p-2 text-ink-900 dark:text-ink-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-ink-700 dark:text-ink-300 mb-1">
                    Code (opt)
                  </label>
                  <input
                    type="text"
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    placeholder="CS 304"
                    className="w-full text-xs rounded border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-900 p-2 text-ink-900 dark:text-ink-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-ink-700 dark:text-ink-300 mb-1">
                    Exam Date *
                  </label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full text-xs rounded border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-900 p-2 text-ink-900 dark:text-ink-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-ink-700 dark:text-ink-300 mb-1">
                    Exam Time (opt)
                  </label>
                  <input
                    type="time"
                    value={examTime}
                    onChange={(e) => setExamTime(e.target.value)}
                    className="w-full text-xs rounded border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-900 p-2 text-ink-900 dark:text-ink-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-ink-700 dark:text-ink-300 mb-1">
                  Confidence Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as ConfidenceLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setConfidence(lvl)}
                      className={`py-1 rounded text-xs capitalize transition-colors ${
                        confidence === lvl
                          ? 'bg-forest text-white font-semibold'
                          : 'bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-700 text-ink-700 dark:text-ink-300'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-ink-700 dark:text-ink-300 mb-1">
                  Initial Syllabus Topics (comma-separated)
                </label>
                <input
                  type="text"
                  value={initialTopicNames}
                  onChange={(e) => setInitialTopicNames(e.target.value)}
                  placeholder="e.g. Concurrency, Memory Paging, File Systems"
                  className="w-full text-xs rounded border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-900 p-2 text-ink-900 dark:text-ink-100"
                />
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={handleAddDraftSubject}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-paper-200 dark:bg-paper-700 hover:bg-paper-300 text-ink-900 dark:text-white text-xs font-medium transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Subject to List</span>
                </button>
              </div>
            </div>

            {/* List of Added Subjects */}
            {draftSubjects.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold uppercase text-ink-500">
                  Ready to plan ({draftSubjects.length} subjects added):
                </p>
                {draftSubjects.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded bg-paper-100 dark:bg-paper-800 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-ink-900 dark:text-white">
                        {s.code ? `${s.code} — ` : ''}{s.name}
                      </span>
                      <span className="text-ink-500 ml-2">({s.examDate})</span>
                    </div>
                    <button
                      onClick={() => setDraftSubjects((p) => p.filter((_, i) => i !== idx))}
                      className="text-ink-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 flex items-center justify-between border-t border-paper-200 dark:border-paper-800">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1 text-xs text-ink-600 dark:text-ink-300 hover:text-ink-900"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-forest hover:bg-forest-hover text-white text-xs font-medium shadow-sm transition-all"
              >
                <span>Next: Study Availability</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Study Availability */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-forest dark:text-emerald-400">
                Step 3 of 4 • Realistic Capacity
              </span>
              <h3 className="font-serif text-2xl font-semibold text-ink-950 dark:text-ink-50 mt-1">
                How many hours can you realistically study per day?
              </h3>
              <p className="text-xs text-ink-600 dark:text-ink-400 mt-1">
                SEMESTER will never schedule sessions outside your declared availability.
              </p>
            </div>

            <div className="py-4 space-y-4">
              <div className="grid grid-cols-4 gap-2.5">
                {[1.5, 2.5, 3.5, 5].map((hours) => (
                  <button
                    key={hours}
                    type="button"
                    onClick={() => setDailyHours(hours)}
                    className={`py-3 px-2 rounded-lg border text-center transition-all ${
                      dailyHours === hours
                        ? 'border-forest bg-forest text-white font-semibold shadow-xs'
                        : 'border-paper-300 dark:border-paper-700 bg-paper-50 dark:bg-paper-800 text-ink-800 dark:text-ink-200 hover:border-paper-400'
                    }`}
                  >
                    <span className="font-serif text-xl block leading-tight">{hours}h</span>
                    <span className="text-[10px] opacity-80">
                      {hours <= 2 ? 'Light' : hours <= 3.5 ? 'Balanced' : 'Intensive'}
                    </span>
                  </button>
                ))}
              </div>

              <div className="p-3.5 rounded-lg bg-paper-100 dark:bg-paper-800/60 border border-paper-200 dark:border-paper-700 text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
                <strong>Transparent heuristic:</strong> Revision sessions are chunked into 75–90 minute blocks with scheduled breaks. Closer examinations and unconfident topics are prioritized first.
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-paper-200 dark:border-paper-800">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1 text-xs text-ink-600 dark:text-ink-300 hover:text-ink-900"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleGeneratePreview}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-forest hover:bg-forest-hover text-white text-xs font-medium shadow-sm transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Preview Suggested Plan</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Preview Suggested Plan */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-forest dark:text-emerald-400">
                Step 4 of 4 • Plan Verification
              </span>
              <h3 className="font-serif text-2xl font-semibold text-ink-950 dark:text-ink-50 mt-1">
                Your suggested 7-day study plan
              </h3>
              <p className="text-xs text-ink-600 dark:text-ink-400 mt-1">
                Review your upcoming sessions. You can edit, reschedule, or check them off once saved.
              </p>
            </div>

            {/* Session Preview List */}
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1 divide-y divide-paper-200 dark:divide-paper-800">
              {previewSessions.map((sess, idx) => (
                <div key={idx} className="pt-2 first:pt-0 flex items-start justify-between gap-2 text-xs">
                  <div>
                    <span className="font-mono text-[10px] text-ink-400 block">
                      {sess.date} ({sess.startTime} – {sess.endTime})
                    </span>
                    <span className="font-medium text-ink-900 dark:text-white">
                      {sess.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-paper-100 dark:bg-paper-800 text-ink-600 shrink-0">
                    {sess.durationMinutes}m
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3 rounded bg-sage-light dark:bg-forest/20 text-xs text-forest dark:text-emerald-300">
              Notice: Plan is not saved until you select "Save and open workspace".
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-paper-200 dark:border-paper-800">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-1 text-xs text-ink-600 dark:text-ink-300 hover:text-ink-900"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Adjust availability</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAndLaunch}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-forest hover:bg-forest-hover text-white text-xs font-semibold shadow-sm transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save and open workspace</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
