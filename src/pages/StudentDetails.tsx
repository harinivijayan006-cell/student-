import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Pencil, ArrowLeft, Mail, Phone, MapPin, Calendar, User, GraduationCap, Users, BookOpen, Award, TrendingUp } from 'lucide-react';
import { Spinner } from '@/components/ui';
import { getStudentById } from '@/services/studentService';
import type { Student } from '@/types';

export default function StudentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getStudentById(id)
      .then((data) => { if (!data) navigate('/students', { replace: true }); else setStudent(data); })
      .catch(() => navigate('/students', { replace: true }))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div className="flex justify-center py-20"><Spinner size={32} /></div>;
  if (!student) return null;

  const fullName = `${student.first_name} ${student.last_name}`;
  const initials = `${student.first_name[0]}${student.last_name[0]}`.toUpperCase();

  const InfoRow = ({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) => (
    <div className="flex items-center gap-3 py-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
        <Icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{value || '—'}</p>
      </div>
    </div>
  );

  const Section = ({ title, icon: Icon, children }: { title: string; icon: typeof Mail; children: React.ReactNode }) => (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-blue-600" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">{children}</div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link to="/students" className="flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-300">
          <ArrowLeft className="h-4 w-4" /> Back to Students
        </Link>
        <Link
          to={`/students/${student.id}/edit`}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <Pencil className="h-4 w-4" /> Edit
        </Link>
      </div>

      {/* Profile Header */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="h-24 bg-gradient-to-r from-blue-600 to-cyan-500" />
        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-end">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-blue-600 text-2xl font-bold text-white dark:border-gray-900">
              {initials}
            </div>
            <div className="flex-1 pb-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{fullName}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{student.student_id} · {student.department}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{student.course}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                  student.status === 'Active'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}>{student.status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Sections */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Section title="Student Information" icon={User}>
          <InfoRow icon={GraduationCap} label="Student ID" value={student.student_id} />
          <InfoRow icon={BookOpen} label="Roll Number" value={student.roll_number} />
          <InfoRow icon={Mail} label="Email" value={student.email} />
          <InfoRow icon={Phone} label="Phone" value={student.phone} />
          <InfoRow icon={Calendar} label="Date of Birth" value={student.date_of_birth || '—'} />
          <InfoRow icon={User} label="Gender" value={student.gender} />
        </Section>

        <Section title="Academic Information" icon={GraduationCap}>
          <InfoRow icon={BookOpen} label="Department" value={student.department} />
          <InfoRow icon={BookOpen} label="Course" value={student.course} />
          <InfoRow icon={GraduationCap} label="Year" value={`${student.year}st Year`} />
          <InfoRow icon={BookOpen} label="Semester" value={`Semester ${student.semester}`} />
          <InfoRow icon={BookOpen} label="Section" value={student.section} />
          <InfoRow icon={Award} label="CGPA" value={Number(student.cgpa).toFixed(2)} />
          <InfoRow icon={TrendingUp} label="Attendance" value={`${Number(student.attendance_percentage).toFixed(1)}%`} />
        </Section>

        <Section title="Contact Information" icon={MapPin}>
          <InfoRow icon={MapPin} label="Address" value={student.address || '—'} />
          <InfoRow icon={MapPin} label="City" value={student.city || '—'} />
          <InfoRow icon={MapPin} label="State" value={student.state || '—'} />
          <InfoRow icon={MapPin} label="Pincode" value={student.pincode || '—'} />
        </Section>

        <Section title="Guardian Information" icon={Users}>
          <InfoRow icon={User} label="Guardian Name" value={student.guardian_name || '—'} />
          <InfoRow icon={Phone} label="Guardian Phone" value={student.guardian_phone || '—'} />
        </Section>
      </div>
    </div>
  );
}
