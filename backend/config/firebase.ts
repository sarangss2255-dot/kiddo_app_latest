import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

function initializeFirebase() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      if (admin.apps.length === 0) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase Admin initialized successfully');
      }
    } catch (error) {
      console.error('Error parsing FIREBASE_SERVICE_ACCOUNT_KEY:', error);
    }
  } else {
    console.warn('FIREBASE_SERVICE_ACCOUNT_KEY not found. Backend functionality will be limited.');
  }
}

initializeFirebase();

export const db = admin.firestore();
export const auth = admin.auth();
export default admin;
