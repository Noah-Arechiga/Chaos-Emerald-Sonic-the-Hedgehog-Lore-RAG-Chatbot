# 💎 Chaos Emerald: Sonic the Hedgehog Lore Archive
 
A Retrieval-Augmented Generation (RAG) application that answers deep Sonic
the Hedgehog lore questions using only retrieved, cited source passages,
instead of an LLM improvising canon from memory.
 
**🟢 Live demo:** https://sonic-ai-rag-chatbot.vercel.app
 
Ask something like *"What really happened to Maria on the ARK, and how did
it shape Shadow?"* and get an answer grounded in the actual indexed lore,
with inline citations linking back to the exact passages it came from.
 
---
 
## Why this project?
 
Generic LLMs hallucinate on niche, deep-lore content, and they'll confidently
invent plot details that never happened. This project solves that with a
real RAG pipeline: content is scraped/ingested, chunked, embedded, and
stored in a vector database; user questions are embedded and matched
against that store via cosine similarity; only the retrieved passages are
handed to the LLM, which is instructed to answer *strictly* from them and
cite its sources. If nothing relevant is retrieved, it says so instead of
guessing.
 
It's also built to run **entirely free and local**; no API keys, no
per-query billing, using `transformers.js` for embeddings and Ollama for
generation, with a clean provider-agnostic architecture that can swap in
hosted APIs (OpenAI, Anthropic) or a production vector database
(Postgres + pgvector) with minimal changes.
 
## Architecture
 
**Application flow:**
```
┌────────────┐   scrape/chunk   ┌───────────────┐   embed     ┌──────────────────┐
│ Wiki pages │ ───────────────▶│ Ingestion job  │ ──────────▶│ Vector store     │
│ manuals etc│                  │ (Node script) │             │ (SQLite + cosine)│
└────────────┘                  └───────────────┘             └─────────┬────────┘
                                                                        │ top-k chunks
User ─▶ React chat UI ─▶ Express /api/chat ─▶ RAG pipeline ─▶ Ollama (local LLM)
                                     │              (retrieve → augment → generate)
                                     ▼
                          answer + cited sources ─▶ back to UI
```
 
**Deployment topology:**
```
┌─────────────────────────┐         HTTPS              ┌───────────────────────────────────┐
│  Vercel (frontend)      │  ─────────────────────▶   │  Oracle Cloud ARM VM (backend)     │
│  React static build     │                            │  ├─ Caddy (auto TLS via Let's     │
│  sonic-ai-rag-          │                            │  │   Encrypt, reverse proxy)      │
│  chatbot.vercel.app     │ ◀───────────────────────  │  ├─ Express API (pm2, systemd)     │
└─────────────────────────┘   JSON answers + cites     │  ├─ SQLite vector store           │
                                                       │  ├─ Ollama (local LLM inference)  │
                                                       │  └─ transformers.js (embeddings)  │
                                                       │  sonic-ai-lore-rag.duckdns.org    │
                                                       └───────────────────────────────────┘
```
 
**Pipeline stages** (`backend/src/services/ragPipeline.js`):
1. **Embed** the user's query with the same model used at ingestion time
2. **Retrieve** the top-k most similar chunks via cosine similarity (with an
   in-memory cache over parsed embeddings, avoiding redundant JSON parsing
   on every request at corpus scale)
3. **Filter** out chunks below a relevance threshold — no match means the
   app says so, rather than letting the LLM fill the gap
4. **Augment** a prompt with the retrieved passages, numbered for citation
5. **Generate** an answer constrained to only use the provided context
6. **Cite** — map citation numbers back to source metadata for the UI
## Tech stack
 
| Layer | Tech |
|---|---|
| Language | JavaScript (ES Modules), SQL |
| Backend | Node.js, Express.js, Zod (validation) |
| Embeddings | `transformers.js` (local, free — `all-MiniLM-L6-v2`) |
| LLM inference | Ollama (local, free — `llama3.2`) |
| Vector store | SQLite + in-memory cached cosine similarity |
| Ingestion | Cheerio (scraping), custom recursive text chunker |
| Frontend | React, Vite, Tailwind CSS, React Query (TanStack Query) |
| API docs | OpenAPI 3.0 |
| Process management | pm2 (systemd-integrated, auto-restart on crash/reboot) |
| Reverse proxy / TLS | Caddy (automatic HTTPS via Let's Encrypt) |
| Hosting | Oracle Cloud (Always Free ARM VM) + Vercel (static frontend) |
| DNS | DuckDNS (free dynamic DNS subdomain) |
 
## Features
 
- Grounded, cited answers: every claim in a response links to the source
  passage it came from, with a relevance score
- Fully local and free inference: no API keys or per-query billing
- Provider-agnostic services (`embeddings.js`, `llm.js`), swap to
  OpenAI/Anthropic/hosted vector DBs with a single-file change
- Content pipeline for growing the corpus: point the scraper at wiki pages,
  chunk, embed, and re-index with one command
- Debug endpoint (`GET /api/search`) to inspect raw retrieval quality
  independent of the LLM's phrasing
- Custom-designed chat UI with a live pipeline status indicator showing
  the retrieve → generate stages as they happen
- Deployed end-to-end on free-tier infrastructure: HTTPS backend on a
  persistent VM, static frontend on Vercel, zero recurring cost
## Running it locally
 
```bash
# 1. Install Ollama (https://ollama.com) and pull a model
ollama pull llama3.2
 
# 2. Configure environment
cp .env.example backend/.env
 
# 3. Ingest the lore corpus
cd backend
npm install
npm run ingest
 
# 4. Run the backend
npm run dev
 
# 5. In a second terminal, run the frontend
cd frontend
npm install
npm run dev
```
 
Open `http://localhost:5173` and start asking questions.
 
## What I'd build next
 
- Swap SQLite for Postgres + `pgvector` for production-scale retrieval
- Add Redis caching for repeated queries
- Add OpenTelemetry tracing around the retrieve/generate steps for
  observability into retrieval quality over time
- Response streaming, so answers appear progressively instead of all at once
- Multi-user support with JWT auth
---
 
Built as a hands-on exploration of RAG system design, end to end, from
retrieval and grounding logic, through deploying real infrastructure
(VM provisioning, TLS, process management, DNS) to make it publicly usable.
 
