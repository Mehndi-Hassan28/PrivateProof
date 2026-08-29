import { Contract, WitnessContext, LedgerState } from '@midnight-ntwrk/compact-runtime';

export interface PrivateVoteWitnesses {
  localVoterSecret: (context: WitnessContext<PrivateVoteLedger>) => [PrivateVoteWitnesses, Uint8Array];
  localVoteChoice: (context: WitnessContext<PrivateVoteLedger>) => [PrivateVoteWitnesses, number];
  localBlindingFactor: (context: WitnessContext<PrivateVoteLedger>) => [PrivateVoteWitnesses, Uint8Array];
  localEligibilityProof: (context: WitnessContext<PrivateVoteLedger>) => [PrivateVoteWitnesses, Uint8Array[]];
}

export interface PrivateVoteLedger {
  proposalId: Uint8Array;
  titleHash: Uint8Array;
  status: number;
  adminPubKey: Uint8Array;
  votingDeadline: bigint;
  totalBallotsCast: number;
  tallyYes: number;
  tallyNo: number;
  tallyAbstain: number;
  nullifiers: Map<string, boolean>;
  eligibilityMerkleRoot: Uint8Array;
  voteCommitments: Map<string, Uint8Array>;
}

export interface PrivateVoteContract extends Contract<PrivateVoteWitnesses, PrivateVoteLedger> {
  circuits: {
    initializeProposal: (proposalId: Uint8Array, titleHash: Uint8Array, admin: Uint8Array, deadline: bigint, merkleRoot: Uint8Array) => Promise<void>;
    castPrivateVote: (proposalId: Uint8Array, currentTimestamp: bigint) => Promise<{ nullifier: Uint8Array; commitment: Uint8Array }>;
    closeProposal: (adminSignature: Uint8Array) => Promise<void>;
  };
}

export declare const contract: PrivateVoteContract;
export default contract;