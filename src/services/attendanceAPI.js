import { apiClient } from '../utils/apiClient';

/**
 * Get office location (for proximity check)
 */
export const getOfficeLocation = () => apiClient.get('/attendance/office-location');

/**
 * Get today's attendance status
 */
export const getTodayAttendance = () => apiClient.get('/attendance/today');

/**
 * Get attendance statistics
 */
export const getAttendanceStats = (params = {}) => {
  const searchParams = new URLSearchParams(params).toString();
  return apiClient.get(`/attendance/stats${searchParams ? `?${searchParams}` : ''}`);
};

/**
 * Get my attendance records
 */
export const getMyAttendance = (params = {}) => {
  const searchParams = new URLSearchParams(params).toString();
  return apiClient.get(`/attendance${searchParams ? `?${searchParams}` : ''}`);
};

/**
 * Mark attendance (check-in or check-out) with optional coordinates
 * @param {string} type - 'CHECK_IN' or 'CHECK_OUT'
 * @param {number|null} latitude - Optional latitude (location-based attendance is optional)
 * @param {number|null} longitude - Optional longitude (location-based attendance is optional)
 * @param {number|null} [accuracy] - Optional GPS accuracy in meters
 */
export const markAttendance = (type, latitude, longitude, accuracy) =>
  apiClient.post('/attendance', {
    type,
    ...(latitude !== null && latitude !== undefined && { latitude }),
    ...(longitude !== null && longitude !== undefined && { longitude }),
    ...(accuracy !== null && accuracy !== undefined && { accuracy }),
  });

/**
 * Get all employees' attendance for Admin (date filter, working hours).
 * @param {string|null} date - Optional date in YYYY-MM-DD format. If omitted, returns all dates.
 * @returns {Promise<{ success: boolean, data: Array }>}
 */
export const getAllAttendanceForAdmin = (date = null) => {
  const params = date ? { date } : {};
  const query = new URLSearchParams(params).toString();
  return apiClient.get(`/attendance/all${query ? `?${query}` : ''}`);
};
