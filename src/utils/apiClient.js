// Backend API Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://192.168.1.151:3001/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Helper function to handle response
const handleResponse = async (response) => {
  // Handle 401 Unauthorized - clear token and redirect to login
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Only redirect if not already on login page
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized - Please login again');
  }
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

export const apiClient = {
  async get(url) {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    
    return handleResponse(response);
  },

  async post(url, data) {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    return handleResponse(response);
  },

  async put(url, data) {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    return handleResponse(response);
  },

  async patch(url, data) {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    return handleResponse(response);
  },

  async delete(url) {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    
    return handleResponse(response);
  }
};

// Export API base URL for direct use if needed
export { API_BASE_URL };








