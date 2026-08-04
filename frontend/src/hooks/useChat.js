import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { postChat } from '../lib/api.js';

/**
 * Manages the chat message list and talks to the RAG backend
 * Each assistant message carries its `sources` array so the UI can render
 * citation cards inline with the answer that used them
 */
export function useChat() {
  const [messages, setMessages] = useState([]);

  const mutation = useMutation({
    mutationFn: postChat,
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.answer, sources: data.sources || [] },
      ]);
    },
    onError: (err) => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Hmmm, we couldn't reach the archive. Maybe we took a wrong turn somewhere: ${err.message}`,
          sources: [],
          isError: true,
        },
      ]);
    },
  });

  const sendMessage = useCallback(
    (query) => {
      const trimmed = query.trim();
      if (!trimmed || mutation.isPending) return;

      const history = messages
        .filter((m) => !m.isError)
        .map((m) => ({ role: m.role, content: m.content }));

      setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
      mutation.mutate({ query: trimmed, history });
    },
    [messages, mutation]
  );

  return {
    messages,
    sendMessage,
    isPending: mutation.isPending,
  };
}
