import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getSessions, getSessionDetail, syncSession as syncSessionAPI, deleteSession as deleteSessionAPI } from '../services/api';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [interviewPhase, setInterviewPhase] = useState('awaiting_idea');
  const [currentQuestionData, setCurrentQuestionData] = useState(null);
  const [inputLocked, setInputLocked] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sourcesAvailable, setSourcesAvailable] = useState(false);
  const [sessionSources, setSessionSources] = useState({ ragResults: [], webResults: [] });

  const abortControllerRef = useRef(null);
  const syncTimeoutRef = useRef(null);
  const syncInFlightRef = useRef(false);
  const syncQueuedRef = useRef(false);

  const messagesRef = useRef(messages);
  const activeSessionIdRef = useRef(activeSessionId);
  const interviewPhaseRef = useRef(interviewPhase);
  const currentQuestionDataRef = useRef(currentQuestionData);

  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { activeSessionIdRef.current = activeSessionId; }, [activeSessionId]);
  useEffect(() => { interviewPhaseRef.current = interviewPhase; }, [interviewPhase]);
  useEffect(() => { currentQuestionDataRef.current = currentQuestionData; }, [currentQuestionData]);

  function addMessage(msg) { setMessages(prev => [...prev, msg]); }
  function removeMessage(id) { setMessages(prev => prev.filter(m => m.id !== id)); }

  function updateMessageContent(id, chunkToAppend) {
    setMessages(prev => prev.map(m => (m.id === id ? { ...m, content: (m.content || '') + chunkToAppend } : m)));
  }

  function lockInput() { setInputLocked(true); }
  function unlockInput() { setInputLocked(false); }

  function toggleSources() { setSourcesOpen(prev => !prev); }
  function toggleProfile() { setProfileOpen(prev => !prev); }

  function markSourcesReady(sources) {
    setSourcesAvailable(true);
    setSessionSources(sources);
  }

  function newAbortController() {
    const controller = new AbortController();
    abortControllerRef.current = controller;
    return controller;
  }

  function stopGeneration() {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    setInputLocked(false);
    setIsGenerating(false);
  }

  async function refreshSessionsList() {
    try {
      const list = await getSessions();
      setSessions(list);
    } catch (err) {
      console.error('Failed to refresh sessions:', err.message);
    }
  }

  async function performSync(sid) {
    if (!sid) return;
    if (syncInFlightRef.current) {
      syncQueuedRef.current = true;
      return;
    }
    syncInFlightRef.current = true;
    try {
      await syncSessionAPI(sid, {
        messages: messagesRef.current,
        interviewPhase: interviewPhaseRef.current,
        currentQuestionData: currentQuestionDataRef.current
      });
    } catch (err) {
      console.error('[sync] failed:', err.message);
    } finally {
      syncInFlightRef.current = false;
      if (syncQueuedRef.current) {
        syncQueuedRef.current = false;
        performSync(sid);
      }
    }
  }

  async function flushSync() {
    const sid = activeSessionIdRef.current;
    if (!sid) return;
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = null;
    }
    await performSync(sid);
  }

  async function startNewSession() {
    await flushSync();

    setActiveSessionId(null);
    setMessages([]);
    setInterviewPhase('awaiting_idea');
    setCurrentQuestionData(null);
    setSourcesAvailable(false);
    setSessionSources({ ragResults: [], webResults: [] });
    setInputLocked(false);
    setIsGenerating(false);
    addMessage({
      id: 'greet-' + Date.now(),
      type: 'bot-text',
      content: 'Hi! Tell me your business idea and we will research it together.',
      timestamp: new Date().toISOString()
    });
  }

  async function switchToSession(sessionId) {
    if (sessionId === activeSessionIdRef.current) return;

    await flushSync();

    try {
      lockInput();
      const session = await getSessionDetail(sessionId);
      setActiveSessionId(sessionId);

      setMessages(
        Array.isArray(session.messages) && session.messages.length > 0
          ? session.messages
          : [{ id: 'greet-' + sessionId, type: 'bot-text', content: 'Hi! Tell me your business idea and we will research it together.', timestamp: new Date().toISOString() }]
      );

      const uiState = session.uiState || {};
      setInterviewPhase(uiState.interviewPhase || (session.status === 'complete' ? 'complete' : 'awaiting_idea'));
      setCurrentQuestionData(uiState.currentQuestionData || null);

      if (session.status === 'complete' && ((session.ragResults && session.ragResults.length) || (session.webResults && session.webResults.length))) {
        markSourcesReady({ ragResults: session.ragResults || [], webResults: session.webResults || [] });
      } else {
        setSourcesAvailable(false);
        setSessionSources({ ragResults: [], webResults: [] });
      }
    } catch (err) {
      console.error('Failed to load session:', err.message);
    } finally {
      unlockInput();
    }
  }

  async function deleteSession(sessionId) {
    console.log('[deleteSession] Requesting delete for', sessionId);
    try {
      const result = await deleteSessionAPI(sessionId);
      console.log('[deleteSession] Backend confirmed:', result);

      if (result.deleted === 0) {
        console.warn('[deleteSession] Backend reported nothing was deleted.');
        alert('Could not delete — the analysis may already be gone. Refreshing the list.');
      }

      if (sessionId === activeSessionIdRef.current) {
        setActiveSessionId(null);
        setMessages([]);
        setInterviewPhase('awaiting_idea');
        setCurrentQuestionData(null);
        setSourcesAvailable(false);
        setSessionSources({ ragResults: [], webResults: [] });
        addMessage({
          id: 'greet-' + Date.now(),
          type: 'bot-text',
          content: 'Hi! Tell me your business idea and we will research it together.',
          timestamp: new Date().toISOString()
        });
      }

      await refreshSessionsList();
    } catch (err) {
      console.error('[deleteSession] FAILED:', err.message, err.response?.data);
      alert('Could not delete this analysis. Check your connection and try again.');
      await refreshSessionsList();
    }
  }

  function revealAnalysisSequence(data, onComplete) {
    const { analysis, feasibilityScore, risks, assumptions, devilsAdvocate, ragResults, webResults } = data;
    markSourcesReady({ ragResults: ragResults || [], webResults: webResults || [] });

    setTimeout(() => {
      addMessage({ id: 'chart-' + Date.now(), type: 'chart', content: { analysis, feasibilityScore }, timestamp: new Date().toISOString() });

      setTimeout(() => {
        addMessage({ id: 'summary-' + Date.now(), type: 'bot-text', content: 'Here is the full breakdown across all dimensions.', timestamp: new Date().toISOString() });

        setTimeout(() => {
          addMessage({ id: 'risks-' + Date.now(), type: 'risk-cards', content: risks, timestamp: new Date().toISOString() });

          setTimeout(() => {
            addMessage({ id: 'assumptions-' + Date.now(), type: 'assumptions', content: assumptions, timestamp: new Date().toISOString() });

            const afterAssumptions = () => {
              setTimeout(() => {
                if (onComplete) {
                  onComplete();
                } else {
                  addMessage({ id: 'download-' + Date.now(), type: 'download', content: { sessionId: activeSessionIdRef.current }, timestamp: new Date().toISOString() });
                  setInputLocked(false);
                  setIsGenerating(false);
                  flushSync();
                }
              }, 500);
            };

            if (devilsAdvocate) {
              setTimeout(() => {
                addMessage({ id: 'devil-' + Date.now(), type: 'devil', content: devilsAdvocate, timestamp: new Date().toISOString() });
                afterAssumptions();
              }, 800);
            } else {
              afterAssumptions();
            }
          }, 900);
        }, 1000);
      }, 1200);
    }, 1500);
  }

  useEffect(() => {
    if (!activeSessionId) return;
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      performSync(activeSessionId);
    }, 700);
    return () => clearTimeout(syncTimeoutRef.current);
  }, [messages, interviewPhase, currentQuestionData, activeSessionId]);

  const value = {
    sessions, refreshSessionsList,
    activeSessionId, setActiveSessionId,
    messages, addMessage, removeMessage, updateMessageContent,
    interviewPhase, setInterviewPhase,
    currentQuestionData, setCurrentQuestionData,
    inputLocked, lockInput, unlockInput,
    isGenerating, setIsGenerating,
    sourcesOpen, toggleSources,
    profileOpen, toggleProfile,
    sourcesAvailable, sessionSources, markSourcesReady,
    startNewSession, switchToSession, deleteSession,
    revealAnalysisSequence, flushSync,
    newAbortController, stopGeneration
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
