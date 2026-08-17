const mongoose = require('mongoose');

const dimensionSchema = new mongoose.Schema(
  {
    score: Number,
    reasoning: String,
    evidence: [String],
  },
  { _id: false },
);

const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  uid: { type: String, required: true, index: true },
  status: {
    type: String,
    enum: ['idle', 'interviewing', 'researching', 'analyzing', 'complete'],
    default: 'idle',
  },
  sessionTitle: { type: String, default: 'New Analysis' },
  rawIdea: { type: String },
  structuredIdea: { type: Object, default: {} },
  interviewQuestions: [String],
  interviewAnswers: [{ question: String, answer: String, slot: String }],
  interviewMeta: { type: Object, default: {} },
  businessProfile: { type: Object, default: {} },
  analysis: {
    marketOpportunity: dimensionSchema,
    problemClarity: dimensionSchema,
    revenueModel: dimensionSchema,
    competition: dimensionSchema,
    founderFit: dimensionSchema,
    riskScore: dimensionSchema,
  },
  feasibilityScore: { type: Number },
  risks: { type: Array, default: [] },
  assumptions: { type: Array, default: [] },
  ragResults: { type: Array, default: [] },
  webResults: { type: Array, default: [] },
  devilsAdvocate: { type: String },
  reportId: { type: String },
  messages: { type: Array, default: [] },
  uiState: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
}, { versionKey: false });

const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);

module.exports = Session;
