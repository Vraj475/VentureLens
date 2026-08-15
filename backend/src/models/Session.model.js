import mongoose from 'mongoose';

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
  sessionTitle: { type: String },
  status: {
    type: String,
    enum: ['idle', 'interviewing', 'researching', 'analyzing', 'complete'],
    default: 'idle',
  },
  rawIdea: String,
  structuredIdea: Object,
  interviewQuestions: [String],
  interviewAnswers: [{ question: String, answer: String }],
  businessProfile: Object,
  ragResults: [Object],
  webResults: [Object],
  analysis: {
    marketOpportunity: dimensionSchema,
    problemClarity: dimensionSchema,
    revenueModel: dimensionSchema,
    competition: dimensionSchema,
    founderFit: dimensionSchema,
    riskScore: dimensionSchema,
  },
  feasibilityScore: Number,
  risks: [Object],
  assumptions: [Object],
  devilsAdvocate: String,
  reportId: String,
  createdAt: { type: Date, default: Date.now },
});

sessionSchema.index({ uid: 1 });

const Session = mongoose.model('Session', sessionSchema);

export default Session;
