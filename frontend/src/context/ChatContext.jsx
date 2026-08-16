import { createContext, useCallback, useContext, useState } from 'react';

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

  // Sources availability state (Changes 2A & 2B)
  const [sourcesAvailable, setSourcesAvailable] = useState(false);
  const [sessionSources, setSessionSources] = useState({ ragResults: [], webResults: [] });

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

  // Change 6 — removeMessage by id
  const removeMessage = useCallback((id) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
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

  // Change 2B — markSourcesReady
  const markSourcesReady = useCallback((sources) => {
    setSourcesAvailable(true);
    setSessionSources(sources);
  }, []);

  const startNewSession = useCallback(() => {
    const newId = `session-${Date.now()}`;
    setActiveSessionId(newId);
    setActiveSessionTitle(null);
    setMessages([{ ...GREETING, id: 'greeting', timestamp: new Date().toISOString() }]);
    setInputLocked(false);
    setSourcesOpen(false);
    setSourcesAvailable(false);
    setSessionSources({ ragResults: [], webResults: [] });
  }, []);

  const loadSession = useCallback((sessionId) => {
    setActiveSessionId(sessionId);
    const session = sessions.find((s) => s.sessionId === sessionId);
    setActiveSessionTitle(session?.sessionTitle || 'Past Analysis');
    setMessages([{ ...GREETING, timestamp: new Date().toISOString() }]);
    setInputLocked(false);
    setSourcesOpen(false);
    setProfileOpen(false);
    setSourcesAvailable(false);
    setSessionSources({ ragResults: [], webResults: [] });
  }, [sessions]);

  const setSessionsList = useCallback((list) => {
    setSessions(list);
  }, []);

  const clearSessions = useCallback(() => {
    setSessions([]);
    startNewSession();
  }, [startNewSession]);

  // Change 6 — revealAnalysisSequence rewritten to accept full data object
  // and call markSourcesReady before the reveal sequence begins
  const revealAnalysisSequence = useCallback(
    async (data) => {
      const {
        analysis,
        feasibilityScore,
        risks,
        assumptions,
        devilsAdvocate,
        ragResults,
        webResults,
      } = data;

      // Immediately mark sources ready so the Sources button appears
      markSourcesReady({
        ragResults: ragResults || [],
        webResults: webResults || [],
      });

      // Sequential reveal with delays
      await delay(1500);
      addMessage({
        type: 'chart',
        content: { analysis, feasibilityScore },
      });

      await delay(1200);
      addMessage({
        type: 'bot-text',
        content: 'Here is the full breakdown across all dimensions.',
      });

      await delay(1000);
      addMessage({ type: 'risk-cards', content: risks });

      await delay(900);
      addMessage({ type: 'assumptions', content: assumptions });

      if (devilsAdvocate) {
        await delay(800);
        addMessage({ type: 'devil', content: devilsAdvocate });
      }

      await delay(500);
      addMessage({
        type: 'download',
        content: { sessionId: activeSessionId },
      });

      unlockInput();
    },
    [activeSessionId, addMessage, markSourcesReady, unlockInput],
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
        // Change 2C — expose new state and function
        sourcesAvailable,
        sessionSources,
        markSourcesReady,
        // Change 6 — expose removeMessage
        removeMessage,
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
