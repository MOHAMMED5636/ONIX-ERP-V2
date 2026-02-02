// Department API service for backend connection
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Get all departments for a company
 * @param {number|string} companyId - The company ID
 * @returns {Promise} Departments data with success flag
 */
export const getCompanyDepartments = async (companyId) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found. Please login again.');
    }

    const url = `${API_BASE_URL}/companies/${companyId}/departments`;
    
    console.log('📡 Fetching departments from:', url);

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
    
    console.log(`✅ Fetched ${data.data?.length || 0} departments`);
    
    return {
      success: true,
      data: data.data || data || [],
      message: data.message
    };
  } catch (error) {
    console.error('❌ Error fetching departments:', error);
    return {
      success: false,
      data: [],
      message: error.message || 'Failed to fetch departments'
    };
  }
};

/**
 * Create a new department for a company
 * @param {number|string} companyId - The company ID
 * @param {Object} departmentData - Department data (name, description, status, managerId)
 * @returns {Promise} Response with success flag
 */
export const createDepartment = async (companyId, departmentData) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found. Please login again.');
    }

    const url = `${API_BASE_URL}/companies/${companyId}/departments`;
    
    console.log('📝 Creating department:', url, departmentData);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(departmentData),
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
    
    console.log('✅ Department created successfully');
    
    return {
      success: true,
      data: data.data || data,
      message: data.message || 'Department created successfully'
    };
  } catch (error) {
    console.error('❌ Error creating department:', error);
    return {
      success: false,
      message: error.message || 'Failed to create department'
    };
  }
};

/**
 * Update an existing department
 * @param {number|string} departmentId - The department ID
 * @param {Object} departmentData - Updated department data (name, description, status, managerId)
 * @returns {Promise} Response with success flag
 */
export const updateDepartment = async (departmentId, departmentData) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found. Please login again.');
    }

    const url = `${API_BASE_URL}/departments/${departmentId}`;
    
    console.log('📝 Updating department:', url, departmentData);

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(departmentData),
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
    
    console.log('✅ Department updated successfully');
    
    return {
      success: true,
      data: data.data || data,
      message: data.message || 'Department updated successfully'
    };
  } catch (error) {
    console.error('❌ Error updating department:', error);
    return {
      success: false,
      message: error.message || 'Failed to update department'
    };
  }
};

/**
 * Get department by ID
 * @param {number|string} departmentId - The department ID
 * @returns {Promise} Department data with success flag
 */
export const getDepartmentById = async (departmentId) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found. Please login again.');
    }

    const url = `${API_BASE_URL}/departments/${departmentId}`;
    
    console.log('📡 Fetching department from:', url);

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
    
    console.log(`✅ Fetched department:`, data.data?.name);
    
    return {
      success: true,
      data: data.data || data,
      message: data.message
    };
  } catch (error) {
    console.error('❌ Error fetching department:', error);
    return {
      success: false,
      data: null,
      message: error.message || 'Failed to fetch department'
    };
  }
};

/**
 * Delete a department
 * @param {number|string} departmentId - The department ID
 * @returns {Promise} Response with success flag
 */
export const deleteDepartment = async (departmentId) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found. Please login again.');
    }

    const url = `${API_BASE_URL}/departments/${departmentId}`;
    
    console.log('🗑️ Deleting department:', url);

    const response = await fetch(url, {
      method: 'DELETE',
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
    
    console.log('✅ Department deleted successfully');
    
    return {
      success: true,
      message: data.message || 'Department deleted successfully'
    };
  } catch (error) {
    console.error('❌ Error deleting department:', error);
    return {
      success: false,
      message: error.message || 'Failed to delete department'
    };
  }
};

// ============================================
// SUB-DEPARTMENTS API FUNCTIONS
// ============================================

/**
 * Get all sub-departments for a department
 * @param {string} departmentId - The department ID
 * @returns {Promise} Sub-departments data with success flag
 */
export const getDepartmentSubDepartments = async (departmentId) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found. Please login again.');
    }

    const url = `${API_BASE_URL}/departments/${departmentId}/sub-departments`;
    
    console.log('📡 Fetching sub-departments from:', url);

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
    
    console.log(`✅ Fetched ${data.data?.length || 0} sub-departments`);
    
    return {
      success: true,
      data: data.data || data || [],
      message: data.message
    };
  } catch (error) {
    console.error('❌ Error fetching sub-departments:', error);
    return {
      success: false,
      data: [],
      message: error.message || 'Failed to fetch sub-departments'
    };
  }
};

/**
 * Get sub-department by ID
 * @param {string} subDepartmentId - The sub-department ID
 * @returns {Promise} Sub-department data with success flag
 */
export const getSubDepartmentById = async (subDepartmentId) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found. Please login again.');
    }

    const url = `${API_BASE_URL}/sub-departments/${subDepartmentId}`;
    
    console.log('📡 Fetching sub-department from:', url);

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
    
    console.log(`✅ Fetched sub-department:`, data.data?.name);
    
    return {
      success: true,
      data: data.data || data,
      message: data.message
    };
  } catch (error) {
    console.error('❌ Error fetching sub-department:', error);
    return {
      success: false,
      data: null,
      message: error.message || 'Failed to fetch sub-department'
    };
  }
};

/**
 * Create a new sub-department for a department
 * @param {string} departmentId - The department ID
 * @param {Object} subDepartmentData - Sub-department data (name, description, status, managerId, location, budget)
 * @returns {Promise} Response with success flag
 */
export const createSubDepartment = async (departmentId, subDepartmentData) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found. Please login again.');
    }

    const url = `${API_BASE_URL}/departments/${departmentId}/sub-departments`;
    
    console.log('📝 Creating sub-department:', url, subDepartmentData);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(subDepartmentData),
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
    
    console.log('✅ Sub-department created successfully');
    
    return {
      success: true,
      data: data.data || data,
      message: data.message || 'Sub-department created successfully'
    };
  } catch (error) {
    console.error('❌ Error creating sub-department:', error);
    return {
      success: false,
      message: error.message || 'Failed to create sub-department'
    };
  }
};

/**
 * Update an existing sub-department
 * @param {string} subDepartmentId - The sub-department ID
 * @param {Object} subDepartmentData - Updated sub-department data
 * @returns {Promise} Response with success flag
 */
export const updateSubDepartment = async (subDepartmentId, subDepartmentData) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found. Please login again.');
    }

    const url = `${API_BASE_URL}/sub-departments/${subDepartmentId}`;
    
    console.log('📝 Updating sub-department:', url, subDepartmentData);

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(subDepartmentData),
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
    
    console.log('✅ Sub-department updated successfully');
    
    return {
      success: true,
      data: data.data || data,
      message: data.message || 'Sub-department updated successfully'
    };
  } catch (error) {
    console.error('❌ Error updating sub-department:', error);
    return {
      success: false,
      message: error.message || 'Failed to update sub-department'
    };
  }
};

/**
 * Delete a sub-department
 * @param {string} subDepartmentId - The sub-department ID
 * @returns {Promise} Response with success flag
 */
export const deleteSubDepartment = async (subDepartmentId) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found. Please login again.');
    }

    const url = `${API_BASE_URL}/sub-departments/${subDepartmentId}`;
    
    console.log('🗑️ Deleting sub-department:', url);

    const response = await fetch(url, {
      method: 'DELETE',
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
    
    console.log('✅ Sub-department deleted successfully');
    
    return {
      success: true,
      message: data.message || 'Sub-department deleted successfully'
    };
  } catch (error) {
    console.error('❌ Error deleting sub-department:', error);
    return {
      success: false,
      message: error.message || 'Failed to delete sub-department'
    };
  }
};

// ============================================
// POSITIONS API FUNCTIONS
// ============================================

/**
 * Get all positions for a sub-department
 * @param {string} subDepartmentId - The sub-department ID
 * @returns {Promise} Positions data with success flag
 */
export const getSubDepartmentPositions = async (subDepartmentId) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found. Please login again.');
    }

    const url = `${API_BASE_URL}/sub-departments/${subDepartmentId}/positions`;
    
    console.log('📡 Fetching positions from:', url);

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
    
    console.log(`✅ Fetched ${data.data?.length || 0} positions`);
    
    return {
      success: true,
      data: data.data || data || [],
      message: data.message
    };
  } catch (error) {
    console.error('❌ Error fetching positions:', error);
    return {
      success: false,
      data: [],
      message: error.message || 'Failed to fetch positions'
    };
  }
};

/**
 * Get position by ID
 * @param {string} positionId - The position ID
 * @returns {Promise} Position data with success flag
 */
export const getPositionById = async (positionId) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found. Please login again.');
    }

    const url = `${API_BASE_URL}/positions/${positionId}`;
    
    console.log('📡 Fetching position from:', url);

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
    
    console.log(`✅ Fetched position:`, data.data?.name);
    
    return {
      success: true,
      data: data.data || data,
      message: data.message
    };
  } catch (error) {
    console.error('❌ Error fetching position:', error);
    return {
      success: false,
      data: null,
      message: error.message || 'Failed to fetch position'
    };
  }
};

/**
 * Create a new position for a sub-department
 * @param {string} subDepartmentId - The sub-department ID
 * @param {Object} positionData - Position data (name, description, status)
 * @returns {Promise} Response with success flag
 */
export const createPosition = async (subDepartmentId, positionData) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found. Please login again.');
    }

    const url = `${API_BASE_URL}/sub-departments/${subDepartmentId}/positions`;
    
    console.log('📝 Creating position:', url, positionData);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(positionData),
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
    
    console.log('✅ Position created successfully');
    
    return {
      success: true,
      data: data.data || data,
      message: data.message || 'Position created successfully'
    };
  } catch (error) {
    console.error('❌ Error creating position:', error);
    return {
      success: false,
      message: error.message || 'Failed to create position'
    };
  }
};

/**
 * Update an existing position
 * @param {string} positionId - The position ID
 * @param {Object} positionData - Updated position data
 * @returns {Promise} Response with success flag
 */
export const updatePosition = async (positionId, positionData) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found. Please login again.');
    }

    const url = `${API_BASE_URL}/positions/${positionId}`;
    
    console.log('📝 Updating position:', url, positionData);

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(positionData),
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
    
    console.log('✅ Position updated successfully');
    
    return {
      success: true,
      data: data.data || data,
      message: data.message || 'Position updated successfully'
    };
  } catch (error) {
    console.error('❌ Error updating position:', error);
    return {
      success: false,
      message: error.message || 'Failed to update position'
    };
  }
};

/**
 * Delete a position
 * @param {string} positionId - The position ID
 * @returns {Promise} Response with success flag
 */
export const deletePosition = async (positionId) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found. Please login again.');
    }

    const url = `${API_BASE_URL}/positions/${positionId}`;
    
    console.log('🗑️ Deleting position:', url);

    const response = await fetch(url, {
      method: 'DELETE',
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
    
    console.log('✅ Position deleted successfully');
    
    return {
      success: true,
      message: data.message || 'Position deleted successfully'
    };
  } catch (error) {
    console.error('❌ Error deleting position:', error);
    return {
      success: false,
      message: error.message || 'Failed to delete position'
    };
  }
};
