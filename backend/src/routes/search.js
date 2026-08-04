import { Router } from 'express';
import { embedText } from '../services/embeddings.js';
import { searchSimilar, getStats } from '../services/vectorStore.js';

const router = Router();

// Raw retrieval, no generation: useful for tuning TOP_K / SIMILARITY_THRESHOLD
// and for judging retrieval quality independent of the LLM's phrasing
router.get('/search', async (req, res) => {
  const q = String(req.query.q || '').trim();
  const k = Math.min(Number(req.query.k) || 5, 20);

  if (!q) {
    return res.status(400).json({ error: 'Missing required query param: q' });
  }

  try {
    const embedding = await embedText(q);
    const results = searchSimilar(embedding, { k });
    res.json({ query: q, results });
  } catch (err) {
    console.error('[search] error:', err.message);
    res.status(500).json({ error: 'Search failed. Check server logs.' });
  }
});

router.get('/stats', (req, res) => {
  res.json(getStats());
});

export default router;
