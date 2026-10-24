'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  Cloud,
  User,
  LogOut,
  Pencil,
  Plus,
  Shield,
  Check,
  X,
} from 'lucide-react';
import { TimeInput12H } from '@/components/shared/time-input-12h';
import { formatTimeRange } from '@/lib/dates';
import { RoutineCommitment, RoutineCategory } from '@/types';
import { PrivacyPolicyContent } from '@/components/legal/privacy-policy-content';

export function SettingsView() {
  const {
    data,
    updateProfile,
    addRoutineCommitment,
    updateRoutineCommitment,
    deleteRoutineCommitment,
    theme,
    setTheme,
    resetAllData,
    exportData,
    importData,
    addToast,
    currentUser,
    userName,
    updateUserName,
    syncStatus,
    syncToCloud,
    restoreFromCloud,
    signOut,
    setIsAuthModalOpen,
  } = usePlanner();

  const [displayName, setDisplayName] = useState(data.profile.displayName);
  const [userNameInput, setUserNameInput] = useState(userName || data.profile.displayName || '');
  const [isSavingName, setIsSavingName] = useState(false);
  const [semesterName, setSemesterName] = useState(data.profile.semesterName);
  const [dailyHours, setDailyHours] = useState(
    data.profile.preferences?.dailyAvailabilityHours || data.profile.dailyAvailabilityHours || 4
  );
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetType, setResetType] = useState<'sample' | 'empty'>('sample');
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  // Synchronize userNameInput when userName updates in context
  useEffect(() => {
    if (userName) {
      setUserNameInput(userName);
      setDisplayName(userName);
    }
  }, [userName]);

  const handleSaveUserName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userNameInput.trim()) return;
    setIsSavingName(true);
    await updateUserName(userNameInput.trim());
    setDisplayName(userNameInput.trim());
    setIsSavingName(false);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Routine commitments state in SettingsView
  const routineCommitments = data.profile.routineCommitments || [];
  const [editingCommId, setEditingCommId] = useState<string | null>(null);
  const [editCommName, setEditCommName] = useState('');
  const [editCommCategory, setEditCommCategory] = useState<RoutineCategory>('college');
  const [editCommDays, setEditCommDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [editCommStart, setEditCommStart] = useState('09:00');
  const [editCommEnd, setEditCommEnd] = useState('16:00');
  const [editCommFixed, setEditCommFixed] = useState(true);

  // Quick Add Commitment state in SettingsView
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCommName, setNewCommName] = useState('');
  const [newCommCategory, setNewCommCategory] = useState<RoutineCategory>('college');
  const [newCommDays, setNewCommDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [newCommStart, setNewCommStart] = useState('17:00');
  const [newCommEnd, setNewCommEnd] = useState('18:00');
  const [newCommFixed, setNewCommFixed] = useState(true);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const startEditCommitment = (c: RoutineCommitment) => {
    setEditingCommId(c.id);
    setEditCommName(c.name);
    setEditCommCategory(c.category);
    setEditCommDays([...c.daysOfWeek]);
    setEditCommStart(c.startTime);
    setEditCommEnd(c.endTime);
    setEditCommFixed(c.isFixed ?? true);
  };

  const cancelEditCommitment = () => {
    setEditingCommId(null);
  };

  const handleSaveEditCommitment = () => {
    if (!editCommName.trim() || !editingCommId) return;
    updateRoutineCommitment(editingCommId, {
      name: editCommName.trim(),
      category: editCommCategory,
      daysOfWeek: editCommDays.length > 0 ? editCommDays : [1, 2, 3, 4, 5],
      startTime: editCommStart,
      endTime: editCommEnd,
      isFixed: editCommFixed,
    });
    setEditingCommId(null);
    addToast({
      type: 'success',
      title: 'Routine commitment updated',
      description: 'Your study timetable will respect your updated availability.',
    });
  };

  const toggleEditDay = (day: number) => {
    if (editCommDays.includes(day)) {
      setEditCommDays(editCommDays.filter((d) => d !== day));
    } else {
      setEditCommDays([...editCommDays, day].sort());
    }
  };

  const toggleNewDay = (day: number) => {
    if (newCommDays.includes(day)) {
      setNewCommDays(newCommDays.filter((d) => d !== day));
    } else {
      setNewCommDays([...newCommDays, day].sort());
    }
  };

  const handleCreateCommitment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommName.trim()) return;
    addRoutineCommitment({
      name: newCommName.trim(),
      category: newCommCategory,
      daysOfWeek: newCommDays.length > 0 ? newCommDays : [1, 2, 3, 4, 5],
      startTime: newCommStart,
      endTime: newCommEnd,
      isFixed: newCommFixed,
    });
    setNewCommName('');
    setIsAddingNew(false);
    addToast({
      type: 'success',
      title: 'Activity added',
      description: 'New routine commitment added to your schedule.',
    });
  };

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

      {/* Privacy & Security Policy Section */}
      <div className="bg-paper-50 dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-lg p-5 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <ShieldCheck className="w-5 h-5 text-forest dark:text-emerald-400 mt-0.5 shrink-0" />
          <div className="text-xs space-y-1">
            <h4 className="font-semibold text-ink-900 dark:text-ink-100">
              Privacy & Data Protection Policy
            </h4>
            <p className="text-ink-600 dark:text-ink-400 leading-relaxed max-w-2xl">
              Your study plan is securely saved to your personal account with encrypted cloud persistence in Supabase, and cached locally for offline resilience. Zero tracking, zero third-party ads.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowPrivacyPolicy(true)}
          className="text-xs font-semibold text-forest dark:text-emerald-400 hover:underline shrink-0 cursor-pointer"
        >
          View Privacy Policy
        </button>
      </div>

      {/* Account Identity & User Name Setting Card */}
      <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-lg p-5 sm:p-6 shadow-subtle">
        <div className="flex items-center justify-between pb-3 border-b border-paper-200 dark:border-paper-800">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-forest dark:text-emerald-400" />
            <div>
              <h3 className="font-serif text-lg font-semibold text-ink-950 dark:text-ink-50">
                User Name & Account Identity
              </h3>
              <p className="text-[11px] text-ink-500 dark:text-ink-400 mt-0.5">
                Set your personal user name to be shown across the website, navigation bar, and study plans instead of your email ID.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-forest/10 dark:bg-forest/20 text-forest dark:text-emerald-400 border border-forest/20">
            {userName}
          </span>
        </div>

        <form onSubmit={handleSaveUserName} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink-800 dark:text-ink-200 mb-1.5">
                Display User Name
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={userNameInput}
                  onChange={(e) => setUserNameInput(e.target.value)}
                  maxLength={40}
                  className="flex-1 text-xs rounded-md border border-paper-300 dark:border-paper-750 bg-white dark:bg-paper-800 p-2.5 text-ink-900 dark:text-ink-100 font-medium focus-visible:ring-2 focus-visible:ring-forest"
                  placeholder="e.g. Sylvester or Alex"
                  required
                />
                <button
                  type="submit"
                  disabled={isSavingName || !userNameInput.trim()}
                  className="px-4 py-2.5 rounded-md bg-forest hover:bg-forest-hover text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSavingName ? 'Saving...' : 'Save Name'}</span>
                </button>
              </div>
              <p className="text-[11px] text-ink-500 dark:text-ink-400 mt-1.5">
                This user name replaces your email address across all greetings, badges, and exported files.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-800 dark:text-ink-200 mb-1.5">
                Registered Account Email
              </label>
              <div className="p-2.5 rounded-md bg-paper-100 dark:bg-paper-800/60 border border-paper-300/80 dark:border-paper-750 text-xs font-mono text-ink-700 dark:text-ink-300 truncate">
                {currentUser ? currentUser.email : 'Guest Mode (No active account)'}
              </div>
              <p className="text-[11px] text-ink-500 dark:text-ink-400 mt-1.5">
                Your email ID is used strictly for authentication and schedule updates.
              </p>
            </div>
          </div>
        </form>
      </div>

      {/* Supabase Cloud Sync Card */}
      <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-lg p-5 sm:p-6 shadow-subtle">
        <div className="flex items-center justify-between pb-3 border-b border-paper-200 dark:border-paper-800">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-forest dark:text-emerald-400" />
            <h3 className="font-serif text-lg font-semibold text-ink-950 dark:text-ink-50">
              Supabase Cloud Sync & Account
            </h3>
          </div>
          {currentUser ? (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-forest/10 dark:bg-emerald-950/60 text-forest dark:text-emerald-300 border border-forest/20">
              Cloud Active
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-paper-100 dark:bg-paper-800 text-ink-600 dark:text-ink-400">
              Guest / Local Mode
            </span>
          )}
        </div>

        <div className="mt-4 space-y-3">
          {currentUser ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-paper-50 dark:bg-paper-800/60 border border-paper-200 dark:border-paper-700 text-xs">
                <div>
                  <span className="text-ink-500 block text-[11px]">Connected Student:</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <strong className="text-ink-900 dark:text-white font-semibold">{userName}</strong>
                    <span className="text-ink-500 font-mono text-[11px]">({currentUser.email})</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={signOut}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <button
                  type="button"
                  disabled={syncStatus === 'syncing'}
                  onClick={syncToCloud}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-forest hover:bg-forest-hover text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-60"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                  <span>{syncStatus === 'syncing' ? 'Syncing...' : 'Sync Workspace to Cloud'}</span>
                </button>

                <button
                  type="button"
                  disabled={syncStatus === 'syncing'}
                  onClick={restoreFromCloud}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-paper-300 dark:border-paper-700 text-ink-800 dark:text-ink-200 hover:bg-paper-100 dark:hover:bg-paper-800 text-xs font-medium transition-colors disabled:opacity-60"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Restore from Cloud</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-paper-50 dark:bg-paper-800/50 border border-paper-200 dark:border-paper-700 text-xs">
              <p className="text-ink-600 dark:text-ink-400 text-xs max-w-md">
                You are currently in offline guest mode. Sign in with email or create a free account to back up your courses and access them across all your devices.
              </p>
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="shrink-0 px-4 py-2 rounded-md bg-forest hover:bg-forest-hover text-white text-xs font-semibold shadow-sm transition-all"
              >
                Sign In / Connect
              </button>
            </div>
          )}
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

      {/* Daily Routine & Fixed Commitments */}
      <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-lg p-5 sm:p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-paper-200 dark:border-paper-800">
          <div>
            <h3 className="font-serif text-lg font-semibold text-ink-950 dark:text-ink-50">
              Daily Routine & Fixed Commitments
            </h3>
            <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">
              Edit your daily activities, college hours, and meal times. Study sessions will strictly avoid these hours.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-forest/10 hover:bg-forest text-forest hover:text-white dark:text-emerald-300 dark:hover:bg-emerald-700 dark:hover:text-white text-xs font-semibold transition-all shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAddingNew ? 'Close Form' : 'Add Activity'}</span>
          </button>
        </div>

        {/* Add New Activity Form */}
        {isAddingNew && (
          <form onSubmit={handleCreateCommitment} className="p-4 rounded-xl border border-forest/30 dark:border-emerald-600/40 bg-forest/5 dark:bg-emerald-950/20 space-y-3 animate-in fade-in-50 duration-150">
            <span className="text-xs font-bold text-forest dark:text-emerald-400 block uppercase tracking-wider">
              Add New Routine Activity
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="text"
                placeholder="Activity name (e.g. Evening Coaching)"
                value={newCommName}
                onChange={(e) => setNewCommName(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-900 text-ink-900 dark:text-white"
                required
              />
              <select
                value={newCommCategory}
                onChange={(e) => setNewCommCategory(e.target.value as any)}
                className="px-3 py-2 text-xs rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-900 text-ink-900 dark:text-white"
              >
                <option value="college">College / University</option>
                <option value="tuition">Coaching / Tuition</option>
                <option value="exercise">Sports / Workout</option>
                <option value="commute">Commute</option>
                <option value="meals">Meals & Break</option>
                <option value="personal">Personal / Hobby</option>
              </select>
            </div>

            {/* Days selection */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-ink-500 mr-1 font-medium">Days:</span>
              {dayNames.map((dName, idx) => {
                const isSel = newCommDays.includes(idx);
                return (
                  <button
                    key={dName}
                    type="button"
                    onClick={() => toggleNewDay(idx)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                      isSel
                        ? 'bg-forest text-white'
                        : 'bg-paper-200 dark:bg-paper-700 text-ink-700 dark:text-ink-300'
                    }`}
                  >
                    {dName}
                  </button>
                );
              })}
            </div>

            {/* From / To with 12-hour dropdown */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-forest/10 dark:border-emerald-800/30">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-medium text-ink-600 dark:text-ink-400">From:</span>
                  <TimeInput12H value={newCommStart} onChange={setNewCommStart} />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-medium text-ink-600 dark:text-ink-400">To:</span>
                  <TimeInput12H value={newCommEnd} onChange={setNewCommEnd} />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-1.5 text-xs text-ink-600 dark:text-ink-400 hover:bg-paper-200 dark:hover:bg-paper-700 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-forest hover:bg-forest-hover text-white text-xs font-semibold rounded-md flex items-center gap-1 shadow-2xs transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save Activity</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* List of routine commitments */}
        {routineCommitments.length === 0 ? (
          <p className="text-xs text-ink-500 italic py-2">
            No fixed commitments defined. Add your college lectures, sleep, or meal hours so study plans adapt around them.
          </p>
        ) : (
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {routineCommitments.map((c) =>
              editingCommId === c.id ? (
                <div
                  key={c.id}
                  className="p-3.5 rounded-xl border-2 border-forest/40 dark:border-emerald-600/50 bg-forest/5 dark:bg-emerald-950/20 space-y-3 transition-all shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-forest dark:text-emerald-400 flex items-center gap-1.5">
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit Commitment Time & Days</span>
                    </span>
                    <button
                      type="button"
                      onClick={cancelEditCommitment}
                      className="text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 text-xs"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Activity name (e.g. Lunch)"
                      value={editCommName}
                      onChange={(e) => setEditCommName(e.target.value)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-900 text-ink-900 dark:text-white"
                    />
                    <select
                      value={editCommCategory}
                      onChange={(e) => setEditCommCategory(e.target.value as any)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-900 text-ink-900 dark:text-white"
                    >
                      <option value="college">College / University</option>
                      <option value="tuition">Coaching / Tuition</option>
                      <option value="exercise">Sports / Workout</option>
                      <option value="commute">Commute</option>
                      <option value="meals">Meals & Break</option>
                      <option value="personal">Personal / Hobby</option>
                    </select>
                  </div>

                  {/* Day selection */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-ink-500 mr-1 font-medium">Days:</span>
                    {dayNames.map((dName, idx) => {
                      const isSel = editCommDays.includes(idx);
                      return (
                        <button
                          key={dName}
                          type="button"
                          onClick={() => toggleEditDay(idx)}
                          className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                            isSel
                              ? 'bg-forest text-white'
                              : 'bg-paper-200 dark:bg-paper-700 text-ink-700 dark:text-ink-300'
                          }`}
                        >
                          {dName}
                        </button>
                      );
                    })}
                  </div>

                  {/* Time selection with TimeInput12H */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-forest/10 dark:border-emerald-800/30">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-medium text-ink-600 dark:text-ink-400">From:</span>
                        <TimeInput12H value={editCommStart} onChange={setEditCommStart} />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-medium text-ink-600 dark:text-ink-400">To:</span>
                        <TimeInput12H value={editCommEnd} onChange={setEditCommEnd} />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={cancelEditCommitment}
                        className="px-2.5 py-1 text-xs text-ink-600 dark:text-ink-400 hover:bg-paper-200 dark:hover:bg-paper-700 rounded-md transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveEditCommitment}
                        className="px-3 py-1 bg-forest hover:bg-forest-hover text-white text-xs font-semibold rounded-md flex items-center gap-1 shadow-2xs transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 text-xs shadow-2xs hover:border-forest/30 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Shield className="w-4 h-4 text-forest dark:text-emerald-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="font-semibold text-ink-950 dark:text-white flex items-center gap-2 truncate">
                        <span>{c.name}</span>
                        {c.isFixed && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-forest/10 dark:bg-emerald-950/70 text-forest dark:text-emerald-300 border border-forest/20 dark:border-emerald-700/50 font-mono font-bold">
                            FIXED
                          </span>
                        )}
                      </div>
                      <div className="text-ink-600 dark:text-ink-300 font-mono text-[11px] mt-0.5 font-medium truncate">
                        {formatTimeRange(c.startTime, c.endTime)} ·{' '}
                        {c.daysOfWeek.map((d) => dayNames[d]).join(', ')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button
                      type="button"
                      onClick={() => startEditCommitment(c)}
                      title="Edit activity name, time & days"
                      className="p-1.5 rounded-md text-ink-500 hover:text-forest hover:bg-forest/10 dark:text-ink-400 dark:hover:text-emerald-300 dark:hover:bg-emerald-950/50 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteRoutineCommitment(c.id)}
                      title="Delete activity"
                      className="p-1.5 rounded-md text-ink-400 hover:text-red-500 hover:bg-red-50 dark:text-ink-400 dark:hover:text-red-400 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
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

      {/* Privacy Policy Modal */}
      {showPrivacyPolicy && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-xl max-w-lg w-full p-6 shadow-elevated relative max-h-[85vh] overflow-y-auto animate-in zoom-in-95">
            <button
              onClick={() => setShowPrivacyPolicy(false)}
              className="absolute top-4 right-4 p-1.5 rounded text-ink-400 hover:text-ink-800 dark:hover:text-white cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-xl font-bold text-ink-950 dark:text-white mb-3">
              Privacy & Data Policy
            </h3>
            <PrivacyPolicyContent />

            <div className="mt-5 pt-4 border-t border-paper-200 dark:border-paper-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPrivacyPolicy(false)}
                className="px-4 py-2 rounded-lg bg-forest hover:bg-forest-hover text-white text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
