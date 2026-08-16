function computeFeasibilityScore(analysis) {
  if (!analysis) return 0;
  const safe = (dim) => {
    const v = analysis[dim]?.score;
    return (typeof v !== 'number' || isNaN(v)) ? 50 : Math.min(100, Math.max(0, v));
  };
  const score = safe('marketOpportunity')*0.20 + safe('problemClarity')*0.15 + safe('revenueModel')*0.15 +
                safe('competition')*0.15 + safe('founderFit')*0.10 + (100 - safe('riskScore'))*0.25;
  return Math.round(Math.min(100, Math.max(0, score)));
}

module.exports = { computeFeasibilityScore };
