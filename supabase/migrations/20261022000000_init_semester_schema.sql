-- ==============================================================================
-- SEMESTER Academic Planning Platform — Master Database Schema & RLS Policies
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. PROFILES TABLE
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text default '',
  academic_year text default 'Undergraduate',
  semester_name text default 'Semester Final Examinations',
  primary_goal text default 'Complete syllabus with steady daily revision',
  theme text default 'system' check (theme in ('light', 'dark', 'system')),
  daily_availability_hours numeric default 3.5 check (daily_availability_hours > 0 and daily_availability_hours <= 16),
  preferred_session_duration int default 45 check (preferred_session_duration in (25, 45, 60, 90)),
  preferred_time_of_day text default 'evening' check (preferred_time_of_day in ('morning', 'afternoon', 'evening', 'night')),
  session_pacing text default 'short_frequent' check (session_pacing in ('short_frequent', 'longer_blocks')),
  break_frequency_minutes int default 45,
  prioritization_strategy text default 'nearest_exam',
  plan_explanation text,
  onboarded boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. SEMESTERS TABLE (Academic Terms)
create table if not exists public.semesters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  academic_year text default '',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. SUBJECTS TABLE (Courses & Examination Deadlines)
create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  semester_id uuid references public.semesters(id) on delete set null,
  name text not null,
  code text default '',
  exam_date date not null,
  exam_time text default '09:00',
  difficulty text not null default 'moderate' check (difficulty in ('easy', 'moderate', 'difficult')),
  prep_level text not null default 'in_progress' check (prep_level in ('not_started', 'beginner', 'in_progress', 'well_prepared')),
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  confidence text not null default 'medium' check (confidence in ('low', 'medium', 'high')),
  color text not null default '#2D5541',
  syllabus_source text default 'manual',
  raw_syllabus_text text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. SYLLABUS UNITS TABLE
create table if not exists public.syllabus_units (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete cascade not null,
  unit_number int default 1,
  title text not null,
  description text,
  estimated_hours numeric default 4.0 check (estimated_hours >= 0),
  created_at timestamptz default now()
);

-- 6. TOPICS TABLE (Atomic Syllabus Topics with Honest Status)
create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete cascade not null,
  unit_id uuid references public.syllabus_units(id) on delete set null,
  title text not null,
  status text not null default 'not_started' check (status in ('not_started', 'learning', 'needs_revision', 'confident')),
  estimated_duration_minutes int not null default 45 check (estimated_duration_minutes > 0),
  actual_duration_minutes int not null default 0 check (actual_duration_minutes >= 0),
  difficulty text default 'moderate' check (difficulty in ('easy', 'moderate', 'difficult')),
  confidence text default 'medium' check (confidence in ('low', 'medium', 'high')),
  notes text default '',
  last_studied_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 7. ROUTINE COMMITMENTS TABLE (Fixed Commitments / Protected Blocks)
create table if not exists public.routine_commitments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  category text not null default 'college' check (category in ('college', 'sleep', 'commute', 'meals', 'exercise', 'tuition', 'personal')),
  days_of_week int[] not null default '{1,2,3,4,5}',
  start_time text not null,
  end_time text not null,
  is_fixed boolean default true,
  notes text,
  created_at timestamptz default now()
);

-- 8. STUDY SESSIONS TABLE (Timetable Entries)
create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete cascade not null,
  topic_id uuid references public.topics(id) on delete set null,
  title text not null,
  session_date date not null,
  start_time text not null,
  end_time text not null,
  duration_minutes int not null default 45 check (duration_minutes > 0),
  completed boolean default false,
  completed_at timestamptz,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 9. FOCUS RECORDS TABLE (Deep Work Timers & Study Logs)
create table if not exists public.focus_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete cascade not null,
  topic_id uuid references public.topics(id) on delete set null,
  duration_minutes int not null check (duration_minutes > 0),
  completed_at timestamptz default now(),
  notes text,
  rating text check (rating in ('great', 'good', 'neutral', 'difficult', null))
);

-- 10. PERSONAL GOALS TABLE
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  category text not null default 'finish_syllabus',
  completed boolean default false,
  milestones jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 11. EXAM DAY CHECKLIST TABLE
create table if not exists public.exam_checklists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  category text not null default 'materials' check (category in ('documents', 'stationery', 'health', 'logistics', 'materials')),
  checked boolean default false,
  is_essential boolean default false,
  created_at timestamptz default now()
);

-- 12. PRACTICE QUESTIONS & ACTIVE RECALL TABLE
create table if not exists public.practice_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete cascade not null,
  topic_id uuid references public.topics(id) on delete set null,
  question text not null,
  answer text not null,
  is_ai_generated boolean default false,
  mastered boolean default false,
  created_at timestamptz default now()
);

-- 13. DOCUMENTS & SYLLABUS FILES METADATA TABLE
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete cascade,
  filename text not null,
  storage_path text not null,
  file_size int not null,
  mime_type text not null,
  extracted_topics_count int default 0,
  created_at timestamptz default now()
);

-- ==============================================================================
-- INDEXES FOR OPTIMAL QUERY PERFORMANCE
-- ==============================================================================
create index if not exists idx_subjects_user_id on public.subjects(user_id);
create index if not exists idx_subjects_exam_date on public.subjects(exam_date);
create index if not exists idx_topics_subject_id on public.topics(subject_id);
create index if not exists idx_topics_user_id on public.topics(user_id);
create index if not exists idx_topics_status on public.topics(status);
create index if not exists idx_study_sessions_user_date on public.study_sessions(user_id, session_date);
create index if not exists idx_study_sessions_subject on public.study_sessions(subject_id);
create index if not exists idx_focus_records_user on public.focus_records(user_id);
create index if not exists idx_routine_commitments_user on public.routine_commitments(user_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.semesters enable row level security;
alter table public.subjects enable row level security;
alter table public.syllabus_units enable row level security;
alter table public.topics enable row level security;
alter table public.routine_commitments enable row level security;
alter table public.study_sessions enable row level security;
alter table public.focus_records enable row level security;
alter table public.goals enable row level security;
alter table public.exam_checklists enable row level security;
alter table public.practice_questions enable row level security;
alter table public.documents enable row level security;

-- Profiles Policies
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can delete own profile" on public.profiles for delete using (auth.uid() = id);

-- Semesters Policies
create policy "Users can view own semesters" on public.semesters for select using (auth.uid() = user_id);
create policy "Users can insert own semesters" on public.semesters for insert with check (auth.uid() = user_id);
create policy "Users can update own semesters" on public.semesters for update using (auth.uid() = user_id);
create policy "Users can delete own semesters" on public.semesters for delete using (auth.uid() = user_id);

-- Subjects Policies
create policy "Users can view own subjects" on public.subjects for select using (auth.uid() = user_id);
create policy "Users can insert own subjects" on public.subjects for insert with check (auth.uid() = user_id);
create policy "Users can update own subjects" on public.subjects for update using (auth.uid() = user_id);
create policy "Users can delete own subjects" on public.subjects for delete using (auth.uid() = user_id);

-- Syllabus Units Policies
create policy "Users can view own syllabus units" on public.syllabus_units for select using (auth.uid() = user_id);
create policy "Users can insert own syllabus units" on public.syllabus_units for insert with check (auth.uid() = user_id);
create policy "Users can update own syllabus units" on public.syllabus_units for update using (auth.uid() = user_id);
create policy "Users can delete own syllabus units" on public.syllabus_units for delete using (auth.uid() = user_id);

-- Topics Policies
create policy "Users can view own topics" on public.topics for select using (auth.uid() = user_id);
create policy "Users can insert own topics" on public.topics for insert with check (auth.uid() = user_id);
create policy "Users can update own topics" on public.topics for update using (auth.uid() = user_id);
create policy "Users can delete own topics" on public.topics for delete using (auth.uid() = user_id);

-- Routine Commitments Policies
create policy "Users can view own routine commitments" on public.routine_commitments for select using (auth.uid() = user_id);
create policy "Users can insert own routine commitments" on public.routine_commitments for insert with check (auth.uid() = user_id);
create policy "Users can update own routine commitments" on public.routine_commitments for update using (auth.uid() = user_id);
create policy "Users can delete own routine commitments" on public.routine_commitments for delete using (auth.uid() = user_id);

-- Study Sessions Policies
create policy "Users can view own study sessions" on public.study_sessions for select using (auth.uid() = user_id);
create policy "Users can insert own study sessions" on public.study_sessions for insert with check (auth.uid() = user_id);
create policy "Users can update own study sessions" on public.study_sessions for update using (auth.uid() = user_id);
create policy "Users can delete own study sessions" on public.study_sessions for delete using (auth.uid() = user_id);

-- Focus Records Policies
create policy "Users can view own focus records" on public.focus_records for select using (auth.uid() = user_id);
create policy "Users can insert own focus records" on public.focus_records for insert with check (auth.uid() = user_id);
create policy "Users can update own focus records" on public.focus_records for update using (auth.uid() = user_id);
create policy "Users can delete own focus records" on public.focus_records for delete using (auth.uid() = user_id);

-- Goals Policies
create policy "Users can view own goals" on public.goals for select using (auth.uid() = user_id);
create policy "Users can insert own goals" on public.goals for insert with check (auth.uid() = user_id);
create policy "Users can update own goals" on public.goals for update using (auth.uid() = user_id);
create policy "Users can delete own goals" on public.goals for delete using (auth.uid() = user_id);

-- Exam Checklists Policies
create policy "Users can view own checklists" on public.exam_checklists for select using (auth.uid() = user_id);
create policy "Users can insert own checklists" on public.exam_checklists for insert with check (auth.uid() = user_id);
create policy "Users can update own checklists" on public.exam_checklists for update using (auth.uid() = user_id);
create policy "Users can delete own checklists" on public.exam_checklists for delete using (auth.uid() = user_id);

-- Practice Questions Policies
create policy "Users can view own practice questions" on public.practice_questions for select using (auth.uid() = user_id);
create policy "Users can insert own practice questions" on public.practice_questions for insert with check (auth.uid() = user_id);
create policy "Users can update own practice questions" on public.practice_questions for update using (auth.uid() = user_id);
create policy "Users can delete own practice questions" on public.practice_questions for delete using (auth.uid() = user_id);

-- Documents Policies
create policy "Users can view own documents" on public.documents for select using (auth.uid() = user_id);
create policy "Users can insert own documents" on public.documents for insert with check (auth.uid() = user_id);
create policy "Users can update own documents" on public.documents for update using (auth.uid() = user_id);
create policy "Users can delete own documents" on public.documents for delete using (auth.uid() = user_id);

-- ==============================================================================
-- AUTHENTICATION TRIGGER: AUTO-CREATE PROFILE ON USER SIGNUP
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1), 'Student')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==============================================================================
-- STORAGE BUCKETS CONFIGURATION (Private syllabus documents)
-- ==============================================================================
insert into storage.buckets (id, name, public)
values ('syllabus_documents', 'syllabus_documents', false)
on conflict (id) do nothing;

create policy "Users can upload their own syllabus files"
on storage.objects for insert
with check (
  bucket_id = 'syllabus_documents' and
  auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can view and download their own syllabus files"
on storage.objects for select
using (
  bucket_id = 'syllabus_documents' and
  auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete their own syllabus files"
on storage.objects for delete
using (
  bucket_id = 'syllabus_documents' and
  auth.uid()::text = (storage.foldername(name))[1]
);
