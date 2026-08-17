const { InferenceClient } = require('@huggingface/inference');
const retryWithBackoff = require('../utils/retryWithBackoff');

const hf = new InferenceClient(process.env.HF_API_KEY);

async function generateEmbedding(text) {
  if (!text || !text.trim()) throw new Error('Empty text for embedding');
  return retryWithBackoff(async () => {
    const response = await hf.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs: text.slice(0, 2000),
    });
    // Hugging Face returns an array of numbers representing the vector
    return response;
  });
}

module.exports = { generateEmbedding };