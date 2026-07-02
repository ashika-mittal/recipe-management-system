// ============================================
// 🔥 Firebase Storage Helpers
// ============================================

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './config';

/**
 * Upload a recipe image to Firebase Storage
 * @param {File} file - The image file to upload
 * @param {string} recipeId - The recipe ID (used as folder name)
 * @returns {string} The download URL of the uploaded image
 */
export async function uploadRecipeImage(file, recipeId) {
  const fileName = `${Date.now()}_${file.name}`;
  const storageRef = ref(storage, `recipes/${recipeId}/${fileName}`);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(snapshot.ref);
  return downloadUrl;
}

/**
 * Upload a user avatar to Firebase Storage
 * @param {File} file - The avatar image file
 * @param {string} userId - The user ID
 * @returns {string} The download URL
 */
export async function uploadAvatar(file, userId) {
  const fileName = `${Date.now()}_avatar.${file.name.split('.').pop()}`;
  const storageRef = ref(storage, `avatars/${userId}/${fileName}`);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(snapshot.ref);
  return downloadUrl;
}
