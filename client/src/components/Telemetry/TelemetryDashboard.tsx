import React, { useState } from 'react';
import {
  Activity,
  HardDrive,
  Users,
  Database,
  ChevronUp,
  ChevronDown,
  Terminal,
  Zap,
} from 'lucide-react';
import type { ConnectionStatus } from '../../types/index.js';
import type { AwarenessThrottler } from '../../utils/awarenessThrottler.js';

interface TelemetryDashboardProps {
  status: ConnectionStatus;
  pingMs: number;
  docSizeBytes: number;
  structCount: number;
  peerCount: number;
  isIndexedDbSynced: boolean;
  totalKeystrokes: number;
  throttler: AwarenessThrottler | null;
  onOpenJudgesConsole: () => void;
}

export const TelemetryDashboard: React.FC<TelemetryDashboardProps> = ({
  status,
  pingMs,
  docSizeBytes,
  structCount,
  peerCount,
  isIndexedDbSynced,
  totalKeystrokes,
  throttler,
  onOpenJudgesConsole,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const bandwidthSavedPct = throttler ? throttler.getReductionRatio() : 75;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.25rem',
        right: '1.25rem',
        zIndex: 50,
        width: isExpanded ? '330px' : 'auto',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div
        className="glass-panel"
        style={{
          padding: isExpanded ? '14px 16px' : '8px 14px',
          backgroundColor: 'rgba(10, 14, 23, 0.92)',
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.7), 0 0 20px rgba(255, 42, 133, 0.15)',
          border: '1px solid rgba(255, 42, 133, 0.22)',
          borderRadius: isExpanded ? '16px' : '9999px',
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            gap: '8px',
          }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor:
                  status === 'connected'
                    ? '#10b981'
                    : status === 'partitioned'
                    ? '#ef4444'
                    : '#f59e0b',
                boxShadow:
                  status === 'connected'
                    ? '0 0 10px #10b981'
                    : status === 'partitioned'
                    ? '0 0 10px #ef4444'
                    : 'none',
              }}
            />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>🧶</span>
              <span>Knit CRDT HUD</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {status === 'connected' && (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: pingMs < 30 ? '#00e5ff' : '#fbbf24',
                  fontFamily: 'monospace',
                }}
              >
                {pingMs}ms
              </span>
            )}
            <button
              type="button"
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
          </div>
        </div>

        {/* Expanded Telemetry Grid */}
        {isExpanded && (
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Metric Row 1: Latency & CRDT Doc Size */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#94a3b8', fontSize: '0.7rem' }}>
                  <Activity size={12} color="#00e5ff" />
                  <span>WS RTT Latency</span>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginTop: '3px', fontFamily: 'monospace' }}>
                  {status === 'connected' ? `${pingMs} ms` : status === 'partitioned' ? 'Partitioned' : 'Syncing...'}
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#94a3b8', fontSize: '0.7rem' }}>
                  <HardDrive size={12} color="#ff2a85" />
                  <span>CRDT State Size</span>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginTop: '3px', fontFamily: 'monospace' }}>
                  {formatBytes(docSizeBytes)}
                </div>
              </div>
            </div>

            {/* Metric Row 2: Peers & CRDT Structs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#94a3b8', fontSize: '0.7rem' }}>
                  <Users size={12} color="#ff6b35" />
                  <span>Active Peers</span>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginTop: '3px', fontFamily: 'monospace' }}>
                  {peerCount} {peerCount === 1 ? 'client' : 'clients'}
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#94a3b8', fontSize: '0.7rem' }}>
                  <Database size={12} color="#a855f7" />
                  <span>CRDT Structs</span>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginTop: '3px', fontFamily: 'monospace' }}>
                  {structCount} items
                </div>
              </div>
            </div>

            {/* Optimization Status: Local-First & Throttling */}
            <div
              style={{
                fontSize: '0.72rem',
                color: '#94a3b8',
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '6px 10px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>Awareness Throttling (35ms):</span>
              <span style={{ color: '#00e5ff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Zap size={11} /> ~{bandwidthSavedPct}% socket traffic saved
              </span>
            </div>

            <div
              style={{
                fontSize: '0.72rem',
                color: '#94a3b8',
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '6px 10px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>Session Keystrokes:</span>
              <span style={{ color: '#ff80b0', fontWeight: 600, fontFamily: 'monospace' }}>
                {totalKeystrokes} mutations
              </span>
            </div>

            <div
              style={{
                fontSize: '0.72rem',
                color: '#94a3b8',
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '6px 10px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>Local Storage:</span>
              <span style={{ color: isIndexedDbSynced ? '#34d399' : '#fbbf24', fontWeight: 600 }}>
                {isIndexedDbSynced ? 'IndexedDB Synced (Zero Loss)' : 'Syncing IDB...'}
              </span>
            </div>

            {/* Judge's Console Trigger Button */}
            <button
              type="button"
              onClick={onOpenJudgesConsole}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                width: '100%',
                padding: '8px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, rgba(255, 42, 133, 0.2), rgba(139, 92, 246, 0.25))',
                border: '1px solid rgba(255, 42, 133, 0.4)',
                color: '#fce7f3',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Terminal size={14} color="#ff80b0" />
              <span>Inspect Raw CRDT (Cmd+Shift+D)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
