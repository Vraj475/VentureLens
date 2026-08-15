import '../messages/BotTextMessage.css';
import './TypingMessage.css';

function TypingMessage() {
  return (
    <div className="typing-message">
      <div className="bot-avatar">V</div>
      <div className="typing-bubble">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}

export default TypingMessage;
