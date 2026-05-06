-- Courses, modules, enrollment, quizzes (Express/pg; RLS on, no Data API exposure for anon)
-- Applied to Supabase via MCP; local npm run migrate picks this up on new environments.

CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  faculty TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'technology'
    CHECK (category IN ('design','technology','business','general')),
  thumbnail_url TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','published','archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS courses_instructor_idx ON public.courses (instructor_id);
CREATE INDEX IF NOT EXISTS courses_status_idx ON public.courses (status);
CREATE INDEX IF NOT EXISTS courses_category_idx ON public.courses (category);

CREATE TABLE IF NOT EXISTS public.course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  lecture_notes_summary TEXT NOT NULL DEFAULT '',
  sample_files JSONB NOT NULL DEFAULT '[]'::jsonb,
  video_url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS course_modules_course_sort_idx ON public.course_modules (course_id, sort_order);

CREATE TABLE IF NOT EXISTS public.course_enrollments (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  progress_percent SMALLINT NOT NULL DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  PRIMARY KEY (user_id, course_id)
);

CREATE INDEX IF NOT EXISTS course_enrollments_course_idx ON public.course_enrollments (course_id);

CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  prompt TEXT NOT NULL,
  choices JSONB NOT NULL,
  correct_index SMALLINT NOT NULL CHECK (correct_index >= 0 AND correct_index <= 9),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS quiz_questions_module_sort_idx ON public.quiz_questions (module_id, sort_order);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.courses FROM PUBLIC;
REVOKE ALL ON public.course_modules FROM PUBLIC;
REVOKE ALL ON public.course_enrollments FROM PUBLIC;
REVOKE ALL ON public.quiz_questions FROM PUBLIC;
REVOKE ALL ON public.courses FROM anon, authenticated;
REVOKE ALL ON public.course_modules FROM anon, authenticated;
REVOKE ALL ON public.course_enrollments FROM anon, authenticated;
REVOKE ALL ON public.quiz_questions FROM anon, authenticated;
