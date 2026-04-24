// ============================================
// AUTHENTICATION CONTEXT
// Dynamic user profile management
// ============================================

import { createContext, useContext, useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { getCurrentUser, logout as apiLogout, getToken } from '../services/authAPI';
import * as authStorage from '../utils/authStorage';
import { enrichUserFromToken } from '../utils/jwtPayload';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user profile from API. Per-tab token from sessionStorage.
  const fetchUserProfile = async () => {
    try {
      authStorage.removeAuthItem('currentUser');
      authStorage.removeAuthItem('isAuthenticated');
      authStorage.removeAuthItem('userRole');

      const token = getToken();
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await getCurrentUser(token);
      if (response.success && response.data) {
        flushSync(() => {
          setUser(response.data);
          setError(null);
        });
        authStorage.setAuthItem('currentUser', response.data);
        authStorage.setAuthItem('isAuthenticated', 'true');
        authStorage.setAuthItem('userRole', response.data.role);
      } else {
        setUser(null);
        authStorage.clearAuth();
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setUser(null);
      setError(err.message || 'Failed to load user profile');
      authStorage.clearAuth();
    } finally {
      setLoading(false);
    }
  };

  // Load user profile on mount and when token changes
  useEffect(() => {
    fetchUserProfile();
  }, []);

  /**
   * Stores token and loads full profile from GET /auth/me.
   * Optional `snapshotUser` from the login response is applied synchronously so PrivateRoute
   * does not redirect back to /login before React commits context (fixes HR/admin login flash).
   * If /me fails after a successful login (network/500), we keep the snapshot session instead of
   * clearing the token — getCurrentUser otherwise called clearAuth() and locked everyone out.
   */
  const login = async (token, snapshotUser = null) => {
    try {
      authStorage.clearAuth();
      authStorage.setToken(token);
      const mergedUser = enrichUserFromToken(snapshotUser, token);
      const hasSnapshot = mergedUser && mergedUser.role != null;
      if (hasSnapshot) {
        flushSync(() => {
          setUser(mergedUser);
          setError(null);
          setLoading(false);
        });
        authStorage.setAuthItem('currentUser', mergedUser);
        authStorage.setAuthItem('isAuthenticated', 'true');
        authStorage.setAuthItem('userRole', mergedUser.role);
      }
      try {
        const response = await getCurrentUser(getToken(), {
          clearStorageOnError: !hasSnapshot,
        });
        if (response.success && response.data) {
          flushSync(() => {
            setUser(response.data);
            setError(null);
          });
          authStorage.setAuthItem('currentUser', response.data);
          authStorage.setAuthItem('isAuthenticated', 'true');
          authStorage.setAuthItem('userRole', response.data.role);
        }
      } catch (meErr) {
        console.error('GET /auth/me after login failed:', meErr);
        if (!hasSnapshot) {
          authStorage.clearAuth();
          setUser(null);
          throw meErr;
        }
        setError(meErr.message || 'Could not sync full profile; you are still signed in.');
      }
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await apiLogout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setError(null);
      authStorage.clearAuth();
    }
  };

  // Refresh user profile
  const refreshUser = async () => {
    setLoading(true);
    try {
      await fetchUserProfile();
      // Add small delay to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Error refreshing user:', error);
      setLoading(false);
    }
  };
  
  // Update user data directly (for immediate updates, e.g. after profile photo save)
  const updateUserData = (userData) => {
    if (userData) {
      setUser(prevUser => {
        const updatedUser = { ...prevUser, ...userData };
        if (userData.photo !== undefined) {
          updatedUser.photo = userData.photo;
        }
        authStorage.setAuthItem('currentUser', updatedUser);
        authStorage.setAuthItem('isAuthenticated', 'true');
        if (updatedUser.role) {
          authStorage.setAuthItem('userRole', updatedUser.role);
        }
        return updatedUser;
      });
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    refreshUser,
    updateUserData,
    isAuthenticated: !!user && !!getToken(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

