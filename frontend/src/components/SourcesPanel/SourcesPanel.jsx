import { MOCK_SESSION } from '../../data/mockData.js';
import './SourcesPanel.css';

function SourcesPanel({ isOpen, onClose }) {
  const researchSources = MOCK_SESSION.ragResults;
  const webResults = MOCK_SESSION.webResults;

  return (
    <aside className={`sources-panel ${isOpen ? 'sources-panel--open' : ''}`}>
      <div className="sources-panel-header">
        <h2 className="sources-panel-title">Sources</h2>
        <button type="button" className="sources-panel-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>

      <div className="sources-panel-content">
        <div className="sources-section-label">Research Sources</div>
        {researchSources.map((source, index) => (
          <div key={index} className="sources-item">
            <div className="sources-item-title">
              {source.source.replace('.txt', '')}
            </div>
            <div className="sources-relevance">
              {Math.round(source.relevanceScore * 100)}% match
            </div>
            <div className="sources-item-detail">{source.content}</div>
          </div>
        ))}

        <div className="sources-section-label">Web Sources</div>
        {webResults.map((source, index) => (
          <div key={index} className="sources-item">
            <div className="sources-item-title">{source.title}</div>
            <a
              className="sources-item-link"
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {source.url}
            </a>
            <div className="sources-item-detail">{source.snippet}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default SourcesPanel;
