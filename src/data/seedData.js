// ============================================
// 🍛 Zayka — Seed Data (Combines Veg + Non-Veg + Extras)
// ============================================

import { VEG_DISHES } from './vegRecipes';
import { NONVEG_DISHES } from './nonvegRecipes';
import { EXTRA_RECIPES } from './extraRecipes';
import { slugify } from '../utils/helpers';

const ALL_DISHES = [...VEG_DISHES, ...NONVEG_DISHES];

export const SEED_DISHES = ALL_DISHES.map((d) => ({
  name: d.name,
  slug: slugify(d.name),
  category: d.category,
  subCategory: d.subCategory,
  cuisine: d.cuisine,
  description: d.description,
  imageUrl: d.imageUrl,
  status: 'approved',
}));

function makeRecipeObj(dish, recipe, authorName = 'Zayka Kitchen') {
  return {
    dishName: dish.name || recipe.dishName,
    title: recipe.title,
    category: dish.category || findDish(recipe.dishName)?.category || 'veg',
    subCategory: dish.subCategory || findDish(recipe.dishName)?.subCategory || '',
    cuisine: dish.cuisine || findDish(recipe.dishName)?.cuisine || '',
    description: dish.description || '',
    imageUrl: dish.imageUrl || findDish(recipe.dishName)?.imageUrl || '',
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    totalTime: recipe.prepTime + recipe.cookTime,
    servings: recipe.servings,
    difficulty: recipe.difficulty,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
    tips: recipe.tips || '',
    status: 'approved',
    authorName,
    authorId: 'seed-user',
    likesCount: Math.floor(Math.random() * 80) + 5,
    averageRating: +(3.5 + Math.random() * 1.5).toFixed(1),
    ratingsCount: Math.floor(Math.random() * 30) + 3,
    commentsCount: 0,
  };
}

function findDish(name) {
  return ALL_DISHES.find((d) => d.name === name);
}

export function generateSeedRecipes() {
  const recipes = [];

  // Primary recipes (1 per dish)
  for (const dish of ALL_DISHES) {
    recipes.push(makeRecipeObj(dish, dish.recipe, 'Zayka Kitchen'));
  }

  // Extra community recipes
  const communityAuthors = ['Home Chef Priya', 'Ravi\'s Kitchen', 'Amma\'s Recipes', 'Chef Arjun', 'Spice Trail by Meera', 'Desi Foodie'];
  for (const extra of EXTRA_RECIPES) {
    const dish = findDish(extra.dishName);
    if (!dish) continue;
    const author = communityAuthors[Math.floor(Math.random() * communityAuthors.length)];
    recipes.push(makeRecipeObj(dish, extra, author));
  }

  return recipes;
}
