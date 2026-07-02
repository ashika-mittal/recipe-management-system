import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { signOutUser } from '../../firebase/auth';
import {
  FiSearch, FiUser, FiLogOut, FiPlus, FiShield,
  FiBookmark, FiChevronDown,
} from 'react-icons/fi';
import { getInitials, getAvatarColor } from '../../utils/helpers';

export default function Navbar() {
  const { isAuthenticated, isAdmin, userData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await signOutUser();
    setMenuOpen(false);
    navigate('/login');
  };

  const avatarInitials = userData?.displayName
    ? getInitials(userData.displayName)
    : '?';
  const avatarBg = userData?.displayName
    ? getAvatarColor(userData.displayName)
    : '#E8590C';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">

        {/* ─── Logo ─── */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <span className="text-2xl">🍛</span>
          <span className="text-xl font-extrabold font-heading tracking-tight text-text">
            Zayka
          </span>
        </Link>

        {/* ─── Centre: Search ─── */}
        {isAuthenticated && (
          <form
            onSubmit={handleSearch}
            className="hidden md:block flex-1 max-w-md mx-8"
          >
            <div className="relative">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-sm" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dishes, ingredients…"
                className="w-full pl-10 pr-4 py-2 bg-page rounded-full border border-border text-sm text-text placeholder:text-text-muted focus-ring focus:border-primary transition-colors"
              />
            </div>
          </form>
        )}

        {/* ─── Right side ─── */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {/* Nav links — desktop */}
              <nav className="hidden lg:flex items-center gap-1 mr-2">
                <NavLink to="/dishes/veg" active={location.pathname === '/dishes/veg'}>
                  <span className="inline-block w-2 h-2 rounded-full bg-veg" />
                  Veg
                </NavLink>
                <NavLink to="/dishes/non-veg" active={location.pathname === '/dishes/non-veg'}>
                  <span className="inline-block w-2 h-2 rounded-sm bg-nonveg" />
                  Non‑Veg
                </NavLink>
              </nav>

              {/* Add Recipe CTA */}
              <Link
                to="/submit-recipe"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors shadow-sm"
              >
                <FiPlus className="text-base" />
                Add Recipe
              </Link>

              {/* Admin shortcut */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="hidden sm:inline-flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium text-accent hover:bg-accent-50 transition-colors"
                >
                  <FiShield className="text-base" />
                  Admin
                </Link>
              )}

              {/* Profile dropdown */}
              <div className="relative ml-1" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 rounded-full p-1 hover:bg-page transition-colors focus-ring"
                >
                  {userData?.avatarUrl ? (
                    <img
                      src={userData.avatarUrl}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-border"
                    />
                  ) : (
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: avatarBg }}
                    >
                      {avatarInitials}
                    </span>
                  )}
                  <FiChevronDown
                    className={`text-text-secondary text-sm transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-border py-1 animate-fade-in">
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-border-light">
                      <p className="font-semibold text-sm text-text truncate">
                        {userData?.displayName}
                      </p>
                      <p className="text-xs text-text-muted truncate">
                        {userData?.email}
                      </p>
                    </div>

                    <DropdownItem
                      to={`/profile/${userData?.uid}`}
                      icon={<FiUser />}
                      onClick={() => setMenuOpen(false)}
                    >
                      My Profile
                    </DropdownItem>
                    <DropdownItem
                      to={`/profile/${userData?.uid}?tab=bookmarks`}
                      icon={<FiBookmark />}
                      onClick={() => setMenuOpen(false)}
                    >
                      Bookmarks
                    </DropdownItem>

                    {isAdmin && (
                      <DropdownItem
                        to="/admin"
                        icon={<FiShield />}
                        onClick={() => setMenuOpen(false)}
                      >
                        Admin Dashboard
                      </DropdownItem>
                    )}

                    <div className="border-t border-border-light my-1" />

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-danger hover:bg-danger-light transition-colors"
                    >
                      <FiLogOut className="text-base" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-full text-sm font-medium text-text hover:bg-page transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors shadow-sm"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ─── Mobile search ─── */}
      {isAuthenticated && (
        <form onSubmit={handleSearch} className="md:hidden px-4 pb-3">
          <div className="relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-sm" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes, ingredients…"
              className="w-full pl-10 pr-4 py-2 bg-page rounded-full border border-border text-sm text-text placeholder:text-text-muted focus-ring focus:border-primary transition-colors"
            />
          </div>
        </form>
      )}
    </header>
  );
}

/* ── Tiny helper components ── */

function NavLink({ to, active, children }) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
        active
          ? 'bg-primary-50 text-primary'
          : 'text-text-secondary hover:text-text hover:bg-page'
      }`}
    >
      {children}
    </Link>
  );
}

function DropdownItem({ to, icon, children, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text hover:bg-page transition-colors"
    >
      <span className="text-text-muted text-base">{icon}</span>
      {children}
    </Link>
  );
}
