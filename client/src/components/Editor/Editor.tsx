import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import type * as Y from 'yjs';
import type { WebsocketProvider } from 'y-websocket';
import type { UserProfile, TimelineSnapshot } from '../../types/index.js';
import { Toolbar } from './Toolbar.js';
import { History, RotateCcw } from 'lucide-react';
import './editor.css';

interface EditorProps {
  ydoc: Y.Doc | null;
  provider: WebsocketProvider | null;
  currentUser: UserProfile;
  isIndexedDbSynced: boolean;
  onEditorReady?: (editor: any) => void;
  timeTravelSnapshot?: TimelineSnapshot | null;
  onExitTimeTravel?: () => void;
}

export const Editor: React.FC<EditorProps> = ({
  ydoc,
  provider,
  currentUser,
  isIndexedDbSynced,
  onEditorReady,
  timeTravelSnapshot,
  onExitTimeTravel,
}) => {
  const editor = useEditor(
    {
      editable: true,
      autofocus: true,
      extensions: [
        StarterKit.configure({
          // History must be false when using Collaboration because Yjs manages undo/redo
          history: false,
        }),
        ...(ydoc
          ? [
              Collaboration.configure({
                document: ydoc,
                field: 'default',
              }),
            ]
          : []),
        ...(provider
          ? [
              CollaborationCursor.configure({
                provider: provider,
                user: {
                  name: currentUser.name,
                  color: currentUser.color,
                },
                render: (user: { color: string; name: string }) => {
                  const cursor = document.createElement('span');
                  cursor.classList.add('collaboration-cursor__caret');
                  cursor.setAttribute('style', `border-color: ${user.color}; color: ${user.color}`);

                  const userDiv = document.createElement('div');
                  userDiv.classList.add('collaboration-cursor__label');
                  userDiv.setAttribute('style', `background-color: ${user.color}`);
                  userDiv.insertBefore(document.createTextNode(user.name), null);
                  cursor.insertBefore(userDiv, null);

                  return cursor;
                },
              }),
            ]
          : []),
      ],
    },
    [ydoc, provider]
  );

  // Keep collaborative cursor user details updated if user changes name/color
  useEffect(() => {
    if (provider) {
      provider.awareness.setLocalStateField('user', {
        name: currentUser.name,
        color: currentUser.color,
      });
    }
    if (editor && typeof (editor.commands as any)?.updateUser === 'function') {
      (editor.commands as any).updateUser({
        name: currentUser.name,
        color: currentUser.color,
      });
    }
  }, [editor, provider, currentUser.name, currentUser.color]);

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  return (
    <div className="document-sheet">
      {/* Time-Travel Inspection Mode Banner */}
      {timeTravelSnapshot && (
        <div
          style={{
            padding: '10px 16px',
            borderRadius: '10px',
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            color: '#fef3c7',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.82rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={16} color="#f59e0b" />
            <span>
              <strong>Time-Travel Replay:</strong> Step {timeTravelSnapshot.step} • {timeTravelSnapshot.summary}
            </span>
          </div>
          {onExitTimeTravel && (
            <button
              onClick={onExitTimeTravel}
              style={{
                background: 'rgba(245, 158, 11, 0.25)',
                border: '1px solid rgba(245, 158, 11, 0.5)',
                color: '#fcd34d',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <RotateCcw size={12} />
              <span>Exit Replay</span>
            </button>
          )}
        </div>
      )}
      {/* Local-First Instant Indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          fontSize: '0.75rem',
          color: '#64748b',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: isIndexedDbSynced ? '#10b981' : '#f59e0b',
            }}
          />
          {isIndexedDbSynced
            ? 'IndexedDB Local-First Active (0ms write latency)'
            : 'Synchronizing Local Storage...'}
        </span>

        <span>ProseMirror + Y.XmlFragment CRDT</span>
      </div>

      <Toolbar editor={editor} />

      <EditorContent editor={editor} />
    </div>
  );
};
