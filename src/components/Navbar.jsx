import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { LogoSVG } from './art/LogoSVG';
import { Wallet, Copy, Check, Menu, X, User } from 'lucide-react';
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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
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
    { id: 'profile', label: 'My Profile & Keys' },
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header
      data-testid="main-header"
      className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl transition-all"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div
            className="flex items-center space-x-3.5 cursor-pointer group"
            onClick={() => handleTabClick('proposals')}
          >
            <div className="transform transition-transform group-hover:scale-105">
              <LogoSVG className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-heading text-lg sm:text-xl font-black tracking-tight text-white">
                  Private<span className="midnight-gradient-text">Vote</span>
                </span>
                <Badge
                  data-testid="network-status-badge"
                  className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-2 py-0.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block mr-1.5 animate-ping"></span>
                  Preprod
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                Zero-Knowledge Governance on Midnight
              </p>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800/60">
            {navItems.map((item) => (
              <button
                key={item.id}
                data-testid={`nav-tab-${item.id}`}
                onClick={() => handleTabClick(item.id)}
                className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-sky-500/20 via-indigo-500/20 to-purple-500/20 text-sky-300 border border-sky-500/40 shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Desktop Right Controls */}
          <div className="hidden lg:flex items-center space-x-3">
            <button
              data-testid="contract-address-quick-badge"
              onClick={copyContractAddress}
              title="Click to copy Midnight Preprod contract address"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-400 hover:text-sky-300 hover:border-sky-500/40 transition-all shadow-inner"
            >
              <span className="text-slate-500">Contract:</span>
              <span className="text-sky-400 font-semibold">02008f1b...ecb2</span>
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400 ml-1" /> : <Copy className="w-3.5 h-3.5 opacity-60 ml-1" />}
            </button>

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
                  data-testid="nav-profile-tab-btn"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTabClick('profile')}
                  className={`text-xs px-2.5 rounded-xl ${activeTab === 'profile' ? 'text-sky-400 bg-sky-500/10' : 'text-slate-400 hover:text-white'}`}
                >
                  <User className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                data-testid="connect-lace-wallet-btn"
                onClick={() => setIsLaceModalOpen(true)}
                className="bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white font-mono text-xs px-4 py-2 rounded-xl font-bold shadow-[0_0_20px_rgba(56,189,248,0.35)] transition-all flex items-center space-x-2"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Lace</span>
              </Button>
            )}
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <div className="flex items-center space-x-2 lg:hidden">
            {isConnected ? (
              <button
                onClick={() => setIsLaceModalOpen(true)}
                className="p-1.5 rounded-lg bg-slate-900 border border-sky-500/40 text-sky-400 text-xs font-mono"
              >
                <Wallet className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setIsLaceModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-xs font-mono font-bold"
              >
                Connect
              </button>
            )}
            <button
              data-testid="mobile-hamburger-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-sky-400" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Hamburger Menu Drawer */}
      {mobileMenuOpen && (
        <div
          data-testid="mobile-hamburger-drawer"
          className="lg:hidden border-b border-slate-800 bg-slate-950/98 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-3 shadow-2xl transition-all"
        >
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                data-testid={`mobile-drawer-nav-${item.id}`}
                onClick={() => handleTabClick(item.id)}
                className={`w-full text-left px-4 py-3 text-xs font-mono font-bold rounded-xl transition-all flex items-center justify-between ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-sky-500/20 to-purple-500/20 text-sky-300 border border-sky-500/40'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <span>{item.label}</span>
                {activeTab === item.id && <span className="w-2 h-2 rounded-full bg-sky-400"></span>}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-2">
            <button
              onClick={copyContractAddress}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between"
            >
              <span>Contract: 02008f1b...ecb2</span>
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            </button>

            {isConnected ? (
              <Button
                variant="outline"
                onClick={disconnectWallet}
                className="w-full border-rose-500/30 text-rose-400 hover:bg-rose-500/10 font-mono text-xs py-2.5 rounded-xl"
              >
                Disconnect Lace Wallet
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setIsLaceModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-mono text-xs py-2.5 rounded-xl font-bold"
              >
                Connect Lace Wallet
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
