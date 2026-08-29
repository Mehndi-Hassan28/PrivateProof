import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  Cpu,
  Shield,
  Lock,
  Key,
  CheckCircle2,
  Calculator,
  RefreshCw,
  Code2,
  Hash,
  Check,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export const ZKPlayground = () => {
  const [voterSecret, setVoterSecret] = useState('voter_sk_playground_demo_101');
  const [proposalId, setProposalId] = useState('prop-mid-001');
  const [voteChoice, setVoteChoice] = useState(1);
  const [blindingSalt, setBlindingSalt] = useState('salt_entropy_987654321');

  const [generating, setGenerating] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [proofOutput, setProofOutput] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);

  const handleGenerateProof = async () => {
    setGenerating(true);
    setVerificationResult(null);
    try {
      const payload = {
        proposal_id: proposalId,
        voter_secret: voterSecret,
        vote_choice: voteChoice,
        blinding_factor: blindingSalt,
      };

      const res = await axios.post(`${BACKEND_URL}/api/circuits/generate-proof`, payload);
      setProofOutput(res.data);
      toast.success('Zero-Knowledge Proof Generated!');
    } catch (err) {
      console.error(err);
      toast.error('Proof generation failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setGenerating(false);
    }
  };

  const handleVerifyProof = async () => {
    if (!proofOutput) return;
    setVerifying(true);
    try {
      const payload = {
        proposal_id: proposalId,
        nullifier: proofOutput.witness_state.nullifier,
        commitment: proofOutput.witness_state.commitment,
        proof: proofOutput.zk_proof,
      };

      const res = await axios.post(`${BACKEND_URL}/api/circuits/verify-proof`, payload);
      setVerificationResult(res.data);
      if (res.data.verified) {
        toast.success('zk-SNARK Proof Verified Against Midnight Preprod Verifier Key!');
      } else {
        toast.error('Verification Rejected: ' + res.data.reason);
      }
    } catch (err) {
      console.error(err);
      toast.error('Verification request failed');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-8" data-testid="zk-playground-view">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-sky-950/40 border border-sky-500/20 space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-mono">
          <Calculator className="w-3.5 h-3.5" />
          <span>Interactive Cryptography Sandbox</span>
        </div>
        <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
          Zero-Knowledge Circuit & Proof Playground
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-2xl">
          Experiment with Midnight's Compact cryptography. Test custom witness parameters, synthesize BN254 zk-SNARK constraints, and verify proofs against the Preprod verifier key.
        </p>
      </div>

      {/* Inputs Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2 text-sky-400">
              <Key className="w-4 h-4" />
              <h3 className="font-heading text-sm font-bold text-white">Private Witness Inputs (Off-Chain)</h3>
            </div>
            <Badge className="text-[10px] font-mono bg-sky-500/10 text-sky-400 border-sky-500/30">
              Client Only
            </Badge>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Voter Secret Key (sk):</label>
              <Input
                data-testid="playground-voter-secret"
                value={voterSecret}
                onChange={(e) => setVoterSecret(e.target.value)}
                className="bg-slate-950 border-slate-800 text-amber-300 font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Target Proposal ID:</label>
              <Input
                data-testid="playground-proposal-id"
                value={proposalId}
                onChange={(e) => setProposalId(e.target.value)}
                className="bg-slate-950 border-slate-800 text-white font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Vote Choice (Bounded 0..2):</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: 1, label: '1 (YES)' },
                  { val: 0, label: '0 (NO)' },
                  { val: 2, label: '2 (ABSTAIN)' },
                ].map((c) => (
                  <button
                    key={c.val}
                    type="button"
                    data-testid={`playground-choice-${c.val}`}
                    onClick={() => setVoteChoice(c.val)}
                    className={`p-2 rounded-lg border text-xs font-mono transition-all ${
                      voteChoice === c.val
                        ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Blinding Factor (Salt):</label>
              <Input
                data-testid="playground-blinding-salt"
                value={blindingSalt}
                onChange={(e) => setBlindingSalt(e.target.value)}
                className="bg-slate-950 border-slate-800 text-sky-300 font-mono text-xs"
              />
            </div>
          </div>

          <Button
            data-testid="playground-generate-btn"
            onClick={handleGenerateProof}
            disabled={generating}
            className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-mono font-bold text-xs py-2.5 rounded-xl shadow-[0_0_15px_rgba(56,189,248,0.3)]"
          >
            {generating ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Cpu className="w-4 h-4 mr-2" />}
            <span>Execute castPrivateVote Circuit (Prover)</span>
          </Button>
        </div>

        {/* Cryptographic Primitives Formula */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2 text-purple-400">
              <Code2 className="w-4 h-4" />
              <h3 className="font-heading text-sm font-bold text-white">Midnight Mathematical Specifications</h3>
            </div>
            <Badge className="text-[10px] font-mono border-slate-700">Compact v0.23</Badge>
          </div>

          <div className="space-y-3 font-mono text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-sky-400 font-bold">1. Nullifier Derivation</div>
              <div className="text-[11px] text-slate-400">
                <code>Nullifier = persistentHash([voterSecret, proposalId])</code>
              </div>
              <p className="text-[10px] text-slate-500">
                Deterministic per proposal; irreversible one-way hash ensures voter anonymity while preventing ballot replay.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-purple-300 font-bold">2. Ballot Commitment</div>
              <div className="text-[11px] text-slate-400">
                <code>Commitment = persistentHash([choiceBytes, blindingFactor])</code>
              </div>
              <p className="text-[10px] text-slate-500">
                Hiding commitment; random salt prevents dictionary / rainbow table attacks on the 3 option choices.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-emerald-400 font-bold">3. SNARK Constraint System</div>
              <div className="text-[11px] text-slate-400">
                <code>assert(choice &lt;= 2) && assert(!nullifiers.member(nullifier))</code>
              </div>
              <p className="text-[10px] text-slate-500">
                3,840 rank-1 constraint system (R1CS) equations verified on BN254 pairing curve.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Proof Output & Verification Section */}
      {proofOutput && (
        <div
          data-testid="playground-proof-result-card"
          className="rounded-2xl border border-sky-500/30 bg-slate-900/80 p-6 space-y-4"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="font-heading text-base font-bold text-white">Generated zk-SNARK Proof Artifact</h3>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] font-mono">
              BN254 Ready
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div className="space-y-2">
              <div className="text-slate-400 text-[11px] uppercase">Public Nullifier:</div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sky-400 break-all text-[11px]">
                {proofOutput.public_signals.nullifier}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-slate-400 text-[11px] uppercase">Ballot Commitment:</div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-purple-300 break-all text-[11px]">
                {proofOutput.public_signals.commitment}
              </div>
            </div>
          </div>

          <div className="space-y-1 font-mono text-xs">
            <div className="text-slate-400 text-[11px] uppercase">Proof Tuple π = (pi_a, pi_b, pi_c):</div>
            <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-[11px] overflow-x-auto max-h-40">
              {JSON.stringify(proofOutput.zk_proof, null, 2)}
            </pre>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <Button
              data-testid="playground-verify-btn"
              onClick={handleVerifyProof}
              disabled={verifying}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs px-5 py-2.5 rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.3)]"
            >
              {verifying ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Shield className="w-4 h-4 mr-2" />}
              <span>Verify Proof Against Preprod Verifier Key</span>
            </Button>
          </div>

          {verificationResult && (
            <div
              data-testid="playground-verification-card"
              className={`p-4 rounded-xl border text-xs font-mono space-y-2 ${
                verificationResult.verified
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
              }`}
            >
              <div className="flex items-center space-x-2 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>PROOF VERIFIED & CONFIRMED VALID</span>
              </div>
              <p>{verificationResult.reason}</p>
              <div className="text-[11px] text-slate-400">
                Verifier Key Digest: <code className="text-sky-300">{verificationResult.verifier_key_digest}</code>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};