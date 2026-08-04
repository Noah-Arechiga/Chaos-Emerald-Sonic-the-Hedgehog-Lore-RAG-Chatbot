/**
 * The archive's signature element: a faceted emerald that sits idle, and
 * pulses/rotates its inner facets while the RAG pipeline is actively
 * retrieving + generating a small, functional piece of motion that
 * doubles as a status indicator rather than pure decoration.
 */
export default function EmeraldFacet({ active = false, size = 28 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={active ? 'animate-pulseFacet' : ''}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="facetBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7CFFCE" />
          <stop offset="55%" stopColor="#2FE6A7" />
          <stop offset="100%" stopColor="#1B8F68" />
        </linearGradient>
      </defs>
      <polygon points="24,3 40,14 34,44 14,44 8,14" fill="url(#facetBody)" opacity="0.95" />
      <polygon points="24,3 40,14 24,20" fill="#7CFFCE" opacity="0.55" />
      <polygon points="24,3 8,14 24,20" fill="#EAF3EF" opacity="0.25" />
      <polygon points="8,14 24,20 14,44" fill="#1B8F68" opacity="0.7" />
      <polygon points="40,14 24,20 34,44" fill="#1B8F68" opacity="0.5" />
      <polygon points="24,20 34,44 14,44" fill="#0A0F0E" opacity="0.25" />
    </svg>
  );
}
