import { useState } from 'react';

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim() || disabled) return;
    onSend(value);
    setValue('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-panelLine bg-panel/80 p-3">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        placeholder="Ask the archive about Sonic the Hedgehog lore…"
        rows={1}
        disabled={disabled}
        className="max-h-32 flex-1 resize-none rounded-lg border border-panelLine bg-obsidian px-3.5 py-2.5 text-[15px] text-ink placeholder:text-ink-faint focus:border-emerald-dim focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald/40 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="shrink-0 rounded-lg bg-emerald px-4 py-2.5 font-display text-sm font-semibold text-obsidian transition-all hover:bg-emerald-glow disabled:cursor-not-allowed disabled:bg-panelLine disabled:text-ink-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald/60"
      >
        {disabled ? 'Scanning…' : 'Ask'}
      </button>
    </form>
  );
}
