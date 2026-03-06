// Authentication API service for backend connection
import * as authStorage from '../utils/authStorage';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

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
 * Unified login for all users (Admin, Employee, etc.).
 * Backend automatically determines user role from email/password.
 * @param {string} email - User email or mobile number
 * @param {string} password - User password
 * @returns {Promise} Login response with token, user (id, role, employeeId, permissions)
 */
export const login = async (email, password) => {
  try {
    const body = { email, password }; // 'email' field accepts email or mobile number
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(body),
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

    // Per-tab: store token in sessionStorage
    if (data.success && data.data && data.data.token) {
      authStorage.clearAuth();
      authStorage.setToken(data.data.token);
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    // Provide more specific error messages
    if (error.message.includes('timeout')) {
      throw new Error('Connection timeout - please check if backend is running on port 3001');
    } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      const backendUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:3001';
      throw new Error(`Cannot connect to server - make sure backend is running on ${backendUrl}`);
    }
    throw error;
  }
};

/**
 * Get current authenticated user from backend
 * @returns {Promise} User data
 */
export const getCurrentUser = async (token = null) => {
  try {
    const authToken = token !== null && token !== undefined ? token : authStorage.getToken();

    if (!authToken) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      authStorage.clearAuth();
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
 * Logout user (calls backend endpoint and clears per-tab sessionStorage)
 */
export const logout = async () => {
  try {
    const token = authStorage.getToken();

    if (token) {
      try {
        await fetchWithTimeout(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }, 5000);
      } catch (error) {
        console.error('Logout API error:', error);
      }
    }

    authStorage.clearAuth();
    window.location.href = '/login';
  } catch (error) {
    console.error('Logout error:', error);
    authStorage.clearAuth();
    window.location.href = '/login';
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!authStorage.getToken();
};

/**
 * Get stored token (per-tab from sessionStorage)
 * @returns {string|null}
 */
export const getToken = () => {
  return authStorage.getToken();
};

/**
 * Get stored user (per-tab)
 * @returns {object|null}
 */
export const getStoredUser = () => {
  return authStorage.getAuthItemJson('user');
};

/**
 * Make authenticated API request (helper function)
 * @param {string} endpoint - API endpoint (e.g., '/clients')
 * @param {object} options - Fetch options
 * @returns {Promise}
 */
export const apiRequest = async (endpoint, options = {}) => {
  const token = authStorage.getToken();
  
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
 * Set password for employee (Admin only)
 * @param {string} employeeId - Employee ID whose password is being set
 * @param {string} newPassword - New password
 * @returns {Promise}
 */
export const setPassword = async (employeeId, newPassword) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_BASE_URL}/auth/admin/set-password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ employeeId, newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to set password');
    }

    return data;
  } catch (error) {
    console.error('Set password error:', error);
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

    // Log FormData contents for debugging (in development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('Uploading profile with FormData:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ', pair[1] instanceof File ? `${pair[1].name} (${pair[1].size} bytes)` : pair[1]);
      }
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

    // Check if response is ok before parsing
    if (!response.ok) {
      // Try to get error message from response
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } else {
          // If response is HTML (like an error page), get text instead
          const text = await response.text();
          console.error('Non-JSON error response:', text.substring(0, 200));
          errorMessage = `Server error (${response.status}). Check backend logs.`;
        }
      } catch (parseError) {
        console.error('Failed to parse error response:', parseError);
      }
      throw new Error(errorMessage);
    }

    // Parse response
    let data;
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // If response is not JSON, something is wrong
        const text = await response.text();
        console.error('Non-JSON response received:', text.substring(0, 200));
        throw new Error('Server returned non-JSON response. Check backend implementation.');
      }
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      throw new Error('Failed to parse server response. Check backend implementation.');
    }

    // Log response for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('Profile update response:', data);
      if (data.data && data.data.photo) {
        console.log('Updated photo path:', data.data.photo);
      } else {
        console.warn('Warning: Response does not include photo path');
        console.warn('Response structure:', JSON.stringify(data, null, 2));
      }
    }

    // Ensure response has the expected structure
    if (!data.success) {
      throw new Error(data.message || 'Profile update failed');
    }

    return data;
  } catch (error) {
    console.error('Update profile error:', error);
    
    // Provide more helpful error messages
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Cannot connect to server. Please check:\n1. Backend server is running on http://localhost:3001\n2. CORS is configured correctly\n3. Network connection is working');
    }
    
    throw error;
  }
};

/**
 * Get organization preferences (Admin Profile). Any authenticated user can read.
 * @returns {Promise} { preferences, conversionFactors, options }
 */
export const getPreferences = async () => {
  try {
    const token = getToken();
    if (!token) throw new Error('No token found');
    const response = await fetch(`${API_BASE_URL}/auth/preferences`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch preferences');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get preferences error:', error);
    throw error;
  }
};

/**
 * Update organization preferences (Admin Profile). Admin only.
 * @param {Object} preferences - { defaultCurrency, lengthUnit, areaUnit, volumeUnit, heightUnit, weightUnit }
 * @returns {Promise}
 */
export const updatePreferences = async (preferences) => {
  try {
    const token = getToken();
    if (!token) throw new Error('No token found');
    const response = await fetch(`${API_BASE_URL}/auth/preferences`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(preferences),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to update preferences');
    }
    return await response.json();
  } catch (error) {
    console.error('Update preferences error:', error);
    throw error;
  }
};

/**
 * Request login OTP
 * @param {string} email - User email address
 * @returns {Promise} Response with success message
 */
export const requestLoginOtp = async (email) => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/request-login-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    }, 10000); // 10 second timeout

    if (!response.ok) {
      let errorMessage = 'Failed to send OTP';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Request login OTP error:', error);
    if (error.message.includes('timeout')) {
      throw new Error('Connection timeout - please check if backend is running');
    } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      const backendUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:3001';
      throw new Error(`Cannot connect to server - make sure backend is running on ${backendUrl}`);
    }
    throw error;
  }
};

/**
 * Verify login OTP and login user (unified for all roles).
 * Backend automatically determines user role from email.
 * @param {string} email - User email address
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise} Login response with token, user (id, role, employeeId, permissions)
 */
export const verifyLoginOtp = async (email, otp) => {
  try {
    const body = { email: email.trim().toLowerCase(), otp: otp.trim() };
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/verify-login-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(body),
    }, 10000); // 10 second timeout

    if (!response.ok) {
      let errorMessage = 'Invalid OTP';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();

    // Per-tab: store token in sessionStorage
    if (data.success && data.data && data.data.token) {
      authStorage.clearAuth();
      authStorage.setToken(data.data.token);
    }

    return data;
  } catch (error) {
    console.error('Verify login OTP error:', error);
    if (error.message.includes('timeout')) {
      throw new Error('Connection timeout - please check if backend is running');
    } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      const backendUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:3001';
      throw new Error(`Cannot connect to server - make sure backend is running on ${backendUrl}`);
    }
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
  requestLoginOtp,
  verifyLoginOtp,
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
  getPreferences,
  updatePreferences,
  setPassword,
};



