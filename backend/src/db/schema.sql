-- STH Lore RAG Chatbot: SQLite schema
-- Kept intentionally simple (two tables) so it's easy to see exactly how
-- retrieval works. In production, swap this file + vectorStore.js for
-- Postgres/pgvector and use a 'vector' column with an ivfflat/hnsw index
-- instead of the 'embedding_json' + in-app cosine similarity approach here

CREATE TABLE IF NOT EXISTS documents (
  id          TEXT PRIMARY KEY,      -- slug, e.g. "chaos-emeralds"
  title       TEXT NOT NULL,         -- "Chaos Emeralds"
  source_url  TEXT,                  -- original wiki/manual URL, if scraped
  game_or_category TEXT,             -- e.g. "Sonic Adventure", "Items & Artifacts"
  license     TEXT DEFAULT 'original-summary', -- or 'CC-BY-SA' etc when scraped
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS chunks (
  id            TEXT PRIMARY KEY,
  document_id   TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index   INTEGER NOT NULL,
  content       TEXT NOT NULL,
  token_estimate INTEGER,
  embedding_json TEXT NOT NULL,
  embedding_model TEXT NOT NULL,
  created_at    TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_chunks_document_id ON chunks(document_id);
