import React, { useState } from 'react';
import { Wifi, WifiOff, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { ConnectionStatus } from '../../types/index.js';

interface ChaosToggleProps {
  status: ConnectionStatus;
  onSimulatePartition: () => void;
  onHealPartition: () => void;
}

export const ChaosToggle: React.FC<ChaosToggleProps> = ({
  status,
  onSimulatePartition,
  onHealPartition,
}) => {
  const isPartitioned = status === 'partitioned';
  const [showBanner, setShowBanner] = useState(false);

  const handleToggle = () => {
    if (isPartitioned) {
      onHealPartition();
      // Trigger confetti celebration on partition healing with Knit brand palette
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.2 },
          colors: ['#ff2a85', '#8b5cf6', '#ff6b35', '#00e5ff', '#10b981'],
        });
      } catch {
        // Fallback
      }
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 6000);
    } else {
      onSimulatePartition();
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button
        type="button"
        onClick={handleToggle}
        className={isPartitioned ? 'pulse-danger' : ''}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '9999px',
          fontSize: '0.8rem',
          fontWeight: 700,
          letterSpacing: '0.01em',
          border: isPartitioned ? '1px solid #ef4444' : '1px solid rgba(16, 185, 129, 0.45)',
          background: isPartitioned
            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(185, 28, 28, 0.35))'
            : 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.3))',
          color: isPartitioned ? '#fca5a5' : '#6ee7b7',
          cursor: 'pointer',
          boxShadow: isPartitioned ? '0 0 14px rgba(239, 68, 68, 0.3)' : '0 0 14px rgba(16, 185, 129, 0.25)',
          transition: 'all 0.25s ease',
        }}
        title={
          isPartitioned
            ? 'Click to Heal Network Partition and reconnect WebSocket'
            : 'Click to Sever WebSocket connection and test offline CRDT typing'
        }
      >
        {isPartitioned ? (
          <>
            <WifiOff size={15} color="#ef4444" />
            <span>CHAOS ACTIVE: PARTITIONED</span>
          </>
        ) : (
          <>
            <Wifi size={15} color="#10b981" />
            <span>ONLINE: SYNCED</span>
          </>
        )}
      </button>

      {/* Merge Celebration Notification Banner */}
      {showBanner && (
        <div
          style={{
            position: 'fixed',
            top: '75px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95))',
            color: '#ecfdf5',
            padding: '12px 22px',
            borderRadius: '14px',
            boxShadow: '0 15px 40px rgba(0, 0, 0, 0.7), 0 0 20px rgba(16, 185, 129, 0.4)',
            border: '1px solid rgba(52, 211, 153, 0.5)',
            fontSize: '0.86rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 100,
            animation: 'cursorFadeIn 0.3s ease-out',
            backdropFilter: 'blur(16px)',
          }}
        >
          <Zap size={18} color="#ffffff" />
          <span>
            🧶 <strong>Knit Partition Healed!</strong> Yjs seamlessly woven local & remote edits conflict-free
            using character-level interleaving!
          </span>
        </div>
      )}
    </div>
  );
};
