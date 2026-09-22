import { API_BASE_URL } from '../config/constants';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export async function apiStartExam(userId, name) {
  return request('/exam/start', {
    method: 'POST',
    body: JSON.stringify({ userId, name }),
  });
}

export async function apiFetchQuestions() {
  return request('/exam/mcq');
}

export async function apiSubmitAnswer(sessionId, questionId, selectedAnswer) {
  try {
    const data = await request('/exam/answer', {
      method: 'POST',
      body: JSON.stringify({ sessionId, questionId, selectedAnswer }),
    });
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      message: err.message,
      data: err.data,
    };
  }
}

export async function apiSubmitExam(sessionId) {
  return request('/exam/submit', {
    method: 'POST',
    body: JSON.stringify({ sessionId }),
  });
}
