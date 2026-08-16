import axios from 'axios';
import { auth } from '../firebase';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Standard instance for fast endpoints
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

// Long-timeout instance for analysis (Gemini calls take 30+ seconds)
const apiLong = axios.create({
  baseURL: BASE_URL,
  timeout: 120000,
  headers: { 'Content-Type': 'application/json' }
});

// Attach Firebase token to both instances
async function attachToken(config) {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken(false);
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.warn('Could not get auth token:', err.message);
  }
  return config;
}

api.interceptors.request.use(attachToken, Promise.reject);
apiLong.interceptors.request.use(attachToken, Promise.reject);

// Response error handler — convert network errors to readable messages
function handleError(error) {
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    console.error('Network Error — backend may not be running at', BASE_URL);
    const err = new Error(`Cannot reach the server. Make sure the backend is running on port ${BASE_URL.split(':').pop()}.`);
    err.isNetworkError = true;
    return Promise.reject(err);
  }
  if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
    console.error('Request timed out:', error.config?.url);
    const err = new Error('Request timed out. The analysis is taking longer than expected.');
    err.isTimeout = true;
    return Promise.reject(err);
  }
  if (error.response) {
    console.error('API Error:', error.response.status, error.config?.url, error.response.data);
  }
  return Promise.reject(error);
}

api.interceptors.response.use(r => r, handleError);
apiLong.interceptors.response.use(r => r, handleError);

// Connection check — call this before any API call chain
export async function checkConnection() {
  try {
    await axios.get(`${BASE_URL}/ping`, { timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}

export async function createSession() {
  const r = await api.post('/api/sessions');
  return r.data;
}

export async function submitIdea(sessionId, rawIdea) {
  const r = await api.post(`/api/sessions/${sessionId}/idea`, { rawIdea });
  return r.data;
}

export async function submitAnswer(sessionId, question, answer, slot) {
  const r = await api.post(`/api/sessions/${sessionId}/answer`, { question, answer, slot });
  return r.data;
}

// Use long-timeout instance — this calls Gemini 6+ times
export async function runAnalysis(sessionId) {
  const r = await apiLong.post(`/api/sessions/${sessionId}/analyze`);
  return r.data;
}

// Use long-timeout instance
export async function challengeIdea(sessionId) {
  const r = await apiLong.post(`/api/sessions/${sessionId}/challenge`);
  return r.data;
}

export async function generateReport(sessionId) {
  const r = await apiLong.post(`/api/sessions/${sessionId}/report`);
  return r.data;
}

export async function getReport(reportId) {
  const r = await api.get(`/api/reports/${reportId}`);
  return r.data;
}

export async function getMe() {
  const r = await api.get('/api/users/me');
  return r.data;
}

export async function createUser(data) {
  const r = await api.post('/api/users/create', data);
  return r.data;
}

export async function getSessions() {
  const r = await api.get('/api/users/sessions/list');
  return r.data;
}

export async function clearHistory() {
  const r = await api.delete('/api/users/sessions/all');
  return r.data;
}
