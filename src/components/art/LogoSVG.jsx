import React from 'react';

export const LogoSVG = ({ className = "w-8 h-8" }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="pvLogoGlow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="50%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
      <linearGradient id="pvShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0f172a" />
        <stop offset="100%" stopColor="#1e1b4b" />
      </linearGradient>
      <filter id="logoShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#38bdf8" floodOpacity="0.4" />
      </filter>
    </defs>

    {/* Shield Outer Outer Glow Ring */}
    <circle cx="50" cy="50" r="46" stroke="url(#pvLogoGlow)" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6" />

    {/* Shield Base Shape */}
    <path
      d="M50 12 L78 24 V48 C78 68 66 84 50 90 C34 84 22 68 22 48 V24 L50 12 Z"
      fill="url(#pvShieldGrad)"
      stroke="url(#pvLogoGlow)"
      strokeWidth="2.5"
      filter="url(#logoShadow)"
    />

    {/* Inner ZK Lattice Constellation Nodes */}
    <path d="M50 26 L65 38 L50 50 L35 38 Z" stroke="#38bdf8" strokeWidth="1.5" fill="none" opacity="0.8" />
    <path d="M50 50 L65 62 L50 74 L35 62 Z" stroke="#a855f7" strokeWidth="1.5" fill="none" opacity="0.8" />
    <line x1="50" y1="26" x2="50" y2="74" stroke="#6366f1" strokeWidth="2" strokeDasharray="3 2" />

    {/* Core ZK Keyhole Orb */}
    <circle cx="50" cy="50" r="7" fill="url(#pvLogoGlow)" />
    <circle cx="50" cy="50" r="3" fill="#ffffff" />
  </svg>
);
