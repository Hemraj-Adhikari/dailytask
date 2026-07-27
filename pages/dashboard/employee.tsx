import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import RequireRole from '../../components/RequireRole';
import Layout from '../../components/Layout';

function EmployeeView() {
  const { user, profile } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [leaveForm, setLeaveForm] = useState({ type: 'Casual', startDate: '', endDate: '', reason: '' });

  useEffect(() => {
    if (!user) return;
    const unsubs = [
      onSnapshot(query(collection(db, 'tasks'), where('assignedToUid', '==', user.uid)), (snap) =>
        setTasks(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      ),
      onSnapshot(query(collection(db, 'attendance'), where('employeeUid', '==', user.uid)), (snap) =>
        setAttendance(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      ),
      onSnapshot(query(collection(db, 'leaves'), where('employeeUid', '==', user.uid)), (snap) =>
        setLeaves(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      ),
      onSnapshot(query(collection(db, 'assets'), where('assignedToUid', '==', user.uid)), (snap) =>
        setAssets(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      ),
    ];
    return () => unsubs.forEach((u) => u());
  }, [user]);

  const markTask = async (taskId: string, status: string) => {
    await updateDoc(doc(db, 'tasks', taskId), { status });
  };

  const applyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    await addDoc(collection(db, 'leaves'), {
      employeeUid: user.uid,
      employeeName: profile.name,
      type: leaveForm.type,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      reason: leaveForm.reason,
      status: 'pending',
      requestedAt: Date.now(),
    });
    setLeaveForm({ type: 'Casual', startDate: '', endDate: '', reason: '' });
  };

  return (
    <div className="space-y-8 p-8">
      <h1 className="text-2xl font-bold text-slate-900">My Dashboard — {profile?.name}</h1>

      <section>
        <h2 className="mb-2 text-lg font-semibold">My Tasks</h2>
        <ul className="divide-y rounded-lg border border-slate-200 bg-white">
          {tasks.map((t) => (
            <li key={t.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-medium">{t.title}</p>
                <p className="text-sm text-slate-500">{t.status}</p>
              </div>
              {t.status !== 'Completed' && (
                <div className="space-x-2">
                  {t.status === 'Pending' && (
                    <button onClick={() => markTask(t.id, 'In Progress')} className="text-sm text-amber-600">
                      Start
                    </button>
                  )}
                  <button onClick={() => markTask(t.id, 'Completed')} className="text-sm text-emerald-600">
                    Done
                  </button>
                </div>
              )}
            </li>
          ))}
          {tasks.length === 0 && <li className="px-4 py-3 text-slate-400">No tasks assigned</li>}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">My Attendance</h2>
        <ul className="divide-y rounded-lg border border-slate-200 bg-white">
          {attendance.map((a) => (
            <li key={a.id} className="flex items-center justify-between px-4 py-3">
              <span>{a.date}</span>
              <span className="text-sm text-slate-500">{a.status}</span>
            </li>
          ))}
          {attendance.length === 0 && <li className="px-4 py-3 text-slate-400">No records yet</li>}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">My Leaves</h2>
        <ul className="mb-4 divide-y rounded-lg border border-slate-200 bg-white">
          {leaves.map((l) => (
            <li key={l.id} className="flex items-center justify-between px-4 py-3">
              <span>
                {l.type} · {l.startDate} to {l.endDate}
              </span>
              <span className="text-sm text-slate-500">{l.status}</span>
            </li>
          ))}
          {leaves.length === 0 && <li className="px-4 py-3 text-slate-400">No leave requests yet</li>}
        </ul>
        <form onSubmit={applyLeave} className="max-w-md space-y-3 rounded-lg border border-slate-200 bg-white p-4">
          <p className="font-medium">Apply for Leave</p>
          <select
            value={leaveForm.type}
            onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option>Casual</option>
            <option>Sick</option>
            <option>Earned</option>
          </select>
          <div className="flex gap-2">
            <input
              required
              type="date"
              value={leaveForm.startDate}
              onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            <input
              required
              type="date"
              value={leaveForm.endDate}
              onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <input
            required
            placeholder="Reason"
            value={leaveForm.reason}
            onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          <button type="submit" className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white">
            Submit
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">My Assets</h2>
        <ul className="divide-y rounded-lg border border-slate-200 bg-white">
          {assets.map((a) => (
            <li key={a.id} className="flex items-center justify-between px-4 py-3">
              <span>{a.name}</span>
              <span className="text-sm text-slate-500">{a.category}</span>
            </li>
          ))}
          {assets.length === 0 && <li className="px-4 py-3 text-slate-400">Nothing assigned</li>}
        </ul>
      </section>
    </div>
  );
}

export default function EmployeeDashboardPage() {
  return (
    <RequireRole allow={['employee']}>
      <Layout>
        <EmployeeView />
      </Layout>
    </RequireRole>
  );
}
