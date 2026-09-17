import React, { useState } from 'react';
import { KnitCat } from './KnitCat.js';
import { Sparkles, ChevronUp, ChevronDown } from 'lucide-react';

interface MascotStageProps {
  status: string;
}

export const MascotStage: React.FC<MascotStageProps> = ({ status }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '0.75rem',
        marginBottom: isCollapsed ? '0.75rem' : '2rem',
        paddingTop: isCollapsed ? '0' : '1.75rem',
        position: 'relative',
        zIndex: 5,
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {!isCollapsed && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          {/* Animated Knitting Cat */}
          <KnitCat size="md" interactive={true} showBubble={false} />

          {/* Slogan matching reference image aesthetics */}
          <div
            style={{
              marginTop: '10px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <div
              style={{
                fontSize: '0.92rem',
                color: '#e2e8f0',
                fontWeight: 500,
                letterSpacing: '-0.01em',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)',
              }}
            >
              A customizable animated radial gradient background with a subtle breathing effect.
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                color: '#ff80b0',
                fontWeight: 600,
              }}
            >
              <Sparkles size={12} color="#ff80b0" />
              <span>
                {status === 'connected'
                  ? 'Weaving edits synchronously across all connected peers'
                  : status === 'partitioned'
                  ? 'Offline editing active — stitches saved locally to IndexedDB'
                  : 'Connecting to collaborative mesh...'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Subtle toggle button for mascot stage */}
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          marginTop: isCollapsed ? '0' : '8px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '9999px',
          color: '#94a3b8',
          padding: '2px 10px',
          fontSize: '0.7rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.15s ease',
        }}
        title={isCollapsed ? 'Show Knit Mascot Stage' : 'Minimize Mascot Stage'}
      >
        <span>{isCollapsed ? '🧶 Show Knit Cat' : 'Hide Mascot'}</span>
        {isCollapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
      </button>
    </div>
  );
};
