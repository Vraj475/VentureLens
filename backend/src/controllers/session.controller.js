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

async function streamReport(req, res, next) {
  try {
    const session = await Session.findOne({ sessionId: req.params.id, uid: req.user.uid });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const reportId = randomUUID();

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Report-Id', reportId);

    const prompt = `Write a business feasibility report for this analysis.
Business Profile: ${JSON.stringify(session.businessProfile || {})}
Feasibility Score: ${session.feasibilityScore || 0}/100
Analysis: ${JSON.stringify(session.analysis || {})}
Risks: ${JSON.stringify(session.risks || [])}
Assumptions: ${JSON.stringify(session.assumptions || [])}

Cover: executive summary, market analysis, revenue model, competition, risk assessment, key assumptions, a validation checklist, and a conclusion. 700-900 words.`;

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        stream: true,
        temperature: 0.5,
        max_tokens: 2000,
        messages: [
          {
            role: 'system',
            content: 'You are a senior business analyst writing a report as a plain chat message. Write in clean plain text only. Do NOT use any markdown syntax: no **, no ##, no bullet symbols like - or *, no markdown of any kind. Use plain section titles in capital letters followed by a colon, for example EXECUTIVE SUMMARY:, then a blank line, then the paragraph. For lists, use plain numbers like 1. 2. 3. Write naturally, as if typing a message.'
          },
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!groqResponse.ok || !groqResponse.body) {
      res.write('Sorry, I could not generate the report right now. Please try again.');
      return res.end();
    }

    const reader = groqResponse.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const jsonStr = trimmed.replace('data:', '').trim();
        if (jsonStr === '[DONE]') continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const token = parsed.choices?.[0]?.delta?.content || '';
          if (token) {
            fullText += token;
            res.write(token);
          }
        } catch (e) {
          // incomplete JSON line, will complete on next chunk — ignore
        }
      }
    }

    res.end();

    await Report.create({
      reportId,
      sessionId: session.sessionId,
      reportMarkdown: fullText,
      feasibilityScore: session.feasibilityScore,
      analysis: session.analysis,
      risks: session.risks,
      devilsAdvocate: session.devilsAdvocate,
      businessProfile: session.businessProfile
    });
    session.reportId = reportId;
    await session.save();
  } catch (err) {
    console.error('[STREAM REPORT] Failed:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to stream report' });
    } else {
      res.end();
    }
  }
}

async function chatFollowUp(req, res, next) {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) return res.status(400).json({ error: 'Message is required' });

    const session = await Session.findOne({ sessionId: req.params.id, uid: req.user.uid });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const recentTextMessages = (session.messages || [])
      .filter(m => m.type === 'user-text' || m.type === 'bot-text')
      .slice(-6);

    const historyText = recentTextMessages
      .map(m => `${m.type === 'user-text' ? 'User' : 'Assistant'}: ${typeof m.content === 'string' ? m.content : ''}`)
      .join('\n');

    const topRisks = (session.risks || []).slice(0, 2).map(r => r.title).join(', ') || 'none identified yet';

    const systemPrompt = `You are VentureLens, an assistant helping a founder validate this specific business idea. Stay strictly on topic — business strategy, this idea, market research, government schemes, funding, or entrepreneurship in general.

Business Profile: ${JSON.stringify(session.businessProfile || {})}
Feasibility Score: ${session.feasibilityScore ?? 'not yet scored'}/100
Top Risks: ${topRisks}

Recent conversation:
${historyText}

Answer the user's next message helpfully and concisely, using the context above. If the message is unrelated to this business idea, business strategy, or entrepreneurship, reply exactly: "Sorry, I'm instructed to help with your business ideas only." Do not use markdown syntax — plain text only.`;

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.5,
        max_tokens: 1000,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ]
      })
    });

    if (!groqResponse.ok) {
      throw new Error(`Groq API error ${groqResponse.status}`);
    }

    const data = await groqResponse.json();
    const reply = data.choices?.[0]?.message?.content || 'No response generated.';

    res.json({ reply });
  } catch (err) { next(err); }
}

module.exports = { createSession, submitIdea, submitAnswer, runAnalysis, challengeSession, generateReport, getSession, syncSession, deleteSession, streamReport, chatFollowUp };
