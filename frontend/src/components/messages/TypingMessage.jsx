import '../messages/BotTextMessage.css';
import './TypingMessage.css';

function TypingMessage() {
  return (
    <div className="typing-message">
      <div className="bot-avatar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="8" width="18" height="12" rx="2"></rect>
          <circle cx="8.5" cy="14" r="1.5" fill="currentColor"></circle>
          <circle cx="15.5" cy="14" r="1.5" fill="currentColor"></circle>
          <path d="M12 8V4"></path>
          <circle cx="12" cy="3" r="1" fill="currentColor"></circle>
        </svg>
      </div>
      <div className="typing-bubble">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}

export default TypingMessage;
