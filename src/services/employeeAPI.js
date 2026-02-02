// Employee API service for backend connection
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Get all employees
 * @returns {Promise} Employees data with success flag
 */
export const getEmployees = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found. Please login again.');
    }

    const url = `${API_BASE_URL}/employees`;
    
    console.log('📡 Fetching employees from:', url);

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
    
    // Backend returns { success: true, data: { employees: [...], pagination: {...} } }
    const employeesList = data.data?.employees || data.data || [];
    const count = Array.isArray(employeesList) ? employeesList.length : 0;
    
    console.log(`✅ Fetched ${count} employees`);
    
    return {
      success: true,
      data: employeesList,
      message: data.message,
      pagination: data.data?.pagination
    };
  } catch (error) {
    console.error('❌ Error fetching employees:', error);
    return {
      success: false,
      data: [],
      message: error.message || 'Failed to fetch employees'
    };
  }
};

/**
 * Get employee by ID
 * @param {string} employeeId - The employee ID
 * @returns {Promise} Employee data with success flag
 */
export const getEmployeeById = async (employeeId) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found. Please login again.');
    }

    const url = `${API_BASE_URL}/employees/${employeeId}`;
    
    console.log('📡 Fetching employee from:', url);

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
    
    console.log(`✅ Fetched employee:`, data.data?.firstName);
    
    return {
      success: true,
      data: data.data || data,
      message: data.message
    };
  } catch (error) {
    console.error('❌ Error fetching employee:', error);
    return {
      success: false,
      data: null,
      message: error.message || 'Failed to fetch employee'
    };
  }
};

/**
 * Create employee with full Employee Directory data
 * @param {Object} employeeData - Complete employee data from form (includes file attachments)
 * @param {File} photoFile - Optional photo file (can also be in employeeData.personalImage)
 * @returns {Promise} Employee data with success flag
 */
export const createEmployee = async (employeeData, photoFile = null) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found. Please login again.');
    }

    const url = `${API_BASE_URL}/employees`;
    
    // Clean employeeData: remove undefined values but keep null and empty strings for required fields
    const cleanedEmployeeData = Object.keys(employeeData).reduce((acc, key) => {
      if (employeeData[key] !== undefined) {
        acc[key] = employeeData[key];
      }
      return acc;
    }, {});
    
    console.log('📝 Creating employee:', url);
    console.log('📝 Employee data (cleaned):', cleanedEmployeeData);

    // Create FormData for file upload
    const formData = new FormData();
    
    // File field names to skip (will be appended separately)
    const fileFields = ['photo', 'personalImage', 'passportAttachment', 'nationalIdAttachment', 
                        'residencyAttachment', 'insuranceAttachment', 'drivingLicenseAttachment', 'labourIdAttachment'];
    
    // Required fields that should always be sent (even if empty string)
    const requiredFields = ['firstName', 'lastName', 'passportNumber', 'passportIssueDate', 'passportExpiryDate'];
    
    // Append all employee data fields (excluding file fields)
    Object.keys(cleanedEmployeeData).forEach(key => {
      // Skip file fields - they'll be appended separately
      if (fileFields.includes(key)) {
        return;
      }
      
      const value = cleanedEmployeeData[key];
      
      // Skip undefined values completely
      if (value === undefined) {
        return;
      }
      
      // Handle arrays (contacts, emails)
      if (Array.isArray(value)) {
        if (value.length > 0) {
          value.forEach((item, index) => {
            if (item !== null && item !== undefined) {
              if (typeof item === 'object') {
                formData.append(`${key}[${index}]`, JSON.stringify(item));
              } else {
                formData.append(`${key}[${index}]`, String(item));
              }
            }
          });
        }
      } 
      // Handle objects (but not Files)
      else if (typeof value === 'object' && value !== null && !(value instanceof File)) {
        formData.append(key, JSON.stringify(value));
      } 
      // Handle primitive values (strings, numbers, booleans, null)
      else if (!(value instanceof File)) {
        // Convert null to empty string for required fields
        const stringValue = value === null ? '' : String(value);
        // Always append required fields and passport fields even if empty (for backend validation)
        if (requiredFields.includes(key) || ['passportNumber', 'passportIssueDate', 'passportExpiryDate'].includes(key)) {
          console.log(`📤 Appending required field: ${key} = "${stringValue}"`);
          formData.append(key, stringValue);
        } else {
          // For other fields, only append if not empty
          if (stringValue !== '') {
            formData.append(key, stringValue);
          }
        }
      }
    });
    
    // Debug: Verify FormData entries for key fields
    console.log('📤 FormData entries (key fields):');
    for (const [key, value] of formData.entries()) {
      if (['firstName', 'lastName', 'passportNumber', 'passportIssueDate', 'passportExpiryDate'].includes(key)) {
        console.log(`  ${key}:`, value);
      }
    }

    // Append photo if provided (from parameter or employeeData)
    const photoToUpload = photoFile || employeeData.personalImage || employeeData.photo;
    if (photoToUpload && photoToUpload instanceof File) {
      formData.append('photo', photoToUpload);
    }
    
    // Append legal document files if provided
    if (employeeData.passportAttachment && employeeData.passportAttachment instanceof File) {
      formData.append('passportAttachment', employeeData.passportAttachment);
    }
    if (employeeData.nationalIdAttachment && employeeData.nationalIdAttachment instanceof File) {
      formData.append('nationalIdAttachment', employeeData.nationalIdAttachment);
    }
    if (employeeData.residencyAttachment && employeeData.residencyAttachment instanceof File) {
      formData.append('residencyAttachment', employeeData.residencyAttachment);
    }
    if (employeeData.insuranceAttachment && employeeData.insuranceAttachment instanceof File) {
      formData.append('insuranceAttachment', employeeData.insuranceAttachment);
    }
    if (employeeData.drivingLicenseAttachment && employeeData.drivingLicenseAttachment instanceof File) {
      formData.append('drivingLicenseAttachment', employeeData.drivingLicenseAttachment);
    }
    if (employeeData.labourIdAttachment && employeeData.labourIdAttachment instanceof File) {
      formData.append('labourIdAttachment', employeeData.labourIdAttachment);
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type for FormData, browser will set it with boundary
      },
      credentials: 'include',
      body: formData,
    });

    console.log('📥 Employee creation response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      let errorData = null;
      try {
        errorData = await response.json();
        console.error('❌ Backend error response:', errorData);
        errorMessage = errorData.message || errorData.error || errorMessage;
        if (errorData.errorCode) {
          errorMessage += ` (Error Code: ${errorData.errorCode})`;
        }
        if (errorData.details) {
          console.error('❌ Error details:', errorData.details);
        }
      } catch (e) {
        console.error('❌ Failed to parse error response:', e);
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    console.log('✅ Employee created successfully:', data);
    
    return {
      success: true,
      data: data.data || data,
      message: data.message || 'Employee created successfully'
    };
  } catch (error) {
    console.error('❌ Error creating employee:', error);
    return {
      success: false,
      message: error.message || 'Failed to create employee'
    };
  }
};

/**
 * Update employee with full Employee Directory data
 * @param {string} employeeId - The employee ID
 * @param {Object} employeeData - Updated employee data
 * @param {File} photoFile - Optional photo file
 * @returns {Promise} Employee data with success flag
 */
export const updateEmployee = async (employeeId, employeeData, photoFile = null) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found. Please login again.');
    }

    const url = `${API_BASE_URL}/employees/${employeeId}`;
    
    console.log('📝 Updating employee:', url, employeeData);

    // Create FormData for file upload
    const formData = new FormData();
    
    // File field names to skip (will be appended separately)
    const fileFields = ['photo', 'personalImage', 'passportAttachment', 'nationalIdAttachment', 
                        'residencyAttachment', 'insuranceAttachment', 'drivingLicenseAttachment', 'labourIdAttachment'];
    
    // Append all employee data fields (excluding file fields)
    Object.keys(employeeData).forEach(key => {
      // Skip file fields - they'll be appended separately
      if (fileFields.includes(key)) {
        return;
      }
      
      if (employeeData[key] !== null && employeeData[key] !== undefined && employeeData[key] !== '') {
        if (Array.isArray(employeeData[key])) {
          // Handle arrays (contacts, emails)
          employeeData[key].forEach((item, index) => {
            if (typeof item === 'object') {
              formData.append(`${key}[${index}]`, JSON.stringify(item));
            } else {
              formData.append(`${key}[${index}]`, item);
            }
          });
        } else if (typeof employeeData[key] === 'object' && !(employeeData[key] instanceof File)) {
          formData.append(key, JSON.stringify(employeeData[key]));
        } else if (!(employeeData[key] instanceof File)) {
          formData.append(key, employeeData[key]);
        }
      }
    });

    // Append photo if provided (from parameter or employeeData)
    const photoToUpload = photoFile || employeeData.personalImage || employeeData.photo;
    if (photoToUpload && photoToUpload instanceof File) {
      formData.append('photo', photoToUpload);
    }
    
    // Append legal document files if provided
    if (employeeData.passportAttachment && employeeData.passportAttachment instanceof File) {
      formData.append('passportAttachment', employeeData.passportAttachment);
    }
    if (employeeData.nationalIdAttachment && employeeData.nationalIdAttachment instanceof File) {
      formData.append('nationalIdAttachment', employeeData.nationalIdAttachment);
    }
    if (employeeData.residencyAttachment && employeeData.residencyAttachment instanceof File) {
      formData.append('residencyAttachment', employeeData.residencyAttachment);
    }
    if (employeeData.insuranceAttachment && employeeData.insuranceAttachment instanceof File) {
      formData.append('insuranceAttachment', employeeData.insuranceAttachment);
    }
    if (employeeData.drivingLicenseAttachment && employeeData.drivingLicenseAttachment instanceof File) {
      formData.append('drivingLicenseAttachment', employeeData.drivingLicenseAttachment);
    }
    if (employeeData.labourIdAttachment && employeeData.labourIdAttachment instanceof File) {
      formData.append('labourIdAttachment', employeeData.labourIdAttachment);
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type for FormData
      },
      credentials: 'include',
      body: formData,
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
    
    console.log('✅ Employee updated successfully');
    
    return {
      success: true,
      data: data.data || data,
      message: data.message || 'Employee updated successfully'
    };
  } catch (error) {
    console.error('❌ Error updating employee:', error);
    return {
      success: false,
      message: error.message || 'Failed to update employee'
    };
  }
};

/**
 * Get employee statistics
 * @returns {Promise} Statistics data with success flag
 */
export const getEmployeeStatistics = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found. Please login again.');
    }

    const url = `${API_BASE_URL}/employees/statistics`;
    
    console.log('📊 Fetching employee statistics from:', url);

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
    
    console.log('✅ Fetched employee statistics:', data.data);
    
    return {
      success: true,
      data: data.data || {},
      message: data.message
    };
  } catch (error) {
    console.error('❌ Error fetching employee statistics:', error);
    return {
      success: false,
      data: {
        totalEmployees: 0,
        activeEmployees: 0,
        inactiveEmployees: 0,
        totalDepartments: 0
      },
      message: error.message || 'Failed to fetch employee statistics'
    };
  }
};

/**
 * Delete employee (soft delete - deactivates)
 * @param {string} employeeId - Employee ID to delete
 * @returns {Promise} Delete response with success flag
 */
export const deleteEmployee = async (employeeId) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found. Please login again.');
    }

    const url = `${API_BASE_URL}/employees/${employeeId}`;
    
    console.log('🗑️ Deleting employee:', url);

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
      let errorData = null;
      try {
        errorData = await response.json();
        console.error('❌ Backend error response:', errorData);
        errorMessage = errorData.message || errorData.error || errorMessage;
        if (errorData.errorCode) {
          errorMessage += ` (Error Code: ${errorData.errorCode})`;
        }
        if (errorData.details) {
          console.error('❌ Error details:', errorData.details);
        }
      } catch (e) {
        console.error('❌ Failed to parse error response:', e);
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    console.log('✅ Employee deleted successfully:', data);
    
    return {
      success: true,
      data: data.data,
      message: data.message || 'Employee deleted successfully'
    };
  } catch (error) {
    console.error('❌ Error deleting employee:', error);
    throw error;
  }
};

/**
 * Restore employee (reactivate)
 * @param {string} employeeId - Employee ID to restore
 * @returns {Promise} Restore response with success flag
 */
export const restoreEmployee = async (employeeId) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found. Please login again.');
    }

    const url = `${API_BASE_URL}/employees/${employeeId}/restore`;
    
    console.log('♻️ Restoring employee:', url);

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      let errorData = null;
      try {
        errorData = await response.json();
        console.error('❌ Backend error response:', errorData);
        errorMessage = errorData.message || errorData.error || errorMessage;
        if (errorData.errorCode) {
          errorMessage += ` (Error Code: ${errorData.errorCode})`;
        }
        if (errorData.details) {
          console.error('❌ Error details:', errorData.details);
        }
      } catch (e) {
        console.error('❌ Failed to parse error response:', e);
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    console.log('✅ Employee restored successfully:', data);
    
    return {
      success: true,
      data: data.data,
      message: data.message || 'Employee restored successfully'
    };
  } catch (error) {
    console.error('❌ Error restoring employee:', error);
    throw error;
  }
};
