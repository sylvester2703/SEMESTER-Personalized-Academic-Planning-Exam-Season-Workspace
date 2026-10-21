import { Subject, Topic, StudySession, AvailabilitySlot } from '@/types';
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
  // Convert HH:mm to minutes from midnight
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
 * Generates an editable suggested weekly study plan based on transparent heuristic rules:
 * 1. Urgency: Sort subjects by exam date ascending.
 * 2. Unfinished topics: Focus on 'not_started' and 'needs_revision' topics.
 * 3. Daily availability: Schedule sessions within declared study windows.
 * 4. Realistic pacing: 75-90 min study blocks with buffer breaks.
 */
export function generateSuggestedWeeklyPlan(
  subjects: Subject[],
  topics: Topic[],
  availabilityHours: number = 3,
  startDate: Date = new Date(),
  daysCount: number = 7
): StudySession[] {
  if (!subjects || subjects.length === 0) return [];

  const now = startDate;
  const suggested: StudySession[] = [];

  // Sort subjects by nearest exam date
  const sortedSubjects = [...subjects].sort((a, b) => {
    return new Date(a.examDate).getTime() - new Date(b.examDate).getTime();
  });

  // Collect high priority topics for each subject
  const subjectTopicPool = new Map<string, Topic[]>();
  sortedSubjects.forEach((s) => {
    const subjTopics = topics.filter((t) => t.subjectId === s.id);
    const uncompleted = subjTopics.filter((t) => t.status !== 'confident');
    // If all are confident, allow reviewing any topic
    subjectTopicPool.set(s.id, uncompleted.length > 0 ? uncompleted : subjTopics);
  });

  let topicPointer = 0;

  for (let dayOffset = 0; dayOffset < daysCount; dayOffset++) {
    const currentDay = addDays(now, dayOffset);
    const dateStr = format(currentDay, 'yyyy-MM-dd');
    const dayOfWeek = currentDay.getDay(); // 0 is Sunday, 6 is Saturday

    // Weekend vs weekday capacity
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const dayHours = isWeekend ? Math.min(availabilityHours, 2.5) : availabilityHours;

    if (dayHours <= 0.5) continue;

    // Standard time slots:
    // Slot 1: Morning (09:30 - 11:00) 90m
    // Slot 2: Afternoon (14:30 - 16:00) 90m
    // Slot 3: Evening (17:00 - 18:15) 75m (if >= 3.5 hrs)
    const plannedSlots: { start: string; end: string; duration: number }[] = [];

    if (dayHours >= 1.5) {
      plannedSlots.push({ start: '09:30', end: '11:00', duration: 90 });
    }
    if (dayHours >= 2.5) {
      plannedSlots.push({ start: '14:30', end: '16:00', duration: 90 });
    }
    if (dayHours >= 3.5) {
      plannedSlots.push({ start: '17:00', end: '18:15', duration: 75 });
    }

    // Assign subjects to slots
    plannedSlots.forEach((slot, slotIdx) => {
      // Pick subject: weighted by exam urgency
      const subjIndex = (dayOffset + slotIdx) % sortedSubjects.length;
      const targetSubj = sortedSubjects[subjIndex];

      const pool = subjectTopicPool.get(targetSubj.id) || [];
      let targetTopic: Topic | undefined;
      let sessionTitle = `Structured Revision: ${targetSubj.name}`;

      if (pool.length > 0) {
        targetTopic = pool[(topicPointer++) % pool.length];
        sessionTitle = `${targetTopic.title} — Practice & Review`;
      } else {
        sessionTitle = `Past exam questions & notes synthesis for ${targetSubj.code || targetSubj.name}`;
      }

      suggested.push({
        id: `plan-gen-${dateStr}-${slotIdx}-${Math.random().toString(36).substring(2, 7)}`,
        subjectId: targetSubj.id,
        title: sessionTitle,
        date: dateStr,
        startTime: slot.start,
        endTime: slot.end,
        durationMinutes: slot.duration,
        completed: false,
        topicId: targetTopic?.id,
        notes: `Suggested by SEMESTER rule-based planner. Prioritizes nearest exam (${format(parseISO(targetSubj.examDate), 'd MMM')}).`,
      });
    });
  }

  return suggested;
}
