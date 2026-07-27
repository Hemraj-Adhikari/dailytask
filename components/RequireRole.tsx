import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/user';

interface Props {
  allow: UserRole[];
  children: ReactNode;
}

export default function RequireRole({ allow, children }: Props) {
  const { role, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (role && !allow.includes(role)) {
      router.replace(role === 'employee' ? '/dashboard/employee' : '/dashboard');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, role]);

  if (loading || !role || !allow.includes(role)) {
    return <div className="p-8 text-slate-500">Checking access…</div>;
  }

  return <>{children}</>;
}
