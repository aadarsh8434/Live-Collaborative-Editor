'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import ChatSidebar from '../components/ChatSidebar';

const Editor = dynamic(() => import('../components/Editor'), { ssr: false });

export default function Home() {
  const [content, setContent] = useState('<p>Hello! Start writing here…</p>');

  // When AI suggests an edit (from chat), replace entire doc for simplicity
  const handleAiEdit = (newHtml: string) => {
    setContent(newHtml);
  };

  return (
    <div className="main-layout">
      <Editor content={content} onUpdate={setContent} />
      <ChatSidebar onAiEdit={handleAiEdit} />
    </div>
  );
}
