import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import {
  createSession,
  submitIdea,
  submitAnswer,
  runAnalysis,
  challengeIdea,
  checkConnection,
} from '../services/api';
import Sidebar from '../components/Sidebar/Sidebar';
import ChatArea from '../components/ChatArea/ChatArea';
import SourcesPanel from '../components/SourcesPanel/SourcesPanel';
import ProfilePanel from '../components/ProfilePanel/ProfilePanel';
import './App.css';

function getErrorMessage(err) {
  if (err.isNetworkError) return 'Cannot reach the server. Please check that the backend is running.';
  if (err.isTimeout) return 'The analysis is taking longer than expected. Please try again.';
  if (err.response?.status === 401) return 'Session expired. Please refresh the page and log in again.';
  if (err.response?.status === 400) return err.response.data?.error || 'Invalid request. Please try again.';
  if (err.response?.status === 500) return 'Server error. Check the backend terminal for details.';
  return err.message || 'Something went wrong. Please try again.';
}

function MainApp() {
  const { userProfile } = useAuth();
  const {
    sourcesOpen,
    profileOpen,
    toggleSources,
    toggleProfile,
    startNewSession,
    addMessage,
    lockInput,
    unlockInput,
    revealAnalysisSequence,
    removeMessage,
  } = useChat();

  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [interviewPhase, setInterviewPhase] = useState('idle');
  const [currentQuestionData, setCurrentQuestionData] = useState(null);
  const processingRef = useRef(false);

  // ─── Mount: init chat UI only — no API call ───────────────────────────────
  useEffect(() => {
    startNewSession();
    setInterviewPhase('awaiting_idea');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Analysis pipeline ────────────────────────────────────────────────────
  const triggerAnalysis = useCallback(
    async (sessionId) => {
      lockInput();
      const typingId = `typing-analysis-${Date.now()}`;
      addMessage({ id: typingId, type: 'typing', content: null });

      addMessage({
        id: 'analyzing-msg',
        type: 'bot-text',
        content: 'Analysing your idea... This takes about 30-60 seconds. Please wait.',
        timestamp: new Date().toISOString()
      });

      try {
        const analysisResult = await runAnalysis(sessionId);
        removeMessage(typingId);

        const challengeResult = await challengeIdea(sessionId);

        removeMessage('analyzing-msg');
        revealAnalysisSequence({
          analysis: analysisResult.analysis,
          feasibilityScore: analysisResult.feasibilityScore,
          risks: analysisResult.risks,
          assumptions: analysisResult.assumptions,
          devilsAdvocate: challengeResult.devilsAdvocate,
          ragResults: analysisResult.ragResults || [],
          webResults: analysisResult.webResults || [],
        });

        setInterviewPhase('complete');
      } catch (err) {
        console.error('Analysis failed:', err);
        removeMessage(typingId);
        removeMessage('analyzing-msg');
        const errorMsg = getErrorMessage(err);
        addMessage({ id: `err-${Date.now()}`, type: 'bot-text', content: errorMsg });
        unlockInput();
      }
    },
    [addMessage, lockInput, removeMessage, revealAnalysisSequence, unlockInput],
  );

  // ─── Main send handler ────────────────────────────────────────────────────
  const handleSend = useCallback(
    async (text) => {
      if (processingRef.current) return;

      const isOnline = await checkConnection();
      if (!isOnline) {
        addMessage({
          id: Date.now().toString(),
          type: 'bot-text',
          content: 'Cannot reach the server. Please make sure the backend is running (npm run dev in the backend folder) and try again.',
          timestamp: new Date().toISOString()
        });
        unlockInput();
        return;
      }

      processingRef.current = true;

      addMessage({ id: `user-${Date.now()}`, type: 'user-text', content: text });
      lockInput();

      try {
        if (interviewPhase === 'awaiting_idea') {
          const typingId = `typing-${Date.now()}`;
          addMessage({ id: typingId, type: 'typing', content: null });

          try {
            // Always create a fresh session here — no race condition possible
            const sessionResult = await createSession();
            const sessionId = sessionResult.sessionId;
            setCurrentSessionId(sessionId);

            const result = await submitIdea(sessionId, text);
            removeMessage(typingId);

            if (result.done) {
              setInterviewPhase('analyzing');
              await triggerAnalysis(sessionId);
            } else {
              setInterviewPhase('interviewing');
              setCurrentQuestionData({
                question: result.nextQuestion,
                options: result.options,
                slot: result.slot,
              });
              if (result.options && result.options.length > 0) {
                addMessage({
                  id: `q-${Date.now()}`,
                  type: 'options',
                  content: { question: result.nextQuestion, options: result.options },
                });
              } else {
                addMessage({
                  id: `q-${Date.now()}`,
                  type: 'bot-text',
                  content: result.nextQuestion,
                });
              }
              unlockInput();
            }
          } catch (err) {
            console.error('Idea submission failed:', err);
            removeMessage(typingId);
            const errorMsg = getErrorMessage(err);
            addMessage({ id: `err-${Date.now()}`, type: 'bot-text', content: errorMsg });
            unlockInput();
            setInterviewPhase('awaiting_idea');
          }
        } else if (interviewPhase === 'interviewing') {
          const typingId = `typing-${Date.now()}`;
          addMessage({ id: typingId, type: 'typing', content: null });

          try {
            const result = await submitAnswer(
              currentSessionId,
              currentQuestionData?.question || '',
              text,
              currentQuestionData?.slot || '',
            );
            removeMessage(typingId);

            if (result.done) {
              setInterviewPhase('analyzing');
              addMessage({
                id: `analysis-intro-${Date.now()}`,
                type: 'bot-text',
                content: 'Perfect. Analysing your idea now — this will take a moment...',
              });
              await triggerAnalysis(currentSessionId);
            } else {
              setCurrentQuestionData({
                question: result.nextQuestion,
                options: result.options,
                slot: result.slot,
              });
              if (result.options && result.options.length > 0) {
                addMessage({
                  id: `q-${Date.now()}`,
                  type: 'options',
                  content: { question: result.nextQuestion, options: result.options },
                });
              } else {
                addMessage({
                  id: `q-${Date.now()}`,
                  type: 'bot-text',
                  content: result.nextQuestion,
                });
              }
              unlockInput();
            }
          } catch (err) {
            console.error('Answer submission failed:', err);
            removeMessage(typingId);
            const errorMsg = getErrorMessage(err);
            addMessage({ id: `err-${Date.now()}`, type: 'bot-text', content: errorMsg });
            unlockInput();
          }
        }
      } finally {
        processingRef.current = false;
      }
    },
    [
      interviewPhase,
      currentSessionId,
      currentQuestionData,
      addMessage,
      lockInput,
      unlockInput,
      removeMessage,
      triggerAnalysis,
    ],
  );

  // ─── New session ──────────────────────────────────────────────────────────
  const handleNewSession = useCallback(() => {
    startNewSession();
    setInterviewPhase('awaiting_idea');
    setCurrentSessionId(null);
    setCurrentQuestionData(null);
    processingRef.current = false;
  }, [startNewSession]);

  return (
    <div className="main-app">
      <Sidebar onNewAnalysis={handleNewSession} />
      <ChatArea onSend={handleSend} onOptionSelect={handleSend} />
      <SourcesPanel isOpen={sourcesOpen} onClose={toggleSources} />
      <ProfilePanel isOpen={profileOpen} onClose={toggleProfile} />
    </div>
  );
}

export default MainApp;
