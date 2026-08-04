import { pipeline } from '@xenova/transformers';

// Pluggable embedding provider 

// Everything downstream just calls embedText/embedBatch and works with plain 
// number[] vectors, so the rest of the app never needs to know which provider produced 
// them (as long as ingestion + query use the SAME model, vectors from different models
// aren't comparable, so re-run "npm run ingest" if you ever change EMBEDDING_MODEL).

const MODEL = process.env.EMBEDDING_MODEL || 'Xenova/all-MiniLM-L6-v2';

let extractorPromise;
function getExtractor() {
  if (!extractorPromise) {
    console.log('Loading local embedding model "${MODEL}" (first run downloads it, ~90MB)...');
    extractorPromise = pipeline('feature-extraction', MODEL);
  }
  return extractorPromise;
}

/**
 * Embed a single string.
 * @param {string} text
 * @returns {Promise<number[]>}
 */
export async function embedText(text) {
  const [vector] = await embedBatch([text]);
  return vector;
}

/**
 * Embed a batch of strings. transformers.js embeds one at a time under the
 * hood (no server-side batching API like OpenAI's), so this just loops —
 * still plenty fast for a corpus this size on CPU.
 * @param {string[]} texts
 * @returns {Promise<number[][]>}
 */
export async function embedBatch(texts) {
  const extractor = await getExtractor();
  const vectors = [];
  for (const text of texts) {
    const output = await extractor(text, { pooling: 'mean', normalize: true });
    vectors.push(Array.from(output.data));
  }
  return vectors;
}

export const EMBEDDING_MODEL_NAME = MODEL;