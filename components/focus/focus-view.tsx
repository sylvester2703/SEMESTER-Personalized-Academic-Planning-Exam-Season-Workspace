'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePlanner } from '@/lib/context/planner-context';
import { FocusModeType, Subject, StudySession } from '@/types';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Coffee,
  CheckCircle2,
  Sparkles,
  Volume2,
  VolumeX,
  Bell,
  Clock,
  ArrowRight,
} from 'lucide-react';

export function FocusView() {
  const {
    data,
    recordFocusSession,
    toggleSessionComplete,
    addToast,
    setActiveView,
  } = usePlanner();

  // Preset durations in minutes
  const PRESETS: Record<FocusModeType, number> = {
    focus: 25,
    short_break: 5,
    long_break: 15,
  };

  const [mode, setMode] = useState<FocusModeType>('focus');
  const [targetDurationMinutes, setTargetDurationMinutes] = useState<number>(25);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Subject and session linkage
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    data.subjects.length > 0 ? data.subjects[0].id : ''
  );
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [focusNotes, setFocusNotes] = useState<string>('');
  const [completionSummary, setCompletionSummary] = useState<{
    completed: boolean;
    minutes: number;
    subjectName?: string;
  } | null>(null);

  // Tab visibility reconciliation refs
  const targetEndTimestampRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Play synthetic chime via Web Audio API
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Harmonic gentle academic chime
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.2); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.4); // G5

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch {
      // Audio not permitted or supported
    }
  };

  // Switch modes
  const handleModeChange = (newMode: FocusModeType) => {
    setIsRunning(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    targetEndTimestampRef.current = null;

    setMode(newMode);
    const duration = PRESETS[newMode];
    setTargetDurationMinutes(duration);
    setSecondsRemaining(duration * 60);
  };

  // Start or resume timer
  const handleStart = () => {
    setIsRunning(true);
    const now = Date.now();
    targetEndTimestampRef.current = now + secondsRemaining * 1000;
  };

  // Pause timer
  const handlePause = () => {
    setIsRunning(false);
    targetEndTimestampRef.current = null;
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  };

  // Reset timer
  const handleReset = () => {
    setIsRunning(false);
    targetEndTimestampRef.current = null;
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setSecondsRemaining(targetDurationMinutes * 60);
  };

  // Finish session
  const handleCompleteSession = () => {
    setIsRunning(false);
    targetEndTimestampRef.current = null;
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    playChime();

    const parentSubj = data.subjects.find((s) => s.id === selectedSubjectId);

    // Record in local data
    recordFocusSession({
      subjectId: selectedSubjectId || undefined,
      sessionId: selectedSessionId || undefined,
      durationMinutes: targetDurationMinutes,
      mode,
      notes: focusNotes || undefined,
    });

    // If linked to an incomplete session, prompt to mark as completed
    if (selectedSessionId) {
      const linked = data.sessions.find((s) => s.id === selectedSessionId);
      if (linked && !linked.completed) {
        toggleSessionComplete(selectedSessionId);
      }
    }

    setCompletionSummary({
      completed: true,
      minutes: targetDurationMinutes,
      subjectName: parentSubj?.name,
    });

    // Reset countdown for next block
    setSecondsRemaining(targetDurationMinutes * 60);
  };

  // Timer interval & tab visibility listener
  useEffect(() => {
    if (!isRunning) return;

    timerIntervalRef.current = setInterval(() => {
      if (!targetEndTimestampRef.current) return;
      const now = Date.now();
      const diffSeconds = Math.max(0, Math.round((targetEndTimestampRef.current - now) / 1000));

      setSecondsRemaining(diffSeconds);

      if (diffSeconds <= 0) {
        handleCompleteSession();
      }
    }, 1000);

    // Reconcile tab suspension
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isRunning && targetEndTimestampRef.current) {
        const now = Date.now();
        const diffSeconds = Math.max(0, Math.round((targetEndTimestampRef.current - now) / 1000));
        setSecondsRemaining(diffSeconds);
        if (diffSeconds <= 0) {
          handleCompleteSession();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRunning, targetDurationMinutes, mode, selectedSubjectId, selectedSessionId, focusNotes]);

  // Format MM:SS
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // Calculate progress percent
  const totalSeconds = targetDurationMinutes * 60;
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - secondsRemaining) / totalSeconds) * 100 : 0;

  // Active subject
  const currentSubject = data.subjects.find((s) => s.id === selectedSubjectId);
  const subjectSessions = data.sessions.filter(
    (s) => s.subjectId === selectedSubjectId && !s.completed
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="text-center pb-4 border-b border-paper-300 dark:border-paper-800">
        <h2 className="font-serif text-3xl font-semibold text-ink-950 dark:text-ink-50">
          Focus Mode
        </h2>
        <p className="text-xs sm:text-sm text-ink-600 dark:text-ink-400 mt-1">
          A calm, distraction-free environment for intentional revision blocks.
        </p>
      </div>

      {/* Completion Modal / Banner */}
      {completionSummary && (
        <div className="bg-sage-light dark:bg-paper-900 border border-sage-border dark:border-forest/40 rounded-lg p-5 text-center shadow-subtle animate-in zoom-in-95 duration-200">
          <div className="w-10 h-10 rounded-full bg-forest text-white mx-auto flex items-center justify-center mb-2">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-xl font-semibold text-forest dark:text-emerald-300">
            Session Completed!
          </h3>
          <p className="text-xs sm:text-sm text-ink-700 dark:text-ink-200 mt-1 max-w-sm mx-auto">
            You just logged {completionSummary.minutes} minutes of dedicated focus
            {completionSummary.subjectName ? ` on ${completionSummary.subjectName}` : ''}.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setCompletionSummary(null);
                handleModeChange('short_break');
              }}
              className="px-3.5 py-1.5 rounded-md bg-forest text-white text-xs font-medium hover:bg-forest-hover transition-colors"
            >
              Start 5m short break
            </button>
            <button
              onClick={() => setCompletionSummary(null)}
              className="px-3 py-1.5 text-xs text-ink-600 dark:text-ink-400 hover:text-ink-900 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Mode Presets Switcher */}
      <div className="flex items-center justify-center p-1 rounded-lg bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 shadow-xs max-w-md mx-auto">
        <button
          onClick={() => handleModeChange('focus')}
          className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
            mode === 'focus'
              ? 'bg-forest text-white font-semibold shadow-xs'
              : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
          }`}
        >
          25m Focus
        </button>
        <button
          onClick={() => handleModeChange('short_break')}
          className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
            mode === 'short_break'
              ? 'bg-forest text-white font-semibold shadow-xs'
              : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
          }`}
        >
          5m Short Break
        </button>
        <button
          onClick={() => handleModeChange('long_break')}
          className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
            mode === 'long_break'
              ? 'bg-forest text-white font-semibold shadow-xs'
              : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
          }`}
        >
          15m Long Break
        </button>
      </div>

      {/* Giant Editorial Timer Display */}
      <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-xl p-8 sm:p-12 text-center shadow-card relative overflow-hidden">
        {/* Subtle circular progress / top progress bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1.5 bg-paper-200 dark:bg-paper-800"
        >
          <div
            className="h-full bg-forest dark:bg-emerald-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Current status label */}
        <div className="mb-4">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">
            {mode === 'focus' ? 'Deep Focus Session' : 'Restorative Break'}
          </span>
          {currentSubject && mode === 'focus' && (
            <p className="text-sm font-medium text-forest dark:text-emerald-400 mt-1 font-serif">
              {currentSubject.name}
            </p>
          )}
        </div>

        {/* Time Digits */}
        <div className="my-6">
          <span className="tabular-nums font-serif text-6xl sm:text-8xl font-light text-ink-950 dark:text-white tracking-tight">
            {timeFormatted}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={handleReset}
            className="p-3 rounded-full text-ink-500 hover:text-ink-950 dark:text-ink-400 dark:hover:text-white bg-paper-100 hover:bg-paper-200 dark:bg-paper-800 dark:hover:bg-paper-700 transition-colors"
            title="Reset timer"
            aria-label="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {isRunning ? (
            <button
              onClick={handlePause}
              className="px-8 py-3.5 rounded-full bg-forest text-white font-medium text-sm flex items-center gap-2 shadow-subtle hover:bg-forest-hover transition-all"
            >
              <Pause className="w-5 h-5 fill-current" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="px-8 py-3.5 rounded-full bg-forest text-white font-medium text-sm flex items-center gap-2 shadow-subtle hover:bg-forest-hover transition-all"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{secondsRemaining < totalSeconds ? 'Resume' : 'Start Focus'}</span>
            </button>
          )}

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-3 rounded-full transition-colors ${
              soundEnabled
                ? 'text-forest dark:text-emerald-400 bg-forest/10 dark:bg-forest/20'
                : 'text-ink-400 bg-paper-100 dark:bg-paper-800'
            }`}
            title={soundEnabled ? 'Chime sound enabled' : 'Chime sound muted'}
            aria-label="Toggle chime sound"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Focus Configuration Panel */}
      {mode === 'focus' && (
        <div className="bg-paper-50 dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-lg p-5 shadow-subtle space-y-4">
          <h4 className="font-serif text-sm font-semibold text-ink-900 dark:text-ink-100">
            Session Context & Association
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Subject Select */}
            <div>
              <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
                Course Subject
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => {
                  setSelectedSubjectId(e.target.value);
                  setSelectedSessionId('');
                }}
                className="w-full text-xs rounded-md border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 p-2 text-ink-900 dark:text-ink-100 focus-visible:ring-1 focus-visible:ring-forest"
              >
                <option value="">None / General study</option>
                {data.subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code ? `${s.code} — ` : ''}{s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Associate with Timetable Session */}
            <div>
              <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
                Link Scheduled Session
              </label>
              <select
                value={selectedSessionId}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                className="w-full text-xs rounded-md border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 p-2 text-ink-900 dark:text-ink-100 focus-visible:ring-1 focus-visible:ring-forest"
              >
                <option value="">Do not link to timetable</option>
                {subjectSessions.map((sess) => (
                  <option key={sess.id} value={sess.id}>
                    {sess.date} ({sess.startTime}) — {sess.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional notes */}
          <div>
            <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
              Focus Goal / Working Notes (optional)
            </label>
            <input
              type="text"
              value={focusNotes}
              onChange={(e) => setFocusNotes(e.target.value)}
              placeholder="e.g. Solve 3 tutorial problems on Raft log replication"
              className="w-full text-xs rounded-md border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 p-2 text-ink-900 dark:text-ink-100 focus-visible:ring-1 focus-visible:ring-forest"
            />
          </div>
        </div>
      )}

      {/* Focus History summary & session log */}
      <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-xl p-5 shadow-subtle space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-paper-200 dark:border-paper-800">
          <h3 className="font-serif text-sm font-semibold text-ink-950 dark:text-ink-50 flex items-center gap-2">
            <Clock className="w-4 h-4 text-forest dark:text-emerald-400" />
            <span>Focus History & Completed Sessions</span>
          </h3>
          <span className="text-xs font-mono text-ink-500 dark:text-ink-400">
            {data.focusRecords.length} completed
          </span>
        </div>

        {data.focusRecords.length === 0 ? (
          <div className="py-6 text-center text-xs text-ink-500 dark:text-ink-400">
            <p className="font-medium text-ink-700 dark:text-ink-300">
              Your completed focus sessions will be recorded here.
            </p>
            <p className="mt-1 text-[11px]">
              Start the 25-minute timer above. When the timer finishes, your session will be saved.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {data.focusRecords.slice(-5).reverse().map((rec) => {
              const subj = data.subjects.find((s) => s.id === rec.subjectId);
              return (
                <div
                  key={rec.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-paper-50 dark:bg-paper-800/60 border border-paper-200 dark:border-paper-750 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle2 className="w-4 h-4 text-forest dark:text-emerald-400 shrink-0" />
                    <span className="font-medium text-ink-900 dark:text-ink-100 truncate">
                      {subj ? subj.name : 'General Study Session'}
                    </span>
                    {rec.notes && (
                      <span className="text-[11px] text-ink-500 dark:text-ink-400 truncate max-w-[180px]">
                        — {rec.notes}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-forest dark:text-emerald-400 font-semibold shrink-0">
                    +{rec.durationMinutes}m
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
