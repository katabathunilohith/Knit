import React, { useState } from 'react';
import { X, Copy, Check, Users, Link as LinkIcon, Share2, Shield } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { DocumentItem } from '../../types/index.js';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentMeta: DocumentItem | null;
}

export const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose, documentMeta }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !documentMeta) return null;

  const inviteUrl = `${window.location.origin}/invite/${documentMeta.inviteCode || documentMeta.id}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#ec4899', '#8b5cf6', '#06b6d4'],
      });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content invite-modal-box"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '520px' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(236,72,153,0.3), rgba(139,92,246,0.3))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(236,72,153,0.4)',
              }}
            >
              <Share2 size={18} color="#ec4899" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Invite Collaborators</h2>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                Share real-time CRDT access to &ldquo;{documentMeta.title}&rdquo;
              </p>
            </div>
          </div>
          <button className="icon-button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <LinkIcon size={14} color="#8b5cf6" />
              <span>Direct Collaboration Link</span>
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                readOnly
                value={inviteUrl}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#94a3b8',
                  fontSize: '0.85rem',
                  fontFamily: 'monospace',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleCopy}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  background: copied
                    ? 'rgba(16, 185, 129, 0.2)'
                    : 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                  color: copied ? '#10b981' : '#fff',
                  border: copied ? '1px solid rgba(16, 185, 129, 0.5)' : 'none',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
            <p style={{ margin: '6px 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>
              Anyone with this link can join, view, and edit concurrently in real time.
            </p>
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={14} color="#ec4899" />
              <span>Document Access & Permissions</span>
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Owner card */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(236, 72, 153, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                    }}
                  >
                    👑
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f1f5f9' }}>
                      {documentMeta.ownerName || 'Verified Author'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      {documentMeta.ownerEmail || 'author@knit.io'}
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: 'rgba(236, 72, 153, 0.15)',
                    color: '#ec4899',
                    border: '1px solid rgba(236, 72, 153, 0.3)',
                    fontWeight: 600,
                  }}
                >
                  Owner
                </span>
              </div>

              {/* Collaborators list */}
              {documentMeta.collaborators && documentMeta.collaborators.length > 0 ? (
                documentMeta.collaborators.map((collab, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'rgba(139, 92, 246, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1rem',
                        }}
                      >
                        {collab.avatar || '⚡'}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f1f5f9' }}>
                          {collab.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          {collab.email || 'collaborator@knit.io'}
                        </div>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: 'rgba(139, 92, 246, 0.15)',
                        color: '#8b5cf6',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        fontWeight: 600,
                      }}
                    >
                      {collab.role === 'owner' ? 'Owner' : 'Editor'}
                    </span>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    padding: '14px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px dashed rgba(255, 255, 255, 0.08)',
                    textAlign: 'center',
                    fontSize: '0.8rem',
                    color: '#64748b',
                  }}
                >
                  No external collaborators added yet. Share the link above to invite peers!
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(6, 182, 212, 0.08)',
              border: '1px solid rgba(6, 182, 212, 0.2)',
              fontSize: '0.78rem',
              color: '#67e8f9',
            }}
          >
            <Shield size={16} style={{ flexShrink: 0 }} />
            <span>Updates are signed and synchronized over peer WebSockets via Yjs CRDTs.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
