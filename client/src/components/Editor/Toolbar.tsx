import React from 'react';
import type { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  SquareCode,
  Minus,
  Undo,
  Redo,
} from 'lucide-react';

interface ToolbarProps {
  editor: Editor | null;
}

export const Toolbar: React.FC<ToolbarProps> = ({ editor }) => {
  if (!editor) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '6px 12px',
        background: 'rgba(10, 14, 23, 0.92)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.09)',
        borderRadius: '12px',
        marginBottom: '1.75rem',
        flexWrap: 'wrap',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45)',
      }}
    >
      {/* Undo / Redo */}
      <button
        type="button"
        onClick={() => {
          if (typeof editor.chain().focus().undo === 'function') {
            editor.chain().focus().undo().run();
          }
        }}
        disabled={!(typeof editor.can?.()?.undo === 'function' && editor.can().undo())}
        className="toolbar-btn"
        title="Undo (Ctrl+Z)"
        style={getBtnStyle(false, !(typeof editor.can?.()?.undo === 'function' && editor.can().undo()))}
      >
        <Undo size={16} />
      </button>
      <button
        type="button"
        onClick={() => {
          if (typeof editor.chain().focus().redo === 'function') {
            editor.chain().focus().redo().run();
          }
        }}
        disabled={!(typeof editor.can?.()?.redo === 'function' && editor.can().redo())}
        className="toolbar-btn"
        title="Redo (Ctrl+Y)"
        style={getBtnStyle(false, !(typeof editor.can?.()?.redo === 'function' && editor.can().redo()))}
      >
        <Redo size={16} />
      </button>

      <div style={separatorStyle} />

      {/* Headings */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        style={getBtnStyle(editor.isActive('heading', { level: 1 }))}
        title="Heading 1"
      >
        <Heading1 size={17} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        style={getBtnStyle(editor.isActive('heading', { level: 2 }))}
        title="Heading 2"
      >
        <Heading2 size={17} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        style={getBtnStyle(editor.isActive('heading', { level: 3 }))}
        title="Heading 3"
      >
        <Heading3 size={17} />
      </button>

      <div style={separatorStyle} />

      {/* Inline Formats */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        style={getBtnStyle(editor.isActive('bold'))}
        title="Bold (Ctrl+B)"
      >
        <Bold size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        style={getBtnStyle(editor.isActive('italic'))}
        title="Italic (Ctrl+I)"
      >
        <Italic size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        style={getBtnStyle(editor.isActive('strike'))}
        title="Strikethrough"
      >
        <Strikethrough size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        style={getBtnStyle(editor.isActive('code'))}
        title="Inline Code"
      >
        <Code size={16} />
      </button>

      <div style={separatorStyle} />

      {/* Lists & Blocks */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        style={getBtnStyle(editor.isActive('bulletList'))}
        title="Bullet List"
      >
        <List size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        style={getBtnStyle(editor.isActive('orderedList'))}
        title="Numbered List"
      >
        <ListOrdered size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        style={getBtnStyle(editor.isActive('blockquote'))}
        title="Blockquote"
      >
        <Quote size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        style={getBtnStyle(editor.isActive('codeBlock'))}
        title="Code Block"
      >
        <SquareCode size={16} />
      </button>

      <div style={separatorStyle} />

      {/* Horizontal Rule */}
      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        style={getBtnStyle(false)}
        title="Divider Line"
      >
        <Minus size={16} />
      </button>
    </div>
  );
};

const separatorStyle: React.CSSProperties = {
  width: '1px',
  height: '20px',
  backgroundColor: 'rgba(255, 255, 255, 0.12)',
  margin: '0 4px',
};

function getBtnStyle(isActive: boolean, disabled = false): React.CSSProperties {
  return {
    background: isActive ? 'rgba(255, 42, 133, 0.22)' : 'transparent',
    color: disabled ? '#475569' : isActive ? '#ff80b0' : '#94a3b8',
    border: isActive ? '1px solid rgba(255, 42, 133, 0.45)' : '1px solid transparent',
    boxShadow: isActive ? '0 0 10px rgba(255, 42, 133, 0.3)' : 'none',
    borderRadius: '6px',
    padding: '6px 8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s ease',
  };
}
