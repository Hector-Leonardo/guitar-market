import admin from 'firebase-admin';

let db = null;

export function getFirestore() {
  if (!db) {
    try {
      if (!admin.apps.length) {
        // En Vercel, usar Application Default Credentials
        admin.initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID,
          credential: admin.credential.applicationDefault(),
        });
      }
      db = admin.firestore();
    } catch (error) {
      console.error('❌ Error inicializando Firebase:', error.message);
      return null;
    }
  }
  return db;
}

export default getFirestore;
