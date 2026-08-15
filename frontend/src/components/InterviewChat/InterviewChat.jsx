import { useState } from 'react';
import { MOCK_SESSION } from '../../data/mockData.js';
import './InterviewChat.css';

function InterviewChat({ onInterviewComplete }) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: MOCK_SESSION.interviewAnswers[0].question },
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [questionIndex, setQuestionIndex] = useState(1);
  const [answers, setAnswers] = useState([]);

  const handleSend = () => {
    const trimmed = currentInput.trim();
    if (!trimmed) return;

    const currentQuestion = MOCK_SESSION.interviewAnswers[questionIndex - 1].question;
    const newAnswer = { question: currentQuestion, answer: trimmed };
    const updatedAnswers = [...answers, newAnswer];
    const newMessages = [...messages, { role: 'user', text: trimmed }];

    if (questionIndex >= 5) {
      setMessages(newMessages);
      setAnswers(updatedAnswers);
      setCurrentInput('');
      setTimeout(() => {
        onInterviewComplete(updatedAnswers);
      }, 600);
      return;
    }

    const nextQuestion = MOCK_SESSION.interviewAnswers[questionIndex].question;
    setMessages([...newMessages, { role: 'ai', text: nextQuestion }]);
    setAnswers(updatedAnswers);
    setCurrentInput('');
    setQuestionIndex(questionIndex + 1);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="interview-chat">
      <div className="interview-progress">
        <div className="interview-progress-label">Question {questionIndex} of 5</div>
        <div className="interview-progress-dots">
          {[1, 2, 3, 4, 5].map((num) => (
            <span
              key={num}
              className={`interview-dot ${
                num < questionIndex
                  ? 'interview-dot--completed'
                  : num === questionIndex
                    ? 'interview-dot--current'
                    : ''
              }`}
            />
          ))}
        </div>
      </div>

      <div className="interview-messages">
        {messages.map((message, index) =>
          message.role === 'ai' ? (
            <div key={index} className="interview-message-row">
              <div className="interview-avatar">AI</div>
              <div className="interview-bubble interview-bubble--ai">{message.text}</div>
            </div>
          ) : (
            <div key={index} className="interview-message-row interview-message-row--user">
              <div className="interview-bubble interview-bubble--user">{message.text}</div>
            </div>
          ),
        )}
      </div>

      <div className="interview-input-area">
        <textarea
          className="interview-input"
          placeholder="Type your answer..."
          value={currentInput}
          onChange={(event) => setCurrentInput(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button type="button" className="interview-send" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
}

export default InterviewChat;
