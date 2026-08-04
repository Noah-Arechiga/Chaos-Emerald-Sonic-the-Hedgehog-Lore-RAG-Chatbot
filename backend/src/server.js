import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import chatRoutes from './routes/chat.js';
import searchRoutes from './routes/search.js';
import healthRoutes from './routes/health.js';
import { rateLimit } from './middleware/rateLimit.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use('/api', healthRoutes);
app.use('/api', rateLimit, chatRoutes);
app.use('/api', rateLimit, searchRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[unhandled]', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log('Chaos Emerald: Sonic the Hedgehog Archive API listening on http://localhost:${PORT}');
  console.log('  POST /api/chat     — ask a lore question (RAG)'); 
  console.log('  GET  /api/search   — raw retrieval (debug)'); 
  console.log('  GET  /api/stats    — corpus size'); 
  console.log('  GET  /api/health   — liveness'); 
});
