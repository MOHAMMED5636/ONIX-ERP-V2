// Dashboard API service for backend connection
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
 * Get dashboard summary statistics
 * @returns {Promise} Dashboard summary data
 */
export const getDashboardSummary = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetchWithTimeout(`${API_BASE_URL}/dashboard/summary`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    }, 10000);

    if (!response.ok) {
      let errorMessage = 'Failed to fetch dashboard summary';
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
    console.error('Dashboard summary error:', error);
    if (error.message.includes('timeout')) {
      throw new Error('Connection timeout - please check if backend is running on port 3001');
    } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Cannot connect to server - make sure backend is running on http://localhost:3001');
    }
    throw error;
  }
};

/**
 * Get dashboard statistics with recent projects
 * @returns {Promise} Dashboard stats data
 */
export const getDashboardStats = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetchWithTimeout(`${API_BASE_URL}/dashboard/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    }, 10000);

    if (!response.ok) {
      let errorMessage = 'Failed to fetch dashboard stats';
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
    console.error('Dashboard stats error:', error);
    throw error;
  }
};

/**
 * Get dashboard projects
 * @param {string} status - Filter by status (optional)
 * @param {number} limit - Number of projects to return (optional)
 * @returns {Promise} Projects data
 */
export const getDashboardProjects = async (status, limit = 10) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found');
    }

    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (limit) params.append('limit', limit.toString());

    const response = await fetchWithTimeout(`${API_BASE_URL}/dashboard/projects?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    }, 10000);

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard projects');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Dashboard projects error:', error);
    throw error;
  }
};

/**
 * Get dashboard tasks
 * @returns {Promise} Tasks data
 */
export const getDashboardTasks = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetchWithTimeout(`${API_BASE_URL}/dashboard/tasks`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    }, 10000);

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard tasks');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Dashboard tasks error:', error);
    throw error;
  }
};

/**
 * Get dashboard team members
 * @returns {Promise} Team members data
 */
export const getDashboardTeam = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetchWithTimeout(`${API_BASE_URL}/dashboard/team`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    }, 10000);

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard team');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Dashboard team error:', error);
    throw error;
  }
};

/**
 * Get dashboard calendar events
 * @param {number} month - Month number (1-12)
 * @param {number} year - Year
 * @returns {Promise} Calendar events data
 */
export const getDashboardCalendar = async (month, year) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found');
    }

    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());

    const response = await fetchWithTimeout(`${API_BASE_URL}/dashboard/calendar?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    }, 10000);

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard calendar');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Dashboard calendar error:', error);
    throw error;
  }
};

export default {
  getDashboardSummary,
  getDashboardStats,
  getDashboardProjects,
  getDashboardTasks,
  getDashboardTeam,
  getDashboardCalendar,
};



