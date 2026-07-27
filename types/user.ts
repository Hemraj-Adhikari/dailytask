export type UserRole = 'superadmin' | 'admin' | 'teamlead' | 'employee';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  employeeId?: string;
  department?: string;
  createdAt: number;
  createdBy: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  superadmin: 'Super Admin',
  admin: 'Admin',
  teamlead: 'Team Lead',
  employee: 'Employee',
};

export const ROLE_RANK: Record<UserRole, number> = {
  employee: 1,
  teamlead: 2,
  admin: 3,
  superadmin: 4,
};
