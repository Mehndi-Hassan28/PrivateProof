import React from 'react';
import { useWallet } from '../context/WalletContext';
import { Shield, Wallet, CheckCircle2, ChevronDown, Key, Globe, Terminal, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export const Navbar = ({ activeTab, setActiveTab }) => {
  const {
    isConnected,
    walletAddress,
    selectedNetwork,
    switchNetwork,
    setIsLaceModalOpen,
    disconnectWallet,
  } = useWallet();

  const CONTRACT_ADDRESS = "02008f1b635293da2768e1c64dfc6dfad1712a32c66c3c54d7f573dc086e33ecb2";

  const copyContractAddress = () => {
    navigator.clipboard.writeText(CONTRACT_ADDRESS);
    alert("Contract address copied: " + CONTRACT_ADDRESS);
  };

  const navItems = [
    { id: 'proposals', label: 'Proposals & Governance' },
    { id: 'inspector', label: 'Privacy Inspector' },
    { id: 'playground', label: 'ZK Playground' },
    { id: 'contract', label: 'Preprod Contract & Node' },
    { id: 'tests', label: 'Test Suite & CI/CD' },
  ];

  return (
    <header
      data-testid="main-header"
      className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('proposals')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.4)]">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-heading text-lg sm:text-xl font-extrabold tracking-tight text-white">
                  Private<span className="text-sky-400">Vote</span>
                </span>
                <Badge
                  data-testid="network-status-badge"
                  className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-2 py-0.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block mr-1.5 animate-pulse"></span>
                  Preprod Active
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                Zero-Knowledge Governance on Midnight Network
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                data-testid={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-all ${
                  activeTab === item.id
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-[0_0_12px_rgba(56,189,248,0.2)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Network & Lace Wallet Controls */}
          <div className="flex items-center space-x-3">
            {/* Contract Address Quick Badge */}
            <button
              data-testid="contract-address-quick-badge"
              onClick={copyContractAddress}
              title="Click to copy Midnight Preprod contract address"
              className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400 hover:text-sky-300 hover:border-slate-700 transition-colors"
            >
              <span className="text-slate-500">Contract:</span>
              <span>02008f1b...ecb2</span>
            </button>

            {/* Lace Wallet Button */}
            {isConnected ? (
              <div className="flex items-center space-x-2">
                <Button
                  data-testid="wallet-profile-button"
                  onClick={() => setIsLaceModalOpen(true)}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-sky-500/40 text-xs font-mono px-3 py-1.5 flex items-center space-x-2"
                >
                  <div className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></div>
                  <span>{walletAddress.slice(0, 10)}...{walletAddress.slice(-4)}</span>
                </Button>
                <Button
                  data-testid="disconnect-wallet-header-btn"
                  variant="ghost"
                  size="sm"
                  onClick={disconnectWallet}
                  className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs px-2"
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                data-testid="connect-lace-wallet-btn"
                onClick={() => setIsLaceModalOpen(true)}
                className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-mono text-xs px-4 py-2 rounded-lg font-semibold shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all flex items-center space-x-2"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Lace</span>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex lg:hidden overflow-x-auto py-2 border-t border-slate-800/60 gap-1.5 scrollbar-none">
          {navItems.map((item) => (
            <button
              key={item.id}
              data-testid={`mobile-nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`whitespace-nowrap px-2.5 py-1 text-xs font-mono rounded-md ${
                activeTab === item.id
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                  : 'text-slate-400 hover:bg-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};