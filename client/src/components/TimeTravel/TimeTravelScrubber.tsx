import React, { useState, useEffect } from 'react';
import {
  History,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Clock,
  Sparkles,
  X,
} from 'lucide-react';
import type { TimelineSnapshot } from '../../types/index.js';

interface TimeTravelScrubberProps {
  snapshots: TimelineSnapshot[];
  currentStep: number | null;
  onStepChange: (step: number | null) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const TimeTravelScrubber: React.FC<TimeTravelScrubberProps> = ({
  snapshots,
  currentStep,
  onStepChange,
  isOpen,
  onToggleOpen,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2 | 4>(1);

  const totalSteps = snapshots.length;
  const activeIndex = currentStep !== null ? currentStep : totalSteps;

  // Auto-play timer
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        if (currentStep === null) {
          onStepChange(0);
        } else if (currentStep < totalSteps) {
          onStepChange(currentStep + 1);
        } else {
          setIsPlaying(false);
        }
      }, 500 / playbackSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentStep, totalSteps, playbackSpeed, onStepChange]);

  if (!isOpen) {
    return (
      <button
        onClick={onToggleOpen}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 80,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 18px',
          borderRadius: '24px',
          background: 'rgba(19, 17, 28, 0.85)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(236, 72, 153, 0.4)',
          color: '#f8fafc',
          fontWeight: 600,
          fontSize: '0.85rem',
          cursor: 'pointer',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(236, 72, 153, 0.25)',
          transition: 'all 0.2s ease',
        }}
        title="Open CRDT Time-Travel Keystroke Replay"
      >
        <History size={16} color="#ec4899" />
        <span>Time-Travel Replay</span>
        <span
          style={{
            fontSize: '0.7rem',
            padding: '2px 6px',
            borderRadius: '10px',
            background: 'rgba(236, 72, 153, 0.2)',
            color: '#ec4899',
            border: '1px solid rgba(236, 72, 153, 0.3)',
          }}
        >
          {totalSteps} steps
        </span>
      </button>
    );
  }

  const activeSnapshot = snapshots[activeIndex - 1] || snapshots[0];
  const isTimeTraveling = currentStep !== null && currentStep < totalSteps;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 90,
        width: '90%',
        maxWidth: '840px',
        background: 'rgba(13, 17, 26, 0.95)',
        backdropFilter: 'blur(24px)',
        border: isTimeTraveling ? '1px solid rgba(245, 158, 11, 0.6)' : '1px solid rgba(236, 72, 153, 0.35)',
        borderRadius: '18px',
        padding: '14px 22px',
        boxShadow: isTimeTraveling
          ? '0 20px 50px rgba(0, 0, 0, 0.85), 0 0 30px rgba(245, 158, 11, 0.25)'
          : '0 20px 50px rgba(0, 0, 0, 0.85), 0 0 30px rgba(236, 72, 153, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        animation: 'modalScaleUp 0.2s ease',
      }}
    >
      {/* Top row: Status, Step counter, Close */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: isTimeTraveling ? 'rgba(245, 158, 11, 0.2)' : 'rgba(236, 72, 153, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isTimeTraveling ? '#f59e0b' : '#ec4899',
            }}
          >
            <History size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>CRDT Keystroke Playback</span>
              {isTimeTraveling ? (
                <span
                  style={{
                    fontSize: '0.68rem',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: '#f59e0b',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    fontWeight: 700,
                  }}
                >
                  REWIND ACTIVE
                </span>
              ) : (
                <span
                  style={{
                    fontSize: '0.68rem',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    fontWeight: 700,
                  }}
                >
                  LIVE HEAD
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={11} />
              <span>
                {activeSnapshot ? activeSnapshot.summary : 'Initial baseline'} •{' '}
                {activeSnapshot ? new Date(activeSnapshot.timestamp).toLocaleTimeString() : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Right action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isTimeTraveling && (
            <button
              onClick={() => {
                setIsPlaying(false);
                onStepChange(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '8px',
                background: 'rgba(245, 158, 11, 0.2)',
                border: '1px solid rgba(245, 158, 11, 0.5)',
                color: '#fcd34d',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={12} />
              <span>Return to Live Head</span>
            </button>
          )}

          {/* Speed Toggle */}
          <button
            onClick={() => setPlaybackSpeed((prev) => (prev === 1 ? 2 : prev === 2 ? 4 : 1))}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#cbd5e1',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {playbackSpeed}x
          </button>

          <button
            onClick={onToggleOpen}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Middle row: Scrubber Slider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <input
          type="range"
          min={0}
          max={totalSteps}
          value={activeIndex}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            if (val >= totalSteps) {
              onStepChange(null);
            } else {
              onStepChange(val);
            }
          }}
          style={{
            flex: 1,
            accentColor: isTimeTraveling ? '#f59e0b' : '#ec4899',
            cursor: 'pointer',
            height: '6px',
          }}
        />
        <span style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, minWidth: '75px', textAlign: 'right' }}>
          {activeIndex} / {totalSteps}
        </span>
      </div>

      {/* Bottom row: Playback Controls & Snapshot details */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Step Back */}
          <button
            disabled={activeIndex <= 0}
            onClick={() => onStepChange(Math.max(0, activeIndex - 1))}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fff',
              padding: '6px',
              borderRadius: '8px',
              cursor: activeIndex <= 0 ? 'not-allowed' : 'pointer',
            }}
            title="Step backward 1 mutation"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Play / Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              background: isPlaying
                ? 'rgba(244, 63, 94, 0.2)'
                : 'linear-gradient(135deg, #ec4899, #8b5cf6)',
              color: '#fff',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlaying ? 'Pause Replay' : 'Play Timeline'}</span>
          </button>

          {/* Step Forward */}
          <button
            disabled={activeIndex >= totalSteps}
            onClick={() => {
              const next = activeIndex + 1;
              if (next >= totalSteps) onStepChange(null);
              else onStepChange(next);
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fff',
              padding: '6px',
              borderRadius: '8px',
              cursor: activeIndex >= totalSteps ? 'not-allowed' : 'pointer',
            }}
            title="Step forward 1 mutation"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={12} color="#ec4899" />
          <span>Inspects raw CRDT vector state deltas without network mutations</span>
        </div>
      </div>
    </div>
  );
};
