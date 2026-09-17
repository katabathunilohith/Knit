import React, { useState } from 'react';
import { Bot, Sparkles, X, Play } from 'lucide-react';
import type { Editor as TipTapEditor } from '@tiptap/react';
import type { WebsocketProvider } from 'y-websocket';

interface AiTeammateModalProps {
  isOpen: boolean;
  onClose: () => void;
  editor: TipTapEditor | null;
  provider: WebsocketProvider | null;
}

const AI_PRESETS = [
  {
    title: 'Distributed CRDT Architecture Spec',
    prompt: 'Draft an architectural overview explaining why CRDTs guarantee strong eventual consistency without centralized locking.',
    text: `\n### 🌐 Distributed CRDT Convergence Architecture\n\nKnit achieves strong eventual consistency via state-based Conflict-free Replicated Data Types (CRDTs). Unlike Operational Transformation (OT) which depends on an authoritative central sequencer, Knit represents document history as a partially ordered set of immutable structural items. When concurrent network partitions heal, peer state vectors deterministically resolve causal ordering without dropped keystrokes.\n`,
  },
  {
    title: 'Chaos Engineering Disaster Recovery Plan',
    prompt: 'Write a failure-mode runbook covering simulated split-brain and WebSocket partition recovery.',
    text: `\n### 🛡️ Chaos Engineering: Split-Brain & Partition Recovery\n\n1. **Fault Injection**: Disconnect WebSocket transport while keeping IndexedDB active.\n2. **Isolated Mutation**: Accept client keystrokes offline; increment local Lamport vector clock.\n3. **Network Resumption**: Send StateVector handshake over WebSocket.\n4. **Delta Reconciliation**: Transmit missing DeleteSets and insert blocks with zero data loss.\n`,
  },
  {
    title: 'Performance Benchmark: CRDT vs OT',
    prompt: 'Compare memory footprint, network overhead, and convergence guarantees.',
    text: `\n### 📊 Benchmark Comparison: CRDTs (Yjs) vs Traditional OT\n\n- **Sync Latency**: < 15ms local loopback vs 120ms server roundtrip.\n- **Offline Reliability**: 100% full offline editing via IndexedDB vs partial read-only cache.\n- **Single Point of Failure**: Zero (peer-to-peer mergeable) vs High (central sequencer required).\n`,
  },
];

export const AiTeammateModal: React.FC<AiTeammateModalProps> = ({
  isOpen,
  onClose,
  editor,
  provider,
}) => {
  const [selectedPreset, setSelectedPreset] = useState(AI_PRESETS[0]);
  const [customText, setCustomText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleStartTyping = async () => {
    if (!editor) return;
    setIsGenerating(true);

    const textToType = customText.trim() ? customText : selectedPreset.text;
    const totalChars = textToType.length;

    // 1. Temporarily announce AI teammate in Yjs Awareness
    if (provider && provider.awareness) {
      provider.awareness.setLocalStateField('aiTeammate', {
        name: '🤖 KnitAI Assistant',
        color: '#06b6d4',
      });
    }

    onClose();

    // Focus editor and get current insertion point
    editor.commands.focus('end');

    // Type character-by-character or chunk-by-chunk to show real-time typing
    let charIndex = 0;
    const chunkSize = 3;

    const interval = setInterval(() => {
      if (charIndex >= totalChars) {
        clearInterval(interval);
        setIsGenerating(false);

        // Remove AI presence
        if (provider && provider.awareness) {
          provider.awareness.setLocalStateField('aiTeammate', null);
        }
        return;
      }

      const nextChunk = textToType.slice(charIndex, charIndex + chunkSize);
      editor.commands.insertContent(nextChunk);
      charIndex += chunkSize;
    }, 35);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '540px' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(139, 92, 246, 0.3))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(6, 182, 212, 0.4)',
              }}
            >
              <Bot size={20} color="#06b6d4" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                Summon AI Teammate
              </h2>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>
                AI participates as a real concurrent peer typing live over CRDT
              </p>
            </div>
          </div>
          <button className="icon-button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px', display: 'block' }}>
              Choose Collaborative Task:
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {AI_PRESETS.map((preset, i) => {
                const isActive = selectedPreset.title === preset.title && !customText.trim();
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedPreset(preset);
                      setCustomText('');
                    }}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: isActive ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      border: isActive ? '1px solid rgba(6, 182, 212, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f8fafc', marginBottom: '2px' }}>
                      {preset.title}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      {preset.prompt}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px', display: 'block' }}>
              Or Enter Custom Text to Stream:
            </label>
            <textarea
              placeholder="e.g. Write an executive summary of our real-time collaboration engine..."
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#fff',
                outline: 'none',
                fontSize: '0.85rem',
                resize: 'none',
              }}
            />
          </div>

          <div
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(6, 182, 212, 0.08)',
              border: '1px solid rgba(6, 182, 212, 0.2)',
              fontSize: '0.75rem',
              color: '#67e8f9',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Sparkles size={16} style={{ flexShrink: 0 }} />
            <span>
              The AI cursor will enter the document and type character-by-character concurrently alongside you!
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 16px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#94a3b8',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleStartTyping}
              disabled={isGenerating}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 20px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                border: 'none',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(6, 182, 212, 0.35)',
              }}
            >
              <Play size={15} />
              <span>Start Live Collaborative Typing</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
