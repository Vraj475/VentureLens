import '../messages/BotTextMessage.css';
import './AssumptionsMessage.css';

function AssumptionsMessage({ content }) {
  return (
    <div className="assumptions-message">
      <div className="bot-avatar">V</div>
      <div className="assumptions-content">
        <div className="assumptions-label">Key Assumptions</div>
        {content.map((item, index) => (
          <div key={index} className="assumption-item">
            <div
              className={`assumption-icon ${
                item.isSupported ? 'assumption-icon--supported' : 'assumption-icon--unsupported'
              }`}
            >
              {item.isSupported ? '✓' : '✗'}
            </div>
            <div>
              <div className="assumption-text">{item.assumption}</div>
              <div className="assumption-evidence">{item.evidence}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AssumptionsMessage;
