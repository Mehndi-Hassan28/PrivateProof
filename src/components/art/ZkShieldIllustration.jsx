import React from 'react';

export const ZkShieldIllustration = ({ className = "w-full h-auto max-w-lg" }) => (
  <svg
    viewBox="0 0 500 400"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="bgGrad" x1="0" y1="0" x2="500" y2="400" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38bdf8" stopOpacity="0.08" />
        <stop offset="0.5" stopColor="#6366f1" stopOpacity="0.05" />
        <stop offset="1" stopColor="#a855f7" stopOpacity="0.02" />
      </linearGradient>

      <linearGradient id="shieldFill" x1="150" y1="50" x2="350" y2="350" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0f172a" />
        <stop offset="0.5" stopColor="#1e1b4b" />
        <stop offset="1" stopColor="#020617" />
      </linearGradient>

      <linearGradient id="glowStroke" x1="150" y1="50" x2="350" y2="350" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38bdf8" />
        <stop offset="0.5" stopColor="#818cf8" />
        <stop offset="1" stopColor="#c084fc" />
      </linearGradient>

      <linearGradient id="greenGlow" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#34d399" />
        <stop offset="1" stopColor="#059669" />
      </linearGradient>

      <filter id="heroDropGlow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="8" stdDeviation="15" floodColor="#38bdf8" floodOpacity="0.25" />
      </filter>

      <filter id="nodeGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#38bdf8" floodOpacity="0.8" />
      </filter>
    </defs>

    {/* Dynamic Background Mesh Grid */}
    <rect width="500" height="400" rx="24" fill="url(#bgGrad)" stroke="#1e293b" strokeWidth="1" />

    {/* Concentric Orbital Rings */}
    <circle cx="250" cy="200" r="170" stroke="#334155" strokeWidth="1" strokeDasharray="4 6" opacity="0.4" />
    <circle cx="250" cy="200" r="130" stroke="#475569" strokeWidth="1" strokeDasharray="8 8" opacity="0.6" />
    <circle cx="250" cy="200" r="90" stroke="#38bdf8" strokeWidth="1" opacity="0.2" />

    {/* Main ZK Shield Vector */}
    <path
      d="M250 60 L340 100 V200 C340 265 300 315 250 335 C200 315 160 265 160 200 V100 L250 60 Z"
      fill="url(#shieldFill)"
      stroke="url(#glowStroke)"
      strokeWidth="3"
      filter="url(#heroDropGlow)"
    />

    {/* Dual-State Boundary Line (Public Ledger vs Private Witness) */}
    <path d="M250 85 V310" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.7" />

    {/* Client Witness Side (Left - Private) */}
    <g opacity="0.95">
      <rect x="180" y="130" width="55" height="30" rx="6" fill="#0f172a" stroke="#818cf8" strokeWidth="1.5" />
      <text x="207" y="149" fill="#a5b4fc" fontSize="10" fontFamily="monospace" textAnchor="middle">voter_sk</text>
      <circle cx="207" cy="180" r="4" fill="#a855f7" />
      <path d="M207 160 V176" stroke="#a855f7" strokeWidth="1.5" />

      <rect x="180" y="210" width="55" height="30" rx="6" fill="#0f172a" stroke="#c084fc" strokeWidth="1.5" />
      <text x="207" y="229" fill="#e9d5ff" fontSize="10" fontFamily="monospace" textAnchor="middle">choice:1</text>
      <path d="M207 184 V210" stroke="#c084fc" strokeWidth="1.5" />
    </g>

    {/* Public Ledger Side (Right - Verified On-Chain) */}
    <g opacity="0.95">
      <rect x="265" y="130" width="60" height="30" rx="6" fill="#020617" stroke="#38bdf8" strokeWidth="1.5" />
      <text x="295" y="149" fill="#7dd3fc" fontSize="9" fontFamily="monospace" textAnchor="middle">Nullifier</text>

      <rect x="265" y="210" width="60" height="30" rx="6" fill="#020617" stroke="#34d399" strokeWidth="1.5" />
      <text x="295" y="229" fill="#6ee7b7" fontSize="9" fontFamily="monospace" textAnchor="middle">Proof π</text>

      <path d="M295 160 V210" stroke="#38bdf8" strokeWidth="1.5" />
    </g>

    {/* Core ZK SNARK Synthesizer Core */}
    <circle cx="250" cy="195" r="18" fill="#020617" stroke="url(#glowStroke)" strokeWidth="2" filter="url(#nodeGlow)" />
    <path d="M244 195 L248 199 L256 191" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

    {/* Floating Satellite Cryptographic Nodes */}
    {/* Node 1: BN254 */}
    <g transform="translate(80, 110)">
      <rect x="0" y="0" width="70" height="26" rx="13" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
      <text x="35" y="17" fill="#38bdf8" fontSize="10" fontFamily="monospace" textAnchor="middle">BN254</text>
    </g>
    <line x1="150" y1="123" x2="170" y2="135" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" />

    {/* Node 2: 3840 R1CS */}
    <g transform="translate(350, 110)">
      <rect x="0" y="0" width="85" height="26" rx="13" fill="#0f172a" stroke="#818cf8" strokeWidth="1" />
      <text x="42" y="17" fill="#818cf8" fontSize="10" fontFamily="monospace" textAnchor="middle">3840 R1CS</text>
    </g>
    <line x1="330" y1="135" x2="350" y2="123" stroke="#818cf8" strokeWidth="1" strokeDasharray="2 2" />

    {/* Node 3: Midnight Preprod */}
    <g transform="translate(80, 270)">
      <rect x="0" y="0" width="95" height="26" rx="13" fill="#0f172a" stroke="#34d399" strokeWidth="1" />
      <text x="47" y="17" fill="#34d399" fontSize="10" fontFamily="monospace" textAnchor="middle">Compact 0.23</text>
    </g>
    <line x1="165" y1="270" x2="180" y2="240" stroke="#34d399" strokeWidth="1" strokeDasharray="2 2" />

    {/* Node 4: Unspent Nullifier */}
    <g transform="translate(330, 270)">
      <rect x="0" y="0" width="105" height="26" rx="13" fill="#0f172a" stroke="#c084fc" strokeWidth="1" />
      <text x="52" y="17" fill="#c084fc" fontSize="10" fontFamily="monospace" textAnchor="middle">Nullifier Set</text>
    </g>
    <line x1="325" y1="240" x2="340" y2="270" stroke="#c084fc" strokeWidth="1" strokeDasharray="2 2" />
  </svg>
);
