import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';

// Fetches each URL in sources.json, strips nav/boilerplate/scripts, and
// writes clean markdown-ish text into seedData/ with a frontmatter header
// so loadDocuments.js can pick it up. Run `npm run ingest` afterwards to
// chunk + embed the new content.
//
// Be respectful: this rate-limits requests and sets a descriptive User-Agent.
// Check robots.txt and each site's terms before scraping at scale — Fandom
// wiki content is generally CC-BY-SA, which requires attribution (the
// frontmatter's source_url + license fields preserve that, and the RAG
// pipeline surfaces them in every citation).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCES_PATH = path.join(__dirname, 'sources.json');
const OUTPUT_DIR = path.join(__dirname, 'seedData');
const DELAY_MS = Number(process.env.SCRAPE_DELAY_MS || 1500);
const USER_AGENT = process.env.SCRAPE_USER_AGENT || 'sonic-ai-lore-rag-bot/1.0 (educational project)';

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function extractArticleText($) {
  // Fandom's MediaWiki skin puts the article body in #mw-content-text.
  // Strip nav boxes, infoboxes-as-tables, references, edit links.
  const root = $('#mw-content-text .mw-parser-output').first();
  root.find('table, .navbox, .reference, sup.reference, .toc, script, style, .mw-editsection').remove();

  const parts = [];
  root.children('p, h2, h3, li').each((_, el) => {
    const tag = el.tagName;
    const text = $(el).text().replace(/\s+/g, ' ').trim();
    if (!text) return;
    if (tag === 'h2' || tag === 'h3') {
      parts.push(`\n## ${text}\n`);
    } else if (tag === 'li') {
      parts.push(`- ${text}`);
    } else {
      parts.push(text);
    }
  });
  return parts.join('\n\n').trim();
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function scrapeOne(source) {
  console.log(`Fetching ${source.url}`);
  const res = await fetch(source.url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) {
    console.warn(`  Skipped (HTTP ${res.status})`);
    return;
  }
  const html = await res.text();
  const $ = cheerio.load(html);

  const title = $('#firstHeading').first().text().trim() || $('title').text().trim();
  const body = extractArticleText($);

  if (!body || body.length < 200) {
    console.warn(`  Skipped (extracted body too short — check selectors for this site)`);
    return;
  }

  const frontmatter = [
    '---',
    `title: ${title}`,
    `category: ${source.category || 'Uncategorized'}`,
    `source_url: ${source.url}`,
    `license: ${source.license || 'CC-BY-SA'}`,
    '---',
    '',
  ].join('\n');

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const outPath = path.join(OUTPUT_DIR, `${slugify(title)}.md`);
  fs.writeFileSync(outPath, frontmatter + body, 'utf-8');
  console.log(`  Wrote ${outPath} (${body.length} chars)`);
}

async function main() {
  const sources = JSON.parse(fs.readFileSync(SOURCES_PATH, 'utf-8'));
  console.log(`Scraping ${sources.length} source(s), ${DELAY_MS}ms delay between requests...`);

  for (const source of sources) {
    try {
      await scrapeOne(source);
    } catch (err) {
      console.error(`  Failed: ${err.message}`);
    }
    await sleep(DELAY_MS);
  }

  console.log('Scrape complete. Review seedData/ then run `npm run ingest`.');
}

main();
