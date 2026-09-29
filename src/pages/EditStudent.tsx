import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader, Spinner } from '@/components/ui';
import StudentForm from '@/components/StudentForm';
import { getStudentById } from '@/services/studentService';
import type { Student } from '@/types';

export default function EditStudent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getStudentById(id)
      .then((data) => {
        if (!data) navigate('/students', { replace: true });
        else setStudent(data);
      })
      .catch(() => navigate('/students', { replace: true }))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div className="flex justify-center py-20"><Spinner size={32} /></div>;
  if (!student) return null;

  return (
    <div className="space-y-5">
      <PageHeader title="Edit Student" subtitle={`Editing ${student.first_name} ${student.last_name} (${student.student_id})`} />
      <StudentForm mode="edit" student={student} />
    </div>
  );
}
