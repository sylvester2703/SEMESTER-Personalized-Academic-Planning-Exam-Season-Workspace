'use client';

import React, { useState } from 'react';
import { PlannerProvider, usePlanner } from '@/lib/context/planner-context';
import { AppHeader } from '@/components/navigation/app-header';
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
import { ToastContainer } from '@/components/shared/toast-container';
import { StudySession, Subject, Topic } from '@/types';

function PlannerApp() {
  const {
    activeView,
    setActiveView,
    isOnboardingOpen,
    setIsOnboardingOpen,
  } = usePlanner();

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

  // Handlers for opening modals
  const handleOpenNewSession = (date?: string, subjId?: string) => {
    setSessionToEdit(null);
    setInitialSessionDate(date);
    setInitialSessionSubjId(subjId);
    setSessionModalOpen(true);
  };

  const handleEditSession = (session: StudySession) => {
    setSessionToEdit(session);
    setSessionModalOpen(true);
  };

  const handleOpenNewSubject = () => {
    setSubjectToEdit(null);
    setSubjectModalOpen(true);
  };

  const handleEditSubject = (subject: Subject) => {
    setSubjectToEdit(subject);
    setSubjectModalOpen(true);
  };

  const handleOpenNewTopic = (subjectId: string) => {
    setTopicToEdit(null);
    setInitialTopicSubjId(subjectId);
    setTopicModalOpen(true);
  };

  const handleEditTopic = (topic: Topic) => {
    setTopicToEdit(topic);
    setTopicModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper-100 dark:bg-paper-950 text-ink-900 dark:text-ink-50">
      {/* Universal App Header */}
      <AppHeader
        onOpenNewSession={() => handleOpenNewSession()}
        onOpenNewSubject={handleOpenNewSubject}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeView === 'landing' && <LandingView />}

        {activeView === 'dashboard' && (
          <DashboardView
            onOpenNewSession={() => handleOpenNewSession()}
            onOpenNewSubject={handleOpenNewSubject}
            onOpenSuggestPlan={() => setSuggestPlanModalOpen(true)}
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
          />
        )}

        {activeView === 'readiness' && (
          <ReadinessView
            onOpenNewTopic={handleOpenNewTopic}
            onEditTopic={handleEditTopic}
            onOpenNewSubject={handleOpenNewSubject}
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
