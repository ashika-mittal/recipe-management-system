// ============================================
// 🍽️ Helper Utilities
// ============================================

/**
 * Format a Firestore timestamp or ISO date string to a human-readable "time ago" format
 */
export function timeAgo(timestamp) {
  if (!timestamp) return '';

  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }

  return 'just now';
}

/**
 * Format cooking time in minutes to a human-readable string
 */
export function formatCookingTime(minutes) {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Truncate text to a given length with ellipsis
 */
export function truncate(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Generate a URL-friendly slug from a string
 */
export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Capitalize first letter of each word
 */
export function titleCase(text) {
  if (!text) return '';
  return text.replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Get initials from a name (for avatar fallback)
 */
export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Format a number with K/M suffix
 */
export function formatCount(count) {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count?.toString() || '0';
}

/**
 * Generate a random pastel color for user avatars
 */
export function getAvatarColor(name) {
  const colors = [
    '#FF6B35', '#2EC4B6', '#E63946', '#4CAF50',
    '#FFB800', '#9B59B6', '#3498DB', '#E74C3C',
    '#1ABC9C', '#F39C12', '#2ECC71', '#E91E63',
  ];
  const index = name ? name.charCodeAt(0) % colors.length : 0;
  return colors[index];
}

/**
 * Debounce function for search input
 */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
