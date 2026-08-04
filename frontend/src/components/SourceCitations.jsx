export default function SourceCitations({ sources }) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-3 border-t border-panelLine pt-3">
      <div className="mb-2 font-mono text-[11px] uppercase tracking-wider text-ink-muted">
        Sources · {sources.length} passage{sources.length > 1 ? 's' : ''} retrieved
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {sources.map((s) => (
          <div
            key={s.chunkId}
            className="group relative overflow-hidden rounded-md border border-panelLine bg-panel/60 p-3 transition-colors hover:border-emerald-dim"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="rounded bg-emerald-dim/20 px-1.5 py-0.5 font-mono text-[10px] text-emerald">
                  [{s.citationIndex}]
                </span>
                <span className="font-display text-sm font-medium text-ink">{s.title}</span>
              </div>
              <span className="shrink-0 font-mono text-[10px] text-amber">
                {(s.score * 100).toFixed(0)}%
              </span>
            </div>
            {s.category && (
              <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                {s.category}
              </div>
            )}
            <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-ink-muted">{s.excerpt}</p>
            {s.sourceUrl && (
              <a
                href={s.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1.5 inline-block font-mono text-[10px] text-emerald-dim underline decoration-dotted hover:text-emerald"
              >
                view original ↗
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
