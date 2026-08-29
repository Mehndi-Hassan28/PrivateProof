import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { PrivateVoteModal } from './PrivateVoteModal';
import { CreateProposalModal } from './CreateProposalModal';
import { ZkShieldIllustration } from './art/ZkShieldIllustration';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import {
  Shield,
  Vote,
  Plus,
  Search,
  Lock,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export const ProposalsList = ({ onSelectProposal, onOpenInspector }) => {
  const { isConnected, setIsLaceModalOpen } = useWallet();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [activeVotingProposal, setActiveVotingProposal] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/proposals`);
      setProposals(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Could not load proposals from Midnight API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const categories = ['All', 'Governance', 'Treasury', 'Protocol Upgrade', 'Community'];
  const statuses = ['All', 'OPEN', 'CLOSED'];

  const filteredProposals = proposals.filter((p) => {
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchStat = selectedStatus === 'All' || p.status === selectedStatus;
    const matchSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchStat && matchSearch;
  });

  const handleOpenVote = (proposal) => {
    if (!isConnected) {
      toast.info('Please connect Lace Wallet to participate in private voting.');
      setIsLaceModalOpen(true);
      return;
    }
    setActiveVotingProposal(proposal);
  };

  return (
    <div className="space-y-10">
      {/* Hero Banner with SVG Art & Key Metrics */}
      <div className="relative overflow-hidden rounded-3xl border border-sky-500/30 bg-gradient-to-br from-slate-950 via-slate-900/90 to-indigo-950/60 p-6 sm:p-10 shadow-[0_0_50px_rgba(56,189,248,0.12)]">
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-sky-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Headline & Call To Action */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-mono shadow-[0_0_15px_rgba(56,189,248,0.2)]">
              <Shield className="w-3.5 h-3.5 text-sky-400" />
              <span>Midnight Dual-State Privacy Governance</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Vote Freely. <br className="hidden sm:block" />
              <span className="midnight-gradient-text">Keep It Confidential.</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-sans max-w-xl">
              PrivateVote leverages Midnight Network's Zero-Knowledge circuits. Submit verifiable ballots to community proposals while your personal vote choice and voter secret remain strictly off-chain.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button
                data-testid="hero-create-proposal-btn"
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white font-mono font-bold text-xs px-6 py-3 rounded-xl flex items-center space-x-2 shadow-[0_0_25px_rgba(56,189,248,0.4)] transform hover:-translate-y-0.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Proposal</span>
              </Button>
              <Button
                data-testid="hero-inspect-privacy-btn"
                variant="outline"
                onClick={() => onOpenInspector(proposals[0]?.id || 'prop-mid-001')}
                className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-mono text-xs px-5 py-3 rounded-xl flex items-center space-x-2 transition-all"
              >
                <Eye className="w-4 h-4 text-sky-400" />
                <span>Inspect Privacy Model</span>
              </Button>
            </div>
          </div>

          {/* Right Column: High Quality SVG Vector Artwork */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <ZkShieldIllustration className="w-full max-w-sm sm:max-w-md transform hover:scale-102 transition-transform duration-300 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" />
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10 pt-6 border-t border-slate-800/80">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 backdrop-blur-md hover:border-sky-500/30 transition-colors">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Active Proposals</div>
            <div data-testid="stat-active-proposals" className="text-2xl font-heading font-black text-white mt-1">
              {proposals.filter((p) => p.status === 'OPEN').length}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 backdrop-blur-md hover:border-sky-500/30 transition-colors">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Shielded Ballots</div>
            <div data-testid="stat-total-ballots" className="text-2xl font-heading font-black text-sky-400 mt-1">
              {proposals.reduce((sum, p) => sum + (p.total_ballots_cast || 0), 0)}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 backdrop-blur-md hover:border-sky-500/30 transition-colors">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Circuit Constraints</div>
            <div className="text-2xl font-heading font-black text-purple-400 mt-1">3,840 R1CS</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 backdrop-blur-md hover:border-sky-500/30 transition-colors">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Deployed Preprod</div>
            <div className="text-xs font-mono text-emerald-400 font-bold mt-2 truncate">
              02008f1b...ecb2
            </div>
          </div>
        </div>
      </div>

      {/* Controls: Search, Category & Status Filters */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              data-testid="search-proposals-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search proposals by title or topic..."
              className="pl-10 bg-slate-900/90 border-slate-800 text-white placeholder:text-slate-500 font-sans text-xs sm:text-sm rounded-xl focus:border-sky-500 h-10 shadow-inner"
            />
          </div>

          {/* Status Filters & Refresh */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
            {statuses.map((s) => (
              <button
                key={s}
                data-testid={`filter-status-${s.toLowerCase()}`}
                onClick={() => setSelectedStatus(s)}
                className={`px-3.5 py-2 text-xs font-mono rounded-xl transition-all ${
                  selectedStatus === s
                    ? 'bg-slate-800 text-white border border-slate-700 shadow'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-900'
                }`}
              >
                {s === 'All' ? 'All Status' : s}
              </button>
            ))}
            <Button
              data-testid="refresh-proposals-btn"
              variant="ghost"
              size="sm"
              onClick={fetchProposals}
              className="text-slate-400 hover:text-sky-400 text-xs px-3 h-9 rounded-xl"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              data-testid={`filter-category-${cat.replace(/\s+/g, '-').toLowerCase()}`}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 text-xs font-mono rounded-full border transition-all ${
                selectedCategory === cat
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-[0_0_15px_rgba(56,189,248,0.2)] font-bold'
                  : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Proposals Grid */}
      {loading ? (
        <div className="py-24 text-center space-y-3 font-mono text-xs text-slate-400">
          <div className="w-10 h-10 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p>Querying Midnight Preprod ledger & nullifier sets...</p>
        </div>
      ) : filteredProposals.length === 0 ? (
        <div
          data-testid="no-proposals-found"
          className="py-16 text-center space-y-3 rounded-3xl border border-slate-800/80 bg-slate-950/40 p-8"
        >
          <Vote className="w-10 h-10 text-slate-600 mx-auto" />
          <div className="font-heading text-base font-bold text-slate-300">No Proposals Found</div>
          <p className="text-xs text-slate-500 font-mono max-w-sm mx-auto">
            Try resetting your search or filter parameters, or create a new community proposal.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProposals.map((prop) => {
            const total = prop.total_ballots_cast || 0;
            const yesPct = total > 0 ? Math.round((prop.tally_yes / total) * 100) : 0;
            const noPct = total > 0 ? Math.round((prop.tally_no / total) * 100) : 0;
            const abstainPct = total > 0 ? Math.round((prop.tally_abstain / total) * 100) : 0;
            const isOpen = prop.status === 'OPEN';

            return (
              <div
                key={prop.id}
                data-testid={`proposal-card-${prop.id}`}
                className="rounded-3xl border border-slate-800/80 bg-slate-900/60 hover:bg-slate-900/90 transition-all p-6 flex flex-col justify-between space-y-5 hover:border-sky-500/40 hover:shadow-[0_0_30px_rgba(56,189,248,0.12)] group"
              >
                <div className="space-y-4">
                  {/* Header: Category & Status */}
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className="bg-sky-500/10 text-sky-400 border-sky-500/30 text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5"
                    >
                      {prop.category}
                    </Badge>
                    <Badge
                      data-testid={`proposal-status-${prop.id}`}
                      className={`text-[10px] font-mono px-2.5 py-0.5 ${
                        isOpen
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {isOpen ? '● Active Voting' : 'Closed'}
                    </Badge>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-heading text-lg font-extrabold text-white line-clamp-2 group-hover:text-sky-300 transition-colors">
                      {prop.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-sans line-clamp-3 mt-2 leading-relaxed">
                      {prop.description}
                    </p>
                  </div>

                  {/* Live Verifiable Tally Bar */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400">Verifiable Tally</span>
                      <span className="text-white font-bold">
                        {total} {total === 1 ? 'ballot' : 'ballots'} cast
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden flex p-0.5 border border-slate-800">
                      <div
                        style={{ width: `${yesPct}%` }}
                        className="bg-emerald-400 rounded-full transition-all duration-500"
                        title={`Yes: ${prop.tally_yes} (${yesPct}%)`}
                      ></div>
                      <div
                        style={{ width: `${noPct}%` }}
                        className="bg-rose-500 rounded-full transition-all duration-500"
                        title={`No: ${prop.tally_no} (${noPct}%)`}
                      ></div>
                      <div
                        style={{ width: `${abstainPct}%` }}
                        className="bg-slate-600 rounded-full transition-all duration-500"
                        title={`Abstain: ${prop.tally_abstain} (${abstainPct}%)`}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
                      <span className="text-emerald-400 font-semibold">Yes: {prop.tally_yes} ({yesPct}%)</span>
                      <span className="text-rose-400 font-semibold">No: {prop.tally_no} ({noPct}%)</span>
                      <span className="text-slate-400">Abstain: {prop.tally_abstain}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span className="truncate max-w-[120px]">ID: {prop.id}</span>
                    <span>Nullifiers: {prop.nullifiers_count}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <Button
                      data-testid={`inspect-privacy-btn-${prop.id}`}
                      variant="outline"
                      size="sm"
                      onClick={() => onOpenInspector(prop.id)}
                      className="border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-mono flex items-center justify-center gap-1.5 rounded-xl h-9"
                    >
                      <Eye className="w-3.5 h-3.5 text-sky-400" />
                      <span>Inspector</span>
                    </Button>

                    <Button
                      data-testid={`vote-now-btn-${prop.id}`}
                      size="sm"
                      disabled={!isOpen}
                      onClick={() => handleOpenVote(prop)}
                      className={`text-xs font-mono font-bold flex items-center justify-center gap-1.5 rounded-xl h-9 ${
                        isOpen
                          ? 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>{isOpen ? 'Vote (ZK)' : 'Closed'}</span>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Private Vote Modal Wizard */}
      <PrivateVoteModal
        proposal={activeVotingProposal}
        isOpen={!!activeVotingProposal}
        onClose={() => setActiveVotingProposal(null)}
        onVoteSuccess={() => {
          fetchProposals();
        }}
      />

      {/* Create Proposal Modal */}
      <CreateProposalModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={() => {
          fetchProposals();
        }}
      />
    </div>
  );
};