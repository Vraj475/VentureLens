export const MOCK_SESSION = {
  sessionId: 'mock-session-123',
  status: 'complete',
  rawIdea:
    'A SaaS platform for small kirana stores in India to manage inventory, billing, and supplier orders using WhatsApp',
  structuredIdea: {
    productType: 'SaaS',
    targetCustomer: 'Small kirana shop owners in tier 2 and tier 3 cities in India',
    problemStatement:
      'Kirana stores lose revenue due to stockouts, manual billing errors, and no visibility into fast-moving vs slow-moving products',
    proposedSolution:
      'WhatsApp-native inventory and billing management with voice input support in regional languages',
    market: 'India, tier 2 and tier 3 cities, 12 million kirana stores',
    revenueModel: 'Subscription — Rs 299 per month per store',
  },
  interviewAnswers: [
    {
      question: 'Who exactly is your target customer and how do they currently solve this problem?',
      answer:
        'Small kirana shop owners, 30-55 years old, currently using pen and paper or basic Excel',
    },
    {
      question: 'How does money flow in your model — who pays, how much, and how often?',
      answer: 'Shop owners pay Rs 299 per month, billed annually at Rs 2999 to get one month free',
    },
    {
      question: 'Which geography are you targeting first and why?',
      answer:
        'Gujarat first because I have family connections in the trade and understand the market',
    },
    {
      question: 'Name two or three existing alternatives your customer might already be using',
      answer: 'Vyapar app, OkCredit, and some use Tally but it is too complex for them',
    },
    {
      question: 'What is your specific advantage — why are you the right person to build this?',
      answer:
        'I have deployed a real kirana management app in live shops in Ahmedabad and have direct feedback from shop owners',
    },
  ],
  ragResults: [
    {
      source: 'business-model-canvas.txt',
      relevanceScore: 0.91,
      content:
        'The Business Model Canvas defines nine building blocks including customer segments, value propositions, channels, customer relationships, revenue streams, key resources, key activities, key partnerships, and cost structure.',
      usedIn: 'revenueModel',
    },
    {
      source: 'tam-sam-som-methodology.txt',
      relevanceScore: 0.87,
      content:
        'TAM for India retail tech is estimated at $10B. The serviceable market for kirana-specific SaaS targeting tier 2 and tier 3 is approximately $800M given 12 million stores and willingness to pay.',
      usedIn: 'marketOpportunity',
    },
    {
      source: 'startup-failure-modes.txt',
      relevanceScore: 0.83,
      content:
        '42% of startups fail due to no market need. For B2SMB products in India, the top failure mode is low willingness to pay combined with high churn when free trials end.',
      usedIn: 'riskScore',
    },
    {
      source: 'india-startup-ecosystem.txt',
      relevanceScore: 0.79,
      content:
        'India has over 12 million kirana stores. Retail tech penetration remains below 8%. Government push for digital payments post-2016 has improved smartphone adoption in tier 2 cities.',
      usedIn: 'marketOpportunity',
    },
    {
      source: 'unit-economics-basics.txt',
      relevanceScore: 0.76,
      content:
        'For SaaS targeting small businesses, LTV to CAC ratio below 3x is a red flag. At Rs 299 per month with 18 month average retention, LTV is Rs 5382. CAC must stay below Rs 1800.',
      usedIn: 'revenueModel',
    },
  ],
  webResults: [
    {
      title: 'India Retail Tech Market 2024 — $3.2B and growing at 28% CAGR',
      url: 'https://example.com/india-retail-tech',
      snippet:
        'The Indian retail technology market reached $3.2 billion in 2024 driven by kirana digitisation initiatives and UPI adoption across tier 2 cities.',
      usedIn: 'marketOpportunity',
    },
    {
      title: 'Vyapar App raises Series B — 10 million SMB users in India',
      url: 'https://example.com/vyapar-funding',
      snippet:
        'Vyapar, a direct competitor, announced 10 million active users and a Series B round of $30M, validating the market but indicating strong competition.',
      usedIn: 'competition',
    },
    {
      title: 'WhatsApp Business API adoption in India SMBs — 2024 report',
      url: 'https://example.com/whatsapp-smb',
      snippet:
        'Over 15 million Indian small businesses actively use WhatsApp Business. API-based automation is emerging as the preferred channel for SMB software adoption.',
      usedIn: 'revenueModel',
    },
  ],
  analysis: {
    marketOpportunity: {
      score: 78,
      reasoning:
        '12 million kirana stores with sub-8% software penetration represents a large untapped market. Comparable SaaS plays like Vyapar have validated willingness to pay at this price point.',
      evidence: ['12M kirana stores in India', 'Retail tech CAGR 28%', 'Vyapar 10M users confirms demand'],
    },
    problemClarity: {
      score: 85,
      reasoning:
        'The problem is specific, measurable, and validated by real deployment. Stockouts and billing errors are documented pain points with clear revenue impact for store owners.',
      evidence: ['Live deployment in Ahmedabad shops', 'Pen and paper still dominant', 'Direct shop owner feedback cited'],
    },
    revenueModel: {
      score: 70,
      reasoning:
        'Subscription model is appropriate. Rs 299 per month is within validated willingness to pay range. Annual billing incentive reduces churn risk. LTV to CAC math is tight but workable.',
      evidence: ['Vyapar charges similar pricing', 'Annual plan reduces churn', 'LTV Rs 5382 at 18 month retention'],
    },
    competition: {
      score: 58,
      reasoning:
        'Vyapar and OkCredit are well-funded direct competitors with large user bases. WhatsApp-native angle is a differentiator but easy to replicate. Regional language support is a meaningful moat.',
      evidence: ['Vyapar Series B $30M', 'OkCredit 50M users', 'WhatsApp angle not yet dominant in category'],
    },
    founderFit: {
      score: 88,
      reasoning:
        'Founder has deployed a working kirana app in real shops, has family connections in the grocery trade, and demonstrated domain knowledge. This is unusually strong founder-market fit for an early stage.',
      evidence: ['Live app in Ahmedabad shops', 'Family grocery trade background', 'Direct user interviews completed'],
    },
    riskScore: {
      score: 62,
      reasoning:
        'Main risks are competition intensity and churn after free trial. B2SMB churn in India is historically high. Distribution at scale without a large sales team is unclear.',
      evidence: ['Vyapar has 10M head start', 'B2SMB churn 40% at 12 months avg', 'No distribution strategy articulated'],
    },
  },
  feasibilityScore: 74,
  risks: [
    {
      title: 'Competition from well-funded players',
      severity: 'High',
      description:
        'Vyapar and OkCredit have millions of users, established brand recognition, and Series B funding. Competing directly on features is not viable without significant capital.',
      mitigation:
        'Focus exclusively on the WhatsApp-native UX and regional language support as the primary differentiator. Do not compete on feature breadth.',
    },
    {
      title: 'High B2SMB churn after trial',
      severity: 'High',
      description:
        'Small business SaaS in India sees 35-45% annual churn. Kirana owners are price sensitive and switch costs are low once data is exported.',
      mitigation:
        'Lock in annual subscriptions with a discount. Build switching costs by making supplier order history and customer credit data sticky inside the app.',
    },
    {
      title: 'Low digital literacy of target customer',
      severity: 'Medium',
      description:
        'Shop owners aged 40-55 in tier 2 cities may resist adopting new software despite pain points. Onboarding dropout is a significant risk.',
      mitigation:
        'Build a 5-minute WhatsApp-based onboarding flow. Use voice commands in Gujarati and Hindi to reduce the learning curve.',
    },
    {
      title: 'Distribution at scale',
      severity: 'Medium',
      description:
        'Reaching 12 million stores without a field sales team is extremely difficult. Digital channels may not reach the core demographic effectively.',
      mitigation:
        'Partner with distributor salespeople and FMCG brand reps who visit stores daily. Offer a referral incentive per activated store.',
    },
  ],
  assumptions: [
    {
      assumption: 'Kirana owners will pay Rs 299 per month for inventory software',
      isSupported: true,
      evidence:
        'Vyapar pricing validation at similar price point with 10M users confirms willingness to pay exists in this segment',
    },
    {
      assumption: 'WhatsApp-native UX is a strong enough differentiator to acquire customers from Vyapar',
      isSupported: false,
      evidence:
        'No evidence found that Vyapar users are dissatisfied with its current interface. Switching cost may be higher than assumed',
    },
    {
      assumption: 'Tier 2 Gujarat market is large enough to reach Rs 1 crore ARR before raising',
      isSupported: true,
      evidence:
        'Gujarat has 800,000 kirana stores. 1 crore ARR requires 2,800 paying stores which is 0.35% penetration — achievable',
    },
    {
      assumption: 'Voice input in Gujarati is technically feasible with current APIs at low cost',
      isSupported: false,
      evidence:
        'Gujarati ASR accuracy on Google Speech API is 71% versus 94% for Hindi. May require significant post-processing investment',
    },
  ],
  devilsAdvocate:
    "1. Vyapar already owns this market. With 10 million users, a Series B war chest, and an established brand, Vyapar can copy any WhatsApp feature you ship within 90 days. You are not disrupting them — you are building a feature they will absorb.\n\n2. Your target customer does not want software. The pen-and-paper kirana owner has run their shop profitably for 20 years without your product. The pain point is real but the urgency to pay for a solution is not. Every demo will end with 'bhai, sochta hoon'.\n\n3. The unit economics do not survive distribution costs. At Rs 299 per month, you need 280 stores to make Rs 1 lakh MRR. Each store requires a physical visit, demo, and handholding during onboarding. Your CAC will be Rs 3,000 minimum which destroys your LTV-to-CAC ratio.\n\n4. WhatsApp Business API is not free. At scale, API message costs and Meta's pricing changes will erode your already thin margins. You are building on a platform you do not control.\n\n5. Regional language voice input is a feature promise you cannot deliver reliably. Gujarati ASR at 71% accuracy means 3 out of 10 voice entries will be wrong. One wrong inventory entry can cost a shop owner money — and they will blame your app.",
};

export const MOCK_REPORT_MARKDOWN = `
## Executive Summary

VentureLens analysis of the KiranaOS business idea returns a feasibility score of **74 out of 100**. The idea demonstrates strong founder-market fit, a validated problem, and a large addressable market. Key risks are competition intensity from Vyapar and OkCredit, and B2SMB churn dynamics in India. The idea is worth pursuing with a tight geographic focus and a WhatsApp-first distribution strategy before expanding features.

## Business Profile

**Product Type:** SaaS | **Market:** India Tier 2 and Tier 3 | **Revenue Model:** Subscription Rs 299/month

The proposed solution addresses inventory management, billing, and supplier ordering for kirana stores using a WhatsApp-native interface with regional language support. The founder has deployed a working version in real shops in Ahmedabad.

## Market Opportunity — Score: 78/100

India has 12 million kirana stores with software penetration below 8%. The retail tech market reached $3.2 billion in 2024 growing at 28% CAGR. Comparable plays like Vyapar have validated that store owners will pay for software at the Rs 200-400 per month price range.

## Revenue Model Analysis — Score: 70/100

The subscription model at Rs 299 per month is appropriate for the segment. Annual billing at Rs 2,999 reduces monthly churn. At 18-month average retention, LTV is Rs 5,382. CAC must be kept below Rs 1,800 to maintain a 3x ratio. Current distribution plan does not clearly achieve this.

## Competition Analysis — Score: 58/100

Vyapar (10M users, $30M Series B) and OkCredit (50M users) are dominant. The WhatsApp-native angle is differentiated but not defensible long-term. Regional language support is the strongest moat available.

## Risk Assessment

Four risks identified: Two High severity (competition, churn), two Medium severity (digital literacy, distribution). See Risk Cards for detailed mitigation strategies.

## Unsupported Assumptions

Two of four key assumptions are not supported by available evidence: WhatsApp as a strong enough differentiator from Vyapar, and Gujarati voice ASR reliability at acceptable cost.

## Validation Checklist — Next 90 Days

- [ ] Run 50 paid pilot stores in Ahmedabad at Rs 99/month to measure real churn
- [ ] Test WhatsApp onboarding with 10 store owners aged 40+ without your help
- [ ] Measure Gujarati voice ASR accuracy on real inventory item names
- [ ] Interview 20 Vyapar users to understand switching barriers
- [ ] Calculate real CAC after one month of manual outreach

## Conclusion

The idea has genuine commercial merit. The founder advantage is real and rare. The market is large. The risks are manageable but the competition risk is severe and must be addressed with a tight niche focus rather than a broad product strategy. Do not build everything. Go deep on WhatsApp onboarding in one city first.
`;
