import { createClient } from '@/utils/supabase/client';
import { AppData, Subject, Topic, StudySession, RoutineCommitment, FocusRecord, UserProfile } from '@/types';

export const supabase = createClient();

/**
 * Auth operations
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  fullName?: string,
  phone?: string
) {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || 'Student',
        phone: phone || '',
        whatsapp_notifications: Boolean(phone),
      },
    },
  });
}

export async function signInWithEmail(email: string, password: string) {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signOutUser() {
  return await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function resetPasswordForEmail(email: string) {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback?next=/settings` : undefined,
  });
}

/**
 * Fetch complete student workspace from Supabase for the authenticated user
 */
export async function fetchUserWorkspaceFromSupabase(): Promise<{ success: boolean; data?: AppData; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // 1. Fetch profile
    const { data: profileRow, error: profErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profErr && (profErr.code === 'PGRST205' || profErr.message?.includes('schema cache'))) {
      console.warn('[Supabase Service] Database tables not yet migrated in Supabase. Falling back to local storage.');
      return {
        success: false,
        error: 'Database tables not yet created in Supabase. Your study planner is currently running safely in local storage.',
      };
    }

    // 2. Fetch subjects
    const { data: subjectRows, error: subjErr } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', user.id);

    if (subjErr) {
      if (subjErr.code === 'PGRST205' || subjErr.message?.includes('schema cache')) {
        return {
          success: false,
          error: 'Database tables not yet created in Supabase. Your study planner is running safely in local storage.',
        };
      }
      throw subjErr;
    }

    // 3. Fetch topics
    const { data: topicRows, error: topErr } = await supabase
      .from('topics')
      .select('*')
      .eq('user_id', user.id);

    if (topErr && topErr.code !== 'PGRST205') throw topErr;

    // 4. Fetch study sessions
    const { data: sessionRows, error: sessErr } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', user.id);

    if (sessErr && sessErr.code !== 'PGRST205') throw sessErr;

    // 5. Fetch routine commitments
    const { data: routineRows, error: routErr } = await supabase
      .from('routine_commitments')
      .select('*')
      .eq('user_id', user.id);

    if (routErr && routErr.code !== 'PGRST205') throw routErr;

    // 6. Fetch focus records
    const { data: focusRows } = await supabase
      .from('focus_records')
      .select('*')
      .eq('user_id', user.id);

    // Map database rows to AppData model
    const subjects: Subject[] = (subjectRows || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      code: s.code || '',
      examDate: s.exam_date,
      examTime: s.exam_time || '09:00',
      difficulty: s.difficulty,
      prepLevel: s.prep_level,
      priority: s.priority,
      confidence: s.confidence,
      color: s.color || '#2D5541',
      notes: s.notes || undefined,
      createdAt: s.created_at,
    }));

    const topics: Topic[] = (topicRows || []).map((t: any) => ({
      id: t.id,
      subjectId: t.subject_id,
      unitId: t.unit_id || undefined,
      title: t.title,
      status: t.status,
      estimatedDurationMinutes: t.estimated_duration_minutes || 45,
      actualDurationMinutes: t.actual_duration_minutes || 0,
      difficulty: t.difficulty || 'moderate',
      confidence: t.confidence || 'medium',
      notes: t.notes || '',
      lastStudiedAt: t.last_studied_at || undefined,
    }));

    const sessions: StudySession[] = (sessionRows || []).map((sess: any) => ({
      id: sess.id,
      subjectId: sess.subject_id,
      topicId: sess.topic_id || undefined,
      title: sess.title,
      date: sess.session_date,
      startTime: sess.start_time,
      endTime: sess.end_time,
      durationMinutes: sess.duration_minutes,
      completed: sess.completed,
      completedAt: sess.completed_at || undefined,
      notes: sess.notes || undefined,
    }));

    const routineCommitments: RoutineCommitment[] = (routineRows || []).map((r: any) => ({
      id: r.id,
      name: r.name,
      category: r.category,
      daysOfWeek: r.days_of_week || [1, 2, 3, 4, 5],
      startTime: r.start_time,
      endTime: r.end_time,
      isFixed: r.is_fixed,
      notes: r.notes || undefined,
    }));

    const focusRecords: FocusRecord[] = (focusRows || []).map((f: any) => ({
      id: f.id,
      subjectId: f.subject_id,
      topicId: f.topic_id || undefined,
      durationMinutes: f.duration_minutes,
      mode: (f.mode as any) || 'focus',
      completedAt: f.completed_at,
      notes: f.notes || undefined,
    }));

    const profile: UserProfile = {
      displayName: profileRow?.display_name || user.email?.split('@')[0] || 'Student',
      semesterName: profileRow?.semester_name || 'Semester Final Examinations',
      academicYearOrLevel: profileRow?.academic_year || 'Undergraduate',
      primaryGoalDescription: profileRow?.primary_goal || 'Complete syllabus with steady daily revision',
      theme: profileRow?.theme || 'system',
      onboarded: Boolean(profileRow?.onboarded),
      isSampleData: false,
      routineCommitments,
      preferences: {
        dailyAvailabilityHours: Number(profileRow?.daily_availability_hours) || 3.5,
        preferredSessionDuration: (profileRow?.preferred_session_duration as any) || 45,
        sessionPacing: (profileRow?.session_pacing as any) || 'short_frequent',
        preferredTimeOfDay: (profileRow?.preferred_time_of_day as any) || 'evening',
        breakFrequencyMinutes: profileRow?.break_frequency_minutes || 45,
        prioritizationStrategy: (profileRow?.prioritization_strategy as any) || 'nearest_exam',
        lighterDays: [0],
      },
      goals: [],
      examChecklist: [],
      planExplanation: profileRow?.plan_explanation || undefined,
      email: user.email || profileRow?.email || undefined,
      phone: (user.user_metadata as any)?.phone || profileRow?.phone || undefined,
      emailScheduleUpdates: true,
      whatsappScheduleUpdates: Boolean((user.user_metadata as any)?.phone || profileRow?.phone),
      createdAt: profileRow?.created_at || new Date().toISOString(),
    };

    const appData: AppData = {
      version: 4,
      profile,
      subjects,
      topics,
      sessions,
      focusRecords,
    };

    return { success: true, data: appData };
  } catch (err: any) {
    console.error('[Supabase Service] Failed to fetch workspace:', err);
    return { success: false, error: err.message || 'Failed to fetch from cloud' };
  }
}

/**
 * Synchronize local AppData workspace into Supabase for the authenticated user
 */
export async function syncWorkspaceToSupabase(data: AppData): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Please sign in to sync with Supabase cloud.' };
    }

    // 1. Upsert Profile
    const { error: profErr } = await supabase.from('profiles').upsert({
      id: user.id,
      display_name: data.profile.displayName,
      semester_name: data.profile.semesterName,
      academic_year: data.profile.academicYearOrLevel,
      primary_goal: data.profile.primaryGoalDescription,
      theme: data.profile.theme,
      daily_availability_hours: data.profile.preferences.dailyAvailabilityHours,
      preferred_session_duration: data.profile.preferences.preferredSessionDuration,
      preferred_time_of_day: data.profile.preferences.preferredTimeOfDay,
      session_pacing: data.profile.preferences.sessionPacing,
      break_frequency_minutes: data.profile.preferences.breakFrequencyMinutes,
      prioritization_strategy: data.profile.preferences.prioritizationStrategy,
      plan_explanation: data.profile.planExplanation,
      onboarded: data.profile.onboarded,
      updated_at: new Date().toISOString(),
    });

    if (profErr) {
      if (profErr.code === 'PGRST205' || profErr.message?.includes('schema cache')) {
        return {
          success: false,
          error: 'Supabase database tables are not initialized yet. Your study planner is currently running safely in local storage.',
        };
      }
      throw profErr;
    }

    // 2. Synchronize Subjects
    if (data.subjects.length > 0) {
      const subjectPayload = data.subjects.map((s) => ({
        id: s.id.includes('-') && s.id.length === 36 ? s.id : undefined,
        user_id: user.id,
        name: s.name,
        code: s.code || '',
        exam_date: s.examDate,
        exam_time: s.examTime || '09:00',
        difficulty: s.difficulty,
        prep_level: s.prepLevel,
        priority: s.priority,
        confidence: s.confidence,
        color: s.color,
        notes: s.notes || null,
      }));

      await supabase.from('subjects').upsert(subjectPayload, { onConflict: 'id' });
    }

    // 3. Synchronize Routine Commitments
    if (data.profile.routineCommitments.length > 0) {
      const routinePayload = data.profile.routineCommitments.map((r) => ({
        id: r.id.includes('-') && r.id.length === 36 ? r.id : undefined,
        user_id: user.id,
        name: r.name,
        category: r.category,
        days_of_week: r.daysOfWeek,
        start_time: r.startTime,
        end_time: r.endTime,
        is_fixed: r.isFixed,
        notes: r.notes || null,
      }));

      await supabase.from('routine_commitments').upsert(routinePayload, { onConflict: 'id' });
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Supabase Service] Failed to sync workspace:', err);
    return { success: false, error: err.message || 'Sync operation failed' };
  }
}
