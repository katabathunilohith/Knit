import React, { memo } from 'react';
import './background.css';

export const BreathingWaveBackground: React.FC = memo(() => {
  return (
    <div className="knit-bg-container" aria-hidden="true">
      {/* Top subtle indigo-magenta glow */}
      <div className="knit-top-shimmer" />

      {/* Layer 1: Core Radial Breathing Arc */}
      <div className="knit-wave-core" />

      {/* Layer 2: Undulating Secondary Wave */}
      <div className="knit-wave-secondary" />

      {/* Layer 3: Ambient Glow Horizon */}
      <div className="knit-wave-glow" />

      {/* Vignette overlay */}
      <div className="knit-bg-vignette" />
    </div>
  );
});

BreathingWaveBackground.displayName = 'BreathingWaveBackground';
