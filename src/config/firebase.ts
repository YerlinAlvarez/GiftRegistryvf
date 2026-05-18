import { initializeApp, getApps } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  inMemoryPersistence,
  connectAuthEmulator,
} from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

function envOrFallback(value: string | undefined, fallback: string): string {
  return value && value.trim().length > 0 ? value : fallback;
}

const firebaseConfig = {
  apiKey: envOrFallback(process.env.EXPO_PUBLIC_FIREBASE_API_KEY, 'PENDING_API_KEY'),
  authDomain: envOrFallback(process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN, 'PENDING_AUTH_DOMAIN'),
  projectId: envOrFallback(process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID, 'PENDING_PROJECT_ID'),
  storageBucket: envOrFallback(process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET, 'PENDING_STORAGE_BUCKET'),
  messagingSenderId: envOrFallback(process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, 'PENDING_SENDER_ID'),
  appId: envOrFallback(process.env.EXPO_PUBLIC_FIREBASE_APP_ID, 'PENDING_APP_ID'),
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = (() => {
  try {
    return initializeAuth(app, {
      persistence: inMemoryPersistence,
    });
  } catch {
    return getAuth(app);
  }
})();

export const db = getFirestore(app);

export const storage = getStorage(app);

export default app;
