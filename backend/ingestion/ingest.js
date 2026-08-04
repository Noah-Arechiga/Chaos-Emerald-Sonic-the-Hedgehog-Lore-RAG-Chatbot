import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadSeedDocuments } from './loadDocuments.js';
import { chunkText } from './chunk.js';
import { embedBatch, EMBEDDING_MODEL_NAME } from '../src/services/embeddings.js';
import { upsertDocument, deleteChunksForDocument, insertChunk } from '../src/services/vectorStore.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_DIR = path.join(__dirname, 'seedData');
const EMBED_BATCH_SIZE = 32;

async function main() {
  console.log(`Loading source documents from ${SEED_DIR}`);
  const documents = loadSeedDocuments(SEED_DIR);
  console.log(`Loaded ${documents.length} source documents`);

  // 1. Chunk everything, keeping track of which document each chunk belongs to
  const allChunks = [];
  for (const doc of documents) {
    upsertDocument({
      id: doc.id,
      title: doc.title,
      sourceUrl: doc.sourceUrl,
      category: doc.category,
      license: doc.license,
    });
    deleteChunksForDocument(doc.id); // re-ingest cleanly if run twice

    const pieces = chunkText(doc.body);
    pieces.forEach((content, i) => {
      allChunks.push({
        id: `${doc.id}::${i}`,
        documentId: doc.id,
        chunkIndex: i,
        content,
      });
    });
  }
  console.log(`Chunked into ${allChunks.length} passages`);

  // 2. Embed in batches
  const totalBatches = Math.ceil(allChunks.length / EMBED_BATCH_SIZE);
  for (let b = 0; b < totalBatches; b++) {
    const batch = allChunks.slice(b * EMBED_BATCH_SIZE, (b + 1) * EMBED_BATCH_SIZE);
    console.log(`Embedding batch ${b + 1}/${totalBatches}...`);
    const embeddings = await embedBatch(batch.map((c) => c.content));

    batch.forEach((chunk, i) => {
      insertChunk({
        id: chunk.id,
        documentId: chunk.documentId,
        chunkIndex: chunk.chunkIndex,
        content: chunk.content,
        embedding: embeddings[i],
        embeddingModel: EMBEDDING_MODEL_NAME,
        tokenEstimate: Math.round(chunk.content.length / 4),
      });
    });
  }

  console.log(`Stored ${allChunks.length} chunks in ${process.env.SQLITE_PATH || './data/lore.db'}`);
  console.log('Done. Start the server with `npm run dev` and try:');
  console.log(`  curl -X POST http://localhost:${process.env.PORT || 3001}/api/chat \\`);
  console.log(`    -H "Content-Type: application/json" \\`);
  console.log(`    -d '{"query":"What are the Chaos Emeralds?"}'`);
}

main().catch((err) => {
  console.error(`It's no use! Ingestion failed:`, err);
  process.exit(1);
});
