import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center animate-fade-in">
      <p className="text-8xl mb-4">🍽️</p>
      <h1 className="text-4xl font-extrabold font-heading text-text mb-3">
        404 — Page Not Found
      </h1>
      <p className="text-text-secondary text-base max-w-md mb-8">
        Looks like this recipe got lost in the kitchen! The page you're looking for doesn't exist.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link to="/"
          className="px-6 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary-dark transition-colors shadow-lg shadow-primary/25">
          Go Home
        </Link>
        <Link to="/dishes/veg"
          className="px-6 py-3 bg-white border border-border text-text font-semibold rounded-full hover:bg-page transition-colors">
          Browse Dishes
        </Link>
      </div>
    </div>
  );
}
