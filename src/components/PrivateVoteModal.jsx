import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Lock } from 'lucide-react';

export const PrivateVoteModal = ({ proposal, isOpen, onClose }) => {
  if (!proposal) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg border border-slate-800 bg-slate-950 p-6 text-slate-100">
        <DialogHeader>
          <div className="mb-2 flex items-center gap-3">
            <Lock className="h-6 w-6 text-sky-400" />
            <DialogTitle className="text-white">Voting unavailable</DialogTitle>
          </div>
          <DialogDescription className="text-slate-400">{proposal.title}</DialogDescription>
        </DialogHeader>
        <p className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm leading-relaxed text-amber-100">
          No vote was generated or submitted. Voting requires compiled Compact circuits, their matching proving artifacts, and a deployed contract address. Those are not available in this checkout.
        </p>
        <Button onClick={onClose} className="w-full">Close</Button>
      </DialogContent>
    </Dialog>
  );
};
