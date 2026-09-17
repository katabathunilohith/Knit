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
      // Trigger confetti celebration on partition healing
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.2 },
          colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
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
          fontWeight: 600,
          border: isPartitioned ? '1px solid #ef4444' : '1px solid rgba(16, 185, 129, 0.4)',
          background: isPartitioned
            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(185, 28, 28, 0.3))'
            : 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.25))',
          color: isPartitioned ? '#fca5a5' : '#6ee7b7',
          cursor: 'pointer',
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
            top: '72px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #065f46, #047857)',
            color: '#ecfdf5',
            padding: '10px 20px',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(52, 211, 153, 0.4)',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 100,
            animation: 'cursorFadeIn 0.3s ease-out',
          }}
        >
          <Zap size={18} color="#34d399" />
          <span>
            ⚡ <strong>Partition Healed!</strong> Yjs merged local & remote edits conflict-free
            using character-level interleaving!
          </span>
        </div>
      )}
    </div>
  );
};
