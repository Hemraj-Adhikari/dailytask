import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
    } else if (role === 'employee') {
      router.replace('/dashboard/employee');
    } else {
      router.replace('/dashboard');
    }
  }, [user, role, loading]);

  return <div className="flex min-h-screen items-center justify-center text-slate-500">Loading…</div>;
}
