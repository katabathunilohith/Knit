import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, VERIFIED_PERSONAS } from '../../context/AuthContext.js';
import { BreathingWaveBackground } from '../Background/BreathingWaveBackground.js';
import { FileText, Users, ArrowRight, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { DocumentItem } from '../../types/index.js';

export const InvitePage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user, loginAsPersona, loginAsCustom } = useAuth();

  const [doc, setDoc] = useState<DocumentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [customName, setCustomName] = useState('');

  const API_HOST = window.location.hostname === 'localhost' ? 'http://localhost:1234' : '';

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_HOST}/api/invites/${code}`);
        if (!res.ok) {
          throw new Error('This collaboration invite link is invalid or has expired.');
        }
        const data = await res.json();
        setDoc(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    if (code) {
      fetchInvite();
    }
  }, [code, API_HOST]);

  const handleAcceptInvite = async (userToJoin = user) => {
    if (!userToJoin || !code || !doc) return;
    try {
      setJoining(true);
      await fetch(`${API_HOST}/api/invites/${code}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userToJoin.id,
          name: userToJoin.name,
          email: userToJoin.email,
          avatar: userToJoin.avatar,
          role: 'editor',
        }),
      });

      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ec4899', '#8b5cf6', '#06b6d4'],
      });

      setTimeout(() => {
        navigate(`/doc/${doc.id}`);
      }, 700);
    } catch {
      // Navigate anyway
      navigate(`/doc/${doc.id}`);
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <BreathingWaveBackground />

      <div
        className="modal-content"
        style={{
          maxWidth: '540px',
          width: '100%',
          background: 'rgba(19, 17, 28, 0.85)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(236, 72, 153, 0.3)',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(236, 72, 153, 0.15)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#c4b5fd' }}>
            <Loader2 size={36} className="spinning" style={{ margin: '0 auto 16px' }} />
            <p style={{ margin: 0, fontSize: '0.95rem' }}>Verifying Knit Invite Link...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🧶⚠️</div>
            <h2 style={{ fontSize: '1.3rem', color: '#f43f5e', marginBottom: '8px' }}>Invite Not Found</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '24px' }}>{error}</p>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                cursor: 'pointer',
              }}
            >
              Return to Dashboard
            </button>
          </div>
        ) : doc ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(236,72,153,0.3), rgba(139,92,246,0.3))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(236,72,153,0.4)',
                }}
              >
                <Users size={22} color="#ec4899" />
              </div>
              <div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: 'rgba(236,72,153,0.15)',
                    color: '#ec4899',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Collaboration Invite
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '4px 0 0 0', color: '#f8fafc' }}>
                  Join &ldquo;{doc.title}&rdquo;
                </h2>
              </div>
            </div>

            <div
              style={{
                padding: '14px 18px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={18} color="#8b5cf6" />
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 500 }}>
                    Created by {doc.ownerName || 'Verified Author'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Document ID: <code>{doc.id}</code>
                  </div>
                </div>
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  fontWeight: 600,
                }}
              >
                Real-Time Active
              </span>
            </div>

            {user ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: 'rgba(236, 72, 153, 0.08)',
                    border: '1px solid rgba(236, 72, 153, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.4rem' }}>{user.avatar}</span>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {user.name}
                        <ShieldCheck size={14} color="#ec4899" />
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{user.email}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#a855f7' }}>Logged In</span>
                </div>

                <button
                  onClick={() => handleAcceptInvite(user)}
                  disabled={joining}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '13px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 15px rgba(236, 72, 153, 0.35)',
                  }}
                >
                  <span>{joining ? 'Entering Workspace...' : 'Accept Invite & Join Document'}</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
                  Choose your verified persona to join this collaboration session:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {VERIFIED_PERSONAS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        loginAsPersona(p);
                        handleAcceptInvite(p);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        color: '#f8fafc',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.3rem' }}>{p.avatar}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{p.role}</div>
                        </div>
                      </div>
                      <ArrowRight size={16} color="#ec4899" />
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <input
                    type="text"
                    placeholder="Or enter custom name..."
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#fff',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                  <button
                    disabled={!customName.trim()}
                    onClick={() => {
                      loginAsCustom(customName, `${customName.toLowerCase().replace(/\s+/g, '')}@knit.io`);
                      handleAcceptInvite();
                    }}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '10px',
                      background: customName.trim()
                        ? 'linear-gradient(135deg, #ec4899, #8b5cf6)'
                        : 'rgba(255, 255, 255, 0.05)',
                      color: customName.trim() ? '#fff' : '#64748b',
                      border: 'none',
                      fontWeight: 600,
                      cursor: customName.trim() ? 'pointer' : 'not-allowed',
                    }}
                  >
                    Join
                  </button>
                </div>
              </div>
            )}

            <div
              style={{
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={12} color="#ec4899" />
                Powered by Yjs CRDTs & IndexedDB
              </span>
              <button
                onClick={() => navigate('/')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
