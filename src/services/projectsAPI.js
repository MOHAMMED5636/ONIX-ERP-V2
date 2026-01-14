// Projects API service for backend connection
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://192.168.1.54:3001/api';

/**
 * Create a new project
 * @param {Object} projectData - Project data (name, referenceNumber, etc.)
 * @returns {Promise} Created project data
 */
export const createProject = async (projectData) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found. Please login again.');
    }

    console.log('📝 Creating project via API:', projectData);

    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(projectData),
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    console.log('✅ Project created successfully:', data);
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to create project');
    }

    return data;
  } catch (error) {
    console.error('❌ Create project error:', error);
    throw error;
  }
};

/**
 * Get all projects
 * @param {Object} filters - Optional filters (status, clientId, etc.)
 * @returns {Promise} Projects data
 */
export const getProjects = async (filters = {}) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found');
    }

    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        params.append(key, filters[key]);
      }
    });

    const url = `${API_BASE_URL}/projects${params.toString() ? `?${params.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get projects error:', error);
    throw error;
  }
};

/**
 * Update a project
 * @param {string} projectId - Project ID
 * @param {Object} projectData - Updated project data
 * @returns {Promise} Updated project data
 */
export const updateProject = async (projectId, projectData) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(projectData),
    });

    if (!response.ok) {
      throw new Error('Failed to update project');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Update project error:', error);
    throw error;
  }
};

/**
 * Delete a project
 * @param {string} projectId - Project ID
 * @returns {Promise} Deletion result
 */
export const deleteProject = async (projectId) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to delete project');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Delete project error:', error);
    throw error;
  }
};

export default {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
};

