import './EvidencePanel.css';

function truncate(text, maxLength) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

function EvidencePanel({ ragResults, webResults }) {
  return (
    <div className="evidence-panel">
      <div>
        <div className="evidence-column-header">RAG Sources</div>
        {ragResults.map((result, index) => (
          <div key={index} className="evidence-source-card">
            <div className="evidence-source-title">
              {result.source.replace('.txt', '')}
            </div>
            <div className="evidence-source-meta">
              <span className="evidence-relevance-badge">
                {Math.round(result.relevanceScore * 100)}% match
              </span>
            </div>
            <div className="evidence-source-content">
              {truncate(result.content, 100)}
            </div>
          </div>
        ))}
      </div>

      <div>
        <div className="evidence-column-header">Web Sources</div>
        {webResults.map((result, index) => (
          <div key={index} className="evidence-web-card">
            <div className="evidence-source-title">{result.title}</div>
            <div className="evidence-web-url">{result.url}</div>
            <div className="evidence-source-content">
              {truncate(result.snippet, 120)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EvidencePanel;
