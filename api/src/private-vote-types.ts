// Copyright (C) Midnight Foundation
// SPDX-License-Identifier: Apache-2.0
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0

import { type MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import { type FoundContract } from '@midnight-ntwrk/midnight-js-contracts';
import type { PrivateVotePrivateState, Contract, Witnesses } from '../../contract/src/private-vote-index.js';

export const privateVotePrivateStateKey = 'privateVotePrivateState';
export type PrivateVotePrivateStateId = typeof privateVotePrivateStateKey;

export type PrivateVotePrivateStates = {
  readonly [privateVotePrivateStateKey]: PrivateVotePrivateState;
};

export type PrivateVoteContract = Contract<PrivateVotePrivateState, Witnesses<PrivateVotePrivateState>>;

export type PrivateVoteCircuitKeys = Exclude<keyof PrivateVoteContract['impureCircuits'], number | symbol>;

export type PrivateVoteProviders = MidnightProviders<
  PrivateVoteCircuitKeys,
  PrivateVotePrivateStateId,
  PrivateVotePrivateState
>;

export type DeployedPrivateVoteContract = FoundContract<PrivateVoteContract>;

export type VoteDerivedState = {
  readonly pollOpen: boolean;
  readonly voteCount: bigint;
  readonly yesCount: bigint | undefined;
  readonly noCount: bigint | undefined;
  readonly hasVoted: boolean;
  readonly isAdmin: boolean;
};
