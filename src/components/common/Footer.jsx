import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🍛</span>
              <span className="text-lg font-extrabold text-white font-heading">
                Zayka
              </span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400 max-w-xs">
              A community platform for Indian food lovers. Discover authentic
              recipes, share your own, and celebrate the rich flavours of India.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5">
              {[
                { to: '/dishes/veg', label: 'Vegetarian' },
                { to: '/dishes/non-veg', label: 'Non-Vegetarian' },
                { to: '/submit-recipe', label: 'Submit Recipe' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
              Popular
            </h4>
            <ul className="space-y-2.5">
              {['Punjabi', 'South Indian', 'Bengali', 'Street Food'].map((c) => (
                <li key={c}>
                  <span className="text-sm text-gray-400">{c}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
              About
            </h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              Every recipe is community-submitted and admin-reviewed to keep quality high.
              Zayka celebrates India's diverse culinary heritage.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Zayka. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            Made with <FiHeart className="text-red-500 text-[10px]" /> in India
          </p>
        </div>
      </div>
    </footer>
  );
}
