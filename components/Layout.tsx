import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', roles: ['superadmin', 'admin', 'teamlead'] },
  { href: '/dashboard/employee', label: 'My Dashboard', roles: ['employee'] },
  { href: '/employees', label: 'Employees', roles: ['superadmin', 'admin', 'teamlead'] },
  { href: '/tasks', label: 'Tasks', roles: ['superadmin', 'admin', 'teamlead'] },
  { href: '/attendance', label: 'Attendance', roles: ['superadmin', 'admin', 'teamlead'] },
  { href: '/leaves', label: 'Leaves', roles: ['superadmin', 'admin', 'teamlead'] },
  { href: '/assets', label: 'Assets', roles: ['superadmin', 'admin', 'teamlead'] },
  { href: '/admin/users', label: 'Add User', roles: ['superadmin', 'admin'] },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { profile, role } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.replace('/login');
  };

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 flex-col justify-between bg-navy text-white">
        <div>
          <div className="flex items-center gap-2 px-6 py-6">
            <span className="h-2.5 w-2.5 rounded-full bg-accent" />
            <span className="text-lg font-bold">R2U Tracker</span>
          </div>
          <nav className="mt-2 space-y-1 px-3">
            {NAV.filter((item) => role && item.roles.includes(role)).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-3 py-2 text-sm ${
                  router.pathname === item.href ? 'bg-white/10 font-semibold' : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="border-t border-white/10 p-4">
          <p className="text-sm font-semibold">{profile?.name}</p>
          <p className="truncate text-xs text-slate-400">{profile?.email}</p>
          <button onClick={handleSignOut} className="mt-3 text-sm text-slate-300 hover:text-white">
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-slate-50">{children}</main>
    </div>
  );
}
