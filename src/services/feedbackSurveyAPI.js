import { getToken } from './authAPI';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function getAuthHeaders() {
  const token = getToken();
  if (!token) throw new Error('No token found. Please login again.');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export async function listFeedbackSurveys() {
  const res = await fetch(`${API_BASE_URL}/feedback-surveys`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to load surveys');
  return { success: true, data: data.data || [] };
}

/** Admin/HR only */
export async function getFeedbackSurveyStats() {
  const res = await fetch(`${API_BASE_URL}/feedback-surveys/stats/summary`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to load statistics');
  return { success: true, data: data.data };
}

export async function getFeedbackSurvey(surveyId) {
  const res = await fetch(`${API_BASE_URL}/feedback-surveys/${encodeURIComponent(surveyId)}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to load survey');
  return { success: true, data: data.data };
}

/** Admin/HR only */
export async function createFeedbackSurvey(body) {
  const res = await fetch(`${API_BASE_URL}/feedback-surveys`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create survey');
  return { success: true, data: data.data, message: data.message };
}

export async function submitFeedbackResponses(surveyId, answers) {
  const res = await fetch(
    `${API_BASE_URL}/feedback-surveys/${encodeURIComponent(surveyId)}/responses`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ answers }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to submit responses');
  return { success: true, message: data.message };
}

/** Admin/HR only */
export async function deleteFeedbackSurvey(surveyId) {
  const res = await fetch(`${API_BASE_URL}/feedback-surveys/${encodeURIComponent(surveyId)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete survey');
  return { success: true, message: data.message };
}

export async function patchFeedbackSurvey(surveyId, body) {
  const res = await fetch(`${API_BASE_URL}/feedback-surveys/${encodeURIComponent(surveyId)}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update form');
  return { success: true, data: data.data };
}

export async function publishFeedbackSurvey(surveyId) {
  const res = await fetch(
    `${API_BASE_URL}/feedback-surveys/${encodeURIComponent(surveyId)}/publish`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to publish');
  return { success: true, message: data.message };
}

export async function duplicateFeedbackSurvey(surveyId) {
  const res = await fetch(
    `${API_BASE_URL}/feedback-surveys/${encodeURIComponent(surveyId)}/duplicate`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to duplicate');
  return { success: true, data: data.data };
}

export async function postSurveySubmission(surveyId, body) {
  const res = await fetch(
    `${API_BASE_URL}/feedback-surveys/${encodeURIComponent(surveyId)}/submissions`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(body),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to save submission');
  return { success: true, data };
}

export async function getSurveyAnalytics(surveyId) {
  const res = await fetch(
    `${API_BASE_URL}/feedback-surveys/${encodeURIComponent(surveyId)}/analytics`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to load analytics');
  return { success: true, data: data.data };
}

export function getSurveyExportCsvUrl(surveyId) {
  return `${API_BASE_URL}/feedback-surveys/${encodeURIComponent(surveyId)}/exports/csv`;
}

export async function downloadSurveyCsv(surveyId) {
  const res = await fetch(getSurveyExportCsvUrl(surveyId), {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Export failed');
  }
  return res.blob();
}

export async function createShareLink(surveyId, body = {}) {
  const res = await fetch(
    `${API_BASE_URL}/feedback-surveys/${encodeURIComponent(surveyId)}/share`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(body),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create share link');
  return { success: true, data: data.data };
}

export async function listShareLinks(surveyId) {
  const res = await fetch(
    `${API_BASE_URL}/feedback-surveys/${encodeURIComponent(surveyId)}/share`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to list links');
  return { success: true, data: data.data || [] };
}

export async function putSurveyActions(surveyId, actions) {
  const res = await fetch(
    `${API_BASE_URL}/feedback-surveys/${encodeURIComponent(surveyId)}/actions`,
    {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ actions }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to save actions');
  return { success: true, data: data.data };
}
