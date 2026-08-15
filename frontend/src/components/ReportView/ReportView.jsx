import ReactMarkdown from 'react-markdown';
import './ReportView.css';

function ReportView({ markdown }) {
  return (
    <div className="report-view">
      <div className="report-content">
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </div>
    </div>
  );
}

export default ReportView;
