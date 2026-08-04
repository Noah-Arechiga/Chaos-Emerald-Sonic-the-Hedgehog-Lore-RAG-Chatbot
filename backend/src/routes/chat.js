import { Router } from 'express';
import { z } from 'zod';
import { answerQuery } from '../services/ragPipeline.js';

const router = Router();

const chatSchema = z.object({
  query: z.string().min(1).max(1000),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .max(20)
    .optional()
    .default([]),
});

router.post('/chat', async (req, res) => {
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
  }

  const { query, history } = parsed.data;

  try {
    const result = await answerQuery(query, history);
    res.json(result);
  } catch (err) {
    console.error('[chat] pipeline error:', err.message);
    res.status(500).json({ error: 'Failed to generate an answer. Check in with Omochao in server logs.' });
  }
});

export default router;
