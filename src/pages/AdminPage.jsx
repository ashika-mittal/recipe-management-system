import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPendingRecipes, approveRecipe, rejectRecipe, deleteRecipe, getAllApprovedRecipes } from '../firebase/firestore';
import { formatCookingTime, timeAgo } from '../utils/helpers';
import { FiCheck, FiX, FiTrash2, FiClock, FiEye, FiShield, FiAlertCircle } from 'react-icons/fi';

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [p, a] = await Promise.all([
        getPendingRecipes(),
        getAllApprovedRecipes(),
      ]);
      setPending(p);
      setApproved(a);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await approveRecipe(id);
      await loadData();
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  };

  const handleReject = async () => {
    if (!rejectId) return;
    setActionLoading(rejectId);
    try {
      await rejectRecipe(rejectId, rejectReason);
      setRejectId(null);
      setRejectReason('');
      await loadData();
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  };

  const [deleteId, setDeleteId] = useState(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    setActionLoading(deleteId);
    try {
      await deleteRecipe(deleteId);
      setDeleteId(null);
      await loadData();
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">🔒</p>
        <h2 className="text-xl font-bold text-text mb-2">Access Denied</h2>
        <p className="text-text-secondary text-sm">You don't have admin privileges.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-accent-50 flex items-center justify-center">
          <FiShield className="text-accent text-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-heading text-text">Admin Dashboard</h1>
          <p className="text-sm text-text-secondary">Review, approve, or remove recipes.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon="⏳" label="Pending Review" value={pending.length} color="warning" />
        <StatCard icon="✅" label="Published" value={approved.length} color="success" />
        <StatCard icon="📊" label="Total" value={pending.length + approved.length} color="primary" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-border p-1 mb-6">
        <TabBtn active={tab === 'pending'} onClick={() => setTab('pending')}>
          <FiClock className="text-sm" /> Pending ({pending.length})
        </TabBtn>
        <TabBtn active={tab === 'approved'} onClick={() => setTab('approved')}>
          <FiCheck className="text-sm" /> Published ({approved.length})
        </TabBtn>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Reject modal */}
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-border p-6 w-full max-w-md animate-fade-in">
            <h3 className="text-lg font-bold font-heading text-text mb-3 flex items-center gap-2">
              <FiAlertCircle className="text-danger" /> Reject Recipe
            </h3>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (optional)…" rows={3}
              className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus-ring resize-none mb-4" />
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setRejectId(null); setRejectReason(''); }}
                className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-text-secondary hover:bg-page transition-colors">
                Cancel
              </button>
              <button onClick={handleReject} disabled={actionLoading === rejectId}
                className="px-4 py-2 bg-danger text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50">
                {actionLoading === rejectId ? 'Rejecting…' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-border p-6 w-full max-w-sm animate-fade-in">
            <h3 className="text-lg font-bold font-heading text-text mb-2 flex items-center gap-2">
              <FiTrash2 className="text-danger" /> Delete Recipe
            </h3>
            <p className="text-sm text-text-secondary mb-5">
              Are you sure you want to permanently delete this recipe? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)}
                className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-text-secondary hover:bg-page transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={actionLoading === deleteId}
                className="px-4 py-2 bg-danger text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50">
                {actionLoading === deleteId ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending tab */}
      {!loading && tab === 'pending' && (
        pending.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-border">
            <p className="text-4xl mb-3">🎉</p>
            <p className="text-text-secondary text-sm">All caught up! No pending recipes to review.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map(recipe => (
              <RecipeRow key={recipe.id} recipe={recipe} actionLoading={actionLoading}
                onApprove={handleApprove} onReject={(id) => setRejectId(id)} onDelete={(id) => setDeleteId(id)} isPending />
            ))}
          </div>
        )
      )}

      {/* Published tab */}
      {!loading && tab === 'approved' && (() => {
        if (approved.length === 0) {
          return (
            <div className="text-center py-16 bg-white rounded-xl border border-border">
              <p className="text-4xl mb-3">📝</p>
              <p className="text-text-secondary text-sm">No published recipes yet.</p>
            </div>
          );
        }

        // Group recipes by dish name
        const grouped = {};
        for (const recipe of approved) {
          const key = recipe.dishName || recipe.dishId || 'Other';
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(recipe);
        }
        // Sort dish names alphabetically
        const sortedDishes = Object.keys(grouped).sort();

        return (
          <div className="space-y-6">
            {sortedDishes.map(dishName => {
              const recipes = grouped[dishName];
              const isVeg = recipes[0]?.category === 'veg';
              return (
                <div key={dishName}>
                  <div className="flex items-center gap-3 mb-3 px-1">
                    <span className={`inline-block w-2.5 h-2.5 ${isVeg ? 'rounded-full bg-veg' : 'rounded-sm bg-nonveg'}`} />
                    <h3 className="text-base font-bold font-heading text-text">{dishName}</h3>
                    <span className="text-xs text-text-muted bg-page px-2 py-0.5 rounded-full">
                      {recipes.length} recipe{recipes.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {recipes.map(recipe => (
                      <RecipeRow key={recipe.id} recipe={recipe} actionLoading={actionLoading}
                        onDelete={(id) => setDeleteId(id)} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colorMap = {
    warning: 'bg-warning-light text-warning',
    success: 'bg-success-light text-success',
    primary: 'bg-primary-50 text-primary',
  };
  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <div className={`w-10 h-10 rounded-lg ${colorMap[color]} flex items-center justify-center text-lg mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold font-heading text-text">{value}</p>
      <p className="text-xs text-text-muted mt-0.5">{label}</p>
    </div>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 justify-center ${
        active ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-text hover:bg-page'
      }`}>
      {children}
    </button>
  );
}

function RecipeRow({ recipe, actionLoading, onApprove, onReject, onDelete, isPending }) {
  const isVeg = recipe.category === 'veg';
  const isLoading = actionLoading === recipe.id;

  return (
    <div className="bg-white rounded-xl border border-border p-4 flex flex-col sm:flex-row gap-4">
      {/* Thumbnail */}
      <Link to={`/recipe/${recipe.id}`} className="sm:w-32 sm:h-24 aspect-video sm:aspect-auto rounded-lg overflow-hidden bg-border-light shrink-0 block">
        <img src={recipe.imageUrl} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={isVeg ? 'badge-veg' : 'badge-nonveg'}>{isVeg ? '● Veg' : '■ Non-Veg'}</span>
          <span className="text-xs text-text-muted capitalize">{recipe.difficulty}</span>
        </div>
        <Link to={`/recipe/${recipe.id}`} className="text-base font-bold font-heading text-text hover:text-primary transition-colors truncate block">
          {recipe.title}
        </Link>
        <p className="text-xs text-text-secondary line-clamp-1 mt-0.5">{recipe.description}</p>
        <div className="flex items-center gap-4 text-xs text-text-muted mt-2">
          <span className="flex items-center gap-1"><FiClock /> {formatCookingTime(recipe.totalTime)}</span>
          <span>by {recipe.authorName}</span>
          <span>{timeAgo(recipe.createdAt)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex sm:flex-col items-center gap-2 shrink-0">
        {isPending && onApprove && (
          <button onClick={() => onApprove(recipe.id)} disabled={isLoading}
            className="flex items-center gap-1 px-3 py-1.5 bg-success-light text-success rounded-lg text-xs font-semibold hover:bg-success hover:text-white transition-colors disabled:opacity-50"
            title="Approve">
            <FiCheck /> Approve
          </button>
        )}
        {isPending && onReject && (
          <button onClick={() => onReject(recipe.id)} disabled={isLoading}
            className="flex items-center gap-1 px-3 py-1.5 bg-warning-light text-warning rounded-lg text-xs font-semibold hover:bg-warning hover:text-white transition-colors disabled:opacity-50"
            title="Reject">
            <FiX /> Reject
          </button>
        )}
        <button onClick={() => onDelete(recipe.id)} disabled={isLoading}
          className="flex items-center gap-1 px-3 py-1.5 bg-danger-light text-danger rounded-lg text-xs font-semibold hover:bg-danger hover:text-white transition-colors disabled:opacity-50"
          title="Delete">
          <FiTrash2 /> Delete
        </button>
        <Link to={`/recipe/${recipe.id}`}
          className="flex items-center gap-1 px-3 py-1.5 border border-border text-text-secondary rounded-lg text-xs font-medium hover:border-primary hover:text-primary transition-colors">
          <FiEye /> View
        </Link>
      </div>
    </div>
  );
}
