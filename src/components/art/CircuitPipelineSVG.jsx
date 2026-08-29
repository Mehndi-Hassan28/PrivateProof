import React from 'react';

export const CircuitPipelineSVG = ({ className = "w-full h-auto max-w-2xl" }) => (
  <svg
    viewBox="0 0 700 240"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="pipeGrad" x1="0" y1="0" x2="700" y2="0" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38bdf8" />
        <stop offset="0.5" stopColor="#818cf8" />
        <stop offset="1" stopColor="#34d399" />
      </linearGradient>

      <filter id="boxGlow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#38bdf8" floodOpacity="0.2" />
      </filter>
    </defs>

    {/* Background Grid Box */}
    <rect width="700" height="240" rx="16" fill="#020617" stroke="#1e293b" strokeWidth="1" />

    {/* Connection Flow Pipeline Arrows */}
    <path d="M165 120 L210 120" stroke="url(#pipeGrad)" strokeWidth="2.5" strokeDasharray="4 4" />
    <polygon points="215,120 205,115 205,125" fill="#818cf8" />

    <path d="M365 120 L410 120" stroke="url(#pipeGrad)" strokeWidth="2.5" strokeDasharray="4 4" />
    <polygon points="415,120 405,115 405,125" fill="#818cf8" />

    <path d="M565 120 L610 120" stroke="url(#pipeGrad)" strokeWidth="2.5" strokeDasharray="4 4" />
    <polygon points="615,120 605,115 605,125" fill="#34d399" />

    {/* STAGE 1: Private Witness Inputs */}
    <g transform="translate(25, 45)" filter="url(#boxGlow)">
      <rect width="140" height="150" rx="12" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
      <rect x="0" y="0" width="140" height="32" rx="12" fill="#1e293b" />
      <text x="70" y="21" fill="#38bdf8" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">1. Private Witness</text>
      
      <text x="15" y="55" fill="#94a3b8" fontSize="9" fontFamily="monospace">localVoterSecret</text>
      <text x="15" y="70" fill="#f59e0b" fontSize="9" fontFamily="monospace">sk_voter_***</text>

      <text x="15" y="95" fill="#94a3b8" fontSize="9" fontFamily="monospace">localVoteChoice</text>
      <text x="15" y="110" fill="#a855f7" fontSize="9" fontFamily="monospace">1 (YES)</text>

      <text x="15" y="135" fill="#94a3b8" fontSize="9" fontFamily="monospace">blindingFactor</text>
      <text x="15" y="150" fill="#38bdf8" fontSize="9" fontFamily="monospace">salt_entropy</text>
    </g>

    {/* STAGE 2: Compact Circuit Engine */}
    <g transform="translate(225, 45)" filter="url(#boxGlow)">
      <rect width="140" height="150" rx="12" fill="#0f172a" stroke="#818cf8" strokeWidth="1.5" />
      <rect x="0" y="0" width="140" height="32" rx="12" fill="#1e293b" />
      <text x="70" y="21" fill="#818cf8" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">2. Compact R1CS</text>

      <text x="15" y="55" fill="#cbd5e1" fontSize="10" fontFamily="monospace">castPrivateVote()</text>

      <rect x="12" y="68" width="116" height="36" rx="6" fill="#020617" stroke="#334155" />
      <text x="70" y="85" fill="#c084fc" fontSize="9" fontFamily="monospace" textAnchor="middle">3,840 Constraints</text>
      <text x="70" y="97" fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">Curve: BN254</text>

      <text x="15" y="125" fill="#94a3b8" fontSize="8" fontFamily="monospace">Nullifier Check:</text>
      <text x="15" y="138" fill="#34d399" fontSize="8" fontFamily="monospace">assert(!spent)</text>
    </g>

    {/* STAGE 3: zk-SNARK Prover Key */}
    <g transform="translate(425, 45)" filter="url(#boxGlow)">
      <rect width="140" height="150" rx="12" fill="#0f172a" stroke="#c084fc" strokeWidth="1.5" />
      <rect x="0" y="0" width="140" height="32" rx="12" fill="#1e293b" />
      <text x="70" y="21" fill="#c084fc" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">3. Prover Proof</text>

      <text x="15" y="55" fill="#94a3b8" fontSize="9" fontFamily="monospace">Public Signals:</text>
      <text x="15" y="70" fill="#38bdf8" fontSize="8" fontFamily="monospace">Nullifier: 0x7c9f...</text>
      <text x="15" y="83" fill="#a855f7" fontSize="8" fontFamily="monospace">Commitment: 0x48f9...</text>

      <text x="15" y="110" fill="#94a3b8" fontSize="9" fontFamily="monospace">Proof Tuple π:</text>
      <text x="15" y="125" fill="#e2e8f0" fontSize="8" fontFamily="monospace">pi_a, pi_b, pi_c</text>
      <text x="15" y="138" fill="#64748b" fontSize="8" fontFamily="monospace">BN254 curve ready</text>
    </g>

    {/* STAGE 4: Midnight On-Chain Verifier */}
    <g transform="translate(620, 75)" filter="url(#boxGlow)">
      <circle cx="30" cy="45" r="30" fill="#020617" stroke="#34d399" strokeWidth="2" />
      <path d="M20 45 L27 52 L42 37" stroke="#34d399" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
      <text x="30" y="90" fill="#34d399" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">VERIFIED</text>
      <text x="30" y="103" fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">Preprod</text>
    </g>
  </svg>
);
