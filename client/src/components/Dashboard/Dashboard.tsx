import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { BreathingWaveBackground } from '../Background/BreathingWaveBackground.js';
import { AuthModal } from '../Auth/AuthModal.js';
import { InviteModal } from '../Invite/InviteModal.js';
import {
  Plus,
  FileText,
  Clock,
  Trash2,
  Share2,
  ExternalLink,
  ShieldCheck,
  Search,
  Sparkles,
  LogIn,
  X,
} from 'lucide-react';
import type { DocumentItem } from '../../types/index.js';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [inviteModalDoc, setInviteModalDoc] = useState<DocumentItem | null>(null);

  // New Doc modal
  const [isNewDocModalOpen, setIsNewDocModalOpen] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [creating, setCreating] = useState(false);

  // Join by code
  const [joinCode, setJoinCode] = useState('');

  const API_HOST = window.location.hostname === 'localhost' ? 'http://localhost:1234' : '';

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const url = user ? `${API_HOST}/api/docs?userId=${user.id}` : `${API_HOST}/api/docs`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [user]);

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newDocTitle.trim() || '🧶 Untitled Knit Document';
    try {
      setCreating(true);
      const res = await fetch(`${API_HOST}/api/docs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          ownerId: user?.id,
          ownerName: user?.name,
          ownerEmail: user?.email,
          ownerAvatar: user?.avatar,
        }),
      });
      if (res.ok) {
        const createdDoc: DocumentItem = await res.json();
        setIsNewDocModalOpen(false);
        setNewDocTitle('');
        navigate(`/doc/${createdDoc.id}`);
        return;
      }
    } catch (err) {
      console.warn('API createDoc failed, navigating with local room ID:', err);
    } finally {
      setCreating(false);
    }

    // Resilient fallback if server is unreachable
    const fallbackId = 'knit-' + Math.random().toString(36).substring(2, 9);
    setIsNewDocModalOpen(false);
    setNewDocTitle('');
    navigate(`/doc/${fallbackId}`);
  };

  const handleDelete = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      const url = user ? `${API_HOST}/api/docs/${docId}?userId=${user.id}` : `${API_HOST}/api/docs/${docId}`;
      const res = await fetch(url, { method: 'DELETE' });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== docId));
      }
    } catch (err) {
      console.error('Failed to delete doc', err);
    }
  };

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    navigate(`/invite/${joinCode.trim()}`);
  };

  const filteredDocs = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <BreathingWaveBackground />

      {/* Navigation Header */}
      <header
        style={{
          height: '70px',
          padding: '0 32px',
          background: 'rgba(19, 17, 28, 0.75)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/')}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(236, 72, 153, 0.4)',
                fontSize: '1.25rem',
              }}
            >
              🧶
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #ffffff, #e2e8f0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Knit
                </span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    background: 'rgba(236, 72, 153, 0.15)',
                    color: '#ec4899',
                    border: '1px solid rgba(236, 72, 153, 0.3)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  CRDT Hub
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* User profile & Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isAuthenticated && user ? (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '6px 14px',
                borderRadius: '24px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(236, 72, 153, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: `${user.color}25`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.95rem',
                  border: `1px solid ${user.color}60`,
                }}
              >
                {user.avatar}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {user.name}
                  <ShieldCheck size={13} color="#ec4899" />
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{user.role || 'Verified'}</div>
              </div>
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                color: '#fff',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <LogIn size={16} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Dashboard Workspace */}
      <main style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '36px 24px', position: 'relative', zIndex: 10 }}>
        {/* Hero Section */}
        <div
          style={{
            padding: '28px 32px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(236,72,153,0.12), rgba(139,92,246,0.12))',
            border: '1px solid rgba(236,72,153,0.25)',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.8rem', color: '#ec4899', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Welcome back
              </span>
              <span style={{ color: '#64748b' }}>•</span>
              <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                {user ? user.role : 'Evaluator Mode'}
              </span>
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 6px 0', color: '#f8fafc' }}>
              {user ? user.name : 'Real-Time Workspace'}
            </h1>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8', maxWidth: '600px' }}>
              Create, weave, and collaborate on zero-conflict CRDT documents. Share instant invite links with peers for simultaneous editing.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setIsNewDocModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 22px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                color: '#fff',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(236, 72, 153, 0.35)',
                transition: 'all 0.2s ease',
              }}
            >
              <Plus size={18} />
              <span>New Document</span>
            </button>
          </div>
        </div>

        {/* Controls Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '24px',
            flexWrap: 'wrap',
          }}
        >
          {/* Search box */}
          <div
            style={{
              position: 'relative',
              flex: '1 1 300px',
              maxWidth: '420px',
            }}
          >
            <Search size={16} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search documents by title or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 14px 11px 40px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#f8fafc',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Quick Join via Code */}
          <form onSubmit={handleJoinByCode} style={{ display: 'flex', gap: '8px', flex: '0 1 auto' }}>
            <input
              type="text"
              placeholder="Enter invite code..."
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#f8fafc',
                fontSize: '0.88rem',
                outline: 'none',
                width: '170px',
              }}
            />
            <button
              type="submit"
              disabled={!joinCode.trim()}
              style={{
                padding: '10px 16px',
                borderRadius: '12px',
                background: joinCode.trim() ? 'rgba(139, 92, 246, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                color: joinCode.trim() ? '#c4b5fd' : '#64748b',
                border: joinCode.trim() ? '1px solid rgba(139, 92, 246, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
                cursor: joinCode.trim() ? 'pointer' : 'not-allowed',
                fontWeight: 600,
                fontSize: '0.85rem',
              }}
            >
              Join
            </button>
          </form>
        </div>

        {/* Document Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
            <div className="spinning" style={{ display: 'inline-block', fontSize: '2rem', marginBottom: '12px' }}>🧶</div>
            <p>Syncing Document Repository...</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div
            style={{
              padding: '60px 20px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px dashed rgba(255, 255, 255, 0.08)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🧶</div>
            <h3 style={{ fontSize: '1.2rem', color: '#f8fafc', marginBottom: '8px' }}>No documents found</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '20px' }}>
              Create your first collaborative document or join via an invite code.
            </p>
            <button
              onClick={() => setIsNewDocModalOpen(true)}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                color: '#fff',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Create New Document
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px',
            }}
          >
            {filteredDocs.map((doc) => {
              const isOwner = user?.id === doc.ownerId;
              const formattedDate = new Date(doc.updatedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={doc.id}
                  onClick={() => navigate(`/doc/${doc.id}`)}
                  style={{
                    padding: '22px',
                    borderRadius: '16px',
                    background: 'rgba(19, 17, 28, 0.7)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.07)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.4)';
                    e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.4), 0 0 20px rgba(236, 72, 153, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.07)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div>
                    {/* Top Row: Icon + Badges */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          background: 'rgba(236, 72, 153, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ec4899',
                          border: '1px solid rgba(236, 72, 153, 0.25)',
                        }}
                      >
                        <FileText size={18} />
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {isOwner ? (
                          <span
                            style={{
                              fontSize: '0.7rem',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              background: 'rgba(236, 72, 153, 0.15)',
                              color: '#ec4899',
                              border: '1px solid rgba(236, 72, 153, 0.3)',
                              fontWeight: 600,
                            }}
                          >
                            Owner
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: '0.7rem',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              background: 'rgba(139, 92, 246, 0.15)',
                              color: '#c4b5fd',
                              border: '1px solid rgba(139, 92, 246, 0.3)',
                              fontWeight: 600,
                            }}
                          >
                            Collaborator
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px 0', color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {doc.title}
                    </h3>

                    {/* Doc ID & Author */}
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>By {doc.ownerName || 'Verified Author'}</span>
                      <span>•</span>
                      <code>{doc.id}</code>
                    </div>
                  </div>

                  {/* Footer Row */}
                  <div
                    style={{
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                      paddingTop: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b' }}>
                      <Clock size={12} />
                      <span>{formattedDate}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        title="Share / Invite Link"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInviteModalDoc(doc);
                        }}
                        style={{
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          color: '#cbd5e1',
                          padding: '6px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                        }}
                      >
                        <Share2 size={14} />
                      </button>

                      <button
                        title="Open in Editor"
                        onClick={() => navigate(`/doc/${doc.id}`)}
                        style={{
                          background: 'rgba(236, 72, 153, 0.15)',
                          border: '1px solid rgba(236, 72, 153, 0.3)',
                          color: '#ec4899',
                          padding: '6px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                        }}
                      >
                        <ExternalLink size={14} />
                      </button>

                      {isOwner && (
                        <button
                          title="Delete Document"
                          onClick={(e) => handleDelete(doc.id, e)}
                          style={{
                            background: 'rgba(244, 63, 94, 0.1)',
                            border: '1px solid rgba(244, 63, 94, 0.2)',
                            color: '#f43f5e',
                            padding: '6px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* New Document Modal */}
      {isNewDocModalOpen && (
        <div className="modal-overlay" onClick={() => setIsNewDocModalOpen(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '460px' }}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} color="#ec4899" />
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Create New Document</h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setIsNewDocModalOpen(false)}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateDocument} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '6px', display: 'block' }}>
                  Document Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Consensus Design Spec"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '0.92rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsNewDocModalOpen(false)}
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
                  type="submit"
                  disabled={creating}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {creating ? 'Creating...' : 'Create & Open'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Invite Modal */}
      <InviteModal
        isOpen={Boolean(inviteModalDoc)}
        onClose={() => setInviteModalDoc(null)}
        documentMeta={inviteModalDoc}
      />
    </div>
  );
};
