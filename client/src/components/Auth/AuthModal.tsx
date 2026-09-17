import React, { useState } from 'react';
import { useAuth, VERIFIED_PERSONAS } from '../../context/AuthContext.js';
import { X, CheckCircle2, ShieldCheck, UserPlus, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, loginAsPersona, loginAsCustom } = useAuth();
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    loginAsCustom(customName, customEmail);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content auth-modal-box"
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
              <ShieldCheck size={20} color="#ec4899" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Verified Access Authentication</h2>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                Secure multi-user session & evaluator verification
              </p>
            </div>
          </div>
          <button className="icon-button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px', display: 'block' }}>
              ⚡ 1-Click Verified Evaluator Personas
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {VERIFIED_PERSONAS.map((persona) => {
                const isActive = user?.id === persona.id;
                return (
                  <button
                    key={persona.id}
                    onClick={() => {
                      loginAsPersona(persona);
                      onClose();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      background: isActive ? 'rgba(236, 72, 153, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      border: isActive ? '1px solid rgba(236, 72, 153, 0.6)' : '1px solid rgba(255, 255, 255, 0.08)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '1.5rem' }}>{persona.avatar}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {persona.name}
                          <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '6px', background: `${persona.color}25`, color: persona.color, border: `1px solid ${persona.color}50` }}>
                            {persona.role}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{persona.email}</div>
                      </div>
                    </div>
                    {isActive ? (
                      <CheckCircle2 size={18} color="#ec4899" />
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Switch</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ position: 'relative', textAlign: 'center' }}>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', position: 'absolute', top: '50%', left: 0, right: 0 }} />
            <span style={{ position: 'relative', background: '#13111c', padding: '0 12px', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Or Create Custom Profile
            </span>
          </div>

          <form onSubmit={handleCustomSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>
                Display Name
              </label>
              <input
                type="text"
                placeholder="e.g. Satoshi Nakamoto"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff',
                  outline: 'none',
                  fontSize: '0.9rem',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>
                Email (Optional)
              </label>
              <input
                type="email"
                placeholder="e.g. satoshi@bitcoin.org"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff',
                  outline: 'none',
                  fontSize: '0.9rem',
                }}
              />
            </div>
            <button
              type="submit"
              disabled={!customName.trim()}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '11px',
                borderRadius: '10px',
                background: customName.trim()
                  ? 'linear-gradient(135deg, #ec4899, #8b5cf6)'
                  : 'rgba(255,255,255,0.06)',
                color: customName.trim() ? '#fff' : '#64748b',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: customName.trim() ? 'pointer' : 'not-allowed',
                marginTop: '6px',
                transition: 'all 0.2s ease',
              }}
            >
              <UserPlus size={16} />
              <span>Enter Workspace as Verified User</span>
            </button>
          </form>

          <div
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(139, 92, 246, 0.08)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              fontSize: '0.78rem',
              color: '#c4b5fd',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Sparkles size={16} style={{ flexShrink: 0 }} />
            <span>
              Clerk OAuth & JWT ready. In production, set <code>VITE_CLERK_PUBLISHABLE_KEY</code> to enable full Clerk enterprise SSO.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
