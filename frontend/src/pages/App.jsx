import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { getSessions } from '../services/api.js';
import { INTERVIEW_QUESTIONS, MOCK_SESSION } from '../data/mockData.js';
import Sidebar from '../components/Sidebar/Sidebar';
import ChatArea from '../components/ChatArea/ChatArea';
import SourcesPanel from '../components/SourcesPanel/SourcesPanel';
import ProfilePanel from '../components/ProfilePanel/ProfilePanel';
import './App.css';

const delay = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

function MainApp() {
  const { userProfile } = useAuth();
  const {
    sourcesOpen,
    profileOpen,
    toggleSources,
    toggleProfile,
    setSessionsList,
    startNewSession,
    addMessage,
    addTyping,
    removeTyping,
    lockInput,
    unlockInput,
    revealAnalysisSequence,
    setActiveSessionTitle,
  } = useChat();

  const [hasIdea, setHasIdea] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const processingRef = useRef(false);

  useEffect(() => {
    const init = async () => {
      const sessions = await getSessions();
      setSessionsList(sessions);
      startNewSession();
    };
    init();
  }, [setSessionsList, startNewSession]);

  const showQuestion = useCallback(
    (index) => {
      const question = INTERVIEW_QUESTIONS[index];
      if (question.type === 'options') {
        addMessage({ type: 'options', content: question.content });
      } else {
        addMessage({ type: 'bot-text', content: question.content });
      }
    },
    [addMessage],
  );

  const startAnalysis = useCallback(async () => {
    addTyping();
    await delay(1200);
    removeTyping();
    addMessage({
      type: 'bot-text',
      content: 'Perfect. Analysing your idea now — this will take a moment...',
    });
    await delay(800);
    await revealAnalysisSequence(
      MOCK_SESSION,
      userProfile?.settings?.devilsAdvocate !== false,
    );
  }, [addMessage, addTyping, removeTyping, revealAnalysisSequence, userProfile]);

  const handleUserResponse = useCallback(
    async (text) => {
      if (processingRef.current) return;
      processingRef.current = true;

      try {
        if (!hasIdea) {
          if (text.trim().length < 15) return;

          addMessage({ type: 'user-text', content: text });
          setActiveSessionTitle(
            text.length > 40 ? `${text.slice(0, 40)}...` : text,
          );
          lockInput();
          addTyping();
          await delay(1000);
          removeTyping();
          addMessage({
            type: 'bot-text',
            content: 'Great idea! Let me ask you a few questions to understand it better.',
          });
          await delay(500);
          showQuestion(0);
          setHasIdea(true);
          return;
        }

        addMessage({ type: 'user-text', content: text });
        lockInput();
        addTyping();
        await delay(900);
        removeTyping();

        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);

        if (nextIndex < 5) {
          showQuestion(nextIndex);
        } else {
          await startAnalysis();
        }
      } finally {
        processingRef.current = false;
      }
    },
    [
      hasIdea,
      currentQuestionIndex,
      addMessage,
      setActiveSessionTitle,
      lockInput,
      addTyping,
      removeTyping,
      showQuestion,
      startAnalysis,
    ],
  );

  const handleNewSession = useCallback(() => {
    startNewSession();
    setHasIdea(false);
    setCurrentQuestionIndex(0);
    processingRef.current = false;
    unlockInput();
  }, [startNewSession, unlockInput]);

  return (
    <div className="main-app">
      <Sidebar onNewAnalysis={handleNewSession} />
      <ChatArea onSend={handleUserResponse} onOptionSelect={handleUserResponse} />
      <SourcesPanel isOpen={sourcesOpen} onClose={toggleSources} />
      <ProfilePanel isOpen={profileOpen} onClose={toggleProfile} />
    </div>
  );
}

export default MainApp;
