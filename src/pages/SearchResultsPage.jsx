import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getDishes, getAllApprovedRecipes } from '../firebase/firestore';
import { CUISINE_TYPES, SORT_OPTIONS } from '../utils/constants';
import { formatCookingTime } from '../utils/helpers';
import { FiSearch, FiClock, FiStar, FiHeart, FiChevronRight, FiSliders } from 'react-icons/fi';

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryStr = searchParams.get('q') || '';
  const [query, setQuery] = useState(queryStr);

  const [dishes, setDishes] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    async function search() {
      if (!queryStr.trim()) { setLoading(false); return; }
      setLoading(true);
      try {
        const [allDishes, allRecipes] = await Promise.all([
          Promise.all([
            getDishes({ category: 'veg' }),
            getDishes({ category: 'non-veg' }),
          ]).then(([v, nv]) => [...v, ...nv]),
          getAllApprovedRecipes(sortBy),
        ]);

        const q = queryStr.toLowerCase();

        // Filter dishes matching query
        const matchedDishes = allDishes.filter(d =>
          d.name.toLowerCase().includes(q) ||
          d.description?.toLowerCase().includes(q) ||
          d.cuisine?.toLowerCase().includes(q)
        );

        // Filter recipes matching query
        const matchedRecipes = allRecipes.filter(r =>
          r.title?.toLowerCase().includes(q) ||
          r.dishName?.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.cuisine?.toLowerCase().includes(q) ||
          r.ingredients?.some(i => i.toLowerCase().includes(q))
        );

        setDishes(matchedDishes);
        setRecipes(matchedRecipes);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    search();
  }, [queryStr, sortBy]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
    }
  };

  const totalResults = dishes.length + recipes.length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search header */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-lg" />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search dishes, recipes, ingredients…"
            className="w-full pl-12 pr-4 py-3.5 bg-white rounded-xl border border-border text-base focus-ring focus:border-primary transition-colors" />
        </div>
      </form>

      {queryStr && (
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold font-heading text-text">
              Results for "{queryStr}"
            </h1>
            <p className="text-sm text-text-secondary mt-0.5">
              {loading ? 'Searching…' : `${totalResults} result${totalResults !== 1 ? 's' : ''} found`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <FiSliders className="text-text-muted text-sm" />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="border border-border rounded-lg px-3 py-1.5 text-sm bg-white focus-ring">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && queryStr && totalResults === 0 && (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🔍</p>
          <h3 className="text-lg font-semibold text-text mb-1">No results found</h3>
          <p className="text-text-secondary text-sm">Try a different search term like "biryani", "paneer", or "chicken".</p>
        </div>
      )}

      {!loading && !queryStr && (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🍛</p>
          <h3 className="text-lg font-semibold text-text mb-1">Search for anything</h3>
          <p className="text-text-secondary text-sm">Try "butter chicken", "paneer", "biryani", or an ingredient like "yogurt".</p>
        </div>
      )}

      {/* Matched Dishes */}
      {!loading && dishes.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold font-heading text-text mb-4 flex items-center gap-2">
            🍽️ Dishes ({dishes.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dishes.map(dish => {
              const isVeg = dish.category === 'veg';
              return (
                <Link key={dish.id} to={`/dish/${dish.id}`}
                  className="group bg-white rounded-xl border border-border overflow-hidden card-lift">
                  <div className="aspect-[16/10] overflow-hidden bg-border-light">
                    <img src={dish.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={isVeg ? 'badge-veg' : 'badge-nonveg'}>{isVeg ? '● Veg' : '■ Non-Veg'}</span>
                    </div>
                    <h3 className="font-bold font-heading text-text group-hover:text-primary transition-colors">{dish.name}</h3>
                    <p className="text-xs text-text-secondary line-clamp-2 mt-1">{dish.description}</p>
                    <span className="text-xs text-primary font-semibold mt-2 flex items-center gap-1">
                      {dish.recipeCount || 0} recipes <FiChevronRight className="text-[10px]" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Matched Recipes */}
      {!loading && recipes.length > 0 && (
        <section>
          <h2 className="text-lg font-bold font-heading text-text mb-4 flex items-center gap-2">
            📖 Recipes ({recipes.length})
          </h2>
          <div className="space-y-3">
            {recipes.map(recipe => (
              <Link key={recipe.id} to={`/recipe/${recipe.id}`}
                className="group flex gap-4 bg-white rounded-xl border border-border p-4 card-lift">
                <div className="w-28 h-20 rounded-lg overflow-hidden bg-border-light shrink-0">
                  <img src={recipe.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold font-heading text-text group-hover:text-primary transition-colors truncate">{recipe.title}</h3>
                  <p className="text-xs text-text-secondary line-clamp-1 mt-0.5">{recipe.description}</p>
                  <div className="flex items-center gap-4 text-xs text-text-muted mt-2">
                    <span className="flex items-center gap-1"><FiClock /> {formatCookingTime(recipe.totalTime)}</span>
                    <span className="flex items-center gap-1"><FiStar className="text-warning" /> {recipe.averageRating}</span>
                    <span className="flex items-center gap-1"><FiHeart className="text-danger" /> {recipe.likesCount}</span>
                    <span className="capitalize">{recipe.difficulty}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
