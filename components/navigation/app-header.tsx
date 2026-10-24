'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePlanner, ActiveView } from '@/lib/context/planner-context';
import {
  LayoutDashboard,
  Calendar,
  GraduationCap,
  Timer,
  BarChart3,
  Settings,
  Sun,
  Moon,
  Laptop,
  Menu,
  X,
  Sparkles,
  BookOpen,
  FileDown,
  Compass,
  ChevronDown,
  Flame,
  RotateCcw,
  User,
  UserPlus,
  LogOut,
  LogIn,
} from 'lucide-react';

interface AppHeaderProps {
  onOpenNewSession?: () => void;
  onOpenNewSubject?: () => void;
  onOpenPdfExport?: () => void;
  onOpenWhatToStudy?: () => void;
}

export function AppHeader({
  onOpenNewSession,
  onOpenNewSubject,
  onOpenPdfExport,
  onOpenWhatToStudy,
}: AppHeaderProps) {
  const {
    data,
    activeView,
    setActiveView,
    theme,
    setTheme,
    setIsOnboardingOpen,
    setIsRescueModalOpen,
    leaveSamplePlan,
    currentUser,
    setIsAuthModalOpen,
    signOut,
  } = usePlanner();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMoreDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 5 Primary Desktop Tabs per Section 6 Specification
  const primaryNavItems: { view: ActiveView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { view: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { view: 'timetable', label: 'My Plan', icon: Calendar },
    { view: 'readiness', label: 'Syllabus', icon: BookOpen },
    { view: 'exams', label: 'Exams', icon: GraduationCap },
    { view: 'focus', label: 'Focus', icon: Timer },
  ];

  const handleNavClick = (view: ActiveView) => {
    setActiveView(view);
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
  };

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const isSecondaryActive =
    activeView === 'weekly-review' || activeView === 'settings';

  return (
    <header className="sticky top-0 z-40 bg-paper-100/90 dark:bg-paper-950/90 backdrop-blur-md border-b border-paper-300/80 dark:border-paper-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Wordmark with Vector Geometric Mark */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveView('landing')}
              className="text-left group flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest rounded-sm"
              aria-label="SEMESTER home"
            >
              <div className="flex items-end gap-1 h-5 shrink-0">
                <span className="w-1.5 h-3.5 rounded-xs bg-forest dark:bg-emerald-500 group-hover:scale-y-110 transition-transform" />
                <span className="w-1.5 h-5 rounded-xs bg-forest dark:bg-emerald-500 group-hover:scale-y-110 transition-transform" />
                <span className="w-1.5 h-2.5 rounded-xs bg-amber-warm dark:bg-amber-400 group-hover:scale-y-110 transition-transform" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-2xl font-bold tracking-tight text-ink-950 dark:text-white group-hover:text-forest transition-colors">
                  SEMESTER
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase tracking-widest text-ink-500 dark:text-ink-400 font-semibold border-l border-paper-300 dark:border-paper-800 pl-2">
                  Academic Planner
                </span>
              </div>
            </button>

            {/* Sample Demonstration Indicator */}
            {data.profile.isSampleData && (
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-[11px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>Sample Demo</span>
                <button
                  onClick={leaveSamplePlan}
                  className="ml-1 text-[11px] font-semibold underline hover:text-amber-700 dark:hover:text-amber-100"
                  title="Clear demonstration data and start your personal plan"
                >
                  Start My Plan
                </button>
              </div>
            )}

            {/* Desktop Navigation Tabs: 5 Primary Destinations */}
            {activeView !== 'landing' && (
              <nav className="hidden md:flex items-center gap-1 ml-2" aria-label="Main Navigation">
                {primaryNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.view;
                  return (
                    <button
                      key={item.view}
                      onClick={() => handleNavClick(item.view)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
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

                {/* Desktop "More" Dropdown Menu */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                      isSecondaryActive || moreDropdownOpen
                        ? 'bg-paper-200 dark:bg-paper-800 text-forest dark:text-emerald-400 font-semibold'
                        : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-100 hover:bg-paper-200/50 dark:hover:bg-paper-900'
                    }`}
                    aria-expanded={moreDropdownOpen}
                    aria-haspopup="true"
                  >
                    <span>More</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {moreDropdownOpen && (
                    <div className="absolute left-0 mt-1 w-56 rounded-xl border border-paper-300 dark:border-paper-750 bg-paper-100 dark:bg-paper-900 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <button
                        onClick={() => handleNavClick('weekly-review')}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors ${
                          activeView === 'weekly-review'
                            ? 'bg-forest/10 dark:bg-forest/20 text-forest dark:text-emerald-400 font-semibold'
                            : 'text-ink-700 dark:text-ink-300 hover:bg-paper-200 dark:hover:bg-paper-800'
                        }`}
                      >
                        <BarChart3 className="w-4 h-4 text-forest dark:text-emerald-400" />
                        <div>
                          <div className="font-medium">Weekly Review</div>
                          <div className="text-[10px] text-ink-500 dark:text-ink-400">Study completion insights</div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setMoreDropdownOpen(false);
                          setIsRescueModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left text-amber-900 dark:text-amber-300 hover:bg-amber-500/10 dark:hover:bg-amber-500/20 transition-colors"
                      >
                        <Flame className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <div>
                          <div className="font-semibold flex items-center gap-1.5">
                            Rescue My Plan
                            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-200/60 dark:bg-amber-900/60">Survival</span>
                          </div>
                          <div className="text-[10px] text-amber-700/80 dark:text-amber-400/80">Exam triage recovery</div>
                        </div>
                      </button>

                      <div className="my-1 border-t border-paper-200 dark:border-paper-800" />

                      {onOpenWhatToStudy && (
                        <button
                          onClick={() => {
                            setMoreDropdownOpen(false);
                            onOpenWhatToStudy();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left text-ink-700 dark:text-ink-300 hover:bg-paper-200 dark:hover:bg-paper-800 transition-colors"
                        >
                          <Compass className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          <span>What Should I Study Now?</span>
                        </button>
                      )}

                      {onOpenPdfExport && (
                        <button
                          onClick={() => {
                            setMoreDropdownOpen(false);
                            onOpenPdfExport();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left text-ink-700 dark:text-ink-300 hover:bg-paper-200 dark:hover:bg-paper-800 transition-colors"
                        >
                          <FileDown className="w-4 h-4 text-forest dark:text-emerald-400" />
                          <span>Download Study Planner (PDF)</span>
                        </button>
                      )}

                      <div className="my-1 border-t border-paper-200 dark:border-paper-800" />

                      <button
                        onClick={() => handleNavClick('settings')}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors ${
                          activeView === 'settings'
                            ? 'bg-forest/10 dark:bg-forest/20 text-forest dark:text-emerald-400 font-semibold'
                            : 'text-ink-700 dark:text-ink-300 hover:bg-paper-200 dark:hover:bg-paper-800'
                        }`}
                      >
                        <Settings className="w-4 h-4 text-ink-500 dark:text-ink-300" />
                        <span>Settings & Daily Routine</span>
                      </button>
                    </div>
                  )}
                </div>
              </nav>
            )}
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2">
            {activeView === 'landing' ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Open planner */}
                <button
                  onClick={() => setActiveView('dashboard')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-ink-700 dark:text-ink-300 hover:text-forest dark:hover:text-emerald-400 transition-colors px-2 py-1.5 cursor-pointer"
                  title="Open full interactive planner"
                >
                  <span>Open planner</span>
                </button>

                {/* Login & Sign Up vs Logout based on authentication */}
                {currentUser ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-forest/10 dark:bg-forest/20 text-forest dark:text-emerald-400 text-xs font-medium border border-forest/20">
                    <User className="w-3.5 h-3.5 shrink-0" />
                    <span className="max-w-[110px] truncate hidden sm:inline">{currentUser.email?.split('@')[0] || 'Student'}</span>
                    <button
                      onClick={() => signOut()}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Sign Out"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setIsAuthModalOpen(true)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-paper-300 dark:border-paper-700 hover:border-forest/50 bg-paper-100 hover:bg-paper-200 dark:bg-paper-800 dark:hover:bg-paper-750 text-ink-800 dark:text-ink-200 hover:text-forest dark:hover:text-emerald-400 text-xs font-semibold transition-all cursor-pointer"
                      title="Login to your account"
                    >
                      <LogIn className="w-3.5 h-3.5 text-forest dark:text-emerald-400" />
                      <span>Login</span>
                    </button>
                    <button
                      onClick={() => setIsAuthModalOpen(true)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-forest hover:bg-forest-hover text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                      title="Sign up free"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Sign Up</span>
                    </button>
                  </div>
                )}

                {/* Download PDF */}
                {onOpenPdfExport && (
                  <button
                    onClick={onOpenPdfExport}
                    className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-paper-300 dark:border-paper-700 bg-paper-100 hover:bg-paper-200 dark:bg-paper-800 dark:hover:bg-paper-750 text-ink-900 dark:text-ink-100 hover:text-forest dark:hover:text-emerald-300 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <FileDown className="w-3.5 h-3.5 text-forest dark:text-emerald-400" />
                    <span>Download PDF</span>
                  </button>
                )}

                {/* Build study plan */}
                <button
                  onClick={() => setIsOnboardingOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-forest hover:bg-forest-hover text-white text-xs font-semibold shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-forest cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Build study plan</span>
                  <span className="sm:hidden">Plan</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Assistant Trigger Button */}
                {onOpenWhatToStudy && (
                  <button
                    onClick={onOpenWhatToStudy}
                    className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-xs font-semibold transition-all shadow-2xs cursor-pointer"
                    title="Calculate next best study task"
                  >
                    <Compass className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Study Now?</span>
                  </button>
                )}

                {/* PDF Planner Download Button */}
                {onOpenPdfExport && (
                  <button
                    onClick={onOpenPdfExport}
                    className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-paper-300 dark:border-paper-700 bg-paper-100 hover:bg-paper-200 dark:bg-paper-800 dark:hover:bg-paper-750 text-ink-900 dark:text-ink-100 hover:text-forest dark:hover:text-emerald-300 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                    title="Download printable study planner PDF"
                  >
                    <FileDown className="w-3.5 h-3.5 text-forest dark:text-emerald-400" />
                    <span>PDF</span>
                  </button>
                )}

                {/* Quick Add Session Button */}
                {onOpenNewSession && (
                  <button
                    onClick={onOpenNewSession}
                    className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-forest hover:bg-forest-hover text-white text-xs font-medium shadow-subtle transition-all cursor-pointer"
                  >
                    <span>+ Session</span>
                  </button>
                )}

                {/* Auth Controls in planner view */}
                {currentUser ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-forest/10 dark:bg-forest/20 text-forest dark:text-emerald-400 text-xs font-medium border border-forest/20">
                    <User className="w-3.5 h-3.5 shrink-0" />
                    <span className="max-w-[100px] truncate hidden md:inline">{currentUser.email?.split('@')[0] || 'Student'}</span>
                    <button
                      onClick={() => signOut()}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Sign Out"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setIsAuthModalOpen(true)}
                      className="px-2.5 py-1.5 rounded-md border border-paper-300 dark:border-paper-700 hover:border-forest/50 bg-paper-100 hover:bg-paper-200 dark:bg-paper-800 text-xs font-semibold text-ink-800 dark:text-ink-200 hover:text-forest dark:hover:text-emerald-400 transition-colors cursor-pointer"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => setIsAuthModalOpen(true)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-forest hover:bg-forest-hover text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Sign Up</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Theme switcher */}
            <button
              onClick={cycleTheme}
              className="p-1.5 rounded-md text-ink-600 dark:text-ink-300 hover:text-ink-900 dark:hover:text-white hover:bg-paper-200 dark:hover:bg-paper-800 transition-colors cursor-pointer"
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

            {/* Mobile menu toggle (secondary access on mobile if needed) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-md text-ink-600 dark:text-ink-300 hover:text-ink-900 dark:hover:text-white hover:bg-paper-200 dark:hover:bg-paper-800 transition-colors"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu fallback */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-paper-300 dark:border-paper-800 bg-paper-100 dark:bg-paper-950 px-4 pt-3 pb-6 animate-in slide-in-from-top-2 duration-150">
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
              Planner Destinations
            </p>

            {primaryNavItems.map((item) => {
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

            <div className="my-1 border-t border-paper-300/60 dark:border-paper-800" />

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsRescueModalOpen(true);
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-amber-900 dark:text-amber-300 bg-amber-500/10"
            >
              <Flame className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Rescue My Exam Plan (Survival Mode)</span>
            </button>

            <button
              onClick={() => handleNavClick('weekly-review')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium ${
                activeView === 'weekly-review'
                  ? 'bg-forest/10 dark:bg-forest/20 text-forest dark:text-emerald-400 font-semibold'
                  : 'text-ink-700 dark:text-ink-300'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Weekly Review</span>
            </button>

            <button
              onClick={() => handleNavClick('settings')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium ${
                activeView === 'settings'
                  ? 'bg-forest/10 dark:bg-forest/20 text-forest dark:text-emerald-400 font-semibold'
                  : 'text-ink-700 dark:text-ink-300'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings & Daily Routine</span>
            </button>

            <div className="my-1 border-t border-paper-300/60 dark:border-paper-800" />

            {/* Mobile Auth Actions */}
            {currentUser ? (
              <div className="flex items-center justify-between px-3 py-2 bg-paper-200/50 dark:bg-paper-800/50 rounded-md">
                <div className="flex items-center gap-2 text-xs font-medium text-forest dark:text-emerald-400">
                  <User className="w-4 h-4" />
                  <span className="truncate">{currentUser.email || 'Student'}</span>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-xs text-rose-700 dark:text-rose-300 font-semibold transition-colors cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsAuthModalOpen(true);
                  }}
                  className="w-full py-2 px-3 rounded-md border border-paper-300 dark:border-paper-700 text-ink-800 dark:text-ink-100 text-xs font-semibold text-center"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsAuthModalOpen(true);
                  }}
                  className="w-full py-2 px-3 rounded-md bg-forest text-white text-xs font-semibold text-center flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </button>
              </div>
            )}

            {data.profile.isSampleData && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  leaveSamplePlan();
                }}
                className="mt-2 w-full py-2 px-3 rounded-md bg-forest text-white text-xs font-medium flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Leave Sample Mode & Start My Plan</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
