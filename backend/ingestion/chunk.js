// Recursive-ish text chunker: splits on paragraph boundaries first, then
// sentence boundaries if a paragraph is still too big, packing sentences
// into chunks up to maxChars with overlapChars of context carried between
// consecutive chunks (helps retrieval when an answer straddles a boundary)

const DEFAULT_MAX_CHARS = 900;
const DEFAULT_OVERLAP_CHARS = 150;

function splitIntoSentences(text) {
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"'])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * @param {string} text
 * @param {{ maxChars?: number, overlapChars?: number }} opts
 * @returns {string[]} chunk texts
 */
export function chunkText(text, opts = {}) {
  const maxChars = opts.maxChars ?? DEFAULT_MAX_CHARS;
  const overlapChars = opts.overlapChars ?? DEFAULT_OVERLAP_CHARS;

  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const chunks = [];
  let current = '';

  const pushCurrent = () => {
    if (current.trim()) chunks.push(current.trim());
  };

  for (const para of paragraphs) {
    const sentences = para.length > maxChars ? splitIntoSentences(para) : [para];

    for (const sentence of sentences) {
      if ((current + ' ' + sentence).length > maxChars && current.length > 0) {
        pushCurrent();
        // Carry overlap forward for context continuity
        const overlap = current.slice(-overlapChars);
        current = overlap + ' ' + sentence;
      } else {
        current = current ? current + ' ' + sentence : sentence;
      }
    }
  }
  pushCurrent();

  return chunks;
}
