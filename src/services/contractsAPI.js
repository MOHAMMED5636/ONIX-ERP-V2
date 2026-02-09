// API service for contracts management
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ContractsAPI {
  // Get all contracts with optional filters and pagination
  static async getContracts(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      if (params.projectId) queryParams.append('projectId', params.projectId);
      if (params.clientId) queryParams.append('clientId', params.clientId);
      if (params.contractType) queryParams.append('contractType', params.contractType);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      
      const response = await fetch(`${API_BASE_URL}/contracts?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching contracts:', error);
      throw error;
    }
  }

  // Get a single contract by ID
  static async getContract(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/contracts/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching contract:', error);
      throw error;
    }
  }

  // Get contract by reference number
  static async getContractByReferenceNumber(referenceNumber) {
    try {
      if (!referenceNumber || !referenceNumber.trim()) {
        console.log('⚠️ Empty reference number provided');
        return { success: false, data: null };
      }

      const refNum = referenceNumber.trim();
      const url = `${API_BASE_URL}/contracts/by-reference?referenceNumber=${encodeURIComponent(refNum)}`;
      console.log('📡 Fetching contract from:', url);
      console.log('🔑 Token exists:', !!localStorage.getItem('token'));

      // Use the dedicated /by-reference endpoint for exact matching
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      console.log('📥 Response status:', response.status, response.statusText);

      const result = await response.json();
      console.log('✅ Contract API response:', result);
      
      // Backend returns:
      // - { success: true, data: contract, projectData: {...}, message: "..." } when found
      // - { success: false, data: null, message: "..." } when not found (status 200)
      // - { success: false, ... } with error status codes
      
      if (!response.ok) {
        // If HTTP error status (not 200), throw error
        console.error('❌ HTTP Error:', response.status, result);
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }
      
      // Return the result (which includes success, data, projectData, message)
      return result;
    } catch (error) {
      console.error('❌ Error fetching contract by reference number:', error);
      // Return error format that frontend expects
      return { success: false, data: null, error: error.message };
    }
  }

  // Create a new contract
  static async createContract(contractData, contractDocument = null, attachmentFiles = []) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Check if we have files to upload (contractDocument or attachmentFiles)
      const hasFiles = contractDocument instanceof File || (attachmentFiles && attachmentFiles.length > 0);
      
      let body;
      const headers = {
        'Authorization': `Bearer ${token}`,
      };
      
      if (hasFiles) {
        // Use FormData for file upload
        const formData = new FormData();
        
        // Add contract document (first file or contractDocument)
        if (contractDocument instanceof File) {
          formData.append('contractDocument', contractDocument);
        } else if (attachmentFiles && attachmentFiles.length > 0) {
          formData.append('contractDocument', attachmentFiles[0]);
        }
        
        // Add all other attachment files
        if (attachmentFiles && attachmentFiles.length > 0) {
          attachmentFiles.forEach((file, index) => {
            // Skip first file if it was already added as contractDocument
            if (index > 0 || !contractDocument) {
              formData.append(`attachment_${index}`, file);
            }
          });
        }
        
        // Always append critical fields so backend never misses them
        if (contractData.title != null && contractData.title !== '') {
          formData.append('title', String(contractData.title));
        }
        if (contractData.status != null && contractData.status !== '') {
          formData.append('status', String(contractData.status));
        }
        // Append all other fields (primitives as string so server gets consistent types)
        Object.keys(contractData).forEach(key => {
          if (key === 'title' || key === 'status') return; // already appended
          const value = contractData[key];
          if (value !== null && value !== undefined && value !== '') {
            if (typeof value === 'object' && !(value instanceof File)) {
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, typeof value === 'number' ? String(value) : value);
            }
          }
        });
        
        body = formData;
        // Don't set Content-Type for FormData - browser will set it with boundary
      } else {
        // Use JSON for regular data
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(contractData);
      }

      console.log('📤 Creating contract:', {
        url: `${API_BASE_URL}/contracts`,
        hasFiles: hasFiles,
        fileCount: attachmentFiles ? attachmentFiles.length : 0,
        contractDocument: contractDocument ? contractDocument.name : null,
      });

      const response = await fetch(`${API_BASE_URL}/contracts`, {
        method: 'POST',
        headers: headers,
        body: body,
      });

      console.log('📥 Contract creation response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          message: `HTTP error! status: ${response.status}` 
        }));
        console.error('❌ Contract creation error response:', {
          status: response.status,
          statusText: response.statusText,
          errorData: errorData,
          error: errorData.error,
          errorCode: errorData.errorCode,
          details: errorData.details,
        });
        
        // Create a more detailed error message
        let errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
        if (errorData.error) {
          errorMessage += `\nError: ${errorData.error}`;
        }
        if (errorData.errorCode) {
          errorMessage += `\nError Code: ${errorData.errorCode}`;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ Contract created successfully:', result);
      return result;
    } catch (error) {
      console.error('Error creating contract:', error);
      throw error;
    }
  }

  // Update an existing contract
  static async updateContract(id, contractData, contractDocument = null) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Check if we have a document to upload
      const isFormData = contractDocument instanceof File;
      
      let body;
      const headers = {
        'Authorization': `Bearer ${token}`,
      };
      
      if (isFormData) {
        // Use FormData for file upload
        const formData = new FormData();
        formData.append('contractDocument', contractDocument);
        
        // Append all other fields
        Object.keys(contractData).forEach(key => {
          const value = contractData[key];
          if (value !== null && value !== undefined && value !== '') {
            if (typeof value === 'object' && !(value instanceof File)) {
              // Stringify objects/arrays
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, value);
            }
          }
        });
        
        body = formData;
      } else {
        // Use JSON for regular data
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(contractData);
      }

      const response = await fetch(`${API_BASE_URL}/contracts/${id}`, {
        method: 'PUT',
        headers: headers,
        body: body,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating contract:', error);
      throw error;
    }
  }

  // Approve a contract
  static async approveContract(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/contracts/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error approving contract:', error);
      throw error;
    }
  }

  // Delete a contract
  static async deleteContract(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/contracts/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting contract:', error);
      throw error;
    }
  }

  // Load Out: Create project from contract
  static async loadOutContract(contractId) {
    try {
      const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/load-out`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error loading out contract:', error);
      throw error;
    }
  }

  // Get contract statistics
  static async getContractStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/contracts/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching contract stats:', error);
      throw error;
    }
  }
}

export default ContractsAPI;
