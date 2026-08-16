const { GoogleGenerativeAI } = require('@google/generative-ai');
const retryWithBackoff = require('../utils/retryWithBackoff');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateEmbedding(text) {
  if (!text || !text.trim()) throw new Error('Empty text for embedding');
  return retryWithBackoff(async () => {
    let modelName = 'gemini-embedding-001';
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.embedContent(text.slice(0, 2000));
      return result.embedding.values;
    } catch (err) {
      if (err.message && err.message.includes('404')) {
        const fallbackModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
        const result = await fallbackModel.embedContent(text.slice(0, 2000));
        return result.embedding.values;
      }
      throw err;
    }
  });
}

module.exports = { generateEmbedding };
