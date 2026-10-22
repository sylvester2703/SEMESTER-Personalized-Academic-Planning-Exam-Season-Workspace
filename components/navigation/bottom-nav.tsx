'use client';

import React, { useState } from 'react';
import { usePlanner, ActiveView } from '@/lib/context/planner-context';
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  Timer,
  MoreHorizontal,
  GraduationCap,
  BarChart3,
  Flame,
  FileDown,
  Settings,
  Sparkles,
  Compass,
  X,
  RotateCcw,
} from 'lucide-react';

interface BottomNavProps {
  onOpenPdfExport?: () => void;
  onOpenWhatToStudy?: () => void;
}

export function BottomNav({ onOpenPdfExport, onOpenWhatToStudy }: BottomNavProps) {
  const {
    activeView,
    setActiveView,
    setIsRescueModalOpen,
    setIsOnboardingOpen,
    data,
    leaveSamplePlan,
  } = usePlanner();

  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // If on landing page, bottom nav is not needed
  if (activeView === 'landing') return null;

  const primaryItems: { view: ActiveView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { view: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { view: 'timetable', label: 'Plan', icon: Calendar },
    { view: 'readiness', label: 'Syllabus', icon: BookOpen },
    { view: 'focus', label: 'Focus', icon: Timer },
  ];

  const handleNav = (view: ActiveView) => {
    setActiveView(view);
    setIsMoreOpen(false);
  };

  return (
    <>
      {/* More Drawer Sheet on Mobile */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-ink-950/60 backdrop-blur-xs flex flex-col justify-end animate-fade-in">
          <div
            className="w-full bg-paper-100 dark:bg-paper-900 border-t border-paper-300 dark:border-paper-750 rounded-t-2xl p-5 shadow-2xl max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-paper-300/80 dark:border-paper-800">
              <span className="font-serif text-lg font-bold text-ink-900 dark:text-ink-50">
                More Features
              </span>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1.5 text-ink-400 hover:text-ink-700 dark:text-ink-300 rounded-md"
                aria-label="Close more menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-3 grid grid-cols-2 gap-2">
              {/* Exams */}
              <button
                onClick={() => handleNav('exams')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-colors ${
                  activeView === 'exams'
                    ? 'border-forest bg-forest/10 dark:bg-forest/20 text-forest dark:text-emerald-400 font-semibold'
                    : 'border-paper-300 dark:border-paper-750 bg-paper-50 dark:bg-paper-800/60 text-ink-800 dark:text-ink-200'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-forest dark:text-emerald-400" />
                <span className="text-xs font-medium">Exams & Subjects</span>
              </button>

              {/* Weekly Review */}
              <button
                onClick={() => handleNav('weekly-review')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-colors ${
                  activeView === 'weekly-review'
                    ? 'border-forest bg-forest/10 dark:bg-forest/20 text-forest dark:text-emerald-400 font-semibold'
                    : 'border-paper-300 dark:border-paper-750 bg-paper-50 dark:bg-paper-800/60 text-ink-800 dark:text-ink-200'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-forest dark:text-emerald-400" />
                <span className="text-xs font-medium">Weekly Review</span>
              </button>

              {/* Exam Survival Mode */}
              <button
                onClick={() => {
                  setIsMoreOpen(false);
                  setIsRescueModalOpen(true);
                }}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-500/10 text-amber-900 dark:text-amber-300 text-left"
              >
                <Flame className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold">Rescue My Plan</span>
                  <span className="text-[10px] text-amber-700/80 dark:text-amber-400/80">Exam Survival</span>
                </div>
              </button>

              {/* Study Now */}
              {onOpenWhatToStudy && (
                <button
                  onClick={() => {
                    setIsMoreOpen(false);
                    onOpenWhatToStudy();
                  }}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-paper-300 dark:border-paper-750 bg-paper-50 dark:bg-paper-800/60 text-ink-800 dark:text-ink-200 text-left"
                >
                  <Compass className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-medium">Study Now?</span>
                </button>
              )}

              {/* PDF Planner */}
              {onOpenPdfExport && (
                <button
                  onClick={() => {
                    setIsMoreOpen(false);
                    onOpenPdfExport();
                  }}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-paper-300 dark:border-paper-750 bg-paper-50 dark:bg-paper-800/60 text-ink-800 dark:text-ink-200 text-left"
                >
                  <FileDown className="w-4 h-4 text-forest dark:text-emerald-400" />
                  <span className="text-xs font-medium">Export PDF</span>
                </button>
              )}

              {/* Settings */}
              <button
                onClick={() => handleNav('settings')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-colors ${
                  activeView === 'settings'
                    ? 'border-forest bg-forest/10 dark:bg-forest/20 text-forest dark:text-emerald-400 font-semibold'
                    : 'border-paper-300 dark:border-paper-750 bg-paper-50 dark:bg-paper-800/60 text-ink-800 dark:text-ink-200'
                }`}
              >
                <Settings className="w-4 h-4 text-ink-500 dark:text-ink-300" />
                <span className="text-xs font-medium">Settings & Routine</span>
              </button>
            </div>

            {/* Bottom Actions */}
            <div className="mt-3 pt-3 border-t border-paper-300/80 dark:border-paper-800 flex flex-col gap-2">
              {data.profile.isSampleData ? (
                <button
                  onClick={() => {
                    setIsMoreOpen(false);
                    leaveSamplePlan();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-forest hover:bg-forest-hover text-white text-xs font-medium flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Leave Sample Mode & Build My Plan</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsMoreOpen(false);
                    setIsOnboardingOpen(true);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-forest hover:bg-forest-hover text-white text-xs font-medium flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Re-run Plan Generator</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar on Mobile */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-paper-100/95 dark:bg-paper-950/95 backdrop-blur-md border-t border-paper-300 dark:border-paper-800 px-2 py-1 shadow-lg"
        aria-label="Mobile Navigation"
      >
        <div className="grid grid-cols-5 items-center max-w-md mx-auto">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.view && !isMoreOpen;
            return (
              <button
                key={item.view}
                onClick={() => handleNav(item.view)}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg transition-colors ${
                  isActive
                    ? 'text-forest dark:text-emerald-400 font-semibold'
                    : 'text-ink-500 dark:text-ink-300 hover:text-ink-800 dark:hover:text-ink-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              </button>
            );
          })}

          {/* 5th Tab: More */}
          <button
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg transition-colors ${
              isMoreOpen || (activeView !== 'dashboard' && activeView !== 'timetable' && activeView !== 'readiness' && activeView !== 'focus')
                ? 'text-forest dark:text-emerald-400 font-semibold'
                : 'text-ink-500 dark:text-ink-300 hover:text-ink-800 dark:hover:text-ink-100'
            }`}
          >
            <MoreHorizontal className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[10px] mt-0.5 tracking-tight">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
