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
 * Mark attendance (check-in or check-out) with coordinates
 * @param {string} type - 'CHECK_IN' or 'CHECK_OUT'
 * @param {number} latitude
 * @param {number} longitude
 * @param {number} [accuracy] - GPS accuracy in meters
 */
export const markAttendance = (type, latitude, longitude, accuracy) =>
  apiClient.post('/attendance', {
    type,
    latitude,
    longitude,
    accuracy: accuracy ?? null,
  });
