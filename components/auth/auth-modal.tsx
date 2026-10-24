'use client';

import React, { useState } from 'react';
import { usePlanner } from '@/lib/context/planner-context';
import { signUpWithEmail, signInWithEmail, resetPasswordForEmail } from '@/lib/supabase/service';
import {
  X,
  Lock,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Cloud,
  Phone,
  BellRing,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: 'signin' | 'signup';
}

export function AuthModal({ isOpen, onClose, onSuccess, initialMode = 'signin' }: AuthModalProps) {
  const { addToast, syncToCloud, restoreFromCloud, updateProfile, setActiveView } = usePlanner();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [enableUpdates, setEnableUpdates] = useState(true);
  const [updateInterval, setUpdateInterval] = useState<'1' | '2'>('2');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        if (!email || !password) {
          throw new Error('Please provide both an email and password.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }

        const { data, error } = await signUpWithEmail(email, password, fullName, phone);
        if (error) throw error;

        updateProfile({
          displayName: fullName.trim() || email.split('@')[0],
          email: email.trim(),
          phone: phone.trim() || undefined,
          emailScheduleUpdates: enableUpdates,
          whatsappScheduleUpdates: Boolean(phone && enableUpdates),
          notificationIntervalHours: Number(updateInterval) || 2,
        });

        if (data.session) {
          addToast({
            type: 'success',
            title: 'Account created & synced',
            description: 'Your Supabase cloud account is active. Study schedule updates configured.',
          });
          await syncToCloud();
          setActiveView('dashboard');
          onSuccess?.();
          onClose();
        } else {
          setSuccessMsg('Account created successfully! If email confirmation is enabled on your Supabase project, check your inbox for the verification link.');
          addToast({
            type: 'info',
            title: 'Account Created',
            description: 'Account registered. If confirmation is required, check your email inbox.',
          });
        }
      } else if (mode === 'signin') {
        if (!email || !password) {
          throw new Error('Please enter your email and password.');
        }

        const { data, error } = await signInWithEmail(email, password);
        if (error) {
          if (error.message?.includes('Email not confirmed')) {
            throw new Error('Email address not yet confirmed. Please check your inbox for the verification link, or disable "Confirm email" in your Supabase Auth dashboard.');
          }
          throw error;
        }

        addToast({
          type: 'success',
          title: 'Welcome back',
          description: `Signed in as ${data.user?.email}.`,
        });

        updateProfile({
          email: data.user?.email || email,
          phone: (data.user?.user_metadata as any)?.phone || undefined,
        });

        // Automatically fetch cloud data or offer sync
        await restoreFromCloud();
        setActiveView('dashboard');
        onSuccess?.();
        onClose();
      } else if (mode === 'forgot') {
        if (!email) {
          throw new Error('Please enter your registered email address.');
        }

        const { error } = await resetPasswordForEmail(email);
        if (error) throw error;

        setSuccessMsg('Password reset instructions have been dispatched to your email.');
      }
    } catch (err: any) {
      console.error('[AuthModal Error]:', err);
      let msg = err.message || 'Authentication request failed.';
      if (msg.includes('Failed to fetch')) {
        msg = 'Network connection issue contacting Supabase cloud. Please verify your connection or check if an ad-blocker / shield is blocking supabase.co.';
      } else if (msg.includes('Email not confirmed')) {
        msg = 'Email address not yet confirmed. Please check your inbox for the verification link, or disable "Confirm email" in your Supabase Auth dashboard.';
      }
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-xl max-w-md w-full p-6 shadow-elevated animate-in zoom-in-95 duration-150 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded text-ink-400 hover:text-ink-800 dark:hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-md bg-forest/10 text-forest dark:text-emerald-400">
            <Cloud className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-forest dark:text-emerald-400">
            Supabase Cloud Sync
          </span>
        </div>

        <h3 className="font-serif text-2xl font-bold text-ink-950 dark:text-ink-50">
          {mode === 'signin' && 'Sign in to SEMESTER'}
          {mode === 'signup' && 'Create your Cloud Account'}
          {mode === 'forgot' && 'Reset your Password'}
        </h3>

        <p className="text-xs text-ink-500 dark:text-ink-400 mt-1 mb-5">
          {mode === 'signin' && 'Access your synced study schedule and syllabus across devices.'}
          {mode === 'signup' && 'Securely backup your timetable, exam dates, and revision tracker to PostgreSQL.'}
          {mode === 'forgot' && 'Enter your email to receive a secure password recovery link.'}
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 text-xs flex flex-col gap-1.5">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            {mode === 'signup' && (
              <button
                type="button"
                onClick={() => {
                  updateProfile({
                    displayName: fullName.trim() || email.split('@')[0],
                    email: email.trim(),
                    phone: phone.trim() || undefined,
                  });
                  addToast({
                    type: 'info',
                    title: 'Offline Storage Active',
                    description: 'Logged in as guest. All your study sessions and exam dates are saved locally.',
                  });
                  setActiveView('dashboard');
                  onClose();
                }}
                className="self-start text-[11px] font-semibold text-forest dark:text-emerald-400 hover:underline mt-1 cursor-pointer"
              >
                Or continue into Planner using Browser Storage &rarr;
              </button>
            )}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-ink-400" />
                <input
                  type="text"
                  placeholder="e.g. Alex Taylor"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 text-ink-900 dark:text-ink-100"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
              University / Personal Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-ink-400" />
              <input
                type="email"
                required
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 text-ink-900 dark:text-ink-100"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
                  Phone / WhatsApp Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-2.5 text-ink-400" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210 or +1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 text-ink-900 dark:text-ink-100"
                  />
                </div>
                <p className="text-[11px] text-ink-500 dark:text-ink-400 mt-1">
                  Required for automated WhatsApp schedule updates & countdown alerts.
                </p>
              </div>

              <div className="p-2.5 rounded-lg border border-forest/20 dark:border-forest/40 bg-forest/5 dark:bg-forest/15 space-y-2">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableUpdates}
                    onChange={(e) => setEnableUpdates(e.target.checked)}
                    className="mt-0.5 rounded text-forest focus:ring-forest"
                  />
                  <span className="text-xs text-ink-800 dark:text-ink-200">
                    Send automated study schedule & countdown updates on <strong>Email & WhatsApp</strong>
                  </span>
                </label>
                {enableUpdates && (
                  <div className="flex items-center gap-2 pl-5 text-[11px] text-ink-600 dark:text-ink-400">
                    <BellRing className="w-3.5 h-3.5 text-forest dark:text-emerald-400" />
                    <span>Interval:</span>
                    <select
                      value={updateInterval}
                      onChange={(e) => setUpdateInterval(e.target.value as any)}
                      className="text-xs px-2 py-0.5 rounded border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 text-ink-900 dark:text-white"
                    >
                      <option value="1">Every 1 hour</option>
                      <option value="2">Every 2 hours (Recommended)</option>
                    </select>
                  </div>
                )}
              </div>
            </>
          )}

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-ink-700 dark:text-ink-300">
                  Password
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-[11px] text-forest dark:text-emerald-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-ink-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 text-ink-900 dark:text-ink-100"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-forest hover:bg-forest-hover text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-60"
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>
              {mode === 'signin' && 'Sign In'}
              {mode === 'signup' && 'Create Cloud Account'}
              {mode === 'forgot' && 'Send Password Reset Link'}
            </span>
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-paper-200 dark:border-paper-800 text-center text-xs text-ink-500">
          {mode === 'signin' ? (
            <p>
              Don't have a cloud account yet?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="font-semibold text-forest dark:text-emerald-400 hover:underline"
              >
                Sign up free
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="font-semibold text-forest dark:text-emerald-400 hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
