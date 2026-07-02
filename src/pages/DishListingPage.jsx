import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDishes } from '../firebase/firestore';
import { CATEGORY_LABELS, SUB_CATEGORIES, CUISINE_TYPES } from '../utils/constants';
import { FiFilter, FiX, FiChevronRight } from 'react-icons/fi';

export default function DishListingPage() {
  const { category } = useParams();
  const [dishes, setDishes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cuisine, setCuisine] = useState('');
  const [subCat, setSubCat] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const isVeg = category === 'veg';
  const label = CATEGORY_LABELS[category] || category;

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getDishes({ category });
        setDishes(data);
        setFiltered(data);
      } catch (err) {
        console.error('Error loading dishes:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [category]);

  // Apply filters
  useEffect(() => {
    let result = [...dishes];
    if (cuisine) result = result.filter((d) => d.cuisine === cuisine);
    if (subCat) result = result.filter((d) => d.subCategory === subCat);
    setFiltered(result);
  }, [cuisine, subCat, dishes]);

  const clearFilters = () => { setCuisine(''); setSubCat(''); };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-text-muted mb-6">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <FiChevronRight className="text-xs" />
        <span className="text-text font-medium">{label} Dishes</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-heading text-text flex items-center gap-3">
            <span className={`inline-block w-3.5 h-3.5 ${isVeg ? 'rounded-full bg-veg' : 'rounded-sm bg-nonveg'}`} />
            {label} Dishes
          </h1>
          <p className="text-text-secondary mt-1">
            {filtered.length} dish{filtered.length !== 1 ? 'es' : ''} found
          </p>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium text-text hover:bg-page transition-colors"
        >
          <FiFilter className="text-base" />
          Filters
          {(cuisine || subCat) && (
            <span className="w-2 h-2 rounded-full bg-primary" />
          )}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white border border-border rounded-xl p-5 mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-sm text-text">Filter by</span>
            {(cuisine || subCat) && (
              <button onClick={clearFilters} className="text-xs text-primary hover:underline flex items-center gap-1">
                <FiX className="text-sm" /> Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Cuisine</label>
              <select
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white focus-ring"
              >
                <option value="">All cuisines</option>
                {CUISINE_TYPES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Type</label>
              <select
                value={subCat}
                onChange={(e) => setSubCat(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white focus-ring"
              >
                <option value="">All types</option>
                {SUB_CATEGORIES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">{isVeg ? '🥬' : '🍗'}</p>
          <h3 className="text-lg font-semibold text-text mb-1">No dishes found</h3>
          <p className="text-text-secondary text-sm">
            {cuisine || subCat ? 'Try adjusting your filters.' : 'Dishes will appear here once seeded.'}
          </p>
        </div>
      )}

      {/* Dish grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((dish) => (
            <DishCard key={dish.id} dish={dish} isVeg={isVeg} />
          ))}
        </div>
      )}
    </div>
  );
}

function DishCard({ dish, isVeg }) {
  const cuisineLabel = CUISINE_TYPES.find((c) => c.value === dish.cuisine)?.label || dish.cuisine;

  return (
    <Link
      to={`/dish/${dish.id}`}
      className="group bg-white rounded-xl border border-border overflow-hidden card-lift"
    >
      <div className="aspect-[16/10] overflow-hidden bg-border-light">
        <img
          src={dish.imageUrl}
          alt={dish.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className={isVeg ? 'badge-veg' : 'badge-nonveg'}>
            {isVeg ? '● Veg' : '■ Non-Veg'}
          </span>
          <span className="text-xs text-text-muted">{cuisineLabel}</span>
        </div>
        <h3 className="text-lg font-bold font-heading text-text group-hover:text-primary transition-colors mb-1">
          {dish.name}
        </h3>
        <p className="text-sm text-text-secondary leading-relaxed line-clamp-2 mb-3">
          {dish.description}
        </p>
        <span className="text-xs font-semibold text-primary flex items-center gap-1">
          {dish.recipeCount || 0} recipe{(dish.recipeCount || 0) !== 1 ? 's' : ''}
          <FiChevronRight className="text-[10px]" />
        </span>
      </div>
    </Link>
  );
}
