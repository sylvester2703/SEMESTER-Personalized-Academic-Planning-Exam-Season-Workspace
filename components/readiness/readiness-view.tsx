'use client';

import React, { useState } from 'react';
import { usePlanner } from '@/lib/context/planner-context';
import { Subject, Topic, TopicStatus } from '@/types';
import { calculateSubjectReadiness } from '@/lib/calculations';
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
} from 'lucide-react';

interface ReadinessViewProps {
  initialSubjectId?: string;
  onOpenNewTopic: (subjectId: string) => void;
  onEditTopic: (topic: Topic) => void;
  onOpenNewSubject: () => void;
  onOpenRecall?: (topic: Topic) => void;
}

export function ReadinessView({
  initialSubjectId,
  onOpenNewTopic,
  onEditTopic,
  onOpenNewSubject,
  onOpenRecall,
}: ReadinessViewProps) {
  const {
    data,
    setTopicStatus,
    deleteTopic,
    setActiveView,
  } = usePlanner();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    initialSubjectId || (data.subjects.length > 0 ? data.subjects[0].id : '')
  );
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteConfirmTopicId, setDeleteConfirmTopicId] = useState<string | null>(null);

  // Fallback if selectedSubjectId is not found
  const activeSubject = data.subjects.find((s) => s.id === selectedSubjectId) || data.subjects[0];

  const subjectTopics = data.topics.filter((t) => t.subjectId === activeSubject?.id);

  const filteredTopics = subjectTopics.filter((t) => {
    if (statusFilter === 'all') return true;
    return t.status === statusFilter;
  });

  const readiness = calculateSubjectReadiness(subjectTopics);

  const statusOptions: { value: TopicStatus; label: string; colorClass: string }[] = [
    { value: 'not_started', label: 'Not started', colorClass: 'bg-paper-200 text-ink-700 dark:bg-paper-800 dark:text-ink-300' },
    { value: 'learning', label: 'Learning', colorClass: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300' },
    { value: 'needs_revision', label: 'Needs revision', colorClass: 'bg-amber-light text-amber-badge dark:bg-amber-950/60 dark:text-amber-300' },
    { value: 'confident', label: 'Confident', colorClass: 'bg-sage-light text-forest dark:bg-forest/25 dark:text-emerald-400' },
  ];

  if (data.subjects.length === 0) {
    return (
      <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-lg p-10 text-center shadow-subtle">
        <MapPin className="w-10 h-10 text-ink-400 mx-auto mb-3 opacity-60" />
        <h3 className="font-serif text-xl font-medium text-ink-950 dark:text-ink-50">
          No subjects created yet
        </h3>
        <p className="text-xs text-ink-500 dark:text-ink-400 max-w-sm mx-auto mt-1 mb-5">
          Add subjects first so you can organize your syllabus topics and track confidence.
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
            Syllabus Readiness Map
          </h2>
          <p className="text-xs text-ink-500 dark:text-ink-400 mt-1">
            Track syllabus mastery by unit. Transparent progress based on topics marked "Confident".
          </p>
        </div>

        <button
          onClick={() => onOpenNewTopic(activeSubject?.id)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-forest hover:bg-forest-hover text-white text-xs font-medium shadow-subtle transition-all self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Topic to Syllabus</span>
        </button>
      </div>

      {/* Syllabus Workload Estimator */}
      <WorkloadEstimator />

      {/* Subject Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-paper-200 dark:border-paper-800">
        {data.subjects.map((subj) => {
          const isSelected = subj.id === activeSubject?.id;
          const subjReadiness = calculateSubjectReadiness(data.topics, subj.id);

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
                {subjReadiness.percentage}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Subject Summary Banner */}
      <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-lg p-5 sm:p-6 shadow-subtle">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded text-white"
                style={{ backgroundColor: activeSubject?.color || '#2D5541' }}
              >
                {activeSubject?.code || 'Course'}
              </span>
              <span className="text-xs text-ink-500">
                Exam on {activeSubject?.examDate}
              </span>
            </div>
            <h3 className="font-serif text-2xl font-semibold text-ink-950 dark:text-ink-50">
              {activeSubject?.name}
            </h3>
            <p className="text-xs text-ink-600 dark:text-ink-400 max-w-xl">
              {activeSubject?.notes || 'Track each topic from first pass to exam confidence.'}
            </p>
          </div>

          {/* Stats Badges */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-center px-3 py-2 rounded bg-paper-100 dark:bg-paper-800 min-w-[70px]">
              <span className="block font-serif text-2xl font-semibold text-ink-950 dark:text-white tabular-nums">
                {readiness.percentage}%
              </span>
              <span className="text-[10px] uppercase text-ink-500 font-medium">Readiness</span>
            </div>

            <div className="text-center px-3 py-2 rounded bg-paper-100 dark:bg-paper-800 min-w-[70px]">
              <span className="block font-serif text-2xl font-semibold text-forest dark:text-emerald-400 tabular-nums">
                {readiness.confidentCount}
              </span>
              <span className="text-[10px] uppercase text-ink-500 font-medium">Confident</span>
            </div>

            <div className="text-center px-3 py-2 rounded bg-paper-100 dark:bg-paper-800 min-w-[70px]">
              <span className="block font-serif text-2xl font-semibold text-amber-badge dark:text-amber-400 tabular-nums">
                {readiness.needsAttentionCount}
              </span>
              <span className="text-[10px] uppercase text-ink-500 font-medium">Attention</span>
            </div>
          </div>
        </div>

        {/* Transparent progress bar */}
        <div className="mt-5">
          <div className="w-full bg-paper-200 dark:bg-paper-800 h-2.5 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-forest dark:bg-emerald-500 transition-all duration-300"
              style={{ width: `${readiness.percentage}%` }}
              title={`Confident: ${readiness.confidentCount}/${readiness.totalTopics}`}
            />
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between text-[11px] text-ink-500 dark:text-ink-400">
            <span>
              Calculation: <strong>{readiness.confidentCount} confident</strong> ÷ {readiness.totalTopics} total topics = {readiness.percentage}%
            </span>
            <span className="italic">
              *Readiness maps coverage, not guaranteed grades.
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Topic List Section */}
      <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-lg p-5 shadow-subtle">
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

        {/* Topic rows */}
        <div className="mt-4 divide-y divide-paper-200 dark:divide-paper-800/80">
          {filteredTopics.length === 0 ? (
            <div className="py-8 text-center text-xs text-ink-500 dark:text-ink-400">
              {subjectTopics.length === 0 ? (
                <div>
                  <p>No syllabus topics added for this subject yet.</p>
                  <button
                    onClick={() => onOpenNewTopic(activeSubject?.id)}
                    className="mt-2 text-forest dark:text-emerald-400 font-medium hover:underline"
                  >
                    + Add the first unit or lecture topic
                  </button>
                </div>
              ) : (
                <p>No topics match the selected status filter.</p>
              )}
            </div>
          ) : (
            filteredTopics.map((topic) => {
              const isConfirming = deleteConfirmTopicId === topic.id;

              return (
                <div
                  key={topic.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  {/* Left: Title & Unit */}
                  <div className="flex-1 min-w-0 pr-2">
                    {topic.unitOrModule && (
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-ink-400 block mb-0.5">
                        {topic.unitOrModule}
                      </span>
                    )}
                    <h4 className="text-sm font-medium text-ink-950 dark:text-ink-50 leading-snug">
                      {topic.title}
                    </h4>
                    {topic.notes && (
                      <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5 italic">
                        {topic.notes}
                      </p>
                    )}
                  </div>

                  {/* Right: Status selector button group & Actions */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <div className="flex items-center rounded-md border border-paper-300 dark:border-paper-700 p-0.5 bg-paper-50 dark:bg-paper-800">
                      {statusOptions.map((opt) => {
                        const isCurrent = topic.status === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => setTopicStatus(topic.id, opt.value)}
                            className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
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

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      {onOpenRecall && (
                        <button
                          onClick={() => onOpenRecall(topic)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-amber-800 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-300 dark:border-amber-800 transition-colors"
                          title="Self-test memory retrieval without notes"
                        >
                          <Brain className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          <span>Test Recall</span>
                        </button>
                      )}

                      <button
                        onClick={() => onEditTopic(topic)}
                        className="p-1 text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 rounded"
                        title="Edit topic"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
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
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
