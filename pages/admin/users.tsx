import { useState } from 'react';
import { getAuth } from 'firebase/auth';
import RequireRole from '../../components/RequireRole';
import Layout from '../../components/Layout';
import { UserRole, ROLE_LABELS } from '../../types/user';

function AddUserForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee' as UserRole,
    department: '',
  });
  const [status, setStatus] = useState<{ type: 'idle' | 'saving' | 'ok' | 'error'; message?: string }>({
    type: 'idle',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: 'saving' });
    try {
      const idToken = await getAuth().currentUser?.getIdToken();
      if (!idToken) {
        setStatus({ type: 'error', message: 'You are not signed in. Please log in again.' });
        return;
      }
      const res = await fetch('/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, idToken }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // Server didn't return JSON (e.g. it crashed before reaching our
        // handler) — this is usually a missing/invalid FIREBASE_PRIVATE_KEY
        // or FIREBASE_CLIENT_EMAIL in the server's environment.
        setStatus({
          type: 'error',
          message: `Server error (status ${res.status}). Check the server logs / Firebase Admin env vars.`,
        });
        return;
      }

      if (!res.ok) {
        setStatus({ type: 'error', message: data?.error || `Request failed (status ${res.status})` });
        return;
      }
      setStatus({ type: 'ok', message: `${form.name} added as ${ROLE_LABELS[form.role]}` });
      setForm({ name: '', email: '', password: '', role: 'employee', department: '' });
    } catch (err: any) {
      // Network failure, fetch aborted, etc.
      setStatus({ type: 'error', message: err?.message || 'Network error — please try again.' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      <div>
        <label className="block text-sm font-medium text-slate-700">Full Name</label>
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Email</label>
        <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Temporary Password</label>
        <input required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Role</label>
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Department (optional)</label>
        <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
      </div>
      <button type="submit" disabled={status.type === 'saving'}
        className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white disabled:opacity-50">
        {status.type === 'saving' ? 'Adding…' : 'Add User'}
      </button>
      {status.type === 'ok' && <p className="text-sm text-emerald-600">{status.message}</p>}
      {status.type === 'error' && <p className="text-sm text-red-600">{status.message}</p>}
    </form>
  );
}

export default function AddUserPage() {
  return (
    <RequireRole allow={['admin', 'superadmin']}>
      <Layout>
        <div className="p-8">
          <h1 className="mb-6 text-2xl font-bold text-slate-900">Add User</h1>
          <AddUserForm />
        </div>
      </Layout>
    </RequireRole>
  );
}
