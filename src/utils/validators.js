// ============================================
// 🍽️ Form Validators
// ============================================

import { CATEGORIES, MAX_IMAGE_SIZE, ALLOWED_IMAGE_TYPES } from './constants';

/**
 * Validate the recipe submission form
 * Returns an object with field-level errors, or empty object if valid
 */
export function validateRecipeForm(data) {
  const errors = {};

  // Dish name
  if (!data.dishName || data.dishName.trim().length < 3) {
    errors.dishName = 'Dish name must be at least 3 characters';
  }

  // Category
  if (!data.category || !Object.values(CATEGORIES).includes(data.category)) {
    errors.category = 'Please select a valid category (Veg or Non-Veg)';
  }

  // Sub-category
  if (!data.subCategory) {
    errors.subCategory = 'Please select a sub-category';
  }

  // Cuisine type
  if (!data.cuisineType) {
    errors.cuisineType = 'Please select a cuisine type';
  }

  // Ingredients (at least 2)
  if (!data.ingredients || data.ingredients.filter(i => i.trim()).length < 2) {
    errors.ingredients = 'Please add at least 2 ingredients';
  }

  // Steps (at least 2)
  if (!data.steps || data.steps.filter(s => s.instruction?.trim()).length < 2) {
    errors.steps = 'Please add at least 2 cooking steps';
  }

  // Cooking time
  if (!data.cookingTime || data.cookingTime < 1 || data.cookingTime > 600) {
    errors.cookingTime = 'Cooking time must be between 1 and 600 minutes';
  }

  // Difficulty
  if (!data.difficulty) {
    errors.difficulty = 'Please select a difficulty level';
  }

  return errors;
}

/**
 * Validate image file for upload
 */
export function validateImage(file) {
  if (!file) {
    return 'Please upload a recipe image';
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Image must be JPEG, PNG, or WebP';
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return 'Image must be less than 5MB';
  }

  return null;
}

/**
 * Validate signup form
 */
export function validateSignupForm(data) {
  const errors = {};

  if (!data.displayName || data.displayName.trim().length < 2) {
    errors.displayName = 'Name must be at least 2 characters';
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!data.password || data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
}

/**
 * Validate login form
 */
export function validateLoginForm(data) {
  const errors = {};

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!data.password || data.password.length < 1) {
    errors.password = 'Please enter your password';
  }

  return errors;
}
