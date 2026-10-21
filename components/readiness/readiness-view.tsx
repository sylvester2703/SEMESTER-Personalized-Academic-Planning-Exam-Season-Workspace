'use client';

import React, { useState } from 'react';
import { usePlanner } from '@/lib/context/planner-context';
import { Subject, Topic, TopicStatus, SyllabusUnit } from '@/types';
import { calculateSyllabusAnalysisReport } from '@/lib/calculations';
import { WorkloadEstimator } from './workload-estimator';
import {
  MapPin,
  Plus,
  CheckCircle2,
  Circle,
  AlertCircle,
  BookOpen,
  HelpCircle,
  Edit2,
  Trash2,
  Filter,
  Layers,
  Sparkles,
  Brain,
  Clock,
  Play,
  ChevronDown,
  ChevronRight,
  FileText,
  Upload,
  Check,
} from 'lucide-react';

interface ReadinessViewProps {
  initialSubjectId?: string;
  onOpenNewTopic: (subjectId: string) => void;
  onEditTopic: (topic: Topic) => void;
  onOpenNewSubject: () => void;
  onOpenRecall?: (topic: Topic) => void;
  onStartFocus?: (subjectId: string, topicId?: string) => void;
  onOpenSyllabusManager?: (subjectId: string) => void;
}

export function ReadinessView({
  initialSubjectId,
  onOpenNewTopic,
  onEditTopic,
  onOpenNewSubject,
  onOpenRecall,
  onStartFocus,
  onOpenSyllabusManager,
}: ReadinessViewProps) {
  const {
    data,
    setTopicStatus,
    deleteTopic,
    applyProvisionalEstimates,
    setActiveView,
  } = usePlanner();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    initialSubjectId || (data.subjects.length > 0 ? data.subjects[0].id : '')
  );
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteConfirmTopicId, setDeleteConfirmTopicId] = useState<string | null>(null);
  const [collapsedUnits, setCollapsedUnits] = useState<Record<string, boolean>>({});

  // Fallback if selectedSubjectId is not found
  const activeSubject = data.subjects.find((s) => s.id === selectedSubjectId) || data.subjects[0];

  const subjectTopics = data.topics.filter((t) => t.subjectId === activeSubject?.id);

  const filteredTopics = subjectTopics.filter((t) => {
    if (statusFilter === 'all') return true;
    return t.status === statusFilter;
  });

  // Comprehensive Syllabus Analysis Report
  const analysisReport = activeSubject
    ? calculateSyllabusAnalysisReport(
        activeSubject,
        data.topics,
        data.profile.preferences,
        data.profile.routineCommitments
      )
    : null;

  const statusOptions: { value: TopicStatus; label: string; colorClass: string }[] = [
    { value: 'not_started', label: 'Not started', colorClass: 'bg-paper-200 text-ink-700 dark:bg-paper-800 dark:text-ink-300' },
    { value: 'learning', label: 'Learning', colorClass: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300' },
    { value: 'needs_revision', label: 'Needs revision', colorClass: 'bg-amber-light text-amber-badge dark:bg-amber-950/60 dark:text-amber-300' },
    { value: 'confident', label: 'Confident', colorClass: 'bg-sage-light text-forest dark:bg-forest/25 dark:text-emerald-400' },
  ];

  // Group topics by Unit
  const unitsMap = new Map<string, { unit: SyllabusUnit | null; topics: Topic[] }>();

  // Add registered units on the subject
  if (activeSubject?.units && activeSubject.units.length > 0) {
    activeSubject.units
      .sort((a, b) => a.order - b.order)
      .forEach((u) => {
        unitsMap.set(u.id, { unit: u, topics: [] });
      });
  }

  // Populate topics into units
  const unassignedTopics: Topic[] = [];
  filteredTopics.forEach((t) => {
    if (t.unitId && unitsMap.has(t.unitId)) {
      unitsMap.get(t.unitId)!.topics.push(t);
    } else if (t.unitOrModule) {
      // Find matching unit by title or module name
      let foundKey: string | null = null;
      for (const [key, val] of unitsMap.entries()) {
        if (val.unit && t.unitOrModule.toLowerCase().includes(val.unit.title.toLowerCase())) {
          foundKey = key;
          break;
        }
      }
      if (foundKey) {
        unitsMap.get(foundKey)!.topics.push(t);
      } else {
        // Group under custom unit title
        if (!unitsMap.has(t.unitOrModule)) {
          unitsMap.set(t.unitOrModule, {
            unit: {
              id: t.unitOrModule,
              subjectId: activeSubject.id,
              title: t.unitOrModule,
              order: 99,
            },
            topics: [],
          });
        }
        unitsMap.get(t.unitOrModule)!.topics.push(t);
      }
    } else {
      unassignedTopics.push(t);
    }
  });

  const toggleUnitCollapse = (unitKey: string) => {
    setCollapsedUnits((prev) => ({ ...prev, [unitKey]: !prev[unitKey] }));
  };

  if (data.subjects.length === 0) {
    return (
      <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-lg p-10 text-center shadow-subtle">
        <MapPin className="w-10 h-10 text-ink-400 mx-auto mb-3 opacity-60" />
        <h3 className="font-serif text-xl font-medium text-ink-950 dark:text-ink-50">
          No subjects created yet
        </h3>
        <p className="text-xs text-ink-500 dark:text-ink-400 max-w-sm mx-auto mt-1 mb-5">
          Add subjects first so you can organize your syllabus topics, units, and track confidence.
        </p>
        <button
          onClick={onOpenNewSubject}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-forest text-white text-xs font-medium shadow-sm hover:bg-forest-hover transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Subject</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-paper-300 dark:border-paper-800">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-ink-950 dark:text-ink-50">
            Syllabus Roadmap &amp; Readiness
          </h2>
          <p className="text-xs text-ink-500 dark:text-ink-400 mt-1">
            Break each course down into discrete units, track preparation status, and estimate workloads.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onOpenSyllabusManager && onOpenSyllabusManager(activeSubject?.id)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-white dark:bg-paper-800 border border-paper-300 dark:border-paper-700 text-ink-800 dark:text-ink-200 hover:bg-paper-100 text-xs font-medium shadow-xs transition-all"
          >
            <Layers className="w-3.5 h-3.5 text-forest dark:text-emerald-400" />
            <span>Import / Edit Syllabus</span>
          </button>

          <button
            onClick={() => onOpenNewTopic(activeSubject?.id)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-forest hover:bg-forest-hover text-white text-xs font-medium shadow-subtle transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Topic</span>
          </button>
        </div>
      </div>

      {/* Subject Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-paper-200 dark:border-paper-800">
        {data.subjects.map((subj) => {
          const isSelected = subj.id === activeSubject?.id;
          const subjTopics = data.topics.filter((t) => t.subjectId === subj.id);
          const confident = subjTopics.filter((t) => t.status === 'confident').length;
          const pct = subjTopics.length > 0 ? Math.round((confident / subjTopics.length) * 100) : 0;

          return (
            <button
              key={subj.id}
              onClick={() => setSelectedSubjectId(subj.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                isSelected
                  ? 'bg-paper-200 dark:bg-paper-800 text-ink-950 dark:text-white font-semibold shadow-subtle'
                  : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white hover:bg-paper-100 dark:hover:bg-paper-900'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: subj.color || '#2D5541' }}
              />
              <span>{subj.code || subj.name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-paper-300/60 dark:bg-paper-700 text-ink-700 dark:text-ink-300">
                {pct}%
              </span>
            </button>
          );
        })}
      </div>

      {/* SYLLABUS ANALYSIS SUMMARY BANNER */}
      {analysisReport && (
        <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-xl p-5 sm:p-6 shadow-subtle space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded text-white"
                  style={{ backgroundColor: activeSubject?.color || '#2D5541' }}
                >
                  {activeSubject?.code || 'Course'}
                </span>
                <span className="text-xs text-ink-500">
                  Exam Date: <strong>{activeSubject?.examDate}</strong> ({analysisReport.daysUntilExam} days remaining)
                </span>
                {activeSubject?.syllabusSource && (
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-paper-100 dark:bg-paper-800 text-ink-500">
                    Source: {activeSubject.syllabusSource}
                  </span>
                )}
              </div>
              <h3 className="font-serif text-2xl font-semibold text-ink-950 dark:text-ink-50">
                {activeSubject?.name}
              </h3>
              <p className="text-xs text-ink-600 dark:text-ink-400 mt-1 max-w-2xl leading-relaxed">
                {analysisReport.summaryExplanation}
              </p>
            </div>

            {/* Quick Metrics Badges */}
            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <div className="text-center px-3.5 py-2.5 rounded-lg bg-paper-100 dark:bg-paper-800 min-w-[75px]">
                <span className="block font-serif text-2xl font-semibold text-ink-950 dark:text-white tabular-nums">
                  {analysisReport.readinessPercentage}%
                </span>
                <span className="text-[10px] uppercase tracking-wider text-ink-500 font-medium">Readiness</span>
              </div>

              <div className="text-center px-3.5 py-2.5 rounded-lg bg-paper-100 dark:bg-paper-800 min-w-[75px]">
                <span className="block font-serif text-2xl font-semibold text-forest dark:text-emerald-400 tabular-nums">
                  {analysisReport.confidentCount}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-ink-500 font-medium">Confident</span>
              </div>

              <div className="text-center px-3.5 py-2.5 rounded-lg bg-paper-100 dark:bg-paper-800 min-w-[75px]">
                <span className="block font-serif text-2xl font-semibold text-amber-badge dark:text-amber-400 tabular-nums">
                  {analysisReport.notStartedCount + analysisReport.needsRevisionCount}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-ink-500 font-medium">To Review</span>
              </div>

              <div className="text-center px-3.5 py-2.5 rounded-lg bg-paper-100 dark:bg-paper-800 min-w-[85px]">
                <span className="block font-serif text-2xl font-semibold text-ink-900 dark:text-ink-100 tabular-nums">
                  {(analysisReport.totalEstimatedMinutes / 60).toFixed(1)}h
                </span>
                <span className="text-[10px] uppercase tracking-wider text-ink-500 font-medium">Est. Workload</span>
              </div>
            </div>
          </div>

          {/* Progress bar with transparent arithmetic explanation */}
          <div>
            <div className="w-full bg-paper-200 dark:bg-paper-800 h-2.5 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-forest dark:bg-emerald-500 transition-all duration-300"
                style={{ width: `${analysisReport.readinessPercentage}%` }}
                title={`Confident: ${analysisReport.confidentCount} of ${analysisReport.totalTopics} topics`}
              />
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between text-[11px] text-ink-500 dark:text-ink-400">
              <span>
                Readiness Formula: <strong>{analysisReport.confidentCount} confident</strong> ÷ {analysisReport.totalTopics} total topics = {analysisReport.readinessPercentage}%
              </span>
              <span className="italic">
                *Maps completion status, not guaranteed exam marks.
              </span>
            </div>
          </div>

          {/* Feasibility & Recommendations Alert */}
          {analysisReport.totalTopics > 0 && (
            <div
              className={`p-3.5 rounded-lg border text-xs flex items-start gap-3 ${
                analysisReport.isFeasible
                  ? 'bg-sage-light/30 border-sage-dark/30 text-forest dark:bg-forest/10 dark:border-emerald-800/40 dark:text-emerald-300'
                  : 'bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200'
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold block">
                  {analysisReport.isFeasible ? 'Feasible Preparation Runway' : 'Workload Shortfall Notice'}
                </span>
                <ul className="space-y-0.5 list-disc pl-4 text-[11px] opacity-90">
                  {analysisReport.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Provisional estimates quick tool */}
          {analysisReport.missingEstimatesCount > 0 && (
            <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-paper-50 dark:bg-paper-800/50 border border-paper-200 dark:border-paper-700/60 text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="text-ink-700 dark:text-ink-300">
                  {analysisReport.missingEstimatesCount} topic(s) lack estimated study duration.
                </span>
              </div>
              <button
                onClick={() => applyProvisionalEstimates(activeSubject.id, 45)}
                className="px-2.5 py-1 rounded bg-white dark:bg-paper-800 border border-paper-300 dark:border-paper-700 text-ink-800 dark:text-ink-200 hover:bg-paper-100 font-medium text-[11px] transition-colors"
              >
                Apply 45m Provisional Estimates
              </button>
            </div>
          )}
        </div>
      )}

      {/* FILTER & TOPIC MANAGER */}
      <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-xl p-5 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-paper-200 dark:border-paper-800">
          <div className="flex items-center gap-1.5 text-xs text-ink-600 dark:text-ink-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter topics:</span>
            <div className="flex items-center gap-1 ml-1 flex-wrap">
              {['all', 'not_started', 'learning', 'needs_revision', 'confident'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2 py-0.5 rounded text-[11px] capitalize transition-colors ${
                    statusFilter === st
                      ? 'bg-paper-300 dark:bg-paper-700 text-ink-950 dark:text-white font-medium'
                      : 'text-ink-500 hover:text-ink-900 dark:hover:text-ink-200'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <span className="text-xs text-ink-400 font-mono">
            Showing {filteredTopics.length} of {subjectTopics.length} topics
          </span>
        </div>

        {/* Empty state if subject has no topics */}
        {subjectTopics.length === 0 ? (
          <div className="py-12 text-center text-xs text-ink-500 dark:text-ink-400 space-y-3">
            <BookOpen className="w-8 h-8 text-ink-300 dark:text-ink-600 mx-auto" />
            <p className="font-serif text-base text-ink-900 dark:text-ink-100 font-medium">
              No syllabus roadmap entered for {activeSubject?.name}.
            </p>
            <p className="max-w-sm mx-auto text-ink-500">
              Paste your course outline, upload a syllabus file, or load a realistic academic sample.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => onOpenSyllabusManager && onOpenSyllabusManager(activeSubject?.id)}
                className="px-4 py-2 rounded-md bg-forest hover:bg-forest-hover text-white font-medium text-xs shadow-subtle transition-all"
              >
                Import Course Syllabus
              </button>
            </div>
          </div>
        ) : (
          /* ACCORDION BY UNIT */
          <div className="space-y-4">
            {Array.from(unitsMap.entries()).map(([unitKey, { unit, topics }]) => {
              if (topics.length === 0 && statusFilter !== 'all') return null;
              const isCollapsed = collapsedUnits[unitKey] ?? false;
              const unitConfidentCount = topics.filter((t) => t.status === 'confident').length;
              const unitPct = topics.length > 0 ? Math.round((unitConfidentCount / topics.length) * 100) : 0;

              return (
                <div
                  key={unitKey}
                  className="border border-paper-200 dark:border-paper-800 rounded-lg overflow-hidden bg-white dark:bg-paper-900"
                >
                  {/* Unit Accordion Header */}
                  <div
                    onClick={() => toggleUnitCollapse(unitKey)}
                    className="p-3.5 bg-paper-50 dark:bg-paper-800/60 hover:bg-paper-100/80 dark:hover:bg-paper-800 cursor-pointer flex items-center justify-between gap-3 transition-colors select-none"
                  >
                    <div className="flex items-center gap-2.5">
                      {isCollapsed ? (
                        <ChevronRight className="w-4 h-4 text-ink-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-ink-400 shrink-0" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-ink-950 dark:text-ink-50">
                            {unit?.unitNumber ? `${unit.unitNumber}: ` : ''}{unit?.title || unitKey}
                          </span>
                          <span className="text-[10px] text-ink-400 font-mono">
                            ({topics.length} topics)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="w-20 bg-paper-200 dark:bg-paper-700 h-1.5 rounded-full overflow-hidden hidden sm:block">
                        <div
                          className="h-full bg-forest dark:bg-emerald-500"
                          style={{ width: `${unitPct}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-ink-600 dark:text-ink-300">
                        {unitConfidentCount}/{topics.length} ({unitPct}%)
                      </span>
                    </div>
                  </div>

                  {/* Unit Topics List */}
                  {!isCollapsed && (
                    <div className="divide-y divide-paper-200 dark:divide-paper-800/80 px-4">
                      {topics.map((topic) => {
                        const isConfirming = deleteConfirmTopicId === topic.id;

                        return (
                          <div
                            key={topic.id}
                            className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                          >
                            {/* Left: Title, Subtopics, Estimated Duration */}
                            <div className="flex-1 min-w-0 pr-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-xs font-semibold text-ink-950 dark:text-ink-50 leading-snug">
                                  {topic.title}
                                </h4>

                                {topic.estimatedMinutes && (
                                  <span
                                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded flex items-center gap-1 ${
                                      topic.isProvisionalEstimate
                                        ? 'bg-paper-200 dark:bg-paper-800 text-ink-600 dark:text-ink-400'
                                        : 'bg-sage-light text-forest dark:bg-forest/20 dark:text-emerald-400 font-medium'
                                    }`}
                                    title={topic.isProvisionalEstimate ? 'Provisional estimate' : 'Student-specified duration'}
                                  >
                                    <Clock className="w-2.5 h-2.5" />
                                    <span>{topic.estimatedMinutes}m</span>
                                    {topic.isProvisionalEstimate && <span className="opacity-70">(prov)</span>}
                                  </span>
                                )}

                                {topic.priority === 'high' && (
                                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                    High Priority
                                  </span>
                                )}
                              </div>

                              {/* Subtopics chips if present */}
                              {topic.subtopics && topic.subtopics.length > 0 && (
                                <div className="flex items-center gap-1 mt-1 flex-wrap">
                                  {topic.subtopics.map((st, sIdx) => (
                                    <span
                                      key={sIdx}
                                      className="text-[10px] px-1.5 py-0.2 rounded bg-paper-100 dark:bg-paper-800 text-ink-500"
                                    >
                                      {st}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {topic.notes && (
                                <p className="text-[11px] text-ink-500 dark:text-ink-400 mt-0.5 italic">
                                  {topic.notes}
                                </p>
                              )}
                            </div>

                            {/* Right: Status selector button group & Actions */}
                            <div className="flex items-center gap-2 shrink-0 flex-wrap">
                              {/* 4 Status Pills */}
                              <div className="flex items-center rounded-md border border-paper-300 dark:border-paper-700 p-0.5 bg-paper-50 dark:bg-paper-800">
                                {statusOptions.map((opt) => {
                                  const isCurrent = topic.status === opt.value;
                                  return (
                                    <button
                                      key={opt.value}
                                      onClick={() => setTopicStatus(topic.id, opt.value)}
                                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                                        isCurrent
                                          ? `${opt.colorClass} shadow-xs font-semibold`
                                          : 'text-ink-500 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
                                      }`}
                                    >
                                      {opt.label}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Contextual Action per Status */}
                              {topic.status === 'not_started' && onStartFocus && (
                                <button
                                  onClick={() => onStartFocus(activeSubject.id, topic.id)}
                                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-forest text-white hover:bg-forest-hover shadow-xs transition-colors"
                                  title="Launch focus timer for this topic"
                                >
                                  <Play className="w-2.5 h-2.5 fill-current" />
                                  <span>Study</span>
                                </button>
                              )}

                              {topic.status === 'learning' && onStartFocus && (
                                <button
                                  onClick={() => onStartFocus(activeSubject.id, topic.id)}
                                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-sky-600 text-white hover:bg-sky-700 shadow-xs transition-colors"
                                  title="Resume focused study"
                                >
                                  <Play className="w-2.5 h-2.5 fill-current" />
                                  <span>Resume</span>
                                </button>
                              )}

                              {topic.status === 'needs_revision' && onOpenRecall && (
                                <button
                                  onClick={() => onOpenRecall(topic)}
                                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium text-amber-800 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-300 dark:border-amber-800 transition-colors"
                                  title="Self-test memory retrieval without notes"
                                >
                                  <Brain className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                                  <span>Recall Test</span>
                                </button>
                              )}

                              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => onEditTopic(topic)}
                                  className="p-1 text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 rounded"
                                  title="Edit topic"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>

                                {isConfirming ? (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => {
                                        deleteTopic(topic.id);
                                        setDeleteConfirmTopicId(null);
                                      }}
                                      className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[10px]"
                                    >
                                      Yes
                                    </button>
                                    <button
                                      onClick={() => setDeleteConfirmTopicId(null)}
                                      className="px-1 py-0.5 text-ink-400 text-[10px]"
                                    >
                                      No
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setDeleteConfirmTopicId(topic.id)}
                                    className="p-1 text-ink-400 hover:text-rose-600 rounded"
                                    title="Delete topic"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* UNASSIGNED TOPICS (if any) */}
            {unassignedTopics.length > 0 && (
              <div className="border border-paper-200 dark:border-paper-800 rounded-lg p-3 bg-paper-50/50 dark:bg-paper-800/30">
                <h4 className="text-xs font-semibold text-ink-700 dark:text-ink-300 mb-2">
                  General Syllabus Topics ({unassignedTopics.length})
                </h4>
                <div className="divide-y divide-paper-200 dark:divide-paper-800/80">
                  {unassignedTopics.map((topic) => (
                    <div key={topic.id} className="py-2 flex items-center justify-between gap-2">
                      <span className="text-xs text-ink-900 dark:text-ink-100">{topic.title}</span>
                      <button
                        onClick={() => onEditTopic(topic)}
                        className="text-[10px] text-forest dark:text-emerald-400 hover:underline"
                      >
                        Assign Unit
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
