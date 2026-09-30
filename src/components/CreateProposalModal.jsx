import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { ShieldAlert } from 'lucide-react';

export const CreateProposalModal = ({ isOpen, onClose }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-lg border border-slate-800 bg-slate-950 p-6 text-slate-100">
      <DialogHeader>
        <div className="mb-2 flex items-center gap-3">
          <ShieldAlert className="h-6 w-6 text-amber-300" />
          <DialogTitle className="text-white">Proposal creation unavailable</DialogTitle>
        </div>
        <DialogDescription className="text-slate-400">No proposal or transaction has been created.</DialogDescription>
      </DialogHeader>
      <p className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm leading-relaxed text-amber-100">
        Proposal creation needs the shared multi-proposal Compact contract to be compiled, deployed, and configured. The checked-in generated contract module is incomplete, so this action is disabled.
      </p>
      <Button onClick={onClose} className="w-full">Close</Button>
    </DialogContent>
  </Dialog>
);
