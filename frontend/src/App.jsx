import { useEffect, useRef } from 'react';
import { useChat } from './hooks/useChat.js';
import Sidebar from './components/Sidebar.jsx';
import MessageBubble from './components/MessageBubble.jsx';
import PipelineStatus from './components/PipelineStatus.jsx';
import ChatInput from './components/ChatInput.jsx';
import EmeraldFacet from './components/EmeraldFacet.jsx';

export default function App() {
  const { messages, sendMessage, isPending } = useChat();
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isPending]);

  return (
    <div className="flex h-screen w-full text-ink">
      <Sidebar onSuggestedClick={sendMessage} />

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-panelLine px-5 py-3 md:hidden">
          <div className="flex items-center gap-2">
            <EmeraldFacet size={22} />
            <span className="font-display text-sm font-semibold">Chaos Emerald: Sonic the Hedgehog Archive</span>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          {messages.length === 0 ? (
            <EmptyState onSuggestedClick={sendMessage} />
          ) : (
            <div className="mx-auto flex max-w-3xl flex-col gap-5">
              {messages.map((m, i) => (
                <MessageBubble key={i} message={m} />
              ))}
              {isPending && <PipelineStatus />}
            </div>
          )}
        </div>

        <div className="mx-auto w-full max-w-3xl">
          <ChatInput onSend={sendMessage} disabled={isPending} />
        </div>
      </main>
    </div>
  );
}

function EmptyState({ onSuggestedClick }) {
  return (
    <div className="mx-auto flex h-full max-w-lg flex-col items-center justify-center text-center">
      <EmeraldFacet size={56} />
      <h2 className="mt-5 font-display text-xl font-semibold text-ink">
        Ask the archive anything about Sonic the Hedgehog canon
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        Every answer is retrieved from an indexed lore corpus and cited by
        passage, no improvised canon. Try a deep-cut question about anything
        Sonic the Hedgehog related.
      </p>
      <button
        onClick={() => onSuggestedClick('What are the Chaos Emeralds and how are they different from the Master Emerald?')}
        className="mt-5 rounded-lg border border-emerald-dim/50 bg-emerald-dim/10 px-4 py-2 font-display text-sm font-medium text-emerald transition-colors hover:bg-emerald-dim/20"
      >
        Ask a starter question!
      </button>
    </div>
  );
}
