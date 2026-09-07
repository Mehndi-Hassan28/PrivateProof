// Copyright (C) Midnight Foundation
// SPDX-License-Identifier: Apache-2.0
// Licensed under the Apache License, Version 2.0 (the "License");
// You may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0

import { WitnessContext } from "@midnight-ntwrk/midnight-js-protocol/compact-runtime";
// Note: The managed output directory ./managed/private-vote/ does NOT exist yet.
// You must run compact compile first: compact compile src/private-vote.compact ./src/managed/private-vote
import { Ledger } from "./managed/private-vote/contract/index.js";

export type PrivateVotePrivateState = {
  secretKey: Uint8Array;
  isAdmin: boolean;
};

export function createPrivateVotePrivateState(
  secretKey: Uint8Array,
  isAdmin?: boolean,
): PrivateVotePrivateState {
  return {
    secretKey,
    isAdmin: isAdmin ?? false,
  };
}

export const witnesses = {
  localSecretKey: (
    context: WitnessContext<Ledger, PrivateVotePrivateState>,
  ): [PrivateVotePrivateState, Uint8Array] => {
    return [context.privateState, context.privateState.secretKey];
  },
  localAdminKey: (
    context: WitnessContext<Ledger, PrivateVotePrivateState>,
  ): [PrivateVotePrivateState, Uint8Array] => {
    return [context.privateState, context.privateState.secretKey];
  },
};
