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
      <div className="bot-avatar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="8" width="18" height="12" rx="2"></rect>
          <circle cx="8.5" cy="14" r="1.5" fill="currentColor"></circle>
          <circle cx="15.5" cy="14" r="1.5" fill="currentColor"></circle>
          <path d="M12 8V4"></path>
          <circle cx="12" cy="3" r="1" fill="currentColor"></circle>
        </svg>
      </div>
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
