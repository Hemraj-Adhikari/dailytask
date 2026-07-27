import { useEffect, useState } from 'react';
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import RequireRole from '../components/RequireRole';
import Layout from '../components/Layout';

function LeavesView() {
  const [leaves, setLeaves] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'leaves'), (snap) =>
      setLeaves(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, []);

  const decide = async (id: string, status: string) => {
    await updateDoc(doc(db, 'leaves', id), { status });
  };

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Leaves</h1>
      <ul className="divide-y rounded-xl border border-slate-200 bg-white">
        {leaves.map((l) => (
          <li key={l.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="font-medium">{l.employeeName} · {l.type}</p>
              <p className="text-sm text-slate-500">{l.startDate} to {l.endDate} — {l.reason}</p>
            </div>
            {l.status === 'pending' ? (
              <div className="space-x-2">
                <button onClick={() => decide(l.id, 'approved')} className="rounded-lg bg-emerald-600 px-3 py-1 text-sm text-white">Approve</button>
                <button onClick={() => decide(l.id, 'rejected')} className="rounded-lg bg-red-600 px-3 py-1 text-sm text-white">Reject</button>
              </div>
            ) : (
              <span className="text-sm capitalize text-slate-500">{l.status}</span>
            )}
          </li>
        ))}
        {leaves.length === 0 && <li className="px-4 py-3 text-slate-400">No leave requests</li>}
      </ul>
    </div>
  );
}

export default function LeavesPage() {
  return (
    <RequireRole allow={['superadmin', 'admin', 'teamlead']}>
      <Layout>
        <LeavesView />
      </Layout>
    </RequireRole>
  );
}
