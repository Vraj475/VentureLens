async function callOpenRouter(model, messages, systemPrompt) {
  if (!process.env.OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY missing');
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://venturelens.app',
      'X-Title': 'VentureLens'
    },
    body: JSON.stringify({ model, messages: [{ role: 'system', content: systemPrompt }, ...messages], max_tokens: 1000 })
  });
  if (!response.ok) throw new Error(`OpenRouter ${response.status}: ${await response.text()}`);
  const data = await response.json();
  if (!data.choices?.[0]?.message) throw new Error('Unexpected OpenRouter response format');
  return data.choices[0].message.content;
}

async function challengeIdea(businessProfile, feasibilityScore) {
  return callOpenRouter('meta-llama/llama-3.3-70b-instruct',
    [{ role: 'user', content: `Business: ${JSON.stringify(businessProfile)}\nScore: ${feasibilityScore}/100\nGive 5 specific reasons this could fail. Numbered list.` }],
    'You are a critical venture capitalist. Be direct, specific, evidence-based. Never encouraging.');
}

async function webResearch(queries) {
  const results = [];
  for (const query of queries) {
    try {
      const content = await callOpenRouter('perplexity/sonar',
        [{ role: 'user', content: `Research: ${query}\nProvide specific data, under 200 words.` }],
        'You are a market research analyst. Be factual and specific.');
      results.push({ query, content, source: 'Web Research' });
    } catch (err) {
      console.warn('Web query failed:', query, err.message);
      results.push({ query, content: 'Research unavailable.', source: 'Web Research' });
    }
  }
  return results;
}

module.exports = { challengeIdea, webResearch };
