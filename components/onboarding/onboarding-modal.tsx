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
  Pencil,
  Upload,
  FileText,
} from 'lucide-react';
import { parseSyllabusText } from '@/lib/syllabus/parser';

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

  // Editing state for existing commitments in Step 2
  const [editingCommId, setEditingCommId] = useState<string | null>(null);
  const [editCommName, setEditCommName] = useState('');
  const [editCommCategory, setEditCommCategory] = useState<RoutineCategory>('college');
  const [editCommDays, setEditCommDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [editCommStart, setEditCommStart] = useState('17:00');
  const [editCommEnd, setEditCommEnd] = useState('18:00');
  const [editCommFixed, setEditCommFixed] = useState(true);

  // STEP 3: Subjects & Examinations
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [examDate, setExamDate] = useState(format(addDays(new Date(), 14), 'yyyy-MM-dd'));
  const [examTime, setExamTime] = useState('09:30');
  const [difficulty, setDifficulty] = useState<SubjectDifficulty>('moderate');
  const [prepLevel, setPrepLevel] = useState<SubjectPrepLevel>('in_progress');
  const [priority, setPriority] = useState<SubjectPriority>('high');
  const [initialTopicNames, setInitialTopicNames] = useState('');

  // Editing state for draft subjects in Step 3
  const [editingSubjectIndex, setEditingSubjectIndex] = useState<number | null>(null);

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
      units?: { id: string; title: string; unitNumber: string; topics: string[] }[];
    }[]
  >([]);

  // Step 3 syllabus upload & unit container state
  const [step3Units, setStep3Units] = useState<{ id: string; unitNumber: string; title: string; topics: string[] }[]>([]);
  const [step3ShowSyllabusDrawer, setStep3ShowSyllabusDrawer] = useState(false);
  const [step3SyllabusText, setStep3SyllabusText] = useState('');
  const [step3NewTopicByUnit, setStep3NewTopicByUnit] = useState<Record<string, string>>({});

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

  // Day toggler for new commitment
  const toggleDay = (day: number) => {
    if (newCommDays.includes(day)) {
      setNewCommDays(newCommDays.filter((d) => d !== day));
    } else {
      setNewCommDays([...newCommDays, day].sort());
    }
  };

  // Day toggler for editing commitment
  const toggleEditDay = (day: number) => {
    if (editCommDays.includes(day)) {
      setEditCommDays(editCommDays.filter((d) => d !== day));
    } else {
      setEditCommDays([...editCommDays, day].sort());
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

  const startEditCommitment = (c: RoutineCommitment) => {
    setEditingCommId(c.id);
    setEditCommName(c.name);
    setEditCommCategory(c.category);
    setEditCommDays([...c.daysOfWeek]);
    setEditCommStart(c.startTime);
    setEditCommEnd(c.endTime);
    setEditCommFixed(c.isFixed ?? true);
  };

  const cancelEditCommitment = () => {
    setEditingCommId(null);
  };

  const saveEditCommitment = () => {
    if (!editCommName.trim() || !editingCommId) return;
    setCommitments((prev) =>
      prev.map((c) =>
        c.id === editingCommId
          ? {
              ...c,
              name: editCommName.trim(),
              category: editCommCategory,
              daysOfWeek: editCommDays.length > 0 ? editCommDays : [1, 2, 3, 4, 5],
              startTime: editCommStart,
              endTime: editCommEnd,
              isFixed: editCommFixed,
            }
          : c
      )
    );
    setEditingCommId(null);
  };

  const handleDeleteCommitment = (id: string) => {
    if (editingCommId === id) {
      setEditingCommId(null);
    }
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

  const startEditDraftSubject = (index: number) => {
    const s = draftSubjects[index];
    if (!s) return;
    setEditingSubjectIndex(index);
    setSubjectName(s.name);
    setSubjectCode(s.code);
    setExamDate(s.examDate);
    setExamTime(s.examTime);
    setDifficulty(s.difficulty);
    setPrepLevel(s.prepLevel);
    setPriority(s.priority);
    setInitialTopicNames(s.topics.join(', '));
  };

  const cancelEditDraftSubject = () => {
    setEditingSubjectIndex(null);
    setSubjectName('');
    setSubjectCode('');
    setExamDate(format(addDays(new Date(), 14), 'yyyy-MM-dd'));
    setExamTime('09:30');
    setInitialTopicNames('');
    setStep3Units([]);
  };

  const handleAddStep3Unit = () => {
    const nextIdx = step3Units.length + 1;
    setStep3Units((prev) => [
      ...prev,
      {
        id: `draft-unit-${Date.now()}-${nextIdx}`,
        unitNumber: `Unit ${nextIdx}`,
        title: `Unit ${nextIdx}: Core Module`,
        topics: [],
      },
    ]);
  };

  const handleDeleteStep3Unit = (id: string) => {
    setStep3Units((prev) => prev.filter((u) => u.id !== id));
  };

  const handleAddTopicToStep3Unit = (unitId: string) => {
    const text = (step3NewTopicByUnit[unitId] || '').trim();
    if (!text) return;
    setStep3Units((prev) =>
      prev.map((u) => (u.id === unitId ? { ...u, topics: [...u.topics, text] } : u))
    );
    setStep3NewTopicByUnit((prev) => ({ ...prev, [unitId]: '' }));
  };

  const handleRemoveTopicFromStep3Unit = (unitId: string, topicIdx: number) => {
    setStep3Units((prev) =>
      prev.map((u) =>
        u.id === unitId
          ? { ...u, topics: u.topics.filter((_, idx) => idx !== topicIdx) }
          : u
      )
    );
  };

  const handleParseStep3Syllabus = (rawText: string) => {
    if (!rawText.trim()) return;
    const parsed = parseSyllabusText(rawText, 'draft');
    if (parsed.units.length > 0) {
      const parsedUnits = parsed.units.map((u) => {
        const uTopics = parsed.topics
          .filter((t) => t.unitId === u.id || t.unitOrModule === u.unitNumber)
          .map((t) => t.title);
        return {
          id: u.id,
          unitNumber: String(u.unitNumber || `Unit ${u.order}`),
          title: u.title,
          topics: uTopics.length > 0 ? uTopics : ['Unit overview & key concepts'],
        };
      });
      setStep3Units(parsedUnits);
      setStep3ShowSyllabusDrawer(false);
    } else if (parsed.topics.length > 0) {
      setStep3Units([
        {
          id: `draft-unit-${Date.now()}`,
          unitNumber: 'Unit 1',
          title: 'Syllabus Lessons & Topics',
          topics: parsed.topics.map((t) => t.title),
        },
      ]);
      setStep3ShowSyllabusDrawer(false);
    }
  };

  // Add or update draft subject
  const handleAddDraftSubject = () => {
    if (!subjectName.trim()) return;
    const topicsArray = initialTopicNames
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const unitTopics = step3Units.flatMap((u) => u.topics);
    const finalTopics =
      unitTopics.length > 0
        ? unitTopics
        : topicsArray.length > 0
        ? topicsArray
        : ['Core Theory & Practice'];

    if (editingSubjectIndex !== null) {
      setDraftSubjects((prev) =>
        prev.map((s, idx) =>
          idx === editingSubjectIndex
            ? {
                ...s,
                name: subjectName.trim(),
                code: subjectCode.trim(),
                examDate,
                examTime,
                difficulty,
                prepLevel,
                priority,
                confidence: prepLevel === 'well_prepared' ? 'high' : prepLevel === 'in_progress' ? 'medium' : 'low',
                topics: finalTopics,
                units: step3Units.length > 0 ? step3Units : s.units,
              }
            : s
        )
      );
      setEditingSubjectIndex(null);
    } else {
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
          topics: finalTopics,
          units: step3Units.length > 0 ? step3Units : undefined,
        },
      ]);
    }

    setSubjectName('');
    setSubjectCode('');
    setExamDate(format(addDays(new Date(), 21), 'yyyy-MM-dd'));
    setInitialTopicNames('');
    setStep3Units([]);
    setStep3SyllabusText('');
    setStep3ShowSyllabusDrawer(false);
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
        units: s.units?.map((u, uIdx) => ({
          id: u.id,
          subjectId: '',
          unitNumber: u.unitNumber,
          title: u.title,
          order: uIdx + 1,
        })),
      });
      createdSubjectMap.set(`draft-subj-${idx}`, created.id);

      if (s.units && s.units.length > 0) {
        s.units.forEach((u) => {
          u.topics.forEach((tTitle) => {
            addTopic({
              subjectId: created.id,
              unitId: u.id,
              unitOrModule: u.title,
              title: tTitle,
              status: 'not_started',
            });
          });
        });
      } else {
        s.topics.forEach((tTitle) => {
          addTopic({
            subjectId: created.id,
            title: tTitle,
            status: 'not_started',
          });
        });
      }
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
              <div className="space-y-2.5 max-h-72 sm:max-h-96 overflow-y-auto pr-1">
                {commitments.map((c) =>
                  editingCommId === c.id ? (
                    <div
                      key={c.id}
                      className="p-3.5 rounded-xl border-2 border-forest/40 dark:border-emerald-600/50 bg-forest/5 dark:bg-emerald-950/20 space-y-3 transition-all shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-forest dark:text-emerald-400 flex items-center gap-1.5">
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Edit Activity & Schedule</span>
                        </span>
                        <button
                          type="button"
                          onClick={cancelEditCommitment}
                          className="text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 text-xs"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Activity name (e.g. Lunch)"
                          value={editCommName}
                          onChange={(e) => setEditCommName(e.target.value)}
                          className="px-3 py-1.5 text-xs rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-900 text-ink-900 dark:text-white"
                        />
                        <select
                          value={editCommCategory}
                          onChange={(e) => setEditCommCategory(e.target.value as any)}
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
                        <span className="text-[11px] text-ink-500 mr-1 font-medium">Days:</span>
                        {dayNames.map((dName, idx) => {
                          const isSel = editCommDays.includes(idx);
                          return (
                            <button
                              key={dName}
                              type="button"
                              onClick={() => toggleEditDay(idx)}
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

                      {/* Time selection with TimeInput12H */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-forest/10 dark:border-emerald-800/30">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-medium text-ink-600 dark:text-ink-400">From:</span>
                            <TimeInput12H value={editCommStart} onChange={setEditCommStart} />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-medium text-ink-600 dark:text-ink-400">To:</span>
                            <TimeInput12H value={editCommEnd} onChange={setEditCommEnd} />
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={cancelEditCommitment}
                            className="px-2.5 py-1 text-xs text-ink-600 dark:text-ink-400 hover:bg-paper-200 dark:hover:bg-paper-700 rounded-md transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={saveEditCommitment}
                            className="px-3 py-1 bg-forest hover:bg-forest-hover text-white text-xs font-semibold rounded-md flex items-center gap-1 shadow-2xs transition-all"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Save Changes</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 text-xs shadow-2xs hover:border-forest/30 transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Shield className="w-4 h-4 text-forest dark:text-emerald-400 shrink-0" />
                        <div className="min-w-0">
                          <div className="font-semibold text-ink-950 dark:text-white flex items-center gap-2 truncate">
                            <span>{c.name}</span>
                            {c.isFixed && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-forest/10 dark:bg-emerald-950/70 text-forest dark:text-emerald-300 border border-forest/20 dark:border-emerald-700/50 font-mono font-bold">
                                FIXED
                              </span>
                            )}
                          </div>
                          <div className="text-ink-600 dark:text-ink-300 font-mono text-[11px] mt-0.5 font-medium truncate">
                            {formatTimeRange(c.startTime, c.endTime)} ·{' '}
                            {c.daysOfWeek.map((d) => dayNames[d]).join(', ')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <button
                          type="button"
                          onClick={() => startEditCommitment(c)}
                          title="Edit activity name, time & days"
                          className="p-1.5 rounded-md text-ink-500 hover:text-forest hover:bg-forest/10 dark:text-ink-400 dark:hover:text-emerald-300 dark:hover:bg-emerald-950/50 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCommitment(c.id)}
                          title="Delete activity"
                          className="p-1.5 rounded-md text-ink-400 hover:text-red-500 hover:bg-red-50 dark:text-ink-400 dark:hover:text-red-400 dark:hover:bg-red-950/30 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                )}
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
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-xs shadow-2xs transition-all ${
                        editingSubjectIndex === idx
                          ? 'border-forest bg-forest/5 dark:border-emerald-600 dark:bg-emerald-950/20'
                          : 'border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800'
                      }`}
                    >
                      <div>
                        <span className="font-semibold text-ink-950 dark:text-white">
                          {s.name} ({s.code || 'Course'})
                        </span>
                        <span className="text-ink-600 dark:text-ink-300 ml-2 font-mono text-[11px]">
                          Exam: {s.examDate} · {s.difficulty} difficulty · {s.topics.length} topics
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => startEditDraftSubject(idx)}
                          title="Edit course & exam date"
                          className="p-1 rounded text-ink-500 hover:text-forest hover:bg-forest/10 dark:text-ink-400 dark:hover:text-emerald-300 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (editingSubjectIndex === idx) cancelEditDraftSubject();
                            setDraftSubjects(draftSubjects.filter((_, i) => i !== idx));
                          }}
                          title="Delete course"
                          className="text-ink-400 hover:text-red-500 dark:text-ink-400 dark:hover:text-red-400 p-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
                  Key Topics or Chapters (Quick Entry)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Normalisation, B+ Trees, Concurrency Control, SQL"
                  value={initialTopicNames}
                  onChange={(e) => setInitialTopicNames(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-900 text-ink-900 dark:text-white"
                />
              </div>

              {/* Syllabus / Unit & Lesson Container System */}
              <div className="pt-2 border-t border-paper-200 dark:border-paper-700/60 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-ink-800 dark:text-ink-200">
                      Syllabus Units & Lesson Containers (Optional)
                    </label>
                    <p className="text-[11px] text-ink-500 dark:text-ink-400">
                      Upload or paste your syllabus or lesson contents, or create a container for each unit or lesson and its contents.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setStep3ShowSyllabusDrawer(!step3ShowSyllabusDrawer)}
                      className="px-2 py-1 text-[11px] rounded-md border border-forest/30 bg-forest/5 dark:bg-forest/15 text-forest dark:text-emerald-400 font-medium hover:bg-forest/10 flex items-center gap-1 transition-colors"
                    >
                      <Upload className="w-3 h-3" />
                      <span>{step3ShowSyllabusDrawer ? 'Hide Paste' : 'Paste Syllabus'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAddStep3Unit}
                      className="px-2 py-1 text-[11px] rounded-md bg-forest text-white hover:bg-forest-hover font-medium flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Unit Container</span>
                    </button>
                  </div>
                </div>

                {/* Paste drawer */}
                {step3ShowSyllabusDrawer && (
                  <div className="p-3 rounded-lg border border-forest/20 dark:border-forest/30 bg-forest/5 dark:bg-paper-850 space-y-2">
                    <textarea
                      rows={3}
                      value={step3SyllabusText}
                      onChange={(e) => setStep3SyllabusText(e.target.value)}
                      placeholder={`Paste syllabus text or lesson contents here...\nUnit 1: Distributed Algorithms\n- Consensus protocols\n- Lamport timestamps`}
                      className="w-full text-xs p-2 rounded border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-900 text-ink-900 dark:text-white font-mono placeholder:font-sans"
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleParseStep3Syllabus(step3SyllabusText)}
                        disabled={!step3SyllabusText.trim()}
                        className="px-3 py-1 bg-forest hover:bg-forest-hover text-white text-xs font-semibold rounded flex items-center gap-1 disabled:opacity-50"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Extract into Containers</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Render Unit Containers if any */}
                {step3Units.length > 0 && (
                  <div className="space-y-2 pt-1">
                    {step3Units.map((u) => (
                      <div
                        key={u.id}
                        className="p-2.5 rounded-lg border border-paper-300 dark:border-paper-700 bg-paper-50 dark:bg-paper-900 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-1">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-forest/10 dark:bg-emerald-950 text-forest dark:text-emerald-400 border border-forest/20 shrink-0">
                              {u.unitNumber}
                            </span>
                            <input
                              type="text"
                              value={u.title}
                              onChange={(e) =>
                                setStep3Units((prev) =>
                                  prev.map((item) => (item.id === u.id ? { ...item, title: e.target.value } : item))
                                )
                              }
                              placeholder="Unit / Lesson Name"
                              className="flex-1 font-semibold text-xs px-2 py-0.5 rounded border border-paper-200 dark:border-paper-700 bg-white dark:bg-paper-800 text-ink-950 dark:text-white"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteStep3Unit(u.id)}
                            className="text-ink-400 hover:text-red-500 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Topics inside unit */}
                        <div className="flex flex-wrap gap-1.5 pl-1">
                          {u.topics.map((tName, tIdx) => (
                            <span
                              key={tIdx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white dark:bg-paper-800 border border-paper-300 dark:border-paper-700 text-xs text-ink-800 dark:text-ink-200"
                            >
                              <span>{tName}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveTopicFromStep3Unit(u.id, tIdx)}
                                className="text-ink-400 hover:text-red-500"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-1.5 pl-1">
                          <input
                            type="text"
                            placeholder="Add lesson content / topic..."
                            value={step3NewTopicByUnit[u.id] || ''}
                            onChange={(e) =>
                              setStep3NewTopicByUnit((prev) => ({ ...prev, [u.id]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddTopicToStep3Unit(u.id);
                              }
                            }}
                            className="flex-1 px-2 py-1 text-xs rounded border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 text-ink-900 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddTopicToStep3Unit(u.id)}
                            className="px-2 py-1 text-xs rounded bg-paper-200 dark:bg-paper-700 hover:bg-forest hover:text-white transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddDraftSubject}
                  className="px-4 py-2.5 rounded-lg bg-forest hover:bg-forest-hover text-white dark:bg-emerald-700 dark:hover:bg-emerald-600 dark:text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {editingSubjectIndex !== null ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Course Changes</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add This Subject to List</span>
                    </>
                  )}
                </button>
                {editingSubjectIndex !== null && (
                  <button
                    type="button"
                    onClick={cancelEditDraftSubject}
                    className="px-3 py-2 text-xs text-ink-600 dark:text-ink-400 hover:bg-paper-200 dark:hover:bg-paper-700 rounded-lg transition-colors"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
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
