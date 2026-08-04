import fs from 'node:fs';
import path from 'node:path';

// Loads markdown files from seedData/. Each file starts with a small
// frontmatter block:
//
//   ---
//   title: Chaos Emeralds
//   category: Items & Artifacts
//   source_url: https://example.com/chaos-emeralds
//   license: original-summary
//   ---
//   Body markdown content...

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };

  const [, fmBlock, body] = match;
  const meta = {};
  for (const line of fmBlock.split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    meta[key] = value;
  }
  return { meta, body: body.trim() };
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function loadSeedDocuments(dir) {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));

  return files.map((filename) => {
    const raw = fs.readFileSync(path.join(dir, filename), 'utf-8');
    const { meta, body } = parseFrontmatter(raw);
    const title = meta.title || filename.replace(/\.md$/, '');

    return {
      id: slugify(title),
      title,
      category: meta.category || null,
      sourceUrl: meta.source_url || null,
      license: meta.license || 'original-summary',
      body,
    };
  });
}
