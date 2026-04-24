import { apiClient } from '../utils/apiClient';
import { getToken } from './authAPI';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const downloadBlob = async (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const payrollSelfAPI = {
  getSelfPayslips: async () => {
    return apiClient.get('/payroll/self');
  },

  // HR/Admin style endpoint; returns a PDF blob
  downloadPayslip: async (payrollRunId, employeeId) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/payroll/runs/${payrollRunId}/payslip/${employeeId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
      throw new Error(err.message || 'Failed to download payslip');
    }

    const blob = await response.blob();
    await downloadBlob(blob, `payslip-${employeeId}-${payrollRunId}.pdf`);
    return { success: true };
  },
};

export default payrollSelfAPI;

