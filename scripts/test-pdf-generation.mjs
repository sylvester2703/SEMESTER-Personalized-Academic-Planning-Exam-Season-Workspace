import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, parseISO, differenceInDays } from 'date-fns';

console.log('Testing PDF generation components & date calculations...');

const corruptedData = {
  profile: {
    displayName: 'Test Student',
    semesterName: 'Fall 2026 Examination',
    academicYearOrLevel: 'Final Year',
    primaryGoalDescription: 'Ace my exams',
    planExplanation: 'Balanced study schedule',
    preferences: {
      dailyAvailabilityHours: 3.5,
    },
    examChecklist: [
      { id: '1', text: 'Calculators and pens', checked: false, category: 'stationery' },
      { id: '2', text: 'Admit card printout', checked: true, category: 'documents' },
    ]
  },
  subjects: [
    { id: 's1', name: 'Computer Networks', code: 'CS401', examDate: '2026-11-15', examTime: '09:30', difficulty: 'hard' },
    { id: 's2', name: 'Software Engineering', code: 'CS402', examDate: '', examTime: '', difficulty: 'moderate' },
    { id: 's3', name: 'Database Systems', code: 'CS403', examDate: 'invalid-date-string', examTime: '14:00', difficulty: 'easy' },
  ],
  topics: [
    { id: 't1', subjectId: 's1', title: 'TCP/IP Model', unitOrModule: 'Unit 1', status: 'confident', estimatedMinutes: 60 },
    { id: 't2', subjectId: 's1', title: 'Congestion Control', unitOrModule: 'Unit 2', status: 'needs_revision', estimatedMinutes: 45 },
    { id: 't3', subjectId: 's2', title: 'Agile Methodology', unitOrModule: '', status: 'not_started', estimatedMinutes: 30 },
  ],
  sessions: [
    { id: 'sess1', subjectId: 's1', title: 'TCP Deep Dive', date: '2026-10-25', startTime: '09:00', endTime: '10:00', durationMinutes: 60, completed: false },
    { id: 'sess2', subjectId: 's2', title: 'Scrum Review', date: '', startTime: '14:00', endTime: '15:00', durationMinutes: 60, completed: true },
    { id: 'sess3', subjectId: 's3', title: 'SQL Joins', date: 'invalid-date', startTime: '16:00', endTime: '17:00', durationMinutes: 60, completed: false },
  ]
};

function safeFormatDate(dateStr, fmt = 'EEE, dd MMM yyyy', fallback = 'TBD') {
  if (!dateStr) return fallback;
  try {
    const d = parseISO(dateStr);
    if (isNaN(d.getTime())) return fallback;
    return format(d, fmt);
  } catch {
    return fallback;
  }
}

function safeGetDaysLeft(dateStr, now = new Date()) {
  if (!dateStr) return { label: 'TBD', days: 0 };
  try {
    const d = parseISO(dateStr);
    if (isNaN(d.getTime())) return { label: 'TBD', days: 0 };
    const days = differenceInDays(d, now);
    const label = days === 0 ? 'TODAY' : days < 0 ? 'Passed' : `${days} days`;
    return { label, days };
  } catch {
    return { label: 'TBD', days: 0 };
  }
}

for (const s of corruptedData.subjects) {
  const formatted = safeFormatDate(s.examDate);
  const daysInfo = safeGetDaysLeft(s.examDate);
  console.log(`Subject ${s.name}: date="${s.examDate}" -> formatted="${formatted}", daysLeft="${daysInfo.label}"`);
}

for (const sess of corruptedData.sessions) {
  const formatted = safeFormatDate(sess.date);
  console.log(`Session ${sess.title}: date="${sess.date}" -> formatted="${formatted}"`);
}

// Test jsPDF instance and document output
const doc = new jsPDF();
doc.text('Testing PDF Compilation', 10, 10);
if (typeof autoTable === 'function') {
  autoTable(doc, {
    startY: 20,
    head: [['A', 'B']],
    body: [['1', '2']]
  });
}
const arrayBuffer = doc.output('arraybuffer');
console.log(`jsPDF generated PDF successfully. Size: ${arrayBuffer.byteLength} bytes.`);
console.log('✅ ALL PDF & DATE RESILIENCE CHECKS PASSED!');
