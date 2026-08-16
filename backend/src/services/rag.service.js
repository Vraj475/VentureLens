const mongoose = require('mongoose');
const { generateEmbedding } = require('./embedding.service');
const cosineSimilarity = require('../utils/cosineSimilarity');

const ChunkSchema = new mongoose.Schema({ text: String, embedding: [Number], source: String, chunkId: String });
const KnowledgeChunk = mongoose.models.KnowledgeChunk || mongoose.model('KnowledgeChunk', ChunkSchema);

async function retrieveRelevantChunks(query, topK = 5, threshold = 0.5) {
  try {
    const count = await KnowledgeChunk.countDocuments();
    if (count === 0) { console.warn('Knowledge base empty — run ingest script'); return []; }
    const queryEmbedding = await generateEmbedding(query);
    const all = await KnowledgeChunk.find({}).select('text embedding source').lean();
    return all
      .map(c => ({ source: c.source, content: c.text, relevanceScore: cosineSimilarity(queryEmbedding, c.embedding) }))
      .filter(c => c.relevanceScore >= threshold)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, topK);
  } catch (err) {
    console.error('RAG retrieval failed:', err.message);
    return [];
  }
}

module.exports = { retrieveRelevantChunks, KnowledgeChunk };
