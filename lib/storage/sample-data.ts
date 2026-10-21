import { addDays, format, subDays } from 'date-fns';
import {
  AppData,
  Subject,
  Topic,
  StudySession,
  FocusRecord,
  RoutineCommitment,
  StudyPreferences,
  PersonalGoal,
  ExamDayChecklistItem,
} from '@/types';

export function generateSampleData(baseDate: Date = new Date()): AppData {
  const dateStr = (offset: number) => format(addDays(baseDate, offset), 'yyyy-MM-dd');
  const pastDateStr = (offset: number) => format(subDays(baseDate, offset), 'yyyy-MM-dd');

  const subjects: Subject[] = [
    {
      id: 'subj-cs301',
      name: 'Distributed Systems & Cloud',
      code: 'CS 301',
      examDate: dateStr(8),
      examTime: '09:30',
      examLocation: 'Hall B, Engineering Block 4',
      confidence: 'medium',
      color: '#2D5541', // Forest Green
      targetGrade: 'A',
      notes: 'Focus on consensus proofs and 2-phase commit failure scenarios.',
      units: [
        { id: 'unit-cs301-1', subjectId: 'subj-cs301', unitNumber: 'Module 1', title: 'Time & Ordering', order: 1 },
        { id: 'unit-cs301-2', subjectId: 'subj-cs301', unitNumber: 'Module 2', title: 'Consensus', order: 2 },
        { id: 'unit-cs301-3', subjectId: 'subj-cs301', unitNumber: 'Module 3', title: 'Transactions', order: 3 },
        { id: 'unit-cs301-4', subjectId: 'subj-cs301', unitNumber: 'Module 4', title: 'Storage Systems', order: 4 },
        { id: 'unit-cs301-5', subjectId: 'subj-cs301', unitNumber: 'Module 5', title: 'Advanced Fault Tolerance', order: 5 },
      ],
      syllabusSource: 'sample',
      createdAt: pastDateStr(20),
    },
    {
      id: 'subj-math204',
      name: 'Probability & Stochastic Models',
      code: 'MATH 204',
      examDate: dateStr(15),
      examTime: '14:00',
      examLocation: 'Main Auditorium',
      confidence: 'low',
      color: '#D99B38', // Warm Amber
      targetGrade: 'A-',
      notes: 'Formula sheet permitted (1 double-sided A4). Practice Markov chain transition matrices.',
      units: [
        { id: 'unit-math204-1', subjectId: 'subj-math204', unitNumber: 'Unit 1', title: 'Probability Foundations', order: 1 },
        { id: 'unit-math204-2', subjectId: 'subj-math204', unitNumber: 'Unit 2', title: 'Counting Processes', order: 2 },
        { id: 'unit-math204-3', subjectId: 'subj-math204', unitNumber: 'Unit 3', title: 'Markov Chains', order: 3 },
        { id: 'unit-math204-4', subjectId: 'subj-math204', unitNumber: 'Unit 4', title: 'Queueing Models', order: 4 },
        { id: 'unit-math204-5', subjectId: 'subj-math204', unitNumber: 'Unit 5', title: 'Limit Theorems', order: 5 },
      ],
      syllabusSource: 'sample',
      createdAt: pastDateStr(22),
    },
    {
      id: 'subj-cs315',
      name: 'Database Engine Internals',
      code: 'CS 315',
      examDate: dateStr(21),
      examTime: '10:00',
      examLocation: 'Room 302, Computing Hub',
      confidence: 'high',
      color: '#3B6B7A', // Slate Teal
      targetGrade: 'A',
      notes: 'Solid understanding of B+ trees; need quick recap on ARIES recovery protocol.',
      units: [
        { id: 'unit-cs315-1', subjectId: 'subj-cs315', unitNumber: 'Unit 1', title: 'Relational Data Model & SQL', order: 1 },
        { id: 'unit-cs315-2', subjectId: 'subj-cs315', unitNumber: 'Unit 2', title: 'Normalization & Dependencies', order: 2 },
        { id: 'unit-cs315-3', subjectId: 'subj-cs315', unitNumber: 'Unit 3', title: 'Transactions & Concurrency', order: 3 },
        { id: 'unit-cs315-4', subjectId: 'subj-cs315', unitNumber: 'Unit 4', title: 'Storage Engines & B+ Trees', order: 4 },
        { id: 'unit-cs315-5', subjectId: 'subj-cs315', unitNumber: 'Unit 5', title: 'Crash Recovery & Distributed DB', order: 5 },
      ],
      syllabusSource: 'sample',
      createdAt: pastDateStr(25),
    },
    {
      id: 'subj-eng202',
      name: 'Technical Ethics & Communication',
      code: 'ENG 202',
      examDate: dateStr(28),
      examTime: '13:30',
      examLocation: 'Lecture Hall 1',
      confidence: 'high',
      color: '#765C83', // Muted Plum
      targetGrade: 'A',
      notes: 'Case study analysis and professional codes of conduct.',
      units: [
        { id: 'unit-eng202-1', subjectId: 'subj-eng202', unitNumber: 'Unit 1', title: 'Engineering Codes & Whistleblowing', order: 1 },
        { id: 'unit-eng202-2', subjectId: 'subj-eng202', unitNumber: 'Unit 2', title: 'Data Privacy & Algorithmic Bias', order: 2 },
        { id: 'unit-eng202-3', subjectId: 'subj-eng202', unitNumber: 'Unit 3', title: 'Technical Writing & Presentations', order: 3 },
      ],
      syllabusSource: 'sample',
      createdAt: pastDateStr(28),
    },
  ];

  const topics: Topic[] = [
    // CS 301
    {
      id: 'top-cs301-1',
      subjectId: 'subj-cs301',
      title: 'Vector Clocks & Lamport Timestamps',
      unitOrModule: 'Module 1: Time & Ordering',
      status: 'confident',
      lastStudiedAt: pastDateStr(2),
    },
    {
      id: 'top-cs301-2',
      subjectId: 'subj-cs301',
      title: 'Raft Consensus: Leader Election & Log Replication',
      unitOrModule: 'Module 2: Consensus',
      status: 'learning',
      lastStudiedAt: pastDateStr(1),
    },
    {
      id: 'top-cs301-3',
      subjectId: 'subj-cs301',
      title: 'Distributed Transactions & 2-Phase Commit (2PC)',
      unitOrModule: 'Module 3: Transactions',
      status: 'needs_revision',
      lastStudiedAt: pastDateStr(4),
    },
    {
      id: 'top-cs301-4',
      subjectId: 'subj-cs301',
      title: 'CAP Theorem, PACELC & Consistency Models',
      unitOrModule: 'Module 4: Storage Systems',
      status: 'confident',
      lastStudiedAt: pastDateStr(3),
    },
    {
      id: 'top-cs301-5',
      subjectId: 'subj-cs301',
      title: 'Byzantine Fault Tolerance & Paxos Fundamentals',
      unitOrModule: 'Module 5: Advanced Fault Tolerance',
      status: 'not_started',
    },

    // MATH 204
    {
      id: 'top-math204-1',
      subjectId: 'subj-math204',
      title: 'Bayes Rule & Multivariate Conditional Probability',
      unitOrModule: 'Unit 1: Probability Foundations',
      status: 'confident',
      lastStudiedAt: pastDateStr(5),
    },
    {
      id: 'top-math204-2',
      subjectId: 'subj-math204',
      title: 'Poisson Processes & Exponential Waiting Times',
      unitOrModule: 'Unit 2: Counting Processes',
      status: 'learning',
      lastStudiedAt: pastDateStr(2),
    },
    {
      id: 'top-math204-3',
      subjectId: 'subj-math204',
      title: 'Discrete Markov Chains & Stationary Distributions',
      unitOrModule: 'Unit 3: Markov Chains',
      status: 'needs_revision',
      lastStudiedAt: pastDateStr(3),
    },
    {
      id: 'top-math204-4',
      subjectId: 'subj-math204',
      title: 'Continuous-Time Markov Chains & Queueing Theory (M/M/1)',
      unitOrModule: 'Unit 4: Queueing Models',
      status: 'not_started',
    },
    {
      id: 'top-math204-5',
      subjectId: 'subj-math204',
      title: 'Central Limit Theorem & Confidence Bounds',
      unitOrModule: 'Unit 5: Limit Theorems',
      status: 'learning',
      lastStudiedAt: pastDateStr(1),
    },

    // CS 315
    {
      id: 'top-cs315-1',
      subjectId: 'subj-cs315',
      title: 'B+ Tree Index Insertion, Deletion & Concurrency',
      unitOrModule: 'Module 1: Indexing',
      status: 'confident',
      lastStudiedAt: pastDateStr(4),
    },
    {
      id: 'top-cs315-2',
      subjectId: 'subj-cs315',
      title: 'Buffer Pool Replacement Policies (LRU, 2Q, CLOCK)',
      unitOrModule: 'Module 2: Storage Architecture',
      status: 'confident',
      lastStudiedAt: pastDateStr(3),
    },
    {
      id: 'top-cs315-3',
      subjectId: 'subj-cs315',
      title: 'Query Plan Optimization & Cost Estimation Models',
      unitOrModule: 'Module 3: Query Processing',
      status: 'learning',
      lastStudiedAt: pastDateStr(2),
    },
    {
      id: 'top-cs315-4',
      subjectId: 'subj-cs315',
      title: 'Multi-Version Concurrency Control (MVCC) & Isolation Levels',
      unitOrModule: 'Module 4: Concurrency',
      status: 'needs_revision',
      lastStudiedAt: pastDateStr(6),
    },
    {
      id: 'top-cs315-5',
      subjectId: 'subj-cs315',
      title: 'Write-Ahead Logging (WAL) & ARIES Crash Recovery',
      unitOrModule: 'Module 5: Recovery',
      status: 'not_started',
    },

    // ENG 202
    {
      id: 'top-eng202-1',
      subjectId: 'subj-eng202',
      title: 'Therac-25 & Safety-Critical Software Ethics',
      unitOrModule: 'Section 1: Historical Case Studies',
      status: 'confident',
      lastStudiedAt: pastDateStr(6),
    },
    {
      id: 'top-eng202-2',
      subjectId: 'subj-eng202',
      title: 'ACM & IEEE Codes of Ethics Framework',
      unitOrModule: 'Section 2: Professional Standards',
      status: 'confident',
      lastStudiedAt: pastDateStr(5),
    },
    {
      id: 'top-eng202-3',
      subjectId: 'subj-eng202',
      title: 'Executive Briefs, Risk Summaries & Stakeholder Memos',
      unitOrModule: 'Section 3: Written Communication',
      status: 'learning',
      lastStudiedAt: pastDateStr(4),
    },
  ];

  const sessions: StudySession[] = [
    // Today's sessions
    {
      id: 'sess-today-1',
      subjectId: 'subj-cs301',
      title: 'Raft consensus trace walkthrough & log matching exercises',
      date: dateStr(0),
      startTime: '09:00',
      endTime: '10:30',
      durationMinutes: 90,
      completed: true,
      completedAt: new Date(new Date().setHours(10, 30, 0, 0)).toISOString(),
      notes: 'Completed all 4 scenarios from lecture 14 slides.',
      topicId: 'top-cs301-2',
    },
    {
      id: 'sess-today-2',
      subjectId: 'subj-math204',
      title: 'Transition matrix calculations & Chapman-Kolmogorov problems',
      date: dateStr(0),
      startTime: '14:30',
      endTime: '16:00',
      durationMinutes: 90,
      completed: false,
      notes: 'Work through textbook chapter 4 problem set, odd numbers.',
      topicId: 'top-math204-3',
    },
    {
      id: 'sess-today-3',
      subjectId: 'subj-cs301',
      title: '2-Phase Commit timeout & participant failure diagramming',
      date: dateStr(0),
      startTime: '17:00',
      endTime: '18:15',
      durationMinutes: 75,
      completed: false,
      notes: 'High yield for the upcoming exam in 8 days.',
      topicId: 'top-cs301-3',
    },

    // Tomorrow
    {
      id: 'sess-tmrw-1',
      subjectId: 'subj-math204',
      title: 'Poisson arrival rate derivations and compound distributions',
      date: dateStr(1),
      startTime: '10:00',
      endTime: '11:30',
      durationMinutes: 90,
      completed: false,
      topicId: 'top-math204-2',
    },
    {
      id: 'sess-tmrw-2',
      subjectId: 'subj-cs315',
      title: 'Query execution tree cost modeling and hash join algorithms',
      date: dateStr(1),
      startTime: '15:00',
      endTime: '16:30',
      durationMinutes: 90,
      completed: false,
      topicId: 'top-cs315-3',
    },

    // Day 2
    {
      id: 'sess-d2-1',
      subjectId: 'subj-cs301',
      title: 'Past papers timed review: Consensus & Replication section',
      date: dateStr(2),
      startTime: '09:30',
      endTime: '11:00',
      durationMinutes: 90,
      completed: false,
      topicId: 'top-cs301-2',
    },
    {
      id: 'sess-d2-2',
      subjectId: 'subj-eng202',
      title: 'Risk communication memo draft and peer review checklist',
      date: dateStr(2),
      startTime: '14:00',
      endTime: '15:15',
      durationMinutes: 75,
      completed: false,
      topicId: 'top-eng202-3',
    },

    // Day 3
    {
      id: 'sess-d3-1',
      subjectId: 'subj-math204',
      title: 'Central Limit Theorem problem set and hypothesis test bounds',
      date: dateStr(3),
      startTime: '10:30',
      endTime: '12:00',
      durationMinutes: 90,
      completed: false,
      topicId: 'top-math204-5',
    },

    // Yesterday (past completed session for history)
    {
      id: 'sess-past-1',
      subjectId: 'subj-cs315',
      title: 'B+ tree splitting and index lock coupling deep dive',
      date: pastDateStr(1),
      startTime: '10:00',
      endTime: '11:30',
      durationMinutes: 90,
      completed: true,
      completedAt: pastDateStr(1) + 'T11:30:00.000Z',
      notes: 'Fully confident on B+ tree algorithms now.',
      topicId: 'top-cs315-1',
    },
    {
      id: 'sess-past-2',
      subjectId: 'subj-cs301',
      title: 'Vector clock causality proofs and conflict detection',
      date: pastDateStr(2),
      startTime: '15:00',
      endTime: '16:30',
      durationMinutes: 90,
      completed: true,
      completedAt: pastDateStr(2) + 'T16:30:00.000Z',
      notes: 'Reviewed all tutorial solutions.',
      topicId: 'top-cs301-1',
    },
  ];

  const focusRecords: FocusRecord[] = [
    {
      id: 'foc-1',
      subjectId: 'subj-cs301',
      topicId: 'top-cs301-2',
      durationMinutes: 25,
      mode: 'focus',
      completedAt: new Date(new Date().setHours(9, 25, 0, 0)).toISOString(),
      notes: 'Deep focus on Raft paper section 5.',
    },
    {
      id: 'foc-2',
      subjectId: 'subj-cs301',
      topicId: 'top-cs301-2',
      durationMinutes: 25,
      mode: 'focus',
      completedAt: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
      notes: 'Solved log matching inconsistency exercises.',
    },
    {
      id: 'foc-3',
      subjectId: 'subj-cs315',
      topicId: 'top-cs315-1',
      durationMinutes: 30,
      mode: 'focus',
      completedAt: pastDateStr(1) + 'T11:00:00.000Z',
      notes: 'Diagrammed concurrency protocols.',
    },
    {
      id: 'foc-4',
      subjectId: 'subj-math204',
      topicId: 'top-math204-1',
      durationMinutes: 25,
      mode: 'focus',
      completedAt: pastDateStr(2) + 'T14:30:00.000Z',
      notes: 'Reviewed conditional expectation identities.',
    },
  ];

  const routineCommitments: RoutineCommitment[] = [
    // Weekday College: Mon - Fri 09:00 - 16:00 (Fixed)
    {
      id: 'comm-college',
      name: 'College Lectures & Labs',
      category: 'college',
      daysOfWeek: [1, 2, 3, 4, 5],
      startTime: '09:00',
      endTime: '16:00',
      isFixed: true,
      notes: 'Main campus, Computer Science & Engineering department.',
    },
    // Weekday Commute: Mon - Fri morning & afternoon (Fixed)
    {
      id: 'comm-commute-morn',
      name: 'Morning Commute to Campus',
      category: 'commute',
      daysOfWeek: [1, 2, 3, 4, 5],
      startTime: '08:00',
      endTime: '09:00',
      isFixed: true,
      notes: 'Metro & campus shuttle. Light flashcards review on train.',
    },
    {
      id: 'comm-commute-eve',
      name: 'Evening Commute Home',
      category: 'commute',
      daysOfWeek: [1, 2, 3, 4, 5],
      startTime: '16:00',
      endTime: '17:00',
      isFixed: true,
      notes: 'Metro transit.',
    },
    // Daily Sleep: 23:00 - 07:00 (Fixed)
    {
      id: 'comm-sleep',
      name: 'Sleep & Night Rest',
      category: 'sleep',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      startTime: '23:00',
      endTime: '07:00',
      isFixed: true,
      notes: 'Non-negotiable sleep schedule for cognitive consolidation.',
    },
    // Daily Dinner & Family: 19:30 - 20:30 (Fixed)
    {
      id: 'comm-dinner',
      name: 'Dinner & Relaxation',
      category: 'meals',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      startTime: '19:30',
      endTime: '20:30',
      isFixed: true,
    },
    // Saturday Sports / Exercise (Flexible)
    {
      id: 'comm-sports',
      name: 'Badminton / Gym Workout',
      category: 'exercise',
      daysOfWeek: [6],
      startTime: '16:00',
      endTime: '17:30',
      isFixed: false,
      notes: 'Physical recovery and stress relief.',
    },
  ];

  const preferences: StudyPreferences = {
    dailyAvailabilityHours: 3.5,
    preferredSessionDuration: 45,
    sessionPacing: 'short_frequent',
    preferredTimeOfDay: 'evening',
    breakFrequencyMinutes: 45,
    prioritizationStrategy: 'nearest_exam',
    lighterDays: [0], // Sunday is lighter
  };

  const goals: PersonalGoal[] = [
    {
      id: 'goal-1',
      title: 'Finish Distributed Systems & Cloud syllabus with 2 full revisions',
      targetDate: dateStr(7),
      category: 'finish_syllabus',
      completed: false,
      milestones: [
        { id: 'm-1', title: 'Solidify Raft consensus & log replication proofs', completed: true },
        { id: 'm-2', title: 'Complete 2PC failure diagrams & recovery scenarios', completed: false, dueDate: dateStr(2) },
        { id: 'm-3', title: 'Full past paper timed mock under exam conditions', completed: false, dueDate: dateStr(6) },
      ],
    },
    {
      id: 'goal-2',
      title: 'Master Markov Chains transition matrices in Probability',
      targetDate: dateStr(12),
      category: 'nearest_exam',
      completed: false,
      milestones: [
        { id: 'm-4', title: 'Review stationary distribution derivations', completed: true },
        { id: 'm-5', title: 'Solve 10 Chapman-Kolmogorov problems from textbook', completed: false, dueDate: dateStr(4) },
      ],
    },
  ];

  const examChecklist: ExamDayChecklistItem[] = [
    { id: 'chk-1', subjectId: 'subj-cs301', category: 'stationery', text: 'Non-programmable calculator with fresh batteries', checked: true },
    { id: 'chk-2', subjectId: 'subj-cs301', category: 'logistics', text: 'Physical student university ID card & stamped admit card', checked: true },
    { id: 'chk-3', subjectId: 'subj-cs301', category: 'concepts', text: 'Final scan of Raft leader election heartbeat timeouts (150-300ms)', checked: false },
    { id: 'chk-4', subjectId: 'subj-math204', category: 'stationery', text: 'Official 1-page double-sided handwritten formula reference', checked: false },
    { id: 'chk-5', subjectId: 'subj-math204', category: 'logistics', text: 'Extra black gel pens, ruler, and water bottle', checked: true },
  ];

  return {
    version: 1,
    profile: {
      displayName: 'Alex Chen',
      academicYearOrLevel: 'Year 3, Undergraduate Computer Engineering',
      semesterName: 'Final Semester Examinations • Spring 2026',
      primaryGoalDescription: 'Finish all syllabus units and score an A in Distributed Systems while maintaining balanced sleep and college hours.',
      targetExamPeriod: 'April 2026',
      theme: 'system',
      onboarded: true,
      isSampleData: true,
      routineCommitments,
      preferences,
      goals,
      examChecklist,
      planExplanation:
        'Your plan was built around your college hours (9 AM – 4 PM), morning & evening commutes, and preferred evening study periods. Distributed Systems (CS 301) has been prioritized because its exam is in 8 days and 3 topics still require revision.',
      createdAt: pastDateStr(30),
    },
    subjects,
    topics,
    sessions,
    focusRecords,
  };
}
