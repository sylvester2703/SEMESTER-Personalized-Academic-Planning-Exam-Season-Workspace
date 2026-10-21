'use client';

import React from 'react';
import { usePlanner } from '@/lib/context/planner-context';
import { CheckCircle2, Info, AlertTriangle, AlertCircle, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = usePlanner();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let borderClass = 'border-sage-border dark:border-forest/40';
        let bgClass = 'bg-paper-50 dark:bg-paper-900';
        let iconColor = 'text-forest dark:text-emerald-400';

        if (toast.type === 'info') {
          Icon = Info;
          iconColor = 'text-sky-600 dark:text-sky-400';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          iconColor = 'text-amber-warm dark:text-amber-400';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          iconColor = 'text-rose-600 dark:text-rose-400';
        }

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border ${borderClass} ${bgClass} shadow-dropdown transition-all transform translate-y-0 opacity-100 text-sm`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-ink-900 dark:text-ink-50">{toast.title}</p>
              {toast.description && (
                <p className="text-xs text-ink-600 dark:text-ink-400 mt-0.5">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 transition-colors rounded"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
