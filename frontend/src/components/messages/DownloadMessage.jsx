import { generateReport } from '../../services/api.js';
import '../messages/BotTextMessage.css';
import './DownloadMessage.css';

function DownloadMessage({ content }) {
  const handleDownload = async () => {
    await generateReport(content.sessionId);
  };

  return (
    <div className="download-message">
      <div className="bot-avatar">V</div>
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
