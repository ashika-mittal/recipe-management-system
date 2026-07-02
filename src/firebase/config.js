// ============================================
// 🔥 Firebase Configuration
// ============================================

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAYUmkKqZ43cLRBRIpRU9vOo5Gc6cDeq8c",
  authDomain: "recipe-management-system-d9e16.firebaseapp.com",
  projectId: "recipe-management-system-d9e16",
  storageBucket: "recipe-management-system-d9e16.firebasestorage.app",
  messagingSenderId: "675296366578",
  appId: "1:675296366578:web:44c001682fb809a15c256b"
};

// Initialize Firebase (prevent duplicate during HMR)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

