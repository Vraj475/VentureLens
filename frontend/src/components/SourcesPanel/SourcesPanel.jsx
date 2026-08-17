import { useChat } from '../../context/ChatContext';
import './SourcesPanel.css';

export default function SourcesPanel() {
  const { sourcesOpen, toggleSources, sessionSources } = useChat();
  const ragResults = sessionSources?.ragResults || [];
  const webResults = sessionSources?.webResults || [];

  function getDomain(url) {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  }

  const webLinks = [];
  webResults.forEach((w) => {
    (w.urls || []).forEach((url) => {
      if (url && !webLinks.find((l) => l.url === url)) {
        webLinks.push({ url, domain: getDomain(url) });
      }
    });
  });

  const hasAnySources = ragResults.length > 0 || webLinks.length > 0;

  return (
    <div className={`sources-panel ${sourcesOpen ? 'open' : ''}`}>
      <div className="panel-header">
        <span className="panel-title">Sources</span>
        <button className="close-btn" onClick={toggleSources}>×</button>
      </div>
      <div className="panel-body">
        {ragResults.length > 0 && (
          <>
            <div className="panel-section-label">Reference Frameworks</div>
            <div className="source-tags">
              {ragResults.map((r, i) => (
                <span key={i} className="source-tag">
                  {(r.source || 'Framework').replace('.txt', '').replace(/-/g, ' ')}
                </span>
              ))}
            </div>
          </>
        )}

        {webLinks.length > 0 && (
          <>
            <div className="panel-section-label">Web Sources</div>
            <div className="source-links">
              {webLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="source-link"
                >
                  {link.domain}
                </a>
              ))}
            </div>
          </>
        )}

        {!hasAnySources && <div className="no-sources">No sources available for this analysis.</div>}
      </div>
    </div>
  );
}
