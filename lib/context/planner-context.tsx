'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  AppData,
  Subject,
  Topic,
  StudySession,
  FocusRecord,
  UserProfile,
  TopicStatus,
  ConfidenceLevel,
  RoutineCommitment,
  PersonalGoal,
  ExamDayChecklistItem,
} from '@/types';
import {
  loadAppData,
  saveAppData,
  resetAppData,
  exportAppDataJson,
  importAppDataJson,
} from '@/lib/storage';
import { generateSuggestedWeeklyPlan } from '@/lib/scheduling';

export type ActiveView =
  | 'landing'
  | 'dashboard'
  | 'timetable'
  | 'exams'
  | 'readiness'
  | 'focus'
  | 'weekly-review'
  | 'settings';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  description?: string;
}

interface PlannerContextType {
  data: AppData;
  isLoaded: boolean;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  // Subject Actions
  addSubject: (subject: Omit<Subject, 'id' | 'createdAt'>) => Subject;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  // Topic Actions
  addTopic: (topic: Omit<Topic, 'id'>) => Topic;
  updateTopic: (id: string, updates: Partial<Topic>) => void;
  deleteTopic: (id: string) => void;
  setTopicStatus: (id: string, status: TopicStatus) => void;

  // Session Actions
  addSession: (session: Omit<StudySession, 'id'>) => StudySession;
  updateSession: (id: string, updates: Partial<StudySession>) => void;
  deleteSession: (id: string) => void;
  toggleSessionComplete: (id: string) => void;

  // Focus Actions
  recordFocusSession: (record: Omit<FocusRecord, 'id' | 'completedAt'>) => void;

  // Routine Commitments
  addRoutineCommitment: (commitment: Omit<RoutineCommitment, 'id'>) => void;
  updateRoutineCommitment: (id: string, updates: Partial<RoutineCommitment>) => void;
  deleteRoutineCommitment: (id: string) => void;

  // Personal Goals
  addGoal: (goal: Omit<PersonalGoal, 'id'>) => void;
  updateGoal: (id: string, updates: Partial<PersonalGoal>) => void;
  deleteGoal: (id: string) => void;
  toggleMilestone: (goalId: string, milestoneId: string) => void;

  // Exam Day Checklist
  addChecklistItem: (item: Omit<ExamDayChecklistItem, 'id'>) => void;
  toggleChecklistItem: (id: string) => void;
  deleteChecklistItem: (id: string) => void;

  // Adaptive Rescheduling & Recovery
  rescheduleSession: (id: string, newDate: string, newStartTime: string, newEndTime: string) => void;
  splitSession: (id: string, part1Minutes: number, part2Minutes: number, date2: string, start2: string, end2: string) => void;
  markSessionMissed: (id: string) => void;

  // Profile / Settings
  updateProfile: (updates: Partial<UserProfile>) => void;
  applySuggestedPlan: (options?: { replaceExisting?: boolean }) => void;
  resetAllData: (useSample: boolean) => void;
  exportData: () => string;
  importData: (jsonStr: string) => { success: boolean; error?: string };
}

const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadAppData());
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>('landing');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Hydration & Theme initialization
  useEffect(() => {
    const loaded = loadAppData();
    setData(loaded);
    setIsLoaded(true);

    // Apply theme
    applyThemeClass(loaded.profile.theme);
  }, []);

  // Sync to localStorage on changes
  useEffect(() => {
    if (isLoaded) {
      saveAppData(data);
    }
  }, [data, isLoaded]);

  const applyThemeClass = (theme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    applyThemeClass(newTheme);
    setData((prev) => ({
      ...prev,
      profile: { ...prev.profile, theme: newTheme },
    }));
    addToast({
      type: 'info',
      title: `Theme updated to ${newTheme}`,
    });
  };

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // SUBJECT ACTIONS
  const addSubject = (subjInput: Omit<Subject, 'id' | 'createdAt'>): Subject => {
    const newSubj: Subject = {
      ...subjInput,
      id: `subj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    setData((prev) => ({
      ...prev,
      subjects: [...prev.subjects, newSubj],
    }));
    addToast({
      type: 'success',
      title: 'Subject added',
      description: `${newSubj.name} (${newSubj.code || 'No code'}) was created.`,
    });
    return newSubj;
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    setData((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
    addToast({
      type: 'info',
      title: 'Subject updated',
    });
  };

  const deleteSubject = (id: string) => {
    const target = data.subjects.find((s) => s.id === id);
    setData((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s.id !== id),
      topics: prev.topics.filter((t) => t.subjectId !== id),
      sessions: prev.sessions.filter((sess) => sess.subjectId !== id),
    }));
    addToast({
      type: 'warning',
      title: 'Subject deleted',
      description: target ? `${target.name} and related topics were removed.` : undefined,
    });
  };

  // TOPIC ACTIONS
  const addTopic = (topicInput: Omit<Topic, 'id'>): Topic => {
    const newTopic: Topic = {
      ...topicInput,
      id: `top-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    setData((prev) => ({
      ...prev,
      topics: [...prev.topics, newTopic],
    }));
    addToast({
      type: 'success',
      title: 'Topic added to syllabus',
      description: newTopic.title,
    });
    return newTopic;
  };

  const updateTopic = (id: string, updates: Partial<Topic>) => {
    setData((prev) => ({
      ...prev,
      topics: prev.topics.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  };

  const deleteTopic = (id: string) => {
    setData((prev) => ({
      ...prev,
      topics: prev.topics.filter((t) => t.id !== id),
      sessions: prev.sessions.map((s) => (s.topicId === id ? { ...s, topicId: undefined } : s)),
    }));
    addToast({
      type: 'info',
      title: 'Topic removed',
    });
  };

  const setTopicStatus = (id: string, status: TopicStatus) => {
    const topic = data.topics.find((t) => t.id === id);
    setData((prev) => ({
      ...prev,
      topics: prev.topics.map((t) =>
        t.id === id
          ? {
              ...t,
              status,
              lastStudiedAt: status === 'confident' || status === 'learning' ? new Date().toISOString() : t.lastStudiedAt,
            }
          : t
      ),
    }));

    const statusLabels: Record<TopicStatus, string> = {
      not_started: 'Not started',
      learning: 'Learning',
      needs_revision: 'Needs revision',
      confident: 'Confident',
    };

    addToast({
      type: 'success',
      title: 'Progress updated',
      description: topic ? `"${topic.title}" set to ${statusLabels[status]}.` : undefined,
    });
  };

  // SESSION ACTIONS
  const addSession = (sessionInput: Omit<StudySession, 'id'>): StudySession => {
    const newSession: StudySession = {
      ...sessionInput,
      id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    setData((prev) => ({
      ...prev,
      sessions: [...prev.sessions, newSession],
    }));
    addToast({
      type: 'success',
      title: 'Session scheduled',
      description: `${newSession.title} on ${newSession.date} at ${newSession.startTime}`,
    });
    return newSession;
  };

  const updateSession = (id: string, updates: Partial<StudySession>) => {
    setData((prev) => ({
      ...prev,
      sessions: prev.sessions.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
    addToast({
      type: 'info',
      title: 'Session updated',
    });
  };

  const deleteSession = (id: string) => {
    setData((prev) => ({
      ...prev,
      sessions: prev.sessions.filter((s) => s.id !== id),
    }));
    addToast({
      type: 'info',
      title: 'Session cancelled',
    });
  };

  const toggleSessionComplete = (id: string) => {
    const target = data.sessions.find((s) => s.id === id);
    if (!target) return;

    const willBeCompleted = !target.completed;
    setData((prev) => ({
      ...prev,
      sessions: prev.sessions.map((s) =>
        s.id === id
          ? {
              ...s,
              completed: willBeCompleted,
              completedAt: willBeCompleted ? new Date().toISOString() : undefined,
            }
          : s
      ),
    }));

    if (willBeCompleted) {
      addToast({
        type: 'success',
        title: 'Study session completed!',
        description: `Great focus on ${target.title}. Time recorded.`,
      });
    }
  };

  // FOCUS ACTIONS
  const recordFocusSession = (recordInput: Omit<FocusRecord, 'id' | 'completedAt'>) => {
    const record: FocusRecord = {
      ...recordInput,
      id: `foc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      completedAt: new Date().toISOString(),
    };

    setData((prev) => ({
      ...prev,
      focusRecords: [...prev.focusRecords, record],
    }));

    addToast({
      type: 'success',
      title: 'Focus session logged',
      description: `${record.durationMinutes} minutes dedicated to your preparation.`,
    });
  };

  // PROFILE / SETTINGS ACTIONS
  const updateProfile = (updates: Partial<UserProfile>) => {
    setData((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...updates },
    }));
    addToast({
      type: 'success',
      title: 'Settings saved',
    });
  };

  // ROUTINE COMMITMENT ACTIONS
  const addRoutineCommitment = (commitmentInput: Omit<RoutineCommitment, 'id'>) => {
    const newCommitment: RoutineCommitment = {
      ...commitmentInput,
      id: `comm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    setData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        routineCommitments: [...(prev.profile.routineCommitments || []), newCommitment],
      },
    }));
    addToast({
      type: 'success',
      title: 'Routine commitment added',
      description: `${newCommitment.name} (${newCommitment.startTime} - ${newCommitment.endTime})`,
    });
  };

  const updateRoutineCommitment = (id: string, updates: Partial<RoutineCommitment>) => {
    setData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        routineCommitments: (prev.profile.routineCommitments || []).map((c) =>
          c.id === id ? { ...c, ...updates } : c
        ),
      },
    }));
  };

  const deleteRoutineCommitment = (id: string) => {
    setData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        routineCommitments: (prev.profile.routineCommitments || []).filter((c) => c.id !== id),
      },
    }));
    addToast({
      type: 'info',
      title: 'Commitment removed',
    });
  };

  // GOALS ACTIONS
  const addGoal = (goalInput: Omit<PersonalGoal, 'id'>) => {
    const newGoal: PersonalGoal = {
      ...goalInput,
      id: `goal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    setData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        goals: [...(prev.profile.goals || []), newGoal],
      },
    }));
    addToast({
      type: 'success',
      title: 'Study target defined',
      description: newGoal.title,
    });
  };

  const updateGoal = (id: string, updates: Partial<PersonalGoal>) => {
    setData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        goals: (prev.profile.goals || []).map((g) => (g.id === id ? { ...g, ...updates } : g)),
      },
    }));
  };

  const deleteGoal = (id: string) => {
    setData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        goals: (prev.profile.goals || []).filter((g) => g.id !== id),
      },
    }));
    addToast({
      type: 'info',
      title: 'Goal removed',
    });
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    setData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        goals: (prev.profile.goals || []).map((g) => {
          if (g.id !== goalId) return g;
          const updatedMilestones = g.milestones.map((m) =>
            m.id === milestoneId ? { ...m, completed: !m.completed } : m
          );
          const allCompleted = updatedMilestones.length > 0 && updatedMilestones.every((m) => m.completed);
          return {
            ...g,
            milestones: updatedMilestones,
            completed: allCompleted,
          };
        }),
      },
    }));
  };

  // EXAM CHECKLIST ACTIONS
  const addChecklistItem = (itemInput: Omit<ExamDayChecklistItem, 'id'>) => {
    const newItem: ExamDayChecklistItem = {
      ...itemInput,
      id: `chk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    setData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        examChecklist: [...(prev.profile.examChecklist || []), newItem],
      },
    }));
  };

  const toggleChecklistItem = (id: string) => {
    setData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        examChecklist: (prev.profile.examChecklist || []).map((c) =>
          c.id === id ? { ...c, checked: !c.checked } : c
        ),
      },
    }));
  };

  const deleteChecklistItem = (id: string) => {
    setData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        examChecklist: (prev.profile.examChecklist || []).filter((c) => c.id !== id),
      },
    }));
  };

  // ADAPTIVE RESCHEDULING & RECOVERY
  const rescheduleSession = (id: string, newDate: string, newStartTime: string, newEndTime: string) => {
    const [startH, startM] = newStartTime.split(':').map(Number);
    const [endH, endM] = newEndTime.split(':').map(Number);
    const duration = endH * 60 + endM - (startH * 60 + startM);

    setData((prev) => ({
      ...prev,
      sessions: prev.sessions.map((s) =>
        s.id === id
          ? {
              ...s,
              date: newDate,
              startTime: newStartTime,
              endTime: newEndTime,
              durationMinutes: duration > 0 ? duration : s.durationMinutes,
              missed: false,
              rescheduledFrom: `${s.date} ${s.startTime}`,
            }
          : s
      ),
    }));

    addToast({
      type: 'success',
      title: 'Session rescheduled',
      description: `Moved to ${newDate} at ${newStartTime} without guilt.`,
    });
  };

  const splitSession = (
    id: string,
    part1Minutes: number,
    part2Minutes: number,
    date2: string,
    start2: string,
    end2: string
  ) => {
    const target = data.sessions.find((s) => s.id === id);
    if (!target) return;

    const [startH, startM] = target.startTime.split(':').map(Number);
    const newEndMin = startH * 60 + startM + part1Minutes;
    const newEndTime = `${Math.floor(newEndMin / 60)
      .toString()
      .padStart(2, '0')}:${(newEndMin % 60).toString().padStart(2, '0')}`;

    const part2Session: StudySession = {
      id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      subjectId: target.subjectId,
      title: `${target.title} (Part 2)`,
      date: date2,
      startTime: start2,
      endTime: end2,
      durationMinutes: part2Minutes,
      completed: false,
      topicId: target.topicId,
      rescheduledFrom: `${target.date} (Split)`,
    };

    setData((prev) => ({
      ...prev,
      sessions: [
        ...prev.sessions.map((s) =>
          s.id === id
            ? {
                ...s,
                title: `${target.title} (Part 1)`,
                endTime: newEndTime,
                durationMinutes: part1Minutes,
                missed: false,
              }
            : s
        ),
        part2Session,
      ],
    }));

    addToast({
      type: 'info',
      title: 'Session split into two manageable blocks',
      description: `Part 1 (${part1Minutes}m) today, Part 2 (${part2Minutes}m) on ${date2}.`,
    });
  };

  const markSessionMissed = (id: string) => {
    setData((prev) => ({
      ...prev,
      sessions: prev.sessions.map((s) => (s.id === id ? { ...s, missed: true } : s)),
    }));
  };

  const applySuggestedPlan = (options?: { replaceExisting?: boolean }) => {
    const suggested = generateSuggestedWeeklyPlan(
      data.subjects,
      data.topics,
      data.profile.routineCommitments,
      new Date(),
      7,
      data.profile.preferences,
      data.sessions.filter((s) => s.completed)
    );

    if (suggested.length === 0) {
      addToast({
        type: 'warning',
        title: 'No plan could be generated',
        description: 'Add at least one upcoming subject to generate a weekly plan.',
      });
      return;
    }

    setData((prev) => {
      // If replaceExisting: preserve completed sessions and user custom sessions
      const preserved = options?.replaceExisting
        ? prev.sessions.filter((s) => s.completed || !s.isAutoGenerated)
        : prev.sessions;

      return {
        ...prev,
        sessions: [...preserved, ...suggested],
        profile: {
          ...prev.profile,
          planExplanation: suggested.explanation || prev.profile.planExplanation,
        },
      };
    });

    addToast({
      type: 'success',
      title: 'Weekly plan generated',
      description: `Added ${suggested.length} structured revision sessions across the week.`,
    });
  };

  const resetAllData = (useSample: boolean) => {
    const fresh = resetAppData(useSample);
    setData(fresh);
    addToast({
      type: 'info',
      title: useSample ? 'Reset to sample data' : 'Cleared all data',
      description: useSample ? 'Restored realistic university courses and schedule.' : 'Clean slate ready for your own syllabus.',
    });
  };

  const exportData = (): string => {
    return exportAppDataJson(data);
  };

  const importData = (jsonStr: string) => {
    const result = importAppDataJson(jsonStr);
    if (result.success && result.data) {
      setData(result.data);
      addToast({
        type: 'success',
        title: 'Data imported successfully',
        description: `Loaded ${result.data.subjects.length} subjects and ${result.data.sessions.length} sessions.`,
      });
      return { success: true };
    } else {
      addToast({
        type: 'error',
        title: 'Import failed',
        description: result.error || 'Invalid file format.',
      });
      return { success: false, error: result.error };
    }
  };

  return (
    <PlannerContext.Provider
      value={{
        data,
        isLoaded,
        activeView,
        setActiveView,
        toasts,
        addToast,
        removeToast,
        isOnboardingOpen,
        setIsOnboardingOpen,
        theme: data.profile.theme,
        setTheme,
        addSubject,
        updateSubject,
        deleteSubject,
        addTopic,
        updateTopic,
        deleteTopic,
        setTopicStatus,
        addSession,
        updateSession,
        deleteSession,
        toggleSessionComplete,
        recordFocusSession,
        addRoutineCommitment,
        updateRoutineCommitment,
        deleteRoutineCommitment,
        addGoal,
        updateGoal,
        deleteGoal,
        toggleMilestone,
        addChecklistItem,
        toggleChecklistItem,
        deleteChecklistItem,
        rescheduleSession,
        splitSession,
        markSessionMissed,
        updateProfile,
        applySuggestedPlan,
        resetAllData,
        exportData,
        importData,
      }}
    >
      {children}
    </PlannerContext.Provider>
  );
}

export function usePlanner() {
  const context = useContext(PlannerContext);
  if (!context) {
    throw new Error('usePlanner must be used within a PlannerProvider');
  }
  return context;
}
