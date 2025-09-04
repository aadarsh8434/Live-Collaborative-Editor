'use client';

import { useState } from 'react';
import axios from 'axios';

type Msg = { role: 'user' | 'assistant', content: string };

export default function ChatSidebar({ onAiEdit }: { onAiEdit: (html: string) => void }) {
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: 'Hi! Ask me anything, or tell me to fix selected text.' }
  ]);
  const [input, setInput] = useState('');

  const send = async () => {
    if (!input.trim()) return;
    const newMessages: Msg[] = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    try {
      const res = await axios.post('/api/chat', { messages: newMessages });
      const reply = res.data.reply;
      setMessages([...newMessages, { role: 'assistant', content: reply }]);

      // If API returns an 'edit' field, apply directly to editor
      if (res.data.edit) onAiEdit(res.data.edit);
    } catch (e) {
      setMessages([...newMessages, { role: 'assistant', content: 'AI request failed. Check API key/server logs.' }]);
    }
  };

  return (
    <aside className="chat-sidebar">
      <div className="chat-header">AI Assistant</div>
      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.role}`}>
            <strong>{m.role === 'user' ? 'You' : 'AI'}: </strong>{m.content}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
        />
        <button onClick={send}>Send</button>
      </div>
      <div className="small" style={{ marginTop: 8 }}>
        Tip: Select text in the editor to open the AI toolbar.
      </div>
    </aside>
  );
}
