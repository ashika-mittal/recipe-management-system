// ============================================
// 🔐 Authentication Context
// ============================================

import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getUserData } from '../firebase/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // Fetch user data from Firestore (includes role, bookmarks, etc.)
        const data = await getUserData(user.uid);
        setUserData(data);
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  /**
   * Refresh user data from Firestore
   * Call this after profile updates, bookmark changes, etc.
   */
  async function refreshUserData() {
    if (currentUser) {
      const data = await getUserData(currentUser.uid);
      setUserData(data);
    }
  }

  const value = {
    currentUser,
    userData,
    loading,
    isAdmin: userData?.role === 'admin',
    isAuthenticated: !!currentUser,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
