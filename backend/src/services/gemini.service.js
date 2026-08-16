const Groq = require('groq-sdk');
const parseGeminiJSON = require('../utils/parseGeminiJSON');
const retryWithBackoff = require('../utils/retryWithBackoff');
const delay = require('../utils/delay');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL_NAME = 'llama-3.3-70b-versatile';

async function callJSON(prompt) {
  return retryWithBackoff(async () => {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a helpful assistant that responds strictly in valid JSON.' },
        { role: 'user', content: prompt }
      ],
      model: MODEL_NAME,
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_completion_tokens: 2048,
    });
    return parseGeminiJSON(chatCompletion.choices[0]?.message?.content);
  });
}

async function callText(prompt) {
  return retryWithBackoff(async () => {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'user', content: prompt }
      ],
      model: MODEL_NAME,
      temperature: 0.5,
      max_completion_tokens: 4096,
    });
    return chatCompletion.choices[0]?.message?.content;
  });
}

async function structureIdea(rawIdea) {
  const prompt = `Analyze this business idea: "${rawIdea}"\nRespond with ONLY valid JSON, no markdown, no code blocks:\n{"productType":"SaaS|Mobile App|Physical Product|Marketplace|Service Business","targetCustomer":"...","problemStatement":"...","proposedSolution":"...","market":"...","revenueModel":"..."}`;
  return callJSON(prompt);
}

const QUESTION_SLOTS = ['targetCustomer', 'revenueModel', 'market', 'competition', 'founderAdvantage'];
const QUESTION_MAP = {
  targetCustomer: 'Who exactly is your target customer and how do they currently solve this problem?',
  revenueModel: 'How does money flow in your model — who pays, how much, and how often?',
  market: 'Which geography are you targeting first and why?',
  competition: 'Name two or three existing alternatives your customer might already use.',
  founderAdvantage: 'What is your specific advantage — why are you the right person to build this?'
};
const OPTIONS_MAP = { market: ['India — Tier 1 cities', 'India — Tier 2/3 cities', 'Global market', 'Specific region'] };

function getNextQuestion(structuredIdea, answeredSlots) {
  const safe = structuredIdea || {};
  for (const slot of QUESTION_SLOTS) {
    if (answeredSlots.includes(slot)) continue;
    if (safe[slot] && String(safe[slot]).trim().length > 15) { answeredSlots.push(slot); continue; }
    return { slot, question: QUESTION_MAP[slot], options: OPTIONS_MAP[slot] || null, done: false };
  }
  return { done: true, slot: null, question: null, options: null };
}

const DIM_PROMPTS = {
  marketOpportunity: 'Evaluate market size, growth, timing, demand signals.',
  problemClarity: 'Evaluate how clearly the problem is defined and how painful it is.',
  revenueModel: 'Evaluate pricing, unit economics, LTV:CAC potential.',
  competition: 'Evaluate competitors and differentiation.',
  founderFit: 'Evaluate founder-market fit — domain knowledge, network, execution.',
  riskScore: 'Rate major risks. High score means many serious risks.'
};

async function analyzeOneDimension(dimensionName, businessProfile, ragContext, webContext) {
  await delay(1200);
  const prompt = `Evaluate this dimension: ${dimensionName}\nFocus: ${DIM_PROMPTS[dimensionName]}\nProfile: ${JSON.stringify(businessProfile)}\nFramework knowledge: ${ragContext || 'none'}\nMarket research: ${webContext || 'none'}\nRespond ONLY valid JSON, no markdown:\n{"score":<0-100>,"reasoning":"2-3 sentences","evidence":["point1","point2","point3"]}`;
  return callJSON(prompt);
}

async function extractRisksAndAssumptions(businessProfile, analysis) {
  await delay(1200);
  const prompt = `Business: ${JSON.stringify(businessProfile)}\nAnalysis: ${JSON.stringify(analysis)}\nRespond ONLY valid JSON, no markdown:\n{"risks":[{"title":"...","severity":"High","description":"...","mitigation":"..."}],"assumptions":[{"assumption":"...","isSupported":true,"evidence":"..."}]}\nProvide 4 risks and 4 assumptions. severity must be exactly High, Medium, or Low. isSupported must be boolean.`;
  return callJSON(prompt);
}

async function generateReportMarkdown(sessionData) {
  await delay(1200);
  const prompt = `Write a business feasibility report in markdown.\nProfile: ${JSON.stringify(sessionData.businessProfile || {})}\nScore: ${sessionData.feasibilityScore || 0}/100\nAnalysis: ${JSON.stringify(sessionData.analysis || {})}\nRisks: ${JSON.stringify(sessionData.risks || [])}\nAssumptions: ${JSON.stringify(sessionData.assumptions || [])}\nSections with ## headings: Executive Summary, Business Profile, Market Analysis, Revenue Model Analysis, Competition Analysis, Risk Assessment, Key Assumptions, Validation Checklist, Conclusion. 700-900 words, plain markdown only.`;
  return callText(prompt);
}

module.exports = { structureIdea, getNextQuestion, QUESTION_SLOTS, analyzeOneDimension, generateReportMarkdown, extractRisksAndAssumptions };