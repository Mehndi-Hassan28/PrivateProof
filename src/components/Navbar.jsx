import React from 'react';
import { useWallet } from '../context/WalletContext';
import { LogoSVG } from './art/LogoSVG';
import { Wallet, Copy, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

export const Navbar = ({ activeTab, setActiveTab }) => {
  const {
    isConnected,
    walletAddress,
    setIsLaceModalOpen,
    disconnectWallet,
  } = useWallet();

  const [copied, setCopied] = React.useState(false);
  const CONTRACT_ADDRESS = "02008f1b635293da2768e1c64dfc6dfad1712a32c66c3c54d7f573dc086e33ecb2";

  const copyContractAddress = () => {
    navigator.clipboard.writeText(CONTRACT_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Contract address copied to clipboard!");
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
      className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl transition-all"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div
            className="flex items-center space-x-3.5 cursor-pointer group"
            onClick={() => setActiveTab('proposals')}
          >
            <div className="transform transition-transform group-hover:scale-105">
              <LogoSVG className="w-9 h-9 sm:w-10 sm:h-10" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <span className="font-heading text-lg sm:text-xl font-black tracking-tight text-white">
                  Private<span className="midnight-gradient-text">Vote</span>
                </span>
                <Badge
                  data-testid="network-status-badge"
                  className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-2 py-0.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block mr-1.5 animate-ping"></span>
                  Preprod Active
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                Zero-Knowledge Governance on Midnight Network
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800/60">
            {navItems.map((item) => (
              <button
                key={item.id}
                data-testid={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`px-3.5 py-1.5 text-xs font-mono font-medium rounded-lg transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-sky-500/20 via-indigo-500/20 to-purple-500/20 text-sky-300 border border-sky-500/40 shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
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
              className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 stroke-slate-700 border border-slate-800 text-[11px] font-mono text-slate-400 hover:text-sky-300 hover:border-sky-500/40 transition-all shadow-inner"
            >
              <span className="text-slate-500">Contract:</span>
              <span className="text-sky-400 font-semibold">02008f1b...ecb2</span>
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400 ml-1" /> : <Copy className="w-3.5 h-3.5 opacity-60 ml-1" />}
            </button>

            {/* Lace Wallet Button */}
            {isConnected ? (
              <div className="flex items-center space-x-2">
                <Button
                  data-testid="wallet-profile-button"
                  onClick={() => setIsLaceModalOpen(true)}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-sky-500/40 text-xs font-mono px-3.5 py-1.5 flex items-center space-x-2 rounded-xl shadow-[0_0_15px_rgba(56,189,248,0.15)]"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span>{walletAddress.slice(0, 10)}...{walletAddress.slice(-4)}</span>
                </Button>
                <Button
                  data-testid="disconnect-wallet-header-btn"
                  variant="ghost"
                  size="sm"
                  onClick={disconnectWallet}
                  className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs px-2.5 rounded-lg"
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                data-testid="connect-lace-wallet-btn"
                onClick={() => setIsLaceModalOpen(true)}
                className="bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white font-mono text-xs px-4 py-2 rounded-xl font-bold shadow-[0_0_20px_rgba(56,189,248,0.35)] transition-all flex items-center space-x-2 transform hover:-translate-y-0.5"
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
              className={`whitespace-nowrap px-3 py-1.5 text-xs font-mono rounded-lg transition-all ${
                activeTab === item.id
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
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
