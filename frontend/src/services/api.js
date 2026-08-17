import axios from 'axios';
import { auth } from '../firebase';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: BASE_URL, timeout: 15000, headers: { 'Content-Type': 'application/json' } });
const apiLong = axios.create({ baseURL: BASE_URL, timeout: 120000, headers: { 'Content-Type': 'application/json' } });

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

api.interceptors.request.use(attachToken);
apiLong.interceptors.request.use(attachToken);

function handleError(error) {
  if (error.code === 'ERR_CANCELED' || error.name === 'CanceledError') {
    return Promise.reject(error);
  }
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    const err = new Error('Cannot reach the server. Make sure the backend is running.');
    err.isNetworkError = true;
    return Promise.reject(err);
  }
  if (error.code === 'ECONNABORTED' || (error.message || '').includes('timeout')) {
    const err = new Error('Request timed out.');
    err.isTimeout = true;
    return Promise.reject(err);
  }
  return Promise.reject(error);
}

api.interceptors.response.use(r => r, handleError);
apiLong.interceptors.response.use(r => r, handleError);

export async function checkConnection() {
  try { await axios.get(`${BASE_URL}/ping`, { timeout: 3000 }); return true; }
  catch { return false; }
}

export async function createSession() {
  const r = await api.post('/api/sessions');
  return r.data;
}

export async function submitIdea(sessionId, rawIdea, signal) {
  const r = await api.post(`/api/sessions/${sessionId}/idea`, { rawIdea }, { signal });
  return r.data;
}

export async function submitAnswer(sessionId, question, answer, slot, signal) {
  const r = await api.post(`/api/sessions/${sessionId}/answer`, { question, answer, slot }, { signal });
  return r.data;
}

export async function runAnalysis(sessionId, signal) {
  const r = await apiLong.post(`/api/sessions/${sessionId}/analyze`, {}, { signal });
  return r.data;
}

export async function challengeIdea(sessionId, signal) {
  const r = await apiLong.post(`/api/sessions/${sessionId}/challenge`, {}, { signal });
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

export async function createUser(uid, email, name) {
  const r = await api.post('/api/users', { uid, email, name });
  return r.data;
}

export async function getSessions() {
  const r = await api.get('/api/users/sessions/list');
  return r.data;
}

export async function getSessionDetail(sessionId) {
  const r = await api.get(`/api/sessions/${sessionId}`);
  return r.data;
}

export async function syncSession(sessionId, data) {
  const r = await api.put(`/api/sessions/${sessionId}/sync`, data);
  return r.data;
}

export async function deleteSession(sessionId) {
  const r = await api.delete(`/api/sessions/${sessionId}`);
  return r.data;
}

export async function clearHistory() {
  const r = await api.delete('/api/users/sessions/all');
  return r.data;
}

export async function streamReportAPI(sessionId, onChunk) {
  const user = auth.currentUser;
  const token = user ? await user.getIdToken(false) : null;

  const response = await fetch(`${BASE_URL}/api/sessions/${sessionId}/report/stream`, {
    method: 'POST',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok || !response.body) {
    throw new Error('Failed to start report stream');
  }

  const reportId = response.headers.get('X-Report-Id');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    if (chunk) onChunk(chunk);
  }

  return reportId;
}

export async function chatFollowUp(sessionId, message) {
  const r = await api.post(`/api/sessions/${sessionId}/chat`, { message });
  return r.data;
}
