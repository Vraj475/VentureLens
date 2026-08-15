import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import './ScoreRadar.css';

function getScoreTier(score) {
  if (score < 50) return 'low';
  if (score <= 70) return 'mid';
  return 'high';
}

function getBadgeLabel(score) {
  if (score < 50) return 'Needs Work';
  if (score <= 70) return 'Promising';
  return 'Strong';
}

function ScoreRadar({ analysis, feasibilityScore }) {
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
    <div className="score-radar">
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(255, 255, 255, 0.1)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text)', fontSize: 12 }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            dataKey="score"
            stroke="var(--accent)"
            strokeWidth={2}
            fill="var(--accent)"
            fillOpacity={0.25}
          />
        </RadarChart>
      </ResponsiveContainer>

      <div className={`score-radar-value score-radar-value--${tier}`}>
        {feasibilityScore}
      </div>
      <div className="score-radar-label">Feasibility Score</div>
      <span className={`score-radar-badge score-radar-badge--${tier}`}>
        {getBadgeLabel(feasibilityScore)}
      </span>
    </div>
  );
}

export default ScoreRadar;
