const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const fs = require('fs');

async function ingest() {
  // Validate API key presence
  const key = process.env.GEMINI_API_KEY || '';
  if (!key) {
    console.error('ERROR: GEMINI_API_KEY is missing from .env');
    process.exit(1);
  }

  // Lazy imports after env is loaded
  const { generateEmbedding } = require('../src/services/embedding.service');
  const { KnowledgeChunk } = require('../src/services/rag.service');
  const chunkText = require('../src/utils/chunkText');
  const delay = require('../src/utils/delay');

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✓ Connected to MongoDB');

  await KnowledgeChunk.deleteMany({});
  console.log('✓ Cleared existing chunks');

  const kbDir = path.join(__dirname, '../data/knowledge-base');
  if (!fs.existsSync(kbDir)) {
    console.error('Knowledge base directory not found:', kbDir);
    process.exit(1);
  }

  const files = fs.readdirSync(kbDir).filter(f => f.endsWith('.txt'));
  if (files.length === 0) {
    console.error('No .txt files found in knowledge-base directory');
    process.exit(1);
  }

  console.log(`Found ${files.length} files to process`);
  let totalChunks = 0;

  for (const file of files) {
    const text = fs.readFileSync(path.join(kbDir, file), 'utf-8');
    const chunks = chunkText(text, 250, 40);
    console.log(`\nProcessing ${file}: ${chunks.length} chunks`);

    for (let i = 0; i < chunks.length; i++) {
      try {
        await delay(300);
        const embedding = await generateEmbedding(chunks[i]);
        await KnowledgeChunk.create({
          text: chunks[i],
          embedding,
          source: file,
          chunkId: `${file}-${i}`
        });
        process.stdout.write('.');
        totalChunks++;
      } catch (err) {
        console.error(`\nFailed chunk ${i} of ${file}:`, err.message);
        if (err.message.includes('API_KEY_INVALID') || err.message.includes('not valid')) {
          console.error('Invalid Gemini API key. Stopping ingestion.');
          await mongoose.disconnect();
          process.exit(1);
        }
        await delay(2000);
      }
    }
    console.log(` Done`);
    await delay(1000);
  }

  console.log(`\n✓ Ingestion complete. ${totalChunks} chunks stored.`);
  await mongoose.disconnect();
  process.exit(0);
}

ingest().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
