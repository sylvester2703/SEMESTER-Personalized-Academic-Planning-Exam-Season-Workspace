'use client';

import React, { useState } from 'react';
import { usePlanner } from '@/lib/context/planner-context';
import { SyllabusUnit, Topic, Subject } from '@/types';
import {
  parseSyllabusText,
  extractTextFromFile,
  SAMPLE_SYLLABUS_PRESETS,
  SampleSyllabusPreset,
} from '@/lib/syllabus/parser';
import {
  X,
  FileText,
  Upload,
  BookOpen,
  Sparkles,
  Check,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  Clock,
  Layers,
  ArrowRight,
  HelpCircle,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

interface SyllabusManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetSubjectId?: string;
}

type TabType = 'paste' | 'upload' | 'sample' | 'manual';

export function SyllabusManagerModal({
  isOpen,
  onClose,
  targetSubjectId,
}: SyllabusManagerModalProps) {
  const { data, importSyllabusForSubject, addToast } = usePlanner();

  const [activeTab, setActiveTab] = useState<TabType>('paste');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    targetSubjectId || (data.subjects[0]?.id ?? '')
  );

  // Paste Tab State
  const [pastedText, setPastedText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedUnits, setParsedUnits] = useState<SyllabusUnit[]>([]);
  const [parsedTopics, setParsedTopics] = useState<Omit<Topic, 'id'>[]>([]);
  const [unparsedLines, setUnparsedLines] = useState<string[]>([]);
  const [parseSummary, setParseSummary] = useState('');
  const [replaceExisting, setReplaceExisting] = useState(true);

  // Upload Tab State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Manual Tab State
  const [manualUnits, setManualUnits] = useState<{ id: string; title: string; unitNumber: string; topics: { title: string; minutes: number }[] }[]>([
    {
      id: 'm-unit-1',
      unitNumber: 'Unit 1',
      title: 'Foundations & Architecture',
      topics: [{ title: 'System Overview & Core Concepts', minutes: 45 }],
    },
  ]);
  const [newUnitTitle, setNewUnitTitle] = useState('');

  if (!isOpen) return null;

  const currentSubject = data.subjects.find((s) => s.id === selectedSubjectId) || data.subjects[0];

  // Handle Text Parsing (Powered by Gemini AI with deterministic fallback)
  const handleParseText = async () => {
    if (!pastedText.trim() || !selectedSubjectId) return;
    setIsParsing(true);
    try {
      const res = await fetch('/api/gemini/analyze-syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: pastedText }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.units) && data.units.length > 0) {
        const mappedUnits: SyllabusUnit[] = data.units.map((u: any, idx: number) => ({
          id: `ai-unit-${selectedSubjectId}-${idx + 1}-${Date.now()}`,
          subjectId: selectedSubjectId,
          unitNumber: u.unitNumber || idx + 1,
          title: u.title || `Unit ${idx + 1}`,
          order: idx + 1,
        }));

        const mappedTopics: Omit<Topic, 'id'>[] = [];
        data.units.forEach((u: any, uIdx: number) => {
          const parentUnitId = mappedUnits[uIdx].id;
          (u.topics || []).forEach((t: any, tIdx: number) => {
            mappedTopics.push({
              subjectId: selectedSubjectId,
              unitId: parentUnitId,
              unitOrModule: `${u.unitNumber || uIdx + 1}: ${u.title}`,
              title: t.title,
              status: 'not_started',
              estimatedMinutes: t.estimatedMinutes || 45,
              isProvisionalEstimate: false,
              priority: t.difficulty === 'difficult' ? 'high' : 'medium',
              order: tIdx + 1,
            });
          });
        });

        setParsedUnits(mappedUnits);
        setParsedTopics(mappedTopics);
        setUnparsedLines([]);
        setParseSummary(`AI-Parsed: Extracted ${mappedUnits.length} units and ${mappedTopics.length} topics via Gemini AI.`);
        setIsParsing(false);
        return;
      }
    } catch (err) {
      console.warn('Gemini extraction failed or offline, falling back to local heuristic parser:', err);
    }

    // Local deterministic fallback
    const result = parseSyllabusText(pastedText, selectedSubjectId);
    setParsedUnits(result.units);
    setParsedTopics(result.topics);
    setUnparsedLines(result.unparsedLines);
    setParseSummary(result.summary);
    setIsParsing(false);
  };

  // Handle File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setUploadError(null);
    setIsUploading(true);

    const extraction = await extractTextFromFile(file);

    if (extraction.error) {
      setUploadError(extraction.error);
      setIsUploading(false);
      return;
    }

    setPastedText(extraction.text);
    const result = parseSyllabusText(extraction.text, selectedSubjectId);
    setParsedUnits(result.units);
    setParsedTopics(result.topics);
    setUnparsedLines(result.unparsedLines);
    setParseSummary(result.summary);
    setIsUploading(false);
  };

  // Handle Preset Selection
  const handleSelectPreset = (preset: SampleSyllabusPreset) => {
    setPastedText(preset.rawText);
    const result = parseSyllabusText(preset.rawText, selectedSubjectId);
    setParsedUnits(result.units);
    setParsedTopics(result.topics);
    setUnparsedLines(result.unparsedLines);
    setParseSummary(`Loaded academic sample: "${preset.subjectName}" (${result.units.length} units, ${result.topics.length} topics).`);
  };

  // Save parsed result into Subject
  const handleApplyToSubject = () => {
    if (parsedTopics.length === 0) {
      addToast({
        type: 'warning',
        title: 'No topics to save',
        description: 'Please paste or extract at least one syllabus topic.',
      });
      return;
    }

    importSyllabusForSubject(
      selectedSubjectId,
      parsedUnits,
      parsedTopics,
      pastedText,
      activeTab === 'sample' ? 'sample' : activeTab === 'upload' ? 'uploaded' : 'pasted',
      replaceExisting
    );

    onClose();
  };

  // Save manual builder result into Subject
  const handleApplyManual = () => {
    const units: SyllabusUnit[] = manualUnits.map((u, idx) => ({
      id: `unit-${selectedSubjectId}-${idx + 1}-${Date.now()}`,
      subjectId: selectedSubjectId,
      unitNumber: u.unitNumber,
      title: u.title,
      order: idx + 1,
    }));

    const topics: Omit<Topic, 'id'>[] = [];
    manualUnits.forEach((u, uIdx) => {
      const parentUnitId = units[uIdx].id;
      u.topics.forEach((t, tIdx) => {
        topics.push({
          subjectId: selectedSubjectId,
          unitId: parentUnitId,
          unitOrModule: `${u.unitNumber}: ${u.title}`,
          title: t.title,
          status: 'not_started',
          estimatedMinutes: t.minutes || 45,
          isProvisionalEstimate: false,
          priority: 'medium',
          order: tIdx + 1,
        });
      });
    });

    if (topics.length === 0) {
      addToast({
        type: 'warning',
        title: 'Empty syllabus',
        description: 'Add at least one unit and topic.',
      });
      return;
    }

    importSyllabusForSubject(selectedSubjectId, units, topics, undefined, 'manual', replaceExisting);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-ink-950/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-xl max-w-3xl w-full p-5 sm:p-7 shadow-elevated animate-in zoom-in-95 duration-150 relative my-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded text-ink-400 hover:text-ink-800 dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 rounded-md bg-forest/10 text-forest dark:text-emerald-400">
            <Layers className="w-4 h-4" />
          </span>
          <h3 className="font-serif text-xl sm:text-2xl font-semibold text-ink-950 dark:text-ink-50">
            Syllabus Roadmap Manager
          </h3>
        </div>

        <p className="text-xs text-ink-500 dark:text-ink-400 mb-5">
          Transform your course syllabus into discrete units and topics to power realistic workloads and next-step recommendations.
        </p>

        {/* Target Subject Selector */}
        <div className="bg-paper-50 dark:bg-paper-800/60 border border-paper-200 dark:border-paper-700/80 rounded-lg p-3 sm:p-4 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300">
              Apply syllabus to subject:
            </label>
            <p className="text-[11px] text-ink-500 dark:text-ink-400">
              Select which course roadmap you are configuring.
            </p>
          </div>

          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="text-xs rounded border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 p-2 font-medium text-ink-900 dark:text-ink-100 min-w-[200px]"
          >
            {data.subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code ? `${s.code} — ` : ''}{s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-paper-200 dark:border-paper-800 pb-3 mb-5 overflow-x-auto">
          {[
            { id: 'paste', label: 'Paste Syllabus Text', icon: FileText },
            { id: 'upload', label: 'Upload Document (.pdf/.txt)', icon: Upload },
            { id: 'sample', label: 'Sample Presets', icon: BookOpen },
            { id: 'manual', label: 'Manual Builder', icon: Plus },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-forest text-white shadow-xs font-semibold'
                    : 'text-ink-600 dark:text-ink-400 hover:bg-paper-100 dark:hover:bg-paper-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: PASTE SYLLABUS TEXT */}
        {activeTab === 'paste' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-ink-700 dark:text-ink-300">
                  Paste copied course outline or syllabus text:
                </label>
                <span className="text-[11px] text-ink-400">
                  Recognises &quot;Unit 1&quot;, &quot;Module I&quot;, &quot;Chapter&quot;, and bullet points
                </span>
              </div>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                rows={7}
                placeholder="Unit 1: Relational Algebra & SQL&#10;- Entity-Relationship Modeling (45m) [Important]&#10;- Relational Algebra Operations: Select, Project, Join (60m)&#10;&#10;Unit 2: Normalization & Transactions&#10;- 1NF, 2NF, 3NF and BCNF Normal Forms (90m)&#10;- ACID Properties and Concurrency Control (45m)"
                className="w-full text-xs font-mono rounded border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 p-3 text-ink-900 dark:text-ink-100 focus:outline-forest"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleParseText}
                disabled={!pastedText.trim() || isParsing}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-forest hover:bg-forest-hover text-white text-xs font-medium shadow-subtle transition-all disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isParsing ? 'Analyzing text...' : 'Parse Syllabus Structure'}</span>
              </button>

              {parsedTopics.length > 0 && (
                <span className="text-xs text-forest dark:text-emerald-400 font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>{parseSummary}</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: UPLOAD DOCUMENT */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-paper-300 dark:border-paper-700 rounded-xl p-6 text-center hover:border-forest/50 transition-colors bg-paper-50 dark:bg-paper-800/40">
              <Upload className="w-8 h-8 text-ink-400 mx-auto mb-2 opacity-70" />
              <h4 className="text-xs font-semibold text-ink-900 dark:text-ink-100 mb-1">
                Upload Syllabus Document
              </h4>
              <p className="text-[11px] text-ink-500 dark:text-ink-400 max-w-md mx-auto mb-3">
                Supports text-based <strong>.pdf</strong>, <strong>.txt</strong>, and <strong>.md</strong> files up to 10MB.
              </p>

              <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-white dark:bg-paper-800 border border-paper-300 dark:border-paper-700 text-xs font-medium text-ink-700 dark:text-ink-200 hover:bg-paper-100 cursor-pointer shadow-xs">
                <span>Browse File</span>
                <input
                  type="file"
                  accept=".pdf,.txt,.md,.text"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {uploadedFile && (
                <p className="text-xs text-ink-600 dark:text-ink-300 mt-2 font-mono">
                  Selected: {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            {uploadError && (
              <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <strong className="font-semibold block mb-0.5">Extraction Notice</strong>
                  <span>{uploadError}</span>
                </div>
              </div>
            )}

            {isUploading && (
              <p className="text-xs text-ink-500 animate-pulse text-center">
                Reading document and parsing syllabus units...
              </p>
            )}
          </div>
        )}

        {/* TAB 3: SAMPLE PRESETS */}
        {activeTab === 'sample' && (
          <div className="space-y-3">
            <p className="text-xs text-ink-600 dark:text-ink-300">
              Explore SEMESTER with comprehensive, pre-structured university syllabuses:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SAMPLE_SYLLABUS_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className="p-3.5 rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800/70 hover:border-forest cursor-pointer transition-all hover:shadow-subtle group"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-forest/10 text-forest dark:text-emerald-400">
                      {preset.subjectCode}
                    </span>
                    <span className="text-[10px] text-ink-400">
                      {preset.unitsCount} Units · {preset.topicsCount} Topics
                    </span>
                  </div>
                  <h5 className="text-xs font-semibold text-ink-950 dark:text-ink-50 mb-1 group-hover:text-forest transition-colors">
                    {preset.subjectName}
                  </h5>
                  <p className="text-[11px] text-ink-500 dark:text-ink-400 line-clamp-2">
                    {preset.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: MANUAL BUILDER */}
        {activeTab === 'manual' && (
          <div className="space-y-4 max-h-[340px] overflow-y-auto pr-1">
            <div className="flex items-center justify-between pb-2 border-b border-paper-200 dark:border-paper-800">
              <span className="text-xs font-semibold text-ink-700 dark:text-ink-300">
                Structure units & lecture topics:
              </span>
              <button
                type="button"
                onClick={() => {
                  const unitNum = manualUnits.length + 1;
                  setManualUnits([
                    ...manualUnits,
                    {
                      id: `m-unit-${Date.now()}`,
                      unitNumber: `Unit ${unitNum}`,
                      title: `Unit ${unitNum} Concepts`,
                      topics: [{ title: 'New Concept Overview', minutes: 45 }],
                    },
                  ]);
                }}
                className="inline-flex items-center gap-1 text-xs text-forest dark:text-emerald-400 font-semibold hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Unit</span>
              </button>
            </div>

            {manualUnits.map((unit, uIdx) => (
              <div
                key={unit.id}
                className="p-3.5 rounded-lg border border-paper-200 dark:border-paper-800 bg-paper-50/60 dark:bg-paper-800/40 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                      {unit.unitNumber}
                    </span>
                    <input
                      type="text"
                      value={unit.title}
                      onChange={(e) => {
                        const updated = [...manualUnits];
                        updated[uIdx].title = e.target.value;
                        setManualUnits(updated);
                      }}
                      className="text-xs font-semibold bg-white dark:bg-paper-800 border border-paper-300 dark:border-paper-700 rounded px-2 py-1 flex-1 text-ink-900 dark:text-ink-100"
                    />
                  </div>
                  {manualUnits.length > 1 && (
                    <button
                      onClick={() => setManualUnits(manualUnits.filter((_, idx) => idx !== uIdx))}
                      className="p-1 text-ink-400 hover:text-rose-600 rounded"
                      title="Remove unit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Topics in this unit */}
                <div className="pl-3 border-l-2 border-forest/30 space-y-1.5">
                  {unit.topics.map((t, tIdx) => (
                    <div key={tIdx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={t.title}
                        onChange={(e) => {
                          const updated = [...manualUnits];
                          updated[uIdx].topics[tIdx].title = e.target.value;
                          setManualUnits(updated);
                        }}
                        placeholder="Topic title"
                        className="text-xs bg-white dark:bg-paper-800 border border-paper-300 dark:border-paper-700 rounded px-2 py-0.5 flex-1 text-ink-900 dark:text-ink-100"
                      />
                      <div className="flex items-center gap-1 shrink-0">
                        <input
                          type="number"
                          value={t.minutes}
                          onChange={(e) => {
                            const updated = [...manualUnits];
                            updated[uIdx].topics[tIdx].minutes = parseInt(e.target.value) || 45;
                            setManualUnits(updated);
                          }}
                          className="w-12 text-xs bg-white dark:bg-paper-800 border border-paper-300 dark:border-paper-700 rounded px-1.5 py-0.5 text-ink-900 dark:text-ink-100 text-center"
                        />
                        <span className="text-[10px] text-ink-400">min</span>
                      </div>
                      {unit.topics.length > 1 && (
                        <button
                          onClick={() => {
                            const updated = [...manualUnits];
                            updated[uIdx].topics = updated[uIdx].topics.filter((_, idx) => idx !== tIdx);
                            setManualUnits(updated);
                          }}
                          className="p-1 text-ink-400 hover:text-rose-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...manualUnits];
                      updated[uIdx].topics.push({ title: 'New Topic', minutes: 45 });
                      setManualUnits(updated);
                    }}
                    className="text-[11px] text-forest dark:text-emerald-400 hover:underline flex items-center gap-1 pt-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add topic to {unit.unitNumber}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PARSED PREVIEW SECTION (for paste, upload, sample) */}
        {activeTab !== 'manual' && parsedTopics.length > 0 && (
          <div className="mt-5 border-t border-paper-200 dark:border-paper-800 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-ink-900 dark:text-ink-100 flex items-center gap-1.5">
                <span>Extracted Structure Preview</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sage-light text-forest dark:bg-forest/20 dark:text-emerald-400">
                  {parsedUnits.length} Units · {parsedTopics.length} Topics
                </span>
              </h4>

              <label className="flex items-center gap-1.5 text-xs text-ink-600 dark:text-ink-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={replaceExisting}
                  onChange={(e) => setReplaceExisting(e.target.checked)}
                  className="rounded text-forest focus:ring-forest"
                />
                <span>Replace uncompleted topics for this subject</span>
              </label>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 border border-paper-200 dark:border-paper-800 rounded-lg p-3 bg-paper-50/70 dark:bg-paper-800/40 text-xs">
              {parsedUnits.map((u) => {
                const unitTopics = parsedTopics.filter((t) => t.unitId === u.id);
                return (
                  <div key={u.id} className="space-y-1">
                    <div className="font-semibold text-ink-950 dark:text-ink-100 text-[11px] flex items-center gap-1.5">
                      <span className="text-forest dark:text-emerald-400">{u.unitNumber}:</span>
                      <span>{u.title}</span>
                      <span className="text-ink-400 font-normal">({unitTopics.length} topics)</span>
                    </div>
                    <ul className="pl-4 space-y-0.5 text-[11px] text-ink-600 dark:text-ink-400 list-disc">
                      {unitTopics.map((t, idx) => (
                        <li key={idx} className="leading-tight">
                          <span>{t.title}</span>
                          <span className="text-[10px] text-ink-400 ml-1.5 font-mono">
                            ({t.estimatedMinutes}m{t.isProvisionalEstimate ? ' provisional' : ''})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-paper-200 dark:border-paper-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[11px] text-ink-400 text-center sm:text-left">
            *Completed study sessions and confident topics are always preserved.
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-ink-600 dark:text-ink-300 hover:text-ink-950 dark:hover:text-white"
            >
              Cancel
            </button>

            {activeTab === 'manual' ? (
              <button
                type="button"
                onClick={handleApplyManual}
                className="px-4 py-2 rounded-md bg-forest hover:bg-forest-hover text-white text-xs font-medium shadow-subtle transition-all"
              >
                Save Manual Roadmap
              </button>
            ) : (
              <button
                type="button"
                onClick={handleApplyToSubject}
                disabled={parsedTopics.length === 0}
                className="px-4 py-2 rounded-md bg-forest hover:bg-forest-hover text-white text-xs font-medium shadow-subtle transition-all disabled:opacity-50"
              >
                Apply to {currentSubject?.code || currentSubject?.name || 'Subject'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
