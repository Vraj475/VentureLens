import axios from 'axios';
import { auth } from '../firebase.js';
import {
  MOCK_SESSION,
  MOCK_REPORT_MARKDOWN,
  MOCK_SESSIONS_LIST,
  MOCK_USER,
} from '../data/mockData.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

async function getAuthToken() {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.getIdToken();
}

async function authHeaders() {
  const token = await getAuthToken();
  return { Authorization: `Bearer ${token}` };
}

export async function getMe() {
  try {
    const headers = await authHeaders();
    return (await api.get('/api/users/me', { headers })).data;
  } catch {
    return MOCK_USER;
  }
}

export async function createUser(uid, email, displayName) {
  try {
    const headers = await authHeaders();
    return (
      await api.post('/api/users/create', { uid, email, displayName }, { headers })
    ).data;
  } catch {
    return { ...MOCK_USER, uid, email, displayName };
  }
}

export async function getSessions() {
  try {
    const headers = await authHeaders();
    return (await api.get('/api/sessions/list', { headers })).data;
  } catch {
    return MOCK_SESSIONS_LIST;
  }
}

export async function clearHistory() {
  try {
    const headers = await authHeaders();
    return (await api.delete('/api/sessions/all', { headers })).data;
  } catch {
    return { success: true };
  }
}

export async function createSession() {
  try {
    const headers = await authHeaders();
    return (await api.post('/api/sessions', {}, { headers })).data;
  } catch {
    return { sessionId: 'mock-session-123' };
  }
}

export async function submitIdea(sessionId, rawIdea) {
  // return (await api.post(`/api/sessions/${sessionId}/idea`, { rawIdea }, { headers: await authHeaders() })).data;
  return {
    structuredIdea: MOCK_SESSION.structuredIdea,
    nextQuestion: MOCK_SESSION.interviewAnswers[0].question,
    questionIndex: 1,
    totalQuestions: 5,
  };
}

export async function submitAnswer(sessionId, question, answer) {
  // return (await api.post(`/api/sessions/${sessionId}/answer`, { question, answer }, { headers: await authHeaders() })).data;
  return {
    done: false,
    nextQuestion: 'Next mock question',
    questionIndex: 2,
    totalQuestions: 5,
  };
}

export async function triggerResearch(sessionId) {
  // return (await api.post(`/api/sessions/${sessionId}/research`, {}, { headers: await authHeaders() })).data;
  return {
    ragResults: MOCK_SESSION.ragResults,
    webResults: MOCK_SESSION.webResults,
  };
}

export async function triggerAnalysis(sessionId) {
  // return (await api.post(`/api/sessions/${sessionId}/analyze`, {}, { headers: await authHeaders() })).data;
  return {
    analysis: MOCK_SESSION.analysis,
    feasibilityScore: MOCK_SESSION.feasibilityScore,
    risks: MOCK_SESSION.risks,
    assumptions: MOCK_SESSION.assumptions,
  };
}

export async function challengeIdea(sessionId) {
  // return (await api.post(`/api/sessions/${sessionId}/challenge`, {}, { headers: await authHeaders() })).data;
  return { devilsAdvocate: MOCK_SESSION.devilsAdvocate };
}

export async function generateReport(sessionId) {
  // return (await api.post(`/api/sessions/${sessionId}/report`, {}, { headers: await authHeaders() })).data;
  const blob = new Blob([MOCK_REPORT_MARKDOWN], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'VentureLens-Report.txt';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return { reportId: 'mock-report-123' };
}

export async function getReport(reportId) {
  // return (await api.get(`/api/reports/${reportId}`, { headers: await authHeaders() })).data;
  return {
    reportId: 'mock-report-123',
    sessionId: MOCK_SESSION.sessionId,
    reportMarkdown: MOCK_REPORT_MARKDOWN,
    feasibilityScore: MOCK_SESSION.feasibilityScore,
    analysis: MOCK_SESSION.analysis,
    risks: MOCK_SESSION.risks,
    devilsAdvocate: MOCK_SESSION.devilsAdvocate,
    businessProfile: MOCK_SESSION.structuredIdea,
    createdAt: new Date().toISOString(),
  };
}

export default api;
