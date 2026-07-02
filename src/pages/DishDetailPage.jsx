import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDishById, getRecipesForDish } from '../firebase/firestore';
import { CUISINE_TYPES, CATEGORY_LABELS } from '../utils/constants';
import { formatCookingTime } from '../utils/helpers';
import { FiChevronRight, FiClock, FiUsers, FiStar, FiHeart } from 'react-icons/fi';

export default function DishDetailPage() {
  const { dishId } = useParams();
  const [dish, setDish] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [d, r] = await Promise.all([
          getDishById(dishId),
          getRecipesForDish(dishId),
        ]);
        setDish(d);
        setRecipes(r);
      } catch (err) {
        console.error('Error loading dish:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [dishId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!dish) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">🍽️</p>
        <h2 className="text-xl font-bold text-text mb-2">Dish not found</h2>
        <Link to="/" className="text-primary hover:underline text-sm">Go home</Link>
      </div>
    );
  }

  const isVeg = dish.category === 'veg';
  const cuisineLabel = CUISINE_TYPES.find((c) => c.value === dish.cuisine)?.label || dish.cuisine;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-muted mb-6 flex-wrap">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <FiChevronRight className="text-xs" />
        <Link to={`/dishes/${dish.category}`} className="hover:text-primary transition-colors">
          {CATEGORY_LABELS[dish.category]}
        </Link>
        <FiChevronRight className="text-xs" />
        <span className="text-text font-medium">{dish.name}</span>
      </div>

      {/* Dish header */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden mb-8">
        <div className="md:flex">
          <div className="md:w-2/5 aspect-[4/3] md:aspect-auto overflow-hidden bg-border-light">
            <img src={dish.imageUrl} alt={dish.name} className="w-full h-full object-cover" />
          </div>
          <div className="p-6 md:p-8 flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className={isVeg ? 'badge-veg' : 'badge-nonveg'}>
                {isVeg ? '● Veg' : '■ Non-Veg'}
              </span>
              <span className="text-xs text-text-muted bg-page px-2 py-0.5 rounded-full">{cuisineLabel}</span>
            </div>
            <h1 className="text-3xl font-bold font-heading text-text mb-3">{dish.name}</h1>
            <p className="text-text-secondary leading-relaxed mb-6">{dish.description}</p>
            <div className="flex items-center gap-4 text-sm text-text-muted">
              <span>{recipes.length} recipe{recipes.length !== 1 ? 's' : ''} available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recipe list */}
      <h2 className="text-xl font-bold font-heading text-text mb-5">
        Recipes for {dish.name}
      </h2>

      {recipes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-border">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-text-secondary">No recipes yet. Be the first to add one!</p>
          <Link to="/submit-recipe" className="inline-block mt-4 px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors">
            Submit Recipe
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}

function RecipeCard({ recipe }) {
  return (
    <Link
      to={`/recipe/${recipe.id}`}
      className="group block bg-white rounded-xl border border-border p-5 card-lift"
    >
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="sm:w-36 sm:h-28 aspect-video sm:aspect-auto rounded-lg overflow-hidden bg-border-light shrink-0">
          <img src={recipe.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold font-heading text-text group-hover:text-primary transition-colors mb-1 truncate">
            {recipe.title}
          </h3>
          <p className="text-sm text-text-secondary line-clamp-2 mb-3">{recipe.description}</p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
            <span className="flex items-center gap-1"><FiClock /> {formatCookingTime(recipe.totalTime)}</span>
            <span className="flex items-center gap-1"><FiUsers /> {recipe.servings} servings</span>
            <span className="flex items-center gap-1"><FiStar className="text-warning" /> {recipe.averageRating}</span>
            <span className="flex items-center gap-1"><FiHeart className="text-danger" /> {recipe.likesCount}</span>
            <span className="px-2 py-0.5 rounded-full bg-page font-medium capitalize">{recipe.difficulty}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
