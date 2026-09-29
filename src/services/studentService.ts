import { supabase } from '@/lib/supabase';
import type { Student, StudentInput, ActivityLog, DashboardStats, DepartmentStat, YearStat, AdmissionTrend } from '@/types';

export async function getStudents(): Promise<Student[]> {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Student[];
}

export async function getStudentById(id: string): Promise<Student | null> {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as Student | null;
}

export async function createStudent(input: StudentInput): Promise<Student> {
  const { data, error } = await supabase
    .from('students')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as Student;
}

export async function updateStudent(id: string, input: Partial<StudentInput>): Promise<Student> {
  const { data, error } = await supabase
    .from('students')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Student;
}

export async function deleteStudent(id: string): Promise<void> {
  const { error } = await supabase.from('students').delete().eq('id', id);
  if (error) throw error;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data, error } = await supabase.from('students').select('status, cgpa, attendance_percentage, department');
  if (error) throw error;
  const students = data as Pick<Student, 'status' | 'cgpa' | 'attendance_percentage' | 'department'>[];
  const total = students.length;
  const active = students.filter((s) => s.status === 'Active').length;
  const departments = new Set(students.map((s) => s.department)).size;
  const avgCgpa = total > 0 ? students.reduce((sum, s) => sum + Number(s.cgpa), 0) / total : 0;
  const avgAttendance = total > 0 ? students.reduce((sum, s) => sum + Number(s.attendance_percentage), 0) / total : 0;
  return {
    totalStudents: total,
    activeStudents: active,
    departments,
    averageCgpa: Math.round(avgCgpa * 100) / 100,
    averageAttendance: Math.round(avgAttendance * 10) / 10,
  };
}

export async function getDepartmentStats(): Promise<DepartmentStat[]> {
  const { data, error } = await supabase.from('students').select('department');
  if (error) throw error;
  const counts = new Map<string, number>();
  (data as Pick<Student, 'department'>[]).forEach((s) => {
    counts.set(s.department, (counts.get(s.department) || 0) + 1);
  });
  return Array.from(counts.entries()).map(([department, count]) => ({ department, count }));
}

export async function getYearStats(): Promise<YearStat[]> {
  const { data, error } = await supabase.from('students').select('year');
  if (error) throw error;
  const labels: Record<number, string> = { 1: '1st Year', 2: '2nd Year', 3: '3rd Year', 4: '4th Year' };
  const counts = new Map<string, number>();
  (data as Pick<Student, 'year'>[]).forEach((s) => {
    const label = labels[s.year] || `${s.year}th Year`;
    counts.set(label, (counts.get(label) || 0) + 1);
  });
  return ['1st Year', '2nd Year', '3rd Year', '4th Year']
    .map((year) => ({ year, count: counts.get(year) || 0 }))
    .filter((y) => y.count > 0);
}

export async function getAdmissionTrends(): Promise<AdmissionTrend[]> {
  const { data, error } = await supabase.from('students').select('admission_year');
  if (error) throw error;
  const counts = new Map<number, number>();
  (data as Pick<Student, 'admission_year'>[]).forEach((s) => {
    counts.set(s.admission_year, (counts.get(s.admission_year) || 0) + 1);
  });
  return Array.from(counts.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([year, count]) => ({ year: String(year), count }));
}

export async function getActivityLog(limit = 10): Promise<ActivityLog[]> {
  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as ActivityLog[];
}

export async function logActivity(action: string, description: string): Promise<void> {
  const { error } = await supabase.from('activity_log').insert({ action, description });
  if (error) console.error('Failed to log activity:', error.message);
}

export const DEPARTMENTS = [
  'Computer Science',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electronics',
  'Agricultural Engineering',
];

export const COURSES: Record<string, string[]> = {
  'Computer Science': ['B.Tech CSE', 'M.Tech CSE', 'BCA', 'MCA'],
  'Mechanical Engineering': ['B.Tech ME', 'M.Tech ME', 'Diploma ME'],
  'Civil Engineering': ['B.Tech CE', 'M.Tech CE', 'Diploma CE'],
  'Electronics': ['B.Tech ECE', 'M.Tech ECE', 'Diploma ECE'],
  'Agricultural Engineering': ['B.Tech AG', 'M.Tech AG'],
};

export const STATUSES = ['Active', 'Inactive'];
export const GENDERS = ['Male', 'Female', 'Other'];
export const SECTIONS = ['A', 'B', 'C'];
