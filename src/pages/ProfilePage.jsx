import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserData } from '../firebase/auth';
import { getUserRecipes, getBookmarkedRecipes } from '../firebase/firestore';
import { uploadAvatar } from '../firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { RECIPE_STATUS } from '../utils/constants';
import { formatCookingTime, timeAgo, getInitials, getAvatarColor } from '../utils/helpers';
import {
  FiClock, FiStar, FiHeart, FiBookmark, FiFileText,
  FiCamera, FiEdit2, FiCheck, FiX, FiChevronRight
} from 'react-icons/fi';

export default function ProfilePage() {
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const { currentUser, userData: ownData, refreshUserData } = useAuth();

  const [profile, setProfile] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [bookmarkedRecipes, setBookmarkedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(searchParams.get('tab') || 'recipes');

  // Avatar upload
  const avatarInputRef = useRef(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Name editing
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  const isOwn = currentUser?.uid === userId;

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const user = isOwn ? ownData : await getUserData(userId);
        setProfile(user);

        const userRecipes = await getUserRecipes(userId);
        setRecipes(userRecipes);

        if (isOwn && user?.bookmarks?.length > 0) {
          const bm = await getBookmarkedRecipes(user.bookmarks);
          setBookmarkedRecipes(bm);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, [userId, isOwn, ownData]);

  // Avatar upload handler
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !isOwn) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5MB.');
      return;
    }

    setAvatarUploading(true);
    try {
      const url = await uploadAvatar(file, userId);
      await updateDoc(doc(db, 'users', userId), { avatarUrl: url });
      await refreshUserData();
      setProfile(prev => ({ ...prev, avatarUrl: url }));
    } catch (err) {
      console.error(err);
      alert('Upload failed. Please try again.');
    } finally {
      setAvatarUploading(false);
    }
  };

  // Name update handler
  const handleNameSave = async () => {
    if (!newName.trim() || newName.trim() === profile.displayName) {
      setEditingName(false);
      return;
    }
    try {
      await updateDoc(doc(db, 'users', userId), { displayName: newName.trim() });
      await refreshUserData();
      setProfile(prev => ({ ...prev, displayName: newName.trim() }));
      setEditingName(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update name.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">👤</p>
        <h2 className="text-xl font-bold text-text mb-2">User not found</h2>
        <Link to="/" className="text-primary hover:underline text-sm">Go home</Link>
      </div>
    );
  }

  const initials = getInitials(profile.displayName);
  const bg = getAvatarColor(profile.displayName);
  const approvedRecipes = recipes.filter(r => r.status === RECIPE_STATUS.APPROVED);
  const pendingRecipes = recipes.filter(r => r.status === RECIPE_STATUS.PENDING);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden mb-8 animate-fade-in">
        <div className="h-32 gradient-hero" />
        <div className="px-6 pb-6 -mt-12">
          <div className="flex items-end gap-5 mb-5">
            {/* Avatar with upload */}
            <div className="relative group">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt=""
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-lg" />
              ) : (
                <span className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white ring-4 ring-white shadow-lg"
                  style={{ backgroundColor: bg }}>
                  {initials}
                </span>
              )}
              {isOwn && (
                <>
                  <button onClick={() => avatarInputRef.current?.click()}
                    disabled={avatarUploading}
                    className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                    {avatarUploading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FiCamera className="text-white text-xl" />
                    )}
                  </button>
                  <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarUpload}
                    className="hidden" />
                </>
              )}
            </div>

            {/* Name + email */}
            <div className="pb-1 flex-1">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                    className="text-2xl font-bold font-heading text-text border border-border rounded-lg px-3 py-1 focus-ring"
                    autoFocus onKeyDown={(e) => e.key === 'Enter' && handleNameSave()} />
                  <button onClick={handleNameSave} className="p-1.5 rounded-lg bg-success-light text-success hover:bg-success hover:text-white transition-colors">
                    <FiCheck />
                  </button>
                  <button onClick={() => setEditingName(false)} className="p-1.5 rounded-lg bg-danger-light text-danger hover:bg-danger hover:text-white transition-colors">
                    <FiX />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold font-heading text-text">{profile.displayName}</h1>
                  {isOwn && (
                    <button onClick={() => { setNewName(profile.displayName); setEditingName(true); }}
                      className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary-50 transition-colors">
                      <FiEdit2 className="text-sm" />
                    </button>
                  )}
                </div>
              )}
              <p className="text-sm text-text-muted mt-0.5">{profile.email}</p>
              {profile.role === 'admin' && (
                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-accent-50 text-accent text-xs font-semibold">
                  🛡️ Admin
                </span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-8 text-sm">
            <Stat value={approvedRecipes.length} label="Recipes" />
            {isOwn && <Stat value={bookmarkedRecipes.length} label="Bookmarks" />}
            {isOwn && <Stat value={pendingRecipes.length} label="Pending" />}
            <Stat value={profile.createdAt ? timeAgo(profile.createdAt) : '—'} label="Joined" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-border p-1 mb-6">
        <TabBtn active={tab === 'recipes'} onClick={() => setTab('recipes')} icon={<FiFileText />}>
          My Recipes ({approvedRecipes.length})
        </TabBtn>
        {isOwn && pendingRecipes.length > 0 && (
          <TabBtn active={tab === 'pending'} onClick={() => setTab('pending')} icon={<FiClock />}>
            Pending ({pendingRecipes.length})
          </TabBtn>
        )}
        {isOwn && (
          <TabBtn active={tab === 'bookmarks'} onClick={() => setTab('bookmarks')} icon={<FiBookmark />}>
            Bookmarks ({bookmarkedRecipes.length})
          </TabBtn>
        )}
      </div>

      {/* Tab content */}
      {tab === 'recipes' && (
        <RecipeGrid recipes={approvedRecipes} emptyMsg="No published recipes yet." emptyIcon="📝"
          emptyCta={isOwn ? { label: 'Submit Your First Recipe', to: '/submit-recipe' } : null} />
      )}
      {tab === 'pending' && isOwn && (
        <RecipeGrid recipes={pendingRecipes} emptyMsg="No pending recipes." emptyIcon="⏳" showStatus />
      )}
      {tab === 'bookmarks' && isOwn && (
        <RecipeGrid recipes={bookmarkedRecipes} emptyMsg="No bookmarks yet. Start exploring!" emptyIcon="🔖"
          emptyCta={{ label: 'Browse Dishes', to: '/dishes/veg' }} />
      )}
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <p className="font-bold text-text text-lg">{value}</p>
      <p className="text-xs text-text-muted">{label}</p>
    </div>
  );
}

function TabBtn({ active, onClick, icon, children }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex-1 justify-center ${
        active ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-text hover:bg-page'
      }`}>
      {icon} {children}
    </button>
  );
}

function RecipeGrid({ recipes, emptyMsg, emptyIcon, showStatus, emptyCta }) {
  if (recipes.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-border">
        <p className="text-4xl mb-3">{emptyIcon}</p>
        <p className="text-text-secondary text-sm mb-4">{emptyMsg}</p>
        {emptyCta && (
          <Link to={emptyCta.to}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white rounded-full text-sm font-semibold hover:bg-primary-dark transition-colors">
            {emptyCta.label} <FiChevronRight />
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {recipes.map((recipe, i) => (
        <Link key={recipe.id} to={`/recipe/${recipe.id}`}
          className="group bg-white rounded-xl border border-border overflow-hidden card-lift animate-fade-in-up"
          style={{ animationDelay: `${i * 0.05}s` }}>
          <div className="aspect-[16/10] overflow-hidden bg-border-light">
            <img src={recipe.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
          </div>
          <div className="p-4">
            {showStatus && (
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-warning-light text-warning mb-2 uppercase tracking-wide">
                {recipe.status}
              </span>
            )}
            <h3 className="text-base font-bold font-heading text-text group-hover:text-primary transition-colors mb-1 truncate">
              {recipe.title || recipe.dishName}
            </h3>
            <div className="flex items-center gap-3 text-xs text-text-muted mt-2">
              <span className="flex items-center gap-1"><FiClock /> {formatCookingTime(recipe.totalTime)}</span>
              <span className="flex items-center gap-1"><FiStar className="text-warning" /> {recipe.averageRating || '—'}</span>
              <span className="flex items-center gap-1"><FiHeart className="text-danger" /> {recipe.likesCount || 0}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
