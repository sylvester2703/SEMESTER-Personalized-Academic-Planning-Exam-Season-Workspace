import { Subject, Topic, StudySession, FocusRecord, ReadinessScore, WeeklyReviewMetrics } from '@/types';
import { parseISO, isWithinInterval, startOfWeek, endOfWeek } from 'date-fns';

/**
 * Calculates revision readiness score for a subject.
 * Pure and transparent: Confident topics count toward readiness percentage.
 */
export function calculateSubjectReadiness(topics: Topic[], subjectId?: string): ReadinessScore {
  const filtered = subjectId ? topics.filter((t) => t.subjectId === subjectId) : topics;
  const total = filtered.length;

  if (total === 0) {
    return {
      totalTopics: 0,
      confidentCount: 0,
      learningCount: 0,
      needsRevisionCount: 0,
      notStartedCount: 0,
      percentage: 0,
      needsAttentionCount: 0,
    };
  }

  const confident = filtered.filter((t) => t.status === 'confident').length;
  const learning = filtered.filter((t) => t.status === 'learning').length;
  const needsRevision = filtered.filter((t) => t.status === 'needs_revision').length;
  const notStarted = filtered.filter((t) => t.status === 'not_started').length;

  const percentage = Math.round((confident / total) * 100);
  const needsAttentionCount = notStarted + needsRevision;

  return {
    totalTopics: total,
    confidentCount: confident,
    learningCount: learning,
    needsRevisionCount: needsRevision,
    notStartedCount: notStarted,
    percentage,
    needsAttentionCount,
  };
}

/**
 * Calculates metrics for a specific week interval
 */
export function calculateWeeklyReview(
  sessions: StudySession[],
  focusRecords: FocusRecord[],
  subjects: Subject[],
  topics: Topic[],
  referenceDate: Date = new Date()
): WeeklyReviewMetrics {
  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(referenceDate, { weekStartsOn: 1 });

  // Sessions falling in this week
  const weekSessions = sessions.filter((s) => {
    try {
      const d = parseISO(s.date);
      return isWithinInterval(d, { start: weekStart, end: weekEnd });
    } catch {
      return false;
    }
  });

  const plannedSessionsCount = weekSessions.length;
  const completedSessions = weekSessions.filter((s) => s.completed);
  const completedSessionsCount = completedSessions.length;
  const missedPendingCount = plannedSessionsCount - completedSessionsCount;
  const completionRate = plannedSessionsCount > 0 ? Math.round((completedSessionsCount / plannedSessionsCount) * 100) : 0;

  // Focus records falling in this week
  const weekFocus = focusRecords.filter((f) => {
    try {
      const d = parseISO(f.completedAt);
      return isWithinInterval(d, { start: weekStart, end: weekEnd });
    } catch {
      return false;
    }
  });

  const focusMinutesTotal = weekFocus.reduce((acc, f) => acc + (f.durationMinutes || 0), 0);
  const hours = Math.floor(focusMinutesTotal / 60);
  const mins = focusMinutesTotal % 60;
  const focusHoursFormatted = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  // Subject-wise breakdown
  const subjectBreakdown = subjects.map((subj) => {
    const subjSessions = weekSessions.filter((s) => s.subjectId === subj.id);
    const subjCompleted = subjSessions.filter((s) => s.completed);

    const plannedMinutes = subjSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
    const completedMinutes = subjCompleted.reduce((sum, s) => sum + s.durationMinutes, 0);

    const subjTopics = topics.filter((t) => t.subjectId === subj.id);
    const topicsCovered = subjTopics.filter((t) => t.status === 'confident' || t.status === 'learning').length;

    return {
      subjectId: subj.id,
      subjectName: subj.name,
      subjectCode: subj.code,
      color: subj.color,
      plannedMinutes,
      completedMinutes,
      completedSessions: subjCompleted.length,
      topicsCovered,
    };
  });

  return {
    weekStart: weekStart.toISOString().slice(0, 10),
    weekEnd: weekEnd.toISOString().slice(0, 10),
    plannedSessionsCount,
    completedSessionsCount,
    completionRate,
    focusMinutesTotal,
    focusHoursFormatted,
    missedPendingCount,
    subjectBreakdown,
  };
}
