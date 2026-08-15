import './BotTextMessage.css';

function BotTextMessage({ content }) {
  return (
    <div className="bot-text-message">
      <div className="bot-avatar">V</div>
      <div className="bot-text-bubble">{content}</div>
    </div>
  );
}

export default BotTextMessage;
