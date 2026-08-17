import { useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import MessageRenderer from '../MessageRenderer/MessageRenderer';
import ChatInput from '../ChatInput/ChatInput';
import './ChatArea.css';

function ChatArea({ onSend, onOptionSelect, onStop }) {
  const {
    messages,
    activeSessionTitle,
    inputLocked,
    isGenerating,
    toggleSources,
    sourcesAvailable,
  } = useChat();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-area">
      <header className="chat-header">
        <h1 className="chat-header-title">
          {activeSessionTitle || 'VentureLens'}
        </h1>
        {sourcesAvailable && (
          <button type="button" className="chat-sources-btn" onClick={toggleSources}>
            📚 Sources
          </button>
        )}
      </header>

      <div className="chat-messages">
        {messages.map((message) => (
          <MessageRenderer
            key={message.id}
            message={message}
            onOptionSelect={onOptionSelect}
            optionsDisabled={inputLocked}
          />
        ))}
        <div ref={messagesEndRef} className="chat-messages-end" />
      </div>

      <ChatInput
        onSend={onSend}
        disabled={inputLocked}
        isGenerating={isGenerating}
        onStop={onStop}
      />
    </div>
  );
}

export default ChatArea;
