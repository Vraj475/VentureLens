const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportId: { type: String, required: true, unique: true },
  sessionId: { type: String, required: true },
  reportMarkdown: { type: String },
  feasibilityScore: { type: Number },
  analysis: { type: Object },
  risks: { type: Array, default: [] },
  assumptions: { type: Array, default: [] },
  devilsAdvocate: { type: String },
  businessProfile: { type: Object },
  createdAt: { type: Date, default: Date.now },
});

const Report = mongoose.models.Report || mongoose.model('Report', reportSchema);

module.exports = Report;
