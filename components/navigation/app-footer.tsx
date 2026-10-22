'use client';

import React, { useState } from 'react';
import { usePlanner } from '@/lib/context/planner-context';
import { Shield, Sparkles, BookOpen, HardDrive, FileDown, Heart } from 'lucide-react';

interface AppFooterProps {
  onOpenPdfExport?: () => void;
  onOpenWhatToStudy?: () => void;
}

export function AppFooter({ onOpenPdfExport, onOpenWhatToStudy }: AppFooterProps) {
  const { setActiveView, setIsOnboardingOpen } = usePlanner();
  const [legalModalOpen, setLegalModalOpen] = useState<'about' | 'privacy' | null>(null);

  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="border-t border-paper-300 dark:border-paper-800 bg-paper-100/60 dark:bg-paper-950 text-ink-600 dark:text-ink-400 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Col 1: Brand & Logo */}
            <div className="md:col-span-1 space-y-3">
              <div className="flex items-center gap-2.5">
                {/* Minimal geometric SEMESTER vector logo mark */}
                <div className="flex items-end gap-1 h-5">
                  <span className="w-1.5 h-3.5 rounded-xs bg-forest dark:bg-emerald-500" />
                  <span className="w-1.5 h-5 rounded-xs bg-forest dark:bg-emerald-500" />
                  <span className="w-1.5 h-2.5 rounded-xs bg-amber-warm dark:bg-amber-400" />
                </div>
                <span className="font-serif text-lg font-bold tracking-tight text-ink-950 dark:text-white">
                  SEMESTER
                </span>
              </div>
              <p className="text-xs text-ink-500 dark:text-ink-400 leading-relaxed">
                Make a plan. Find your focus. Walk in prepared. Every semester deserves a better plan.
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-forest dark:text-emerald-400 font-medium">
                <HardDrive className="w-3.5 h-3.5" />
                <span>100% Local-First & Private</span>
              </div>
            </div>

            {/* Col 2: Navigation */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-ink-900 dark:text-white mb-3">
                Workspace
              </div>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setActiveView('dashboard')}
                    className="hover:text-forest dark:hover:text-emerald-400 transition-colors"
                  >
                    Dashboard
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveView('timetable')}
                    className="hover:text-forest dark:hover:text-emerald-400 transition-colors"
                  >
                    Weekly Timetable
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveView('exams')}
                    className="hover:text-forest dark:hover:text-emerald-400 transition-colors"
                  >
                    Exams & Courses
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveView('readiness')}
                    className="hover:text-forest dark:hover:text-emerald-400 transition-colors"
                  >
                    Syllabus Readiness Map
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveView('focus')}
                    className="hover:text-forest dark:hover:text-emerald-400 transition-colors"
                  >
                    Focus Mode
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Student Tools */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-ink-900 dark:text-white mb-3">
                Study Features
              </div>
              <ul className="space-y-2">
                {onOpenWhatToStudy && (
                  <li>
                    <button
                      onClick={onOpenWhatToStudy}
                      className="hover:text-forest dark:hover:text-emerald-400 transition-colors text-left"
                    >
                      What should I study now?
                    </button>
                  </li>
                )}
                {onOpenPdfExport && (
                  <li>
                    <button
                      onClick={onOpenPdfExport}
                      className="hover:text-forest dark:hover:text-emerald-400 transition-colors text-left flex items-center gap-1"
                    >
                      <FileDown className="w-3 h-3 text-forest dark:text-emerald-400" />
                      <span>Download Study Planner (PDF)</span>
                    </button>
                  </li>
                )}
                <li>
                  <button
                    onClick={() => setIsOnboardingOpen(true)}
                    className="hover:text-forest dark:hover:text-emerald-400 transition-colors text-left"
                  >
                    Re-run Personal Onboarding
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveView('weekly-review')}
                    className="hover:text-forest dark:hover:text-emerald-400 transition-colors text-left"
                  >
                    Weekly Honest Review
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Trust & Transparency */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-ink-900 dark:text-white mb-3">
                Trust & Data Privacy
              </div>
              <p className="text-[11px] text-ink-500 dark:text-ink-400 leading-relaxed mb-3">
                SEMESTER operates entirely on the client-side. Your syllabus, timetable, routine commitments, and notes remain stored strictly in this browser’s local storage.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setLegalModalOpen('privacy')}
                  className="text-xs text-forest dark:text-emerald-400 hover:underline"
                >
                  Privacy Notice
                </button>
                <span>·</span>
                <button
                  onClick={() => setLegalModalOpen('about')}
                  className="text-xs text-forest dark:text-emerald-400 hover:underline"
                >
                  About SEMESTER
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div className="pt-6 border-t border-paper-200 dark:border-paper-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-ink-500 dark:text-ink-400">
            <div>
              © {currentYear} SEMESTER. All rights reserved. Built for students with genuine academic empathy.
            </div>
          </div>
        </div>
      </footer>

      {/* Legal & Privacy Disclosure Modal */}
      {legalModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-paper-900 border border-paper-300 dark:border-paper-800 rounded-xl max-w-lg w-full p-6 shadow-elevated relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setLegalModalOpen(null)}
              className="absolute top-4 right-4 p-1.5 rounded text-ink-400 hover:text-ink-800 dark:hover:text-white"
            >
              ✕
            </button>

            {legalModalOpen === 'about' ? (
              <div>
                <h3 className="font-serif text-xl font-bold text-ink-950 dark:text-white mb-2">
                  About SEMESTER
                </h3>
                <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed mb-3">
                  SEMESTER was created by university students who understand the crushing stress of examination season: overlapping course deadlines, rigid college hours, difficult topics, and unrealistic study advice.
                </p>
                <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed mb-3">
                  Instead of telling students how they "should" live, SEMESTER uses transparent, deterministic rules to schedule study blocks strictly around the student’s actual fixed routine (college, commute, sleep, meals) with guilt-free recovery when life intervenes.
                </p>
                <div className="p-3 rounded-lg bg-paper-100 dark:bg-paper-800 text-[11px] text-ink-600 dark:text-ink-400">
                  SEMESTER and its original branding, website design, and authored materials are protected by applicable intellectual property laws. All rights are reserved except where otherwise stated.
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-serif text-xl font-bold text-ink-950 dark:text-white mb-2">
                  Privacy & Local Storage Transparency
                </h3>
                <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed mb-3">
                  SEMESTER requires <strong>no account creation</strong>, no login, and no backend database. All your data—including course names, exam dates, syllabus topics, routine commitments, and study history—is stored solely in your current browser’s <code className="bg-paper-200 dark:bg-paper-800 px-1 py-0.5 rounded">localStorage</code>.
                </p>
                <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed mb-3">
                  Data is not automatically synchronized across devices. To transfer your data between devices or create a backup, use the <strong>Export JSON</strong> feature in Settings or download a print-ready PDF planner.
                </p>
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300">
                  Zero analytics tracking, zero third-party ads, zero cookies. Your study data belongs to you.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
