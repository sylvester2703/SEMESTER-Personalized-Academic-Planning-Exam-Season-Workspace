import { Subject, Topic, StudyPreferences, RoutineCommitment, SyllabusAnalysisReport } from '@/types';
import { differenceInCalendarDays, parseISO, addDays, getDay } from 'date-fns';

/**
 * Calculates a comprehensive, deterministic preparation analysis for a subject syllabus.
 * Distinguishes user-supplied durations from provisional estimates and compares
 * remaining syllabus requirements against available study time before the exam.
 */
export function calculateSyllabusAnalysisReport(
  subject: Subject,
  topics: Topic[],
  preferences: StudyPreferences,
  routine: RoutineCommitment[] = [],
  currentDate: Date = new Date()
): SyllabusAnalysisReport {
  const subjectTopics = topics.filter((t) => t.subjectId === subject.id);
  const totalTopics = subjectTopics.length;

  // Extract units count
  let totalUnits = subject.units?.length || 0;
  if (totalUnits === 0) {
    const uniqueUnits = new Set(
      subjectTopics.map((t) => t.unitOrModule || t.unitId || 'General').filter(Boolean)
    );
    totalUnits = uniqueUnits.size;
  }

  // Count by status
  const notStartedCount = subjectTopics.filter((t) => t.status === 'not_started').length;
  const learningCount = subjectTopics.filter((t) => t.status === 'learning').length;
  const needsRevisionCount = subjectTopics.filter((t) => t.status === 'needs_revision').length;
  const confidentCount = subjectTopics.filter((t) => t.status === 'confident').length;

  const readinessPercentage = totalTopics > 0 ? Math.round((confidentCount / totalTopics) * 100) : 0;

  // Distinguish user-supplied durations from provisional defaults
  let userEstimatedMinutes = 0;
  let provisionalEstimatedMinutes = 0;
  let missingEstimatesCount = 0;
  let hasUserEstimates = false;

  for (const t of subjectTopics) {
    if (t.estimatedMinutes && t.estimatedMinutes > 0) {
      if (t.isProvisionalEstimate) {
        provisionalEstimatedMinutes += t.estimatedMinutes;
      } else {
        userEstimatedMinutes += t.estimatedMinutes;
        hasUserEstimates = true;
      }
    } else {
      missingEstimatesCount++;
      // Apply provisional default 45m for calculation purposes
      provisionalEstimatedMinutes += 45;
    }
  }

  const totalEstimatedMinutes = userEstimatedMinutes + provisionalEstimatedMinutes;

  // Remaining minutes for unfinished topics (not_started, learning, needs_revision)
  const unfinishedTopics = subjectTopics.filter((t) => t.status !== 'confident');
  let remainingMinutes = 0;
  for (const t of unfinishedTopics) {
    remainingMinutes += t.estimatedMinutes || 45;
  }

  // Calculate days and available study minutes before exam
  let daysUntilExam = 0;
  try {
    const examDateObj = parseISO(subject.examDate);
    daysUntilExam = Math.max(0, differenceInCalendarDays(examDateObj, currentDate));
  } catch {
    daysUntilExam = 14; // fallback safe default
  }

  // Calculate available minutes considering student's daily routine & lighter days
  let availableMinutes = 0;
  const dailyAvailabilityMinutes = (preferences.dailyAvailabilityHours || 3.5) * 60;
  const lighterDays = preferences.lighterDays || [];

  for (let d = 0; d < daysUntilExam; d++) {
    const dateOnDay = addDays(currentDate, d);
    const dayOfWeek = getDay(dateOnDay);
    if (lighterDays.includes(dayOfWeek)) {
      availableMinutes += dailyAvailabilityMinutes * 0.4; // reduced on lighter days
    } else {
      availableMinutes += dailyAvailabilityMinutes;
    }
  }

  // Feasibility comparison
  const isFeasible = availableMinutes >= remainingMinutes;
  const shortfallMinutes = isFeasible ? 0 : Math.round(remainingMinutes - availableMinutes);

  // Recommendations and human explanations
  const recommendations: string[] = [];

  if (totalTopics === 0) {
    recommendations.push('Add your syllabus units and topics or import a course outline to generate a study roadmap.');
  } else {
    if (notStartedCount > 0) {
      recommendations.push(`${notStartedCount} topic(s) have not yet been started. Prioritize foundational units first.`);
    }
    if (needsRevisionCount > 0) {
      recommendations.push(`${needsRevisionCount} topic(s) marked for revision. Schedule active recall tests before the exam.`);
    }
    if (missingEstimatesCount > 0) {
      recommendations.push(
        `${missingEstimatesCount} topic(s) are using provisional 45m estimates. Customize topic durations for higher scheduling precision.`
      );
    }
    if (!isFeasible) {
      const shortfallHours = (shortfallMinutes / 60).toFixed(1);
      recommendations.push(
        `Workload shortfall: You have approximately ${shortfallHours} more hours of syllabus material than planned available time before the exam. Focus on high-priority units or consider adjusting study sessions.`
      );
    } else if (remainingMinutes > 0) {
      const remainingHours = (remainingMinutes / 60).toFixed(1);
      recommendations.push(
        `Feasible plan: ~${remainingHours} study hours needed across ${unfinishedTopics.length} remaining topic(s) before the exam.`
      );
    } else {
      recommendations.push('All syllabus topics are marked confident! Maintain retention with periodic spaced revision.');
    }
  }

  // Summary statement
  let summaryExplanation = '';
  if (totalTopics === 0) {
    summaryExplanation = 'No syllabus topics have been entered for this subject yet.';
  } else {
    const remainingHours = (remainingMinutes / 60).toFixed(1);
    const availableHours = (availableMinutes / 60).toFixed(1);
    summaryExplanation = `${totalTopics} topics across ${totalUnits} unit(s). ~${remainingHours}h remaining study time across unfinished topics compared to ~${availableHours}h available study time across the next ${daysUntilExam} day(s).`;
  }

  return {
    subjectId: subject.id,
    subjectName: subject.name,
    subjectCode: subject.code,
    color: subject.color || '#2D5541',
    totalTopics,
    totalUnits,
    notStartedCount,
    learningCount,
    needsRevisionCount,
    confidentCount,
    readinessPercentage,
    userEstimatedMinutes,
    provisionalEstimatedMinutes,
    totalEstimatedMinutes,
    hasUserEstimates,
    missingEstimatesCount,
    daysUntilExam,
    availableStudyMinutesBeforeExam: availableMinutes,
    isFeasible,
    shortfallMinutes,
    summaryExplanation,
    recommendations,
  };
}
