/*
# Create Student Performance Analyzer schema

1. New Tables
- `profiles`: extends auth.users with role (teacher/student/admin), full_name, department. One row per auth user.
- `students`: academic student records (id, name, roll_no, department, year, section, email). Owned by the creating user.
- `attendance`: per-student daily attendance (student_id, date, status present/absent/late).
- `marks`: per-student per-subject marks (student_id, subject, internal, external, total).
2. Security
- Enable RLS on all tables.
- profiles: each authenticated user can read/update their own profile row.
- students/attendance/marks: owner-scoped to the authenticated user who created them (user_id column with DEFAULT auth.uid()).
- All policies use auth.uid() ownership checks.
3. Notes
- Email confirmation stays OFF.
- This is a multi-user app with sign-in; policies are TO authenticated with ownership predicates.
*/

-- Profiles table: extends auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'teacher' CHECK (role IN ('teacher','student','admin')),
  department text DEFAULT 'CSE',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON public.profiles;
CREATE POLICY "select_own_profile" ON public.profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON public.profiles;
CREATE POLICY "insert_own_profile" ON public.profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
CREATE POLICY "update_own_profile" ON public.profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Students table
CREATE TABLE IF NOT EXISTS public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  roll_no text NOT NULL,
  department text NOT NULL DEFAULT 'CSE',
  year int NOT NULL DEFAULT 1 CHECK (year IN (1,2,3,4)),
  section text NOT NULL DEFAULT 'A',
  email text,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, roll_no)
);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_students" ON public.students;
CREATE POLICY "select_own_students" ON public.students FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_students" ON public.students;
CREATE POLICY "insert_own_students" ON public.students FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_students" ON public.students;
CREATE POLICY "update_own_students" ON public.students FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_students" ON public.students;
CREATE POLICY "delete_own_students" ON public.students FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_students_user ON public.students(user_id);

-- Attendance table
CREATE TABLE IF NOT EXISTS public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date date NOT NULL,
  status text NOT NULL DEFAULT 'present' CHECK (status IN ('present','absent','late')),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (student_id, date)
);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_attendance" ON public.attendance;
CREATE POLICY "select_own_attendance" ON public.attendance FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_attendance" ON public.attendance;
CREATE POLICY "insert_own_attendance" ON public.attendance FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_attendance" ON public.attendance;
CREATE POLICY "update_own_attendance" ON public.attendance FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_attendance" ON public.attendance;
CREATE POLICY "delete_own_attendance" ON public.attendance FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_attendance_student ON public.attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_user ON public.attendance(user_id);

-- Marks table
CREATE TABLE IF NOT EXISTS public.marks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  subject text NOT NULL,
  internal int NOT NULL DEFAULT 0 CHECK (internal >= 0 AND internal <= 40),
  external int NOT NULL DEFAULT 0 CHECK (external >= 0 AND external <= 60),
  total int GENERATED ALWAYS AS (internal + external) STORED,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (student_id, subject)
);

ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_marks" ON public.marks;
CREATE POLICY "select_own_marks" ON public.marks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_marks" ON public.marks;
CREATE POLICY "insert_own_marks" ON public.marks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_marks" ON public.marks;
CREATE POLICY "update_own_marks" ON public.marks FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_marks" ON public.marks;
CREATE POLICY "delete_own_marks" ON public.marks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_marks_student ON public.marks(student_id);
CREATE INDEX IF NOT EXISTS idx_marks_user ON public.marks(user_id);

-- Trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, department)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'teacher'),
    COALESCE(NEW.raw_user_meta_data->>'department', 'CSE')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
