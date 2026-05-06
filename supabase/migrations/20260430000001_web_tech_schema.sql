-- CuratorEdu consolidated schema (Postgres-only portal + bookstore).
-- Replaces earlier incremental migrations. Safe on fresh Postgres/Supabase; uses IF NOT EXISTS / idempotent DDL.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

DROP FUNCTION IF EXISTS public.handle_new_user ();
DROP FUNCTION IF EXISTS public.sync_profile_email ();
DROP TABLE IF EXISTS public.profiles;

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  student_id TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'admin')),
  first_name TEXT,
  last_name TEXT,
  year_of_study SMALLINT CHECK (year_of_study IS NULL OR (year_of_study BETWEEN 1 AND 9)),
  faculty TEXT,
  bio TEXT,
  instructor_title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.users IS
  'Portal users: password_hash via pgcrypto crypt + fields used by CuratorEdu Express API.';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'directory_users'
  ) THEN
    INSERT INTO public.users (
      id, email, student_id, password_hash, role,
      first_name, last_name, year_of_study, faculty,
      bio, instructor_title, created_at, updated_at
    )
    SELECT
      d.id, d.email, d.student_id, d.password_hash, d.role,
      d.first_name, d.last_name, d.year_of_study, d.faculty,
      d.bio, d.instructor_title, d.created_at, d.updated_at
    FROM public.directory_users AS d
    ON CONFLICT (email) DO UPDATE SET
      student_id = EXCLUDED.student_id,
      password_hash = EXCLUDED.password_hash,
      role = EXCLUDED.role,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      year_of_study = EXCLUDED.year_of_study,
      faculty = EXCLUDED.faculty,
      bio = EXCLUDED.bio,
      instructor_title = EXCLUDED.instructor_title,
      updated_at = EXCLUDED.updated_at;

    DROP TABLE public.directory_users;
  END IF;
END $$;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.users FROM PUBLIC;
REVOKE ALL ON TABLE public.users FROM anon, authenticated;

CREATE TABLE IF NOT EXISTS public.bookstore (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT '',
  price_rm NUMERIC(10,2) NOT NULL CHECK (price_rm >= 0),
  category TEXT NOT NULL CHECK (category IN ('business','design','tech','self-help','philosophy')),
  image_url TEXT NOT NULL,
  badge TEXT,
  description TEXT,
  reader_json JSONB,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  sku TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.bookstore
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE public.bookstore
  ADD COLUMN IF NOT EXISTS sku TEXT;

CREATE INDEX IF NOT EXISTS bookstore_category_idx ON public.bookstore (category);
CREATE INDEX IF NOT EXISTS bookstore_sort_idx ON public.bookstore (sort_order);

CREATE UNIQUE INDEX IF NOT EXISTS bookstore_sku_lower_unique
  ON public.bookstore (LOWER(TRIM(sku)))
  WHERE sku IS NOT NULL AND trim(sku) <> '';

CREATE TABLE IF NOT EXISTS public.bookstore_purchase (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  bookstore_id UUID NOT NULL REFERENCES public.bookstore(id) ON DELETE CASCADE,
  amount_rm NUMERIC(10,2) NOT NULL DEFAULT 0,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, bookstore_id)
);

CREATE INDEX IF NOT EXISTS bookstore_purchase_user_idx ON public.bookstore_purchase (user_id, purchased_at DESC);

ALTER TABLE public.bookstore ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookstore_purchase ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS bookstore_select_public ON public.bookstore;
CREATE POLICY bookstore_select_public ON public.bookstore
  FOR SELECT TO anon, authenticated USING (true);

REVOKE ALL ON TABLE public.bookstore_purchase FROM PUBLIC;

GRANT SELECT ON public.bookstore TO anon, authenticated;
