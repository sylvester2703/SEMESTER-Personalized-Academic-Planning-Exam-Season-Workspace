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

  const formattedTarget = `${format(target, 'EEEE, d MMM yyyy')}${next.subject.examTime ? ` at ${formatTime12Hour(next.subject.examTime)}` : ''}`;

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
 * Convert 24-hour time string (HH:mm) to 12-hour format with AM/PM (e.g. "02:30 PM" or "9:00 AM")
 */
export function formatTime12Hour(timeStr?: string): string {
  if (!timeStr) return '';
  if (/am|pm/i.test(timeStr)) return timeStr;
  const parts = timeStr.trim().split(':');
  if (parts.length < 2) return timeStr;
  const h = parseInt(parts[0], 10);
  const m = parts[1].slice(0, 2);
  if (isNaN(h)) return timeStr;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m} ${period}`;
}

/**
 * Format time range into 12-hour format (e.g. "9:30 AM – 11:00 AM")
 */
export function formatTimeRange(startTime: string, endTime: string): string {
  if (!startTime) return '';
  if (!endTime) return formatTime12Hour(startTime);
  return `${formatTime12Hour(startTime)} – ${formatTime12Hour(endTime)}`;
}

/**
 * Parses 24-hour HH:mm string into 12-hour components (hour: 01-12, minute: 00-59, period: AM/PM)
 */
export function parse24To12(time24: string = '09:00'): { hour: string; minute: string; period: 'AM' | 'PM' } {
  if (!time24) return { hour: '09', minute: '00', period: 'AM' };
  const parts = time24.split(':');
  let h = parseInt(parts[0], 10);
  if (isNaN(h)) h = 9;
  const m = parts[1] ? parts[1].slice(0, 2).padStart(2, '0') : '00';
  const period: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM';
  const hour12Num = h % 12 === 0 ? 12 : h % 12;
  const hour = String(hour12Num).padStart(2, '0');
  return { hour, minute: m, period };
}

/**
 * Converts 12-hour components into a standard 24-hour HH:mm string
 */
export function convert12To24(hour12: string, minute: string, period: 'AM' | 'PM'): string {
  let h = parseInt(hour12, 10);
  if (isNaN(h)) h = 12;
  if (period === 'AM') {
    if (h === 12) h = 0;
  } else {
    if (h < 12) h += 12;
  }
  const m = (minute || '00').padStart(2, '0');
  return `${String(h).padStart(2, '0')}:${m}`;
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
