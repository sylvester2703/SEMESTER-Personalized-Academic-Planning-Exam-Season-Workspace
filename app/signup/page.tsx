'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signUpWithEmail } from '@/lib/supabase/service';
import {
  Lock,
  Mail,
  User,
  Phone,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  BellRing,
  Sparkles,
} from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [enableUpdates, setEnableUpdates] = useState(true);
  const [updateInterval, setUpdateInterval] = useState<'1' | '2'>('2');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (!email || !password) {
        throw new Error('Please enter your email and a secure password.');
      }
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }

      const { data, error } = await signUpWithEmail(email, password, fullName, phone);
      if (error) throw error;

      setSuccessMsg(
        'Account created successfully! Session is saved on this device. Redirecting to your workspace...'
      );
      setTimeout(() => {
        router.push('/');
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-paper-100 dark:bg-paper-950 text-ink-900 dark:text-ink-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-ink-500 hover:text-forest dark:hover:text-emerald-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Planner Workspace</span>
        </Link>

        <div className="flex items-center gap-2 mb-2">
          <span className="font-serif text-3xl font-bold tracking-tight text-forest dark:text-emerald-400">
            SEMESTER
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-forest/10 dark:bg-emerald-950 text-forest dark:text-emerald-300 border border-forest/20">
            Student Signup
          </span>
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink-950 dark:text-ink-50">
          Create Your Study Account
        </h2>
        <p className="text-xs text-ink-600 dark:text-ink-400 mt-1">
          Sign up once and stay automatically logged in across all your study sessions.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-paper-900 py-8 px-6 sm:px-8 shadow-card border border-paper-300 dark:border-paper-800 rounded-2xl">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-ink-400" />
                <input
                  type="text"
                  placeholder="e.g. Alex Taylor"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 text-ink-900 dark:text-ink-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
                University / Personal Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-ink-400" />
                <input
                  type="email"
                  required
                  placeholder="student@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 text-ink-900 dark:text-ink-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
                Phone / WhatsApp Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-ink-400" />
                <input
                  type="tel"
                  placeholder="+91 98765 43210 or +1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 text-ink-900 dark:text-ink-100"
                />
              </div>
              <p className="text-[11px] text-ink-500 dark:text-ink-400 mt-1">
                Used to dispatch automated study schedule updates & exam countdown alerts to WhatsApp.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-ink-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 text-ink-900 dark:text-ink-100"
                />
              </div>
            </div>

            {/* Automated Schedule Notification Preference */}
            <div className="p-3 rounded-xl border border-forest/25 dark:border-forest/40 bg-forest/5 dark:bg-forest/15 space-y-2.5">
              <label className="flex items-start gap-2.5 cursor-pointer">
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
                <div className="flex items-center gap-2 pl-6 text-xs text-ink-600 dark:text-ink-400">
                  <BellRing className="w-3.5 h-3.5 text-forest dark:text-emerald-400" />
                  <span>Update Interval:</span>
                  <select
                    value={updateInterval}
                    onChange={(e) => setUpdateInterval(e.target.value as any)}
                    className="text-xs px-2.5 py-1 rounded-md border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 text-ink-900 dark:text-white"
                  >
                    <option value="1">Every 1 hour</option>
                    <option value="2">Every 2 hours (Recommended)</option>
                  </select>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-forest hover:bg-forest-hover text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-60 cursor-pointer"
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Create Account & Launch Workspace</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-paper-200 dark:border-paper-800 text-center text-xs text-ink-500">
            <p>
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-semibold text-forest dark:text-emerald-400 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-ink-500 dark:text-ink-400">
          <ShieldCheck className="w-4 h-4 text-forest dark:text-emerald-400" />
          <span>Persistent session · Stays logged in automatically on next visit</span>
        </div>
      </div>
    </div>
  );
}
