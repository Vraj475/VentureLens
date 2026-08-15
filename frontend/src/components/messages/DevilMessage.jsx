import '../messages/BotTextMessage.css';
import './DevilMessage.css';

function DevilMessage({ content }) {
  return (
    <div className="devil-message">
      <div className="bot-avatar">V</div>
      <div className="devil-card">
        <div className="devil-header">Counter-Arguments</div>
        <div className="devil-content">{content}</div>
        <div className="devil-footer">Independent view via OpenRouter</div>
      </div>
    </div>
  );
}

export default DevilMessage;
