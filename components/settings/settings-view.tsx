'use client';

import React, { useState, useRef } from 'react';
import { usePlanner } from '@/lib/context/planner-context';
import {
  Settings,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  ShieldCheck,
  Sun,
  Moon,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';

export function SettingsView() {
  const {
    data,
    updateProfile,
    theme,
    setTheme,
    resetAllData,
    exportData,
    importData,
    addToast,
  } = usePlanner();

  const [displayName, setDisplayName] = useState(data.profile.displayName);
  const [semesterName, setSemesterName] = useState(data.profile.semesterName);
  const [dailyHours, setDailyHours] = useState(
    data.profile.preferences?.dailyAvailabilityHours || data.profile.dailyAvailabilityHours || 4
  );
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetType, setResetType] = useState<'sample' | 'empty'>('sample');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      displayName,
      semesterName,
      dailyAvailabilityHours: Number(dailyHours),
      preferences: {
        ...data.profile.preferences,
        dailyAvailabilityHours: Number(dailyHours),
      },
    });
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `semester-planner-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addToast({
      type: 'success',
      title: 'Backup downloaded',
      description: 'Saved your complete subjects, timetable, and revision logs.',
    });
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importData(content);
      if (res.success) {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="pb-4 border-b border-paper-300 dark:border-paper-800">
        <h2 className="font-serif text-2xl font-semibold text-ink-950 dark:text-ink-50">
          Settings & Local Data
        </h2>
        <p className="text-xs text-ink-500 dark:text-ink-400 mt-1">
          Preferences, theme, data exports, and offline privacy safeguards.
        </p>
      </div>

      {/* Privacy Guarantee Disclosure */}
      <div className="bg-paper-50 dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-lg p-5 shadow-subtle flex items-start gap-3.5">
        <ShieldCheck className="w-5 h-5 text-forest dark:text-emerald-400 mt-0.5 shrink-0" />
        <div className="text-xs space-y-1">
          <h4 className="font-semibold text-ink-900 dark:text-ink-100">
            Local-First Privacy & Zero Backend Guarantee
          </h4>
          <p className="text-ink-600 dark:text-ink-400 leading-relaxed">
            All your subjects, exam dates, timetable sessions, and syllabus notes are stored exclusively in your browser’s local storage on this device. No personal data, email, or study history is ever transmitted to remote servers or third-party trackers.
          </p>
          <p className="text-ink-500 italic mt-1">
            *Tip: Export a backup file before clearing browser cookies or switching computers.
          </p>
        </div>
      </div>

      {/* Profile & Planning Preferences */}
      <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-lg p-5 sm:p-6 shadow-subtle">
        <h3 className="font-serif text-lg font-semibold text-ink-950 dark:text-ink-50 pb-3 border-b border-paper-200 dark:border-paper-800">
          Personal Planning Profile
        </h3>

        <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={40}
                className="w-full text-xs rounded-md border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 p-2.5 text-ink-900 dark:text-ink-100 focus-visible:ring-1 focus-visible:ring-forest"
                placeholder="e.g. Alex"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
                Semester / Examination Series Title
              </label>
              <input
                type="text"
                value={semesterName}
                onChange={(e) => setSemesterName(e.target.value)}
                maxLength={80}
                className="w-full text-xs rounded-md border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 p-2.5 text-ink-900 dark:text-ink-100 focus-visible:ring-1 focus-visible:ring-forest"
                placeholder="e.g. Final Semester • Spring 2026"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
              Daily Target Study Availability (Hours)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0.5}
                max={12}
                step={0.5}
                value={dailyHours}
                onChange={(e) => setDailyHours(Number(e.target.value))}
                className="w-32 text-xs rounded-md border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 p-2 text-ink-900 dark:text-ink-100 focus-visible:ring-1 focus-visible:ring-forest"
              />
              <span className="text-xs text-ink-500">
                Used by the rule-based planner to avoid unrealistic workloads.
              </span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-forest hover:bg-forest-hover text-white text-xs font-medium shadow-sm transition-all"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>

      {/* Theme Selection */}
      <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-lg p-5 sm:p-6 shadow-subtle">
        <h3 className="font-serif text-lg font-semibold text-ink-950 dark:text-ink-50 pb-3 border-b border-paper-200 dark:border-paper-800">
          Interface Appearance
        </h3>
        <p className="text-xs text-ink-500 dark:text-ink-400 mt-1 mb-4">
          Choose an editorial theme optimized for prolonged revision sessions.
        </p>

        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-3.5 rounded-lg border text-center transition-all ${
              theme === 'light'
                ? 'border-forest bg-forest/5 text-forest font-semibold'
                : 'border-paper-300 dark:border-paper-700 hover:border-paper-400 text-ink-700 dark:text-ink-300'
            }`}
          >
            <Sun className="w-5 h-5 mx-auto mb-1.5" />
            <span className="text-xs block">Warm Paper (Light)</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-3.5 rounded-lg border text-center transition-all ${
              theme === 'dark'
                ? 'border-forest dark:border-emerald-400 bg-forest/10 text-forest dark:text-emerald-400 font-semibold'
                : 'border-paper-300 dark:border-paper-700 hover:border-paper-400 text-ink-700 dark:text-ink-300'
            }`}
          >
            <Moon className="w-5 h-5 mx-auto mb-1.5" />
            <span className="text-xs block">Deep Ink (Dark)</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('system')}
            className={`p-3.5 rounded-lg border text-center transition-all ${
              theme === 'system'
                ? 'border-forest bg-forest/5 text-forest dark:text-emerald-400 font-semibold'
                : 'border-paper-300 dark:border-paper-700 hover:border-paper-400 text-ink-700 dark:text-ink-300'
            }`}
          >
            <Laptop className="w-5 h-5 mx-auto mb-1.5" />
            <span className="text-xs block">System Preference</span>
          </button>
        </div>
      </div>

      {/* Backup & Restore (JSON Export / Import) */}
      <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-lg p-5 sm:p-6 shadow-subtle">
        <h3 className="font-serif text-lg font-semibold text-ink-950 dark:text-ink-50 pb-3 border-b border-paper-200 dark:border-paper-800">
          Data Backup & Portability
        </h3>
        <p className="text-xs text-ink-500 dark:text-ink-400 mt-1 mb-4">
          Export your complete semester workspace to a JSON file, or restore from a previous backup.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={handleDownloadBackup}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-paper-300 dark:border-paper-700 hover:bg-paper-100 dark:hover:bg-paper-800 text-ink-900 dark:text-ink-100 text-xs font-medium transition-colors"
          >
            <Download className="w-4 h-4 text-forest dark:text-emerald-400" />
            <span>Download JSON Backup</span>
          </button>

          <label className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-paper-300 dark:border-paper-700 hover:bg-paper-100 dark:hover:bg-paper-800 text-ink-900 dark:text-ink-100 text-xs font-medium cursor-pointer transition-colors">
            <Upload className="w-4 h-4 text-forest dark:text-emerald-400" />
            <span>Restore from JSON File</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Reset & Wipe Data Area */}
      <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-lg p-5 sm:p-6 shadow-subtle">
        <h3 className="font-serif text-lg font-semibold text-rose-700 dark:text-rose-400 pb-3 border-b border-paper-200 dark:border-paper-800">
          Reset Workspace
        </h3>
        <p className="text-xs text-ink-500 dark:text-ink-400 mt-1 mb-4">
          Switch back to the university demo sample dataset, or wipe all records for a brand new semester.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setResetType('sample');
              setResetModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-md border border-paper-300 dark:border-paper-700 text-xs font-medium text-ink-800 dark:text-ink-200 hover:bg-paper-100 dark:hover:bg-paper-800 transition-colors"
          >
            Reset to Sample Dataset
          </button>

          <button
            onClick={() => {
              setResetType('empty');
              setResetModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-md border border-rose-300 dark:border-rose-900/60 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-medium transition-colors"
          >
            Wipe to Clean Slate
          </button>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-lg max-w-md w-full p-6 shadow-elevated animate-in zoom-in-95">
            <div className="w-10 h-10 rounded-full bg-amber-light dark:bg-amber-950/60 text-amber-badge dark:text-amber-300 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <h3 className="font-serif text-xl font-semibold text-ink-950 dark:text-ink-50">
              {resetType === 'sample' ? 'Reset to Sample Data?' : 'Clear all local data?'}
            </h3>

            <p className="text-xs text-ink-600 dark:text-ink-300 mt-2 leading-relaxed">
              {resetType === 'sample'
                ? 'This will restore the sample demonstration courses (Distributed Systems, Probability, Database Internals, and Technical Ethics) and overwrite any custom subjects currently in local storage.'
                : 'This will permanently wipe all local subjects, syllabus units, timetable sessions, and study logs from this device. Download a backup first if you need to keep your records.'}
            </p>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setResetModalOpen(false)}
                className="px-3.5 py-2 rounded-md border border-paper-300 dark:border-paper-700 text-xs text-ink-700 dark:text-ink-300 hover:bg-paper-100 dark:hover:bg-paper-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  resetAllData(resetType === 'sample');
                  setResetModalOpen(false);
                }}
                className={`px-4 py-2 rounded-md text-xs font-medium text-white transition-colors ${
                  resetType === 'sample' ? 'bg-forest hover:bg-forest-hover' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {resetType === 'sample' ? 'Restore Sample Data' : 'Yes, Wipe Everything'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
