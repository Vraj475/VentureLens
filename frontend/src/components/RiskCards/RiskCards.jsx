import './RiskCards.css';

function getSeverityClass(severity) {
  const normalized = severity.toLowerCase();
  if (normalized === 'high') return 'high';
  if (normalized === 'medium') return 'medium';
  return 'low';
}

function RiskCards({ risks }) {
  return (
    <div className="risk-cards">
      {risks.map((risk, index) => {
        const severityClass = getSeverityClass(risk.severity);
        return (
          <div key={index} className={`risk-card risk-card--${severityClass}`}>
            <span className={`risk-severity-badge risk-severity-badge--${severityClass}`}>
              {risk.severity}
            </span>
            <h3 className="risk-title">{risk.title}</h3>
            <p className="risk-description">{risk.description}</p>
            <div className="risk-mitigation-label">Mitigation</div>
            <p className="risk-mitigation-text">{risk.mitigation}</p>
          </div>
        );
      })}
    </div>
  );
}

export default RiskCards;
