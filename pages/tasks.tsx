import { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import RequireRole from '../components/RequireRole';
import Layout from '../components/Layout';

function TasksView() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [form, setForm] = useState({ title: '', description: '', assignedToUid: '', priority: 'Medium' });

  useEffect(() => {
    const unsubTasks = onSnapshot(collection(db, 'tasks'), (snap) =>
      setTasks(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsubEmp = onSnapshot(collection(db, 'users'), (snap) =>
      setEmployees(snap.docs.map((d) => d.data()).filter((u: any) => u.role === 'employee' || u.role === 'teamlead'))
    );
    return () => {
      unsubTasks();
      unsubEmp();
    };
  }, []);

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const assignee = employees.find((e2) => e2.uid === form.assignedToUid);
    await addDoc(collection(db, 'tasks'), {
      title: form.title,
      description: form.description,
      assignedToUid: form.assignedToUid,
      assignedToName: assignee?.name || '',
      date: new Date().toISOString().slice(0, 10),
      priority: form.priority,
      status: 'Pending',
      createdAt: Date.now(),
    });
    setForm({ title: '', description: '', assignedToUid: '', priority: 'Medium' });
  };

  const updateStatus = async (taskId: string, status: string) => {
    await updateDoc(doc(db, 'tasks', taskId), { status });
  };

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Tasks</h1>

      <form onSubmit={createTask} className="mb-6 max-w-2xl space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <input required placeholder="Task title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        <textarea placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        <div className="flex gap-3">
          <select required value={form.assignedToUid} onChange={(e) => setForm({ ...form, assignedToUid: e.target.value })}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2">
            <option value="">Assign to…</option>
            {employees.map((u) => (
              <option key={u.uid} value={u.uid}>{u.name}</option>
            ))}
          </select>
          <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2">
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>
        <button type="submit" className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white">New Task</button>
      </form>

      <ul className="divide-y rounded-xl border border-slate-200 bg-white">
        {tasks.map((t) => (
          <li key={t.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="font-medium">{t.title}</p>
              <p className="text-sm text-slate-500">{t.assignedToName} · {t.priority} · {t.date}</p>
            </div>
            <select value={t.status} onChange={(e) => updateStatus(t.id, e.target.value)}
              className="rounded-lg border border-slate-300 px-2 py-1 text-sm">
              <option>Pending</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
          </li>
        ))}
        {tasks.length === 0 && <li className="px-4 py-3 text-slate-400">No tasks yet</li>}
      </ul>
    </div>
  );
}

export default function TasksPage() {
  return (
    <RequireRole allow={['superadmin', 'admin', 'teamlead']}>
      <Layout>
        <TasksView />
      </Layout>
    </RequireRole>
  );
}
