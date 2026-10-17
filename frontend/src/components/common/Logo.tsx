'use client';

import React from 'react';

interface LogoProps {
  size?: number;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 38, showText = true }) => {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem' }}>
      {/* High-Resolution Vector Agrarian Emblem */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, filter: 'drop-shadow(0 2px 8px rgba(245, 158, 11, 0.35))' }}
      >
        <defs>
          <linearGradient id="hlGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="60%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="hlGreenGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
          <radialGradient id="hlBackGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Glow */}
        <circle cx="24" cy="24" r="22" fill="url(#hlBackGlow)" />

        {/* Rounded Container Plate */}
        <rect
          x="2"
          y="2"
          width="44"
          height="44"
          rx="12"
          fill="#0F172A"
          stroke="rgba(245, 158, 11, 0.4)"
          strokeWidth="1.5"
        />

        {/* Crown Foliage (Top-Leaves) */}
        {/* Center leaf */}
        <path
          d="M24 7C24 7 21 13 22 17C23 17.5 25 17.5 26 17C27 13 24 7 24 7Z"
          fill="url(#hlGreenGrad)"
        />
        {/* Left leaf */}
        <path
          d="M22 17C19.5 13.5 16 11 14 11C15 14 17.5 17 21 18Z"
          fill="#10B981"
        />
        {/* Right leaf */}
        <path
          d="M26 17C28.5 13.5 32 11 34 11C33 14 30.5 17 27 18Z"
          fill="#059669"
        />

        {/* Pineapple Body Core */}
        <ellipse cx="24" cy="28.5" rx="10.5" ry="12.5" fill="url(#hlGoldGrad)" />

        {/* Diamond Reticle Lattice (Horticultural Facets + AI Nodes) */}
        <path
          d="M17 24L24 18L31 24L24 30L17 24Z"
          stroke="#92400E"
          strokeWidth="1.2"
          fill="none"
          opacity="0.6"
        />
        <path
          d="M15 28.5L24 22L33 28.5L24 35L15 28.5Z"
          stroke="#92400E"
          strokeWidth="1.2"
          fill="none"
          opacity="0.5"
        />
        <path
          d="M18 33L24 28L30 33L24 38L18 33Z"
          stroke="#92400E"
          strokeWidth="1.2"
          fill="none"
          opacity="0.6"
        />

        {/* Center AI Intelligence Core Node */}
        <circle cx="24" cy="26" r="2.2" fill="#FFFFFF" />
        <circle cx="24" cy="26" r="4" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.6" />
      </svg>

      {/* Typography with Guaranteed 100% Solid Contrast */}
      {showText && (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
          <span
            style={{
              fontWeight: 800,
              fontSize: '1.25rem',
              letterSpacing: '-0.025em',
              color: '#FFFFFF',
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)',
            }}
          >
            HARVESTLINK
          </span>
          <span
            style={{
              fontWeight: 900,
              fontSize: '1.25rem',
              letterSpacing: '-0.02em',
              color: '#F59E0B',
              textShadow: '0 0 12px rgba(245, 158, 11, 0.45)',
            }}
          >
            AI
          </span>
        </div>
      )}
    </div>
  );
};
