'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmail } from '@/lib/supabase/service';
import { Lock, Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        throw new Error('Please enter both your email address and password.');
      }

      const { data, error } = await signInWithEmail(email, password);
      if (error) throw error;

      setSuccessMsg(`Welcome back! Signed in as ${data.user?.email}. Redirecting to your study plan...`);
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to sign in. Please check your credentials.');
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
            Cloud Auth
          </span>
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink-950 dark:text-ink-50">
          Sign In to Your Workspace
        </h2>
        <p className="text-xs text-ink-600 dark:text-ink-400 mt-1">
          Access your exam countdown, timetable, and syllabus readiness from any browser.
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
                University / Personal Email
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
                Password
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-forest hover:bg-forest-hover text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-60 cursor-pointer"
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Sign In to SEMESTER</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-paper-200 dark:border-paper-800 text-center text-xs text-ink-500">
            <p>
              First time visiting?{' '}
              <Link
                href="/signup"
                className="font-semibold text-forest dark:text-emerald-400 hover:underline"
              >
                Sign up free with phone & email
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-ink-500 dark:text-ink-400">
          <ShieldCheck className="w-4 h-4 text-forest dark:text-emerald-400" />
          <span>Persistent session · Stays logged in automatically on this device</span>
        </div>
      </div>
    </div>
  );
}
