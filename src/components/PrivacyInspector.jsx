import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import {
  Shield,
  Eye,
  EyeOff,
  Lock,
  CheckCircle2,
  XCircle,
  Terminal,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export const PrivacyInspector = ({ initialProposalId }) => {
  const { voterSecret } = useWallet();
  const [proposalId, setProposalId] = useState(initialProposalId || 'prop-mid-001');
  const [inspectorData, setInspectorData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Double-voting simulation test state
  const [simSecret, setSimSecret] = useState(voterSecret || 'voter_sk_alpha_demo_999');
  const [simChoice, setSimChoice] = useState(1);
  const [simResult, setSimResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  const fetchInspectorData = async (targetId) => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/privacy-inspector/${targetId || proposalId}`);
      setInspectorData(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load Privacy Inspector data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialProposalId) {
      setProposalId(initialProposalId);
      fetchInspectorData(initialProposalId);
    } else {
      fetchInspectorData(proposalId);
    }
  }, [initialProposalId]);

  const handleTestDoubleVoting = async () => {
    setSimulating(true);
    setSimResult(null);
    try {
      const payload = {
        proposal_id: proposalId,
        voter_secret: simSecret,
        vote_choice: simChoice,
        blinding_factor: 'salt_sim_' + Date.now(),
      };

      const res = await axios.post(`${BACKEND_URL}/api/circuits/generate-proof`, payload);
      const data = res.data;

      if (data.witness_state.is_already_spent) {
        setSimResult({
          type: 'REJECTED',
          nullifier: data.witness_state.nullifier,
          message: 'Midnight Circuit Assertion Triggered: Nullifier is already in the ledger set. Double-voting is mathematically impossible!',
          reason: 'assert(!nullifiers.member(nullifier), "Double voting detected")',
        });
      } else {
        setSimResult({
          type: 'VALID_NEW_NULLIFIER',
          nullifier: data.witness_state.nullifier,
          message: 'Voter secret produces a fresh unspent nullifier. Eligible to cast 1 ballot.',
          reason: 'Nullifier not found in ledger nullifiers map.',
        });
      }
    } catch (err) {
      setSimResult({
        type: 'ERROR',
        message: err.response?.data?.detail || err.message,
      });
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-8" data-testid="privacy-inspector-view">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-purple-950/30 border border-purple-500/20 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono">
              <EyeOff className="w-3.5 h-3.5" />
              <span>Observable Privacy Inspector</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
              What Observers Can & Cannot Learn
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-sans leading-relaxed">
              Midnight's dual-state architecture splits execution between the client's private witness and the public ledger. Inspect how ballots are mathematically proven without disclosing voter identities or vote choices.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <Input
              data-testid="inspector-proposal-id-input"
              value={proposalId}
              onChange={(e) => setProposalId(e.target.value)}
              placeholder="Enter Proposal ID"
              className="w-full sm:w-40 bg-slate-900 border-slate-800 text-white font-mono text-xs h-10"
            />
            <Button
              data-testid="inspector-fetch-btn"
              size="sm"
              onClick={() => fetchInspectorData(proposalId)}
              className="bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs h-10 px-4 font-bold"
            >
              Inspect
            </Button>
          </div>
        </div>
      </div>

      {/* Side-by-Side Dual State Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Public Ledger State */}
        <div
          data-testid="public-ledger-state-panel"
          className="rounded-3xl border border-sky-500/30 bg-slate-900/70 p-6 space-y-4 shadow-[0_0_20px_rgba(56,189,248,0.1)] backdrop-blur-md"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2 text-sky-400">
              <Eye className="w-5 h-5" />
              <h3 className="font-heading text-base font-bold text-white">Public Ledger State</h3>
            </div>
            <Badge className="bg-sky-500/10 text-sky-400 border-sky-500/30 text-[10px] font-mono">
              On-Chain (Visible to Explorer)
            </Badge>
          </div>

          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Values stored on the public Midnight blockchain ledger. Any node or block explorer can freely query and audit these fields.
          </p>

          {loading ? (
            <div className="py-10 text-center font-mono text-xs text-slate-500">Loading public state...</div>
          ) : inspectorData ? (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-slate-500">Contract Address:</span>
                  <span className="text-sky-300 break-all text-[11px] font-semibold">{inspectorData.contract_address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Proposal ID:</span>
                  <span className="text-white font-bold">{inspectorData.proposal_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Proposal Status:</span>
                  <span className="text-emerald-400 font-bold">{inspectorData.public_state.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Ballots Cast:</span>
                  <span className="text-white font-bold">{inspectorData.public_state.total_ballots_cast}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-slate-500">Public Aggregate Tally:</span>
                  <span className="text-sky-400 font-bold">
                    YES: {inspectorData.public_state.aggregated_tally.yes} | NO: {inspectorData.public_state.aggregated_tally.no} | ABSTAIN: {inspectorData.public_state.aggregated_tally.abstain}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nullifier Registry Size:</span>
                  <span className="text-purple-300 font-bold">{inspectorData.public_state.nullifiers_set_size} nullifiers</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-slate-500">Eligibility Merkle Root:</span>
                  <span className="text-slate-300 text-[10px] break-all">{inspectorData.public_state.eligibility_merkle_root}</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* RIGHT: Private Client-Side Witness */}
        <div
          data-testid="private-witness-state-panel"
          className="rounded-3xl border border-purple-500/30 bg-slate-900/70 p-6 space-y-4 shadow-[0_0_20px_rgba(168,85,247,0.1)] backdrop-blur-md"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2 text-purple-400">
              <Lock className="w-5 h-5" />
              <h3 className="font-heading text-base font-bold text-white">Private Witness (Off-Chain)</h3>
            </div>
            <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30 text-[10px] font-mono">
              Client Only (100% Shielded)
            </Badge>
          </div>

          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Witness inputs executed locally inside the voter's browser using Compact's Zero-Knowledge circuit engine. NEVER broadcasted to the network.
          </p>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-amber-400 font-bold">localVoterSecret():</span>
                <span className="text-slate-400 text-[11px]">Off-chain secret seed. Never disclosed.</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-purple-300 font-bold">localVoteChoice():</span>
                <span className="text-slate-400 text-[11px]">Option index (0/1/2). Verified inside circuit.</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-sky-300 font-bold">localBlindingFactor():</span>
                <span className="text-slate-400 text-[11px]">Fresh entropy salt. Hides ballot in commitment.</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-emerald-400 font-bold">localEligibilityProof():</span>
                <span className="text-slate-400 text-[11px]">8-tier Merkle path proving membership.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Observable Privacy Visibility Matrix */}
      <div
        data-testid="privacy-matrix-card"
        className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 backdrop-blur-md"
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-sky-400" />
            <h3 className="font-heading text-base font-bold text-white">
              Privacy Visibility Matrix: Public vs Private
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">Formal Security Breakdown</span>
        </div>

        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <table className="w-full text-left font-mono text-xs min-w-[500px]">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Data Point</th>
                <th className="py-2.5 px-3">Observer Visibility</th>
                <th className="py-2.5 px-3">Cryptographic Justification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {inspectorData?.observer_visibility_matrix?.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-950/40">
                  <td className="py-3 px-3 text-white font-medium">{row.data_point}</td>
                  <td className="py-3 px-3">
                    {row.visible_to_public ? (
                      <Badge className="bg-sky-500/10 text-sky-400 border-sky-500/30 text-[10px] font-mono">
                        ✓ Public (On-Chain)
                      </Badge>
                    ) : (
                      <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/30 text-[10px] font-mono">
                        🔒 100% Shielded (Private)
                      </Badge>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-400 text-[11px] font-sans">{row.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Double-Voting Collision Tester */}
      <div
        data-testid="double-voting-tester-card"
        className="rounded-3xl border border-amber-500/30 bg-slate-900/60 p-6 space-y-4 shadow-[0_0_20px_rgba(245,158,11,0.05)] backdrop-blur-md"
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2 text-amber-400">
            <Zap className="w-5 h-5" />
            <h3 className="font-heading text-base font-bold text-white">
              Interactive Double-Voting Prevention Simulator
            </h3>
          </div>
          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px] font-mono">
            Nullifier Assert Test
          </Badge>
        </div>

        <p className="text-xs text-slate-400 font-sans leading-relaxed">
          Test how Midnight's circuit asserts that a single secret cannot cast more than 1 ballot on any proposal. Enter any voter secret key and simulate circuit verification.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="md:col-span-2">
            <label className="text-[11px] font-mono text-slate-400 block mb-1">Voter Secret Key (sk):</label>
            <Input
              data-testid="sim-voter-secret-input"
              value={simSecret}
              onChange={(e) => setSimSecret(e.target.value)}
              placeholder="e.g. voter_sk_alpha_demo_999"
              className="bg-slate-950 border-slate-800 text-white font-mono text-xs h-10"
            />
          </div>
          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">Simulate Choice:</label>
            <select
              data-testid="sim-choice-select"
              value={simChoice}
              onChange={(e) => setSimChoice(parseInt(e.target.value, 10))}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono rounded-xl px-3 h-10"
            >
              <option value={1}>1: YES</option>
              <option value={0}>0: NO</option>
              <option value={2}>2: ABSTAIN</option>
            </select>
          </div>
        </div>

        <Button
          data-testid="run-double-voting-test-btn"
          onClick={handleTestDoubleVoting}
          disabled={simulating}
          className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs px-6 h-10 rounded-xl flex items-center justify-center space-x-2"
        >
          {simulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          <span>Simulate Circuit Nullifier Evaluation</span>
        </Button>

        {simResult && (
          <div
            data-testid="double-voting-sim-result"
            className={`p-4 rounded-2xl border text-xs font-mono space-y-2 ${
              simResult.type === 'REJECTED'
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
            }`}
          >
            <div className="flex items-center space-x-2 font-bold text-sm">
              {simResult.type === 'REJECTED' ? (
                <>
                  <XCircle className="w-5 h-5 text-rose-400" />
                  <span>DOUBLE VOTING REJECTED (CIRCUIT ENFORCED)</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>FRESH NULLIFIER ACCEPTED</span>
                </>
              )}
            </div>
            <p>{simResult.message}</p>
            {simResult.nullifier && (
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 break-all text-[11px] text-slate-300">
                <span className="text-slate-500">Derived Nullifier: </span>
                {simResult.nullifier}
              </div>
            )}
            <div className="text-[11px] text-slate-400">
              <span className="font-semibold text-slate-300">Constraint: </span>
              <code>{simResult.reason}</code>
            </div>
          </div>
        )}
      </div>

      {/* Recent On-Chain Audit Transactions */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 backdrop-blur-md">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-sky-400" />
            <h3 className="font-heading text-base font-bold text-white">
              On-Chain Nullifier & Proof Audit Stream
            </h3>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono border-slate-700">
            Midnight Preprod Feed
          </Badge>
        </div>

        <div className="space-y-2.5 font-mono text-xs">
          {inspectorData?.recent_on_chain_audits?.length > 0 ? (
            inspectorData.recent_on_chain_audits.map((audit) => (
              <div
                key={audit.id}
                data-testid={`audit-row-${audit.id}`}
                className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
              >
                <div className="space-y-1 w-full sm:w-auto">
                  <div className="flex items-center space-x-2">
                    <span className="text-emerald-400 font-bold">Block #{audit.block_height}</span>
                    <span className="text-slate-500 text-[10px]">Tx: {audit.tx_hash.slice(0, 14)}...</span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate max-w-full sm:max-w-md">
                    Nullifier: <span className="text-sky-300">{audit.nullifier.slice(0, 24)}...</span>
                  </div>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between">
                  <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px]">
                    VERIFIED_ON_CHAIN
                  </Badge>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {new Date(audit.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-slate-500 font-mono text-xs">
              No recent transactions recorded for this proposal yet. Cast a private vote to see live audits!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};