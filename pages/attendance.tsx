import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import RequireRole from '../components/RequireRole';
import Layout from '../components/Layout';

const STATUSES = ['Present', 'Absent', 'Half Day', 'Leave'];

function AttendanceView() {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [employees, setEmployees] = useState<any[]>([]);
  const [records, setRecords] = useState<Record<string, any>>({});

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snap) =>
      setEmployees(snap.docs.map((d) => d.data()).filter((u: any) => u.role === 'employee' || u.role === 'teamlead'))
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'attendance'), where('date', '==', date)), (snap) => {
      const map: Record<string, any> = {};
      snap.docs.forEach((d) => (map[d.data().employeeUid] = { id: d.id, ...d.data() }));
      setRecords(map);
    });
    return () => unsub();
  }, [date]);

  const mark = async (employeeUid: string, name: string, status: string) => {
    const existing = records[employeeUid];
    if (existing) {
      await updateDoc(doc(db, 'attendance', existing.id), { status });
    } else {
      await addDoc(collection(db, 'attendance'), { employeeUid, employeeName: name, date, status, markedAt: Date.now() });
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2" />
      </div>

      <ul className="divide-y rounded-xl border border-slate-200 bg-white">
        {employees.map((emp) => (
          <li key={emp.uid} className="flex items-center justify-between px-4 py-3">
            <span className="font-medium">{emp.name}</span>
            <div className="flex gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => mark(emp.uid, emp.name, s)}
                  className={`rounded-lg px-3 py-1 text-sm ${
                    records[emp.uid]?.status === s ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </li>
        ))}
        {employees.length === 0 && <li className="px-4 py-3 text-slate-400">No employees yet</li>}
      </ul>
    </div>
  );
}

export default function AttendancePage() {
  return (
    <RequireRole allow={['superadmin', 'admin', 'teamlead']}>
      <Layout>
        <AttendanceView />
      </Layout>
    </RequireRole>
  );
}
