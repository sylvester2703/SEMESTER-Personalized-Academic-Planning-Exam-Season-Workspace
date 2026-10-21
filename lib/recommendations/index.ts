import {
  Subject,
  Topic,
  StudySession,
  SmartRecommendation,
  RoutineCommitment,
  StudyPreferences,
  WhatShouldIStudyNowResult,
} from '@/types';
import { format, parseISO, differenceInDays } from 'date-fns';

/**
 * Computes the single most actionable, explainable recommendation
 * based strictly on local application state.
 */
export function getSmartNextStep(
  subjects: Subject[],
  topics: Topic[],
  sessions: StudySession[],
  now: Date = new Date()
): SmartRecommendation {
  const todayStr = format(now, 'yyyy-MM-dd');

  // Case 0: No subjects added yet
  if (!subjects || subjects.length === 0) {
    return {
      id: 'rec-no-subjects',
      type: 'schedule_gap',
      title: 'Add your first upcoming exam',
      explanation: 'No subjects or exam dates are recorded yet. Start with your syllabus to unlock live countdowns and study schedules.',
      actionLabel: 'Add subject',
      actionView: 'exams',
      priority: 'high',
    };
  }

  // Find nearest upcoming exam
  const sortedExams = [...subjects]
    .map((s) => {
      const examTime = s.examTime || '09:00';
      const [h, m] = examTime.split(':').map(Number);
      const d = parseISO(s.examDate);
      d.setHours(h, m, 0, 0);
      return { subject: s, dateObj: d };
    })
    .filter((s) => s.dateObj.getTime() >= now.getTime() - 1000 * 60 * 60 * 3)
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

  if (sortedExams.length === 0) {
    return {
      id: 'rec-all-exams-done',
      type: 'all_clear',
      title: 'All scheduled exams are complete',
      explanation: 'You have crossed the finish line for all scheduled examinations. Take time to celebrate and rest.',
      actionLabel: 'View weekly review',
      actionView: 'weekly-review',
      priority: 'low',
    };
  }

  const nearestExam = sortedExams[0];
  const daysUntilNearest = differenceInDays(nearestExam.dateObj, now);
  const nearestTopics = topics.filter((t) => t.subjectId === nearestExam.subject.id);
  const uncompletedTopics = nearestTopics.filter((t) => t.status === 'not_started' || t.status === 'needs_revision');

  // Case 1: An incomplete session is already scheduled for today
  const todaySessions = sessions.filter((s) => s.date === todayStr);
  const pendingTodaySession = todaySessions.find((s) => !s.completed);

  if (pendingTodaySession) {
    const parentSubj = subjects.find((s) => s.id === pendingTodaySession.subjectId);
    return {
      id: `rec-session-due-${pendingTodaySession.id}`,
      type: 'session_today',
      title: `Start scheduled session: ${pendingTodaySession.title}`,
      explanation: `You planned a ${pendingTodaySession.durationMinutes}-minute revision block for ${parentSubj?.name || 'today'} at ${pendingTodaySession.startTime}. Starting now keeps your evening clear.`,
      actionLabel: 'Launch Focus Timer',
      actionView: 'focus',
      targetSessionId: pendingTodaySession.id,
      targetSubjectId: pendingTodaySession.subjectId,
      targetTopicId: pendingTodaySession.topicId,
      priority: 'high',
    };
  }

  // Case 2: Nearest exam is within 10 days and has unstarted/needing revision topics
  if (daysUntilNearest <= 10 && uncompletedTopics.length > 0) {
    const targetTopic = uncompletedTopics[0];
    return {
      id: `rec-urgent-topic-${targetTopic.id}`,
      type: 'urgent_exam',
      title: `Review high-priority topic: ${targetTopic.title}`,
      explanation: `${nearestExam.subject.name} is in ${daysUntilNearest === 0 ? 'less than 24 hours' : `${daysUntilNearest} days`}. This topic is marked "${targetTopic.status.replace('_', ' ')}". A 25-minute focus session will solidify it.`,
      actionLabel: 'Focus on this topic',
      actionView: 'focus',
      targetSubjectId: nearestExam.subject.id,
      targetTopicId: targetTopic.id,
      priority: 'high',
    };
  }

  // Case 3: All topics for nearest exam are confident!
  if (nearestTopics.length > 0 && uncompletedTopics.length === 0) {
    return {
      id: `rec-confident-review-${nearestExam.subject.id}`,
      type: 'all_clear',
      title: `All syllabus topics confident for ${nearestExam.subject.code || nearestExam.subject.name}`,
      explanation: `Every listed topic is marked confident. Instead of heavy cramming, do a light 20-minute scan of past exam questions or take a restorative rest.`,
      actionLabel: 'View readiness map',
      actionView: 'readiness',
      targetSubjectId: nearestExam.subject.id,
      priority: 'medium',
    };
  }

  // Case 4: No sessions planned for today at all
  if (todaySessions.length === 0) {
    return {
      id: 'rec-no-session-today',
      type: 'schedule_gap',
      title: 'Schedule one focused study block for today',
      explanation: `No sessions are on your calendar today. Even a single 45-minute block keeps exam momentum smooth without causing end-of-week burnout.`,
      actionLabel: 'Add to timetable',
      actionView: 'timetable',
      targetSubjectId: nearestExam.subject.id,
      priority: 'medium',
    };
  }

  // Fallback: Continue steady progress
  return {
    id: 'rec-continue-progress',
    type: 'revise_topic',
    title: 'Solidify your next syllabus unit',
    explanation: 'You are on track with today’s plan. Check your readiness map to pick the next topic to advance from Learning to Confident.',
    actionLabel: 'Open readiness map',
    actionView: 'readiness',
    targetSubjectId: nearestExam.subject.id,
    priority: 'low',
  };
}

/**
 * Calculates a personalized next study action for "What should I study now?"
 * strictly using the student's current time, available window before next commitment,
 * exam urgency, and syllabus progress.
 */
export function calculateWhatShouldIStudyNow(
  subjects: Subject[],
  topics: Topic[],
  sessions: StudySession[],
  commitments: RoutineCommitment[] = [],
  preferences?: StudyPreferences,
  now: Date = new Date()
): WhatShouldIStudyNowResult {
  if (!subjects || subjects.length === 0) {
    return {
      availableMinutesNow: 0,
      primaryRecommendation: null,
      alternativeRecommendation: null,
    };
  }

  const currentH = now.getHours();
  const currentM = now.getMinutes();
  const nowMins = currentH * 60 + currentM;
  const dayOfWeek = now.getDay();
  const todayStr = format(now, 'yyyy-MM-dd');

  // Find next commitment or scheduled event today
  const todaysFixed = commitments.filter((c) => c.isFixed && c.daysOfWeek.includes(dayOfWeek));
  let nextCommitmentName: string | undefined;
  let nextCommitmentTime: string | undefined;
  let availableMinutesNow = 60; // default 1 hour window

  // Find upcoming fixed commitments today starting after now
  const upcomingCommitments = todaysFixed
    .map((c) => {
      const [h, m] = c.startTime.split(':').map(Number);
      return { ...c, startMins: h * 60 + m };
    })
    .filter((c) => c.startMins > nowMins)
    .sort((a, b) => a.startMins - b.startMins);

  if (upcomingCommitments.length > 0) {
    const nextC = upcomingCommitments[0];
    nextCommitmentName = nextC.name;
    nextCommitmentTime = nextC.startTime;
    availableMinutesNow = Math.max(15, nextC.startMins - nowMins);
  } else {
    // If no commitments left today, check sleep commitment (default 23:00)
    const sleepCommitment = commitments.find((c) => c.category === 'sleep');
    const sleepMins = sleepCommitment ? parseInt(sleepCommitment.startTime.split(':')[0]) * 60 : 23 * 60;
    availableMinutesNow = Math.max(20, Math.min(180, sleepMins - nowMins));
  }

  // Sort subjects by nearest exam date
  const sortedSubjects = [...subjects].sort((a, b) => {
    return new Date(a.examDate).getTime() - new Date(b.examDate).getTime();
  });

  const preferredDuration = preferences?.preferredSessionDuration || 45;
  const primaryDuration = Math.min(availableMinutesNow, preferredDuration);

  // 1. Primary Recommendation: Highest urgency exam + uncompleted topic
  let primarySubj = sortedSubjects[0];
  let primaryTopic = topics.find((t) => t.subjectId === primarySubj?.id && (t.status === 'needs_revision' || t.status === 'learning'))
    || topics.find((t) => t.subjectId === primarySubj?.id && t.status === 'not_started')
    || topics.find((t) => t.subjectId === primarySubj?.id);

  const daysToPrimary = primarySubj ? differenceInDays(parseISO(primarySubj.examDate), now) : 0;
  let primaryTitle = primaryTopic ? `${primaryTopic.title}` : `Core Concepts in ${primarySubj?.name}`;
  let primaryExplanation = primaryTopic
    ? `Exam in ${daysToPrimary <= 0 ? 'today' : `${daysToPrimary} days`}. Marked "${primaryTopic.status.replace('_', ' ')}". A ${primaryDuration}-minute focused block will reinforce key concepts.`
    : `Nearest exam in ${daysToPrimary} days. Review past papers or synthesize chapter summaries.`;

  // 2. Alternative Recommendation: Different subject or practice session
  let altSubj = sortedSubjects.length > 1 ? sortedSubjects[1] : sortedSubjects[0];
  let altTopic = topics.find((t) => t.subjectId === altSubj?.id && t.status !== 'confident' && t.id !== primaryTopic?.id)
    || topics.find((t) => t.subjectId === altSubj?.id && t.id !== primaryTopic?.id);

  const altDuration = Math.min(availableMinutesNow, 25);
  const daysToAlt = altSubj ? differenceInDays(parseISO(altSubj.examDate), now) : 0;
  let altTitle = altTopic ? `Active Recall: ${altTopic.title}` : `Problem Solving for ${altSubj?.code || altSubj?.name}`;
  let altExplanation = `Alternative option: Spend a fast ${altDuration}-minute sprint practicing recall without notes for ${altSubj?.name} (exam in ${daysToAlt} days).`;

  return {
    availableMinutesNow,
    nextCommitmentName,
    nextCommitmentTime,
    primaryRecommendation: primarySubj
      ? {
          subject: primarySubj,
          topic: primaryTopic,
          durationMinutes: primaryDuration,
          title: primaryTitle,
          explanation: primaryExplanation,
        }
      : null,
    alternativeRecommendation: altSubj
      ? {
          subject: altSubj,
          topic: altTopic,
          durationMinutes: altDuration,
          title: altTitle,
          explanation: altExplanation,
        }
      : null,
  };
}

