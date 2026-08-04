// Minimal in-memory sliding-window rate limiter (no Redis dependency needed)

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;

const hits = new Map(); // ip -> timestamps[]

export function rateLimit(req, res, next) {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  const timestamps = (hits.get(ip) || []).filter((t) => t > windowStart);
  timestamps.push(now);
  hits.set(ip, timestamps);

  if (timestamps.length > MAX_REQUESTS) {
    return res.status(429).json({
      error: 'Too many requests at Sonic speed! Please slow down.',
      retryAfterMs: WINDOW_MS,
    });
  }
  next();
}
