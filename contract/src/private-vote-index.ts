// Copyright (C) Midnight Foundation
// SPDX-License-Identifier: Apache-2.0
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0

import { CompiledContract } from "@midnight-ntwrk/midnight-js-protocol/compact-js";
import * as CompiledPrivateVoteContractModule from "./managed/private-vote/contract/index.js";
import * as Witnesses from "./private-vote-witnesses.js";

export * from "./managed/private-vote/contract/index.js";
export * from "./private-vote-witnesses.js";

export const CompiledPrivateVoteContract = CompiledContract.make<
  CompiledPrivateVoteContractModule.Contract<Witnesses.PrivateVotePrivateState>
>(
  "PrivateVote",
  CompiledPrivateVoteContractModule.Contract<Witnesses.PrivateVotePrivateState>,
).pipe(
  CompiledContract.withWitnesses(Witnesses.witnesses),
  CompiledContract.withCompiledFileAssets("./managed/private-vote"),
);

export const PrivateVoteContractName = "PrivateVote";
