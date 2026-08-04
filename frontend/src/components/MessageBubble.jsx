import EmeraldFacet from './EmeraldFacet.jsx';
import SourceCitations from './SourceCitations.jsx';

// Splits assistant text on [n] / [n][m] citation markers and wraps them in a
// styled span, so the grounding is visually obvious inline with the prose
function renderWithCitations(text) {
  const parts = text.split(/(\[\d+\])/g);
  return parts.map((part, i) => {
    const match = part.match(/^\[(\d+)\]$/);
    if (match) {
      return (
        <span
          key={i}
          className="mx-0.5 rounded bg-emerald-dim/20 px-1 font-mono text-[11px] text-emerald"
        >
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-emerald-dim/15 border border-emerald-dim/30 px-4 py-2.5 text-[15px] leading-relaxed text-ink">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="mt-0.5 shrink-0">
        <EmeraldFacet size={24} />
      </div>
      <div className="max-w-[90%] flex-1">
        <div
          className={`rounded-2xl rounded-tl-sm border px-4 py-3 text-[15px] leading-relaxed ${
            message.isError
              ? 'border-amber/30 bg-amber/5 text-amber'
              : 'border-panelLine bg-panel text-ink'
          }`}
        >
          <div>{renderWithCitations(message.content)}</div>
          <SourceCitations sources={message.sources} />
        </div>
      </div>
    </div>
  );
}
