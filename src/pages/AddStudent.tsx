import { PageHeader } from '@/components/ui';
import StudentForm from '@/components/StudentForm';

export default function AddStudent() {
  return (
    <div className="space-y-5">
      <PageHeader title="Add Student" subtitle="Enter the student's information below" />
      <StudentForm mode="add" />
    </div>
  );
}
