import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let app: App;

if (!getApps().length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    // Throwing here (at import time) used to crash the whole API route
    // before it could return JSON, which left the "Add User" button stuck
    // on "Adding..." forever. We still throw (nothing works without these),
    // but with a message that tells you exactly what to fix, and API routes
    // that use this file now catch it and return proper JSON (see
    // pages/api/users/create.ts).
    throw new Error(
      'Firebase Admin env vars missing: set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env.local (from your service account JSON), then restart the server.'
    );
  }

  app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
} else {
  app = getApps()[0];
}

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
