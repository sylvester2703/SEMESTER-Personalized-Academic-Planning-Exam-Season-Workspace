import {
  Subject,
  Topic,
  StudySession,
  RoutineCommitment,
  StudyPreferences,
} from '@/types';
import { addDays, format, parseISO, differenceInDays } from 'date-fns';

/**
 * Checks if two time intervals overlap on the same day.
 * Times in HH:mm format.
 */
export function doSessionsOverlap(
  dateA: string,
  startA: string,
  endA: string,
  dateB: string,
  startB: string,
  endB: string
): boolean {
  if (dateA !== dateB) return false;
  const toMins = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const sA = toMins(startA);
  const eA = toMins(endA);
  const sB = toMins(startB);
  const eB = toMins(endB);

  return sA < eB && eA > sB;
}

/**
 * Detect all conflicts within a list of sessions
 */
export function detectSessionConflicts(sessions: StudySession[]): Map<string, string[]> {
  const conflictMap = new Map<string, string[]>();

  for (let i = 0; i < sessions.length; i++) {
    const a = sessions[i];
    for (let j = i + 1; j < sessions.length; j++) {
      const b = sessions[j];
      if (doSessionsOverlap(a.date, a.startTime, a.endTime, b.date, b.startTime, b.endTime)) {
        const aConflicts = conflictMap.get(a.id) || [];
        aConflicts.push(b.id);
        conflictMap.set(a.id, aConflicts);

        const bConflicts = conflictMap.get(b.id) || [];
        bConflicts.push(a.id);
        conflictMap.set(b.id, bConflicts);
      }
    }
  }

  return conflictMap;
}

/**
 * Time interval in minutes from midnight [0, 1440]
 */
interface MinuteInterval {
  start: number;
  end: number;
  source?: string;
}

function timeStringToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function minutesToTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Returns all non-overlapping free time intervals on a given day,
 * guaranteeing fixed commitments and existing sessions are never violated.
 */
export function getAvailableFreeIntervals(
  dayOfWeek: number,
  commitments: RoutineCommitment[],
  existingSessionsForDay: StudySession[] = []
): MinuteInterval[] {
  const busyIntervals: MinuteInterval[] = [];

  // 1. Add all fixed commitments active on this day of week
  commitments
    .filter((c) => c.isFixed && c.daysOfWeek.includes(dayOfWeek))
    .forEach((c) => {
      const s = timeStringToMinutes(c.startTime);
      const e = timeStringToMinutes(c.endTime);
      if (s < e) {
        busyIntervals.push({ start: s, end: e, source: c.name });
      } else {
        // Overnight commitment (e.g. sleep 23:00 to 07:00)
        busyIntervals.push({ start: s, end: 1440, source: c.name });
        busyIntervals.push({ start: 0, end: e, source: c.name });
      }
    });

  // 2. Add existing completed sessions or preserved sessions
  existingSessionsForDay.forEach((sess) => {
    const s = timeStringToMinutes(sess.startTime);
    const e = timeStringToMinutes(sess.endTime);
    if (s < e) {
      busyIntervals.push({ start: s, end: e, source: sess.title });
    }
  });

  // Sort busy intervals by start time
  busyIntervals.sort((a, b) => a.start - b.start);

  // Merge overlapping or adjoining busy intervals
  const mergedBusy: MinuteInterval[] = [];
  for (const interval of busyIntervals) {
    if (mergedBusy.length === 0) {
      mergedBusy.push({ ...interval });
    } else {
      const last = mergedBusy[mergedBusy.length - 1];
      if (interval.start <= last.end) {
        last.end = Math.max(last.end, interval.end);
      } else {
        mergedBusy.push({ ...interval });
      }
    }
  }

  // Invert merged busy intervals to get free intervals across 24h
  const freeIntervals: MinuteInterval[] = [];
  let currentStart = 0;

  for (const busy of mergedBusy) {
    if (busy.start > currentStart) {
      freeIntervals.push({ start: currentStart, end: busy.start });
    }
    currentStart = Math.max(currentStart, busy.end);
  }

  if (currentStart < 1440) {
    freeIntervals.push({ start: currentStart, end: 1440 });
  }

  return freeIntervals;
}

export interface GeneratedPlanResult {
  sessions: StudySession[];
  explanation: string;
  feasibilityWarning?: string;
  availableHoursTotal: number;
  plannedHoursTotal: number;
}

/**
 * Generates a personalised, conflict-free study timetable built strictly around:
 * 1. Fixed commitments (College, Sleep, Commute, Meals).
 * 2. Exam proximity, syllabus completion, and subject difficulty.
 * 3. Daily availability, session pacing, and lighter study days.
 */
export function generateSuggestedWeeklyPlan(
  subjects: Subject[],
  topics: Topic[],
  routineOrHours: RoutineCommitment[] | number = 3.5,
  startDate: Date = new Date(),
  daysCount: number = 7,
  preferences?: Partial<StudyPreferences>,
  existingSessions: StudySession[] = []
): StudySession[] & { explanation?: string; feasibilityWarning?: string } {
  if (!subjects || subjects.length === 0) {
    const empty: any = [];
    empty.explanation = 'Add at least one upcoming subject to generate your study timetable.';
    return empty;
  }

  const now = startDate;
  const suggested: StudySession[] = [];

  // Determine preferences & routine
  const commitments: RoutineCommitment[] = Array.isArray(routineOrHours) ? routineOrHours : [];
  const dailyTargetHours =
    typeof routineOrHours === 'number'
      ? routineOrHours
      : preferences?.dailyAvailabilityHours || 3.5;
  const preferredDuration = preferences?.preferredSessionDuration || 45;
  const preferredTimeOfDay = preferences?.preferredTimeOfDay || 'evening';
  const lighterDays = preferences?.lighterDays || [0];
  const breakBufferMins = 15;

  // Prioritize subjects
  // 1. Exam date ascending (nearest exam gets highest priority)
  // 2. Difficulty (difficult > moderate > easy)
  // 3. Unfinished topic count
  const scoredSubjects = [...subjects].map((s) => {
    const examDateObj = parseISO(s.examDate);
    const daysUntil = Math.max(0, differenceInDays(examDateObj, now));

    let diffScore = 2;
    if (s.difficulty === 'difficult') diffScore = 4;
    else if (s.difficulty === 'moderate') diffScore = 2;
    else if (s.difficulty === 'easy') diffScore = 1;

    let priorityScore = 2;
    if (s.priority === 'high') priorityScore = 4;
    else if (s.priority === 'low') priorityScore = 1;

    const subjTopics = topics.filter((t) => t.subjectId === s.id);
    const uncompleted = subjTopics.filter((t) => t.status !== 'confident');

    // Urgency score: closer exam = higher urgency
    const urgency = daysUntil <= 3 ? 10 : daysUntil <= 7 ? 6 : daysUntil <= 14 ? 3 : 1;
    const totalScore = urgency * 3 + diffScore * 2 + priorityScore * 2 + uncompleted.length;

    return {
      subject: s,
      daysUntil,
      uncompletedTopics: uncompleted,
      allTopics: subjTopics,
      score: totalScore,
    };
  });

  scoredSubjects.sort((a, b) => b.score - a.score);

  const highestPrioritySubject = scoredSubjects[0]?.subject;
  const highestPriorityUncompletedCount = scoredSubjects[0]?.uncompletedTopics.length || 0;

  // Track topic pointers so topics aren't duplicated unnecessarily
  const topicIndices = new Map<string, number>();

  let totalAvailableStudyMinutes = 0;
  let totalPlannedStudyMinutes = 0;

  // Day loop
  for (let dayOffset = 0; dayOffset < daysCount; dayOffset++) {
    const currentDay = addDays(now, dayOffset);
    const dateStr = format(currentDay, 'yyyy-MM-dd');
    const dayOfWeek = currentDay.getDay();

    const isLighter = lighterDays.includes(dayOfWeek);
    const dayTargetMinutes = Math.round((isLighter ? Math.min(dailyTargetHours * 0.5, 1.5) : dailyTargetHours) * 60);

    // Filter existing completed sessions for this date so we don't overwrite them
    const existingForDay = existingSessions.filter((s) => s.date === dateStr);

    // Free intervals on this day
    const freeIntervals = getAvailableFreeIntervals(dayOfWeek, commitments, existingForDay);

    // Calculate total available free minutes in daytime (between 07:00 and 23:00)
    const daytimeFree = freeIntervals
      .filter((int) => int.start >= 420 && int.end <= 1380)
      .reduce((acc, int) => acc + (int.end - int.start), 0);
    totalAvailableStudyMinutes += daytimeFree;

    // Filter free intervals by preferred time of day preference when possible
    let targetIntervals = [...freeIntervals];
    if (preferredTimeOfDay === 'morning') {
      targetIntervals.sort((a, b) => (a.start >= 420 && a.start < 720 ? -1 : 1));
    } else if (preferredTimeOfDay === 'afternoon') {
      targetIntervals.sort((a, b) => (a.start >= 720 && a.start < 1020 ? -1 : 1));
    } else if (preferredTimeOfDay === 'evening') {
      targetIntervals.sort((a, b) => (a.start >= 1020 && a.start < 1320 ? -1 : 1));
    } else if (preferredTimeOfDay === 'night') {
      targetIntervals.sort((a, b) => (a.start >= 1200 ? -1 : 1));
    }

    let dayPlannedMinutes = 0;

    for (const interval of targetIntervals) {
      if (dayPlannedMinutes >= dayTargetMinutes) break;

      // Ensure study window is in reasonable hours (07:00 to 23:00)
      const validStart = Math.max(interval.start, 420); // 07:00
      const validEnd = Math.min(interval.end, 1380); // 23:00

      let cursor = validStart;

      while (cursor + preferredDuration <= validEnd && dayPlannedMinutes + preferredDuration <= dayTargetMinutes) {
        // Pick subject from weighted distribution
        const subjIdx = (dayOffset + Math.floor(dayPlannedMinutes / preferredDuration)) % scoredSubjects.length;
        const target = scoredSubjects[subjIdx];
        if (!target) break;

        const subj = target.subject;
        const uncompleted = target.uncompletedTopics;
        const pointer = topicIndices.get(subj.id) || 0;

        let targetTopic: Topic | undefined;
        let sessionTitle = `Structured Revision: ${subj.name}`;

        if (uncompleted.length > 0) {
          targetTopic = uncompleted[pointer % uncompleted.length];
          const unitPrefix = targetTopic.unitOrModule ? `${targetTopic.unitOrModule} — ` : '';
          const statusSuffix =
            targetTopic.status === 'not_started'
              ? 'Initial Study'
              : targetTopic.status === 'learning'
              ? 'Practice & Notes'
              : 'Recall & Review';
          sessionTitle = `${unitPrefix}${targetTopic.title} (${statusSuffix})`;
          topicIndices.set(subj.id, pointer + 1);
        } else if (target.allTopics.length > 0) {
          targetTopic = target.allTopics[pointer % target.allTopics.length];
          const unitPrefix = targetTopic.unitOrModule ? `${targetTopic.unitOrModule} — ` : '';
          sessionTitle = `${unitPrefix}${targetTopic.title} (Retention Practice)`;
          topicIndices.set(subj.id, pointer + 1);
        } else {
          sessionTitle = `Exam Practice & Notes Review: ${subj.code || subj.name}`;
        }

        const startStr = minutesToTimeString(cursor);
        const endStr = minutesToTimeString(cursor + preferredDuration);

        suggested.push({
          id: `plan-gen-${dateStr}-${cursor}-${Math.random().toString(36).substring(2, 6)}`,
          subjectId: subj.id,
          title: sessionTitle,
          date: dateStr,
          startTime: startStr,
          endTime: endStr,
          durationMinutes: preferredDuration,
          completed: false,
          isAutoGenerated: true,
          topicId: targetTopic?.id,
          notes: `Suggested by rule-based planner. Prioritized for ${subj.name} (${target.daysUntil} days until exam).`,
        });

        cursor += preferredDuration + breakBufferMins;
        dayPlannedMinutes += preferredDuration;
        totalPlannedStudyMinutes += preferredDuration;
      }
    }
  }

  // Create honest personalized explanation
  const routineHighlights: string[] = [];
  const collegeCommitment = commitments.find((c) => c.category === 'college' && c.isFixed);
  if (collegeCommitment) {
    routineHighlights.push(`college hours (${collegeCommitment.startTime} – ${collegeCommitment.endTime})`);
  }
  routineHighlights.push(`preferred ${preferredTimeOfDay} study periods`);
  if (lighterDays.length > 0) {
    routineHighlights.push('lighter study days on weekends');
  }

  let explanation = `Your plan was built around your ${routineHighlights.join(', ')}, and upcoming examinations.`;
  if (highestPrioritySubject) {
    explanation += ` ${highestPrioritySubject.name} (${highestPrioritySubject.code || ''}) has been prioritised because its exam is in ${differenceInDays(parseISO(highestPrioritySubject.examDate), now)} days and ${highestPriorityUncompletedCount > 0 ? `${highestPriorityUncompletedCount} topics still require revision` : 'key concepts need consolidation'}.`;
  }

  // Feasibility check
  const totalUncompletedTopics = topics.filter((t) => t.status !== 'confident').length;
  const estimatedHoursNeeded = (totalUncompletedTopics * 45) / 60;
  const plannedHours = totalPlannedStudyMinutes / 60;

  let feasibilityWarning: string | undefined;
  if (estimatedHoursNeeded > plannedHours * 1.5 && totalUncompletedTopics > 8) {
    feasibilityWarning = `You have ${totalUncompletedTopics} remaining topics (~${estimatedHoursNeeded.toFixed(1)} hrs estimated work) across all subjects, but only ${plannedHours.toFixed(1)} study hours planned this week around your fixed commitments. Consider focusing on high-priority units or dedicating an extra 45 minutes on weekends.`;
  }

  const result: any = suggested;
  result.explanation = explanation;
  result.feasibilityWarning = feasibilityWarning;

  return result;
}

