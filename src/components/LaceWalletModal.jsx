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
    walletName,
    balanceDust,
    balanceNight,
    selectedNetwork,
    isLaceModalOpen,
    setIsLaceModalOpen,
    connectWallet,
    walletChoices,
    disconnectWallet,
  } = useWallet();

  const [copiedAddr, setCopiedAddr] = useState(false);

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'addr') {
      setCopiedAddr(true);
      setTimeout(() => setCopiedAddr(false), 2000);
      toast.success('Address copied to clipboard');
    }
  };


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
                Midnight Wallet
                <Badge className="bg-sky-500/10 text-sky-400 border-sky-500/30 text-[10px] font-mono">Preprod</Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 font-mono">
                Choose an installed Midnight wallet.
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
                  <span className="font-semibold text-white">Wallet connection:</span> Uses the wallet's Midnight DApp Connector. This app does not fabricate wallet identities or secrets.
                </div>
              </div>
            </div>

            <p className="text-xs font-mono text-slate-400">Network: {selectedNetwork} (wallet connection requests Preprod)</p>

            <div className="grid grid-cols-2 gap-3">
              {['Lace', '1AM'].map((name) => {
                const wallet = walletChoices.find((item) => item.name.toLowerCase().includes(name.toLowerCase()) || item.id.toLowerCase().includes(name.toLowerCase()));
                return <Button key={name} data-testid={`connect-${name.toLowerCase()}-wallet-btn`} disabled={!wallet} onClick={() => wallet && connectWallet(wallet.id)} className="bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-mono font-bold rounded-xl">{wallet ? `Connect ${name}` : `${name} not detected`}</Button>;
              })}
            </div>
            {!walletChoices.length && <p className="text-xs text-amber-300">No compatible Midnight DApp Connector v4 detected. Install or update Lace or 1AM, then reload.</p>}
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
                    {balanceDust == null ? 'Unavailable' : balanceDust.toFixed(2)} <span className="text-xs text-sky-400 font-mono">tDUST</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">tNIGHT Balance</div>
                  <div data-testid="wallet-balance-night" className="text-lg font-heading font-bold text-white">
                    {balanceNight == null ? 'Unavailable' : balanceNight.toFixed(1)} <span className="text-xs text-purple-400 font-mono">tNIGHT</span>
                  </div>
                </div>
              </div>

            </div>

            <div className="flex items-center space-x-3 pt-2">
              <Button
                data-testid="modal-disconnect-btn"
                variant="outline"
                onClick={disconnectWallet}
                className="flex-1 border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 text-xs font-mono"
              >
                Disconnect {walletName || 'Wallet'}
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
