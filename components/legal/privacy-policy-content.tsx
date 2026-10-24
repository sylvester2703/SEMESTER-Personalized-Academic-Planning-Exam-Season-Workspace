'use client';

import React from 'react';
import { ShieldCheck, Lock, Database, Sparkles, UserCheck, Download } from 'lucide-react';

export function PrivacyPolicyContent() {
  return (
    <div className="space-y-4 text-xs text-ink-700 dark:text-ink-300 leading-relaxed">
      <div className="p-3 rounded-lg bg-forest/5 dark:bg-forest/15 border border-forest/20 dark:border-forest/30 flex items-start gap-2.5">
        <ShieldCheck className="w-5 h-5 text-forest dark:text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold text-ink-950 dark:text-ink-50">
            Transparent & Honest Student Privacy
          </div>
          <p className="text-[11px] text-ink-600 dark:text-ink-400 mt-0.5">
            SEMESTER believes in absolute honesty. Here is exactly how your account, study schedule, and syllabus data are stored and protected.
          </p>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-1.5 font-semibold text-ink-900 dark:text-ink-100 mb-1">
          <Lock className="w-4 h-4 text-forest dark:text-emerald-400" />
          <span>1. Student Account & Authentication</span>
        </div>
        <p>
          To access the planner, you create a personal account using your email address and password. Authentication is securely managed using industry-standard encryption protocols powered by Supabase. Your personal display name is used across your planner interface instead of exposing your email address. Providing a phone number is strictly optional and only used if you choose to receive automated schedule updates via WhatsApp.
        </p>
      </div>

      <div>
        <div className="flex items-center gap-1.5 font-semibold text-ink-900 dark:text-ink-100 mb-1">
          <Database className="w-4 h-4 text-forest dark:text-emerald-400" />
          <span>2. Cloud Persistence & Data Storage</span>
        </div>
        <p>
          When you are logged in, your complete study workspace—including course names, examination dates, syllabus units, topics, mastery status, timetable sessions, and routine commitments—is securely synchronized and saved to your personal account in our Supabase PostgreSQL database. This ensures your study plan is never lost when you close your browser, switch devices, or log back in.
        </p>
      </div>

      <div>
        <div className="flex items-center gap-1.5 font-semibold text-ink-900 dark:text-ink-100 mb-1">
          <UserCheck className="w-4 h-4 text-forest dark:text-emerald-400" />
          <span>3. Local Browser Caching</span>
        </div>
        <p>
          A copy of your active study plan is also cached in your browser's <code className="bg-paper-200 dark:bg-paper-800 px-1 py-0.5 rounded text-[11px]">localStorage</code>. This provides instant page loading and offline resilience so you can review your timetable and study notes even when studying in campus areas with poor internet connectivity.
        </p>
      </div>

      <div>
        <div className="flex items-center gap-1.5 font-semibold text-ink-900 dark:text-ink-100 mb-1">
          <Sparkles className="w-4 h-4 text-forest dark:text-emerald-400" />
          <span>4. AI Study Assistance (Google Gemini)</span>
        </div>
        <p>
          Optional AI features—such as syllabus extraction, personalized study recommendations, and active recall practice questions—utilize the Google Gemini API. Only the text you specifically submit (such as course syllabus text or a topic title) is processed. A fair-use limit of 15 AI requests per day applies to prevent service disruption. Your private notes and academic data are never used to train public machine learning models.
        </p>
      </div>

      <div>
        <div className="flex items-center gap-1.5 font-semibold text-ink-900 dark:text-ink-100 mb-1">
          <ShieldCheck className="w-4 h-4 text-forest dark:text-emerald-400" />
          <span>5. Zero Ads & No Commercial Data Selling</span>
        </div>
        <p>
          We do <strong>not</strong> sell student data to third parties, data brokers, or advertisers. We do <strong>not</strong> embed third-party advertising scripts or behavioral trackers. Your study records and exam deadlines belong strictly to you.
        </p>
      </div>

      <div>
        <div className="flex items-center gap-1.5 font-semibold text-ink-900 dark:text-ink-100 mb-1">
          <Download className="w-4 h-4 text-forest dark:text-emerald-400" />
          <span>6. Data Ownership & Portability</span>
        </div>
        <p>
          You maintain full ownership of your data at all times. You can export your entire study plan as a standard JSON file in Settings, generate a print-ready PDF timetable, or delete your account and associated data whenever you choose.
        </p>
      </div>
    </div>
  );
}
