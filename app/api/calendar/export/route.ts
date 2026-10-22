import { NextRequest, NextResponse } from 'next/server';

function formatIcsDateTime(dateStr: string, timeStr: string = '09:00'): string {
  // dateStr format: YYYY-MM-DD
  // timeStr format: HH:mm
  const cleanDate = dateStr.replace(/-/g, '');
  const cleanTime = timeStr.replace(/:/g, '') + '00';
  return `${cleanDate}T${cleanTime}`;
}

function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subjects = [], sessions = [], semesterTitle = 'Semester Exam Plan' } = body;

    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//SEMESTER//Student Academic Planner//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:${escapeIcsText(semesterTitle)}`,
    ];

    const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    // 1. Add Exam Events
    for (const sub of subjects) {
      if (!sub.examDate) continue;
      const uid = `exam-${sub.id || Math.random()}@semester.app`;
      const startTime = sub.examTime || '09:00';
      // Assume 3 hour exam block by default
      const [h, m] = startTime.split(':').map(Number);
      const endH = String(Math.min(h + 3, 23)).padStart(2, '0');
      const endTime = `${endH}:${String(m).padStart(2, '0')}`;

      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${uid}`);
      lines.push(`DTSTAMP:${now}`);
      lines.push(`DTSTART:${formatIcsDateTime(sub.examDate, startTime)}`);
      lines.push(`DTEND:${formatIcsDateTime(sub.examDate, endTime)}`);
      lines.push(`SUMMARY:FINAL EXAM: ${escapeIcsText((sub.code ? `${sub.code} — ` : '') + sub.name)}`);
      if (sub.examLocation) {
        lines.push(`LOCATION:${escapeIcsText(sub.examLocation)}`);
      }
      lines.push(
        `DESCRIPTION:Exam for ${escapeIcsText(sub.name)}. Target Grade: ${escapeIcsText(
          sub.targetGrade || 'Pass'
        )}. Walk in prepared!`
      );
      lines.push('STATUS:CONFIRMED');
      lines.push('CATEGORIES:EXAM,ACADEMIC');
      lines.push('END:VEVENT');
    }

    // 2. Add Scheduled Study Sessions
    for (const sess of sessions) {
      if (!sess.date || !sess.startTime || !sess.endTime) continue;
      const uid = `session-${sess.id || Math.random()}@semester.app`;

      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${uid}`);
      lines.push(`DTSTAMP:${now}`);
      lines.push(`DTSTART:${formatIcsDateTime(sess.date, sess.startTime)}`);
      lines.push(`DTEND:${formatIcsDateTime(sess.date, sess.endTime)}`);
      lines.push(`SUMMARY:Study: ${escapeIcsText(sess.title)}`);
      if (sess.notes) {
        lines.push(`DESCRIPTION:${escapeIcsText(sess.notes)}`);
      }
      lines.push('CATEGORIES:STUDY,REVISION');
      lines.push('STATUS:CONFIRMED');
      lines.push('END:VEVENT');
    }

    lines.push('END:VCALENDAR');

    const icsContent = lines.join('\r\n');

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="semester-schedule.ics"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating .ics calendar:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to export calendar' },
      { status: 500 }
    );
  }
}
