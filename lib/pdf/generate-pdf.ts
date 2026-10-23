import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AppData, Subject, Topic, StudySession } from '@/types';
import { format, parseISO, differenceInDays } from 'date-fns';
import { formatTime12Hour, formatTimeRange } from '@/lib/dates';

export type PdfExportType = 'full' | 'timetable' | 'daily' | 'exams' | 'syllabus';

export interface PdfExportOptions {
  type: PdfExportType;
  includeCompletedSessions?: boolean;
  includeNotes?: boolean;
  selectedDate?: string; // for daily sheet (YYYY-MM-DD)
}

const COLORS = {
  forestGreen: [45, 85, 65] as [number, number, number],
  deepInk: [32, 39, 34] as [number, number, number],
  mutedSage: [229, 224, 216] as [number, number, number],
  warmAmber: [217, 155, 56] as [number, number, number],
  subtleGray: [110, 115, 110] as [number, number, number],
  ivoryFill: [247, 245, 239] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

/**
 * Draws minimal geometric SEMESTER vector logo mark
 */
function drawSemesterLogo(doc: jsPDF, x: number, y: number, scale: number = 1) {
  doc.setFillColor(...COLORS.forestGreen);
  // Three aligned geometric time blocks representing academic calendar & planned focus
  doc.roundedRect(x, y + 2 * scale, 3 * scale, 12 * scale, 0.8 * scale, 0.8 * scale, 'F');
  doc.roundedRect(x + 4.5 * scale, y, 3 * scale, 14 * scale, 0.8 * scale, 0.8 * scale, 'F');
  doc.setFillColor(...COLORS.warmAmber);
  doc.roundedRect(x + 9 * scale, y + 4 * scale, 3 * scale, 10 * scale, 0.8 * scale, 0.8 * scale, 'F');
}

/**
 * Adds clean running header and footer with page numbers
 */
function addRunningHeaderFooter(doc: jsPDF, data: AppData, totalPagesExp: string = '{total_pages_count_string}') {
  const pageCount = (doc as any).internal.getNumberOfPages();
  const currentYear = new Date().getFullYear();
  const studentName = data.profile.displayName || 'Student';

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Skip running header on cover page of full planner
    if (i > 1) {
      // Header
      drawSemesterLogo(doc, 14, 8, 0.6);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.forestGreen);
      doc.text('SEMESTER', 24, 14);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...COLORS.subtleGray);
      doc.text('· Academic Study Planner', 42, 14);

      doc.text(format(new Date(), 'dd MMMM yyyy'), 196, 14, { align: 'right' });

      doc.setDrawColor(...COLORS.mutedSage);
      doc.setLineWidth(0.3);
      doc.line(14, 17, 196, 17);
    }

    // Footer on all pages
    doc.setDrawColor(...COLORS.mutedSage);
    doc.setLineWidth(0.3);
    doc.line(14, 282, 196, 282);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.subtleGray);
    doc.text(`© ${currentYear} SEMESTER · All rights reserved.`, 14, 287);

    const personalNote = `Prepared for personal study by ${studentName} · SEMESTER`;
    doc.text(personalNote, 105, 287, { align: 'center' });

    const pageStr = `Page ${i} of ${totalPagesExp}`;
    doc.text(pageStr, 196, 287, { align: 'right' });
  }
}

/**
 * Generates and triggers download of print-ready PDF planner
 */
export async function generateStudyPlannerPdf(
  data: AppData,
  options: PdfExportOptions = { type: 'full' }
): Promise<boolean> {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const now = new Date();
    const studentName = data.profile.displayName || 'Student';
    const semesterTitle = data.profile.semesterName || 'Semester Examination Series';

    // ----------------------------------------------------
    // EXPORT TYPE 1: FULL EXAM SEASON PLANNER
    // ----------------------------------------------------
    if (options.type === 'full') {
      // PAGE 1: COVER
      doc.setFillColor(...COLORS.ivoryFill);
      doc.rect(0, 0, 210, 297, 'F');

      // Top logo mark
      drawSemesterLogo(doc, 20, 25, 1.4);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(...COLORS.forestGreen);
      doc.text('SEMESTER', 42, 35);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.subtleGray);
      doc.text('Make a plan. Find your focus. Walk in prepared.', 42, 41);

      // Decorative divider
      doc.setDrawColor(...COLORS.forestGreen);
      doc.setLineWidth(0.8);
      doc.line(20, 50, 190, 50);

      // Title & Subtitle
      doc.setFont('times', 'bold');
      doc.setFontSize(28);
      doc.setTextColor(...COLORS.deepInk);
      doc.text('EXAM SEASON', 20, 75);
      doc.text('STUDY PLANNER', 20, 87);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(...COLORS.forestGreen);
      doc.text(semesterTitle.toUpperCase(), 20, 97);

      // Student Card
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(20, 112, 170, 48, 3, 3, 'F');
      doc.setDrawColor(...COLORS.mutedSage);
      doc.setLineWidth(0.4);
      doc.roundedRect(20, 112, 170, 48, 3, 3, 'D');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...COLORS.subtleGray);
      doc.text('STUDENT PROFILE', 28, 122);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(...COLORS.deepInk);
      doc.text(studentName, 28, 131);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.subtleGray);
      doc.text(data.profile.academicYearOrLevel || 'Undergraduate Student', 28, 138);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(...COLORS.forestGreen);
      const goalText = data.profile.primaryGoalDescription
        ? `Target: "${data.profile.primaryGoalDescription}"`
        : 'Goal: Balance college attendance with calm, consistent exam preparation.';
      const splitGoal = doc.splitTextToSize(goalText, 154);
      doc.text(splitGoal, 28, 147);

      // Personal Plan Explanation Box
      if (data.profile.planExplanation) {
        doc.setFillColor(242, 246, 243); // soft sage green
        doc.roundedRect(20, 168, 170, 36, 3, 3, 'F');
        doc.setDrawColor(...COLORS.forestGreen);
        doc.setLineWidth(0.3);
        doc.roundedRect(20, 168, 170, 36, 3, 3, 'D');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.forestGreen);
        doc.text('PERSONALIZED SCHEDULING LOGIC', 28, 176);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(...COLORS.deepInk);
        const splitExpl = doc.splitTextToSize(data.profile.planExplanation, 154);
        doc.text(splitExpl, 28, 183);
      }

      // Summary Stats Grid
      const statY = 214;
      const stats = [
        { label: 'Upcoming Exams', val: `${data.subjects.length}` },
        { label: 'Syllabus Topics', val: `${data.topics.length}` },
        { label: 'Planned Sessions', val: `${data.sessions.length}` },
        { label: 'Available Hours/Day', val: `${data.profile.preferences?.dailyAvailabilityHours || 3.5}h` },
      ];

      stats.forEach((st, idx) => {
        const boxX = 20 + idx * 43.5;
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(boxX, statY, 40, 24, 2, 2, 'F');
        doc.setDrawColor(...COLORS.mutedSage);
        doc.roundedRect(boxX, statY, 40, 24, 2, 2, 'D');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(...COLORS.forestGreen);
        doc.text(st.val, boxX + 20, statY + 11, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(...COLORS.subtleGray);
        doc.text(st.label, boxX + 20, statY + 18, { align: 'center' });
      });

      // Cover Footer Note
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(...COLORS.subtleGray);
      doc.text(
        'Generated from your actual timetable, commitments, and syllabus progress. Estimates are guidance and not a guarantee of exam results.',
        105,
        260,
        { align: 'center' }
      );

      // PAGE 2: EXAMINATION TIMETABLE & PRIORITIES
      doc.addPage();
      doc.setFont('times', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(...COLORS.deepInk);
      doc.text('Examination Calendar & Syllabus Readiness', 14, 28);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...COLORS.subtleGray);
      doc.text('Chronological sequence of all upcoming examination papers, venue details, and preparation status.', 14, 34);

      const sortedExams = [...data.subjects].sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());

      const examRows = sortedExams.length > 0
        ? sortedExams.map((s) => {
            const d = parseISO(s.examDate);
            const daysLeft = differenceInDays(d, now);
            const subjTopics = data.topics.filter((t) => t.subjectId === s.id);
            const confidentCount = subjTopics.filter((t) => t.status === 'confident').length;
            const prepStr = subjTopics.length > 0 ? `${confidentCount}/${subjTopics.length} confident` : '0 topics';

            let daysLabel = daysLeft === 0 ? 'TODAY' : daysLeft < 0 ? 'Passed' : `${daysLeft} days`;

            return [
              `${s.name}\n(${s.code || 'No code'})`,
              `${format(d, 'EEE, dd MMM yyyy')}\n${formatTime12Hour(s.examTime || '09:00')}`,
              daysLabel,
              s.examLocation || 'Campus Hall',
              (s.difficulty || 'Moderate').toUpperCase(),
              prepStr,
            ];
          })
        : [
            ['[Write Subject 1 Name]', 'DD/MM/YYYY\n9:00 AM', '___ days', 'Main Exam Hall', 'MODERATE', '[  ] Not started'],
            ['[Write Subject 2 Name]', 'DD/MM/YYYY\n09:00', '___ days', 'Main Exam Hall', 'MODERATE', '[  ] Not started'],
          ];

      autoTable(doc, {
        startY: 40,
        head: [['Subject & Code', 'Exam Date & Time', 'Days Left', 'Venue / Hall', 'Difficulty', 'Readiness']],
        body: examRows,
        theme: 'plain',
        headStyles: {
          fillColor: COLORS.forestGreen,
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 8,
          cellPadding: 3,
        },
        bodyStyles: {
          fontSize: 8,
          textColor: COLORS.deepInk,
          cellPadding: 3,
          lineColor: COLORS.mutedSage,
          lineWidth: 0.2,
        },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 38 },
          2: { cellWidth: 22, fontStyle: 'bold', textColor: COLORS.forestGreen },
          3: { cellWidth: 32 },
          4: { cellWidth: 22 },
          5: { cellWidth: 26 },
        },
      });

      // PAGE 3+: WEEKLY STUDY TIMETABLE
      doc.addPage();
      doc.setFont('times', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(...COLORS.deepInk);
      doc.text('Personal Weekly Study Schedule', 14, 28);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...COLORS.subtleGray);
      doc.text('Scheduled revision sessions calculated around your college, commute, and fixed routine hours.', 14, 34);

      const filteredSessions = options.includeCompletedSessions
        ? data.sessions
        : data.sessions.filter((s) => !s.completed);

      const sortedSessions = [...filteredSessions].sort((a, b) => {
        const cmp = a.date.localeCompare(b.date);
        return cmp !== 0 ? cmp : a.startTime.localeCompare(b.startTime);
      });

      const sessionRows = sortedSessions.length > 0
        ? sortedSessions.map((sess) => {
            const subj = data.subjects.find((s) => s.id === sess.subjectId);
            const dateFormatted = format(parseISO(sess.date), 'EEE, dd MMM');
            const timeRange = `${formatTimeRange(sess.startTime, sess.endTime)} (${sess.durationMinutes}m)`;
            const statusBox = sess.completed ? '[X] Done' : '[  ] Open';

            return [
              dateFormatted,
              timeRange,
              subj?.code || subj?.name || 'Study',
              sess.title,
              statusBox,
            ];
          })
        : [
            ['Monday', '09:00 - 10:00 (60m)', 'Subject 1', '[Blank Study Slot - write task here]', '[  ] Open'],
            ['Tuesday', '10:00 - 11:00 (60m)', 'Subject 2', '[Blank Study Slot - write task here]', '[  ] Open'],
            ['Wednesday', '14:00 - 15:00 (60m)', 'Subject 1', '[Blank Study Slot - write task here]', '[  ] Open'],
            ['Thursday', '16:00 - 17:00 (60m)', 'Subject 2', '[Blank Study Slot - write task here]', '[  ] Open'],
          ];

      autoTable(doc, {
        startY: 40,
        head: [['Date', 'Time & Duration', 'Subject', 'Focus Topic / Planned Task', 'Status']],
        body: sessionRows,
        theme: 'plain',
        headStyles: {
          fillColor: COLORS.forestGreen,
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 8,
          cellPadding: 3,
        },
        bodyStyles: {
          fontSize: 8,
          textColor: COLORS.deepInk,
          cellPadding: 3,
          lineColor: COLORS.mutedSage,
          lineWidth: 0.2,
        },
        columnStyles: {
          0: { cellWidth: 32 },
          1: { cellWidth: 38 },
          2: { cellWidth: 28, fontStyle: 'bold' },
          3: { cellWidth: 68 },
          4: { cellWidth: 22, fontStyle: 'bold' },
        },
      });

      // PAGE 4: SYLLABUS & REVISION TRACKER
      doc.addPage();
      doc.setFont('times', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(...COLORS.deepInk);
      doc.text('Syllabus & Active Recall Tracker', 14, 28);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...COLORS.subtleGray);
      doc.text(
        data.topics.length > 0
          ? 'Topic-by-topic tracking. Check off topics as you advance them to Confident.'
          : 'Printable blank syllabus tracker. Write your units and topics below.',
        14,
        34
      );

      const topicRows = data.topics.length > 0
        ? data.topics.map((t) => {
            const subj = data.subjects.find((s) => s.id === t.subjectId);
            const statusLabels: Record<string, string> = {
              confident: 'Confident',
              learning: 'Learning',
              needs_revision: 'Needs Revision',
              not_started: 'Not Started',
            };
            const box = t.status === 'confident' ? '[X]' : '[  ]';
            return [
              box,
              subj?.code || subj?.name || 'General',
              t.unitOrModule || 'General',
              t.title,
              statusLabels[t.status] || 'Not Started',
              `${t.estimatedMinutes || 45} mins`,
            ];
          })
        : [
            ['[  ]', '[Subject 1]', 'Unit 1', '[Write topic title here]', 'Not Started', '45 mins'],
            ['[  ]', '[Subject 1]', 'Unit 1', '[Write topic title here]', 'Not Started', '45 mins'],
            ['[  ]', '[Subject 2]', 'Unit 1', '[Write topic title here]', 'Not Started', '45 mins'],
            ['[  ]', '[Subject 2]', 'Unit 2', '[Write topic title here]', 'Not Started', '45 mins'],
          ];

      autoTable(doc, {
        startY: 40,
        head: [['Done', 'Subject', 'Module / Unit', 'Topic Title', 'Status', 'Est. Time']],
        body: topicRows,
        theme: 'plain',
        headStyles: {
          fillColor: COLORS.forestGreen,
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 8,
          cellPadding: 3,
        },
        bodyStyles: {
          fontSize: 7.5,
          textColor: COLORS.deepInk,
          cellPadding: 2.5,
          lineColor: COLORS.mutedSage,
          lineWidth: 0.2,
        },
        columnStyles: {
          0: { cellWidth: 14, fontStyle: 'bold' },
          1: { cellWidth: 26 },
          2: { cellWidth: 34 },
          3: { cellWidth: 68 },
          4: { cellWidth: 26 },
          5: { cellWidth: 20 },
        },
      });

      // PAGE 5: EXAM PREPARATION CHECKLIST & REFLECTION NOTES
      doc.addPage();
      doc.setFont('times', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(...COLORS.deepInk);
      doc.text('Daily Study Checklist & Personal Reflection', 14, 28);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...COLORS.subtleGray);
      doc.text('Practical checklist for exam day stationery, concepts, and personal study reflections.', 14, 34);

      const checklistItems = data.profile.examChecklist || [];
      const checklistRows = checklistItems.map((c) => {
        const subj = data.subjects.find((s) => s.id === c.subjectId);
        return [
          c.checked ? '[X] Verified' : '[  ] To Do',
          (c.category || 'general').toUpperCase(),
          subj?.code || 'All Exams',
          c.text,
        ];
      });

      if (checklistRows.length > 0) {
        autoTable(doc, {
          startY: 40,
          head: [['Status', 'Category', 'Subject', 'Checklist Item']],
          body: checklistRows,
          theme: 'plain',
          headStyles: {
            fillColor: COLORS.forestGreen,
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 8,
            cellPadding: 3,
          },
          bodyStyles: {
            fontSize: 8,
            textColor: COLORS.deepInk,
            cellPadding: 3,
            lineColor: COLORS.mutedSage,
            lineWidth: 0.2,
          },
          columnStyles: {
            0: { cellWidth: 28, fontStyle: 'bold' },
            1: { cellWidth: 30 },
            2: { cellWidth: 30 },
            3: { cellWidth: 100 },
          },
        });
      }

      // Handwritten Notes Section
      const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 12 : 50;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.forestGreen);
      doc.text('WEEKLY REFLECTIONS & ADAPTIVE NOTES', 14, finalY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...COLORS.subtleGray);
      doc.text('Use this space for handwritten problem formulas, lecture clarifications, or routine adjustments.', 14, finalY + 5);

      // Draw 6 clean blank note lines
      for (let i = 0; i < 6; i++) {
        const lineY = finalY + 16 + i * 10;
        if (lineY < 270) {
          doc.setDrawColor(...COLORS.mutedSage);
          doc.setLineWidth(0.3);
          doc.line(14, lineY, 196, lineY);
        }
      }
    }

    // ----------------------------------------------------
    // EXPORT TYPE 2: WEEKLY TIMETABLE ONLY
    // ----------------------------------------------------
    else if (options.type === 'timetable') {
      doc.setFont('times', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(...COLORS.deepInk);
      doc.text('Weekly Study Timetable', 14, 26);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.subtleGray);
      doc.text(`Student: ${studentName}  ·  Generated: ${format(now, 'dd MMMM yyyy')}`, 14, 32);

      const sortedSessions = [...data.sessions].sort((a, b) => {
        const cmp = a.date.localeCompare(b.date);
        return cmp !== 0 ? cmp : a.startTime.localeCompare(b.startTime);
      });

      const sessionRows = sortedSessions.map((sess) => {
        const subj = data.subjects.find((s) => s.id === sess.subjectId);
        return [
          format(parseISO(sess.date), 'EEE, dd MMM'),
          formatTimeRange(sess.startTime, sess.endTime),
          `${sess.durationMinutes}m`,
          subj?.name || 'Study',
          sess.title,
          sess.completed ? '[X]' : '[  ]',
        ];
      });

      autoTable(doc, {
        startY: 38,
        head: [['Day & Date', 'Time Window', 'Duration', 'Subject', 'Topic / Focus Task', 'Tick']],
        body: sessionRows.length > 0 ? sessionRows : [['No sessions scheduled.', '', '', '', '', '']],
        theme: 'plain',
        headStyles: {
          fillColor: COLORS.forestGreen,
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 8.5,
          cellPadding: 3,
        },
        bodyStyles: {
          fontSize: 8,
          textColor: COLORS.deepInk,
          cellPadding: 3,
          lineColor: COLORS.mutedSage,
          lineWidth: 0.2,
        },
        columnStyles: {
          0: { cellWidth: 32 },
          1: { cellWidth: 32 },
          2: { cellWidth: 20 },
          3: { cellWidth: 40, fontStyle: 'bold' },
          4: { cellWidth: 54 },
          5: { cellWidth: 12, fontStyle: 'bold' },
        },
      });
    }

    // ----------------------------------------------------
    // EXPORT TYPE 3: DAILY STUDY SHEET
    // ----------------------------------------------------
    else if (options.type === 'daily') {
      const targetDateStr = options.selectedDate || format(now, 'yyyy-MM-dd');
      const targetDateObj = parseISO(targetDateStr);

      doc.setFont('times', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(...COLORS.deepInk);
      doc.text('Daily Study Sheet', 14, 26);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(...COLORS.forestGreen);
      doc.text(`${format(targetDateObj, 'EEEE, dd MMMM yyyy')}  ·  ${studentName}`, 14, 33);

      const daySessions = data.sessions.filter((s) => s.date === targetDateStr);
      const dayRows = daySessions.map((s) => {
        const subj = data.subjects.find((sub) => sub.id === s.subjectId);
        return [
          formatTimeRange(s.startTime, s.endTime),
          `${s.durationMinutes} mins`,
          subj?.name || 'Subject',
          s.title,
          s.completed ? '[X] Done' : '[  ] Incomplete',
        ];
      });

      autoTable(doc, {
        startY: 40,
        head: [['Time', 'Duration', 'Subject', 'Focus Topic & Notes', 'Status']],
        body: dayRows.length > 0 ? dayRows : [['No study sessions planned for this date.', '', '', '', '']],
        theme: 'plain',
        headStyles: {
          fillColor: COLORS.forestGreen,
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 8.5,
        },
        bodyStyles: {
          fontSize: 8.5,
          cellPadding: 3.5,
          lineColor: COLORS.mutedSage,
          lineWidth: 0.2,
        },
        columnStyles: {
          0: { cellWidth: 32 },
          1: { cellWidth: 24 },
          2: { cellWidth: 44, fontStyle: 'bold' },
          3: { cellWidth: 62 },
          4: { cellWidth: 26, fontStyle: 'bold' },
        },
      });

      // Reflection area
      const nextY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 16 : 80;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.forestGreen);
      doc.text('DAILY FOCUS REFLECTION & TOMORROW’S TARGET', 14, nextY);

      for (let i = 0; i < 8; i++) {
        const lineY = nextY + 10 + i * 11;
        if (lineY < 270) {
          doc.setDrawColor(...COLORS.mutedSage);
          doc.setLineWidth(0.3);
          doc.line(14, lineY, 196, lineY);
        }
      }
    }

    // ----------------------------------------------------
    // EXPORT TYPE 4: EXAM COUNTDOWN AND REVISION PLAN
    // ----------------------------------------------------
    else if (options.type === 'exams') {
      doc.setFont('times', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(...COLORS.deepInk);
      doc.text('Exam Countdown & Revision Plan', 14, 26);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.subtleGray);
      doc.text(`Comprehensive examination deadlines, locations, and high-yield focus topics.`, 14, 32);

      const sortedExams = [...data.subjects].sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());

      const rows = sortedExams.map((s) => {
        const d = parseISO(s.examDate);
        const daysLeft = differenceInDays(d, now);
        const subjTopics = data.topics.filter((t) => t.subjectId === s.id);
        const uncompleted = subjTopics.filter((t) => t.status !== 'confident');

        return [
          s.name,
          s.code || '—',
          format(d, 'dd MMM yyyy'),
          daysLeft === 0 ? 'TODAY' : `${daysLeft} days`,
          s.examLocation || 'TBD',
          `${uncompleted.length} topics pending`,
        ];
      });

      autoTable(doc, {
        startY: 38,
        head: [['Course Name', 'Code', 'Exam Date', 'Countdown', 'Venue', 'Revision Backlog']],
        body: rows,
        theme: 'plain',
        headStyles: {
          fillColor: COLORS.forestGreen,
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 8.5,
        },
        bodyStyles: {
          fontSize: 8,
          cellPadding: 3,
          lineColor: COLORS.mutedSage,
          lineWidth: 0.2,
        },
        columnStyles: {
          0: { cellWidth: 50, fontStyle: 'bold' },
          1: { cellWidth: 22 },
          2: { cellWidth: 28 },
          3: { cellWidth: 24, fontStyle: 'bold', textColor: COLORS.forestGreen },
          4: { cellWidth: 32 },
          5: { cellWidth: 32 },
        },
      });
    }

    // ----------------------------------------------------
    // EXPORT TYPE 5: PRINTABLE REVISION TRACKER
    // ----------------------------------------------------
    else if (options.type === 'syllabus') {
      doc.setFont('times', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(...COLORS.deepInk);
      doc.text('Printable Syllabus Revision Tracker', 14, 26);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.subtleGray);
      doc.text(`Checklist of all topics, units, and active recall status.`, 14, 32);

      const sortedTopics = [...data.topics].sort((a, b) => {
        const subjA = data.subjects.find((s) => s.id === a.subjectId)?.name || '';
        const subjB = data.subjects.find((s) => s.id === b.subjectId)?.name || '';
        if (subjA !== subjB) return subjA.localeCompare(subjB);
        const unitA = a.unitOrModule || '';
        const unitB = b.unitOrModule || '';
        if (unitA !== unitB) return unitA.localeCompare(unitB);
        return (a.order || 0) - (b.order || 0);
      });

      const rows = sortedTopics.map((t) => {
        const subj = data.subjects.find((s) => s.id === t.subjectId);
        return [
          t.status === 'confident' ? '[X]' : '[  ]',
          subj?.name || 'General',
          t.unitOrModule || '—',
          t.title,
          t.status.replace('_', ' ').toUpperCase(),
          `${t.estimatedMinutes || 45}m${t.isProvisionalEstimate ? ' (prov)' : ''}`,
        ];
      });

      autoTable(doc, {
        startY: 38,
        head: [['Done', 'Subject', 'Unit / Chapter', 'Topic', 'Current State', 'Time']],
        body: rows.length > 0 ? rows : [['No syllabus topics entered.', '', '', '', '', '']],
        theme: 'plain',
        headStyles: {
          fillColor: COLORS.forestGreen,
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 8.5,
        },
        bodyStyles: {
          fontSize: 8,
          cellPadding: 3,
          lineColor: COLORS.mutedSage,
          lineWidth: 0.2,
        },
        columnStyles: {
          0: { cellWidth: 14, fontStyle: 'bold' },
          1: { cellWidth: 38 },
          2: { cellWidth: 36 },
          3: { cellWidth: 62 },
          4: { cellWidth: 26 },
          5: { cellWidth: 16 },
        },
      });
    }

    // Add running headers & footers across all pages
    addRunningHeaderFooter(doc, data);

    // Save and trigger browser download
    const safeDate = format(now, 'yyyy-MM-dd');
    const safeName = studentName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const filename = `SEMESTER_${options.type}_planner_${safeName}_${safeDate}.pdf`;

    doc.save(filename);
    return true;
  } catch (err) {
    console.error('[SEMESTER PDF Generator] Generation failed:', err);
    return false;
  }
}
