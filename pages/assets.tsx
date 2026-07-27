import { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import RequireRole from '../components/RequireRole';
import Layout from '../components/Layout';

function AssetsView() {
  const { role } = useAuth();
  const canWrite = role === 'admin' || role === 'superadmin';
  const [assets, setAssets] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', category: '', assignedToUid: '' });

  useEffect(() => {
    const unsubAssets = onSnapshot(collection(db, 'assets'), (snap) =>
      setAssets(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsubEmp = onSnapshot(collection(db, 'users'), (snap) =>
      setEmployees(snap.docs.map((d) => d.data()).filter((u: any) => u.role === 'employee' || u.role === 'teamlead'))
    );
    return () => {
      unsubAssets();
      unsubEmp();
    };
  }, []);

  const addAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    const assignee = employees.find((e2) => e2.uid === form.assignedToUid);
    await addDoc(collection(db, 'assets'), {
      name: form.name,
      category: form.category,
      assignedToUid: form.assignedToUid || null,
      assignedToName: assignee?.name || null,
      status: form.assignedToUid ? 'Assigned' : 'Available',
      createdAt: Date.now(),
    });
    setForm({ name: '', category: '', assignedToUid: '' });
  };

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Assets</h1>

      {canWrite && (
        <form onSubmit={addAsset} className="mb-6 flex max-w-2xl flex-wrap gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <input required placeholder="Asset name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2" />
          <input required placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2" />
          <select value={form.assignedToUid} onChange={(e) => setForm({ ...form, assignedToUid: e.target.value })}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2">
            <option value="">Unassigned</option>
            {employees.map((u) => (
              <option key={u.uid} value={u.uid}>{u.name}</option>
            ))}
          </select>
          <button type="submit" className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white">Add Asset</button>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3">Asset</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Assigned To</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {assets.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-3">{a.name}</td>
                <td className="px-4 py-3">{a.category}</td>
                <td className="px-4 py-3">{a.status}</td>
                <td className="px-4 py-3">{a.assignedToName || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AssetsPage() {
  return (
    <RequireRole allow={['superadmin', 'admin', 'teamlead']}>
      <Layout>
        <AssetsView />
      </Layout>
    </RequireRole>
  );
}
