module.exports = function parseGeminiJSON(raw) {
  if (!raw || typeof raw !== 'string') throw new Error('Empty Gemini response');
  let text = raw.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
  try { return JSON.parse(text); } catch (e) {}
  const objMatch = text.match(/\{[\s\S]*\}/);
  if (objMatch) { try { return JSON.parse(objMatch[0]); } catch (e) {} }
  const fixed = text.replace(/,\s*([}\]])/g, '$1');
  try { return JSON.parse(fixed); } catch (e) {}
  throw new Error('Could not parse Gemini JSON: ' + raw.slice(0, 200));
};
