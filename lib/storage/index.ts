import { AppData, UserProfile } from '@/types';
import { generateSampleData } from './sample-data';

const STORAGE_KEY = 'semester_planner_data_v1';
const CURRENT_SCHEMA_VERSION = 1;

export interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Default empty data template for fresh setup
 */
export function createDefaultEmptyData(): AppData {
  return {
    version: CURRENT_SCHEMA_VERSION,
    profile: {
      displayName: 'Student',
      semesterName: 'Spring 2026 Examination Series',
      dailyAvailabilityHours: 3,
      theme: 'system',
      onboarded: false,
      isSampleData: false,
      createdAt: new Date().toISOString(),
    },
    subjects: [],
    topics: [],
    sessions: [],
    focusRecords: [],
    availability: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', preferredHours: 3 },
      { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', preferredHours: 3 },
      { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', preferredHours: 3 },
      { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', preferredHours: 3 },
      { dayOfWeek: 5, startTime: '09:00', endTime: '18:00', preferredHours: 3 },
      { dayOfWeek: 6, startTime: '10:00', endTime: '16:00', preferredHours: 2 },
      { dayOfWeek: 0, startTime: '10:00', endTime: '15:00', preferredHours: 2 },
    ],
  };
}

/**
 * Loads data from localStorage safely.
 * Returns sample data if first run and no data exists.
 * Gracefully recovers from corrupted JSON.
 */
export function loadAppData(): AppData {
  if (typeof window === 'undefined') {
    return generateSampleData();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First visit: initialize with realistic sample data so demo is immediate!
      const initial = generateSampleData();
      saveAppData(initial);
      return initial;
    }

    const parsed = JSON.parse(raw);

    // Schema version check & migration safety
    if (!parsed || typeof parsed !== 'object') {
      console.warn('[SEMESTER Storage] Invalid object format. Resetting to safe defaults.');
      const fallback = generateSampleData();
      saveAppData(fallback);
      return fallback;
    }

    // Ensure essential arrays exist
    const sanitized: AppData = {
      version: parsed.version || CURRENT_SCHEMA_VERSION,
      profile: {
        displayName: parsed.profile?.displayName || 'Student',
        semesterName: parsed.profile?.semesterName || 'Semester Examination Series',
        targetExamPeriod: parsed.profile?.targetExamPeriod,
        dailyAvailabilityHours: Number(parsed.profile?.dailyAvailabilityHours) || 3,
        theme: parsed.profile?.theme || 'system',
        onboarded: Boolean(parsed.profile?.onboarded),
        isSampleData: Boolean(parsed.profile?.isSampleData),
        createdAt: parsed.profile?.createdAt || new Date().toISOString(),
      },
      subjects: Array.isArray(parsed.subjects) ? parsed.subjects : [],
      topics: Array.isArray(parsed.topics) ? parsed.topics : [],
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      focusRecords: Array.isArray(parsed.focusRecords) ? parsed.focusRecords : [],
      availability: Array.isArray(parsed.availability) && parsed.availability.length > 0
        ? parsed.availability
        : createDefaultEmptyData().availability,
      lastExportedAt: parsed.lastExportedAt,
    };

    return sanitized;
  } catch (err) {
    console.error('[SEMESTER Storage] Failed to load data from localStorage:', err);
    // Graceful recovery: return default sample data
    return generateSampleData();
  }
}

/**
 * Persists app data to localStorage
 */
export function saveAppData(data: AppData): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const payload = JSON.stringify(data);
    window.localStorage.setItem(STORAGE_KEY, payload);
    return true;
  } catch (err) {
    console.error('[SEMESTER Storage] Failed to write to localStorage (storage quota or restricted environment):', err);
    return false;
  }
}

/**
 * Resets local data to clean empty state or fresh sample data
 */
export function resetAppData(useSampleData: boolean = true): AppData {
  const fresh = useSampleData ? generateSampleData() : createDefaultEmptyData();
  saveAppData(fresh);
  return fresh;
}

/**
 * Export data to JSON string for backup
 */
export function exportAppDataJson(data: AppData): string {
  const exportPayload: AppData = {
    ...data,
    lastExportedAt: new Date().toISOString(),
  };
  return JSON.stringify(exportPayload, null, 2);
}

/**
 * Validates and imports JSON data string
 */
export function importAppDataJson(jsonString: string): StorageResult<AppData> {
  try {
    if (!jsonString || typeof jsonString !== 'string') {
      return { success: false, error: 'Empty or invalid file content.' };
    }

    const parsed = JSON.parse(jsonString);

    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'Data is not a valid JSON object.' };
    }

    // Validate version
    if (typeof parsed.version !== 'number') {
      return { success: false, error: 'Missing or invalid schema version.' };
    }

    // Validate basic structure
    if (!Array.isArray(parsed.subjects)) {
      return { success: false, error: 'Invalid format: "subjects" must be a list.' };
    }
    if (!Array.isArray(parsed.topics)) {
      return { success: false, error: 'Invalid format: "topics" must be a list.' };
    }
    if (!Array.isArray(parsed.sessions)) {
      return { success: false, error: 'Invalid format: "sessions" must be a list.' };
    }

    const validated: AppData = {
      version: parsed.version,
      profile: {
        displayName: String(parsed.profile?.displayName || 'Student').slice(0, 50),
        semesterName: String(parsed.profile?.semesterName || 'Exam Series').slice(0, 100),
        targetExamPeriod: parsed.profile?.targetExamPeriod ? String(parsed.profile.targetExamPeriod).slice(0, 50) : undefined,
        dailyAvailabilityHours: Math.min(12, Math.max(1, Number(parsed.profile?.dailyAvailabilityHours) || 3)),
        theme: ['light', 'dark', 'system'].includes(parsed.profile?.theme) ? parsed.profile.theme : 'system',
        onboarded: Boolean(parsed.profile?.onboarded),
        isSampleData: false, // Imported user data is not sample
        createdAt: parsed.profile?.createdAt || new Date().toISOString(),
      },
      subjects: parsed.subjects.map((s: any) => ({
        id: String(s.id || `subj-${Math.random().toString(36).substring(2, 9)}`),
        name: String(s.name || 'Untitled Subject').slice(0, 80),
        code: String(s.code || '').slice(0, 20),
        examDate: String(s.examDate || '').slice(0, 10),
        examTime: s.examTime ? String(s.examTime).slice(0, 5) : undefined,
        examLocation: s.examLocation ? String(s.examLocation).slice(0, 100) : undefined,
        confidence: ['low', 'medium', 'high'].includes(s.confidence) ? s.confidence : 'medium',
        color: String(s.color || '#2D5541'),
        targetGrade: s.targetGrade ? String(s.targetGrade).slice(0, 10) : undefined,
        notes: s.notes ? String(s.notes).slice(0, 500) : undefined,
        createdAt: s.createdAt || new Date().toISOString(),
      })),
      topics: parsed.topics.map((t: any) => ({
        id: String(t.id || `top-${Math.random().toString(36).substring(2, 9)}`),
        subjectId: String(t.subjectId || ''),
        title: String(t.title || 'Untitled Topic').slice(0, 120),
        unitOrModule: t.unitOrModule ? String(t.unitOrModule).slice(0, 80) : undefined,
        status: ['not_started', 'learning', 'needs_revision', 'confident'].includes(t.status) ? t.status : 'not_started',
        notes: t.notes ? String(t.notes).slice(0, 500) : undefined,
        lastStudiedAt: t.lastStudiedAt ? String(t.lastStudiedAt) : undefined,
      })),
      sessions: parsed.sessions.map((sess: any) => ({
        id: String(sess.id || `sess-${Math.random().toString(36).substring(2, 9)}`),
        subjectId: String(sess.subjectId || ''),
        title: String(sess.title || 'Study Session').slice(0, 120),
        date: String(sess.date || '').slice(0, 10),
        startTime: String(sess.startTime || '09:00').slice(0, 5),
        endTime: String(sess.endTime || '10:00').slice(0, 5),
        durationMinutes: Number(sess.durationMinutes) || 60,
        completed: Boolean(sess.completed),
        completedAt: sess.completedAt ? String(sess.completedAt) : undefined,
        notes: sess.notes ? String(sess.notes).slice(0, 500) : undefined,
        topicId: sess.topicId ? String(sess.topicId) : undefined,
      })),
      focusRecords: Array.isArray(parsed.focusRecords)
        ? parsed.focusRecords.map((f: any) => ({
            id: String(f.id || `foc-${Math.random().toString(36).substring(2, 9)}`),
            subjectId: f.subjectId ? String(f.subjectId) : undefined,
            topicId: f.topicId ? String(f.topicId) : undefined,
            durationMinutes: Number(f.durationMinutes) || 25,
            mode: ['focus', 'short_break', 'long_break'].includes(f.mode) ? f.mode : 'focus',
            completedAt: f.completedAt || new Date().toISOString(),
            notes: f.notes ? String(f.notes).slice(0, 200) : undefined,
          }))
        : [],
      availability: Array.isArray(parsed.availability) && parsed.availability.length > 0
        ? parsed.availability
        : createDefaultEmptyData().availability,
    };

    saveAppData(validated);
    return { success: true, data: validated };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to parse JSON file.' };
  }
}
