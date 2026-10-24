'use client';

import React, { useEffect } from 'react';
import { RotateCcw, AlertCircle, Home, Sparkles } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[SEMESTER Global Error Boundary]:', error);
  }, [error]);

  const handleClearCacheAndReset = () => {
    try {
      if (typeof window !== 'undefined') {
        // Keep profile credentials if present but clear corrupted transient keys
        sessionStorage.clear();
      }
    } catch (e) {
      console.warn('Session clear notice:', e);
    }
    reset();
  };

  return (
    <div className="min-h-screen bg-[#F7F5EF] dark:bg-stone-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 sm:p-8 shadow-xl text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-forest/10 dark:bg-emerald-950/40 text-forest dark:text-emerald-400 mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
            Workspace Recovered
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
            A temporary view error occurred while rendering your planner. Your saved study data and exams are safe.
          </p>
        </div>

        {error?.message && (
          <div className="p-2.5 rounded-lg bg-stone-100 dark:bg-stone-800/60 text-[11px] font-mono text-stone-600 dark:text-stone-300 break-words text-left max-h-24 overflow-y-auto">
            {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-hover text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reload Planner</span>
          </button>

          <button
            onClick={handleClearCacheAndReset}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-medium transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-forest dark:text-emerald-400" />
            <span>Clean Recovery</span>
          </button>
        </div>

        <div className="pt-2">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-forest dark:hover:text-emerald-400 transition-colors"
          >
            <Home className="w-3 h-3" />
            <span>Return to Landing Page</span>
          </a>
        </div>
      </div>
    </div>
  );
}
