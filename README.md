# SEMESTER — Exam Season Planner

> **"Make a plan. Find your focus. Walk in prepared."**
> 
> *A production-quality, frontend-only academic planning and exam preparation workspace built for the SASC PixelRush UI/UX Build Challenge.*

---

## 1. Product Overview

**SEMESTER** transforms the overwhelming stress of university examinations into a structured, calm, and actionable journey. Designed with a warm editorial aesthetic inspired by contemporary journals, digital magazines, and premium stationery, SEMESTER consolidates exam schedules, syllabus readiness, daily study sessions, Pomodoro focus blocks, and weekly reviews into one unified workspace.

### Key Highlights
- **100% Client-Side & Local-First**: Zero backend servers, zero database setup, zero cookies, zero external tracking. Your data belongs entirely to your device.
- **Explainable Heuristics, No Fake AI**: Practical, transparent algorithms calculate live countdowns, syllabus readiness, and conflict-free study allocations.
- **Editorial Design System**: Warm paper canvas (`#F7F5EF`), deep ink typography (`#202722`), restrained forest-green accents (`#2D5541`), subtle amber tags (`#D99B38`), and tabular numerals for timekeeping.
- **Free for Students**: No subscription tiers, no paywalls, and no account barriers.

---

## 2. Core Features

### A. Live Exam Countdown
- Real-time countdown clock with tabular numerals (Days, Hours, Minutes, Seconds).
- Context-sensitive reassuring messages based on urgency (e.g. *“2 weeks remaining. Plenty of runway for structured, bite-sized revision.”*).
- Explicit disclosure of user device timezone.
- Automatic roll-forward to the next upcoming examination once an exam concludes.

### B. Smart Next Step Recommendation Engine
- Deterministic, explainable recommendation system derived strictly from local calendar state.
- Detects imminent exams with unfinished syllabus units, scheduled sessions due today, or schedule gaps.
- Explains *why* the suggestion appears, with an immediate single-click action path.

### C. Conflict-Free Timetable Builder
- Dual calendar views: 7-day week grid for desktop and clean day-by-day agenda for mobile.
- Real-time overlap and conflict detection for concurrent study sessions.
- Direct check-off completion toggle with instant feedback toast notifications.
- Integrated **Realistic Weekly Planner Assistant**: Generates balanced 7-day study slots respecting student-declared daily hours and buffer breaks.

### D. Syllabus Readiness Map
- Subject-level breakdown of syllabus units and lecture topics.
- 4 transparent status states: **Not started**, **Learning**, **Needs revision**, and **Confident**.
- Honest readiness percentage formula: `(Confident Topics / Total Topics) × 100%`.
- Topic filtering, inline edits, and direct focus launchers.

### E. Distraction-Free Focus Mode
- Built-in study timer with 25-minute Deep Focus, 5-minute Short Break, and 15-minute Long Break presets.
- Gentle harmonic academic chime synthetically generated via standard browser Web Audio API (100% offline, zero audio asset dependencies).
- Tab visibility and browser suspension reconciliation to ensure elapsed time is never lost when switching tabs.
- Automatic logging of completed focus intervals into Weekly Review study totals.

### F. Weekly Review & Study Insights
- Aggregates planned sessions, completed sessions, focus hours, and pending/missed tasks.
- Subject-wise proportional revision allocation charts.
- Accessible tabular data alternative for assistive technologies.
- One-click action to generate the next week’s plan.

### G. Local Data Portability & Settings
- JSON Backup Export and validated JSON Import with schema versioning.
- Safe data reset controls: restore university sample dataset or wipe to a clean slate.
- Light (Warm Paper) and Dark (Deep Ink) theme toggle with system preference support.

---

## 3. Technology Stack

- **Framework**: Next.js 15 (App Router, React 19)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS & Vanilla CSS Design Tokens
- **Icons**: Lucide React
- **Date Arithmetic**: date-fns
- **Persistence**: Typed, versioned browser localStorage with graceful recovery
- **Audio**: Web Audio API (synthetic sine wave harmonized chime)

---

## 4. Getting Started Locally

### Prerequisites
- Node.js 18.17+ or 20+
- npm 9+

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/semester-planner.git

# Navigate into project directory
cd semester-planner

# Install dependencies
npm install
```

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Type Check & Production Build
```bash
# Verify TypeScript integrity
npx tsc --noEmit

# Compile production bundle
npm run build

# Start local production server
npm run start
```

---

## 5. Vercel Deployment Instructions

SEMESTER is optimized out-of-the-box for frictionless zero-config deployment on Vercel:

1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your repository.
4. Keep the default settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
5. No environment variables are required.
6. Click **Deploy**. Your live planner will be accessible globally within minutes.

---

## 6. SASC PixelRush Judging Criteria Alignment

| Criteria | Score Weight | SEMESTER Implementation |
| :--- | :---: | :--- |
| **Ease of Use & Flow** | 30 Marks | Frictionless 4-step onboarding, zero login hurdles, clear visual hierarchy answering the 4 core daily student questions immediately. |
| **Creativity & Originality** | 25 Marks | Syllabus Readiness Map with honest states, Smart Next Step recommendation engine, synthetic Web Audio chime, rule-based 7-day planner. |
| **Visual Design** | 25 Marks | Premium editorial aesthetic, warm paper tones, Newsreader serif headers, tabular numerals, refined dark mode, zero generic AI blobs. |
| **Responsiveness** | 10 Marks | Mobile-first architecture tested across 320px, 375px, 430px, 768px, 1024px, and 1440px viewports with dedicated day agenda and touch drawers. |
| **Idea Explanation** | 10 Marks | Grounded in the emotional reality of university examination stress, clear "Why SEMESTER?" motivation, transparent math, and full user data sovereignty. |

---

## 7. Privacy & Limitations

- **Browser Storage Scope**: All data resides strictly in the current browser's `localStorage`. Clearing browser site data or cookies will reset local storage. Use the **Download JSON Backup** button in Settings to preserve your plan across browser resets or devices.
- **Zero Cloud Sync**: By design, no credentials or personal notes are transmitted across the network.
