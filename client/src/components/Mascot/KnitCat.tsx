import React, { useState } from 'react';
import './cat.css';

interface KnitCatProps {
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  showBubble?: boolean;
}

const CAT_PHRASES = [
  'Knitting your edits in real-time! 🧶',
  'Zero dropped stitches (0% data loss)! ✨',
  'Weaving CRDT state vectors... 🐾',
  'Conflict-free collaborative magic! 💖',
  'Purr-fect synchronization! 🐱',
];

export const KnitCat: React.FC<KnitCatProps> = ({
  size = 'md',
  interactive = true,
  showBubble: initialBubble = false,
}) => {
  const [bubbleText, setBubbleText] = useState<string | null>(initialBubble ? CAT_PHRASES[0] : null);
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [isPurring, setIsPurring] = useState(false);

  // Cycle phrases when clicked
  const handleClick = () => {
    if (!interactive) return;
    const nextIdx = (phraseIdx + 1) % CAT_PHRASES.length;
    setPhraseIdx(nextIdx);
    setBubbleText(CAT_PHRASES[nextIdx]);
    setIsPurring(true);
    setTimeout(() => setIsPurring(false), 2500);
  };

  // Dimensions based on size
  const scale = size === 'sm' ? 0.38 : size === 'lg' ? 1.25 : 0.85;
  const width = 240 * scale;
  const height = 180 * scale;

  return (
    <div
      className="knit-cat-container"
      onClick={handleClick}
      onMouseEnter={() => {
        if (interactive && !bubbleText) {
          setBubbleText(CAT_PHRASES[phraseIdx]);
        }
      }}
      onMouseLeave={() => {
        if (interactive && !isPurring) {
          setBubbleText(null);
        }
      }}
      style={{
        cursor: interactive ? 'pointer' : 'default',
      }}
      title={interactive ? 'Knit Cat Mascot — Click to hear a purr!' : 'Knit Mascot'}
    >
      {/* Speech Bubble */}
      {bubbleText && (
        <div className="knit-cat-bubble">
          <span>{bubbleText}</span>
        </div>
      )}

      {/* Floating Purr Music/Heart Particles */}
      {isPurring && (
        <>
          <span className="purr-particle-1">🧶</span>
          <span className="purr-particle-2">💖</span>
        </>
      )}

      <svg
        width={width}
        height={height}
        viewBox="0 0 240 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Gradient for Cat Body matching the reference screenshot */}
          <linearGradient id="catBodyGrad" x1="70" y1="30" x2="140" y2="170" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ff5ea7" />
            <stop offset="45%" stopColor="#f43f8e" />
            <stop offset="100%" stopColor="#e11d48" />
          </linearGradient>

          {/* Inner Ear Dark Pink */}
          <linearGradient id="innerEarGrad" x1="105" y1="35" x2="120" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#be185d" />
            <stop offset="100%" stopColor="#831843" />
          </linearGradient>

          {/* White Chest Gradient */}
          <linearGradient id="catBellyGrad" x1="90" y1="70" x2="110" y2="160" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="85%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>

          {/* Yarn Ball Gradient */}
          <radialGradient id="yarnBallGrad" cx="42" cy="148" r="18" fx="38" fy="144" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffa059" />
            <stop offset="40%" stopColor="#ff5757" />
            <stop offset="85%" stopColor="#d91b6e" />
            <stop offset="100%" stopColor="#831843" />
          </radialGradient>

          {/* Ground Soft Cast Shadow */}
          <radialGradient id="catShadowGrad" cx="115" cy="166" r="85" fx="115" fy="166" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(8, 12, 24, 0.85)" />
            <stop offset="40%" stopColor="rgba(15, 23, 42, 0.6)" />
            <stop offset="80%" stopColor="rgba(255, 42, 133, 0.08)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          {/* Needles Metallic Glow */}
          <linearGradient id="needleGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>

        {/* 1. Ground Cast Shadow */}
        <ellipse
          className="cat-ground-shadow"
          cx="118"
          cy="166"
          rx="78"
          ry="11"
          fill="url(#catShadowGrad)"
        />

        {/* 2. Sinuous Wavy Waving Tail (Behind body & extending to right) */}
        <g id="cat-tail-group">
          {/* Base / Root Segment */}
          <g className="cat-tail-root">
            <path
              d="M 132 145 C 142 145, 155 142, 166 145"
              stroke="url(#catBodyGrad)"
              strokeWidth="11"
              strokeLinecap="round"
            />

            {/* Middle Wave Segment */}
            <g className="cat-tail-mid">
              <path
                d="M 164 145 C 178 148, 188 152, 196 156"
                stroke="url(#catBodyGrad)"
                strokeWidth="10"
                strokeLinecap="round"
              />

              {/* Tip Wave Segment - Curving upward/downward gracefully */}
              <g className="cat-tail-tip">
                <path
                  d="M 194 156 C 204 160, 212 162, 215 156 C 218 150, 214 140, 206 136"
                  stroke="url(#catBodyGrad)"
                  strokeWidth="9"
                  strokeLinecap="round"
                />
                {/* Cute fluffy tip highlight */}
                <circle cx="206" cy="136" r="4.2" fill="#ff77b9" />
              </g>
            </g>
          </g>
        </g>

        {/* 3. Cat Torso, Head, and Ears with Breathing Motion */}
        <g className="cat-body-breathing">
          {/* Main Cat Body Silhouette */}
          <path
            d="M 98 42
               C 92 48, 88 56, 86 68
               C 83 82, 78 100, 75 118
               C 72 135, 73 154, 82 162
               C 90 168, 126 168, 134 160
               C 142 152, 142 130, 138 112
               C 134 94, 130 76, 124 62
               C 120 54, 116 46, 112 42
               Z"
            fill="url(#catBodyGrad)"
          />

          {/* Left Ear */}
          <polygon
            points="92,48 98,28 106,44"
            fill="url(#catBodyGrad)"
          />

          {/* Right Ear with twitch animation */}
          <g className="cat-ear-twitch">
            <polygon
              points="108,44 118,26 125,48"
              fill="url(#catBodyGrad)"
            />
            {/* Darker Inner Ear */}
            <polygon
              points="111,43 117,31 122,46"
              fill="url(#innerEarGrad)"
            />
          </g>

          {/* Tiny Cute Nose & Closed Happy Eyes */}
          <circle cx="94" cy="52" r="1.8" fill="#831843" />
          <path
            d="M 92 49 Q 95 47 98 49"
            stroke="#831843"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
          />

          {/* White Chest & Belly Contour */}
          <path
            d="M 94 62
               C 90 75, 87 96, 88 116
               C 89 135, 91 154, 94 163
               C 98 165, 106 165, 109 160
               C 112 152, 110 134, 108 114
               C 106 95, 102 76, 98 62
               Z"
            fill="url(#catBellyGrad)"
          />
        </g>

        {/* 4. Yarn Ball on Floor Beside Cat */}
        <g id="yarn-ball-group">
          <circle cx="48" cy="154" r="14" fill="url(#yarnBallGrad)" />
          {/* Yarn texture ribs */}
          <path
            d="M 38 148 C 44 144, 52 144, 58 150"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeOpacity="0.45"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 37 154 C 44 150, 52 152, 59 157"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeOpacity="0.4"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 42 160 C 47 163, 53 162, 57 159"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeOpacity="0.35"
            fill="none"
            strokeLinecap="round"
          />

          {/* Thread leading from yarn ball to cat's paws */}
          <path
            className="knit-yarn-thread"
            d="M 54 144 Q 68 132 82 126"
            stroke="#ff80b0"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
          />
        </g>

        {/* 5. Cat Paws & Active Knitting Animation */}
        <g id="knitting-hands-group">
          {/* Left Cat Paw */}
          <ellipse cx="88" cy="126" rx="6" ry="4" fill="#f43f8e" />
          <ellipse cx="88" cy="126" rx="4" ry="2.5" fill="#ffffff" />

          {/* Right Cat Paw */}
          <ellipse cx="106" cy="126" rx="6" ry="4" fill="#f43f8e" />
          <ellipse cx="106" cy="126" rx="4" ry="2.5" fill="#ffffff" />

          {/* Left Knitting Needle */}
          <g className="knit-needle-left">
            <line
              x1="76"
              y1="138"
              x2="104"
              y2="114"
              stroke="url(#needleGrad)"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            {/* Needle tip knob */}
            <circle cx="75" cy="139" r="2.2" fill="#d97706" />
          </g>

          {/* Right Knitting Needle */}
          <g className="knit-needle-right">
            <line
              x1="116"
              y1="138"
              x2="88"
              y2="114"
              stroke="url(#needleGrad)"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            {/* Needle tip knob */}
            <circle cx="117" cy="139" r="2.2" fill="#d97706" />
          </g>

          {/* Knitted stitch loops pulsing between needles */}
          <g className="knit-loop-pulse">
            <path
              d="M 92 120 Q 96 116 100 120 Q 96 124 92 120"
              fill="#ff4d94"
              stroke="#ffffff"
              strokeWidth="0.9"
            />
            <path
              d="M 94 123 Q 97 121 100 123"
              stroke="#ffa059"
              strokeWidth="1.2"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        </g>
      </svg>
    </div>
  );
};
