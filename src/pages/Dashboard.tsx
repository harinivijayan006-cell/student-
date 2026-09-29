import { useEffect, useState } from 'react';
import { Users, UserCheck, Building2, GraduationCap, CalendarClock, Activity, UserPlus, Pencil, Trash2, LogIn } from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from 'recharts';
import { StatCard, SkeletonCard, Spinner } from '@/components/ui';
import {
  getDashboardStats, getDepartmentStats, getYearStats, getAdmissionTrends, getActivityLog,
} from '@/services/studentService';
import type { DashboardStats, DepartmentStat, YearStat, AdmissionTrend, ActivityLog } from '@/types';
import { useTheme } from '@/context/ThemeContext';

const PIE_COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2'];

function activityIcon(action: string) {
  if (action === 'student_added') return { icon: UserPlus, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' };
  if (action === 'student_updated') return { icon: Pencil, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' };
  if (action === 'student_deleted') return { icon: Trash2, color: 'text-red-500 bg-red-50 dark:bg-red-900/20' };
  if (action === 'admin_login') return { icon: LogIn, color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' };
  return { icon: Activity, color: 'text-gray-500 bg-gray-100 dark:bg-gray-800' };
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function Dashboard() {
  const { theme } = useTheme();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [deptStats, setDeptStats] = useState<DepartmentStat[]>([]);
  const [yearStats, setYearStats] = useState<YearStat[]>([]);
  const [trends, setTrends] = useState<AdmissionTrend[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      getDepartmentStats(),
      getYearStats(),
      getAdmissionTrends(),
      getActivityLog(8),
    ])
      .then(([s, d, y, t, a]) => {
        setStats(s);
        setDeptStats(d);
        setYearStats(y);
        setTrends(t);
        setActivities(a);
      })
      .finally(() => setLoading(false));
  }, []);

  const axisColor = theme === 'dark' ? '#9ca3af' : '#6b7280';
  const gridColor = theme === 'dark' ? '#374151' : '#e5e7eb';
  const tooltipStyle = {
    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
    border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
    borderRadius: '8px',
    fontSize: '12px',
  };

  if (loading) {
    return (
      <div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="mt-6 flex justify-center"><Spinner size={32} /></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white lg:text-2xl">Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Overview of student management statistics</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Total Students" value={stats?.totalStudents ?? 0} icon={Users} color="text-blue-600" bgColor="bg-blue-50 dark:bg-blue-900/20" />
        <StatCard title="Active Students" value={stats?.activeStudents ?? 0} icon={UserCheck} color="text-emerald-600" bgColor="bg-emerald-50 dark:bg-emerald-900/20" />
        <StatCard title="Departments" value={stats?.departments ?? 0} icon={Building2} color="text-amber-600" bgColor="bg-amber-50 dark:bg-amber-900/20" />
        <StatCard title="Average CGPA" value={stats?.averageCgpa.toFixed(2) ?? '0.00'} icon={GraduationCap} color="text-purple-600" bgColor="bg-purple-50 dark:bg-purple-900/20" />
        <StatCard title="Avg Attendance" value={`${stats?.averageAttendance ?? 0}%`} icon={CalendarClock} color="text-cyan-600" bgColor="bg-cyan-50 dark:bg-cyan-900/20" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pie Chart */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Students by Department</h3>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Distribution across departments</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deptStats}
                  dataKey="count"
                  nameKey="department"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={2}
                >
                  {deptStats.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Students by Year</h3>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Enrollment per academic year</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="year" tick={{ fill: axisColor, fontSize: 12 }} />
                <YAxis tick={{ fill: axisColor, fontSize: 12 }} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: theme === 'dark' ? '#37415133' : '#f3f4f6' }} />
                <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} name="Students" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Line Chart + Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Line Chart */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Student Admission Trend</h3>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Admissions over the years</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="year" tick={{ fill: axisColor, fontSize: 12 }} />
                <YAxis tick={{ fill: axisColor, fontSize: 12 }} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} dot={{ r: 5, fill: '#2563eb' }} name="Admissions" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Latest admin actions</p>
          <div className="mt-4 space-y-3">
            {activities.length === 0 && (
              <p className="py-8 text-center text-sm text-gray-400">No recent activity</p>
            )}
            {activities.map((a) => {
              const { icon: Icon, color } = activityIcon(a.action);
              return (
                <div key={a.id} className="flex items-start gap-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-700 dark:text-gray-200">{a.description}</p>
                    <p className="text-xs text-gray-400">{formatTimeAgo(a.created_at)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
