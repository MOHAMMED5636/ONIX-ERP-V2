import { apiClient } from '../utils/apiClient';

const SALARY_BASE = '/salary';

const salaryAPI = {
  // HR/Admin: list structures for any employee
  // Manager/Employee: self-only (backend enforces)
  getEmployeeStructures: async (employeeId) => {
    return apiClient.get(`${SALARY_BASE}/employee/${employeeId}/structures`);
  },

  // Manager/Employee read-only self view
  getSelfSalaryDetails: async () => {
    return apiClient.get(`${SALARY_BASE}/self`);
  },

  createSalaryStructure: async (employeeId, payload) => {
    return apiClient.post(`${SALARY_BASE}/employee/${employeeId}/structures`, payload);
  },

  updateSalaryStructure: async (employeeId, structureId, payload) => {
    return apiClient.put(`${SALARY_BASE}/employee/${employeeId}/structures/${structureId}`, payload);
  },
};

export default salaryAPI;

