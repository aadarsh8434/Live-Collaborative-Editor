'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function FloatingToolbar({ editor }: { editor: any }) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const updateToolbar = () => {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed && selection.toString().trim().length > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setPosition({
          top: rect.top + window.scrollY - 56,
          left: rect.left + window.scrollX,
        });
        setSelectedText(selection.toString());
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setAiSuggestion(null);
      }
    };

    document.addEventListener('mouseup', updateToolbar);
    document.addEventListener('keyup', updateToolbar);
    return () => {
      document.removeEventListener('mouseup', updateToolbar);
      document.removeEventListener('keyup', updateToolbar);
    };
  }, []);

  const requestAiEdit = async (mode: 'improve'|'shorten'|'lengthen'|'table') => {
    if (!selectedText) return;
    setLoading(true);
    try {
      const promptMap = {
        improve: `Improve the writing, fix grammar, keep meaning same:

"${selectedText}"`,
        shorten: `Shorten this text while keeping key meaning:

"${selectedText}"`,
        lengthen: `Expand this text with 1-2 more sentences, same tone:

"${selectedText}"`,
        table: `Convert this list-like text into a simple markdown table if possible. If not a list, just improve clarity:

"${selectedText}"`
      } as const;

      const res = await axios.post('/api/chat', {
        messages: [
          { role: 'system', content: 'You are a helpful writing assistant.' },
          { role: 'user', content: promptMap[mode] }
        ]
      });
      setAiSuggestion(res.data.reply);
    } catch (e) {
      console.error(e);
      setAiSuggestion('AI request failed. Check server logs or API key.');
    } finally {
      setLoading(false);
    }
  };

  const confirm = () => {
    if (!aiSuggestion) return;
    // Replace selection with suggestion
    editor.chain().focus().insertContent(aiSuggestion).run();
    setIsVisible(false);
    setAiSuggestion(null);
  };

  if (!isVisible) return null;

  return (
    <div className="floating-toolbar" style={{ top: position.top, left: position.left }}>
      {!aiSuggestion ? (
        <div>
          <div className="small" style={{ marginBottom: 6 }}>AI Tools</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button onClick={() => requestAiEdit('improve')}>Edit with AI</button>
            <button onClick={() => requestAiEdit('shorten')}>Shorten</button>
            <button onClick={() => requestAiEdit('lengthen')}>Lengthen</button>
            <button onClick={() => requestAiEdit('table')}>Convert to Table</button>
          </div>
          {loading && <div className="small" style={{ marginTop: 6 }}>Thinking…</div>}
        </div>
      ) : (
        <div>
          <div className="small"><b>Original</b></div>
          <div style={{ marginBottom: 6 }}>{selectedText}</div>
          <div className="small"><b>AI Suggestion</b></div>
          <div style={{ marginBottom: 6, whiteSpace: 'pre-wrap' }}>{aiSuggestion}</div>
          <div className="actions">
            <button onClick={confirm}>✅ Confirm</button>
            <button className="cancel" onClick={() => setAiSuggestion(null)}>❌ Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
