// Questionnaire API service
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Get authentication token
 */
const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Get all questionnaire templates
 */
export const getTemplates = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/questionnaire/templates`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch templates');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get templates error:', error);
    throw error;
  }
};

/**
 * Get single template
 */
export const getTemplate = async (templateId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/questionnaire/templates/${templateId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch template');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get template error:', error);
    throw error;
  }
};

/**
 * Create questionnaire template (Managers only)
 */
export const createTemplate = async (templateData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/questionnaire/templates`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(templateData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create template');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Create template error:', error);
    throw error;
  }
};

/**
 * Update questionnaire template (Managers only)
 */
export const updateTemplate = async (templateId, templateData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/questionnaire/templates/${templateId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(templateData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update template');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Update template error:', error);
    throw error;
  }
};

/**
 * Delete questionnaire template (Managers only)
 */
export const deleteTemplate = async (templateId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/questionnaire/templates/${templateId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to delete template');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Delete template error:', error);
    throw error;
  }
};

/**
 * Get questions for a project/task
 */
export const getQuestions = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        params.append(key, filters[key]);
      }
    });

    const url = `${API_BASE_URL}/questionnaire/questions${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch questions');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get questions error:', error);
    throw error;
  }
};

/**
 * Create question (Managers only)
 */
export const createQuestion = async (questionData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/questionnaire/questions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(questionData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create question');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Create question error:', error);
    throw error;
  }
};

/**
 * Update question (Managers only)
 */
export const updateQuestion = async (questionId, questionData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/questionnaire/questions/${questionId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(questionData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update question');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Update question error:', error);
    throw error;
  }
};

/**
 * Delete question (Managers only)
 */
export const deleteQuestion = async (questionId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/questionnaire/questions/${questionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to delete question');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Delete question error:', error);
    throw error;
  }
};

/**
 * Submit response (Employees can answer)
 */
export const submitResponse = async (questionId, responseData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/questionnaire/questions/${questionId}/responses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(responseData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to submit response');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Submit response error:', error);
    throw error;
  }
};

/**
 * Get responses for a question
 */
export const getResponses = async (questionId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/questionnaire/questions/${questionId}/responses`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch responses');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get responses error:', error);
    throw error;
  }
};

/**
 * Lock/Unlock response (Managers only)
 */
export const lockResponse = async (responseId, isLocked) => {
  try {
    const response = await fetch(`${API_BASE_URL}/questionnaire/responses/${responseId}/lock`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isLocked }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to lock/unlock response');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Lock response error:', error);
    throw error;
  }
};

/**
 * Assign template to project/task (Managers only)
 */
export const assignTemplate = async (templateId, assignmentData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/questionnaire/templates/${templateId}/assign`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assignmentData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to assign template');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Assign template error:', error);
    throw error;
  }
};

/**
 * Get assignments
 */
export const getAssignments = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        params.append(key, filters[key]);
      }
    });

    const url = `${API_BASE_URL}/questionnaire/assignments${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch assignments');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get assignments error:', error);
    throw error;
  }
};

/**
 * Get questionnaire status (Pending/Completed)
 */
export const getQuestionnaireStatus = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        params.append(key, filters[key]);
      }
    });

    const url = `${API_BASE_URL}/questionnaire/status${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch questionnaire status');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get questionnaire status error:', error);
    throw error;
  }
};

export default {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  submitResponse,
  getResponses,
  lockResponse,
  assignTemplate,
  getAssignments,
  getQuestionnaireStatus,
};
