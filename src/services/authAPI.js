// Authentication API service for backend connection
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://onix-erp-v2-backend-2.onrender.com/api';

// Helper function to add timeout to fetch requests
const fetchWithTimeout = (url, options, timeout = 10000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout - server took too long to respond')), timeout)
    )
  ]);
};

/**
 * Login user with email, password, and role
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} role - User role (ADMIN, TENDER_ENGINEER, PROJECT_MANAGER, CONTRACTOR)
 * @returns {Promise} Login response with token and user data
 */

export const login = async (email, password, role) => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password, role }),
    }, 10000); // 10 second timeout

    // Check if response is ok before parsing JSON
    if (!response.ok) {
      let errorMessage = 'Login failed';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();

    // Store only token in localStorage (user profile will be fetched via /auth/me)
    if (data.success && data.data && data.data.token) {
      localStorage.setItem('token', data.data.token);
      // Remove any existing user data to ensure fresh fetch
      localStorage.removeItem('user');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    // Provide more specific error messages
    if (error.message.includes('timeout')) {
      throw new Error('Connection timeout - please check if backend is running on port 3001');
    } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Cannot connect to server - make sure backend is running on http://localhost:3001');
    }
    throw error;
  }
};

/**
 * Get current authenticated user from backend
 * @returns {Promise} User data
 */
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      // Token invalid, clear storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
      throw new Error(data.message || 'Failed to get current user');
    }

    // Don't store user data here - AuthContext will manage it
    // User data is fetched dynamically and stored in context state

    return data;
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
};

/**
 * Logout user (calls backend endpoint and clears localStorage)
 */
export const logout = async () => {
  try {
    const token = localStorage.getItem('token');
    
    // Call backend logout endpoint if token exists
    if (token) {
      try {
        await fetchWithTimeout(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }, 5000); // 5 second timeout for logout
      } catch (error) {
        // Even if backend call fails, still clear local storage
        console.error('Logout API error:', error);
      }
    }
    
    // Clear all local storage items
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    
    // Redirect to login page
    window.location.href = '/login';
  } catch (error) {
    console.error('Logout error:', error);
    // Still clear storage and redirect even if there's an error
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    window.location.href = '/login';
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

/**
 * Get stored token
 * @returns {string|null}
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Get stored user
 * @returns {object|null}
 */
export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

/**
 * Make authenticated API request (helper function)
 * @param {string} endpoint - API endpoint (e.g., '/clients')
 * @param {object} options - Fetch options
 * @returns {Promise}
 */
export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    credentials: 'include',
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, defaultOptions);
    const data = await response.json();

    if (!response.ok) {
      // If unauthorized, clear token and redirect to login
      if (response.status === 401) {
        logout();
      }
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

/**
 * Change password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise}
 */
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to change password');
    }

    return data;
  } catch (error) {
    console.error('Change password error:', error);
    throw error;
  }
};

/**
 * Reset password (Admin/HR only)
 * @param {string} userId - User ID
 * @param {string} newPassword - New temporary password
 * @returns {Promise}
 */
export const resetPassword = async (userId, newPassword) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_BASE_URL}/auth/reset-password/${userId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to reset password');
    }

    return data;
  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  }
};

/**
 * Create new employee
 * @param {object} employeeData - Employee data
 * @returns {Promise}
 */
export const createEmployee = async (employeeData) => {
  return apiRequest('/employees', {
    method: 'POST',
    body: JSON.stringify(employeeData),
  });
};

/**
 * Get all employees
 * @param {object} params - Query parameters (page, limit, search, role, department)
 * @returns {Promise}
 */
export const getEmployees = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/employees?${query}`);
};

/**
 * Get employee by ID
 * @param {string} id - Employee ID
 * @returns {Promise}
 */
export const getEmployeeById = async (id) => {
  return apiRequest(`/employees/${id}`);
};

/**
 * Update employee
 * @param {string} id - Employee ID
 * @param {object} employeeData - Updated employee data
 * @returns {Promise}
 */
export const updateEmployee = async (id, employeeData) => {
  return apiRequest(`/employees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(employeeData),
  });
};

/**
 * Delete/Deactivate employee
 * @param {string} id - Employee ID
 * @returns {Promise}
 */
export const deleteEmployee = async (id) => {
  return apiRequest(`/employees/${id}`, {
    method: 'DELETE',
  });
};

/**
 * Update user profile (photo and jobTitle)
 * @param {FormData} formData - FormData containing photo (file) and/or jobTitle (string)
 * @returns {Promise}
 */
export const updateProfile = async (formData) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type - browser will set it with boundary for FormData
      },
      credentials: 'include',
      body: formData, // FormData object
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update profile');
    }

    return data;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};

/**
 * Create employee with photo upload
 * @param {FormData} formData - FormData containing employee data and optional photo
 * @returns {Promise}
 */
export const createEmployeeWithPhoto = async (formData) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_BASE_URL}/employees`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type - browser will set it with boundary for FormData
      },
      credentials: 'include',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create employee');
    }

    return data;
  } catch (error) {
    console.error('Create employee error:', error);
    throw error;
  }
};

export default {
  login,
  getCurrentUser,
  logout,
  isAuthenticated,
  getToken,
  getStoredUser,
  apiRequest,
  changePassword,
  resetPassword,
  createEmployee,
  createEmployeeWithPhoto,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  updateProfile,
};



