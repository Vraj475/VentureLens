import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import '../messages/BotTextMessage.css';
import './ChartMessage.css';

function getScoreTier(score) {
  if (score < 50) return 'low';
  if (score <= 70) return 'mid';
  return 'high';
}

function ChartMessage({ content }) {
  const { analysis, feasibilityScore } = content;
  const data = [
    { subject: 'Market', score: analysis.marketOpportunity.score },
    { subject: 'Problem', score: analysis.problemClarity.score },
    { subject: 'Revenue', score: analysis.revenueModel.score },
    { subject: 'Competition', score: analysis.competition.score },
    { subject: 'Founder', score: analysis.founderFit.score },
    { subject: 'Risk', score: analysis.riskScore.score },
  ];
  const tier = getScoreTier(feasibilityScore);

  return (
    <div className="chart-message">
      <div className="bot-avatar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="8" width="18" height="12" rx="2"></rect>
          <circle cx="8.5" cy="14" r="1.5" fill="currentColor"></circle>
          <circle cx="15.5" cy="14" r="1.5" fill="currentColor"></circle>
          <path d="M12 8V4"></path>
          <circle cx="12" cy="3" r="1" fill="currentColor"></circle>
        </svg>
      </div>
      <div className="chart-card">
        <div className="chart-card-title">Feasibility Analysis</div>
        <div className="chart-score-row">
          <span className={`chart-score-value chart-score-value--${tier}`}>
            {feasibilityScore}
          </span>
          <span className="chart-score-max">/100</span>
        </div>
        <div className="chart-radar-wrap">
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={data}>
              <PolarGrid stroke="rgba(255, 255, 255, 0.08)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                dataKey="score"
                stroke="var(--accent)"
                strokeWidth={2}
                fill="var(--accent)"
                fillOpacity={0.2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default ChartMessage;
