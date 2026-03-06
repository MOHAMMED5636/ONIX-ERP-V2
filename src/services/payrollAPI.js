// API service for Payroll management
import { getToken } from './authAPI';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class PayrollAPI {
  // ============================================
  // PAYROLL SETTINGS
  // ============================================
  
  /**
   * Get payroll settings
   * GET /api/payroll/settings
   */
  static async getSettings() {
    try {
      const response = await fetch(`${API_BASE_URL}/payroll/settings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching payroll settings:', error);
      throw error;
    }
  }

  /**
   * Update payroll settings
   * PUT /api/payroll/settings
   */
  static async updateSettings(settingsData) {
    try {
      const response = await fetch(`${API_BASE_URL}/payroll/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify(settingsData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating payroll settings:', error);
      throw error;
    }
  }

  // ============================================
  // PAYROLL RUNS
  // ============================================

  /**
   * Get all payroll runs with filters
   * GET /api/payroll/runs?page=1&limit=10&status=DRAFT&year=2024&month=1
   */
  static async getPayrollRuns(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.status) queryParams.append('status', params.status);
      if (params.year) queryParams.append('year', params.year);
      if (params.month) queryParams.append('month', params.month);
      if (params.search) queryParams.append('search', params.search);
      
      const response = await fetch(`${API_BASE_URL}/payroll/runs?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching payroll runs:', error);
      throw error;
    }
  }

  /**
   * Get single payroll run by ID
   * GET /api/payroll/runs/:id
   */
  static async getPayrollRun(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/payroll/runs/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching payroll run:', error);
      throw error;
    }
  }

  /**
   * Create new payroll run
   * POST /api/payroll/runs
   * Body: { periodStart, periodEnd, periodMonth, periodYear }
   */
  static async createPayrollRun(payrollData) {
    try {
      const response = await fetch(`${API_BASE_URL}/payroll/runs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify(payrollData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating payroll run:', error);
      throw error;
    }
  }

  /**
   * Get payroll lines for a payroll run
   * GET /api/payroll/runs/:id/lines
   */
  static async getPayrollLines(payrollRunId, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      
      const response = await fetch(`${API_BASE_URL}/payroll/runs/${payrollRunId}/lines?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching payroll lines:', error);
      throw error;
    }
  }

  /**
   * Update payroll line (manual adjustments)
   * PUT /api/payroll/runs/:id/lines/:lineId
   */
  static async updatePayrollLine(payrollRunId, lineId, adjustmentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/payroll/runs/${payrollRunId}/lines/${lineId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify(adjustmentData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating payroll line:', error);
      throw error;
    }
  }

  // ============================================
  // APPROVAL WORKFLOW
  // ============================================

  /**
   * Approve payroll run - HR stage
   * POST /api/payroll/runs/:id/approve/hr
   */
  static async approveHR(payrollRunId, comments = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/payroll/runs/${payrollRunId}/approve/hr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ comments }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error approving payroll (HR):', error);
      throw error;
    }
  }

  /**
   * Approve payroll run - Finance stage
   * POST /api/payroll/runs/:id/approve/finance
   */
  static async approveFinance(payrollRunId, comments = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/payroll/runs/${payrollRunId}/approve/finance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ comments }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error approving payroll (Finance):', error);
      throw error;
    }
  }

  /**
   * Approve payroll run - Final stage
   * POST /api/payroll/runs/:id/approve/final
   */
  static async approveFinal(payrollRunId, comments = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/payroll/runs/${payrollRunId}/approve/final`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ comments }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error approving payroll (Final):', error);
      throw error;
    }
  }

  /**
   * Lock payroll run (after final approval)
   * POST /api/payroll/runs/:id/lock
   */
  static async lockPayroll(payrollRunId) {
    try {
      const response = await fetch(`${API_BASE_URL}/payroll/runs/${payrollRunId}/lock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error locking payroll:', error);
      throw error;
    }
  }

  // ============================================
  // REPORTS & PAYSLIPS
  // ============================================

  /**
   * Generate payslip PDF for employee
   * GET /api/payroll/runs/:id/payslip/:employeeId
   */
  static async generatePayslip(payrollRunId, employeeId) {
    try {
      const response = await fetch(`${API_BASE_URL}/payroll/runs/${payrollRunId}/payslip/${employeeId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Handle PDF blob response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payslip-${employeeId}-${payrollRunId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error('Error generating payslip:', error);
      throw error;
    }
  }

  /**
   * Generate payroll register report
   * GET /api/payroll/runs/:id/register
   */
  static async generateRegister(payrollRunId) {
    try {
      const response = await fetch(`${API_BASE_URL}/payroll/runs/${payrollRunId}/register`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Handle PDF blob response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payroll-register-${payrollRunId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error('Error generating payroll register:', error);
      throw error;
    }
  }
}

export default PayrollAPI;
