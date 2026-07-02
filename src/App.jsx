// ============================================
// 🍽️ Zayka — Main App Component
// ============================================

import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import { autoSeedIfEmpty } from './data/seedRunner';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DishListingPage from './pages/DishListingPage';
import DishDetailPage from './pages/DishDetailPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import SubmitRecipePage from './pages/SubmitRecipePage';
import SearchResultsPage from './pages/SearchResultsPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  // Auto-seed database on first load if empty
  useEffect(() => {
    autoSeedIfEmpty();
  }, []);
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-page-warm">
          <Navbar />

          <main className="flex-1">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* Protected routes */}
              <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
              <Route path="/dishes/:category" element={<ProtectedRoute><DishListingPage /></ProtectedRoute>} />
              <Route path="/dish/:dishId" element={<ProtectedRoute><DishDetailPage /></ProtectedRoute>} />
              <Route path="/recipe/:recipeId" element={<ProtectedRoute><RecipeDetailPage /></ProtectedRoute>} />
              <Route path="/submit-recipe" element={<ProtectedRoute><SubmitRecipePage /></ProtectedRoute>} />
              <Route path="/search" element={<ProtectedRoute><SearchResultsPage /></ProtectedRoute>} />
              <Route path="/profile/:userId" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

              {/* Admin-only */}
              <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />

              {/* 404 catch-all */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}
