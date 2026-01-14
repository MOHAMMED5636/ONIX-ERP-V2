// ============================================
// AUTHENTICATION CONTEXT
// Dynamic user profile management
// ============================================

import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, logout as apiLogout, getToken } from '../services/authAPI';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user profile from API
  const fetchUserProfile = async () => {
    try {
      const token = getToken();
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
        setError(null);
        // Set localStorage items for backward compatibility with existing code
        localStorage.setItem('currentUser', JSON.stringify(response.data));
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', response.data.role);
        // Note: forcePasswordChange check is handled in Login component
      } else {
        setUser(null);
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userRole');
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setUser(null);
      setError(err.message || 'Failed to load user profile');
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
    } finally {
      setLoading(false);
    }
  };

  // Load user profile on mount and when token changes
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Login function - stores token and fetches user profile
  const login = async (token) => {
    try {
      localStorage.setItem('token', token);
      await fetchUserProfile();
    } catch (err) {
      console.error('Login error:', err);
      throw err;
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
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
  
  // Update user data directly (for immediate updates)
  const updateUserData = (userData) => {
    if (userData) {
      console.log('[AuthContext] Updating user data:', userData);
      console.log('[AuthContext] Old photo:', user?.photo);
      console.log('[AuthContext] New photo path:', userData.photo);
      
      // Update state immediately
      setUser(prevUser => {
        const updatedUser = { ...prevUser, ...userData };
        console.log('[AuthContext] Updated user object:', updatedUser);
        return updatedUser;
      });
      
      // Update localStorage
      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('isAuthenticated', 'true');
      if (userData.role) {
        localStorage.setItem('userRole', userData.role);
      }
      
      // Force a small delay to ensure state updates propagate
      setTimeout(() => {
        console.log('[AuthContext] User state updated, verifying photo:', userData.photo);
      }, 100);
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

