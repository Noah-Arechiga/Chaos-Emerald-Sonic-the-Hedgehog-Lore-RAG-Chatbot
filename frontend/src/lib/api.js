const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export async function postChat({ query, history }) {
  const res = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, history }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with status ${res.status}`);
  }

  return res.json(); // { answer, sources, retrieval? }
}

export async function getStats() {
  const res = await fetch(`${API_BASE_URL}/api/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats.');
  return res.json(); // { documents, chunks }
}
