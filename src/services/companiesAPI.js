// Companies API service for backend connection
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Get all companies
 * @param {Object} filters - Optional filters (status, licenseStatus, search, page, limit)
 * @returns {Promise} Companies data
 */
export const getCompanies = async (filters = {}) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found. Please login again.');
    }

    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });

    const url = `${API_BASE_URL}/companies${params.toString() ? `?${params.toString()}` : ''}`;
    
    console.log('📡 Fetching companies from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
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
    
    console.log(`✅ Fetched ${data.data?.length || 0} companies`);
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch companies');
    }

    return data;
  } catch (error) {
    console.error('❌ Get companies error:', error);
    throw error;
  }
};

/**
 * Get company by ID
 * @param {string} companyId - Company ID
 * @returns {Promise} Company data
 */
export const getCompanyById = async (companyId) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_BASE_URL}/companies/${companyId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch company');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get company error:', error);
    throw error;
  }
};

/**
 * Create a new company
 * @param {Object} companyData - Company data
 * @returns {Promise} Created company data
 */
export const createCompany = async (companyData) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found. Please login again.');
    }

    // Check if there are any File objects to upload
    const hasFiles = companyData.logo instanceof File || 
                     companyData.header instanceof File || 
                     companyData.footer instanceof File;

    let response;
    if (hasFiles) {
      // Use FormData for file uploads
      const formData = new FormData();
      
      // Add all text fields
      Object.keys(companyData).forEach(key => {
        if (key === 'logo' || key === 'header' || key === 'footer') {
          // Handle file fields
          if (companyData[key] instanceof File) {
            formData.append(key, companyData[key]);
          } else if (companyData[key] && typeof companyData[key] === 'string') {
            // Keep existing URL if it's a string
            formData.append(key, companyData[key]);
          }
        } else {
          // Add other fields as strings
          if (companyData[key] !== null && companyData[key] !== undefined) {
            formData.append(key, String(companyData[key]));
          }
        }
      });

      console.log('📝 Creating company with files via API (FormData)');

      response = await fetch(`${API_BASE_URL}/companies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData - browser will set it with boundary
        },
        credentials: 'include',
        body: formData,
      });
    } else {
      // Use JSON for text-only data
      console.log('📝 Creating company via API (JSON):', companyData);

      response = await fetch(`${API_BASE_URL}/companies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(companyData),
      });
    }

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
    
    console.log('✅ Company created successfully:', data);
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to create company');
    }

    return data;
  } catch (error) {
    console.error('❌ Create company error:', error);
    throw error;
  }
};

/**
 * Update a company
 * @param {string} companyId - Company ID
 * @param {Object} companyData - Updated company data
 * @returns {Promise} Updated company data
 */
export const updateCompany = async (companyId, companyData) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found');
    }

    // Check if there are any File objects to upload
    const hasFiles = companyData.logo instanceof File || 
                     companyData.header instanceof File || 
                     companyData.footer instanceof File;
    
    // Check if there are existing file URLs to preserve (for updates)
    const hasFileUrls = (companyData.logo && typeof companyData.logo === 'string') ||
                        (companyData.header && typeof companyData.header === 'string') ||
                        (companyData.footer && typeof companyData.footer === 'string');

    let response;
    if (hasFiles || hasFileUrls) {
      // Use FormData for file uploads
      const formData = new FormData();
      
      // Add all text fields
      Object.keys(companyData).forEach(key => {
        if (key === 'logo' || key === 'header' || key === 'footer') {
          // Handle file fields
          if (companyData[key] instanceof File) {
            formData.append(key, companyData[key]);
          } else if (companyData[key] && typeof companyData[key] === 'string') {
            // Keep existing URL if it's a string
            formData.append(key, companyData[key]);
          }
        } else {
          // Add other fields as strings
          if (companyData[key] !== null && companyData[key] !== undefined) {
            formData.append(key, String(companyData[key]));
          }
        }
      });

      console.log('📝 Updating company via API (FormData)', hasFiles ? 'with new files' : 'preserving existing files');

      response = await fetch(`${API_BASE_URL}/companies/${companyId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData
        },
        credentials: 'include',
        body: formData,
      });
    } else {
      // Use JSON for text-only data (no files at all)
      console.log('📝 Updating company via API (JSON):', companyData);

      response = await fetch(`${API_BASE_URL}/companies/${companyId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(companyData),
      });
    }

    if (!response.ok) {
      throw new Error('Failed to update company');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Update company error:', error);
    throw error;
  }
};

/**
 * Delete a company
 * @param {string} companyId - Company ID
 * @returns {Promise} Deletion result
 */
export const deleteCompany = async (companyId) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_BASE_URL}/companies/${companyId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to delete company');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Delete company error:', error);
    throw error;
  }
};

/**
 * Get company statistics
 * @returns {Promise} Company stats
 */
export const getCompanyStats = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_BASE_URL}/companies/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch company stats');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get company stats error:', error);
    throw error;
  }
};

export default {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  getCompanyStats,
};

