import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import RequireRole from '../../components/RequireRole';
import Layout from '../../components/Layout';

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function DashboardView() {
  const [counts, setCounts] = useState({ employees: 0, tasks: 0, pendingLeaves: 0, assets: 0 });

  useEffect(() => {
    const unsubs = [
      onSnapshot(collection(db, 'users'), (snap) =>
        setCounts((c) => ({
          ...c,
          employees: snap.docs.filter((d) => ['employee', 'teamlead'].includes(d.data().role)).length,
        }))
      ),
      onSnapshot(collection(db, 'tasks'), (snap) => setCounts((c) => ({ ...c, tasks: snap.size }))),
      onSnapshot(collection(db, 'leaves'), (snap) =>
        setCounts((c) => ({ ...c, pendingLeaves: snap.docs.filter((d) => d.data().status === 'pending').length }))
      ),
      onSnapshot(collection(db, 'assets'), (snap) => setCounts((c) => ({ ...c, assets: snap.size }))),
    ];
    return () => unsubs.forEach((u) => u());
  }, []);

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total Employees" value={counts.employees} />
        <Stat label="Total Tasks" value={counts.tasks} />
        <Stat label="Pending Leaves" value={counts.pendingLeaves} />
        <Stat label="Total Assets" value={counts.assets} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RequireRole allow={['superadmin', 'admin', 'teamlead']}>
      <Layout>
        <DashboardView />
      </Layout>
    </RequireRole>
  );
}
