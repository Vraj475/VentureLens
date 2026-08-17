import { getReport } from '../../services/api';
import '../messages/BotTextMessage.css';
import './DownloadMessage.css';

function DownloadMessage({ content }) {
  const handleDownload = async () => {
    try {
      const report = await getReport(content.reportId);
      const text = report.reportMarkdown || 'Report unavailable.';
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'VentureLens-Report.txt';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err.message);
    }
  };

  return (
    <div className="download-message">
      <div className="bot-avatar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="8" width="18" height="12" rx="2"></rect>
          <circle cx="8.5" cy="14" r="1.5" fill="currentColor"></circle>
          <circle cx="15.5" cy="14" r="1.5" fill="currentColor"></circle>
          <path d="M12 8V4"></path>
          <circle cx="12" cy="3" r="1" fill="currentColor"></circle>
        </svg>
      </div>
      <div className="download-content">
        <div className="download-text">
          Your analysis is complete. Download the full report below.
        </div>
        <button type="button" className="download-btn" onClick={handleDownload}>
          <span>↓</span>
          Download Full Report
        </button>
      </div>
    </div>
  );
}

export default DownloadMessage;
