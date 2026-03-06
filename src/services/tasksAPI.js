import { getToken } from './authAPI';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export async function deleteTask(taskId) {
  const token = getToken();
  if (!token) {
    throw new Error('No token found. Please login again.');
  }

  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.success) {
    throw new Error(data?.message || `Failed to delete task (status ${response.status})`);
  }

  return data;
}

export default {
  deleteTask,
};

