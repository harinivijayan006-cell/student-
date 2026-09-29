import { useEffect, useState } from 'react';
import { Download, FileBarChart, Users, Building2, Award, TrendingUp, Calendar } from 'lucide-react';
import { PageHeader, Spinner, StatCard } from '@/components/ui';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from 'recharts';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { getStudents, getDepartmentStats, getYearStats, getAdmissionTrends } from '@/services/studentService';
import type { Student, DepartmentStat, YearStat, AdmissionTrend } from '@/types';

const PIE_COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2'];

export default function Reports() {
  const { theme } = useTheme();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [deptStats, setDeptStats] = useState<DepartmentStat[]>([]);
  const [yearStats, setYearStats] = useState<YearStat[]>([]);
  const [trends, setTrends] = useState<AdmissionTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStudents(), getDepartmentStats(), getYearStats(), getAdmissionTrends()])
      .then(([s, d, y, t]) => {
        setStudents(s);
        setDeptStats(d);
        setYearStats(y);
        setTrends(t);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === 'Active').length;
  const avgCgpa = totalStudents > 0 ? students.reduce((sum, s) => sum + Number(s.cgpa), 0) / totalStudents : 0;
  const avgAttendance = totalStudents > 0 ? students.reduce((sum, s) => sum + Number(s.attendance_percentage), 0) / totalStudents : 0;

  const axisColor = theme === 'dark' ? '#9ca3af' : '#6b7280';
  const gridColor = theme === 'dark' ? '#374151' : '#e5e7eb';
  const tooltipStyle = {
    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
    border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
    borderRadius: '8px',
    fontSize: '12px',
  };

  const exportCSV = () => {
    const headers = [
      'Student ID', 'Roll Number', 'First Name', 'Last Name', 'Email', 'Phone',
      'Gender', 'Department', 'Course', 'Year', 'Semester', 'Section',
      'Admission Year', 'CGPA', 'Attendance', 'Status', 'City', 'State',
    ];
    const rows = students.map((s) => [
      s.student_id, s.roll_number, s.first_name, s.last_name, s.email, s.phone,
      s.gender, s.department, s.course, s.year, s.semester, s.section,
      s.admission_year, s.cgpa, s.attendance_percentage, s.status, s.city, s.state,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Report exported as CSV', 'success');
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size={32} /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" subtitle="Comprehensive overview and export of student data">
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Students" value={totalStudents} icon={Users} color="text-blue-600" bgColor="bg-blue-50 dark:bg-blue-900/20" />
        <StatCard title="Departments" value={new Set(students.map((s) => s.department)).size} icon={Building2} color="text-amber-600" bgColor="bg-amber-50 dark:bg-amber-900/20" />
        <StatCard title="Average CGPA" value={avgCgpa.toFixed(2)} icon={Award} color="text-emerald-600" bgColor="bg-emerald-50 dark:bg-emerald-900/20" />
        <StatCard title="Avg Attendance" value={`${avgAttendance.toFixed(1)}%`} icon={TrendingUp} color="text-cyan-600" bgColor="bg-cyan-50 dark:bg-cyan-900/20" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Students by Department</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={deptStats} dataKey="count" nameKey="department" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={2}>
                  {deptStats.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Students by Year</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="year" tick={{ fill: axisColor, fontSize: 12 }} />
                <YAxis tick={{ fill: axisColor, fontSize: 12 }} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: theme === 'dark' ? '#37415133' : '#f3f4f6' }} />
                <Bar dataKey="count" fill="#16a34a" radius={[6, 6, 0, 0]} name="Students" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Admission Trends</h3>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="year" tick={{ fill: axisColor, fontSize: 12 }} />
              <YAxis tick={{ fill: axisColor, fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={3} dot={{ r: 5, fill: '#f59e0b' }} name="Admissions" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department breakdown table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Department Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Department</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Students</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Avg CGPA</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Avg Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {deptStats.map((d) => {
                const deptStudents = students.filter((s) => s.department === d.department);
                const deptAvgCgpa = deptStudents.length > 0 ? deptStudents.reduce((sum, s) => sum + Number(s.cgpa), 0) / deptStudents.length : 0;
                const deptAvgAtt = deptStudents.length > 0 ? deptStudents.reduce((sum, s) => sum + Number(s.attendance_percentage), 0) / deptStudents.length : 0;
                return (
                  <tr key={d.department} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-5 py-3 text-sm font-medium text-gray-900 dark:text-white">{d.department}</td>
                    <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-300">{d.count}</td>
                    <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-300">{deptAvgCgpa.toFixed(2)}</td>
                    <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-300">{deptAvgAtt.toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
