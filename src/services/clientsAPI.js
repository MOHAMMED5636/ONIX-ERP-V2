// API service for clients management
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ClientsAPI {
  // Get all clients with optional search and pagination
  static async getClients(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.search) queryParams.append('search', params.search);
      if (params.corporate) queryParams.append('corporate', params.corporate);
      if (params.leadSource) queryParams.append('leadSource', params.leadSource);
      if (params.page) queryParams.append('page', params.page);


      
      if (params.limit) queryParams.append('limit', params.limit);
      
      const response = await fetch(`${API_BASE_URL}/clients?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching clients:', error);
      // For demo purposes, throw error to trigger fallback to mock data
      throw error;
    }
  }

  // Get a single client by ID
  static async getClient(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching client:', error);
      throw error;
    }
  }

  // Create a new client
  static async createClient(clientData) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Check if clientData is FormData (for file uploads) or regular object
      const isFormData = clientData instanceof FormData;
      
      const headers = {
        'Authorization': `Bearer ${token}`,
      };
      
      // Don't set Content-Type for FormData - browser will set it with boundary
      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(`${API_BASE_URL}/clients`, {
        method: 'POST',
        headers: headers,
        body: isFormData ? clientData : JSON.stringify(clientData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  }

  // Update an existing client (clientData can be plain object or FormData for document uploads)
  static async updateClient(id, clientData) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const isFormData = clientData instanceof FormData;
      const headers = {
        'Authorization': `Bearer ${token}`,
      };
      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
        method: 'PUT',
        headers,
        body: isFormData ? clientData : JSON.stringify(clientData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  }

  // Delete a client
  static async deleteClient(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting client:', error);
      // For demo purposes, simulate successful deletion when API is not available
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        console.log('API not available, simulating successful deletion for demo');
        return { success: true, message: 'Client deleted (demo mode)' };
      }
      throw error;
    }
  }

  // Search clients
  static async searchClients(query) {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching clients:', error);
      throw error;
    }
  }

  // Get client statistics
  static async getClientStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching client stats:', error);
      throw error;
    }
  }
}

// Alias for backward compatibility
ClientsAPI.getAllClients = ClientsAPI.getClients;

export default ClientsAPI;
