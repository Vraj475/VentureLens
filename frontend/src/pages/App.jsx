import { useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import Sidebar from '../components/Sidebar/Sidebar';
import ChatArea from '../components/ChatArea/ChatArea';
import SourcesPanel from '../components/SourcesPanel/SourcesPanel';
import ProfilePanel from '../components/ProfilePanel/ProfilePanel';
import { createSession, submitIdea, submitAnswer, runAnalysis, challengeIdea, streamReportAPI, chatFollowUp } from '../services/api';
import './App.css';

export default function App() {
  const {
    messages, addMessage, removeMessage, updateMessageContent,
    interviewPhase, setInterviewPhase,
    currentQuestionData, setCurrentQuestionData,
    activeSessionId, setActiveSessionId,
    lockInput, unlockInput, setIsGenerating,
    revealAnalysisSequence, flushSync,
    startNewSession, refreshSessionsList,
    newAbortController, stopGeneration,
    sourcesOpen, profileOpen
  } = useChat();

  useEffect(() => {
    refreshSessionsList();
    if (messages.length === 0) startNewSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function isAbortError(err) {
    return err.name === 'CanceledError' || err.code === 'ERR_CANCELED' || err.message === 'canceled';
  }

  function errorText(err) {
    if (err.isNetworkError) return 'Cannot reach the server. Please check that the backend is running.';
    if (err.isTimeout) return 'This is taking longer than expected. Please try again.';
    if (err.response?.status === 401) return 'Session expired. Please refresh and log in again.';
    return err.response?.data?.error || err.message || 'Something went wrong. Please try again.';
  }

  function beginGenerating() { lockInput(); setIsGenerating(true); }
  function endGenerating() { unlockInput(); setIsGenerating(false); }

  function handleStop() {
    stopGeneration();
    addMessage({ id: 'stopped-' + Date.now(), type: 'bot-text', content: 'Generation stopped.', timestamp: new Date().toISOString() });
  }

  async function streamReportIntoChat(sessionId) {
    const streamMsgId = 'report-' + Date.now();
    addMessage({ id: streamMsgId, type: 'bot-text', content: '', timestamp: new Date().toISOString() });

    let reportId = null;
    try {
      reportId = await streamReportAPI(sessionId, (chunk) => {
        updateMessageContent(streamMsgId, chunk);
      });
    } catch (err) {
      console.error('Report streaming failed:', err.message);
      updateMessageContent(streamMsgId, '\n\n(Report generation failed. You can try again from the sidebar.)');
    }

    addMessage({ id: 'download-' + Date.now(), type: 'download', content: { sessionId, reportId }, timestamp: new Date().toISOString() });
    endGenerating();
    flushSync();
  }

  async function handleSend(text) {
    addMessage({ id: Date.now().toString(), type: 'user-text', content: text, timestamp: new Date().toISOString() });
    beginGenerating();

    if (interviewPhase === 'awaiting_idea') {
      const typingId = 'typing-' + Date.now();
      addMessage({ id: typingId, type: 'typing', content: null, timestamp: new Date().toISOString() });
      const controller = newAbortController();

      try {
        let sessionId = activeSessionId;
        if (!sessionId) {
          const sessionResult = await createSession();
          sessionId = sessionResult.sessionId;
          setActiveSessionId(sessionId);
          refreshSessionsList();
        }

        const result = await submitIdea(sessionId, text, controller.signal);
        removeMessage(typingId);
        refreshSessionsList();

        if (result.done) {
          setInterviewPhase('analyzing');
          await triggerAnalysis(sessionId);
        } else {
          setInterviewPhase('interviewing');
          setCurrentQuestionData({ question: result.nextQuestion, options: result.options, slot: result.slot });
          if (result.options && result.options.length > 0) {
            addMessage({ id: Date.now().toString(), type: 'options', content: { question: result.nextQuestion, options: result.options }, timestamp: new Date().toISOString() });
          } else {
            addMessage({ id: Date.now().toString(), type: 'bot-text', content: result.nextQuestion, timestamp: new Date().toISOString() });
          }
          endGenerating();
        }
      } catch (err) {
        removeMessage(typingId);
        if (isAbortError(err)) { endGenerating(); return; }
        addMessage({ id: Date.now().toString(), type: 'bot-text', content: errorText(err), timestamp: new Date().toISOString() });
        endGenerating();
      }

    } else if (interviewPhase === 'interviewing') {
      const typingId = 'typing-' + Date.now();
      addMessage({ id: typingId, type: 'typing', content: null, timestamp: new Date().toISOString() });
      const controller = newAbortController();

      try {
        const result = await submitAnswer(activeSessionId, currentQuestionData?.question || '', text, currentQuestionData?.slot || '', controller.signal);
        removeMessage(typingId);

        if (result.done) {
          setInterviewPhase('analyzing');
          addMessage({ id: Date.now().toString(), type: 'bot-text', content: 'Perfect. Analysing your idea now — this will take a moment...', timestamp: new Date().toISOString() });
          await triggerAnalysis(activeSessionId);
        } else {
          setCurrentQuestionData({ question: result.nextQuestion, options: result.options, slot: result.slot });
          if (result.options && result.options.length > 0) {
            addMessage({ id: Date.now().toString(), type: 'options', content: { question: result.nextQuestion, options: result.options }, timestamp: new Date().toISOString() });
          } else {
            addMessage({ id: Date.now().toString(), type: 'bot-text', content: result.nextQuestion, timestamp: new Date().toISOString() });
          }
          endGenerating();
        }
      } catch (err) {
        removeMessage(typingId);
        if (isAbortError(err)) { endGenerating(); return; }
        addMessage({ id: Date.now().toString(), type: 'bot-text', content: errorText(err), timestamp: new Date().toISOString() });
        endGenerating();
      }
    } else if (interviewPhase === 'complete' || interviewPhase === 'analyzing') {
      const typingId = 'typing-' + Date.now();
      addMessage({ id: typingId, type: 'typing', content: null, timestamp: new Date().toISOString() });

      try {
        const result = await chatFollowUp(activeSessionId, text);
        removeMessage(typingId);
        addMessage({ id: Date.now().toString(), type: 'bot-text', content: result.reply, timestamp: new Date().toISOString() });
        endGenerating();
      } catch (err) {
        removeMessage(typingId);
        addMessage({ id: Date.now().toString(), type: 'bot-text', content: errorText(err), timestamp: new Date().toISOString() });
        endGenerating();
      }
    }
  }

  async function triggerAnalysis(sessionId) {
    beginGenerating();
    const typingId = 'typing-analysis-' + Date.now();
    const controller = newAbortController();
    try {
      addMessage({ id: typingId, type: 'typing', content: null, timestamp: new Date().toISOString() });
      const analysisResult = await runAnalysis(sessionId, controller.signal);
      removeMessage(typingId);

      const devilsAdvocateEnabled = localStorage.getItem('venturelens_devils_advocate') !== 'false';
      let challengeResult = { devilsAdvocate: null };
      if (devilsAdvocateEnabled) {
        challengeResult = await challengeIdea(sessionId, controller.signal);
      }

      revealAnalysisSequence(
        {
          analysis: analysisResult.analysis,
          feasibilityScore: analysisResult.feasibilityScore,
          risks: analysisResult.risks,
          assumptions: analysisResult.assumptions,
          devilsAdvocate: challengeResult.devilsAdvocate,
          ragResults: analysisResult.ragResults || [],
          webResults: analysisResult.webResults || []
        },
        () => streamReportIntoChat(sessionId)
      );

      setInterviewPhase('complete');
      refreshSessionsList();
    } catch (err) {
      removeMessage(typingId);
      if (isAbortError(err)) { endGenerating(); return; }
      addMessage({ id: Date.now().toString(), type: 'bot-text', content: errorText(err), timestamp: new Date().toISOString() });
      endGenerating();
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <ChatArea onSend={handleSend} onOptionSelect={handleSend} onStop={handleStop} />
      {sourcesOpen && <SourcesPanel />}
      {profileOpen && <ProfilePanel />}
    </div>
  );
}
