import {
  format,
  parseISO,
  isBefore,
  isSameDay,
  addDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
} from 'date-fns';
import { Subject, CountdownResult } from '@/types';

/**
 * Calculates live countdown to nearest upcoming exam
 */
export function calculateExamCountdown(subjects: Subject[], now: Date = new Date()): CountdownResult {
  if (!subjects || subjects.length === 0) {
    return {
      nextExam: null,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isToday: false,
      isPassed: false,
      formattedTarget: '',
      reassuringMessage: 'No upcoming exams scheduled. Add your first subject to start planning.',
    };
  }

  // Parse exam dates into full Date objects with times
  const parsed = subjects.map((subj) => {
    const timeStr = subj.examTime || '09:00';
    const [hours, minutes] = timeStr.split(':').map(Number);
    const dateObj = parseISO(subj.examDate);
    dateObj.setHours(hours, minutes, 0, 0);
    return { subject: subj, targetDate: dateObj };
  });

  // Filter for future exams or exams happening today
  const upcoming = parsed
    .filter((item) => item.targetDate.getTime() >= now.getTime() - 1000 * 60 * 60 * 3) // allow up to 3 hours past start
    .sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime());

  if (upcoming.length === 0) {
    // All exams have passed!
    return {
      nextExam: null,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isToday: false,
      isPassed: true,
      formattedTarget: 'All completed',
      reassuringMessage: 'All scheduled exams are complete. Take pride in your preparation and rest well!',
    };
  }

  const next = upcoming[0];
  const target = next.targetDate;
  const totalSecondsRemaining = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));

  const days = Math.floor(totalSecondsRemaining / 86400);
  const hours = Math.floor((totalSecondsRemaining % 86400) / 3600);
  const minutes = Math.floor((totalSecondsRemaining % 3600) / 60);
  const seconds = totalSecondsRemaining % 60;

  const isToday = isSameDay(target, now);

  let reassuringMessage = '';
  if (isToday) {
    if (totalSecondsRemaining === 0) {
      reassuringMessage = 'Exam starting now. Trust the preparation you put in.';
    } else {
      reassuringMessage = 'Exam is today. Review key summaries, stay hydrated, and breathe easy.';
    }
  } else if (days === 1) {
    reassuringMessage = 'Exam tomorrow. Consolidate notes and get a restorative night of sleep.';
  } else if (days <= 3) {
    reassuringMessage = `${days} days remaining. Focus on high-yield revision and active recall.`;
  } else if (days <= 7) {
    reassuringMessage = '1 week to go. A steady, unhurried pace will keep you calm and prepared.';
  } else if (days <= 14) {
    reassuringMessage = '2 weeks remaining. Plenty of runway for structured, bite-sized revision.';
  } else {
    reassuringMessage = `${days} days ahead. Early, consistent daily sessions remove all the stress later.`;
  }

  const formattedTarget = `${format(target, 'EEEE, d MMM yyyy')}${next.subject.examTime ? ` at ${next.subject.examTime}` : ''}`;

  return {
    nextExam: next.subject,
    days,
    hours,
    minutes,
    seconds,
    isToday,
    isPassed: false,
    formattedTarget,
    reassuringMessage,
  };
}

/**
 * Get days of current week (Monday start)
 */
export function getDaysOfWeek(referenceDate: Date = new Date()): Date[] {
  const start = startOfWeek(referenceDate, { weekStartsOn: 1 });
  const end = endOfWeek(referenceDate, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
}

/**
 * Format date for storage (YYYY-MM-DD)
 */
export function formatDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Format date for display
 */
export function formatDisplayDate(dateStr: string): string {
  try {
    const d = parseISO(dateStr);
    return format(d, 'EEE, d MMM');
  } catch {
    return dateStr;
  }
}

/**
 * User friendly time string
 */
export function formatTimeRange(startTime: string, endTime: string): string {
  return `${startTime} – ${endTime}`;
}

/**
 * Get user local time zone name
 */
export function getLocalTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local time';
  } catch {
    return 'Local time';
  }
}
