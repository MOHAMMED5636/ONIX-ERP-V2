// Projects API service for backend connection
import { getToken } from './authAPI';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Create a new project
 * @param {Object} projectData - Project data (name, referenceNumber, etc.)
 * @returns {Promise} Created project data
 */
export const createProject = async (projectData) => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error('No token found. Please login again.');
    }

    // Map frontend form data to backend API format
    const apiPayload = {
      name: projectData.projectName,
      referenceNumber: projectData.referenceNumber,
      status: projectData.status === 'To Do' ? 'OPEN' : projectData.status === 'In Progress' ? 'IN_PROGRESS' : 'COMPLETED',
      owner: projectData.owner || projectData.developer,
      projectManager: projectData.projectManager || null,
      startDate: projectData.timeline?.startDate || null,
      endDate: projectData.timeline?.endDate || null,
      planDays: projectData.planDays || null,
      remarks: projectData.remarks || null,
      assigneeNotes: projectData.assigneeNotes || null,
      // Include contract reference if provided (for auto-population and linking)
      contractReferenceNumber: projectData.contractReferenceNumber || null,
    };

    console.log('📝 Creating project via API:', apiPayload);

    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(apiPayload),
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
    const token = getToken();
    
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
    const token = getToken();
    
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
 * Update only the project name (persists in DB so it survives refresh).
 * Use this when the user edits the project name in the Project Details / Edit modal.
 * @param {string} projectId - Project ID
 * @param {string} name - New project name
 * @returns {Promise} Updated project data including name, projectName, referenceNumber
 */
export const updateProjectName = async (projectId, name) => {
  try {
    const token = getToken();
    if (!token) throw new Error('No token found');
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/name`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ name: name != null ? String(name).trim() : '', projectName: name != null ? String(name).trim() : '' }),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to update project name');
    }
    return response.json();
  } catch (error) {
    console.error('Update project name error:', error);
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
    const token = getToken();
    
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
  updateProjectName,
  deleteProject,
};

