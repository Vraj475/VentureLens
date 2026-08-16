import { useChat } from '../../context/ChatContext';
import './SourcesPanel.css';

function SourcesPanel({ isOpen, onClose }) {
  const { sessionSources } = useChat();
  const researchSources = sessionSources.ragResults;
  const webResults = sessionSources.webResults;

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
            <div className="sources-item-title">{source.query}</div>
            <div className="sources-item-detail">{source.content}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default SourcesPanel;
