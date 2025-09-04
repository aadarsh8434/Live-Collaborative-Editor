'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';
import FloatingToolbar from './FloatingToolbar';

type Props = {
  content: string;
  onUpdate: (html: string) => void;
};

export default function Editor({ content, onUpdate }: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editorProps: {
      attributes: {
        'aria-label': 'Document editor',
      },
    },
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  // -----------------------------
  // Toolbar actions (type-safe)
  // -----------------------------
  const makeHeading = (level: 1 | 2 | 3 | 4 | 5 | 6) => {
    editor.chain().focus().toggleHeading({ level }).run();
  };

  const bold = () => editor.chain().focus().toggleBold().run();
  const italic = () => editor.chain().focus().toggleItalic().run();
  const bullet = () => editor.chain().focus().toggleBulletList().run();

  return (
    <div className="editor-container">
      <div className="toolbar-bar">
        <button onClick={() => makeHeading(1)}>H1</button>
        <button onClick={() => makeHeading(2)}>H2</button>
        <button onClick={() => makeHeading(3)}>H3</button>
        <button onClick={bold}>Bold</button>
        <button onClick={italic}>Italic</button>
        <button className="secondary" onClick={bullet}>
          • List
        </button>
      </div>

      <div className="editor">
        <EditorContent editor={editor} />
      </div>

      <FloatingToolbar editor={editor} />
    </div>
  );
}
