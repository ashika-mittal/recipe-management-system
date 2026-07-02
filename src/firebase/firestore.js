// ============================================
// 🔥 Firestore Database Helpers
// ============================================

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  increment,
  setDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from './config';
import { RECIPE_STATUS } from '../utils/constants';

// ============================================
// DISHES
// ============================================

/**
 * Add a new dish
 */
export async function addDish(dishData) {
  const docRef = await addDoc(collection(db, 'dishes'), {
    ...dishData,
    recipeCount: 0,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Get all approved dishes, optionally filtered
 */
export async function getDishes(filters = {}) {
  let q = query(
    collection(db, 'dishes'),
    where('status', '==', 'approved')
  );

  if (filters.category) {
    q = query(q, where('category', '==', filters.category));
  }

  if (filters.subCategory) {
    q = query(q, where('subCategory', '==', filters.subCategory));
  }

  const snapshot = await getDocs(q);
  const dishes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  // Compute real recipe counts from the recipes collection
  const recipesSnap = await getDocs(
    query(collection(db, 'recipes'), where('status', '==', RECIPE_STATUS.APPROVED))
  );
  const countMap = {};
  recipesSnap.docs.forEach((d) => {
    const dishId = d.data().dishId;
    countMap[dishId] = (countMap[dishId] || 0) + 1;
  });

  return dishes.map((dish) => ({
    ...dish,
    recipeCount: countMap[dish.id] || 0,
  }));
}

/**
 * Get a single dish by ID
 */
export async function getDishById(dishId) {
  const docSnap = await getDoc(doc(db, 'dishes', dishId));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}

// ============================================
// RECIPES
// ============================================

/**
 * Submit a new recipe (status: pending)
 */
export async function submitRecipe(recipeData) {
  const docRef = await addDoc(collection(db, 'recipes'), {
    ...recipeData,
    status: RECIPE_STATUS.PENDING,
    likesCount: 0,
    averageRating: 0,
    ratingsCount: 0,
    commentsCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Get approved recipes for a specific dish
 */
export async function getRecipesForDish(dishId) {
  const q = query(
    collection(db, 'recipes'),
    where('dishId', '==', dishId),
    where('status', '==', RECIPE_STATUS.APPROVED)
  );
  const snapshot = await getDocs(q);
  const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  // Sort by likes count descending (client-side to avoid composite index)
  return results.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
}

/**
 * Get a single recipe by ID
 */
export async function getRecipeById(recipeId) {
  const docSnap = await getDoc(doc(db, 'recipes', recipeId));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}

/**
 * Get all recipes by a specific user
 */
export async function getUserRecipes(userId) {
  const q = query(
    collection(db, 'recipes'),
    where('authorId', '==', userId)
  );
  const snapshot = await getDocs(q);
  const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return results.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

/**
 * Get pending recipes (admin)
 */
export async function getPendingRecipes() {
  const q = query(
    collection(db, 'recipes'),
    where('status', '==', RECIPE_STATUS.PENDING)
  );
  const snapshot = await getDocs(q);
  const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return results.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

/**
 * Approve a recipe
 */
export async function approveRecipe(recipeId) {
  await updateDoc(doc(db, 'recipes', recipeId), {
    status: RECIPE_STATUS.APPROVED,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Reject a recipe with optional reason
 */
export async function rejectRecipe(recipeId, reason = '') {
  await updateDoc(doc(db, 'recipes', recipeId), {
    status: RECIPE_STATUS.REJECTED,
    rejectionReason: reason,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Update a recipe (sends back to pending)
 */
export async function updateRecipe(recipeId, data) {
  await updateDoc(doc(db, 'recipes', recipeId), {
    ...data,
    status: RECIPE_STATUS.PENDING,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a recipe
 */
export async function deleteRecipe(recipeId) {
  await deleteDoc(doc(db, 'recipes', recipeId));
}

/**
 * Get all approved recipes (for search/browse)
 */
export async function getAllApprovedRecipes(sortBy = 'newest') {
  const q = query(
    collection(db, 'recipes'),
    where('status', '==', RECIPE_STATUS.APPROVED)
  );
  const snapshot = await getDocs(q);
  const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  // Client-side sorting to avoid composite index requirements
  switch (sortBy) {
    case 'most-liked':
      return results.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
    case 'highest-rated':
      return results.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    case 'quickest':
      return results.sort((a, b) => (a.totalTime || 999) - (b.totalTime || 999));
    default:
      return results.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }
}

// ============================================
// LIKES
// ============================================

/**
 * Toggle like on a recipe
 */
export async function toggleLike(recipeId, userId) {
  const likeId = `${userId}_${recipeId}`;
  const likeRef = doc(db, 'likes', likeId);
  const likeSnap = await getDoc(likeRef);

  if (likeSnap.exists()) {
    // Unlike
    await deleteDoc(likeRef);
    await updateDoc(doc(db, 'recipes', recipeId), {
      likesCount: increment(-1),
    });
    return false;
  } else {
    // Like
    await setDoc(likeRef, {
      userId,
      recipeId,
      createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, 'recipes', recipeId), {
      likesCount: increment(1),
    });
    return true;
  }
}

/**
 * Check if user has liked a recipe
 */
export async function hasUserLiked(recipeId, userId) {
  const likeId = `${userId}_${recipeId}`;
  const likeSnap = await getDoc(doc(db, 'likes', likeId));
  return likeSnap.exists();
}

// ============================================
// RATINGS
// ============================================

/**
 * Rate a recipe (1–5 stars)
 */
export async function rateRecipe(recipeId, userId, rating) {
  const ratingId = `${userId}_${recipeId}`;
  const ratingRef = doc(db, 'ratings', ratingId);
  const ratingSnap = await getDoc(ratingRef);

  // Get current recipe data for average calculation
  const recipeSnap = await getDoc(doc(db, 'recipes', recipeId));
  const recipeData = recipeSnap.data();

  let newAverage, newCount;

  if (ratingSnap.exists()) {
    // Update existing rating
    const oldRating = ratingSnap.data().rating;
    newCount = recipeData.ratingsCount;
    newAverage =
      (recipeData.averageRating * newCount - oldRating + rating) / newCount;

    await setDoc(ratingRef, { userId, recipeId, rating, createdAt: serverTimestamp() });
  } else {
    // New rating
    newCount = recipeData.ratingsCount + 1;
    newAverage =
      (recipeData.averageRating * recipeData.ratingsCount + rating) / newCount;

    await setDoc(ratingRef, { userId, recipeId, rating, createdAt: serverTimestamp() });
  }

  await updateDoc(doc(db, 'recipes', recipeId), {
    averageRating: Math.round(newAverage * 10) / 10,
    ratingsCount: newCount,
  });

  return { averageRating: newAverage, ratingsCount: newCount };
}

/**
 * Get user's rating for a recipe
 */
export async function getUserRating(recipeId, userId) {
  const ratingId = `${userId}_${recipeId}`;
  const ratingSnap = await getDoc(doc(db, 'ratings', ratingId));
  return ratingSnap.exists() ? ratingSnap.data().rating : 0;
}

// ============================================
// COMMENTS
// ============================================

/**
 * Add a comment to a recipe
 */
export async function addComment(recipeId, commentData) {
  const docRef = await addDoc(collection(db, 'comments'), {
    recipeId,
    ...commentData,
    parentCommentId: commentData.parentCommentId || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Increment comments count on recipe
  await updateDoc(doc(db, 'recipes', recipeId), {
    commentsCount: increment(1),
  });

  return docRef.id;
}

/**
 * Get comments for a recipe
 */
export async function getComments(recipeId) {
  const q = query(
    collection(db, 'comments'),
    where('recipeId', '==', recipeId)
  );
  const snapshot = await getDocs(q);
  const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return results.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId, recipeId) {
  await deleteDoc(doc(db, 'comments', commentId));
  await updateDoc(doc(db, 'recipes', recipeId), {
    commentsCount: increment(-1),
  });
}

// ============================================
// BOOKMARKS
// ============================================

/**
 * Toggle bookmark for a recipe
 */
export async function toggleBookmark(userId, recipeId) {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  const userData = userSnap.data();
  const bookmarks = userData.bookmarks || [];

  if (bookmarks.includes(recipeId)) {
    await updateDoc(userRef, {
      bookmarks: arrayRemove(recipeId),
    });
    return false;
  } else {
    await updateDoc(userRef, {
      bookmarks: arrayUnion(recipeId),
    });
    return true;
  }
}

/**
 * Get bookmarked recipes for a user
 */
export async function getBookmarkedRecipes(bookmarkIds) {
  if (!bookmarkIds || bookmarkIds.length === 0) return [];

  const recipes = [];
  for (const id of bookmarkIds) {
    const recipeSnap = await getDoc(doc(db, 'recipes', id));
    if (recipeSnap.exists()) {
      recipes.push({ id: recipeSnap.id, ...recipeSnap.data() });
    }
  }
  return recipes;
}
