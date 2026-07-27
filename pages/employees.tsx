import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import RequireRole from '../components/RequireRole';
import Layout from '../components/Layout';

// Employees are just users with role 'employee' or 'teamlead'.
// This tab is a live view of the `users` collection (same source Tasks/
// Attendance/Assets already use) — NOT a separate collection — so a
// person added via "Add User" shows up here instantly, and vice versa.
function EmployeesView() {
  const { role } = useAuth();
  const canEdit = role === 'admin' || role === 'superadmin';
  const [employees, setEmployees] = useState<any[]>([]);
  const [savingUid, setSavingUid] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snap) =>
      setEmployees(
        snap.docs
          .map((d) => d.data())
          .filter((u: any) => u.role === 'employee' || u.role === 'teamlead')
      )
    );
    return () => unsub();
  }, []);

  const updateDepartment = async (uid: string, department: string) => {
    setSavingUid(uid);
    try {
      await updateDoc(doc(db, 'users', uid), { department });
    } finally {
      setSavingUid(null);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Employees</h1>
        {canEdit && (
          <Link
            href="/admin/users"
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white"
          >
            + Add User
          </Link>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Department</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {employees.map((emp) => (
              <tr key={emp.uid}>
                <td className="px-4 py-3">
                  <p className="font-medium">{emp.name}</p>
                  <p className="text-slate-500">{emp.email}</p>
                </td>
                <td className="px-4 py-3 capitalize">{emp.role}</td>
                <td className="px-4 py-3">
                  {canEdit ? (
                    <input
                      defaultValue={emp.department || ''}
                      placeholder="—"
                      disabled={savingUid === emp.uid}
                      onBlur={(e) => {
                        if (e.target.value !== (emp.department || '')) {
                          updateDepartment(emp.uid, e.target.value);
                        }
                      }}
                      className="w-full rounded-lg border border-slate-300 px-2 py-1 disabled:opacity-50"
                    />
                  ) : (
                    emp.department || '—'
                  )}
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-3 text-slate-400">
                  No employees yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function EmployeesPage() {
  return (
    <RequireRole allow={['superadmin', 'admin', 'teamlead']}>
      <Layout>
        <EmployeesView />
      </Layout>
    </RequireRole>
  );
}
