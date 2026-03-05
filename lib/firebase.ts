import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) return getApps()[0];
  return initializeApp(firebaseConfig);
}

// Lazy getters to avoid initialization at module load time
let _app: FirebaseApp | undefined;
let _db: Firestore | undefined;
let _auth: Auth | undefined;

export function getFirebaseDb(): Firestore {
  if (!_db) {
    if (!_app) _app = getFirebaseApp();
    _db = getFirestore(_app);
  }
  return _db;
}

export function getFirebaseAuth(): Auth {
  if (!_auth) {
    if (!_app) _app = getFirebaseApp();
    _auth = getAuth(_app);
  }
  return _auth;
}

// Backward compat exports (only used client-side)
export const app = typeof window !== 'undefined' ? getFirebaseApp() : undefined;
export const db = typeof window !== 'undefined' ? getFirebaseDb() : undefined as unknown as Firestore;
export const auth = typeof window !== 'undefined' ? getFirebaseAuth() : undefined as unknown as Auth;
