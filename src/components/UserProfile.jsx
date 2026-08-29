import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  User,
  Wallet,
  Key,
  ShieldCheck,
  Copy,
  Check,
  RefreshCw,
  Clock,
  CheckCircle2,
  ExternalLink,
  Award,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';

export const UserProfile = ({ onNavigateToProposals }) => {
  const {
    isConnected,
    walletAddress,
    voterSecret,
    balanceDust,
    balanceNight,
    selectedNetwork,
    setIsLaceModalOpen,
    regenerateSecret,
    disconnectWallet,
  } = useWallet();

  const [copiedAddr, setCopiedAddr] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'addr') {
      setCopiedAddr(true);
      setTimeout(() => setCopiedAddr(false), 2000);
      toast.success('Wallet address copied to clipboard');
    } else {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
      toast.success('Voter Secret Key copied (Keep confidential!)');
    }
  };

  if (!isConnected) {
    return (
      <div className="py-16 text-center space-y-5 rounded-3xl border border-slate-800 bg-slate-900/60 p-8 max-w-xl mx-auto backdrop-blur-md">
        <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center mx-auto text-sky-400">
          <Wallet className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="font-heading text-2xl font-black text-white">Wallet Not Connected</h2>
          <p className="text-xs text-slate-400 font-sans max-w-md mx-auto leading-relaxed">
            Connect your Lace Wallet to access your private voter profile, view your shielded voting history, manage secret witness keys, and view token balances.
          </p>
        </div>
        <Button
          data-testid="profile-connect-wallet-btn"
          onClick={() => setIsLaceModalOpen(true)}
          className="bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white font-mono text-xs px-6 py-3 rounded-xl font-bold shadow-[0_0_20px_rgba(56,189,248,0.3)]"
        >
          Connect Lace Wallet
        </Button>
      </div>
    );
  }

  // Get local votes from localStorage audits
  const auditsData = localStorage.getItem('serverless_vote_audits');
  const userAudits = auditsData ? JSON.parse(auditsData) : [];

  return (
    <div className="space-y-8" data-testid="user-profile-view">
      {/* Profile Header Card */}
      <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/50 border border-sky-500/30 space-y-6 shadow-[0_0_40px_rgba(56,189,248,0.12)]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(56,189,248,0.3)] flex-shrink-0">
              <User className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-heading text-2xl sm:text-3xl font-black text-white">Voter Profile</h1>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] font-mono">
                  ● Verified Voter
                </Badge>
              </div>
              <p className="text-xs font-mono text-slate-400">
                Connected Network: <span className="text-sky-300 font-semibold">{selectedNetwork}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <Button
              data-testid="profile-manage-wallet-btn"
              onClick={() => setIsLaceModalOpen(true)}
              className="flex-1 md:flex-none bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-mono text-xs px-4 h-10 rounded-xl"
            >
              Manage Wallet
            </Button>
            <Button
              data-testid="profile-disconnect-btn"
              variant="outline"
              onClick={disconnectWallet}
              className="flex-1 md:flex-none border-rose-500/30 text-rose-400 hover:bg-rose-500/10 font-mono text-xs px-4 h-10 rounded-xl"
            >
              Disconnect
            </Button>
          </div>
        </div>

        {/* Address & Balances Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Lace Address</div>
            <div className="flex items-center justify-between text-xs font-mono text-sky-300">
              <span className="truncate">{walletAddress}</span>
              <button
                onClick={() => handleCopy(walletAddress, 'addr')}
                className="ml-2 p-1 rounded hover:bg-slate-900 text-slate-400 hover:text-white"
              >
                {copiedAddr ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="text-[10px] font-mono text-slate-400 uppercase">tDUST Balance</div>
            <div className="text-lg font-heading font-black text-white">{balanceDust} tDUST</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="text-[10px] font-mono text-slate-400 uppercase">NIGHT Balance</div>
            <div className="text-lg font-heading font-black text-purple-400">{balanceNight} NIGHT</div>
          </div>
        </div>
      </div>

      {/* Secret Witness Key Management */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-5 backdrop-blur-md">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2 text-amber-400">
            <Key className="w-5 h-5" />
            <h3 className="font-heading text-base sm:text-lg font-bold text-white">
              Private Witness Key Manager
            </h3>
          </div>
          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px] font-mono">
            Client-Side Witness
          </Badge>
        </div>

        <p className="text-xs text-slate-300 font-sans leading-relaxed">
          Your voter secret key ($sk$) is used to compute nullifiers and ballot commitments locally inside the browser. It never leaves your machine. Rotating your key generates fresh entropy for future ballots.
        </p>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
          <div className="text-slate-400 text-[11px] uppercase">Active Voter Secret Key (sk):</div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 break-all text-xs">
            <span>{voterSecret}</span>
            <button
              onClick={() => handleCopy(voterSecret, 'secret')}
              className="ml-2 p-1.5 rounded-lg bg-slate-950 text-slate-400 hover:text-white flex-shrink-0"
            >
              {copiedSecret ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <Button
            data-testid="profile-rotate-secret-btn"
            onClick={regenerateSecret}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-mono font-bold text-xs px-5 h-10 rounded-xl flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Rotate Voter Secret Key</span>
          </Button>
          <span className="text-[11px] font-mono text-slate-500 text-center sm:text-right">
            Rotation only impacts future ballot generation
          </span>
        </div>
      </div>

      {/* Shielded Voting History */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-5 backdrop-blur-md">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2 text-sky-400">
            <Lock className="w-5 h-5" />
            <h3 className="font-heading text-base sm:text-lg font-bold text-white">
              Shielded Ballot History & Audit Trail
            </h3>
          </div>
          <Badge className="bg-sky-500/10 text-sky-400 border-sky-500/30 text-[10px] font-mono">
            {userAudits.length} Ballots Submitted
          </Badge>
        </div>

        {userAudits.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Clock className="w-10 h-10 text-slate-600 mx-auto" />
            <div className="font-heading text-sm text-slate-300">No Ballots Cast Yet</div>
            <p className="text-xs text-slate-500 font-mono max-w-sm mx-auto">
              Cast a private ballot on any active governance proposal to generate on-chain nullifiers and view your audit trail.
            </p>
            <Button
              onClick={onNavigateToProposals}
              className="bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs px-4 h-9 rounded-xl mt-2"
            >
              Browse Proposals
            </Button>
          </div>
        ) : (
          <div className="space-y-3 font-mono text-xs">
            {userAudits.map((audit) => (
              <div
                key={audit.id}
                className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800/80 space-y-2"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sky-400 font-bold">Proposal: {audit.proposal_id}</span>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">
                      Block #{audit.block_height}
                    </Badge>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {new Date(audit.timestamp).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-slate-500">Public Nullifier: </span>
                    <span className="text-slate-300 break-all">{audit.nullifier.slice(0, 22)}...</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Vote Commitment: </span>
                    <span className="text-purple-300 break-all">{audit.commitment.slice(0, 22)}...</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 pt-1 flex items-center justify-between">
                  <span>Tx Hash: <code className="text-slate-400">{audit.tx_hash.slice(0, 18)}...</code></span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verifiable On-Chain
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
