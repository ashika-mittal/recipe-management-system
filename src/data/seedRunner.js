// ============================================
// 🌱 Zayka — Seed Firestore Script
// ============================================

import { collection, doc, setDoc, getDocs, deleteDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/config';
import { SEED_DISHES, generateSeedRecipes } from './seedData';
import { slugify } from '../utils/helpers';

/**
 * Delete all existing dishes and recipes
 */
async function clearDatabase() {
  console.log('🗑️ Clearing existing data...');

  const collections = ['dishes', 'recipes', 'comments', 'likes', 'ratings'];
  for (const colName of collections) {
    const snapshot = await getDocs(collection(db, colName));
    const batch = writeBatch(db);
    let count = 0;
    for (const docSnap of snapshot.docs) {
      batch.delete(docSnap.ref);
      count++;
      // Firestore batch limit is 500
      if (count % 450 === 0) {
        await batch.commit();
      }
    }
    if (count % 450 !== 0) await batch.commit();
    console.log(`  Deleted ${count} docs from '${colName}'`);
  }
}

/**
 * Auto-seed if the database is empty.
 * Called on app startup — runs silently in the background.
 */
export async function autoSeedIfEmpty() {
  try {
    const existingDishes = await getDocs(collection(db, 'dishes'));
    if (existingDishes.size > 0) {
      console.log(`✅ Database has ${existingDishes.size} dishes — no seed needed.`);
      return;
    }
    console.log('📦 Database is empty — auto-seeding...');
    await seedDatabase();
  } catch (err) {
    console.error('Auto-seed failed:', err);
  }
}

/**
 * Seeds Firestore with dishes and recipes.
 * Clears existing data first, then seeds fresh.
 */
export async function seedDatabase() {
  console.log('🌱 Starting Zayka seed...');

  // Clear old data first
  await clearDatabase();

  // Step 1: Create dishes
  const dishIdMap = {};
  const batch1 = writeBatch(db);

  for (const dish of SEED_DISHES) {
    const dishId = slugify(dish.name);
    const dishRef = doc(db, 'dishes', dishId);

    batch1.set(dishRef, {
      name: dish.name,
      slug: dishId,
      category: dish.category,
      subCategory: dish.subCategory,
      cuisine: dish.cuisine,
      description: dish.description,
      imageUrl: dish.imageUrl,
      recipeCount: 0,
      status: 'approved',
      createdAt: serverTimestamp(),
    });

    dishIdMap[dish.name] = dishId;
  }

  await batch1.commit();
  console.log(`✅ Created ${SEED_DISHES.length} dishes`);

  // Step 2: Create recipes
  const recipes = generateSeedRecipes();
  const BATCH_SIZE = 20;

  for (let i = 0; i < recipes.length; i += BATCH_SIZE) {
    const chunk = recipes.slice(i, i + BATCH_SIZE);
    const batch = writeBatch(db);

    for (const recipe of chunk) {
      const dishId = dishIdMap[recipe.dishName];
      const recipeRef = doc(collection(db, 'recipes'));
      batch.set(recipeRef, {
        ...recipe,
        dishId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    await batch.commit();
    console.log(`✅ Created recipes batch ${Math.floor(i / BATCH_SIZE) + 1}`);
  }

  // Step 3: Update recipe counts
  const recipeCountMap = {};
  for (const r of recipes) {
    const dishId = dishIdMap[r.dishName];
    recipeCountMap[dishId] = (recipeCountMap[dishId] || 0) + 1;
  }

  const batch3 = writeBatch(db);
  for (const [dishId, count] of Object.entries(recipeCountMap)) {
    batch3.update(doc(db, 'dishes', dishId), { recipeCount: count });
  }
  await batch3.commit();

  console.log(`🎉 Seed complete! ${SEED_DISHES.length} dishes, ${recipes.length} recipes.`);
  return { dishes: SEED_DISHES.length, recipes: recipes.length, skipped: false };
}
