// Pluggable chat/completion provider
// Uses Ollama 3.2
// The contract ragPipeline.js relies on is just: generate(systemPrompt, messages) -> string.

const MODEL = process.env.OLLAMA_MODEL || 'llama3.2';
const BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

/**
 * @param {string} systemPrompt
 * @param {{role: 'user'|'assistant', content: string}[]} messages
 * @returns {Promise<string>}
 */
export async function generate(systemPrompt, messages) {
  let res;
  try {
    res = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        stream: false,
        options: { temperature: 0.2 }, // low temperature: faithful-to-sources, not creative
      }),
    });
  } catch (err) {
    throw new Error(
      `Couldn't reach Ollama at ${BASE_URL}. Is it running? Start it with \`ollama serve\` ` +
        `(or open the Ollama desktop app), and make sure you've pulled the model: ` +
        `\`ollama pull ${MODEL}\`. Original error: ${err.message}`
    );
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(
      'Ollama returned an error (status ${res.status}). If this mentions the model, run ' +
        '\'ollama pull ${MODEL}\' first. Response: ${body}'
    );
  }

  const data = await res.json();
  return data.message.content;
}

export const CHAT_MODEL_NAME = MODEL;