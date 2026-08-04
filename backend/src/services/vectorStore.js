import db from '../db/index.js';

// Vector store
// Stores each chunk's embedding as a JSON array in SQLite and does cosine
// similarity search in JS. This is intentionally simple and fine up to
// tens of thousands of chunks (a Sonic lore corpus will never come close).
//
// To swap in Postgres + pgvector for a "real" deployment:
//   1. 'embedding vector(1536)' column instead of embedding_json TEXT
//   2. CREATE INDEX ... USING ivfflat (embedding vector_cosine_ops)
//   3. Replace searchSimilar() below with:
//        SELECT *, 1 - (embedding <=> $1) AS score
//        FROM chunks ORDER BY embedding <=> $1 LIMIT $2
//   Nothing outside this file needs to change

function cosineSimilarity(a, b) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function upsertDocument({ id, title, sourceUrl, category, license }) {
  db.prepare(
    `INSERT INTO documents (id, title, source_url, game_or_category, license)
     VALUES (@id, @title, @sourceUrl, @category, @license)
     ON CONFLICT(id) DO UPDATE SET
       title = excluded.title,
       source_url = excluded.source_url,
       game_or_category = excluded.game_or_category,
       license = excluded.license`
  ).run({ id, title, sourceUrl: sourceUrl || null, category: category || null, license: license || 'original-summary' });
}

export function deleteChunksForDocument(documentId) {
  db.prepare(`DELETE FROM chunks WHERE document_id = ?`).run(documentId);
}

export function insertChunk({ id, documentId, chunkIndex, content, embedding, embeddingModel, tokenEstimate }) {
  db.prepare(
    `INSERT INTO chunks (id, document_id, chunk_index, content, token_estimate, embedding_json, embedding_model)
     VALUES (@id, @documentId, @chunkIndex, @content, @tokenEstimate, @embeddingJson, @embeddingModel)
     ON CONFLICT(id) DO UPDATE SET
       content = excluded.content,
       token_estimate = excluded.token_estimate,
       embedding_json = excluded.embedding_json,
       embedding_model = excluded.embedding_model`
  ).run({
    id,
    documentId,
    chunkIndex,
    content,
    tokenEstimate: tokenEstimate || null,
    embeddingJson: JSON.stringify(embedding),
    embeddingModel,
  });
}

/**
 * Retrieve the top-k chunks most similar to a query embedding
 * @param {number[]} queryEmbedding
 * @param {{ k?: number, minScore?: number }} opts
 */
export function searchSimilar(queryEmbedding, { k = 5, minScore = 0 } = {}) {
  const rows = db
    .prepare(
      `SELECT c.id, c.document_id, c.chunk_index, c.content, c.embedding_json,
              d.title, d.source_url, d.game_or_category, d.license
       FROM chunks c
       JOIN documents d ON d.id = c.document_id`
    )
    .all();

  const scored = rows.map((row) => {
    const embedding = JSON.parse(row.embedding_json);
    const score = cosineSimilarity(queryEmbedding, embedding);
    return {
      chunkId: row.id,
      documentId: row.document_id,
      chunkIndex: row.chunk_index,
      content: row.content,
      title: row.title,
      sourceUrl: row.source_url,
      category: row.game_or_category,
      license: row.license,
      score,
    };
  });

  return scored
    .filter((r) => r.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

export function getStats() {
  const docs = db.prepare(`SELECT COUNT(*) AS n FROM documents`).get().n;
  const chunks = db.prepare(`SELECT COUNT(*) AS n FROM chunks`).get().n;
  return { documents: docs, chunks };
}
