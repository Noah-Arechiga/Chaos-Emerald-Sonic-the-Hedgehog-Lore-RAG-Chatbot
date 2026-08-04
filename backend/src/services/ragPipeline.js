import { embedText } from './embeddings.js';
import { searchSimilar } from './vectorStore.js';
import { generate } from './llm.js';

const TOP_K = Number(process.env.TOP_K || 5);
const SIMILARITY_THRESHOLD = Number(process.env.SIMILARITY_THRESHOLD || 0.25);

const SYSTEM_PROMPT = `You are the Chaos Emerald Archive, an assistant that answers questions about
Sonic the Hedgehog lore and canon STRICTLY using the numbered source passages
provided in the user message.

Rules:
- Only use information present in the provided passages. Do not use outside
  knowledge of Sonic canon.
- Every factual claim must be followed by a citation like [1] or [2][3]
  referencing the passage number(s) it came from.
- If the passages don't contain enough information to answer, say so plainly
  instead of guessing , so please do not fill gaps with invented lore.
- If passages conflict (different games/continuities), note the conflict
  rather than silently picking one.
- Be concise and direct. This is a reference lookup, not an essay.`;

function buildContextBlock(chunks) {
  return chunks
    .map((c, i) => `[${i + 1}] (Source: ${c.title}${c.category ? ` — ${c.category}` : ''})\n${c.content}`)
    .join('\n\n');
}

/**
 * Run the full RAG pipeline for a user query.
 * @param {string} query
 * @param {{role: 'user'|'assistant', content: string}[]} history
 */
export async function answerQuery(query, history = []) {
  // 1. Embed the query
  const queryEmbedding = await embedText(query);

  // 2. Retrieve
  const retrieved = searchSimilar(queryEmbedding, { k: TOP_K, minScore: 0 });

  // 3. Filter by relevance threshold
  const relevant = retrieved.filter((r) => r.score >= SIMILARITY_THRESHOLD);

  if (relevant.length === 0) {
    return {
      answer:
        "The archive doesn't have grounded lore for that, nothing retrieved passed the relevance " +
        'threshold. Try rephrasing, or this may genuinely be outside the ingested corpus.',
      sources: [],
      retrieval: retrieved.map((r) => ({ title: r.title, score: Number(r.score.toFixed(3)) })),
    };
  }

  // 4. Augment: build the prompt with numbered context
  const contextBlock = buildContextBlock(relevant);
  const userTurn = `Question: ${query}\n\nSource passages:\n${contextBlock}\n\nAnswer the question using only the passages above, with [n] citations.`;

  // 5. Generate
  const answer = await generate(SYSTEM_PROMPT, [
    ...history,
    { role: 'user', content: userTurn },
  ]);

  // 6. Map citation numbers back to structured source metadata for the UI
  const sources = relevant.map((r, i) => ({
    citationIndex: i + 1,
    chunkId: r.chunkId,
    title: r.title,
    sourceUrl: r.sourceUrl,
    category: r.category,
    license: r.license,
    score: Number(r.score.toFixed(3)),
    excerpt: r.content.slice(0, 220) + (r.content.length > 220 ? '…' : ''),
  }));

  return { answer, sources };
}
