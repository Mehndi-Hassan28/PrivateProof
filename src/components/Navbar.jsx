import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { LogoSVG } from './art/LogoSVG';
import {
  Wallet,
  Copy,
  Check,
  Menu,
  X,
  User,
  Vote,
  Eye,
  Cpu,
  Server,
  ShieldCheck,
} from 'lucide-react';
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
    { id: 'proposals', label: 'Proposals', icon: Vote },
    { id: 'inspector', label: 'Privacy', icon: Eye },
    { id: 'playground', label: 'ZK Sandbox', icon: Cpu },
    { id: 'contract', label: 'Node & Contract', icon: Server },
    { id: 'tests', label: 'Test Suite', icon: ShieldCheck },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header
      data-testid="main-header"
      className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-3xl transition-all"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo & Name */}
          <div
            className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer group flex-shrink-0"
            onClick={() => handleTabClick('proposals')}
          >
            <div className="transform transition-transform duration-200 group-hover:scale-105">
              <LogoSVG className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-heading text-lg sm:text-2xl font-black tracking-tight text-white">
                  Private<span className="midnight-gradient-text">Vote</span>
                </span>
                <Badge
                  data-testid="network-status-badge"
                  className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block mr-1 animate-ping"></span>
                  Preprod
                </Badge>
              </div>
              <p className="text-[10px] text-slate-400 font-mono hidden xl:block">
                Zero-Knowledge Governance on Midnight Network
              </p>
            </div>
          </div>

          {/* Desktop Navigation Bar (Full for XL Screens >= 1280px) */}
          <nav className="hidden xl:flex items-center space-x-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  data-testid={`nav-tab-${item.id}`}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-sky-500/20 via-indigo-500/20 to-purple-500/20 text-sky-300 border border-sky-500/40 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Medium Screen Compact Navigation Bar (1024px - 1279px) */}
          <nav className="hidden lg:flex xl:hidden items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  data-testid={`nav-tab-compact-${item.id}`}
                  onClick={() => handleTabClick(item.id)}
                  title={item.label}
                  className={`flex items-center space-x-1 px-2 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                    isActive
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span className="text-[11px]">{item.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls (Desktop) */}
          <div className="hidden lg:flex items-center space-x-3 flex-shrink-0">
            <button
              data-testid="contract-address-quick-badge"
              onClick={copyContractAddress}
              title="Click to copy Midnight Preprod contract address"
              className="flex items-center space-x-1.5 px-3 py-2 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-400 hover:text-sky-300 hover:border-sky-500/40 transition-all shadow-sm"
            >
              <span className="text-slate-500">Contract:</span>
              <span className="text-sky-400 font-bold">02008f1b...</span>
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 opacity-60" />}
            </button>

            {isConnected ? (
              <div className="flex items-center space-x-2">
                <Button
                  data-testid="wallet-profile-button"
                  onClick={() => setIsLaceModalOpen(true)}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-sky-500/40 text-xs font-mono px-3.5 py-2 flex items-center space-x-2 rounded-2xl shadow-[0_0_15px_rgba(56,189,248,0.15)] font-bold"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span>{walletAddress.slice(0, 8)}...{walletAddress.slice(-4)}</span>
                </Button>
                <Button
                  data-testid="nav-profile-tab-btn"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTabClick('profile')}
                  className={`text-xs px-3 py-2 rounded-2xl border transition-all ${
                    activeTab === 'profile'
                      ? 'text-sky-300 bg-sky-500/20 border-sky-500/40'
                      : 'text-slate-400 border-slate-800 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <User className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                data-testid="connect-lace-wallet-btn"
                onClick={() => setIsLaceModalOpen(true)}
                className="bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white font-mono text-xs px-4 py-2.5 rounded-2xl font-bold shadow-[0_0_20px_rgba(56,189,248,0.35)] transition-all flex items-center space-x-2 transform hover:-translate-y-0.5"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Lace</span>
              </Button>
            )}
          </div>

          {/* Mobile Right Controls (< 1024px) */}
          <div className="flex items-center space-x-2 lg:hidden">
            {isConnected ? (
              <button
                onClick={() => setIsLaceModalOpen(true)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-sky-500/40 text-sky-400 text-xs font-mono font-bold flex items-center gap-1.5"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <span>{walletAddress.slice(0, 6)}...</span>
              </button>
            ) : (
              <button
                onClick={() => setIsLaceModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-xs font-mono font-bold shadow-md"
              >
                Connect
              </button>
            )}
            <button
              data-testid="mobile-hamburger-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 hover:text-white hover:border-slate-700 focus:outline-none shadow-md"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-sky-400" /> : <Menu className="w-5 h-5 text-slate-200" />}
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Sub-Bar for Quick 1-Tap Switching */}
        <div className="flex lg:hidden overflow-x-auto py-2 border-t border-slate-800/80 gap-1.5 scrollbar-none bg-slate-950">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                data-testid={`mobile-subnav-${item.id}`}
                onClick={() => handleTabClick(item.id)}
                className={`whitespace-nowrap px-3 py-1.5 text-xs font-mono rounded-xl border transition-all flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 font-bold shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                    : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Dark Obsidian Drawer Menu */}
      {mobileMenuOpen && (
        <div
          data-testid="mobile-hamburger-drawer"
          className="lg:hidden fixed inset-x-0 top-[65px] border-b border-slate-800 bg-slate-950/98 backdrop-blur-3xl px-4 pt-4 pb-8 space-y-4 shadow-2xl transition-all z-50 max-h-[85vh] overflow-y-auto"
        >
          <div className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  data-testid={`mobile-drawer-nav-${item.id}`}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full text-left px-4 py-3.5 text-xs font-mono font-bold rounded-2xl transition-all flex items-center justify-between ${
                    isActive
                      ? 'bg-slate-900/90 text-sky-300 border border-sky-500/40 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                      : 'bg-slate-950/80 text-slate-300 hover:bg-slate-900 border border-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  {isActive && <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse"></span>}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-3">
            <button
              onClick={copyContractAddress}
              className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between"
            >
              <span>Contract: 02008f1b...ecb2</span>
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-500" />}
            </button>

            {isConnected ? (
              <Button
                variant="outline"
                onClick={disconnectWallet}
                className="w-full border-rose-500/30 text-rose-400 hover:bg-rose-500/10 font-mono text-xs py-3 rounded-2xl font-bold"
              >
                Disconnect Lace Wallet
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setIsLaceModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-mono text-xs py-3.5 rounded-2xl font-bold shadow-[0_0_20px_rgba(56,189,248,0.3)]"
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
