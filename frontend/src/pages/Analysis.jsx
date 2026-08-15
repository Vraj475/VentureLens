import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InterviewChat from '../components/InterviewChat/InterviewChat';
import ResearchProgress from '../components/ResearchProgress/ResearchProgress';
import ScoreRadar from '../components/ScoreRadar/ScoreRadar';
import EvidencePanel from '../components/EvidencePanel/EvidencePanel';
import RiskCards from '../components/RiskCards/RiskCards';
import AssumptionsChecker from '../components/AssumptionsChecker/AssumptionsChecker';
import DevilsAdvocate from '../components/DevilsAdvocate/DevilsAdvocate';
import { MOCK_SESSION } from '../data/mockData.js';
import './Analysis.css';

function Analysis() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('interviewing');

  return (
    <div className="analysis-page">
      <div className="analysis-container">
        <div className="analysis-skip-row">
          <button
            type="button"
            className="analysis-skip-btn"
            onClick={() => setPhase('researching')}
          >
            → Skip to Research
          </button>
          <button
            type="button"
            className="analysis-skip-btn"
            onClick={() => setPhase('results')}
          >
            → Skip to Results
          </button>
          <button
            type="button"
            className="analysis-skip-btn"
            onClick={() => navigate('/report/mock-report-123')}
          >
            → Skip to Report
          </button>
        </div>

        {phase === 'interviewing' && (
          <>
            <h1 className="analysis-section-heading">Tell us about your idea</h1>
            <InterviewChat onInterviewComplete={() => setPhase('researching')} />
          </>
        )}

        {phase === 'researching' && (
          <ResearchProgress onResearchComplete={() => setPhase('results')} />
        )}

        {phase === 'results' && (
          <div className="analysis-results">
            <ScoreRadar
              analysis={MOCK_SESSION.analysis}
              feasibilityScore={MOCK_SESSION.feasibilityScore}
            />

            <div>
              <h2 className="analysis-subheading">Evidence Used</h2>
              <EvidencePanel
                ragResults={MOCK_SESSION.ragResults}
                webResults={MOCK_SESSION.webResults}
              />
            </div>

            <div>
              <h2 className="analysis-subheading">Identified Risks</h2>
              <RiskCards risks={MOCK_SESSION.risks} />
            </div>

            <div>
              <h2 className="analysis-subheading">Key Assumptions</h2>
              <AssumptionsChecker assumptions={MOCK_SESSION.assumptions} />
            </div>

            <div>
              <h2 className="analysis-subheading">Counter-Arguments</h2>
              <DevilsAdvocate content={MOCK_SESSION.devilsAdvocate} />
            </div>

            <button
              type="button"
              className="analysis-report-btn"
              onClick={() => navigate('/report/mock-report-123')}
            >
              Generate Full Report →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Analysis;
