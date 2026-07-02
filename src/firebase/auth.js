// ============================================
// 🔥 Firebase Auth Helpers
// ============================================

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import { USER_ROLES } from '../utils/constants';

/**
 * Sign up a new user with email/password
 * Also creates a user document in Firestore
 */
export async function signUpUser(email, password, displayName) {
  // Create auth account
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Update display name in Auth
  await updateProfile(user, { displayName });

  // Create user document in Firestore
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    displayName,
    email,
    avatarUrl: '',
    role: USER_ROLES.USER,
    bookmarks: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return user;
}

/**
 * Sign in existing user with email/password
 */
export async function signInUser(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

/**
 * Sign out current user
 */
export async function signOutUser() {
  await signOut(auth);
}

/**
 * Get user data from Firestore
 */
export async function getUserData(uid) {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    return { id: userDoc.id, ...userDoc.data() };
  }
  return null;
}
