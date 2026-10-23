/**
 * Exam Triage & Emergency Cram Engine
 * Designed for students facing an examination within 24 to 72 hours who feel overwhelmed.
 * Deterministically prunes low-yield content and builds an hour-by-hour survival schedule
 * with mandatory sleep protection.
 */

import { Subject, Topic, StudySession } from '@/types';
import { differenceInHours, parseISO, format, addHours, addMinutes, isBefore } from 'date-fns';
import { formatTime12Hour, formatTimeRange } from '@/lib/dates';

export interface TriageTopicItem {
  topic: Topic;
  tier: 'critical' | 'quick_win' | 'prune';
  tierLabel: string;
  recommendedMinutes: number;
  reason: string;
}

export interface TriageScheduleBlock {
  id: string;
  type: 'study' | 'sleep' | 'hydration' | 'final_review' | 'exam';
  title: string;
  startTime: string; // 12h formatted
  endTime: string;   // 12h formatted
  date: string;
  durationMinutes: number;
  topicTitle?: string;
  tier?: 'critical' | 'quick_win' | 'prune';
}

export interface ExamTriagePlan {
  subject: Subject;
  hoursUntilExam: number;
  isUrgent: boolean; // < 72h
  classifiedTopics: {
    critical: TriageTopicItem[];
    quickWins: TriageTopicItem[];
    pruned: TriageTopicItem[];
  };
  totalCramStudyHours: number;
  guaranteedSleepHours: number;
  schedule: TriageScheduleBlock[];
  survivalRules: string[];
}

export function generateExamTriagePlan(
  subject: Subject,
  topics: Topic[],
  now: Date = new Date()
): ExamTriagePlan {
  const examDateStr = subject.examDate;
  const examTimeStr = subject.examTime || '09:00';
  const [examH, examM] = examTimeStr.split(':').map(Number);

  const examDateTime = parseISO(examDateStr);
  examDateTime.setHours(examH, examM, 0, 0);

  const hoursUntilExam = Math.max(1, differenceInHours(examDateTime, now));
  const subjTopics = topics.filter((t) => t.subjectId === subject.id);

  // Classify topics into Triage Tiers
  const critical: TriageTopicItem[] = [];
  const quickWins: TriageTopicItem[] = [];
  const pruned: TriageTopicItem[] = [];

  subjTopics.forEach((topic) => {
    const isHard = topic.difficultyRating === 'difficult' || topic.priority === 'high';
    const isUnfinished = topic.status !== 'confident';
    const duration = topic.estimatedMinutes || 45;

    if (isUnfinished && isHard) {
      critical.push({
        topic,
        tier: 'critical',
        tierLabel: 'High-Yield Critical',
        recommendedMinutes: Math.min(50, duration),
        reason: 'Carries maximum marks & high risk of failure if skipped.',
      });
    } else if (isUnfinished && !isHard) {
      quickWins.push({
        topic,
        tier: 'quick_win',
        tierLabel: 'Quick Mark Consolidation',
        recommendedMinutes: Math.min(30, duration),
        reason: 'Rapid 25-30m review secures straightforward scoring points.',
      });
    } else {
      pruned.push({
        topic,
        tier: 'prune',
        tierLabel: 'Low-Yield / Already Confident',
        recommendedMinutes: 0,
        reason: topic.status === 'confident'
          ? 'Already confident. Do not waste precious pre-exam hours re-reading.'
          : 'Low-frequency or marginal return under severe time constraints.',
      });
    }
  });

  // Build the survival schedule starting from next clean hour
  const schedule: TriageScheduleBlock[] = [];
  let currentTime = new Date(now);
  currentTime.setMinutes(0, 0, 0);
  currentTime = addHours(currentTime, 1);

  // Pool of topics to schedule: Critical first, then Quick Wins
  const topicsToSchedule = [...critical, ...quickWins];
  let topicIdx = 0;
  let totalStudyMinutes = 0;
  let totalSleepMinutes = 0;

  // Iterate up to the exam start time
  while (isBefore(currentTime, examDateTime) && topicIdx < topicsToSchedule.length) {
    const hourOfDay = currentTime.getHours();
    const dateStr = format(currentTime, 'yyyy-MM-dd');

    // Mandatory sleep block: 23:00 to 06:00 (or if exam is tomorrow morning, protect at least 6 hours)
    if (hourOfDay >= 23 || hourOfDay < 6) {
      const sleepEnd = new Date(currentTime);
      sleepEnd.setHours(6, 0, 0, 0);
      if (sleepEnd > examDateTime) {
        sleepEnd.setTime(examDateTime.getTime() - 90 * 60 * 1000); // Wake up 90m before exam
      }

      const sleepDuration = Math.max(60, Math.round((sleepEnd.getTime() - currentTime.getTime()) / 60000));
      const start24 = format(currentTime, 'HH:mm');
      const end24 = format(sleepEnd, 'HH:mm');

      schedule.push({
        id: `triage-sleep-${currentTime.getTime()}`,
        type: 'sleep',
        title: 'Mandatory Deep Sleep (Brain Consolidation)',
        startTime: formatTime12Hour(start24),
        endTime: formatTime12Hour(end24),
        date: dateStr,
        durationMinutes: sleepDuration,
      });

      totalSleepMinutes += sleepDuration;
      currentTime = sleepEnd;
      continue;
    }

    // Study Sprint: 45 minutes
    const currentTopic = topicsToSchedule[topicIdx];
    const sprintDuration = Math.min(45, currentTopic.recommendedMinutes);
    const sprintEnd = addMinutes(currentTime, sprintDuration);

    if (isBefore(examDateTime, sprintEnd)) break;

    const start24 = format(currentTime, 'HH:mm');
    const end24 = format(sprintEnd, 'HH:mm');

    schedule.push({
      id: `triage-study-${currentTopic.topic.id}-${currentTime.getTime()}`,
      type: 'study',
      title: `Cram Sprint: ${currentTopic.topic.title}`,
      startTime: formatTime12Hour(start24),
      endTime: formatTime12Hour(end24),
      date: dateStr,
      durationMinutes: sprintDuration,
      topicTitle: currentTopic.topic.title,
      tier: currentTopic.tier,
    });

    totalStudyMinutes += sprintDuration;
    currentTime = sprintEnd;
    topicIdx++;

    // Hydration / stretch break: 10 mins
    const breakEnd = addMinutes(currentTime, 10);
    if (!isBefore(examDateTime, breakEnd)) {
      schedule.push({
        id: `triage-break-${currentTime.getTime()}`,
        type: 'hydration',
        title: 'Hydrate, Step Outside & Brain Rest',
        startTime: formatTime12Hour(format(currentTime, 'HH:mm')),
        endTime: formatTime12Hour(format(breakEnd, 'HH:mm')),
        date: dateStr,
        durationMinutes: 10,
      });
      currentTime = breakEnd;
    }
  }

  // Add final 30-min formula & core recap before exam
  const finalReviewStart = addMinutes(examDateTime, -60);
  const finalReviewEnd = addMinutes(examDateTime, -20);
  if (isBefore(now, finalReviewStart)) {
    schedule.push({
      id: `triage-final-${examDateTime.getTime()}`,
      type: 'final_review',
      title: 'Final High-Yield Formula & Summary Sheet Glance',
      startTime: formatTime12Hour(format(finalReviewStart, 'HH:mm')),
      endTime: formatTime12Hour(format(finalReviewEnd, 'HH:mm')),
      date: format(finalReviewStart, 'yyyy-MM-dd'),
      durationMinutes: 40,
    });
  }

  // Exam Hall Block
  schedule.push({
    id: `triage-exam-${examDateTime.getTime()}`,
    type: 'exam',
    title: `Examination Hall: ${subject.name} (${subject.code || 'Final'})`,
    startTime: formatTime12Hour(examTimeStr),
    endTime: formatTime12Hour(format(addHours(examDateTime, 3), 'HH:mm')),
    date: examDateStr,
    durationMinutes: 180,
  });

  return {
    subject,
    hoursUntilExam,
    isUrgent: hoursUntilExam <= 72,
    classifiedTopics: {
      critical,
      quickWins,
      pruned,
    },
    totalCramStudyHours: Math.round((totalStudyMinutes / 60) * 10) / 10,
    guaranteedSleepHours: Math.round((totalSleepMinutes / 60) * 10) / 10,
    schedule,
    survivalRules: [
      'Stop re-reading passive textbook paragraphs: write out diagrams, formulas, and 2-sentence Feynman summaries from memory.',
      'Protect your 6-hour sleep block: sleep deprivation costs 20–30% in recall speed and creates exam hall mental paralysis.',
      'Skip low-yield edge cases: focus strictly on questions that appear in 80% of past examination papers.',
      'Stay hydrated and avoid high-sugar energy crashes right before entering the exam room.',
    ],
  };
}
