import admin from 'firebase-admin';

// This is a global cache for the Firebase admin app instance.
// It prevents re-initializing the app on every hot-reload in development.
const globalForFirebase = globalThis as unknown as {
  firebaseAdmin: admin.app.App | undefined;
};

const serviceAccount: admin.ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
};

if (!globalForFirebase.firebaseAdmin) {
  try {
    globalForFirebase.firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin SDK initialized.');
  } catch (error) {
    // In a production environment, you might want to log this error differently.
    // For now, we'll just log to the console.
    console.error('Firebase Admin SDK initialization error:', error);
  }
}

export const db = globalForFirebase.firebaseAdmin?.firestore();
export const auth = globalForFirebase.firebaseAdmin?.auth();

