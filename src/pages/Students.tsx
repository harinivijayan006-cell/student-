import { Search, ChevronLeft, ChevronRight, Eye, Pencil, Trash2, Users, X } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState, Spinner } from '@/components/ui';
import { ConfirmModal } from '@/components/Modal';
import { useToast } from '@/context/ToastContext';
import { deleteStudent, logActivity, getStudents, DEPARTMENTS, STATUSES, GENDERS } from '@/services/studentService';
import type { Student } from '@/types';

const ITEMS_PER_PAGE = 10;

type SortField = 'name' | 'student_id' | 'roll_number' | 'cgpa' | 'attendance_percentage' | 'admission_year' | 'created_at';
type SortDir = 'asc' | 'desc';

export default function Students() {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterDept, filterYear, filterGender, filterStatus]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await getStudents();
      setStudents(data);
    } catch {
      toast('Failed to load students', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const filtered = useMemo(() => {
    let result = [...students];
    const q = debouncedSearch.toLowerCase().trim();
    if (q) {
      result = result.filter((s) =>
        s.first_name.toLowerCase().includes(q) ||
        s.last_name.toLowerCase().includes(q) ||
        s.student_id.toLowerCase().includes(q) ||
        s.roll_number.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone.includes(q)
      );
    }
    if (filterDept) result = result.filter((s) => s.department === filterDept);
    if (filterYear) result = result.filter((s) => String(s.year) === filterYear);
    if (filterGender) result = result.filter((s) => s.gender === filterGender);
    if (filterStatus) result = result.filter((s) => s.status === filterStatus);

    result.sort((a, b) => {
      let aVal: string | number, bVal: string | number;
      if (sortField === 'name') {
        aVal = `${a.first_name} ${a.last_name}`;
        bVal = `${b.first_name} ${b.last_name}`;
      } else {
        aVal = a[sortField] as string | number;
        bVal = b[sortField] as string | number;
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [students, debouncedSearch, filterDept, filterYear, filterGender, filterStatus, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const currentPage = Math.min(page, Math.max(1, totalPages));
  const pageData = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const clearFilters = () => {
    setFilterDept('');
    setFilterYear('');
    setFilterGender('');
    setFilterStatus('');
    setSearch('');
  };

  const hasFilters = filterDept || filterYear || filterGender || filterStatus || search;

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteStudent(deleteTarget.id);
      await logActivity('student_deleted', `Student ${deleteTarget.student_id} was deleted`);
      toast('Student deleted successfully', 'success');
      setStudents((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      toast('Failed to delete student', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const sortArrow = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? '↑' : '↓';
  };

  const SortHeader = ({ field, label }: { field: SortField; label: string }) => (
    <th className="px-4 py-3 text-left">
      <button
        onClick={() => handleSort(field)}
        className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        {label}
        <span className="text-blue-500">{sortArrow(field)}</span>
      </button>
    </th>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white lg:text-2xl">Students</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage all student records</p>
        </div>
        <Link
          to="/students/add"
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <Users className="h-4 w-4" />
          Add Student
        </Link>
      </div>

      {/* Search + Filters */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, ID, roll number, email, or phone..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterSelect value={filterDept} onChange={setFilterDept} options={DEPARTMENTS} placeholder="All Departments" />
            <FilterSelect value={filterYear} onChange={setFilterYear} options={['1', '2', '3', '4']} placeholder="All Years" />
            <FilterSelect value={filterGender} onChange={setFilterGender} options={GENDERS} placeholder="All Genders" />
            <FilterSelect value={filterStatus} onChange={setFilterStatus} options={STATUSES} placeholder="All Status" />
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <X className="h-3.5 w-3.5" /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size={32} /></div>
        ) : pageData.length === 0 ? (
          <EmptyState
            title="No students found"
            description={hasFilters ? "Try adjusting your search or filters." : "Add your first student to get started."}
            icon={Users}
            action={
              <Link to="/students/add" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                + Add Student
              </Link>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                  <tr>
                    <SortHeader field="student_id" label="Student ID" />
                    <SortHeader field="roll_number" label="Roll No" />
                    <SortHeader field="name" label="Name" />
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Department</th>
                    <SortHeader field="admission_year" label="Year" />
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Phone</th>
                    <SortHeader field="cgpa" label="CGPA" />
                    <SortHeader field="attendance_percentage" label="Attendance" />
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {pageData.map((s) => (
                    <tr key={s.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 text-sm font-medium text-blue-600 dark:text-blue-400">{s.student_id}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{s.roll_number}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{s.first_name} {s.last_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{s.department}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{s.year}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{s.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{s.phone}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">{Number(s.cgpa).toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{Number(s.attendance_percentage).toFixed(1)}%</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          s.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/students/${s.id}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/students/${s.id}/edit`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/20"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(s)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-200 px-4 py-3 dark:border-gray-800 sm:flex-row">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} students
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {currentPage} / {totalPages || 1}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Student"
        message={`Are you sure you want to delete ${deleteTarget?.first_name} ${deleteTarget?.last_name} (${deleteTarget?.student_id})? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}

function FilterSelect({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: string[]; placeholder: string }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition-colors focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}
