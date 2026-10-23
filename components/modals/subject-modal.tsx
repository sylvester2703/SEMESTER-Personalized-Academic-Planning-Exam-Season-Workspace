'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePlanner } from '@/lib/context/planner-context';
import { Subject, ConfidenceLevel, SyllabusUnit } from '@/types';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Tag,
  BookOpen,
  Plus,
  Trash2,
  Upload,
  FileText,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Check,
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { TimeInput12H } from '@/components/shared/time-input-12h';
import { parseSyllabusText } from '@/lib/syllabus/parser';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectToEdit?: Subject | null;
}

interface UnitContainer {
  id: string;
  unitNumber: string;
  title: string;
  topics: string[];
}

const PALETTE = [
  '#2D5541', // Forest
  '#D99B38', // Warm Amber
  '#3B6B7A', // Slate Teal
  '#765C83', // Muted Plum
  '#A05245', // Terracotta
  '#4A6B82', // Denim
];

export function SubjectModal({ isOpen, onClose, subjectToEdit }: SubjectModalProps) {
  const { data, addSubject, updateSubject, addTopic, addToast } = usePlanner();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [examDate, setExamDate] = useState(format(addDays(new Date(), 14), 'yyyy-MM-dd'));
  const [examTime, setExamTime] = useState('09:30');
  const [examLocation, setExamLocation] = useState('');
  const [confidence, setConfidence] = useState<ConfidenceLevel>('medium');
  const [color, setColor] = useState(PALETTE[0]);
  const [targetGrade, setTargetGrade] = useState('A');
  const [notes, setNotes] = useState('');

  // Unit and Lesson Container state
  const [unitContainers, setUnitContainers] = useState<UnitContainer[]>([]);
  const [showSyllabusDrawer, setShowSyllabusDrawer] = useState(false);
  const [rawSyllabusText, setRawSyllabusText] = useState('');
  const [newTopicByUnit, setNewTopicByUnit] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (subjectToEdit) {
      setName(subjectToEdit.name);
      setCode(subjectToEdit.code);
      setExamDate(subjectToEdit.examDate);
      setExamTime(subjectToEdit.examTime || '09:30');
      setExamLocation(subjectToEdit.examLocation || '');
      setConfidence(subjectToEdit.confidence);
      setColor(subjectToEdit.color || PALETTE[0]);
      setTargetGrade(subjectToEdit.targetGrade || 'A');
      setNotes(subjectToEdit.notes || '');

      // Load existing units and topics for this subject
      const existingTopics = data.topics.filter((t) => t.subjectId === subjectToEdit.id);
      if (subjectToEdit.units && subjectToEdit.units.length > 0) {
        const loadedContainers: UnitContainer[] = subjectToEdit.units.map((u) => {
          const uTopics = existingTopics
            .filter((t) => t.unitId === u.id || t.unitOrModule === u.title || t.unitOrModule === u.unitNumber)
            .map((t) => t.title);
          return {
            id: u.id,
            unitNumber: String(u.unitNumber || `Unit ${u.order}`),
            title: u.title,
            topics: uTopics,
          };
        });
        setUnitContainers(loadedContainers);
      } else if (existingTopics.length > 0) {
        setUnitContainers([
          {
            id: `unit-${Date.now()}-1`,
            unitNumber: 'Unit 1',
            title: 'Core Syllabus Content',
            topics: existingTopics.map((t) => t.title),
          },
        ]);
      } else {
        setUnitContainers([]);
      }
    } else {
      setName('');
      setCode('');
      setExamDate(format(addDays(new Date(), 14), 'yyyy-MM-dd'));
      setExamTime('09:30');
      setExamLocation('');
      setConfidence('medium');
      setColor(PALETTE[0]);
      setTargetGrade('A');
      setNotes('');
      setUnitContainers([]);
      setRawSyllabusText('');
      setShowSyllabusDrawer(false);
    }
  }, [subjectToEdit, isOpen, data.topics]);

  if (!isOpen) return null;

  // Add manual unit/lesson container
  const handleAddUnitContainer = () => {
    const nextIdx = unitContainers.length + 1;
    const newId = `unit-${Date.now()}-${nextIdx}`;
    setUnitContainers((prev) => [
      ...prev,
      {
        id: newId,
        unitNumber: `Unit ${nextIdx}`,
        title: `Unit ${nextIdx}: New Module / Lesson`,
        topics: [],
      },
    ]);
  };

  const handleUpdateUnitTitle = (id: string, newTitle: string) => {
    setUnitContainers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, title: newTitle } : u))
    );
  };

  const handleDeleteUnitContainer = (id: string) => {
    setUnitContainers((prev) => prev.filter((u) => u.id !== id));
  };

  const handleAddTopicToUnit = (unitId: string) => {
    const topicText = (newTopicByUnit[unitId] || '').trim();
    if (!topicText) return;
    setUnitContainers((prev) =>
      prev.map((u) =>
        u.id === unitId ? { ...u, topics: [...u.topics, topicText] } : u
      )
    );
    setNewTopicByUnit((prev) => ({ ...prev, [unitId]: '' }));
  };

  const handleRemoveTopicFromUnit = (unitId: string, topicIdx: number) => {
    setUnitContainers((prev) =>
      prev.map((u) =>
        u.id === unitId
          ? { ...u, topics: u.topics.filter((_, idx) => idx !== topicIdx) }
          : u
      )
    );
  };

  // Parse raw pasted syllabus
  const handleParseSyllabusText = (textToParse: string) => {
    if (!textToParse.trim()) return;
    const parsed = parseSyllabusText(textToParse, 'temp-subject');
    if (parsed.units.length > 0) {
      const generatedContainers: UnitContainer[] = parsed.units.map((u) => {
        const uTopics = parsed.topics
          .filter((t) => t.unitId === u.id || t.unitOrModule === u.unitNumber)
          .map((t) => t.title);
        return {
          id: u.id,
          unitNumber: String(u.unitNumber || `Unit ${u.order}`),
          title: u.title,
          topics: uTopics.length > 0 ? uTopics : ['Unit overview & key concepts'],
        };
      });
      setUnitContainers(generatedContainers);
      addToast({
        type: 'success',
        title: 'Syllabus Parsed',
        description: `Created ${generatedContainers.length} unit containers with topics.`,
      });
      setShowSyllabusDrawer(false);
    } else if (parsed.topics.length > 0) {
      setUnitContainers([
        {
          id: `unit-${Date.now()}-1`,
          unitNumber: 'Unit 1',
          title: 'Syllabus Lessons & Topics',
          topics: parsed.topics.map((t) => t.title),
        },
      ]);
      setShowSyllabusDrawer(false);
    }
  };

  // File upload reader
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setRawSyllabusText(text);
        handleParseSyllabusText(text);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !examDate) return;

    const mappedUnits: SyllabusUnit[] = unitContainers.map((u, idx) => ({
      id: u.id,
      subjectId: subjectToEdit ? subjectToEdit.id : '',
      unitNumber: u.unitNumber,
      title: u.title,
      order: idx + 1,
    }));

    if (subjectToEdit) {
      updateSubject(subjectToEdit.id, {
        name: name.trim(),
        code: code.trim(),
        examDate,
        examTime: examTime || undefined,
        examLocation: examLocation.trim() || undefined,
        confidence,
        color,
        targetGrade: targetGrade.trim() || undefined,
        notes: notes.trim() || undefined,
        units: mappedUnits.map((u) => ({ ...u, subjectId: subjectToEdit.id })),
      });

      // Add any newly added topics to this subject
      const existingTopics = data.topics.filter((t) => t.subjectId === subjectToEdit.id);
      const existingTitles = new Set(existingTopics.map((t) => t.title.toLowerCase()));

      let addedCount = 0;
      unitContainers.forEach((u) => {
        u.topics.forEach((tTitle) => {
          if (!existingTitles.has(tTitle.toLowerCase())) {
            addTopic({
              subjectId: subjectToEdit.id,
              unitId: u.id,
              unitOrModule: u.title,
              title: tTitle,
              status: 'not_started',
            });
            addedCount++;
          }
        });
      });

      addToast({
        type: 'success',
        title: 'Subject Updated',
        description: `Saved ${name} with ${unitContainers.length} unit containers.`,
      });
    } else {
      const newSubject = addSubject({
        name: name.trim(),
        code: code.trim(),
        examDate,
        examTime: examTime || undefined,
        examLocation: examLocation.trim() || undefined,
        confidence,
        color,
        targetGrade: targetGrade.trim() || undefined,
        notes: notes.trim() || undefined,
        units: mappedUnits,
      });

      // Add topics assigned to each unit
      let totalLessons = 0;
      unitContainers.forEach((u) => {
        u.topics.forEach((tTitle) => {
          addTopic({
            subjectId: newSubject.id,
            unitId: u.id,
            unitOrModule: u.title,
            title: tTitle,
            status: 'not_started',
          });
          totalLessons++;
        });
      });

      addToast({
        type: 'success',
        title: 'Subject & Syllabus Created',
        description: `Saved ${name} with ${unitContainers.length} unit containers and ${totalLessons} lesson contents.`,
      });
    }

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-xl max-w-2xl w-full p-5 sm:p-6 shadow-elevated animate-in zoom-in-95 duration-150 relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded text-ink-400 hover:text-ink-800 dark:hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-serif text-xl sm:text-2xl font-semibold text-ink-950 dark:text-ink-50">
          {subjectToEdit ? 'Edit Subject & Syllabus' : 'Add New Subject & Syllabus'}
        </h3>
        <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5 mb-4">
          Record your course examination details and organize your syllabus into unit and lesson containers.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Course Name and Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
                Subject Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Distributed Systems"
                className="w-full text-xs rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 p-2.5 text-ink-900 dark:text-ink-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
                Course Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="CS 301"
                className="w-full text-xs rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 p-2.5 text-ink-900 dark:text-ink-100"
              />
            </div>
          </div>

          {/* Exam Logistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
                Exam Date *
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                required
                className="w-full text-xs rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 p-2 text-ink-900 dark:text-ink-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
                Exam Time
              </label>
              <TimeInput12H
                value={examTime}
                onChange={setExamTime}
                className="w-full justify-between"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
                Exam Hall / Room
              </label>
              <input
                type="text"
                value={examLocation}
                onChange={(e) => setExamLocation(e.target.value)}
                placeholder="Hall B, Room 204"
                className="w-full text-xs rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 p-2 text-ink-900 dark:text-ink-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
                Target Grade
              </label>
              <input
                type="text"
                value={targetGrade}
                onChange={(e) => setTargetGrade(e.target.value)}
                placeholder="A / 1st Class"
                className="w-full text-xs rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 p-2 text-ink-900 dark:text-ink-100"
              />
            </div>
          </div>

          {/* Confidence and Palette Color */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
                Current Preparation Confidence
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['low', 'medium', 'high'] as ConfidenceLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setConfidence(lvl)}
                    className={`py-1.5 rounded-lg text-xs capitalize transition-colors ${
                      confidence === lvl
                        ? 'bg-forest text-white font-semibold'
                        : 'bg-paper-50 dark:bg-paper-800 border border-paper-300 dark:border-paper-700 text-ink-700 dark:text-ink-300'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
                Subject Color Tag
              </label>
              <div className="flex items-center gap-2 pt-1">
                {PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      color === c ? 'ring-2 ring-forest ring-offset-2 scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={`Color ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* SYLLABUS UNITS & LESSON CONTAINERS SECTION */}
          <div className="pt-3 border-t border-paper-200 dark:border-paper-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-ink-950 dark:text-white flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-forest dark:text-emerald-400" />
                  <span>Syllabus Units & Lesson Containers</span>
                </span>
                <p className="text-[11px] text-ink-500 dark:text-ink-400 mt-0.5">
                  Upload or paste your course syllabus, or add unit containers for each lesson and its contents.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSyllabusDrawer(!showSyllabusDrawer)}
                  className="px-2.5 py-1 text-xs rounded-md border border-forest/30 bg-forest/5 dark:bg-forest/15 text-forest dark:text-emerald-400 font-medium hover:bg-forest/10 flex items-center gap-1.5 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{showSyllabusDrawer ? 'Hide Paste Box' : 'Upload / Paste Syllabus'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddUnitContainer}
                  className="px-2.5 py-1 text-xs rounded-md bg-forest text-white hover:bg-forest-hover font-medium flex items-center gap-1 shadow-2xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Unit Container</span>
                </button>
              </div>
            </div>

            {/* Syllabus Upload / Paste Drawer */}
            {showSyllabusDrawer && (
              <div className="p-3.5 rounded-xl border border-forest/30 dark:border-forest/40 bg-forest/5 dark:bg-paper-850 space-y-3 animate-in fade-in-50 duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-forest dark:text-emerald-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Paste course outline or upload syllabus document</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-forest dark:text-emerald-400 underline font-medium hover:opacity-80 flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload .txt / .md</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.md"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                <textarea
                  rows={4}
                  value={rawSyllabusText}
                  onChange={(e) => setRawSyllabusText(e.target.value)}
                  placeholder={`Paste your syllabus or outline here...\nExample:\nUnit 1: System Models & Remote Procedure Calls\n- Architecture of distributed systems\n- Message passing interfaces\nUnit 2: Consensus & Fault Tolerance\n- 2-Phase Commit Protocol\n- Raft and Paxos algorithms`}
                  className="w-full text-xs p-2.5 rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-900 text-ink-900 dark:text-white font-mono placeholder:font-sans"
                />

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-ink-500 dark:text-ink-400">
                    Recognizes Unit / Module headers and bulleted lesson topics automatically.
                  </span>
                  <button
                    type="button"
                    onClick={() => handleParseSyllabusText(rawSyllabusText)}
                    disabled={!rawSyllabusText.trim()}
                    className="px-3 py-1 bg-forest hover:bg-forest-hover text-white text-xs font-semibold rounded-md flex items-center gap-1.5 disabled:opacity-50 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Extract into Unit Containers</span>
                  </button>
                </div>
              </div>
            )}

            {/* List of Unit / Lesson Containers */}
            {unitContainers.length === 0 ? (
              <div className="p-4 rounded-lg border border-dashed border-paper-300 dark:border-paper-700 bg-paper-50 dark:bg-paper-800/40 text-center text-xs text-ink-500 dark:text-ink-400 space-y-1.5">
                <BookOpen className="w-5 h-5 mx-auto text-ink-400" />
                <p className="font-medium text-ink-700 dark:text-ink-300">No Unit / Lesson Containers Added Yet</p>
                <p className="text-[11px]">
                  Click <strong>"Add Unit Container"</strong> or <strong>"Upload / Paste Syllabus"</strong> to organize your topics into containers.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {unitContainers.map((unit) => (
                  <div
                    key={unit.id}
                    className="p-3.5 rounded-xl border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 shadow-2xs space-y-2.5 transition-all"
                  >
                    {/* Unit Container Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-forest/10 dark:bg-emerald-950 text-forest dark:text-emerald-400 border border-forest/20 shrink-0">
                          {unit.unitNumber}
                        </span>
                        <input
                          type="text"
                          value={unit.title}
                          onChange={(e) => handleUpdateUnitTitle(unit.id, e.target.value)}
                          placeholder="Unit or Lesson name (e.g. Unit 1: Foundations)"
                          className="flex-1 text-xs font-semibold px-2 py-1 rounded border border-transparent hover:border-paper-300 focus:border-forest bg-transparent text-ink-950 dark:text-white"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteUnitContainer(unit.id)}
                        className="p-1 rounded text-ink-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        title="Delete unit container"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Contained Topics / Lesson Contents */}
                    <div className="pl-2 space-y-1.5">
                      {unit.topics.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {unit.topics.map((tName, tIdx) => (
                            <span
                              key={tIdx}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-paper-100 dark:bg-paper-700 border border-paper-300 dark:border-paper-600 text-ink-800 dark:text-ink-200"
                            >
                              <span>{tName}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveTopicFromUnit(unit.id, tIdx)}
                                className="text-ink-400 hover:text-red-500 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Add lesson content input inside this unit container */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <input
                          type="text"
                          placeholder="Add lesson content or topic (e.g. Message Passing)..."
                          value={newTopicByUnit[unit.id] || ''}
                          onChange={(e) =>
                            setNewTopicByUnit((prev) => ({ ...prev, [unit.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddTopicToUnit(unit.id);
                            }
                          }}
                          className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-paper-300 dark:border-paper-700 bg-paper-50 dark:bg-paper-900 text-ink-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddTopicToUnit(unit.id)}
                          className="px-2.5 py-1.5 bg-paper-200 dark:bg-paper-700 hover:bg-forest hover:text-white rounded-lg text-xs font-medium text-ink-700 dark:text-ink-300 transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
              Notes / Key Reminders (optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Formula sheet permitted; focus on Section B proofs"
              className="w-full text-xs rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 p-2 text-ink-900 dark:text-ink-100"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-paper-200 dark:border-paper-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-ink-600 dark:text-ink-300 hover:text-ink-950 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-forest hover:bg-forest-hover text-white text-xs font-semibold shadow-sm transition-all"
            >
              {subjectToEdit ? 'Save Changes' : 'Create Subject & Syllabus'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
