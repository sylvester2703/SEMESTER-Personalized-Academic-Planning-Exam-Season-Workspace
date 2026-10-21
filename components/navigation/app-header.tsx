'use client';

import React, { useState } from 'react';
import { usePlanner, ActiveView } from '@/lib/context/planner-context';
import {
  LayoutDashboard,
  Calendar,
  GraduationCap,
  MapPin,
  Timer,
  BarChart3,
  Settings,
  Sun,
  Moon,
  Laptop,
  Menu,
  X,
  Sparkles,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

interface AppHeaderProps {
  onOpenNewSession?: () => void;
  onOpenNewSubject?: () => void;
}

export function AppHeader({ onOpenNewSession, onOpenNewSubject }: AppHeaderProps) {
  const {
    data,
    activeView,
    setActiveView,
    theme,
    setTheme,
    setIsOnboardingOpen,
    resetAllData,
  } = usePlanner();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { view: ActiveView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { view: 'timetable', label: 'Timetable', icon: Calendar },
    { view: 'exams', label: 'Exams & Subjects', icon: GraduationCap },
    { view: 'readiness', label: 'Readiness Map', icon: MapPin },
    { view: 'focus', label: 'Focus Mode', icon: Timer },
    { view: 'weekly-review', label: 'Weekly Review', icon: BarChart3 },
    { view: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (view: ActiveView) => {
    setActiveView(view);
    setMobileMenuOpen(false);
  };

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <header className="sticky top-0 z-40 bg-paper-100/90 dark:bg-paper-950/90 backdrop-blur-md border-b border-paper-300/80 dark:border-paper-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Wordmark */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveView('landing')}
              className="text-left group flex items-baseline gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest rounded-sm"
              aria-label="SEMESTER home"
            >
              <span className="font-serif text-2xl font-semibold tracking-tight text-ink-950 dark:text-white group-hover:text-forest transition-colors">
                SEMESTER
              </span>
              <span className="hidden sm:inline-block text-[11px] uppercase tracking-widest text-ink-500 dark:text-ink-400 font-medium border-l border-paper-300 dark:border-paper-800 pl-2.5">
                Exam Planner
              </span>
            </button>

            {/* Desktop Navigation Tabs (when in workspace) */}
            {activeView !== 'landing' && (
              <nav className="hidden lg:flex items-center gap-1 ml-2" aria-label="Main Navigation">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.view;
                  return (
                    <button
                      key={item.view}
                      onClick={() => handleNavClick(item.view)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-paper-200 dark:bg-paper-800 text-forest dark:text-emerald-400 font-semibold shadow-subtle'
                          : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-100 hover:bg-paper-200/50 dark:hover:bg-paper-900'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5">
            {/* Sample data badge indicator */}
            {data.profile.isSampleData && activeView !== 'landing' && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-light dark:bg-amber-950/40 border border-amber-border dark:border-amber-700/40 text-[11px] text-amber-badge dark:text-amber-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-warm animate-pulse" />
                <span>Sample Data Active</span>
              </div>
            )}

            {/* If on Landing page */}
            {activeView === 'landing' ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveView('dashboard')}
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-ink-700 dark:text-ink-300 hover:text-forest dark:hover:text-emerald-400 transition-colors px-2 py-1"
                >
                  <span>Open planner</span>
                </button>
                <button
                  onClick={() => setIsOnboardingOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-forest hover:bg-forest-hover text-white text-xs font-medium shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-forest"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Build study plan</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Switch back to Landing */}
                <button
                  onClick={() => setActiveView('landing')}
                  className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-100 hover:bg-paper-200/60 transition-colors"
                  title="View overview & documentation"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Overview</span>
                </button>

                {/* Quick Add Session Button */}
                {onOpenNewSession && (
                  <button
                    onClick={onOpenNewSession}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-forest hover:bg-forest-hover text-white text-xs font-medium shadow-subtle transition-all"
                  >
                    <span>+ New Session</span>
                  </button>
                )}
              </div>
            )}

            {/* Theme switcher */}
            <button
              onClick={cycleTheme}
              className="p-1.5 rounded-md text-ink-600 dark:text-ink-300 hover:text-ink-900 dark:hover:text-white hover:bg-paper-200 dark:hover:bg-paper-800 transition-colors"
              aria-label={`Current theme: ${theme}. Click to change.`}
              title={`Theme: ${theme}`}
            >
              {theme === 'dark' ? (
                <Moon className="w-4 h-4" />
              ) : theme === 'light' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Laptop className="w-4 h-4" />
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-md text-ink-600 dark:text-ink-300 hover:text-ink-900 dark:hover:text-white hover:bg-paper-200 dark:hover:bg-paper-800 transition-colors"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-paper-300 dark:border-paper-800 bg-paper-100 dark:bg-paper-950 px-4 pt-3 pb-6 animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => handleNavClick('landing')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium ${
                activeView === 'landing'
                  ? 'bg-paper-200 dark:bg-paper-800 text-forest dark:text-emerald-400 font-semibold'
                  : 'text-ink-700 dark:text-ink-300'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Welcome & Product Overview</span>
            </button>

            <div className="my-1 border-t border-paper-300/60 dark:border-paper-800" />
            <p className="px-3 text-[10px] uppercase tracking-wider font-semibold text-ink-400">
              Planner Workspace
            </p>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => handleNavClick(item.view)}
                  className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-forest/10 dark:bg-forest/20 text-forest dark:text-emerald-400 font-semibold'
                      : 'text-ink-700 dark:text-ink-300 hover:bg-paper-200 dark:hover:bg-paper-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-forest dark:bg-emerald-400" />}
                </button>
              );
            })}

            <div className="mt-3 pt-3 border-t border-paper-300 dark:border-paper-800 flex flex-col gap-2">
              <button
                onClick={() => {
                  setIsOnboardingOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-forest text-white text-sm font-medium"
              >
                <Sparkles className="w-4 h-4" />
                <span>Build New Study Plan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
