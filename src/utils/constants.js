// ============================================
// 🍽️ App Constants
// ============================================

export const APP_NAME = 'Zayka';
export const APP_TAGLINE = 'Where Every Recipe Tells a Story';

// Categories
export const CATEGORIES = {
  VEG: 'veg',
  NON_VEG: 'non-veg',
};

export const CATEGORY_LABELS = {
  [CATEGORIES.VEG]: 'Vegetarian',
  [CATEGORIES.NON_VEG]: 'Non-Vegetarian',
};

// Sub-categories
export const SUB_CATEGORIES = [
  { value: 'starters', label: 'Starters' },
  { value: 'main-course', label: 'Main Course' },
  { value: 'dessert', label: 'Dessert' },
  { value: 'snacks', label: 'Snacks' },
  { value: 'beverages', label: 'Beverages' },
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'rice-biryani', label: 'Rice & Biryani' },
  { value: 'bread', label: 'Bread' },
  { value: 'salad-raita', label: 'Salad & Raita' },
  { value: 'chutney-pickle', label: 'Chutney & Pickle' },
];

// Cuisine types
export const CUISINE_TYPES = [
  { value: 'north-indian', label: 'North Indian' },
  { value: 'south-indian', label: 'South Indian' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'gujarati', label: 'Gujarati' },
  { value: 'bengali', label: 'Bengali' },
  { value: 'rajasthani', label: 'Rajasthani' },
  { value: 'mughlai', label: 'Mughlai' },
  { value: 'street-food', label: 'Street Food' },
];

// Difficulty levels
export const DIFFICULTY_LEVELS = [
  { value: 'easy', label: 'Easy', color: '#4CAF50' },
  { value: 'medium', label: 'Medium', color: '#FFB800' },
  { value: 'hard', label: 'Hard', color: '#E63946' },
];

// Recipe status
export const RECIPE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// User roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

// Sort options
export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'most-liked', label: 'Most Liked' },
  { value: 'highest-rated', label: 'Highest Rated' },
  { value: 'quickest', label: 'Quickest to Cook' },
];

// Pagination
export const ITEMS_PER_PAGE = 12;

// Max file size for image upload (5MB)
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
