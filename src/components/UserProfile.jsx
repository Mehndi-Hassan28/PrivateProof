import React from 'react';
import { useWallet } from '../context/WalletContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Copy, User, Wallet } from 'lucide-react';
import { toast } from 'sonner';

export const UserProfile = () => {
  const { isConnected, walletAddress, walletName, balanceDust, balanceNight, selectedNetwork, setIsLaceModalOpen, disconnectWallet } = useWallet();

  if (!isConnected) return (
    <div className="mx-auto max-w-xl space-y-5 rounded-3xl border border-slate-800 bg-slate-900/60 p-8 text-center">
      <Wallet className="mx-auto h-12 w-12 text-sky-400" />
      <h2 className="text-2xl font-bold text-white">Wallet not connected</h2>
      <p className="text-sm text-slate-400">Connect Lace or 1AM to view the address and balances reported by your wallet.</p>
      <Button onClick={() => setIsLaceModalOpen(true)}>Connect wallet</Button>
    </div>
  );

  const copyAddress = async () => {
    await navigator.clipboard.writeText(walletAddress);
    toast.success('Wallet address copied');
  };
  const formatBalance = (balance, precision) => balance == null ? 'Unavailable' : `${balance.toFixed(precision)}`;

  return (
    <section className="mx-auto max-w-3xl space-y-6" data-testid="user-profile-view">
      <header className="rounded-3xl border border-sky-500/30 bg-gradient-to-br from-slate-950 to-indigo-950/50 p-6 sm:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-sky-500/10 p-4 text-sky-300"><User className="h-7 w-7" /></div>
            <div>
              <h1 className="text-2xl font-black text-white">Connected wallet</h1>
              <p className="text-sm text-slate-400">{walletName} · {selectedNetwork}</p>
            </div>
          </div>
          <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300">Connected</Badge>
        </div>
        <div className="mt-6 border-t border-slate-800 pt-5">
          <div className="mb-2 text-xs uppercase tracking-wide text-slate-400">Midnight address</div>
          <div className="flex items-center gap-3 break-all font-mono text-sm text-sky-300">
            <span>{walletAddress}</span>
            <button onClick={copyAddress} aria-label="Copy wallet address" className="shrink-0 text-slate-400 hover:text-white"><Copy className="h-4 w-4" /></button>
          </div>
        </div>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="text-xs uppercase text-slate-400">DUST balance</div>
          <div className="mt-2 text-xl font-bold text-white">{formatBalance(balanceDust, 4)} DUST</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="text-xs uppercase text-slate-400">NIGHT balance</div>
          <div className="mt-2 text-xl font-bold text-white">{formatBalance(balanceNight, 4)} NIGHT</div>
        </div>
      </div>
      <p className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-100">Voter secrets and signing keys stay under wallet control. The app does not generate, display, or store replacement wallet secrets.</p>
      <Button variant="outline" onClick={disconnectWallet} className="border-rose-500/30 text-rose-300">Disconnect wallet</Button>
    </section>
  );
};
