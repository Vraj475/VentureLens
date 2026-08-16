const { analyzeOneDimension, extractRisksAndAssumptions } = require('./gemini.service');
const { retrieveRelevantChunks } = require('./rag.service');
const { webResearch } = require('./openrouter.service');
const { computeFeasibilityScore } = require('./scoring.service');
const delay = require('../utils/delay');

const DIMENSIONS = ['marketOpportunity', 'problemClarity', 'revenueModel', 'competition', 'founderFit', 'riskScore'];
const FALLBACK = { score: 50, reasoning: 'Analysis unavailable for this dimension.', evidence: ['Could not complete'] };

async function runFullAnalysis(businessProfile) {
  const ideaText = [businessProfile.productType, businessProfile.targetCustomer, businessProfile.problemStatement, businessProfile.market].filter(Boolean).join(' ');
  const ragChunks = await retrieveRelevantChunks(ideaText);
  const ragContext = ragChunks.length ? ragChunks.map(c => `[${c.source}]: ${c.content}`).join('\n\n') : 'None';

  const webQueries = [
    `${businessProfile.market || 'India'} ${businessProfile.productType || ''} market size 2024`,
    `${businessProfile.targetCustomer || ''} startup competitors India`,
    `${businessProfile.problemStatement || ''} existing solutions`
  ];
  let webResults = [], webContext = 'None';
  try { webResults = await webResearch(webQueries); webContext = webResults.map(r => `[${r.query}]: ${r.content}`).join('\n\n'); }
  catch (err) { console.warn('Web research failed:', err.message); }

  const analysis = {};
  for (const dim of DIMENSIONS) {
    try { analysis[dim] = await analyzeOneDimension(dim, businessProfile, ragContext, webContext); }
    catch (err) { console.error(`Dimension ${dim} failed:`, err.message); analysis[dim] = { ...FALLBACK }; }
    await delay(1200);
  }

  const feasibilityScore = computeFeasibilityScore(analysis);
  let risks = [], assumptions = [];
  try {
    const extracted = await extractRisksAndAssumptions(businessProfile, analysis);
    risks = extracted.risks || []; assumptions = extracted.assumptions || [];
  } catch (err) {
    console.error('Risk extraction failed:', err.message);
    risks = [{ title: 'Analysis incomplete', severity: 'Medium', description: 'Could not extract risks.', mitigation: 'Re-run analysis.' }];
  }

  return { analysis, feasibilityScore, risks, assumptions, ragResults: ragChunks, webResults };
}

module.exports = { runFullAnalysis };
