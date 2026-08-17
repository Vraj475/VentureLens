const { randomUUID } = require('crypto');
const Session = require('../models/Session.model');
const Report = require('../models/Report.model');
const { structureIdea, getNextQuestion, generateReportMarkdown } = require('../services/gemini.service');
const { challengeIdea } = require('../services/openrouter.service');
const { runFullAnalysis } = require('../services/analysis.service');

async function createSession(req, res, next) {
  try {
    const session = await Session.create({ sessionId: randomUUID(), uid: req.user.uid, status: 'idle', sessionTitle: 'New Analysis' });
    res.json({ sessionId: session.sessionId });
  } catch (err) { next(err); }
}

async function submitIdea(req, res, next) {
  try {
    const { rawIdea } = req.body;
    if (!rawIdea || rawIdea.trim().length < 10) return res.status(400).json({ error: 'Business idea is too short' });
    const session = await Session.findOne({ sessionId: req.params.id, uid: req.user.uid });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const structuredIdea = await structureIdea(rawIdea);
    const answeredSlots = [];
    const nextQ = getNextQuestion(structuredIdea, answeredSlots);
    const title = rawIdea.length > 50 ? rawIdea.slice(0, 47) + '...' : rawIdea;

    session.rawIdea = rawIdea;
    session.structuredIdea = structuredIdea;
    session.sessionTitle = title;
    session.status = 'interviewing';
    session.interviewMeta = { answeredSlots: [] };
    await session.save();

    res.json({ structuredIdea, nextQuestion: nextQ.question, options: nextQ.options, slot: nextQ.slot, questionNumber: 1, done: nextQ.done });
  } catch (err) { next(err); }
}

async function submitAnswer(req, res, next) {
  try {
    const { question, answer, slot } = req.body;
    const session = await Session.findOne({ sessionId: req.params.id, uid: req.user.uid });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    session.interviewAnswers.push({ question: question || '', answer: answer || '', slot: slot || '' });
    const answeredSlots = session.interviewAnswers.map(a => a.slot).filter(Boolean);
    const nextQ = getNextQuestion(session.structuredIdea || {}, answeredSlots);

    if (nextQ.done) {
      const profile = { ...(session.structuredIdea || {}) };
      session.interviewAnswers.forEach(a => { if (a.slot && a.answer) profile[a.slot] = a.answer; });
      session.businessProfile = profile;
      session.status = 'researching';
    }
    await session.save();
    res.json({ nextQuestion: nextQ.question, options: nextQ.options, slot: nextQ.slot, questionNumber: answeredSlots.length + 1, done: nextQ.done });
  } catch (err) { next(err); }
}

async function runAnalysis(req, res, next) {
  try {
    const session = await Session.findOne({ sessionId: req.params.id, uid: req.user.uid });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (!session.businessProfile || Object.keys(session.businessProfile).length === 0) {
      return res.status(400).json({ error: 'Complete the interview first' });
    }
    session.status = 'analyzing'; await session.save();
    const results = await runFullAnalysis(session.businessProfile);
    Object.assign(session, {
      analysis: results.analysis, feasibilityScore: results.feasibilityScore,
      risks: results.risks, assumptions: results.assumptions,
      ragResults: results.ragResults, webResults: results.webResults, status: 'complete'
    });
    await session.save();
    res.json(results);
  } catch (err) { next(err); }
}

async function challengeSession(req, res, next) {
  try {
    const session = await Session.findOne({ sessionId: req.params.id, uid: req.user.uid });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    const devilsAdvocate = await challengeIdea(session.businessProfile, session.feasibilityScore);
    session.devilsAdvocate = devilsAdvocate; await session.save();
    res.json({ devilsAdvocate });
  } catch (err) { next(err); }
}

async function generateReport(req, res, next) {
  try {
    const session = await Session.findOne({ sessionId: req.params.id, uid: req.user.uid });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    const reportMarkdown = await generateReportMarkdown(session);
    const reportId = randomUUID();
    await Report.create({ reportId, sessionId: session.sessionId, reportMarkdown, feasibilityScore: session.feasibilityScore, analysis: session.analysis, risks: session.risks, devilsAdvocate: session.devilsAdvocate, businessProfile: session.businessProfile });
    session.reportId = reportId; await session.save();
    res.json({ reportId });
  } catch (err) { next(err); }
}

async function getSession(req, res, next) {
  try {
    const session = await Session.findOne({ sessionId: req.params.id, uid: req.user.uid });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    console.log(`[GET SESSION] ${req.params.id} has ${(session.messages || []).length} messages in DB`);
    res.json(session);
  } catch (err) { next(err); }
}

async function syncSession(req, res, next) {
  try {
    const { messages, interviewPhase, currentQuestionData } = req.body;
    const update = {
      uiState: { interviewPhase: interviewPhase || null, currentQuestionData: currentQuestionData || null }
    };
    if (Array.isArray(messages)) update.messages = messages;

    const session = await Session.findOneAndUpdate(
      { sessionId: req.params.id, uid: req.user.uid },
      { $set: update },
      { new: true }
    );

    if (!session) {
      console.log(`[SYNC] No session found for ${req.params.id} — likely already deleted, ignoring.`);
      return res.status(404).json({ error: 'Session not found' });
    }

    console.log(`[SYNC] Atomic update ok. Session ${req.params.id} now has ${session.messages.length} messages.`);
    res.json({ success: true });
  } catch (err) {
    console.error('[SYNC] Failed:', err.message);
    next(err);
  }
}

async function deleteSession(req, res, next) {
  try {
    console.log(`[DELETE] Request to delete session ${req.params.id} from uid ${req.user.uid}`);
    const result = await Session.deleteOne({ sessionId: req.params.id, uid: req.user.uid });
    console.log(`[DELETE] Result: deletedCount=${result.deletedCount}`);
    if (result.deletedCount === 0) {
      console.warn(`[DELETE] Nothing was deleted — session may not exist or uid did not match.`);
    }
    res.json({ success: true, deleted: result.deletedCount });
  } catch (err) {
    console.error('[DELETE] Failed:', err.message);
    next(err);
  }
}

module.exports = { createSession, submitIdea, submitAnswer, runAnalysis, challengeSession, generateReport, getSession, syncSession, deleteSession };
