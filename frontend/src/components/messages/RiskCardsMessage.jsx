import '../messages/BotTextMessage.css';
import './RiskCardsMessage.css';

function getSeverityClass(severity) {
  const normalized = severity.toLowerCase();
  if (normalized === 'high') return 'high';
  if (normalized === 'medium') return 'medium';
  return 'low';
}

function RiskCardsMessage({ content }) {
  return (
    <div className="risk-cards-message">
      <div className="bot-avatar">V</div>
      <div className="risk-cards-content">
        <div className="risk-cards-label">Identified Risks</div>
        {content.map((risk, index) => {
          const severityClass = getSeverityClass(risk.severity);
          return (
            <div key={index} className={`risk-card-item risk-card-item--${severityClass}`}>
              <span className={`risk-card-badge risk-card-badge--${severityClass}`}>
                {risk.severity}
              </span>
              <div className="risk-card-item-title">{risk.title}</div>
              <div className="risk-card-item-desc">{risk.description}</div>
              <div className="risk-card-item-mitigation">{risk.mitigation}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RiskCardsMessage;
