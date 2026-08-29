import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Wallet, ShieldCheck, Key, Copy, Check, RefreshCw, Radio, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export const LaceWalletModal = () => {
  const {
    isConnected,
    walletAddress,
    voterSecret,
    balanceDust,
    balanceNight,
    selectedNetwork,
    switchNetwork,
    isLaceModalOpen,
    setIsLaceModalOpen,
    connectWallet,
    disconnectWallet,
    regenerateSecret,
  } = useWallet();

  const [copiedAddr, setCopiedAddr] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [customKey, setCustomKey] = useState('');

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'addr') {
      setCopiedAddr(true);
      setTimeout(() => setCopiedAddr(false), 2000);
      toast.success('Address copied to clipboard');
    } else {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
      toast.success('Voter Secret Key copied (Keep confidential!)');
    }
  };

  const networks = [
    { name: 'Midnight Preprod', tag: 'Preprod-0.23', active: true },
    { name: 'Midnight Preview', tag: 'Preview-0.22', active: false },
    { name: 'Local Compact DevNet', tag: 'Localhost:8001', active: false },
  ];

  return (
    <Dialog open={isLaceModalOpen} onOpenChange={setIsLaceModalOpen}>
      <DialogContent
        data-testid="lace-wallet-modal-content"
        className="bg-slate-950 border border-slate-800 text-slate-100 max-w-lg sm:rounded-2xl p-6"
      >
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="font-heading text-lg font-bold text-white flex items-center gap-2">
                Lace Wallet on Midnight
                <Badge className="bg-sky-500/10 text-sky-400 border-sky-500/30 text-[10px] font-mono">
                  ZK Enabled
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 font-mono">
                Midnight cryptographic identity and shielded governance session
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {!isConnected ? (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300">
                  <span className="font-semibold text-white">Privacy Guarantee:</span> Lace utilizes Midnight's dual-state engine. Your wallet signs transactions and generates client-side zk-SNARK witness proofs locally. Your secret keys never leave your device.
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400">Select Midnight Target Network:</label>
              <div className="grid grid-cols-1 gap-2">
                {networks.map((net) => (
                  <button
                    key={net.name}
                    data-testid={`select-network-${net.name.replace(/\s+/g, '-').toLowerCase()}`}
                    onClick={() => switchNetwork(net.name)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs font-mono transition-all ${
                      selectedNetwork === net.name
                        ? 'bg-sky-500/10 border-sky-500/50 text-white'
                        : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${selectedNetwork === net.name ? 'bg-sky-400 animate-pulse' : 'bg-slate-600'}`}></span>
                      <span className="font-medium">{net.name}</span>
                    </div>
                    <Badge variant="outline" className="border-slate-700 text-[10px]">{net.tag}</Badge>
                  </button>
                ))}
              </div>
            </div>

            <Button
              data-testid="modal-connect-wallet-btn"
              onClick={() => connectWallet()}
              className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-mono font-bold py-2.5 rounded-xl text-sm shadow-[0_0_15px_rgba(56,189,248,0.3)]"
            >
              Connect Lace Wallet (Preprod)
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Account Info */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div>
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                  Midnight Public Address
                </div>
                <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-xs text-sky-300 break-all">
                  <span data-testid="display-wallet-address">{walletAddress}</span>
                  <button
                    data-testid="copy-wallet-address-btn"
                    onClick={() => handleCopy(walletAddress, 'addr')}
                    className="ml-2 p-1 text-slate-400 hover:text-white"
                  >
                    {copiedAddr ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Token Balances */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">tDUST Balance</div>
                  <div data-testid="wallet-balance-dust" className="text-lg font-heading font-bold text-white">
                    {balanceDust.toFixed(2)} <span className="text-xs text-sky-400 font-mono">tDUST</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">tNIGHT Balance</div>
                  <div data-testid="wallet-balance-night" className="text-lg font-heading font-bold text-white">
                    {balanceNight.toFixed(1)} <span className="text-xs text-purple-400 font-mono">tNIGHT</span>
                  </div>
                </div>
              </div>

              {/* Local Zero-Knowledge Witness Secret */}
              <div className="border-t border-slate-800/80 pt-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-[11px] font-mono text-amber-400 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5" />
                    <span>Local Voter Secret (Client Witness)</span>
                  </div>
                  <button
                    data-testid="regenerate-voter-secret-btn"
                    onClick={regenerateSecret}
                    className="text-[10px] font-mono text-slate-400 hover:text-sky-300 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Rotate Secret
                  </button>
                </div>
                <div className="flex items-center justify-between bg-slate-950 p-2 rounded-lg border border-amber-500/20 font-mono text-xs text-amber-200/80 break-all">
                  <span data-testid="display-voter-secret">{voterSecret}</span>
                  <button
                    data-testid="copy-voter-secret-btn"
                    onClick={() => handleCopy(voterSecret, 'secret')}
                    className="ml-2 p-1 text-slate-400 hover:text-amber-300"
                  >
                    {copiedSecret ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] font-mono text-slate-500 mt-1">
                  🔒 Used to generate unlinkable nullifiers <code className="text-sky-400">H(sk || proposalId)</code> in local circuits.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <Button
                data-testid="modal-disconnect-btn"
                variant="outline"
                onClick={disconnectWallet}
                className="flex-1 border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 text-xs font-mono"
              >
                Disconnect Lace
              </Button>
              <Button
                data-testid="modal-done-btn"
                onClick={() => setIsLaceModalOpen(false)}
                className="flex-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono font-bold text-xs"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};