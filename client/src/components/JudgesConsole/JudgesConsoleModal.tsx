import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  Layers,
  Activity,
  Trash2,
  RefreshCw,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import type * as Y from 'yjs';
import type { TransactionRecord } from '../../types/index.js';
import { CrdtInspector } from '../../utils/crdtInspector.js';

interface JudgesConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  ydoc: Y.Doc | null;
  transactions: TransactionRecord[];
  docName: string;
}

export const JudgesConsoleModal: React.FC<JudgesConsoleModalProps> = ({
  isOpen,
  onClose,
  ydoc,
  transactions,
  docName,
}) => {
  const [activeTab, setActiveTab] = useState<'clocks' | 'structs' | 'transactions' | 'compaction'>('clocks');
  const [isCompacting, setIsCompacting] = useState(false);
  const [compactionLog, setCompactionLog] = useState<any>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !ydoc) return null;

  const vectorClocks = CrdtInspector.getVectorClocks(ydoc);
  const structItems = CrdtInspector.getStructItems(ydoc, 80);
  const deleteSummary = CrdtInspector.getDeleteSetSummary(ydoc);
  const docBytes = CrdtInspector.getDocByteSize(ydoc);

  const handleTriggerCompaction = async () => {
    setIsCompacting(true);
    try {
      const res = await fetch(`http://${window.location.hostname}:1234/api/docs/${docName}/compact`, {
        method: 'POST',
      });
      const data = await res.json();
      setCompactionLog(data);
    } catch (err) {
      setCompactionLog({ error: (err as Error).message });
    } finally {
      setIsCompacting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 8, 15, 0.85)',
        backdropFilter: 'blur(14px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '920px',
          height: '620px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0c101a',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 30px rgba(139, 92, 246, 0.15)',
          overflow: 'hidden',
          borderRadius: '16px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div
          style={{
            padding: '1rem 1.5rem',
            background: 'rgba(17, 24, 39, 0.8)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Cpu size={18} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>The Judge's Console — CRDT Deep Inspector</span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    background: 'rgba(139, 92, 246, 0.25)',
                    color: '#c4b5fd',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    border: '1px solid rgba(139, 92, 246, 0.4)',
                  }}
                >
                  Cmd+Shift+D
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Inspect real-time vector clocks, Yjs struct store item trees, and garbage collection snapshots
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.5rem 1.5rem',
            background: '#090d16',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('clocks')}
            style={getTabStyle(activeTab === 'clocks')}
          >
            <Clock size={15} />
            <span>Vector Clocks ({vectorClocks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('structs')}
            style={getTabStyle(activeTab === 'structs')}
          >
            <Layers size={15} />
            <span>CRDT Item Tree ({structItems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('transactions')}
            style={getTabStyle(activeTab === 'transactions')}
          >
            <Activity size={15} />
            <span>Live Transaction Stream ({transactions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('compaction')}
            style={getTabStyle(activeTab === 'compaction')}
          >
            <Trash2 size={15} />
            <span>State Compactor & GC</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div style={{ flex: 1, padding: '1.25rem 1.5rem', overflowY: 'auto' }}>
          {/* TAB 1: VECTOR CLOCKS */}
          {activeTab === 'clocks' && (
            <div>
              <div
                style={{
                  background: 'rgba(59, 130, 246, 0.06)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontSize: '0.82rem',
                  color: '#93c5fd',
                  marginBottom: '1rem',
                }}
              >
                💡 <strong>Distributed Convergence Principle:</strong> Vector clocks maintain causal ordering across
                all decentralized peers. In Yjs, the state vector maps each contributing <code>ClientID</code> to its
                highest contiguous clock sequence number. When two nodes possess identical state vectors, their documents
                are mathematically identical without central coordination!
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                {vectorClocks.map((entry) => (
                  <div
                    key={entry.clientId}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '10px',
                      padding: '12px 14px',
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Client Node ID</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#60a5fa', fontFamily: 'monospace' }}>
                      {entry.clientId}
                    </div>
                    <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ color: '#94a3b8' }}>Sequence Clock:</span>
                      <span style={{ color: '#34d399', fontWeight: 700, fontFamily: 'monospace' }}>{entry.clock}</span>
                    </div>
                  </div>
                ))}
              </div>

              {deleteSummary.length > 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.85rem', color: '#f8fafc', marginBottom: '8px' }}>
                    Active Deletion Sets (Tombstones)
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {deleteSummary.map((ds) => (
                      <div
                        key={ds.clientId}
                        style={{
                          background: 'rgba(239, 68, 68, 0.08)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          color: '#fca5a5',
                        }}
                      >
                        <span>Client {ds.clientId}: {ds.count} character deletions</span>
                        <code style={{ fontSize: '0.75rem', color: '#f87171' }}>{ds.ranges}</code>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CRDT STRUCT STORE */}
          {activeTab === 'structs' && (
            <div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Showing first {structItems.length} items in internal linked list struct tree:</span>
                <span style={{ color: '#60a5fa', fontWeight: 600 }}>Total State Size: {docBytes} bytes</span>
              </div>

              <div
                style={{
                  maxHeight: '380px',
                  overflowY: 'auto',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontFamily: 'monospace',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#111722', color: '#94a3b8', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <th style={{ padding: '8px 12px' }}>Struct ID (Client:Clock)</th>
                      <th style={{ padding: '8px 12px' }}>Origin</th>
                      <th style={{ padding: '8px 12px' }}>Type</th>
                      <th style={{ padding: '8px 12px' }}>Len</th>
                      <th style={{ padding: '8px 12px' }}>Status</th>
                      <th style={{ padding: '8px 12px' }}>Content Preview</th>
                    </tr>
                  </thead>
                  <tbody>
                    {structItems.map((item, idx) => (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                          background: item.deleted ? 'rgba(239, 68, 68, 0.04)' : idx % 2 === 0 ? 'rgba(255, 255, 255, 0.01)' : 'transparent',
                        }}
                      >
                        <td style={{ padding: '6px 12px', color: '#60a5fa' }}>{item.id}</td>
                        <td style={{ padding: '6px 12px', color: '#a78bfa' }}>{item.origin}</td>
                        <td style={{ padding: '6px 12px', color: '#f59e0b' }}>{item.type}</td>
                        <td style={{ padding: '6px 12px', color: '#94a3b8' }}>{item.length}</td>
                        <td style={{ padding: '6px 12px' }}>
                          {item.deleted ? (
                            <span style={{ color: '#ef4444', fontWeight: 600 }}>DELETED</span>
                          ) : (
                            <span style={{ color: '#10b981' }}>ACTIVE</span>
                          )}
                        </td>
                        <td style={{ padding: '6px 12px', color: '#e2e8f0' }}>{item.contentPreview}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE TRANSACTION STREAM */}
          {activeTab === 'transactions' && (
            <div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '10px' }}>
                Real-time chronological log of Yjs transactions flowing through this node:
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  maxHeight: '380px',
                  overflowY: 'auto',
                }}
              >
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.78rem',
                      fontFamily: 'monospace',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor:
                            tx.origin === 'local-keystroke'
                              ? '#3b82f6'
                              : tx.origin === 'remote-peer'
                              ? '#10b981'
                              : '#8b5cf6',
                        }}
                      />
                      <span style={{ color: '#f8fafc', fontWeight: 600 }}>{tx.origin}</span>
                      <span style={{ color: '#64748b' }}>TxID: {tx.id}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ color: '#38bdf8' }}>+{tx.byteDelta} bytes</span>
                      <span style={{ color: '#94a3b8' }}>
                        {new Date(tx.timestamp).toLocaleTimeString()}.{String(tx.timestamp % 1000).padStart(3, '0')}
                      </span>
                    </div>
                  </div>
                ))}

                {transactions.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', fontSize: '0.85rem' }}>
                    Type something in the editor to see CRDT transactions stream in real-time!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: STATE COMPACTOR & GC */}
          {activeTab === 'compaction' && (
            <div>
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.06)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '0.82rem',
                  color: '#6ee7b7',
                  marginBottom: '1.25rem',
                }}
              >
                🛡️ <strong>Long-Session Memory Defense (Garbage Collection):</strong> As collaborators type and delete,
                historical tombstone structs accumulate in memory. Our State Compactor consolidates the entire update history
                into a minimal state snapshot (<code>Y.encodeStateAsUpdate</code>) and writes a pristine binary snapshot to disk,
                preserving vector clocks while ensuring the browser memory footprint remains constant indefinitely.
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                <button
                  type="button"
                  onClick={handleTriggerCompaction}
                  disabled={isCompacting}
                  className="btn-primary"
                  style={{
                    padding: '0.65rem 1.25rem',
                    fontSize: '0.9rem',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                  }}
                >
                  <RefreshCw size={16} className={isCompacting ? 'pulse-green' : ''} />
                  <span>{isCompacting ? 'Consolidating Snapshot...' : 'Trigger State Compaction Now'}</span>
                </button>

                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Current Local Encoded Size: <strong>{docBytes} bytes</strong>
                </span>
              </div>

              {compactionLog && (
                <div
                  style={{
                    background: '#090d16',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '10px',
                    padding: '14px 16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px' }}>
                    <CheckCircle2 size={18} />
                    <span>Compaction & GC Successful!</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginTop: '10px', fontSize: '0.8rem' }}>
                    <div>
                      <span style={{ color: '#94a3b8' }}>Original Size:</span>
                      <div style={{ fontWeight: 700, color: '#f8fafc' }}>{compactionLog.originalSizeBytes} B</div>
                    </div>
                    <div>
                      <span style={{ color: '#94a3b8' }}>Compacted Size:</span>
                      <div style={{ fontWeight: 700, color: '#34d399' }}>{compactionLog.compactedSizeBytes} B</div>
                    </div>
                    <div>
                      <span style={{ color: '#94a3b8' }}>Bytes Saved:</span>
                      <div style={{ fontWeight: 700, color: '#60a5fa' }}>{compactionLog.bytesSaved} B</div>
                    </div>
                    <div>
                      <span style={{ color: '#94a3b8' }}>Compaction Latency:</span>
                      <div style={{ fontWeight: 700, color: '#f59e0b' }}>{compactionLog.durationMs} ms</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function getTabStyle(isActive: boolean): React.CSSProperties {
  return {
    background: isActive ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
    color: isActive ? '#c4b5fd' : '#94a3b8',
    border: isActive ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid transparent',
    borderRadius: '8px',
    padding: '6px 12px',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.15s ease',
  };
}
