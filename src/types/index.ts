export interface Student {
  id: string;
  student_id: string;
  roll_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string | null;
  gender: string;
  department: string;
  course: string;
  year: number;
  semester: number;
  section: string;
  admission_year: number;
  address: string;
  city: string;
  state: string;
  pincode: string;
  guardian_name: string;
  guardian_phone: string;
  attendance_percentage: number;
  cgpa: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export type StudentInput = Omit<Student, 'id' | 'created_at' | 'updated_at'>;

export interface ActivityLog {
  id: string;
  action: string;
  description: string;
  created_at: string;
}

export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  departments: number;
  averageCgpa: number;
  averageAttendance: number;
}

export interface DepartmentStat {
  department: string;
  count: number;
}

export interface YearStat {
  year: string;
  count: number;
}

export interface AdmissionTrend {
  year: string;
  count: number;
}
