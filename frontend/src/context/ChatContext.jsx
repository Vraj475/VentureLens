import { createContext, useCallback, useContext, useState } from 'react';
import { MOCK_CHAT_MESSAGES, MOCK_SESSION } from '../data/mockData.js';

const ChatContext = createContext(null);

const delay = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

const GREETING = {
  id: 'greeting',
  type: 'bot-text',
  content: 'Hi! Tell me your business idea and we will research it together.',
  timestamp: new Date().toISOString(),
};

export function ChatProvider({ children }) {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [activeSessionTitle, setActiveSessionTitle] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputLocked, setInputLocked] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const addMessage = useCallback((messageObj) => {
    setMessages((prev) => [
      ...prev,
      {
        ...messageObj,
        id: messageObj.id || `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        timestamp: messageObj.timestamp || new Date().toISOString(),
      },
    ]);
  }, []);

  const removeTyping = useCallback(() => {
    setMessages((prev) => prev.filter((m) => m.type !== 'typing'));
  }, []);

  const addTyping = useCallback(() => {
    addMessage({ type: 'typing', content: null });
  }, [addMessage]);

  const lockInput = useCallback(() => setInputLocked(true), []);
  const unlockInput = useCallback(() => setInputLocked(false), []);

  const toggleSources = useCallback(() => {
    setSourcesOpen((prev) => !prev);
    setProfileOpen(false);
  }, []);

  const toggleProfile = useCallback(() => {
    setProfileOpen((prev) => !prev);
    setSourcesOpen(false);
  }, []);

  const startNewSession = useCallback(() => {
    const newId = `session-${Date.now()}`;
    setActiveSessionId(newId);
    setActiveSessionTitle(null);
    setMessages([{ ...GREETING, id: 'greeting', timestamp: new Date().toISOString() }]);
    setInputLocked(false);
    setSourcesOpen(false);
  }, []);

  const loadSession = useCallback((sessionId) => {
    setActiveSessionId(sessionId);
    if (sessionId === MOCK_SESSION.sessionId) {
      setActiveSessionTitle(MOCK_SESSION.sessionTitle);
      setMessages(MOCK_CHAT_MESSAGES);
      setInputLocked(true);
    } else {
      const session = sessions.find((s) => s.sessionId === sessionId);
      setActiveSessionTitle(session?.sessionTitle || 'Past Analysis');
      setMessages([{ ...GREETING, timestamp: new Date().toISOString() }]);
      setInputLocked(false);
    }
    setSourcesOpen(false);
    setProfileOpen(false);
  }, [sessions]);

  const setSessionsList = useCallback((list) => {
    setSessions(list);
  }, []);

  const clearSessions = useCallback(() => {
    setSessions([]);
    startNewSession();
  }, [startNewSession]);

  const revealAnalysisSequence = useCallback(
    async (analysisData, showDevil = true) => {
      addTyping();
      await delay(1500);
      removeTyping();
      addMessage({
        type: 'chart',
        content: {
          analysis: analysisData.analysis,
          feasibilityScore: analysisData.feasibilityScore,
        },
      });

      await delay(1200);
      addTyping();
      await delay(1000);
      removeTyping();
      addMessage({ type: 'risk-cards', content: analysisData.risks });

      await delay(900);
      addTyping();
      await delay(800);
      removeTyping();
      addMessage({ type: 'assumptions', content: analysisData.assumptions });

      if (showDevil) {
        await delay(800);
        addTyping();
        await delay(800);
        removeTyping();
        addMessage({ type: 'devil', content: analysisData.devilsAdvocate });
      }

      await delay(500);
      addMessage({
        type: 'download',
        content: {
          sessionId: activeSessionId || MOCK_SESSION.sessionId,
          reportId: 'mock-report-123',
        },
      });
      unlockInput();
    },
    [activeSessionId, addMessage, addTyping, removeTyping, unlockInput],
  );

  return (
    <ChatContext.Provider
      value={{
        sessions,
        activeSessionId,
        activeSessionTitle,
        setActiveSessionTitle,
        messages,
        inputLocked,
        sourcesOpen,
        profileOpen,
        setSessionsList,
        startNewSession,
        loadSession,
        addMessage,
        removeTyping,
        addTyping,
        lockInput,
        unlockInput,
        toggleSources,
        toggleProfile,
        revealAnalysisSequence,
        clearSessions,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
}
