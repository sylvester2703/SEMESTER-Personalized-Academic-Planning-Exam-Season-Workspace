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
  SyllabusUnit,
} from '@/types';
import {
  loadAppData,
  saveAppData,
  resetAppData,
  exportAppDataJson,
  importAppDataJson,
  createDefaultEmptyData,
  loadSamplePlanData,
} from '@/lib/storage';
import { generateSuggestedWeeklyPlan } from '@/lib/scheduling';
import { formatTime12Hour, formatTimeRange } from '@/lib/dates';
import {
  supabase,
  syncWorkspaceToSupabase,
  fetchUserWorkspaceFromSupabase,
  signOutUser,
} from '@/lib/supabase/service';

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
  isRescueModalOpen: boolean;
  setIsRescueModalOpen: (open: boolean) => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  loadSamplePlan: () => void;
  leaveSamplePlan: () => void;

  // Subject Actions
  addSubject: (subject: Omit<Subject, 'id' | 'createdAt'>) => Subject;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  // Syllabus & Unit Actions
  importSyllabusForSubject: (
    subjectId: string,
    units: SyllabusUnit[],
    topics: Omit<Topic, 'id'>[],
    originalText?: string,
    source?: 'manual' | 'pasted' | 'uploaded' | 'sample',
    replaceExisting?: boolean
  ) => void;
  addUnit: (subjectId: string, unit: Omit<SyllabusUnit, 'id' | 'subjectId'>) => SyllabusUnit;
  updateUnit: (subjectId: string, unitId: string, updates: Partial<SyllabusUnit>) => void;
  deleteUnit: (subjectId: string, unitId: string, deleteTopics?: boolean) => void;
  applyProvisionalEstimates: (subjectId: string, defaultMinutes?: number) => void;

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

  // Supabase Auth & Cloud Sync
  currentUser: any | null;
  userName: string;
  updateUserName: (newName: string) => Promise<boolean>;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  syncToCloud: () => Promise<boolean>;
  restoreFromCloud: () => Promise<boolean>;
  signOut: () => Promise<void>;
}

const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => createDefaultEmptyData());
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeView, _setActiveView] = useState<ActiveView>('landing');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isRescueModalOpen, setIsRescueModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');

  // Gated setActiveView: features are strictly accessible after logging in
  const setActiveView = (view: ActiveView) => {
    if (!currentUser && view !== 'landing') {
      setIsAuthModalOpen(true);
      addToast({
        type: 'info',
        title: 'Sign In Required',
        description: 'Please sign in or create an account to access the study planner and all features.',
      });
      return;
    }
    _setActiveView(view);
  };

  // Derive active username: user display name -> Supabase metadata -> email prefix -> Student
  const userName =
    data.profile.displayName && data.profile.displayName.trim() !== '' && data.profile.displayName !== 'Student'
      ? data.profile.displayName.trim()
      : (currentUser?.user_metadata?.full_name?.trim() ||
         currentUser?.user_metadata?.display_name?.trim() ||
         currentUser?.user_metadata?.name?.trim() ||
         (data.profile.displayName && data.profile.displayName.trim() !== '' ? data.profile.displayName.trim() : '') ||
         (currentUser?.email ? currentUser.email.split('@')[0] : 'Student'));

  // Hydration & Theme initialization
  useEffect(() => {
    const loaded = loadAppData();
    setData(loaded);
    setIsLoaded(true);

    // Apply theme
    applyThemeClass(loaded.profile.theme);

    // Clean any legacy persistent auth tokens from localStorage so sessions are strictly browser-session only
    if (typeof window !== 'undefined') {
      try {
        const toDelete: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
            toDelete.push(key);
          }
        }
        toDelete.forEach((k) => localStorage.removeItem(k));
      } catch {
        // Ignore
      }
    }

    // Listen to Supabase Auth state safely with error shielding
    let authListener: { subscription?: { unsubscribe: () => void } } | undefined;
    try {
      supabase.auth
        .getUser()
        .then(({ data: authData, error }) => {
          if (!error && authData?.user) {
            setCurrentUser(authData.user);
            const metaName = authData.user.user_metadata?.full_name || authData.user.user_metadata?.display_name || authData.user.user_metadata?.name;
            if (metaName) {
              setData((prev) => {
                if (prev.profile.displayName && prev.profile.displayName !== 'Student') return prev;
                return {
                  ...prev,
                  profile: { ...prev.profile, displayName: metaName },
                };
              });
            }
          }
        })
        .catch((err) => {
          console.warn('[SEMESTER Auth] Supabase session check skipped or offline:', err);
        });

      const res = supabase.auth.onAuthStateChange((_event, session) => {
        const u = session?.user || null;
        setCurrentUser(u);
        if (u) {
          const metaName = u.user_metadata?.full_name || u.user_metadata?.display_name || u.user_metadata?.name;
          if (metaName) {
            setData((prev) => {
              if (prev.profile.displayName && prev.profile.displayName !== 'Student') return prev;
              return {
                ...prev,
                profile: { ...prev.profile, displayName: metaName },
              };
            });
          }
        }
      });
      authListener = res?.data;
    } catch (authInitErr) {
      console.warn('[SEMESTER Auth] Auth listener initialization error:', authInitErr);
    }

    return () => {
      try {
        authListener?.subscription?.unsubscribe?.();
      } catch (cleanupErr) {
        console.warn('[SEMESTER Auth] Cleanup error:', cleanupErr);
      }
    };
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

  // SYLLABUS & UNIT ACTIONS
  const importSyllabusForSubject = (
    subjectId: string,
    units: SyllabusUnit[],
    newTopics: Omit<Topic, 'id'>[],
    originalText?: string,
    source?: 'manual' | 'pasted' | 'uploaded' | 'sample',
    replaceExisting = false
  ) => {
    const mappedTopics: Topic[] = newTopics.map((t, idx) => ({
      ...t,
      id: `top-${subjectId}-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
    }));

    setData((prev) => {
      const updatedSubjects = prev.subjects.map((s) => {
        if (s.id === subjectId) {
          return {
            ...s,
            units,
            originalSyllabusText: originalText || s.originalSyllabusText,
            syllabusSource: source || s.syllabusSource || 'manual',
          };
        }
        return s;
      });

      let updatedTopics: Topic[] = [];
      if (replaceExisting) {
        const completedSessionTopicIds = new Set(
          prev.sessions.filter((sess) => sess.completed && sess.topicId).map((sess) => sess.topicId!)
        );
        const keptExisting = prev.topics.filter(
          (t) => t.subjectId !== subjectId || completedSessionTopicIds.has(t.id)
        );
        updatedTopics = [...keptExisting, ...mappedTopics];
      } else {
        const existingTitles = new Set(
          prev.topics.filter((t) => t.subjectId === subjectId).map((t) => t.title.toLowerCase())
        );
        const deduplicatedNew = mappedTopics.filter((t) => !existingTitles.has(t.title.toLowerCase()));
        updatedTopics = [...prev.topics, ...deduplicatedNew];
      }

      return {
        ...prev,
        subjects: updatedSubjects,
        topics: updatedTopics,
      };
    });

    addToast({
      type: 'success',
      title: 'Syllabus Updated',
      description: `Loaded ${units.length} unit(s) and ${newTopics.length} topic(s).`,
    });
  };

  const addUnit = (subjectId: string, unitInput: Omit<SyllabusUnit, 'id' | 'subjectId'>): SyllabusUnit => {
    const newUnit: SyllabusUnit = {
      ...unitInput,
      id: `unit-${subjectId}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      subjectId,
    };

    setData((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) => {
        if (s.id === subjectId) {
          const existingUnits = s.units || [];
          return {
            ...s,
            units: [...existingUnits, newUnit],
          };
        }
        return s;
      }),
    }));

    addToast({
      type: 'success',
      title: 'Unit Added',
      description: newUnit.title,
    });

    return newUnit;
  };

  const updateUnit = (subjectId: string, unitId: string, updates: Partial<SyllabusUnit>) => {
    setData((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) => {
        if (s.id === subjectId && s.units) {
          return {
            ...s,
            units: s.units.map((u) => (u.id === unitId ? { ...u, ...updates } : u)),
          };
        }
        return s;
      }),
      topics: prev.topics.map((t) => {
        if (t.subjectId === subjectId && t.unitId === unitId) {
          const unitTitle = updates.title || t.unitOrModule;
          const unitNum = updates.unitNumber || '';
          return {
            ...t,
            unitOrModule: unitNum ? `${unitNum}: ${unitTitle}` : unitTitle,
          };
        }
        return t;
      }),
    }));
  };

  const deleteUnit = (subjectId: string, unitId: string, deleteTopics = false) => {
    setData((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) => {
        if (s.id === subjectId && s.units) {
          return {
            ...s,
            units: s.units.filter((u) => u.id !== unitId),
          };
        }
        return s;
      }),
      topics: deleteTopics
        ? prev.topics.filter((t) => !(t.subjectId === subjectId && t.unitId === unitId))
        : prev.topics.map((t) =>
            t.subjectId === subjectId && t.unitId === unitId
              ? { ...t, unitId: undefined, unitOrModule: 'General' }
              : t
          ),
    }));

    addToast({
      type: 'info',
      title: 'Unit deleted',
    });
  };

  const applyProvisionalEstimates = (subjectId: string, defaultMinutes = 45) => {
    setData((prev) => ({
      ...prev,
      topics: prev.topics.map((t) => {
        if (t.subjectId === subjectId && (!t.estimatedMinutes || t.estimatedMinutes === 0)) {
          return {
            ...t,
            estimatedMinutes: defaultMinutes,
            isProvisionalEstimate: true,
          };
        }
        return t;
      }),
    }));

    addToast({
      type: 'success',
      title: 'Provisional estimates applied',
      description: `Assigned provisional ${defaultMinutes}m estimates to unestimated topics.`,
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
      description: `${newSession.title} on ${newSession.date} at ${formatTime12Hour(newSession.startTime)}`,
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
      description: `${newCommitment.name} (${formatTimeRange(newCommitment.startTime, newCommitment.endTime)})`,
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

  const loadSamplePlan = () => {
    const sample = loadSamplePlanData();
    setData(sample);
    setActiveView('dashboard');
    addToast({
      type: 'info',
      title: 'Sample Demonstration Active',
      description: 'Viewing sample university courses and timetable. You can leave demo mode at any time.',
    });
  };

  const leaveSamplePlan = () => {
    const empty = createDefaultEmptyData();
    saveAppData(empty);
    setData(empty);
    setActiveView('dashboard');
    setIsOnboardingOpen(true);
    addToast({
      type: 'info',
      title: 'Sample Mode Exited',
      description: 'Welcome to your personal workspace. Let\'s build your actual study plan.',
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
        isRescueModalOpen,
        setIsRescueModalOpen,
        theme: data.profile.theme,
        setTheme,
        loadSamplePlan,
        leaveSamplePlan,
        addSubject,
        updateSubject,
        deleteSubject,
        importSyllabusForSubject,
        addUnit,
        updateUnit,
        deleteUnit,
        applyProvisionalEstimates,
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
        currentUser,
        userName,
        updateUserName: async (newName: string): Promise<boolean> => {
          const trimmed = newName.trim();
          if (!trimmed) {
            addToast({
              type: 'error',
              title: 'Invalid Name',
              description: 'User name cannot be blank.',
            });
            return false;
          }

          setData((prev) => ({
            ...prev,
            profile: {
              ...prev.profile,
              displayName: trimmed,
            },
          }));

          if (currentUser) {
            try {
              await supabase.auth.updateUser({
                data: {
                  full_name: trimmed,
                  display_name: trimmed,
                  name: trimmed,
                },
              });
              setCurrentUser((prev: any) =>
                prev
                  ? {
                      ...prev,
                      user_metadata: {
                        ...prev.user_metadata,
                        full_name: trimmed,
                        display_name: trimmed,
                        name: trimmed,
                      },
                    }
                  : prev
              );
            } catch (err) {
              console.warn('[SEMESTER] Supabase user metadata update notice:', err);
            }
          }

          addToast({
            type: 'success',
            title: 'User Name Saved',
            description: `Your display name has been set to "${trimmed}".`,
          });

          return true;
        },
        syncStatus,
        isAuthModalOpen,
        setIsAuthModalOpen,
        syncToCloud: async () => {
          if (!currentUser) {
            setIsAuthModalOpen(true);
            return false;
          }
          setSyncStatus('syncing');
          const res = await syncWorkspaceToSupabase(data);
          if (res.success) {
            setSyncStatus('synced');
            addToast({
              type: 'success',
              title: 'Workspace backed up',
              description: 'Your subjects, timetable, and syllabus are securely synced to Supabase.',
            });
            return true;
          } else {
            setSyncStatus('idle');
            if (res.error?.includes('local storage') || res.error?.includes('not yet created') || res.error?.includes('not initialized')) {
              addToast({
                type: 'info',
                title: 'Saved in Local Storage',
                description: 'Your study plan is safely stored in local browser storage.',
              });
            } else {
              addToast({
                type: 'error',
                title: 'Sync notification',
                description: res.error || 'Unable to sync to cloud.',
              });
            }
            return false;
          }
        },
        restoreFromCloud: async () => {
          setSyncStatus('syncing');
          const res = await fetchUserWorkspaceFromSupabase();
          if (res.success && res.data) {
            setData(res.data);
            saveAppData(res.data);
            setSyncStatus('synced');
            addToast({
              type: 'success',
              title: 'Restored from cloud',
              description: `Loaded ${res.data.subjects.length} subjects from your Supabase account.`,
            });
            return true;
          } else {
            setSyncStatus('idle');
            return false;
          }
        },
        signOut: async () => {
          await signOutUser();
          try {
            if (typeof window !== 'undefined') {
              window.sessionStorage.clear();
            }
          } catch {}
          setCurrentUser(null);
          setSyncStatus('idle');
          _setActiveView('landing');
          addToast({
            type: 'info',
            title: 'Signed Out',
            description: 'You have been logged out. Sign in anytime to access your planner.',
          });
        },
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
