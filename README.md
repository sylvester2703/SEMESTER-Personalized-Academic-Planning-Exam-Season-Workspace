# SEMESTER — Personalized Academic Planning & Exam Season Workspace

> **"Your routine. Your subjects. Your goals. Your semester, planned around you."**
>
> _Make a plan. Find your focus. Walk in prepared._
>
> A production-quality, frontend-only academic planning and exam preparation workspace built for university and college students facing exam season stress.

[![Vercel Deployment Ready](https://img.shields.io/badge/Vercel-Deployment%20Ready-black?logo=vercel)](https://vercel.com)
[![Next.js 15](https://img.shields.io/badge/Next.js-15%20App%20Router-black?logo=next.js)](https://nextjs.org)
[![TypeScript Strict](https://img.shields.io/badge/TypeScript-Strict%20Mode-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-Vanilla%20Tokens-38B2AC?logo=tailwind-css)](https://tailwindcss.com)
[![Client-Side Only](https://img.shields.io/badge/Backend-Zero%20Servers%20%7C%20100%25%20Local-2D5541)](#local-first-data-architecture)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 1. Core Product Principle

**SEMESTER** is a user-input-driven, personalized academic planning application — not a static dashboard that displays the same sample timetable to everyone.

Every student's life is different: some attend university lectures 9 AM to 4 PM, some commute 2 hours a day, some work part-time jobs or attend weekend tuitions, and some have distinct study preferences such as evening deep-focus blocks or morning reviews.

SEMESTER understands each student's actual routine, academic workload, upcoming examinations, subject difficulty, syllabus progress, and personal goals before generating a suggested study plan.

The central principle is:

> **"Your routine. Your subjects. Your goals. Your semester, planned around you."**

The application works **entirely on the frontend** using local browser storage (`localStorage`) for persistence. No backend, no paid API keys, and no login barriers are required.

---

## 2. Comprehensive System Architecture

```
                                  ┌──────────────────────────────────────────────────┐
                                  │           SEMESTER Web Application               │
                                  │      (Next.js 15 App Router + React 19)          │
                                  └────────────────────────┬─────────────────────────┘
                                                           │
                                                           ▼
             ┌────────────────────────────────────────────────────────────────────────────────────────┐
             │                               PlannerContextProvider                                   │
             │           Single source of truth: Profile, Subjects, Topics, Sessions, Goals           │
             └──────┬──────────────────────┬────────────────────────┬──────────────────────┬──────────┘
                    │                      │                        │                      │
                    ▼                      ▼                        ▼                      ▼
         ┌───────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐ ┌───────────────────┐
         │ 5-Step Onboarding │  │ Deterministic       │  │ Student-Centred     │ │ Print-Ready PDF   │
         │ Wizard            │  │ Scheduling Engine   │  │ Intelligence Engine │ │ Generator         │
         │                   │  │                     │  │                     │ │                   │
         │ • Profile & Goals │  │ • Routine Inversion │  │ • What to study now │ │ • Vector Logo     │
         │ • Routine Builder │  │ • Zero Collisions   │  │ • Missed Recovery   │ │ • 5 Export Types  │
         │ • Subject/Syllabus│  │ • Proximity Weight  │  │ • Active Recall     │ │ • Clean Layout    │
         │ • Preferences     │  │ • Lighter Days      │  │ • Workload Check    │ │ • A4 & Mobile     │
         │ • Feasibility Chk │  │ • Human Reasoning   │  │ • Exam Day Mode     │ │ • Dynamic Year    │
         └───────────────────┘  └─────────────────────┘  └─────────────────────┘ └───────────────────┘
                    │                      │                        │                      │
                    └──────────────────────┴───────────┬────────────┴──────────────────────┘
                                                       │
                                                       ▼
                                     ┌────────────────────────────────────┐
                                     │     Local-First Storage Engine     │
                                     │  • Typed, versioned localStorage   │
                                     │  • Corrupted data self-healing     │
                                     │  • JSON Export & Validated Import  │
                                     │  • 100% Client-Side Data Privacy   │
                                     └────────────────────────────────────┘
```

---

## 3. Key Feature Walkthrough

### 3.1 Personal Planning Onboarding (5 Steps)

When a student selects **"Build my study plan"**, SEMESTER initiates a calm, multi-step conversational onboarding experience:

1. **Step 1: Understand the Student**
   - Collects preferred name, academic level or year, primary semester objective, and optional target topics per week.
2. **Step 2: Build the Daily Routine**
   - Weekly timetable grid allowing students to enter wake-up/bedtimes, fixed college/university hours (e.g. Mon–Fri 9:00–16:00), commute blocks, meals, tuitions, gym/exercise, and personal commitments.
   - Differentiates weekday vs. weekend routines.
   - Enforces **Flexible vs. Fixed** commitment tags: fixed commitments are strictly protected and _never_ overwritten by study sessions.
   - Real-time time range validation and overlap detection.
3. **Step 3: Add Subjects and Examinations**
   - Unlimited subject creation with short code, exam date, exam time, syllabus topics, preparation level (_Not started_, _Beginner_, _In progress_, _Well prepared_), difficulty (_Easy_, _Moderate_, _Difficult_), and priority.
   - Direct unit and topic entry with estimated study minutes.
4. **Step 4: Understand Study Preferences**
   - Realistic daily study hours limit (averts burnout).
   - Preferred session duration (25m, 45m, 60m, 90m).
   - Session pacing (_Short & frequent_ vs. _Longer deep blocks_).
   - Preferred time of day (_Morning_, _Afternoon_, _Evening_, _Night_).
   - Break intervals and customizable **lighter study days** (e.g. lighter load on Sundays).
5. **Step 5: Define a Clear Goal & Plan Preview**
   - Choose from structured goals (_Finish syllabus before exam_, _Revise twice_, _Daily consistency_, _Nearest exam blitz_) or custom goals with target dates.
   - Transparent summary breakdown and feasibility assessment before generating the schedule.

---

### 3.2 Syllabus-Aware Study Planning & Preparation Analysis

SEMESTER transforms raw academic syllabuses into actionable study roadmaps, ensuring subjects are never treated as generic monolithic tasks.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          Multi-Channel Syllabus Input                           │
│  ┌──────────────────┐ ┌──────────────────┐ ┌───────────────┐ ┌────────────────┐ │
│  │  Paste Syllabus  │ │  Document Upload │ │ Curated Presets││ Manual Builder │ │
│  │  • Regex Parser  │ │  • .txt, .md     │ │ • DBMS, OS    │ │ • Unit & Topic │ │
│  │  • Auto-Detects  │ │  • Client-side   │ │ • Computer    │ │   hierarchy    │ │
│  │    Units & Times │ │    Text-PDF      │ │   Networks    │ │ • Custom times │ │
│  └────────┬─────────┘ └────────┬─────────┘ └───────┬───────┘ └───────┬────────┘ │
└───────────┼────────────────────┼───────────────────┼─────────────────┼──────────┘
            └────────────────────┼───────────────────┘                 │
                                 ▼                                     │
┌──────────────────────────────────────────────────────────────────────┴──────────┐
│                   Live Structural Preview & Validation Modal                    │
│           Interactive Review: Detected Units, Topics, Subtopics & Times         │
│           Choice: Replace Existing Syllabus  OR  Append to Subject              │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│              Deterministic Syllabus Analysis & Workload Engine                  │
│  • Unit & topic completion meters         • User vs. provisional estimate split │
│  • Workload hours vs available study time • Realistic exam shortfall warnings   │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     Collapsible Unit Roadmap & Study Actions                    │
│  • Unit Accordions with progress bars     • Direct "Start Focus" & "Recall"     │
│  • Per-topic status cycles (4 states)     • Synchronized with Timetable & PDFs  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### A. Multi-Channel Syllabus Ingestion

- **Intelligent Text Parser (`lib/syllabus/parser.ts`)**:
  - Automatically recognizes Unit, Module, Chapter, or Part headers across standard academic formats.
  - Detects numbered and bulleted topics with nested subtopics.
  - Extracts explicit duration notations like `(45m)`, `[2 hrs]`, `1.5 hours` and normalizes them into minutes.
  - Infers priority flags (`[high]`, `[urgent]`, `[core]`, `[optional]`).
- **Client-Side Document Ingestion**:
  - Direct drag-and-drop or file selection for `.txt`, `.md`, `.json`, `.csv`, and text-based `.pdf` files.
  - Extracted entirely inside the browser using clean stream parsing — zero uploads to remote servers.
  - Gracefully detects scanned or raster-only PDFs and provides a helpful alert guiding the student to copy/paste text.
- **Academic Sample Presets**:
  - One-click preloads for university courses: _Database Management Systems (CS 315)_, _Operating Systems (CS 301)_, and _Computer Networks (CS 320)_.
- **Manual Structure Builder**:
  - Visual tree builder allowing students to add custom units, reorder topics, enter subtopic tags, and set duration estimates.

#### B. Deterministic Syllabus Analysis Engine (`lib/calculations/syllabus-analysis.ts`)

- Analyzes topic status distribution: _Not started_, _Learning_, _Needs revision_, and _Confident_.
- Separates student-confirmed durations from **provisional estimates** (clearly marked with visual badges so students know which topics need review).
- Computes total syllabus workload against the student's physical free study hours before the examination.
- Generates transparent feasibility feedback and workload shortfall guidance without sugarcoating.

#### C. Collapsible Unit Roadmap (`components/readiness/readiness-view.tsx`)

- Structured unit accordions displaying unit title, topic count, and unit completion percentage.
- One-click topic status cyclers to advance preparation states seamlessly.
- Direct contextual action triggers:
  - **"Start Study" / "Resume Study"**: Instantly launches the Focus Timer preset to the topic's estimated duration.
  - **"Test Recall"**: Opens the Active Recall Tester modal to test memory retention.

---

### 3.3 Deterministic, Collision-Free Scheduling Engine

SEMESTER uses a transparent, rule-based scheduling algorithm located in [`lib/scheduling/index.ts`](file:///c:/Users/Dell/OneDrive/Desktop/SEMESTER/lib/scheduling/index.ts).

**Scheduling Rules:**

1. **Routine Inversion (`getAvailableFreeIntervals`)**: Genuinely available free slots are extracted by calculating mathematical intervals around fixed college hours, commute, sleep, meals, and other commitments.
2. **Strict Non-Collision**: Never schedules over college, sleep, meals, or other fixed blocks.
3. **Multi-Factor Priority Scoring**: Weights subjects by days until examination, unfinished topic count, difficulty multipliers, and user-assigned priority.
4. **Human Availability Window**: Aligns study sessions with the student's declared preferred time of day (e.g. evening slots from 17:00–21:00) while respecting lighter days.
5. **Preserves Completed Sessions**: Regenerating a schedule leaves already completed sessions untouched.
6. **Feasibility Warnings**: Automatically raises a clear warning if the student's syllabus workload exceeds physically available study hours.
7. **Personalized Explanations**: Generates a human-readable statement explaining why specific subjects are scheduled (e.g., _"Your plan was built around your college hours (09:00–16:00), preferred evening study sessions, and upcoming examinations. Database Management Systems was prioritised because its exam is in 10 days and 5 topics still need revision."_).

---

### 3.4 Student-Centred Intelligence Modules

SEMESTER avoids gimmicky "AI" marketing and provides practical, local deterministic intelligence:

#### A. "What should I study now?" Personal Study Assistant

- Prominent one-click button in the header and dashboard.
- Evaluates the student's real-time clock, current free time window before the next fixed commitment, upcoming exam proximity, and unfinished syllabus units.
- Recommends **one primary task** and **one alternative task** with exact durations, rationale, and a direct button to launch the focus timer.

#### B. Guilt-Free Missed-Session Recovery

- Missed study sessions are treated as scheduling puzzles, not personal failures.
- Offers 4 supportive recovery paths without guilt:
  1. _Reschedule to next available slot_ (checks for conflicts).
  2. _Split into two smaller sessions_.
  3. _Move to a selected day_.
  4. _Mark as no longer necessary or dismiss_.
- Never overloads the next day automatically.

#### C. Spaced Revision & Active Recall Tester

- Spaced review system with customizable intervals:
  - **Difficult** (1-day follow-up)
  - **Okay** (3-day follow-up)
  - **Easy** (7-day follow-up)
- Built-in retrieval practice modal: prompts the student to recall topic concepts from memory before rating recall ease, automatically scheduling the next review date.

#### D. Syllabus Workload Estimator

- Aggregates topic statuses (_Not started_, _Learning_, _Needs revision_, _Confident_).
- Compares estimated remaining study hours with the student's actual available hours before each exam.
- Highlights realistic feasibility: alerts students early if they are overcommitted so they can adjust priorities before panic sets in.

#### E. Exam-Day Preparation Mode

- Automatically triggers when an exam is scheduled for today or within the next 48 hours.
- Displays a dedicated countdown, exam start time, location/hall, remaining critical concepts, and a dismissible checklist (stationery, hall ticket, calculator, formula sheet).
- After the exam concludes, prompts the student to archive the exam while preserving historical study records.

#### F. Distraction-Free Focus Timer

- 25-minute Deep Focus, 5-minute Short Break, and 15-minute Long Break presets.
- Gentle harmonic academic chime synthetically generated via standard browser Web Audio API (100% offline, zero audio asset dependencies).
- Tab visibility and browser suspension reconciliation to ensure elapsed time is never lost when switching tabs or waking a laptop.

---

### 3.5 Print-Ready PDF Study Planner & Brand Identity

A client-side PDF generation engine built with `jspdf` and `jspdf-autotable` ([`lib/pdf/generate-pdf.ts`](file:///c:/Users/Dell/OneDrive/Desktop/SEMESTER/lib/pdf/generate-pdf.ts)):

- **Original Geometric Vector Logo**: Clean, vector-drawn SEMESTER calendar mark rendered sharply at any print scale.
- **5 Dedicated Export Presets**:
  1. **Full Exam Season Planner**: Complete multi-page booklet featuring editorial cover page, personalized planning statement, exam calendar & priorities, weekly timetable grid, and syllabus tracker.
  2. **Weekly Timetable**: Streamlined 7-day schedule grid for quick desk reference.
  3. **Daily Study Sheet**: Single-day checklist format with session time blocks and handwritten notes area.
  4. **Exam Countdown & Revision Plan**: Chronological exam list with days remaining, urgent topics, and target dates.
  5. **Printable Revision Tracker**: Comprehensive checklist of all syllabus topics with status indicators and checkboxes.
- **Document Formatting Quality**:
  - Consistent warm ivory and forest-green styling.
  - Tabular numerals for dates and durations.
  - Text auto-wrapping with zero clipping or awkward pagination breaks.
  - Running headers, page numbering (_"Page X of Y"_), and dynamic year copyright (`© 2026 SEMESTER · All rights reserved.`).
  - Optional personalized footer: _"Prepared for personal study by [Name] · SEMESTER"_.

---

## 4. Local-First Data Architecture & Privacy

SEMESTER operates under strict data sovereignty principles:

- **100% Client-Side**: No user data, routine hours, grades, or notes are transmitted to any server or remote database.
- **LocalStorage Persistence**: Uses typed, versioned local storage schema (`semester_planner_data_v2`).
- **Resilient Fallback**: Corrupted or missing storage states automatically heal by initializing a clean, safe state with graceful notification.
- **Full Data Portability**:
  - **Export JSON Backup**: Download a complete snapshot of all routines, subjects, topics, sessions, and preferences.
  - **Validated JSON Import**: Upload backup files with schema validation to restore or transfer plans between browsers.
  - **Clean Slate / Sample Data Reset**: Switch between clean blank state and comprehensive university sample data anytime.

---

## 5. Visual Design & Accessibility

- **Editorial Color Palette**:
  - Warm Paper Canvas: `#F7F5EF` / Dark Canvas: `#181F1A`
  - Deep Ink Typography: `#202722` / Light Typography: `#F0EFEA`
  - Forest Green Accent: `#2D5541` (Focus, Success, Brand)
  - Subtle Sage: `#5A7365` (Secondary info, borders)
  - Warm Amber: `#D99B38` (Exam urgency, active recall)
- **Typography**: Editorial serif headings (`Newsreader`) paired with clean sans-serif body text (`Inter`) and tabular figures (`font-variant-numeric: tabular-nums`) for jitter-free countdowns.
- **Responsive Layout**: Tested across mobile (320px, 375px, 430px), tablet (768px), and desktop (1024px, 1440px) viewports with dedicated day agenda views and touch drawers.
- **Accessibility (WCAG 2.1 AA)**:
  - Visible focus indicators on all interactive controls.
  - Full keyboard navigation and dialog focus trapping.
  - ARIA attributes (`role="dialog"`, `aria-modal="true"`, `aria-label`).
  - Color contrast ratios exceed 4.5:1.
  - `prefers-reduced-motion` support for smooth transitions.

---

## 6. Technology Stack

| Layer               | Technology                        | Rationale                                                             |
| :------------------ | :-------------------------------- | :-------------------------------------------------------------------- |
| **Framework**       | Next.js 15 (App Router, React 19) | Server-safe modern client components, optimal bundle splitting        |
| **Language**        | TypeScript 5 (Strict Mode)        | Full compile-time type safety across data schemas and calculations    |
| **Styling**         | Tailwind CSS + Vanilla CSS Tokens | Editorial design system with unified dark/light theme tokens          |
| **Icons**           | Lucide React                      | Lightweight, consistent vector iconography                            |
| **Date Arithmetic** | `date-fns`                        | Functional, tree-shakeable calendar and interval calculations         |
| **PDF Generation**  | `jspdf` + `jspdf-autotable`       | 100% client-side vector document generation, zero server dependencies |
| **Audio**           | HTML5 Web Audio API               | Synthetic sine-wave harmonic chime (zero external audio files)        |
| **Persistence**     | Browser `localStorage`            | Zero backend, instant load, total offline privacy                     |

---

## 7. Getting Started Locally

### Prerequisites

- **Node.js**: v18.18+ or v20+
- **npm**: v9+ (or pnpm / yarn)

### 1. Clone the Repository

```bash
git clone https://github.com/sylvester2703/SEMESTER.git
cd SEMESTER
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Verify TypeScript & Compile Production Build

```bash
# Verify TypeScript integrity (0 errors)
npx tsc --noEmit

# Compile production bundle for deployment
npm run build

# Test production build locally
npm run start
```

---

## 8. Vercel Deployment Instructions

SEMESTER is configured and tested for **zero-config, 1-click deployment on Vercel**:

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Push your repository to GitHub: `https://github.com/sylvester2703/SEMESTER`.
2. Visit [Vercel](https://vercel.com) and sign in.
3. Click **"Add New Project"** and select **"Import Git Repository"**.
4. Choose the `SEMESTER` repository.
5. Vercel will automatically detect **Next.js**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` (or `next build`)
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
6. **Environment Variables**: None required! The app is entirely self-contained.
7. Click **Deploy**. Your application will be live globally on a `*.vercel.app` domain within ~60 seconds.

### Option B: Deploy via Vercel CLI

```bash
npm i -g vercel
vercel
# Follow interactive prompts to deploy preview
vercel --prod
# Deploys directly to production
```

---

## 9. Directory Structure

```
SEMESTER/
├── app/
│   ├── favicon.ico              # Vector branded favicon
│   ├── globals.css              # Editorial tokens, typography, and theme vars
│   ├── layout.tsx               # Root HTML layout with viewport & metadata
│   └── page.tsx                 # Main application controller with view router
├── components/
│   ├── assistant/
│   │   └── what-to-study-modal.tsx  # "What should I study now?" recommendation modal
│   ├── dashboard/
│   │   ├── countdown-card.tsx       # Real-time tabular exam countdown card
│   │   ├── dashboard-view.tsx       # Main student dashboard with status & metrics
│   │   ├── next-action-card.tsx     # Smart next step recommendation card
│   │   ├── plan-explanation-banner.tsx # Dynamic plan reasoning explanation
│   │   └── today-plan.tsx           # Today's study session list with checkoff
│   ├── exams/
│   │   ├── exam-day-mode.tsx        # Urgent exam-day banner & checklist (<48h)
│   │   └── exams-view.tsx           # Subject & examination calendar manager
│   ├── focus/
│   │   └── focus-view.tsx           # Pomodoro deep focus timer with Web Audio chime
│   ├── modals/
│   │   ├── add-exam-modal.tsx       # Subject & exam creation dialog
│   │   ├── add-session-modal.tsx    # Manual study session scheduler
│   │   ├── missed-session-modal.tsx # Guilt-free missed session recovery modal
│   │   ├── pdf-export-modal.tsx     # 5-preset PDF export configuration dialog
│   │   └── suggest-plan-modal.tsx   # 7-day schedule generator dialog
│   ├── navigation/
│   │   ├── app-footer.tsx           # Editorial footer with dynamic copyright & links
│   │   └── app-header.tsx           # Header with vector logo, quick actions & timer
│   ├── onboarding/
│   │   └── onboarding-modal.tsx     # 5-step conversational routine & plan wizard
│   ├── readiness/
│   │   ├── readiness-view.tsx       # Syllabus unit & topic tracker with recall triggers
│   │   └── workload-estimator.tsx   # Available hours vs. syllabus required hours calculator
│   ├── recall/
│   │   └── active-recall-modal.tsx  # Spaced repetition testing & rating modal
│   ├── review/
│   │   └── review-view.tsx          # Weekly review, focus totals & subject charts
│   ├── settings/
│   │   └── settings-view.tsx        # Profile, JSON backup/restore & clean reset
│   ├── timetable/
│   │   ├── agenda-view.tsx          # Responsive day-by-day timetable agenda
│   │   ├── timetable-view.tsx       # 7-day calendar grid with conflict detection
│   │   └── week-grid.tsx            # Desktop interactive time-block grid
│   └── ui/
│       └── toast.tsx                # Accessible non-intrusive notification toasts
├── lib/
│   ├── audio/
│   │   └── chime.ts                 # Web Audio API synthetic harmonic academic chime
│   ├── calculations/
│   │   └── index.ts                 # Workload estimations, countdowns, readiness math
│   ├── context/
│   │   └── planner-context.tsx      # Unified React context & action dispatchers
│   ├── pdf/
│   │   └── generate-pdf.ts          # Client-side multi-page PDF generation engine
│   ├── recommendations/
│   │   └── index.ts                 # "What should I study now?" deterministic engine
│   ├── scheduling/
│   │   └── index.ts                 # Conflict-free weekly scheduler & routine inverter
│   └── storage/
│       ├── index.ts                 # LocalStorage persistence & schema validator
│       └── sample-data.ts           # Realistic college routine & syllabus sample data
├── types/
│   └── index.ts                     # Comprehensive TypeScript interfaces & domain models
├── next.config.mjs                  # Next.js 15 production configuration
├── package.json                     # Project manifest and scripts
├── postcss.config.mjs               # PostCSS plugins (Tailwind)
├── tailwind.config.ts               # Custom editorial color tokens & fonts
└── tsconfig.json                    # Strict TypeScript configuration
```

---

## 10. Verification & Acceptance Checklist

| Scenario                                         | Status | Verification Detail                                                                     |
| :----------------------------------------------- | :----: | :-------------------------------------------------------------------------------------- |
| **1. Daily Routine with Fixed College Hours**    |  PASS  | Routine builder captures college (09:00–16:00), commute, sleep, and meals.              |
| **2. Weekday vs. Weekend Routines**              |  PASS  | Days-of-week checkboxes permit distinct schedules for Mon–Fri vs. Sat–Sun.              |
| **3. Overlapping Commitment Detection**          |  PASS  | Timetable grid flags and prevents concurrent overlapping sessions.                      |
| **4. Multi-Subject & Syllabus Management**       |  PASS  | Add subjects with exam dates, units, and individual topics with difficulty ratings.     |
| **5. Collision-Free Weekly Plan Generation**     |  PASS  | `getAvailableFreeIntervals` strictly avoids college, commute, sleep, and meals.         |
| **6. User Availability & Preferences Respected** |  PASS  | Honors daily hours limits, preferred study periods (e.g. evening), and lighter days.    |
| **7. "What should I study now?" Assistant**      |  PASS  | Recommends 1 primary + 1 alternative task based on real-time availability window.       |
| **8. Guilt-Free Missed-Session Recovery**        |  PASS  | Reschedules, splits, or dismisses missed tasks without overloading the next day.        |
| **9. Spaced Revision & Active Recall**           |  PASS  | In-memory recall testing schedules review intervals at 1d (Hard), 3d (OK), 7d (Easy).   |
| **10. Workload Feasibility Estimator**           |  PASS  | Warns when remaining syllabus hours exceed physically available study time.             |
| **11. Exam-Day Preparation Mode**                |  PASS  | Activates within 48h with countdown, room info, and dismissible logistics checklist.    |
| **12. Client-Side Printable PDF Generator**      |  PASS  | Produces 5 clean export presets with vector logo, tabular dates, and dynamic copyright. |
| **13. Local-First Persistence & Recovery**       |  PASS  | Persists safely across browser refreshes; includes JSON backup/restore & clean reset.   |
| **14. Strict Type Safety & Clean Build**         |  PASS  | `tsc --noEmit` and `npm run build` pass with 0 errors.                                  |
| **15. Vercel Deployment Ready**                  |  PASS  | Fully autonomous frontend application with zero server requirements.                    |

---

## 11. License & Intellectual Property Notice

- **Software License**: Distributed under the [MIT License](LICENSE).
- **Brand & Visual Identity**: SEMESTER and its original editorial design system, vector branding, and written content are authored for the SASC PixelRush UI/UX Build Challenge.

> _“Every semester deserves a better plan.”_  
> © 2026 SEMESTER · All rights reserved.
