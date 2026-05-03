-- Per-module completion for enrolled learners (students). Drives enrollment.progress_percent.

CREATE TABLE IF NOT EXISTS public.course_module_completion (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, module_id)
);

CREATE INDEX IF NOT EXISTS course_module_completion_user_idx
  ON public.course_module_completion (user_id);

ALTER TABLE public.course_module_completion ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.course_module_completion FROM PUBLIC;
REVOKE ALL ON public.course_module_completion FROM anon, authenticated;
