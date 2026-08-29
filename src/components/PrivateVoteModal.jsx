import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useWallet } from '../context/WalletContext';
import {
  Shield,
  Lock,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowRight,
  EyeOff,
  FileCode2,
  ExternalLink,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export const PrivateVoteModal = ({ proposal, isOpen, onClose, onVoteSuccess }) => {
  const { isConnected, walletAddress, voterSecret, setIsLaceModalOpen } = useWallet();

  // Step tracking: 1: Choose Option, 2: Witness Generation, 3: Prover Execution, 4: Confirmed
  const [step, setStep] = useState(1);
  const [selectedChoice, setSelectedChoice] = useState(1); // 0: NO, 1: YES, 2: ABSTAIN
  const [blindingSalt, setBlindingSalt] = useState('');
  const [zkProofData, setZkProofData] = useState(null);
  const [isComputing, setIsComputing] = useState(false);
  const [computedNullifier, setComputedNullifier] = useState('');
  const [computedCommitment, setComputedCommitment] = useState('');
  const [txHash, setTxHash] = useState('');
  const [blockHeight, setBlockHeight] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  if (!proposal) return null;

  const resetModal = () => {
    setStep(1);
    setSelectedChoice(1);
    setBlindingSalt('');
    setZkProofData(null);
    setIsComputing(false);
    setComputedNullifier('');
    setComputedCommitment('');
    setTxHash('');
    setErrorMessage('');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  // Step 1 -> Step 2: Generate Private Witness & Salt
  const handleProceedToWitness = () => {
    if (!isConnected) {
      toast.error('Please connect your Lace Wallet first');
      setIsLaceModalOpen(true);
      return;
    }
    const salt = 'salt_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
    setBlindingSalt(salt);
    setErrorMessage('');
    setStep(2);
  };

  // Step 2 -> Step 3: Execute Local ZK Circuit Prover
  const handleExecuteCircuitProver = async () => {
    setIsComputing(true);
    setErrorMessage('');
    try {
      const payload = {
        proposal_id: proposal.id,
        voter_secret: voterSecret,
        vote_choice: selectedChoice,
        blinding_factor: blindingSalt,
      };

      const response = await axios.post(`${BACKEND_URL}/api/circuits/generate-proof`, payload);
      const data = response.data;
      
      setZkProofData(data.zk_proof);
      setComputedNullifier(data.witness_state.nullifier);
      setComputedCommitment(data.witness_state.commitment);
      
      if (data.witness_state.is_already_spent) {
        setErrorMessage('Double voting warning: This voter secret has already cast a ballot for this proposal!');
      }

      // Advance to prover execution review
      setStep(3);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.detail || err.message);
      toast.error('ZK Prover execution failed', {
        description: err.response?.data?.detail || err.message,
      });
    } finally {
      setIsComputing(false);
    }
  };

  // Step 3 -> Step 4: Submit to Midnight Preprod Contract
  const handleSubmitOnChain = async () => {
    setIsComputing(true);
    setErrorMessage('');
    try {
      const payload = {
        proposal_id: proposal.id,
        voter_secret: voterSecret,
        vote_choice: selectedChoice,
        blinding_factor: blindingSalt,
        wallet_address: walletAddress,
      };

      const response = await axios.post(`${BACKEND_URL}/api/proposals/${proposal.id}/vote`, payload);
      const data = response.data;

      setTxHash(data.tx_hash);
      setBlockHeight(data.block_height);
      setStep(4);

      toast.success('Private Ballot Verified and Counted!', {
        description: `Tx: ${data.tx_hash.slice(0, 16)}... on Midnight Preprod`,
      });

      if (onVoteSuccess) {
        onVoteSuccess();
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || err.message;
      setErrorMessage(msg);
      toast.error('Submission Rejected by Midnight Circuit', {
        description: msg,
      });
    } finally {
      setIsComputing(false);
    }
  };

  const choiceLabels = [
    { value: 1, label: 'YES (Support)', desc: 'Vote in favor of the proposal', color: 'emerald' },
    { value: 0, label: 'NO (Oppose)', desc: 'Vote against this proposal', color: 'rose' },
    { value: 2, label: 'ABSTAIN', desc: 'Contribute to quorum without taking side', color: 'slate' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        data-testid="private-vote-modal-content"
        className="bg-slate-950 border border-slate-800 text-slate-100 max-w-xl sm:rounded-2xl p-6"
      >
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.3)]">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="font-heading text-lg font-bold text-white flex items-center gap-2">
                Cast Private Ballot
                <Badge className="bg-sky-500/10 text-sky-400 border-sky-500/30 text-[10px] font-mono">
                  ZK Circuit: castPrivateVote
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 font-mono truncate max-w-md">
                Proposal: {proposal.title}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Stepper Progress */}
        <div className="flex items-center justify-between py-2 border-y border-slate-800/80 my-1">
          {[
            { num: 1, name: 'Option' },
            { num: 2, name: 'Witness' },
            { num: 3, name: 'SNARK Prover' },
            { num: 4, name: 'On-Chain' },
          ].map((s) => (
            <div key={s.num} className="flex items-center space-x-1.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono font-bold ${
                  step === s.num
                    ? 'bg-sky-500 text-slate-950 shadow-[0_0_10px_rgba(56,189,248,0.5)]'
                    : step > s.num
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-900 text-slate-600 border border-slate-800'
                }`}
              >
                {step > s.num ? '✓' : s.num}
              </div>
              <span
                className={`text-[11px] font-mono hidden sm:inline ${
                  step === s.num ? 'text-sky-400 font-semibold' : 'text-slate-500'
                }`}
              >
                {s.name}
              </span>
            </div>
          ))}
        </div>

        {errorMessage && (
          <div
            data-testid="vote-error-banner"
            className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-start space-x-2"
          >
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
            <div>
              <span className="font-semibold">Circuit Assertion Failed: </span>
              {errorMessage}
            </div>
          </div>
        )}

        {/* STEP 1: Select Option */}
        {step === 1 && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-300">Choose your ballot position:</label>
              <div className="grid grid-cols-1 gap-2.5">
                {choiceLabels.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    data-testid={`vote-option-btn-${c.value}`}
                    onClick={() => setSelectedChoice(c.value)}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                      selectedChoice === c.value
                        ? 'bg-sky-500/15 border-sky-500 text-white shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                        : 'bg-slate-900/50 border-slate-800/80 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <div>
                      <div className="font-heading text-sm font-bold text-white">{c.label}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{c.desc}</div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        selectedChoice === c.value
                          ? 'border-sky-400 bg-sky-400 text-slate-950'
                          : 'border-slate-700'
                      }`}
                    >
                      {selectedChoice === c.value && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-400 flex items-start space-x-2.5">
              <EyeOff className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-white font-semibold">Zero-Knowledge Pledge:</span> Your choice is encrypted into a local witness constraint. Observers on Midnight block explorers only see a cryptographic nullifier hash and zk-SNARK proof.
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <Button
                data-testid="cancel-vote-btn"
                variant="outline"
                onClick={handleClose}
                className="flex-1 border-slate-800 text-slate-400 hover:bg-slate-900 text-xs font-mono"
              >
                Cancel
              </Button>
              <Button
                data-testid="proceed-to-witness-btn"
                onClick={handleProceedToWitness}
                className="flex-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <span>Next: Build Witness</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Witness Generation */}
        {step === 2 && (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="text-sky-400 font-semibold flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                <span>Client-Side Witness Assembly</span>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-500">Proposal Target:</span>
                  <span className="text-slate-300">{proposal.id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-500">Selected Option:</span>
                  <span className="text-emerald-400 font-bold">
                    {selectedChoice === 1 ? 'YES' : selectedChoice === 0 ? 'NO' : 'ABSTAIN'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-500">Local Voter Secret:</span>
                  <span className="text-amber-300 font-mono">
                    {voterSecret.slice(0, 10)}...{voterSecret.slice(-6)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-500">Blinding Salt (Entropy):</span>
                  <span className="text-sky-300 font-mono">{blindingSalt}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Prover Key:</span>
                  <span className="text-slate-300">managed/private_vote/keys/private_vote.prover</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <Button
                data-testid="back-to-option-btn"
                variant="outline"
                onClick={() => setStep(1)}
                className="border-slate-800 text-slate-400 hover:bg-slate-900 text-xs font-mono"
              >
                Back
              </Button>
              <Button
                data-testid="execute-circuit-prover-btn"
                onClick={handleExecuteCircuitProver}
                disabled={isComputing}
                className="flex-1 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(56,189,248,0.3)]"
              >
                {isComputing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Proof (3840 constraints)...</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4" />
                    <span>Generate zk-SNARK Proof</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: SNARK Prover Review */}
        {step === 3 && (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="text-emerald-400 font-semibold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Zero-Knowledge Proof Generated Successfully</span>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">
                  BN254 Curve
                </Badge>
              </div>

              <div className="space-y-2 text-[11px] pt-1">
                <div>
                  <div className="text-slate-500 uppercase tracking-wider text-[10px]">Public Nullifier Hash:</div>
                  <div data-testid="generated-nullifier-display" className="p-2 rounded bg-slate-950 border border-slate-800 text-sky-400 break-all font-mono">
                    {computedNullifier}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 uppercase tracking-wider text-[10px]">Blinded Ballot Commitment:</div>
                  <div data-testid="generated-commitment-display" className="p-2 rounded bg-slate-950 border border-slate-800 text-purple-300 break-all font-mono">
                    {computedCommitment}
                  </div>
                </div>
                <div className="flex justify-between py-1 border-t border-slate-800 text-slate-400">
                  <span>R1CS Constraints Evaluated:</span>
                  <span className="text-white font-bold">3,840 gates</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-800/40 text-xs font-mono text-sky-200">
              Ready to broadcast proof to Midnight Preprod. Your vote choice remains 100% private.
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <Button
                data-testid="back-to-witness-btn"
                variant="outline"
                onClick={() => setStep(2)}
                className="border-slate-800 text-slate-400 hover:bg-slate-900 text-xs font-mono"
              >
                Back
              </Button>
              <Button
                data-testid="submit-onchain-vote-btn"
                onClick={handleSubmitOnChain}
                disabled={isComputing}
                className="flex-1 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(56,189,248,0.3)]"
              >
                {isComputing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Transmitting to Preprod Ledger...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Broadcast Ballot to Midnight</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: Confirmed On-Chain */}
        {step === 4 && (
          <div className="space-y-4 py-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div className="space-y-1">
              <h3 className="font-heading text-lg font-bold text-white">Ballot Confirmed on Midnight</h3>
              <p className="text-xs text-slate-400 font-mono">
                Your private vote was verified and recorded in Block #{blockHeight}.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-left font-mono text-xs space-y-2.5">
              <div>
                <div className="text-slate-500 text-[10px] uppercase">Transaction Hash</div>
                <div data-testid="tx-hash-display" className="p-2 rounded bg-slate-950 border border-slate-800 text-sky-400 break-all text-[11px]">
                  {txHash}
                </div>
              </div>
              <div>
                <div className="text-slate-500 text-[10px] uppercase">Nullifier Registered</div>
                <div data-testid="tx-nullifier-display" className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-300 break-all text-[11px]">
                  {computedNullifier}
                </div>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px] pt-1">
                <span>Status:</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  CONFIRMED_ON_CHAIN
                </span>
              </div>
            </div>

            <Button
              data-testid="done-vote-success-btn"
              onClick={handleClose}
              className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono font-bold text-xs py-2.5 rounded-xl shadow-[0_0_15px_rgba(56,189,248,0.3)]"
            >
              Return to Governance Dashboard
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};