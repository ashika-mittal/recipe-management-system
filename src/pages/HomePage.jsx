import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiSearch, FiHeart, FiStar } from 'react-icons/fi';
import { collection, getCountFromServer, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function HomePage() {
  const [showExplore, setShowExplore] = useState(false);
  const [stats, setStats] = useState({ recipes: 0, dishes: 0, vegDishes: 0, nonvegDishes: 0, cuisines: 0 });

  useEffect(() => {
    async function fetchStats() {
      try {
        const [dishSnap, recipeSnap, vegSnap, nonvegSnap] = await Promise.all([
          getCountFromServer(collection(db, 'dishes')),
          getCountFromServer(collection(db, 'recipes')),
          getCountFromServer(query(collection(db, 'dishes'), where('category', '==', 'veg'))),
          getCountFromServer(query(collection(db, 'dishes'), where('category', '==', 'non-veg'))),
        ]);
        setStats({
          dishes: dishSnap.data().count,
          recipes: recipeSnap.data().count,
          vegDishes: vegSnap.data().count,
          nonvegDishes: nonvegSnap.data().count,
          cuisines: 8,
        });
      } catch (err) {
        console.error('Stats fetch error:', err);
      }
    }
    fetchStats();
  }, []);

  return (
    <div>
      {/* ═══════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gray-900 text-white">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-warning/5 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-sm text-gray-300 mb-6 backdrop-blur-sm border border-white/10">
              <span className="text-base">🌶️</span>
              {stats.recipes || '…'} authentic Indian recipes
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-heading leading-[1.1] mb-6">
              Discover the{' '}
              <span className="text-gradient">Authentic Taste</span>{' '}
              of India
            </h1>

            <p className="text-lg text-gray-400 mb-10 leading-relaxed max-w-lg">
              Browse handpicked recipes from every corner of India —
              from grandma's dal to restaurant-style biryanis.
              Cook, share, and celebrate food.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowExplore(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary-dark transition-colors shadow-lg shadow-primary/25 cursor-pointer"
              >
                Explore Recipes
                <FiArrowRight />
              </button>
              <Link
                to="/submit-recipe"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-full hover:bg-white/20 transition-colors border border-white/15 backdrop-blur-sm"
              >
                Share Your Recipe
              </Link>
            </div>

            {/* Veg / Non-Veg Chooser Modal */}
            {showExplore && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowExplore(false)}>
                <div className="bg-white rounded-2xl shadow-2xl border border-border p-8 w-full max-w-md animate-fade-in" onClick={(e) => e.stopPropagation()}>
                  <h3 className="text-2xl font-bold font-heading text-text text-center mb-2">What are you craving?</h3>
                  <p className="text-text-secondary text-sm text-center mb-6">Choose a category to explore</p>
                  <div className="grid grid-cols-2 gap-4">
                    <Link to="/dishes/veg" onClick={() => setShowExplore(false)}
                      className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border hover:border-veg hover:bg-veg-light transition-all group card-lift">
                      <span className="text-5xl">🥬</span>
                      <span className="font-bold font-heading text-text group-hover:text-veg transition-colors">Vegetarian</span>
                      <span className="text-xs text-text-muted">Paneer, Dal, Dosa & more</span>
                    </Link>
                    <Link to="/dishes/non-veg" onClick={() => setShowExplore(false)}
                      className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border hover:border-nonveg hover:bg-nonveg-light transition-all group card-lift">
                      <span className="text-5xl">🍗</span>
                      <span className="font-bold font-heading text-text group-hover:text-nonveg transition-colors">Non-Vegetarian</span>
                      <span className="text-xs text-text-muted">Chicken, Mutton, Fish & more</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="flex gap-8 mt-14 pt-8 border-t border-white/10">
              {[
                { value: stats.recipes || '…', label: 'Recipes' },
                { value: stats.dishes || '…', label: 'Dishes' },
                { value: stats.cuisines || '…', label: 'Cuisines' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-white font-heading">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CATEGORY CARDS
          ═══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <CategoryCard
            to="/dishes/veg"
            emoji="🥬"
            title="Vegetarian"
            description="Paneer classics, South Indian treasures, hearty dal recipes, and vibrant veggie delights."
            count={stats.vegDishes || '…'}
            color="veg"
          />
          <CategoryCard
            to="/dishes/non-veg"
            emoji="🍗"
            title="Non-Vegetarian"
            description="Butter chicken, biryanis, kebabs, fish curries, and rich mughlai favourites."
            count={stats.nonvegDishes || '…'}
            color="nonveg"
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          HOW IT WORKS
          ═══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold font-heading text-text mb-3">
            How Zayka Works
          </h2>
          <p className="text-text-secondary max-w-md mx-auto">
            A community-driven recipe platform — every dish can have multiple
            recipes. Find the one that matches your taste!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <FiSearch className="text-xl" />,
              title: 'Browse & Search',
              desc: 'Explore dishes by category, cuisine, or search by ingredients you have at hand.',
              bg: 'bg-primary-50',
              iconColor: 'text-primary',
              step: '01',
            },
            {
              icon: '🍳',
              title: 'Cook & Share',
              desc: 'Submit your recipes in a guided format. Admin reviews ensure every recipe is top quality.',
              bg: 'bg-accent-50',
              iconColor: 'text-accent',
              step: '02',
            },
            {
              icon: <FiStar className="text-xl" />,
              title: 'Rate & Bookmark',
              desc: 'Like, rate, comment, and bookmark your favourites to build your personal cookbook.',
              bg: 'bg-warning-light',
              iconColor: 'text-warning',
              step: '03',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="relative bg-white rounded-2xl p-8 border border-border card-lift animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s`, animationFillMode: 'backwards' }}
            >
              <span className="absolute top-6 right-6 text-4xl font-extrabold text-border-light font-heading">
                {item.step}
              </span>
              <div className={`w-12 h-12 rounded-xl ${item.bg} ${item.iconColor} flex items-center justify-center mb-5 text-lg`}>
                {item.icon}
              </div>
              <h3 className="text-lg font-bold font-heading text-text mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CTA BANNER
          ═══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="gradient-primary rounded-3xl px-8 py-14 sm:px-14 text-center text-white relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-white/10 rounded-full blur-2xl" />

          <div className="relative z-10">
            <h2 className="text-3xl font-bold font-heading mb-3">
              Got a Family Recipe? Share It!
            </h2>
            <p className="text-white/80 mb-8 max-w-md mx-auto">
              Preserve your favourite recipes and let millions discover them.
              Submit now — it takes less than 5 minutes.
            </p>
            <Link
              to="/submit-recipe"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-primary font-bold rounded-full hover:bg-gray-100 transition-colors shadow-lg"
            >
              Submit a Recipe
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── Category Card ── */
function CategoryCard({ to, emoji, title, description, count, color }) {
  const isVeg = color === 'veg';
  return (
    <Link
      to={to}
      className="group bg-white rounded-2xl border border-border p-7 flex gap-5 items-start card-lift"
    >
      <div
        className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 transition-transform group-hover:scale-110 ${
          isVeg ? 'bg-veg-light' : 'bg-nonveg-light'
        }`}
      >
        {emoji}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`inline-block w-2.5 h-2.5 ${isVeg ? 'rounded-full bg-veg' : 'rounded-sm bg-nonveg'}`}
          />
          <h3 className="text-xl font-bold font-heading text-text">{title}</h3>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed mb-3">
          {description}
        </p>
        <span
          className={`inline-flex items-center gap-1.5 text-sm font-semibold transition-all group-hover:gap-2.5 ${
            isVeg ? 'text-veg' : 'text-nonveg'
          }`}
        >
          Browse {count} Dishes <FiArrowRight className="text-xs" />
        </span>
      </div>
    </Link>
  );
}
