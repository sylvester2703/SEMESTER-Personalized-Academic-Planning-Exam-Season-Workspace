export type ConfidenceLevel = 'low' | 'medium' | 'high';

export type TopicStatus = 'not_started' | 'learning' | 'needs_revision' | 'confident';

export type FocusModeType = 'focus' | 'short_break' | 'long_break';

export interface Subject {
  id: string;
  name: string;
  code: string;
  examDate: string; // YYYY-MM-DD
  examTime?: string; // HH:mm (24-hour)
  examLocation?: string;
  confidence: ConfidenceLevel;
  color: string; // Accent color token/hex
  targetGrade?: string;
  notes?: string;
  createdAt: string;
}

export interface Topic {
  id: string;
  subjectId: string;
  title: string;
  unitOrModule?: string;
  status: TopicStatus;
  notes?: string;
  lastStudiedAt?: string;
}

export interface StudySession {
  id: string;
  subjectId: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number;
  completed: boolean;
  completedAt?: string;
  notes?: string;
  topicId?: string;
}

export interface FocusRecord {
  id: string;
  subjectId?: string;
  topicId?: string;
  sessionId?: string;
  durationMinutes: number;
  mode: FocusModeType;
  completedAt: string; // ISO string
  notes?: string;
}

export interface AvailabilitySlot {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  preferredHours: number;
}

export interface UserProfile {
  displayName: string;
  semesterName: string;
  targetExamPeriod?: string;
  dailyAvailabilityHours: number;
  theme: 'light' | 'dark' | 'system';
  onboarded: boolean;
  isSampleData: boolean;
  createdAt: string;
}

export interface AppData {
  version: number;
  profile: UserProfile;
  subjects: Subject[];
  topics: Topic[];
  sessions: StudySession[];
  focusRecords: FocusRecord[];
  availability: AvailabilitySlot[];
  lastExportedAt?: string;
}

export interface CountdownResult {
  nextExam: Subject | null;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isToday: boolean;
  isPassed: boolean;
  formattedTarget: string;
  reassuringMessage: string;
}

export interface ReadinessScore {
  totalTopics: number;
  confidentCount: number;
  learningCount: number;
  needsRevisionCount: number;
  notStartedCount: number;
  percentage: number; // Transparent: confident / total * 100
  needsAttentionCount: number; // not_started + needs_revision
}

export interface SmartRecommendation {
  id: string;
  type: 'urgent_exam' | 'revise_topic' | 'session_today' | 'schedule_gap' | 'all_clear' | 'take_break';
  title: string;
  explanation: string;
  actionLabel: string;
  actionView: 'dashboard' | 'timetable' | 'readiness' | 'focus' | 'exams' | 'weekly-review' | 'settings';
  targetSubjectId?: string;
  targetTopicId?: string;
  targetSessionId?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface WeeklyReviewMetrics {
  weekStart: string; // YYYY-MM-DD
  weekEnd: string; // YYYY-MM-DD
  plannedSessionsCount: number;
  completedSessionsCount: number;
  completionRate: number;
  focusMinutesTotal: number;
  focusHoursFormatted: string;
  missedPendingCount: number;
  subjectBreakdown: {
    subjectId: string;
    subjectName: string;
    subjectCode: string;
    color: string;
    plannedMinutes: number;
    completedMinutes: number;
    completedSessions: number;
    topicsCovered: number;
  }[];
}
