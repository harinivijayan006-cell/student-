/*
# Create students and activity_log tables for Student Management System

1. New Tables
- `students`: Comprehensive student records with personal, academic, contact, and guardian info.
  - id (uuid, primary key)
  - student_id (text, unique) — human-readable ID like STU1001
  - roll_number (text, unique)
  - first_name, last_name (text)
  - email (text, unique)
  - phone (text)
  - date_of_birth (date)
  - gender (text — Male/Female/Other)
  - department (text)
  - course (text)
  - year (int — 1-4)
  - semester (int — 1-8)
  - section (text)
  - admission_year (int)
  - address, city, state, pincode (text)
  - guardian_name, guardian_phone (text)
  - attendance_percentage (numeric, 0-100)
  - cgpa (numeric, 0-10)
  - status (text — Active/Inactive, default Active)
  - created_at, updated_at (timestamps)
- `activity_log`: Tracks admin actions for the dashboard activity feed.
  - id (uuid, primary key)
  - action (text — e.g. "student_added", "student_updated", "student_deleted", "admin_login")
  - description (text — human-readable description)
  - created_at (timestamp)

2. Indexes
- Indexes on student_id, roll_number, email, department for fast search/filter.

3. Security
- RLS enabled on both tables.
- Policies: TO authenticated (admin-only app with sign-in). Any authenticated admin can CRUD all students and read activity logs, since this is a shared admin dashboard.
- Activity log: authenticated can INSERT (for logging) and SELECT (for display).
*/

CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id text UNIQUE NOT NULL,
  roll_number text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  date_of_birth date,
  gender text DEFAULT 'Male',
  department text NOT NULL,
  course text NOT NULL,
  year int NOT NULL DEFAULT 1,
  semester int NOT NULL DEFAULT 1,
  section text DEFAULT 'A',
  admission_year int NOT NULL DEFAULT 2024,
  address text DEFAULT '',
  city text DEFAULT '',
  state text DEFAULT '',
  pincode text DEFAULT '',
  guardian_name text DEFAULT '',
  guardian_phone text DEFAULT '',
  attendance_percentage numeric DEFAULT 0,
  cgpa numeric DEFAULT 0,
  status text DEFAULT 'Active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_students_roll_number ON students(roll_number);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_department ON students(department);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_select_students" ON students;
CREATE POLICY "auth_select_students" ON students FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_students" ON students;
CREATE POLICY "auth_insert_students" ON students FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_students" ON students;
CREATE POLICY "auth_update_students" ON students FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_students" ON students;
CREATE POLICY "auth_delete_students" ON students FOR DELETE
  TO authenticated USING (true);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_students_updated_at ON students;
CREATE TRIGGER trg_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_select_activity" ON activity_log;
CREATE POLICY "auth_select_activity" ON activity_log FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_activity" ON activity_log;
CREATE POLICY "auth_insert_activity" ON activity_log FOR INSERT
  TO authenticated WITH CHECK (true);
