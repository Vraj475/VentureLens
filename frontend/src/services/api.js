import axios from 'axios';
import { MOCK_SESSION, MOCK_REPORT_MARKDOWN } from '../data/mockData.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

export async function createSession() {
  // return (await api.post('/api/sessions')).data;
  return { sessionId: 'mock-session-123' };
}

export async function submitIdea(sessionId, rawIdea) {
  // return (await api.post(`/api/sessions/${sessionId}/idea`, { rawIdea })).data;
  return {
    structuredIdea: MOCK_SESSION.structuredIdea,
    nextQuestion: MOCK_SESSION.interviewAnswers[0].question,
    questionIndex: 1,
    totalQuestions: 5,
  };
}

export async function submitAnswer(sessionId, question, answer) {
  // return (await api.post(`/api/sessions/${sessionId}/answer`, { question, answer })).data;
  return {
    done: false,
    nextQuestion: 'Next mock question',
    questionIndex: 2,
    totalQuestions: 5,
  };
}

export async function triggerResearch(sessionId) {
  // return (await api.post(`/api/sessions/${sessionId}/research`)).data;
  return {
    ragResults: MOCK_SESSION.ragResults,
    webResults: MOCK_SESSION.webResults,
  };
}

export async function triggerAnalysis(sessionId) {
  // return (await api.post(`/api/sessions/${sessionId}/analyze`)).data;
  return {
    analysis: MOCK_SESSION.analysis,
    feasibilityScore: MOCK_SESSION.feasibilityScore,
    risks: MOCK_SESSION.risks,
    assumptions: MOCK_SESSION.assumptions,
  };
}

export async function challengeIdea(sessionId) {
  // return (await api.post(`/api/sessions/${sessionId}/challenge`)).data;
  return { devilsAdvocate: MOCK_SESSION.devilsAdvocate };
}

export async function generateReport(sessionId) {
  // return (await api.post(`/api/sessions/${sessionId}/report`)).data;
  return { reportId: 'mock-report-123' };
}

export async function getReport(reportId) {
  // return (await api.get(`/api/reports/${reportId}`)).data;
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
