'use client';

import React, { useState } from 'react';
import { PlannerProvider, usePlanner } from '@/lib/context/planner-context';
import { AppHeader } from '@/components/navigation/app-header';
import { AppFooter } from '@/components/navigation/app-footer';
import { BottomNav } from '@/components/navigation/bottom-nav';
import { RescuePlanModal } from '@/components/survival/rescue-plan-modal';
import { LandingView } from '@/components/landing/landing-view';
import { DashboardView } from '@/components/dashboard/dashboard-view';
import { TimetableView } from '@/components/timetable/timetable-view';
import { ExamsView } from '@/components/exams/exams-view';
import { ReadinessView } from '@/components/readiness/readiness-view';
import { FocusView } from '@/components/focus/focus-view';
import { WeeklyReviewView } from '@/components/weekly-review/weekly-review-view';
import { SettingsView } from '@/components/settings/settings-view';
import { OnboardingModal } from '@/components/onboarding/onboarding-modal';
import { SessionModal } from '@/components/modals/session-modal';
import { SubjectModal } from '@/components/modals/subject-modal';
import { TopicModal } from '@/components/modals/topic-modal';
import { SuggestPlanModal } from '@/components/modals/suggest-plan-modal';
import { PdfExportModal } from '@/components/modals/pdf-export-modal';
import { WhatToStudyModal } from '@/components/assistant/what-to-study-modal';
import { MissedSessionModal } from '@/components/modals/missed-session-modal';
import { ActiveRecallModal } from '@/components/recall/active-recall-modal';
import { SyllabusManagerModal } from '@/components/syllabus/syllabus-manager-modal';
import { ExamTriageModal } from '@/components/modals/exam-triage-modal';
import { AuthModal } from '@/components/auth/auth-modal';
import { ToastContainer } from '@/components/shared/toast-container';
import { StudySession, Subject, Topic } from '@/types';

function PlannerApp() {
  const {
    data,
    activeView,
    setActiveView,
    isOnboardingOpen,
    setIsOnboardingOpen,
    isAuthModalOpen,
    setIsAuthModalOpen,
    currentUser,
    addToast,
  } = usePlanner();

  // Enforce authentication: if logged out, ensure view remains strictly on landing page
  React.useEffect(() => {
    if (!currentUser && activeView !== 'landing') {
      setActiveView('landing');
    }
  }, [currentUser, activeView, setActiveView]);

  // Modal states
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [sessionToEdit, setSessionToEdit] = useState<StudySession | null>(null);
  const [initialSessionDate, setInitialSessionDate] = useState<string | undefined>();
  const [initialSessionSubjId, setInitialSessionSubjId] = useState<string | undefined>();

  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [subjectToEdit, setSubjectToEdit] = useState<Subject | null>(null);

  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [topicToEdit, setTopicToEdit] = useState<Topic | null>(null);
  const [initialTopicSubjId, setInitialTopicSubjId] = useState<string | undefined>();

  const [suggestPlanModalOpen, setSuggestPlanModalOpen] = useState(false);

  // New Feature Modals
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [whatToStudyOpen, setWhatToStudyOpen] = useState(false);
  const [missedSessionModalOpen, setMissedSessionModalOpen] = useState(false);
  const [sessionToRecover, setSessionToRecover] = useState<StudySession | null>(null);

  const [activeRecallModalOpen, setActiveRecallModalOpen] = useState(false);
  const [topicForRecall, setTopicForRecall] = useState<Topic | null>(null);

  const [syllabusManagerOpen, setSyllabusManagerOpen] = useState(false);
  const [initialSyllabusSubjId, setInitialSyllabusSubjId] = useState<string | undefined>();

  const [examTriageModalOpen, setExamTriageModalOpen] = useState(false);
  const [initialTriageSubjId, setInitialTriageSubjId] = useState<string | undefined>();

  // Guard helper: prompts login if user is not authenticated
  const requireAuth = (actionName: string) => {
    if (!currentUser) {
      addToast({
        type: 'info',
        title: 'Sign In Required',
        description: `Please sign in or create an account to ${actionName}.`,
      });
      setIsAuthModalOpen(true);
      return false;
    }
    return true;
  };

  // Handlers for opening modals
  const handleOpenNewSession = (date?: string, subjId?: string) => {
    if (!requireAuth('schedule study sessions')) return;
    setSessionToEdit(null);
    setInitialSessionDate(date);
    setInitialSessionSubjId(subjId);
    setSessionModalOpen(true);
  };

  const handleEditSession = (session: StudySession) => {
    if (!requireAuth('edit study sessions')) return;
    setSessionToEdit(session);
    setSessionModalOpen(true);
  };

  const handleOpenNewSubject = () => {
    if (!requireAuth('add courses or examinations')) return;
    setSubjectToEdit(null);
    setSubjectModalOpen(true);
  };

  const handleEditSubject = (subject: Subject) => {
    if (!requireAuth('edit courses')) return;
    setSubjectToEdit(subject);
    setSubjectModalOpen(true);
  };

  const handleOpenNewTopic = (subjectId: string) => {
    if (!requireAuth('manage syllabus topics')) return;
    setTopicToEdit(null);
    setInitialTopicSubjId(subjectId);
    setTopicModalOpen(true);
  };

  const handleEditTopic = (topic: Topic) => {
    if (!requireAuth('edit syllabus topics')) return;
    setTopicToEdit(topic);
    setTopicModalOpen(true);
  };

  const handleRecoverSession = (session: StudySession) => {
    if (!requireAuth('recover missed sessions')) return;
    setSessionToRecover(session);
    setMissedSessionModalOpen(true);
  };

  const handleOpenRecall = (topic: Topic) => {
    if (!requireAuth('access active recall revision')) return;
    setTopicForRecall(topic);
    setActiveRecallModalOpen(true);
  };

  const handleOpenSyllabusManager = (subjectId?: string) => {
    if (!requireAuth('import or manage syllabi')) return;
    setInitialSyllabusSubjId(subjectId);
    setSyllabusManagerOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper-100 dark:bg-paper-950 text-ink-900 dark:text-ink-50">
      {/* Universal App Header with Brand Logo and Action Triggers */}
      <AppHeader
        onOpenNewSession={() => handleOpenNewSession()}
        onOpenNewSubject={handleOpenNewSubject}
        onOpenPdfExport={() => {
          if (!requireAuth('download your study planner PDF')) return;
          setPdfModalOpen(true);
        }}
        onOpenWhatToStudy={() => {
          if (!requireAuth('use the study assistant')) return;
          setWhatToStudyOpen(true);
        }}
      />

      {/* Main View Area with mobile bottom nav safe-area padding */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 md:pb-8">
        {activeView === 'landing' && <LandingView />}

        {activeView === 'dashboard' && (
          <DashboardView
            onOpenNewSession={() => handleOpenNewSession()}
            onOpenNewSubject={handleOpenNewSubject}
            onOpenSuggestPlan={() => setSuggestPlanModalOpen(true)}
            onOpenWhatToStudy={() => setWhatToStudyOpen(true)}
            onOpenPdfExport={() => setPdfModalOpen(true)}
            onRecoverSession={handleRecoverSession}
          />
        )}

        {activeView === 'timetable' && (
          <TimetableView
            onOpenNewSession={handleOpenNewSession}
            onEditSession={handleEditSession}
            onOpenSuggestPlan={() => setSuggestPlanModalOpen(true)}
          />
        )}

        {activeView === 'exams' && (
          <ExamsView
            onOpenNewSubject={handleOpenNewSubject}
            onEditSubject={handleEditSubject}
            onOpenNewTopic={handleOpenNewTopic}
            onOpenSyllabusManager={handleOpenSyllabusManager}
            onOpenExamTriage={(subjId) => {
              setInitialTriageSubjId(subjId);
              setExamTriageModalOpen(true);
            }}
          />
        )}

        {activeView === 'readiness' && (
          <ReadinessView
            onOpenNewTopic={handleOpenNewTopic}
            onEditTopic={handleEditTopic}
            onOpenNewSubject={handleOpenNewSubject}
            onOpenRecall={handleOpenRecall}
            onStartFocus={() => setActiveView('focus')}
            onOpenSyllabusManager={handleOpenSyllabusManager}
          />
        )}

        {activeView === 'focus' && <FocusView />}

        {activeView === 'weekly-review' && (
          <WeeklyReviewView
            onOpenSuggestPlan={() => setSuggestPlanModalOpen(true)}
          />
        )}

        {activeView === 'settings' && <SettingsView />}
      </main>

      {/* SEMESTER Brand Footer */}
      <AppFooter
        onOpenPdfExport={() => {
          if (!requireAuth('download your study planner PDF')) return;
          setPdfModalOpen(true);
        }}
        onOpenWhatToStudy={() => {
          if (!requireAuth('use the study assistant')) return;
          setWhatToStudyOpen(true);
        }}
      />

      {/* Floating notifications */}
      <ToastContainer />

      {/* Interactive Modals */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onPlanCreated={() => setActiveView('dashboard')}
      />

      <SessionModal
        isOpen={sessionModalOpen}
        onClose={() => setSessionModalOpen(false)}
        sessionToEdit={sessionToEdit}
        initialDate={initialSessionDate}
        initialSubjectId={initialSessionSubjId}
      />

      <SubjectModal
        isOpen={subjectModalOpen}
        onClose={() => setSubjectModalOpen(false)}
        subjectToEdit={subjectToEdit}
      />

      <TopicModal
        isOpen={topicModalOpen}
        onClose={() => setTopicModalOpen(false)}
        topicToEdit={topicToEdit}
        initialSubjectId={initialTopicSubjId}
      />

      <SuggestPlanModal
        isOpen={suggestPlanModalOpen}
        onClose={() => setSuggestPlanModalOpen(false)}
      />

      <PdfExportModal
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
      />

      <WhatToStudyModal
        isOpen={whatToStudyOpen}
        onClose={() => setWhatToStudyOpen(false)}
        onSelectTopicForFocus={(subjectId, topicId) => {
          setActiveView('focus');
        }}
      />

      <MissedSessionModal
        isOpen={missedSessionModalOpen}
        onClose={() => {
          setMissedSessionModalOpen(false);
          setSessionToRecover(null);
        }}
        session={sessionToRecover}
      />

      <ActiveRecallModal
        isOpen={activeRecallModalOpen}
        onClose={() => {
          setActiveRecallModalOpen(false);
          setTopicForRecall(null);
        }}
        topic={topicForRecall}
        subject={data.subjects.find((s) => s.id === topicForRecall?.subjectId)}
      />

      <SyllabusManagerModal
        isOpen={syllabusManagerOpen}
        onClose={() => setSyllabusManagerOpen(false)}
        targetSubjectId={initialSyllabusSubjId}
      />

      {/* Exam Survival Mode Modal */}
      <RescuePlanModal />

      {/* 48-Hour Exam Triage & Emergency Cram Modal */}
      <ExamTriageModal
        isOpen={examTriageModalOpen}
        onClose={() => {
          setExamTriageModalOpen(false);
          setInitialTriageSubjId(undefined);
        }}
        initialSubjectId={initialTriageSubjId}
      />

      {/* Supabase Authentication & Cloud Sync Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Mobile-First Bottom Navigation Bar */}
      <BottomNav
        onOpenPdfExport={() => setPdfModalOpen(true)}
        onOpenWhatToStudy={() => setWhatToStudyOpen(true)}
      />
    </div>
  );
}

export default function Home() {
  return (
    <PlannerProvider>
      <PlannerApp />
    </PlannerProvider>
  );
}
