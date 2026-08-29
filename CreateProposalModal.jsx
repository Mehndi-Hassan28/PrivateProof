import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useWallet } from '../context/WalletContext';
import { FileText, PlusCircle, CheckCircle2, Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export const CreateProposalModal = ({ isOpen, onClose, onCreated }) => {
  const { isConnected, walletAddress, setIsLaceModalOpen } = useWallet();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Governance');
  const [durationHours, setDurationHours] = useState('72');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isConnected) {
      toast.error('Connect Lace Wallet first to sign and deploy proposal.');
      setIsLaceModalOpen(true);
      return;
    }

    if (!title.trim() || title.length < 5) {
      toast.error('Proposal title must be at least 5 characters.');
      return;
    }

    if (!description.trim() || description.length < 10) {
      toast.error('Proposal description must be at least 10 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        options: ['No', 'Yes', 'Abstain'],
        creator_address: walletAddress,
        duration_hours: parseInt(durationHours, 10) || 72,
      };

      const response = await axios.post(`${BACKEND_URL}/api/proposals`, payload);
      toast.success('Proposal Registered on Midnight Preprod!', {
        description: `Circuit initializeProposal() executed. ID: ${response.data.id}`,
      });
      setTitle('');
      setDescription('');
      setCategory('Governance');
      onCreated(response.data);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create proposal', {
        description: err.response?.data?.detail || err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        data-testid="create-proposal-modal-content"
        className="bg-slate-950 border border-slate-800 text-slate-100 max-w-xl sm:rounded-2xl p-6"
      >
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="font-heading text-lg font-bold text-white">
                Create Governance Proposal
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 font-mono">
                Deploy a zero-knowledge private voting proposal to Midnight Preprod contract
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <label className="text-xs font-mono text-slate-300 mb-1.5 block">Proposal Title *</label>
            <Input
              data-testid="proposal-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., MIP-04: Confidential Treasury Staking Allocation"
              className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-600 font-sans text-sm focus:border-sky-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-slate-300 mb-1.5 block">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger data-testid="proposal-category-select" className="bg-slate-900 border-slate-800 text-slate-200 text-xs font-mono">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                  <SelectItem data-testid="category-opt-governance" value="Governance">Governance</SelectItem>
                  <SelectItem data-testid="category-opt-treasury" value="Treasury">Treasury</SelectItem>
                  <SelectItem data-testid="category-opt-protocol" value="Protocol Upgrade">Protocol Upgrade</SelectItem>
                  <SelectItem data-testid="category-opt-community" value="Community">Community</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-mono text-slate-300 mb-1.5 block">Duration (Hours)</label>
              <Input
                data-testid="proposal-duration-input"
                type="number"
                min="1"
                max="720"
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
                className="bg-slate-900 border-slate-800 text-white font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-slate-300 mb-1.5 block">Proposal Description & Motivation *</label>
            <Textarea
              data-testid="proposal-description-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Explain the background, benefits, and implementation details of this community initiative..."
              className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-600 font-sans text-sm resize-none focus:border-sky-500"
              required
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-400 space-y-1">
            <div className="flex items-center gap-2 text-sky-400 font-medium">
              <Shield className="w-4 h-4" />
              <span>Contract Initialization Circuit:</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Calls <code className="text-sky-300">initializeProposal(proposalId, titleHash, admin, deadline, merkleRoot)</code> on Midnight Preprod.
            </p>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <Button
              data-testid="cancel-create-proposal-btn"
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-slate-800 text-slate-400 hover:bg-slate-900 text-xs font-mono"
            >
              Cancel
            </Button>
            <Button
              data-testid="submit-create-proposal-btn"
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(56,189,248,0.3)]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Deploying on Preprod...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Publish Proposal</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};