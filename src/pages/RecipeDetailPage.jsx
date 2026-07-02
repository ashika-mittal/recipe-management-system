import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRecipeById, toggleLike, hasUserLiked, toggleBookmark, rateRecipe, getUserRating, addComment, getComments, deleteComment } from '../firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { CUISINE_TYPES, CATEGORY_LABELS } from '../utils/constants';
import { formatCookingTime, timeAgo, getInitials, getAvatarColor } from '../utils/helpers';
import {
  FiChevronRight, FiClock, FiUsers, FiStar, FiHeart,
  FiBookmark, FiSend, FiTrash2, FiCornerDownRight,
} from 'react-icons/fi';

export default function RecipeDetailPage() {
  const { recipeId } = useParams();
  const { currentUser, userData, isAdmin, refreshUserData } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const r = await getRecipeById(recipeId);
        setRecipe(r);
        if (currentUser && r) {
          const [l, ur, c] = await Promise.all([
            hasUserLiked(recipeId, currentUser.uid),
            getUserRating(recipeId, currentUser.uid),
            getComments(recipeId),
          ]);
          setLiked(l);
          setUserRating(ur);
          setComments(c);
          setBookmarked(userData?.bookmarks?.includes(recipeId) || false);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, [recipeId, currentUser]);

  const handleLike = async () => {
    const result = await toggleLike(recipeId, currentUser.uid);
    setLiked(result);
    setRecipe((r) => ({ ...r, likesCount: r.likesCount + (result ? 1 : -1) }));
  };

  const handleBookmark = async () => {
    const result = await toggleBookmark(currentUser.uid, recipeId);
    setBookmarked(result);
    await refreshUserData();
  };

  const handleRate = async (rating) => {
    const result = await rateRecipe(recipeId, currentUser.uid, rating);
    setUserRating(rating);
    setRecipe((r) => ({ ...r, averageRating: result.averageRating, ratingsCount: result.ratingsCount }));
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await addComment(recipeId, {
      text: commentText.trim(),
      authorId: currentUser.uid,
      authorName: userData?.displayName || 'Anonymous',
      parentCommentId: null,
    });
    setCommentText('');
    const c = await getComments(recipeId);
    setComments(c);
    setRecipe((r) => ({ ...r, commentsCount: (r.commentsCount || 0) + 1 }));
  };

  const handleReply = async (parentId) => {
    if (!replyText.trim()) return;
    await addComment(recipeId, {
      text: replyText.trim(),
      authorId: currentUser.uid,
      authorName: userData?.displayName || 'Anonymous',
      parentCommentId: parentId,
    });
    setReplyText('');
    setReplyTo(null);
    const c = await getComments(recipeId);
    setComments(c);
    setRecipe((r) => ({ ...r, commentsCount: (r.commentsCount || 0) + 1 }));
  };

  const handleDeleteComment = async (commentId) => {
    await deleteComment(commentId, recipeId);
    const c = await getComments(recipeId);
    setComments(c);
    setRecipe((r) => ({ ...r, commentsCount: Math.max((r.commentsCount || 0) - 1, 0) }));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">🍽️</p>
        <h2 className="text-xl font-bold text-text mb-2">Recipe not found</h2>
        <Link to="/" className="text-primary hover:underline text-sm">Go home</Link>
      </div>
    );
  }

  const isVeg = recipe.category === 'veg';
  const cuisineLabel = CUISINE_TYPES.find((c) => c.value === recipe.cuisine)?.label || recipe.cuisine;

  // Build nested comment tree
  const topLevel = comments.filter((c) => !c.parentCommentId);
  const replies = comments.filter((c) => c.parentCommentId);
  const getReplies = (parentId) => replies.filter((r) => r.parentCommentId === parentId);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-muted mb-6 flex-wrap">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <FiChevronRight className="text-xs" />
        <Link to={`/dishes/${recipe.category}`} className="hover:text-primary transition-colors">
          {CATEGORY_LABELS[recipe.category]}
        </Link>
        <FiChevronRight className="text-xs" />
        <span className="text-text font-medium truncate">{recipe.title}</span>
      </div>

      {/* Hero image */}
      <div className="rounded-2xl overflow-hidden mb-8 aspect-[16/7] bg-border-light">
        <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
      </div>

      {/* Title & meta */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className={isVeg ? 'badge-veg' : 'badge-nonveg'}>
            {isVeg ? '● Veg' : '■ Non-Veg'}
          </span>
          <span className="text-xs text-text-muted bg-page px-2 py-0.5 rounded-full">{cuisineLabel}</span>
          <span className="text-xs text-text-muted bg-page px-2 py-0.5 rounded-full capitalize">{recipe.difficulty}</span>
        </div>
        <h1 className="text-3xl font-bold font-heading text-text mb-2">{recipe.title}</h1>
        <p className="text-text-secondary leading-relaxed mb-4">{recipe.description}</p>

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-5 text-sm text-text-muted">
          <span className="flex items-center gap-1.5"><FiClock /> Prep: {formatCookingTime(recipe.prepTime)}</span>
          <span className="flex items-center gap-1.5"><FiClock /> Cook: {formatCookingTime(recipe.cookTime)}</span>
          <span className="flex items-center gap-1.5"><FiUsers /> {recipe.servings} servings</span>
          <span className="flex items-center gap-1.5"><FiStar className="text-warning" /> {recipe.averageRating} ({recipe.ratingsCount})</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mb-10 pb-8 border-b border-border">
        <button onClick={handleLike}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${liked ? 'bg-danger-light text-danger border-danger' : 'border-border text-text-secondary hover:border-primary hover:text-primary'}`}>
          <FiHeart className={liked ? 'fill-current' : ''} /> {recipe.likesCount}
        </button>
        <button onClick={handleBookmark}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${bookmarked ? 'bg-warning-light text-warning border-warning' : 'border-border text-text-secondary hover:border-primary hover:text-primary'}`}>
          <FiBookmark className={bookmarked ? 'fill-current' : ''} /> {bookmarked ? 'Saved' : 'Save'}
        </button>
      </div>

      {/* Ingredients */}
      <section className="mb-10">
        <h2 className="text-xl font-bold font-heading text-text mb-4">Ingredients</h2>
        <div className="bg-white rounded-xl border border-border p-5">
          <ul className="space-y-2.5">
            {recipe.ingredients?.map((ing, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="w-5 h-5 rounded-full bg-primary-50 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                <span className="text-text">{ing}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Instructions */}
      <section className="mb-10">
        <h2 className="text-xl font-bold font-heading text-text mb-4">Instructions</h2>
        <div className="space-y-4">
          {recipe.instructions?.map((step, i) => (
            <div key={i} className="flex gap-4 bg-white rounded-xl border border-border p-5">
              <span className="w-8 h-8 rounded-full gradient-primary text-white text-sm font-bold flex items-center justify-center shrink-0">{i + 1}</span>
              <p className="text-sm text-text leading-relaxed pt-1">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tips */}
      {recipe.tips && (
        <section className="mb-10 bg-warning-light/50 rounded-xl p-5 border border-warning/20">
          <h3 className="font-bold text-sm text-text mb-1">💡 Chef's Tips</h3>
          <p className="text-sm text-text-secondary">{recipe.tips}</p>
        </section>
      )}

      {/* Rating */}
      <section className="mb-10">
        <h2 className="text-xl font-bold font-heading text-text mb-4">Rate this Recipe</h2>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} onClick={() => handleRate(star)}
              className="text-2xl transition-colors">
              <FiStar className={`${(hoverRating || userRating) >= star ? 'fill-current text-warning' : 'text-border'}`} />
            </button>
          ))}
          {userRating > 0 && <span className="ml-2 text-sm text-text-muted">You rated {userRating}/5</span>}
        </div>
      </section>

      {/* Comments */}
      <section>
        <h2 className="text-xl font-bold font-heading text-text mb-4">
          Comments ({recipe.commentsCount || 0})
        </h2>

        <form onSubmit={handleComment} className="flex gap-3 mb-6">
          <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment…"
            className="flex-1 border border-border rounded-lg px-4 py-2.5 text-sm focus-ring" />
          <button type="submit" className="px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors">
            <FiSend />
          </button>
        </form>

        <div className="space-y-4">
          {topLevel.map((c) => (
            <CommentItem key={c.id} comment={c} replies={getReplies(c.id)} currentUserId={currentUser?.uid} isAdmin={isAdmin}
              replyTo={replyTo} setReplyTo={setReplyTo} replyText={replyText} setReplyText={setReplyText}
              onReply={handleReply} onDelete={handleDeleteComment} />
          ))}
          {topLevel.length === 0 && (
            <p className="text-sm text-text-muted text-center py-8">No comments yet. Be the first!</p>
          )}
        </div>
      </section>
    </div>
  );
}

function CommentItem({ comment, replies, currentUserId, isAdmin, replyTo, setReplyTo, replyText, setReplyText, onReply, onDelete }) {
  const canDelete = currentUserId === comment.authorId || isAdmin;
  const initials = getInitials(comment.authorName);
  const bg = getAvatarColor(comment.authorName);

  return (
    <div className="bg-white rounded-xl border border-border p-4">
      <div className="flex items-start gap-3">
        <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: bg }}>{initials}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-text">{comment.authorName}</span>
            <span className="text-xs text-text-muted">{timeAgo(comment.createdAt)}</span>
          </div>
          <p className="text-sm text-text-secondary">{comment.text}</p>
          <div className="flex items-center gap-3 mt-2">
            <button onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)} className="text-xs text-text-muted hover:text-primary transition-colors">Reply</button>
            {canDelete && (
              <button onClick={() => onDelete(comment.id)} className="text-xs text-text-muted hover:text-danger transition-colors flex items-center gap-1">
                <FiTrash2 className="text-[10px]" /> Delete
              </button>
            )}
          </div>
          {replyTo === comment.id && (
            <div className="flex gap-2 mt-3">
              <input value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write a reply…"
                className="flex-1 border border-border rounded-lg px-3 py-2 text-sm focus-ring" />
              <button onClick={() => onReply(comment.id)} className="px-3 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-dark transition-colors">Reply</button>
            </div>
          )}
          {/* Nested replies */}
          {replies.length > 0 && (
            <div className="mt-3 pl-4 border-l-2 border-border-light space-y-3">
              {replies.map((r) => (
                <div key={r.id} className="flex items-start gap-2">
                  <FiCornerDownRight className="text-text-muted text-xs mt-1 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-text">{r.authorName}</span>
                      <span className="text-[10px] text-text-muted">{timeAgo(r.createdAt)}</span>
                    </div>
                    <p className="text-xs text-text-secondary">{r.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
