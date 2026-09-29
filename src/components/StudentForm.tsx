import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Loader2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { createStudent, updateStudent, logActivity, DEPARTMENTS, COURSES, GENDERS, SECTIONS, STATUSES } from '@/services/studentService';
import type { Student, StudentInput } from '@/types';

interface StudentFormProps {
  mode: 'add' | 'edit';
  student?: Student;
}

const emptyForm: StudentInput = {
  student_id: '',
  roll_number: '',
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  date_of_birth: '',
  gender: 'Male',
  department: 'Computer Science',
  course: 'B.Tech CSE',
  year: 1,
  semester: 1,
  section: 'A',
  admission_year: new Date().getFullYear(),
  address: '',
  city: '',
  state: '',
  pincode: '',
  guardian_name: '',
  guardian_phone: '',
  attendance_percentage: 0,
  cgpa: 0,
  status: 'Active',
};

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </div>
  );
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inputClass = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white';
const selectClass = inputClass;

export default function StudentForm({ mode, student }: StudentFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<StudentInput>(() => {
    if (mode === 'edit' && student) {
      const { id, created_at, updated_at, ...rest } = student;
      void id; void created_at; void updated_at;
      return { ...rest, date_of_birth: student.date_of_birth ?? '' };
    }
    return { ...emptyForm };
  });

  const set = (key: keyof StudentInput, value: string | number) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.student_id.trim()) e.student_id = 'Student ID is required';
    if (!form.roll_number.trim()) e.roll_number = 'Roll number is required';
    if (!form.first_name.trim()) e.first_name = 'First name is required';
    if (!form.last_name.trim()) e.last_name = 'Last name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) e.phone = 'Phone must be 10 digits';
    if (form.cgpa < 0 || form.cgpa > 10) e.cgpa = 'CGPA must be between 0 and 10';
    if (form.attendance_percentage < 0 || form.attendance_percentage > 100) e.attendance_percentage = 'Attendance must be 0-100';
    if (form.pincode && form.pincode.length < 6) e.pincode = 'Pincode must be at least 6 digits';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast('Please fix the errors in the form', 'error');
      return;
    }
    setSaving(true);
    try {
      if (mode === 'add') {
        const created = await createStudent(form);
        await logActivity('student_added', `Added new student ${created.student_id} (${created.first_name} ${created.last_name})`);
        toast('Student added successfully', 'success');
      } else if (mode === 'edit' && student) {
        await updateStudent(student.id, form);
        await logActivity('student_updated', `Student ${form.student_id} was updated`);
        toast('Student information updated successfully', 'success');
      }
      navigate('/students');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      if (msg.includes('duplicate') || msg.includes('unique')) {
        toast('A student with this ID, roll number, or email already exists', 'error');
      } else {
        toast(msg, 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const availableCourses = COURSES[form.department] || [];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormSection title="Personal Information">
        <Field label="First Name" error={errors.first_name}>
          <input className={inputClass} value={form.first_name} onChange={(e) => set('first_name', e.target.value)} />
        </Field>
        <Field label="Last Name" error={errors.last_name}>
          <input className={inputClass} value={form.last_name} onChange={(e) => set('last_name', e.target.value)} />
        </Field>
        <Field label="Date of Birth">
          <input type="date" className={inputClass} value={form.date_of_birth ?? ''} onChange={(e) => set('date_of_birth', e.target.value)} />
        </Field>
        <Field label="Gender">
          <select className={selectClass} value={form.gender} onChange={(e) => set('gender', e.target.value)}>
            {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </Field>
      </FormSection>

      <FormSection title="Academic Information">
        <Field label="Student ID" error={errors.student_id}>
          <input className={inputClass} value={form.student_id} onChange={(e) => set('student_id', e.target.value)} placeholder="STU1001" />
        </Field>
        <Field label="Roll Number" error={errors.roll_number}>
          <input className={inputClass} value={form.roll_number} onChange={(e) => set('roll_number', e.target.value)} placeholder="R001" />
        </Field>
        <Field label="Department">
          <select className={selectClass} value={form.department} onChange={(e) => { set('department', e.target.value); set('course', COURSES[e.target.value]?.[0] || ''); }}>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>
        <Field label="Course">
          <select className={selectClass} value={form.course} onChange={(e) => set('course', e.target.value)}>
            {availableCourses.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Year">
          <select className={selectClass} value={form.year} onChange={(e) => set('year', Number(e.target.value))}>
            {[1, 2, 3, 4].map((y) => <option key={y} value={y}>{y}st Year</option>)}
          </select>
        </Field>
        <Field label="Semester">
          <select className={selectClass} value={form.semester} onChange={(e) => set('semester', Number(e.target.value))}>
            {Array.from({ length: 8 }, (_, i) => i + 1).map((s) => <option key={s} value={s}>Sem {s}</option>)}
          </select>
        </Field>
        <Field label="Section">
          <select className={selectClass} value={form.section} onChange={(e) => set('section', e.target.value)}>
            {SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Admission Year">
          <input type="number" className={inputClass} value={form.admission_year} onChange={(e) => set('admission_year', Number(e.target.value))} min={2000} max={2030} />
        </Field>
        <Field label="CGPA (0-10)" error={errors.cgpa}>
          <input type="number" step="0.01" min="0" max="10" className={inputClass} value={form.cgpa} onChange={(e) => set('cgpa', Number(e.target.value))} />
        </Field>
        <Field label="Attendance (%)" error={errors.attendance_percentage}>
          <input type="number" step="0.1" min="0" max="100" className={inputClass} value={form.attendance_percentage} onChange={(e) => set('attendance_percentage', Number(e.target.value))} />
        </Field>
        <Field label="Status">
          <select className={selectClass} value={form.status} onChange={(e) => set('status', e.target.value)}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
      </FormSection>

      <FormSection title="Contact Information">
        <Field label="Email" error={errors.email}>
          <input type="email" className={inputClass} value={form.email} onChange={(e) => set('email', e.target.value)} />
        </Field>
        <Field label="Phone" error={errors.phone}>
          <input className={inputClass} value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="9876543210" />
        </Field>
        <Field label="Address">
          <input className={inputClass} value={form.address} onChange={(e) => set('address', e.target.value)} />
        </Field>
        <Field label="City">
          <input className={inputClass} value={form.city} onChange={(e) => set('city', e.target.value)} />
        </Field>
        <Field label="State">
          <input className={inputClass} value={form.state} onChange={(e) => set('state', e.target.value)} />
        </Field>
        <Field label="Pincode" error={errors.pincode}>
          <input className={inputClass} value={form.pincode} onChange={(e) => set('pincode', e.target.value)} />
        </Field>
      </FormSection>

      <FormSection title="Guardian Information">
        <Field label="Guardian Name">
          <input className={inputClass} value={form.guardian_name} onChange={(e) => set('guardian_name', e.target.value)} />
        </Field>
        <Field label="Guardian Phone">
          <input className={inputClass} value={form.guardian_phone} onChange={(e) => set('guardian_phone', e.target.value)} />
        </Field>
      </FormSection>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => navigate('/students')}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <X className="h-4 w-4" /> Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving...' : 'Save Student'}
        </button>
      </div>
    </form>
  );
}
