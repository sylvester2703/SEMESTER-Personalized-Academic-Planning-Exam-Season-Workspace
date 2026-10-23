'use client';

import React, { useState } from 'react';
import { usePlanner } from '@/lib/context/planner-context';
import {
  Subject,
  Topic,
  StudySession,
  ConfidenceLevel,
  SubjectDifficulty,
  SubjectPrepLevel,
  SubjectPriority,
  RoutineCommitment,
  RoutineCategory,
  StudyPreferences,
  PersonalGoal,
} from '@/types';
import { generateSuggestedWeeklyPlan, doSessionsOverlap } from '@/lib/scheduling';
import { formatTimeRange } from '@/lib/dates';
import { TimeInput12H } from '@/components/shared/time-input-12h';
import { format, addDays, parseISO } from 'date-fns';
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
  Shield,
  Layers,
  Heart,
  Target,
  AlertTriangle,
  Compass,
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanCreated: () => void;
}

export function OnboardingModal({ isOpen, onClose, onPlanCreated }: OnboardingModalProps) {
  const {
    updateProfile,
    addSubject,
    addTopic,
    addSession,
    addGoal,
    addToast,
  } = usePlanner();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // STEP 1: Understand the Student
  const [displayName, setDisplayName] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [semesterTitle, setSemesterTitle] = useState('');
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [weeklyTopicTarget, setWeeklyTopicTarget] = useState<number>(6);

  // STEP 2: Daily Routine & Fixed Commitments (Zero dummy data)
  const [commitments, setCommitments] = useState<RoutineCommitment[]>([]);

  // Form for adding a new commitment
  const [newCommName, setNewCommName] = useState('');
  const [newCommCategory, setNewCommCategory] = useState<RoutineCategory>('college');
  const [newCommDays, setNewCommDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [newCommStart, setNewCommStart] = useState('17:00');
  const [newCommEnd, setNewCommEnd] = useState('18:00');
  const [newCommFixed, setNewCommFixed] = useState(true);

  // STEP 3: Subjects & Examinations
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [examDate, setExamDate] = useState(format(addDays(new Date(), 14), 'yyyy-MM-dd'));
  const [examTime, setExamTime] = useState('09:30');
  const [difficulty, setDifficulty] = useState<SubjectDifficulty>('moderate');
  const [prepLevel, setPrepLevel] = useState<SubjectPrepLevel>('in_progress');
  const [priority, setPriority] = useState<SubjectPriority>('high');
  const [initialTopicNames, setInitialTopicNames] = useState('');

  const [draftSubjects, setDraftSubjects] = useState<
    {
      name: string;
      code: string;
      examDate: string;
      examTime: string;
      difficulty: SubjectDifficulty;
      prepLevel: SubjectPrepLevel;
      priority: SubjectPriority;
      confidence: ConfidenceLevel;
      topics: string[];
    }[]
  >([]);

  // STEP 4: Study Preferences
  const [dailyHours, setDailyHours] = useState<number>(3.5);
  const [sessionDuration, setSessionDuration] = useState<25 | 45 | 60 | 90>(45);
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('evening');
  const [pacing, setPacing] = useState<'short_frequent' | 'longer_blocks'>('short_frequent');
  const [lighterSunday, setLighterSunday] = useState<boolean>(true);

  // STEP 5: Goals & Plan Summary
  const [goalPreset, setGoalPreset] = useState<string>('finish_syllabus');
  const [customGoalText, setCustomGoalText] = useState('');
  const [previewPlan, setPreviewPlan] = useState<StudySession[] & { explanation?: string; feasibilityWarning?: string }>([] as any);

  if (!isOpen) return null;

  // Day toggler for commitments
  const toggleDay = (day: number) => {
    if (newCommDays.includes(day)) {
      setNewCommDays(newCommDays.filter((d) => d !== day));
    } else {
      setNewCommDays([...newCommDays, day].sort());
    }
  };

  const handleAddCommitment = () => {
    if (!newCommName.trim()) return;
    const item: RoutineCommitment = {
      id: `comm-${Date.now()}`,
      name: newCommName.trim(),
      category: newCommCategory,
      daysOfWeek: newCommDays.length > 0 ? newCommDays : [1, 2, 3, 4, 5],
      startTime: newCommStart,
      endTime: newCommEnd,
      isFixed: newCommFixed,
    };
    setCommitments([...commitments, item]);
    setNewCommName('');
  };

  const handleDeleteCommitment = (id: string) => {
    setCommitments(commitments.filter((c) => c.id !== id));
  };

  const handleAddPresetCommitment = (type: 'college' | 'sleep' | 'commute') => {
    const presets: Record<string, Omit<RoutineCommitment, 'id'>> = {
      college: {
        name: 'College / University Hours',
        category: 'college',
        daysOfWeek: [1, 2, 3, 4, 5],
        startTime: '09:00',
        endTime: '16:00',
        isFixed: true,
        notes: 'Lectures and laboratory sessions',
      },
      sleep: {
        name: 'Sleep & Night Rest',
        category: 'sleep',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        startTime: '23:00',
        endTime: '07:00',
        isFixed: true,
        notes: 'Consistent restful sleep schedule',
      },
      commute: {
        name: 'Commute to/from Campus',
        category: 'commute',
        daysOfWeek: [1, 2, 3, 4, 5],
        startTime: '08:00',
        endTime: '09:00',
        isFixed: true,
      },
    };
    const preset = presets[type];
    if (preset) {
      setCommitments((prev) => [
        ...prev,
        {
          id: `c-${type}-${Date.now()}`,
          ...preset,
        },
      ]);
    }
  };

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
        difficulty,
        prepLevel,
        priority,
        confidence: prepLevel === 'well_prepared' ? 'high' : prepLevel === 'in_progress' ? 'medium' : 'low',
        topics: topicsArray.length > 0 ? topicsArray : ['Core Theory & Practice'],
      },
    ]);

    setSubjectName('');
    setSubjectCode('');
    setExamDate(format(addDays(new Date(), 21), 'yyyy-MM-dd'));
    setInitialTopicNames('');
  };

  // Generate Preview
  const handleGeneratePreview = () => {
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
        difficulty,
        prepLevel,
        priority,
        confidence: prepLevel === 'well_prepared' ? 'high' : 'medium',
        topics: topicsArray.length > 0 ? topicsArray : ['Core Syllabus Review'],
      });
      setDraftSubjects(allSubjects);
    }

    if (allSubjects.length === 0) {
      addToast({
        type: 'warning',
        title: 'Add at least one subject',
        description: 'Enter your subject name and exam date to generate a study timetable.',
      });
      return;
    }

    const mockSubjects: Subject[] = allSubjects.map((s, idx) => ({
      id: `draft-subj-${idx}`,
      name: s.name,
      code: s.code,
      examDate: s.examDate,
      examTime: s.examTime,
      difficulty: s.difficulty,
      prepLevel: s.prepLevel,
      priority: s.priority,
      confidence: s.confidence,
      color: ['#2D5541', '#D99B38', '#3B6B7A', '#765C83'][idx % 4],
      createdAt: new Date().toISOString(),
    }));

    const mockTopics: Topic[] = [];
    allSubjects.forEach((s, sIdx) => {
      s.topics.forEach((tTitle, tIdx) => {
        mockTopics.push({
          id: `draft-top-${sIdx}-${tIdx}`,
          subjectId: `draft-subj-${sIdx}`,
          title: tTitle,
          status: 'not_started',
        });
      });
    });

    const preferences: Partial<StudyPreferences> = {
      dailyAvailabilityHours: dailyHours,
      preferredSessionDuration: sessionDuration,
      sessionPacing: pacing,
      preferredTimeOfDay: timeOfDay,
      lighterDays: lighterSunday ? [0] : [],
    };

    const plan = generateSuggestedWeeklyPlan(
      mockSubjects,
      mockTopics,
      commitments,
      new Date(),
      7,
      preferences
    );

    setPreviewPlan(plan);
    setStep(5);
  };

  // Save everything and launch
  const handleSaveAndLaunch = () => {
    // 1. Preferences & Routine
    const preferences: StudyPreferences = {
      dailyAvailabilityHours: dailyHours,
      preferredSessionDuration: sessionDuration,
      sessionPacing: pacing,
      preferredTimeOfDay: timeOfDay,
      breakFrequencyMinutes: 45,
      prioritizationStrategy: 'nearest_exam',
      lighterDays: lighterSunday ? [0] : [],
    };

    // 2. Personal Goal
    const goalTitle = customGoalText.trim()
      ? customGoalText.trim()
      : goalPreset === 'revise_twice'
      ? 'Revise every subject twice before exams'
      : goalPreset === 'daily_consistency'
      ? 'Build steady daily study consistency'
      : 'Finish all syllabus units before the examination period';

    const newGoal: PersonalGoal = {
      id: `goal-${Date.now()}`,
      title: goalTitle,
      category: goalPreset as any,
      completed: false,
      milestones: [
        { id: `m-${Date.now()}-1`, title: 'Complete high-priority revision units', completed: false },
        { id: `m-${Date.now()}-2`, title: 'Timed past paper review under exam conditions', completed: false },
      ],
    };

    updateProfile({
      displayName: displayName.trim() || 'Student',
      academicYearOrLevel: academicYear.trim() || 'Undergraduate',
      semesterName: semesterTitle.trim() || 'Exam Preparation',
      primaryGoalDescription: goalTitle,
      preferences,
      routineCommitments: commitments,
      goals: [newGoal],
      planExplanation: previewPlan.explanation,
      onboarded: true,
      isSampleData: false,
    });

    // 3. Create real subjects and topics
    const createdSubjectMap = new Map<string, string>(); // draft-subj-X -> real-id

    draftSubjects.forEach((s, idx) => {
      const created = addSubject({
        name: s.name,
        code: s.code,
        examDate: s.examDate,
        examTime: s.examTime,
        difficulty: s.difficulty,
        prepLevel: s.prepLevel,
        priority: s.priority,
        confidence: s.confidence,
        color: ['#2D5541', '#D99B38', '#3B6B7A', '#765C83'][idx % 4],
      });
      createdSubjectMap.set(`draft-subj-${idx}`, created.id);

      s.topics.forEach((tTitle) => {
        addTopic({
          subjectId: created.id,
          title: tTitle,
          status: 'not_started',
        });
      });
    });

    // 4. Save generated sessions with real subject IDs
    previewPlan.forEach((sess) => {
      const realSubjId = createdSubjectMap.get(sess.subjectId) || sess.subjectId;
      addSession({
        subjectId: realSubjId,
        title: sess.title,
        date: sess.date,
        startTime: sess.startTime,
        endTime: sess.endTime,
        durationMinutes: sess.durationMinutes,
        completed: false,
        isAutoGenerated: true,
        notes: sess.notes,
      });
    });

    addToast({
      type: 'success',
      title: 'Your personalised plan is ready!',
      description: 'Built around your routine, commitments, and exam deadlines.',
    });

    onPlanCreated();
    onClose();
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/70 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-modal-title"
    >
      <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-elevated animate-in zoom-in-95 duration-150 relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Close onboarding"
          className="absolute top-5 right-5 p-1.5 rounded text-ink-400 hover:text-ink-800 dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Multi-step progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-ink-400 mb-2">
            <span>Step {step} of 5</span>
            <span className="text-forest dark:text-emerald-400">
              {step === 1 && 'Understand You'}
              {step === 2 && 'Daily Routine & Commitments'}
              {step === 3 && 'Subjects & Syllabus'}
              {step === 4 && 'Study Preferences'}
              {step === 5 && 'Goal & Personalized Plan'}
            </span>
          </div>
          <div className="w-full bg-paper-200 dark:bg-paper-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-forest dark:bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* STEP 1: UNDERSTAND THE STUDENT */}
        {/* ---------------------------------------------------- */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in-50 duration-200">
            <div>
              <h3 id="onboarding-modal-title" className="font-serif text-2xl font-bold text-ink-950 dark:text-ink-50">
                Let’s plan your semester around you.
              </h3>
              <p className="text-xs text-ink-500 dark:text-ink-400 mt-1 leading-relaxed">
                SEMESTER creates a plan fitted to your actual life, not a generic dashboard. We only ask what directly affects your schedule.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-800 dark:text-ink-200 mb-1">
                  What should we call you? (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex, Sam, or your nickname"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 text-sm text-ink-900 dark:text-white focus:ring-1 focus:ring-forest"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-800 dark:text-ink-200 mb-1">
                  Academic Level or Year (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 3rd Year B.Tech, Master’s, Final Semester"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 text-sm text-ink-900 dark:text-white focus:ring-1 focus:ring-forest"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-800 dark:text-ink-200 mb-1">
                  Primary Academic Focus
                </label>
                <input
                  type="text"
                  placeholder="e.g. Complete syllabus with consistent daily revision"
                  value={primaryGoal}
                  onChange={(e) => setPrimaryGoal(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 text-sm text-ink-900 dark:text-white focus:ring-1 focus:ring-forest"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-800 dark:text-ink-200 mb-1">
                  Semester Title / Examination Series
                </label>
                <input
                  type="text"
                  placeholder="e.g. Final Semester Examinations"
                  value={semesterTitle}
                  onChange={(e) => setSemesterTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 text-sm text-ink-900 dark:text-white focus:ring-1 focus:ring-forest"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-paper-200 dark:border-paper-800">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-forest hover:bg-forest-dark text-white text-xs font-semibold shadow-xs"
              >
                <span>Continue to Daily Routine</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* STEP 2: BUILD THE DAILY ROUTINE */}
        {/* ---------------------------------------------------- */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in-50 duration-200">
            <div>
              <h3 className="font-serif text-2xl font-bold text-ink-950 dark:text-ink-50">
                Your Daily Routine & Commitments
              </h3>
              <p className="text-xs text-ink-500 dark:text-ink-400 mt-1 leading-relaxed">
                Study sessions will <strong>never</strong> be scheduled over your fixed commitments (college, sleep, commute, meals).
              </p>
            </div>

            {/* Existing commitments list or empty state */}
            {commitments.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-paper-300 dark:border-paper-700 bg-paper-50 dark:bg-paper-800/40 text-center space-y-2.5">
                <p className="text-xs text-ink-600 dark:text-ink-400">
                  No routine commitments added yet. Add your fixed commitments (college, sleep, commute) so study sessions are planned around your real schedule.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                  <span className="text-[11px] text-ink-500 font-medium mr-1">Quick presets:</span>
                  <button
                    type="button"
                    onClick={() => handleAddPresetCommitment('college')}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-paper-200 dark:bg-paper-700 hover:bg-forest/10 hover:text-forest dark:hover:text-emerald-300 text-ink-700 dark:text-ink-300 transition-colors"
                  >
                    + College (09:00–16:00)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddPresetCommitment('sleep')}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-paper-200 dark:bg-paper-700 hover:bg-forest/10 hover:text-forest dark:hover:text-emerald-300 text-ink-700 dark:text-ink-300 transition-colors"
                  >
                    + Sleep (23:00–07:00)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddPresetCommitment('commute')}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-paper-200 dark:bg-paper-700 hover:bg-forest/10 hover:text-forest dark:hover:text-emerald-300 text-ink-700 dark:text-ink-300 transition-colors"
                  >
                    + Commute (08:00–09:00)
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {commitments.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 text-xs shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <Shield className="w-4 h-4 text-forest dark:text-emerald-400 shrink-0" />
                      <div>
                        <div className="font-semibold text-ink-950 dark:text-white flex items-center gap-2">
                          <span>{c.name}</span>
                          {c.isFixed && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-forest/10 dark:bg-emerald-950/70 text-forest dark:text-emerald-300 border border-forest/20 dark:border-emerald-700/50 font-mono font-bold">
                              FIXED
                            </span>
                          )}
                        </div>
                        <div className="text-ink-600 dark:text-ink-300 font-mono text-[11px] mt-0.5 font-medium">
                          {formatTimeRange(c.startTime, c.endTime)} ·{' '}
                          {c.daysOfWeek.map((d) => dayNames[d]).join(', ')}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteCommitment(c.id)}
                      className="text-ink-400 hover:text-red-500 dark:text-ink-400 dark:hover:text-red-400 p-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Add Commitment Form */}
            <div className="p-3.5 rounded-xl border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-500 block">
                Add Another Activity (e.g. Tuition, Gym, Sports)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  placeholder="Activity name (e.g. Evening Coaching)"
                  value={newCommName}
                  onChange={(e) => setNewCommName(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-900 text-ink-900 dark:text-white"
                />
                <select
                  value={newCommCategory}
                  onChange={(e) => setNewCommCategory(e.target.value as any)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-900 text-ink-900 dark:text-white"
                >
                  <option value="college">College / University</option>
                  <option value="tuition">Coaching / Tuition</option>
                  <option value="exercise">Sports / Workout</option>
                  <option value="commute">Commute</option>
                  <option value="meals">Meals & Break</option>
                  <option value="personal">Personal / Hobby</option>
                </select>
              </div>

              {/* Day selection */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-ink-500 mr-1">Days:</span>
                {dayNames.map((dName, idx) => {
                  const isSel = newCommDays.includes(idx);
                  return (
                    <button
                      key={dName}
                      type="button"
                      onClick={() => toggleDay(idx)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                        isSel
                          ? 'bg-forest text-white'
                          : 'bg-paper-200 dark:bg-paper-700 text-ink-700 dark:text-ink-300'
                      }`}
                    >
                      {dName}
                    </button>
                  );
                })}
              </div>

              {/* Time selection */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-medium text-ink-600 dark:text-ink-400">From:</span>
                  <TimeInput12H
                    value={newCommStart}
                    onChange={setNewCommStart}
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-medium text-ink-600 dark:text-ink-400">To:</span>
                  <TimeInput12H
                    value={newCommEnd}
                    onChange={setNewCommEnd}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddCommitment}
                  className="px-3 py-1.5 rounded-lg bg-forest text-white text-xs font-semibold hover:bg-forest-dark flex items-center justify-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Block</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-paper-200 dark:border-paper-800">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-ink-600 dark:text-ink-400 hover:text-ink-900"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-forest hover:bg-forest-dark text-white text-xs font-semibold shadow-xs"
              >
                <span>Continue to Subjects</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* STEP 3: ADD SUBJECTS AND EXAMINATIONS */}
        {/* ---------------------------------------------------- */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in-50 duration-200">
            <div>
              <h3 className="font-serif text-2xl font-bold text-ink-950 dark:text-ink-50">
                Add Subjects & Examination Dates
              </h3>
              <p className="text-xs text-ink-500 dark:text-ink-400 mt-1 leading-relaxed">
                Add your upcoming courses. You do not need to list every topic now; you can add syllabus units anytime.
              </p>
            </div>

            {/* List of draft subjects */}
            {draftSubjects.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                  Added Courses ({draftSubjects.length})
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {draftSubjects.map((s, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 text-xs shadow-2xs"
                    >
                      <div>
                        <span className="font-semibold text-ink-950 dark:text-white">
                          {s.name} ({s.code || 'Course'})
                        </span>
                        <span className="text-ink-600 dark:text-ink-300 ml-2 font-mono text-[11px]">
                          Exam: {s.examDate} · {s.difficulty} difficulty · {s.topics.length} topics
                        </span>
                      </div>
                      <button
                        onClick={() => setDraftSubjects(draftSubjects.filter((_, i) => i !== idx))}
                        className="text-ink-400 hover:text-red-500 dark:text-ink-400 dark:hover:text-red-400 p-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subject Entry Form */}
            <div className="p-4 rounded-xl border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-ink-800 dark:text-ink-200 mb-1">
                    Subject Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Database Management Systems"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-900 text-ink-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-800 dark:text-ink-200 mb-1">
                    Course Code (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CS 315"
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-900 text-ink-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-ink-800 dark:text-ink-200 mb-1">
                    Exam Date
                  </label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-900 text-ink-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-800 dark:text-ink-200 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-900 text-ink-900 dark:text-white"
                  >
                    <option value="easy">Easy (Quick revision)</option>
                    <option value="moderate">Moderate</option>
                    <option value="difficult">Difficult (Extra attention)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-800 dark:text-ink-200 mb-1">
                    Current Preparation
                  </label>
                  <select
                    value={prepLevel}
                    onChange={(e) => setPrepLevel(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-900 text-ink-900 dark:text-white"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="beginner">Beginner</option>
                    <option value="in_progress">In Progress</option>
                    <option value="well_prepared">Well Prepared</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-800 dark:text-ink-200 mb-1">
                  Key Topics or Chapters (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Normalisation, B+ Trees, Concurrency Control, SQL"
                  value={initialTopicNames}
                  onChange={(e) => setInitialTopicNames(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-900 text-ink-900 dark:text-white"
                />
              </div>

              <button
                type="button"
                onClick={handleAddDraftSubject}
                className="px-4 py-2.5 rounded-lg bg-forest hover:bg-forest-hover text-white dark:bg-emerald-700 dark:hover:bg-emerald-600 dark:text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add This Subject to List</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-paper-200 dark:border-paper-800">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-ink-600 dark:text-ink-400 hover:text-ink-900"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-forest hover:bg-forest-dark text-white text-xs font-semibold shadow-xs"
              >
                <span>Continue to Study Preferences</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* STEP 4: STUDY PREFERENCES */}
        {/* ---------------------------------------------------- */}
        {step === 4 && (
          <div className="space-y-5 animate-in fade-in-50 duration-200">
            <div>
              <h3 className="font-serif text-2xl font-bold text-ink-950 dark:text-ink-50">
                How do you study best?
              </h3>
              <p className="text-xs text-ink-500 dark:text-ink-400 mt-1 leading-relaxed">
                Choose realistic targets. SEMESTER never forces impossible 10-hour study regimes.
              </p>
            </div>

            <div className="space-y-4">
              {/* Daily study hours slider */}
              <div className="p-4 rounded-xl border border-paper-300 dark:border-paper-700 bg-paper-100/90 dark:bg-paper-850 shadow-2xs">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-ink-950 dark:text-ink-50 tracking-wide">
                    Realistic Daily Study Capacity
                  </label>
                  <span className="font-mono font-bold text-forest dark:text-emerald-400 text-sm">
                    {dailyHours} hours / day
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="0.5"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(Number(e.target.value))}
                  className="w-full accent-forest dark:accent-emerald-400 cursor-pointer"
                />
                <span className="text-[11px] text-ink-600 dark:text-ink-300 font-medium block mt-1">
                  Excludes college and fixed commute hours. 3 to 4 hours is typical and highly sustainable.
                </span>
              </div>

              {/* Preferred Duration */}
              <div>
                <label className="block text-xs font-semibold text-ink-800 dark:text-ink-200 mb-2">
                  Preferred Single Study Session Duration
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[25, 45, 60, 90].map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setSessionDuration(dur as any)}
                      className={`py-2 text-center rounded-lg border text-xs font-semibold transition-all ${
                        sessionDuration === dur
                          ? 'border-forest bg-forest text-white'
                          : 'border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 text-ink-700 dark:text-ink-300'
                      }`}
                    >
                      {dur}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Time of Day */}
              <div>
                <label className="block text-xs font-semibold text-ink-800 dark:text-ink-200 mb-2">
                  When do you feel most alert?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'morning', label: 'Morning' },
                    { id: 'afternoon', label: 'Afternoon' },
                    { id: 'evening', label: 'Evening' },
                    { id: 'night', label: 'Night' },
                  ].map((tod) => (
                    <button
                      key={tod.id}
                      type="button"
                      onClick={() => setTimeOfDay(tod.id as any)}
                      className={`py-2 text-center rounded-lg border text-xs font-semibold capitalize transition-all ${
                        timeOfDay === tod.id
                          ? 'border-forest bg-forest text-white'
                          : 'border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 text-ink-700 dark:text-ink-300'
                      }`}
                    >
                      {tod.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lighter Sunday toggle */}
              <label className="flex items-center gap-3 p-3 rounded-lg border border-paper-200 dark:border-paper-800 bg-white dark:bg-paper-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lighterSunday}
                  onChange={(e) => setLighterSunday(e.target.checked)}
                  className="rounded border-paper-300 text-forest focus:ring-forest"
                />
                <div>
                  <span className="text-xs font-semibold text-ink-900 dark:text-white block">
                    Keep Sundays as lighter recovery days
                  </span>
                  <span className="text-[11px] text-ink-500">
                    Schedules lighter 1–1.5 hour revision sessions to prevent academic burnout.
                  </span>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-paper-200 dark:border-paper-800">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-ink-600 dark:text-ink-400 hover:text-ink-900"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleGeneratePreview}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-forest hover:bg-forest-dark text-white text-xs font-semibold shadow-xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Plan Preview</span>
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* STEP 5: DEFINE GOAL & GENERATED PLAN PREVIEW */}
        {/* ---------------------------------------------------- */}
        {step === 5 && (
          <div className="space-y-5 animate-in fade-in-50 duration-200">
            <div>
              <h3 className="font-serif text-2xl font-bold text-ink-950 dark:text-ink-50">
                Your Semester, Planned Around You
              </h3>
              <p className="text-xs text-ink-500 dark:text-ink-400 mt-1 leading-relaxed">
                Review your personalized plan explanation and study timetable before confirming.
              </p>
            </div>

            {/* Explanation box */}
            {previewPlan.explanation && (
              <div className="p-4 rounded-xl border border-forest/30 bg-forest/5 dark:bg-emerald-950/20 text-xs text-ink-800 dark:text-ink-200 leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-forest dark:text-emerald-400 mb-1">
                  <Compass className="w-3.5 h-3.5" />
                  <span>How This Plan Was Formed</span>
                </div>
                {previewPlan.explanation}
              </div>
            )}

            {/* Feasibility warning if applicable */}
            {previewPlan.feasibilityWarning && (
              <div className="p-3.5 rounded-lg border border-amber-300 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <span className="font-semibold block">Realistic Workload Warning</span>
                  <span>{previewPlan.feasibilityWarning}</span>
                </div>
              </div>
            )}

            {/* Timetable sessions sample preview */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-ink-600 dark:text-ink-400">
                  Generated Study Sessions ({previewPlan.length} sessions across 7 days)
                </span>
                <span className="text-xs font-mono text-forest dark:text-emerald-400">
                  ~{(previewPlan.reduce((acc, s) => acc + s.durationMinutes, 0) / 60).toFixed(1)} hrs planned
                </span>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {previewPlan.slice(0, 8).map((sess) => (
                  <div
                    key={sess.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-paper-800 border border-paper-300 dark:border-paper-700 text-xs shadow-2xs"
                  >
                    <div>
                      <span className="font-semibold text-ink-950 dark:text-white block">
                        {sess.title}
                      </span>
                      <div className="text-[11px] font-mono text-ink-600 dark:text-ink-300 mt-0.5">
                        {sess.date} · {formatTimeRange(sess.startTime, sess.endTime)} ({sess.durationMinutes}m)
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-forest/10 dark:bg-emerald-950/70 text-forest dark:text-emerald-300 border border-forest/20 dark:border-emerald-700/50 font-bold">
                      Planned
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-paper-200 dark:border-paper-800">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-ink-600 dark:text-ink-400 hover:text-ink-900"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Adjust Inputs</span>
              </button>
              <button
                type="button"
                onClick={handleSaveAndLaunch}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-forest hover:bg-forest-dark text-white text-xs font-semibold shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>Confirm & Open My Planner</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
