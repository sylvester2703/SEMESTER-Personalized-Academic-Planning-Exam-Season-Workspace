/**
 * Target Grade & Readiness Simulator ("What-If" Engine)
 * Computes exact daily hours and identifies the highest-leverage topic improvements
 * required to reach a desired target grade before examination day.
 */

import { Subject, Topic } from '@/types';
import { differenceInDays, parseISO } from 'date-fns';

export type TargetGradeLevel = 'A+' | 'A' | 'B+' | 'Pass';

export interface GradeTargetDefinition {
  grade: TargetGradeLevel;
  label: string;
  minReadinessPct: number;
  description: string;
}

export const GRADE_TARGETS: GradeTargetDefinition[] = [
  {
    grade: 'A+',
    label: 'A+ (Distinction / 90%+)',
    minReadinessPct: 90,
    description: 'Requires near-total syllabus mastery and high recall confidence across all core units.',
  },
  {
    grade: 'A',
    label: 'A (First Class / 80%+)',
    minReadinessPct: 80,
    description: 'Mastery of all critical core concepts and solid grasp of moderate topics.',
  },
  {
    grade: 'B+',
    label: 'B+ (Upper Second / 70%+)',
    minReadinessPct: 70,
    description: 'Comprehensive coverage of fundamental theory with key problem-solving patterns.',
  },
  {
    grade: 'Pass',
    label: 'Pass / Safe Threshold (60%+)',
    minReadinessPct: 60,
    description: 'Focus on high-yield passing topics to guarantee a safe passing margin.',
  },
];

export interface GradeSimulationResult {
  currentReadinessPct: number;
  currentProjectedGrade: TargetGradeLevel | 'Needs Work';
  targetGrade: TargetGradeLevel;
  targetReadinessPct: number;
  readinessGapPct: number;
  daysRemaining: number;
  requiredTotalStudyHours: number;
  requiredDailyStudyHours: number;
  feasibility: 'comfortable' | 'intense' | 'critical';
  feasibilityMessage: string;
  highestLeverageTopics: {
    topic: Topic;
    impactGainPct: number;
    recommendedAction: string;
  }[];
}

export function simulateGradeTarget(
  subject: Subject,
  topics: Topic[],
  targetGrade: TargetGradeLevel,
  customDailyHours?: number,
  now: Date = new Date()
): GradeSimulationResult {
  const subjTopics = topics.filter((t) => t.subjectId === subject.id);
  const examDate = parseISO(subject.examDate);
  const daysRemaining = Math.max(1, differenceInDays(examDate, now));

  // Weights for topic status
  const STATUS_WEIGHTS = {
    confident: 1.0,
    needs_revision: 0.5,
    learning: 0.3,
    not_started: 0.0,
  };

  // Calculate current readiness
  let currentScoreSum = 0;
  const totalTopics = Math.max(1, subjTopics.length);

  subjTopics.forEach((t) => {
    currentScoreSum += STATUS_WEIGHTS[t.status];
  });

  const currentReadinessPct = Math.round((currentScoreSum / totalTopics) * 100);

  // Determine current projected grade
  let currentProjectedGrade: TargetGradeLevel | 'Needs Work' = 'Needs Work';
  if (currentReadinessPct >= 90) currentProjectedGrade = 'A+';
  else if (currentReadinessPct >= 80) currentProjectedGrade = 'A';
  else if (currentReadinessPct >= 70) currentProjectedGrade = 'B+';
  else if (currentReadinessPct >= 60) currentProjectedGrade = 'Pass';

  const targetDef = GRADE_TARGETS.find((g) => g.grade === targetGrade) || GRADE_TARGETS[1];
  const targetReadinessPct = targetDef.minReadinessPct;
  const readinessGapPct = Math.max(0, targetReadinessPct - currentReadinessPct);

  // Calculate how many topics need to be elevated to 'confident'
  const pointsNeeded = Math.max(0, (targetReadinessPct / 100) * totalTopics - currentScoreSum);

  // Estimate total hours needed: ~1.2 hours per topic gap
  const requiredTotalStudyHours = Math.round(pointsNeeded * 1.5 * 10) / 10;
  const requiredDailyStudyHours = Math.round((requiredTotalStudyHours / daysRemaining) * 10) / 10;

  // Feasibility assessment
  let feasibility: 'comfortable' | 'intense' | 'critical' = 'comfortable';
  let feasibilityMessage = 'Very manageable with your current schedule.';

  if (requiredDailyStudyHours > 3.5) {
    feasibility = 'critical';
    feasibilityMessage = `Demands ~${requiredDailyStudyHours}h daily for this single course. Consider focusing on passing core units first.`;
  } else if (requiredDailyStudyHours > 1.8) {
    feasibility = 'intense';
    feasibilityMessage = `Demands focused revision of ~${requiredDailyStudyHours}h daily. Highly achievable with consistent daily blocks.`;
  } else {
    feasibility = 'comfortable';
    feasibilityMessage = `At ~${requiredDailyStudyHours}h daily across ${daysRemaining} days, you are in a strong position.`;
  }

  // Identify highest leverage topics (topics where moving to confident yields maximum points)
  const candidateTopics = [...subjTopics]
    .filter((t) => t.status !== 'confident')
    .sort((a, b) => {
      // Prioritize hard/urgent topics first
      const weightA = (a.difficultyRating === 'difficult' || a.priority === 'high' ? 2 : 1) + (a.status === 'not_started' ? 2 : 1);
      const weightB = (b.difficultyRating === 'difficult' || b.priority === 'high' ? 2 : 1) + (b.status === 'not_started' ? 2 : 1);
      return weightB - weightA;
    });

  const highestLeverageTopics = candidateTopics.slice(0, 4).map((t) => {
    const gain = Math.round(((1.0 - STATUS_WEIGHTS[t.status]) / totalTopics) * 100);
    return {
      topic: t,
      impactGainPct: gain,
      recommendedAction:
        t.status === 'not_started'
          ? 'First-pass concept breakdown & formula sheet'
          : 'Active recall & practice past paper problems',
    };
  });

  return {
    currentReadinessPct,
    currentProjectedGrade,
    targetGrade,
    targetReadinessPct,
    readinessGapPct,
    daysRemaining,
    requiredTotalStudyHours,
    requiredDailyStudyHours,
    feasibility,
    feasibilityMessage,
    highestLeverageTopics,
  };
}
