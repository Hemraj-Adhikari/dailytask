import type { NextApiRequest, NextApiResponse } from 'next';
import { UserRole, ROLE_RANK } from '../../../types/user';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { idToken, name, email, password, role, department, employeeId } = req.body;
  if (!idToken) return res.status(401).json({ error: 'Missing auth token' });
  if (!ROLE_RANK[role as UserRole]) return res.status(400).json({ error: 'Invalid role' });

  try {
    // Imported here (not at top of file) so that a missing/invalid
    // FIREBASE_PRIVATE_KEY / FIREBASE_CLIENT_EMAIL throws inside this
    // try/catch and comes back as JSON, instead of crashing the module
    // and returning an HTML error page that broke res.json() on the client.
    const { adminAuth, adminDb } = await import('../../../lib/firebaseAdmin');
    const decoded = await adminAuth.verifyIdToken(idToken);
    const callerDoc = await adminDb.collection('users').doc(decoded.uid).get();
    const callerRole = callerDoc.data()?.role as UserRole | undefined;

    if (!callerRole || (callerRole !== 'admin' && callerRole !== 'superadmin')) {
      return res.status(403).json({ error: 'Only admins can add users' });
    }
    if ((role === 'admin' || role === 'superadmin') && callerRole !== 'superadmin') {
      return res.status(403).json({ error: 'Only a super admin can create admin accounts' });
    }

    const newUser = await adminAuth.createUser({ email, password, displayName: name });

    await adminDb.collection('users').doc(newUser.uid).set({
      uid: newUser.uid,
      email,
      name,
      role,
      department: department || null,
      employeeId: employeeId || null,
      createdAt: Date.now(),
      createdBy: decoded.uid,
    });

    return res.status(200).json({ uid: newUser.uid });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to create user' });
  }
}
