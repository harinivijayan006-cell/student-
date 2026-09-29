DROP POLICY IF EXISTS "admin_insert_students" ON students;
DROP POLICY IF EXISTS "auth_insert_students" ON students;
CREATE POLICY "auth_insert_students" ON students FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_students" ON students;
DROP POLICY IF EXISTS "auth_update_students" ON students;
CREATE POLICY "auth_update_students" ON students FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_students" ON students;
DROP POLICY IF EXISTS "auth_delete_students" ON students;
CREATE POLICY "auth_delete_students" ON students FOR DELETE
  TO authenticated USING (true);