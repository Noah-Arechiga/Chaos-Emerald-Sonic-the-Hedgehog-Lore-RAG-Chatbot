import { useQuery } from '@tanstack/react-query';
import { getStats } from '../lib/api.js';
import EmeraldFacet from './EmeraldFacet.jsx';

const CATEGORIES = [
  'Items & Artifacts',
  'Characters',
  'Lore & History',
  'Mechanics & Powers',
  'Video Games',
  "Movies",
  'TV Shows',
];

const SUGGESTED = [
  'What is the difference between the Master Emerald and a Chaos Emerald?',
  "What really happened to Maria on the ARK, and how did it shape Shadow?",
  'Who is Chaos and why did it become Perfect Chaos?',
  'How do Super and Hyper transformations differ?',
];

export default function Sidebar({ onSuggestedClick }) {
  const { data: stats } = useQuery({ queryKey: ['stats'], queryFn: getStats, retry: 1 });

  return (
    <aside className="hidden w-72 shrink-0 flex-col border-r border-panelLine bg-panel/40 p-5 md:flex">
      <div className="flex items-center gap-2.5">
        <EmeraldFacet size={30} />
        <div>
          <h1 className="font-display text-base font-semibold leading-none text-ink">
            Chaos Emerald: Sonic the Hedgehog Archive
          </h1>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-ink-muted">
            Sonic Lore, Grounded
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-panelLine bg-obsidian/60 p-3">
        <div className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">Index status</div>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="font-display text-xl font-semibold text-emerald">
            {stats ? stats.chunks : '—'}
          </span>
          <span className="text-xs text-ink-muted">passages indexed</span>
        </div>
        <div className="mt-0.5 text-xs text-ink-faint">{stats ? stats.documents : '—'} source documents</div>
        {!stats && (
          <p className="mt-2 text-[11px] leading-snug text-amber">
            No stats yet, Tails has the backend running and has `npm run ingest` been executed?
          </p>
        )}
      </div>

      <div className="mt-6">
        <div className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">Archive index</div>
        <ul className="mt-2 space-y-1">
          {CATEGORIES.map((c) => (
            <li key={c} className="flex items-center gap-2 py-0.5 text-sm text-ink-muted">
              <span className="h-1 w-1 rounded-full bg-emerald-dim" />
              {c}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex-1">
        <div className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">Try asking</div>
        <ul className="mt-2 space-y-2">
          {SUGGESTED.map((q) => (
            <li key={q}>
              <button
                onClick={() => onSuggestedClick(q)}
                className="w-full rounded-md border border-panelLine px-2.5 py-2 text-left text-xs leading-snug text-ink-muted transition-colors hover:border-emerald-dim hover:text-ink"
              >
                {q}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 text-[10px] leading-snug text-ink-faint">
        Answers are generated only from retrieved passages, with citations.
        Nothing here comes from the model's unaided memory of Sonic canon.
      </p>
    </aside>
  );
}
