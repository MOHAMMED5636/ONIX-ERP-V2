// Document Management API service
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://192.168.1.54:3001/api';

/**
 * Get all documents for a user
 * @param {string} userId - User ID (optional, defaults to current user)
 * @returns {Promise}
 */
export const getDocuments = async (userId = null) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    const url = userId 
      ? `${API_BASE_URL}/documents?userId=${userId}`
      : `${API_BASE_URL}/documents`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    // Handle 404 gracefully - documents endpoint might not be implemented yet
    if (response.status === 404) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Documents endpoint not found (404). This is expected if backend endpoint is not implemented yet.');
      }
      return { success: true, data: [] };
    }

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorMessage = `Failed to fetch documents: ${response.status}`;
      
      try {
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        }
      } catch (parseError) {
        // If we can't parse the error, return empty array instead of throwing
        if (process.env.NODE_ENV === 'development') {
          console.warn('Could not parse error response, returning empty documents array');
        }
        return { success: true, data: [] };
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    // Handle connection errors gracefully
    if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED')) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Cannot connect to backend for documents. Backend may not be running or documents endpoint not implemented. Returning empty array.');
      }
      return { success: true, data: [] };
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.error('Get documents error:', error);
      console.warn('Returning empty documents array due to error');
    }
    
    // Return empty array instead of throwing error - allows UI to work even if endpoint doesn't exist
    return { success: true, data: [] };
  }
};

/**
 * Upload a document
 * @param {FormData} formData - FormData containing document file and metadata
 * @returns {Promise}
 */
export const uploadDocument = async (formData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    // Log FormData contents for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('📄 Uploading document with FormData:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ', pair[1] instanceof File ? `${pair[1].name} (${pair[1].size} bytes)` : pair[1]);
      }
    }

    const response = await fetch(`${API_BASE_URL}/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type - browser will set it with boundary for FormData
      },
      credentials: 'include',
      body: formData,
    });

    // Check if response is ok before parsing
    if (!response.ok) {
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
          if (response.status === 404) {
            errorMessage = 'Document upload endpoint not found (404). Please check backend routes.';
          } else {
            errorMessage = `Server error (${response.status}). Check backend logs.`;
          }
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
      console.log('📄 Document upload response:', data);
    }

    // Ensure response has the expected structure
    if (!data.success) {
      throw new Error(data.message || 'Document upload failed');
    }

    return data;
  } catch (error) {
    console.error('❌ Upload document error:', error);
    
    // Provide more helpful error messages
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Cannot connect to server. Please check:\n1. Backend server is running on http://192.168.1.54:3001\n2. CORS is configured correctly\n3. Network connection is working');
    }
    
    throw error;
  }
};

/**
 * Replace/Update a document
 * @param {string} documentId - Document ID
 * @param {FormData} formData - FormData containing new document file
 * @returns {Promise}
 */
export const replaceDocument = async (documentId, formData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to replace document');
    }

    return data;
  } catch (error) {
    console.error('Replace document error:', error);
    throw error;
  }
};

/**
 * Delete a document
 * @param {string} documentId - Document ID
 * @returns {Promise}
 */
export const deleteDocument = async (documentId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete document');
    }

    return data;
  } catch (error) {
    console.error('Delete document error:', error);
    throw error;
  }
};

/**
 * Download a document
 * @param {string} documentId - Document ID
 * @returns {Promise<Blob>}
 */
export const downloadDocument = async (documentId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_BASE_URL}/documents/${documentId}/download`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to download document');
    }

    return await response.blob();
  } catch (error) {
    console.error('Download document error:', error);
    throw error;
  }
};

export default {
  getDocuments,
  uploadDocument,
  replaceDocument,
  deleteDocument,
  downloadDocument,
};

