import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReportView from '../components/ReportView/ReportView';
import DevilsAdvocate from '../components/DevilsAdvocate/DevilsAdvocate';
import { MOCK_SESSION, MOCK_REPORT_MARKDOWN } from '../data/mockData.js';
import './Report.css';

function Report() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="report-page">
      <div className="report-container">
        <div className="report-top-bar">
          <button
            type="button"
            className="report-logo"
            onClick={() => navigate('/')}
          >
            VentureLens
          </button>

          <div className="report-score-area">
            <span className="report-score-pill">
              Feasibility: {MOCK_SESSION.feasibilityScore}/100
            </span>

            <div className="report-actions">
              <button type="button" className="report-action-btn" onClick={handleCopyLink}>
                Copy Share Link
              </button>
              <button type="button" className="report-action-btn" onClick={handlePrint}>
                Print
              </button>
            </div>
          </div>
        </div>

        <ReportView markdown={MOCK_REPORT_MARKDOWN} />

        <div className="report-section-divider" />

        <DevilsAdvocate content={MOCK_SESSION.devilsAdvocate} />
      </div>

      {copied && <div className="report-toast">Link copied!</div>}
    </div>
  );
}

export default Report;
