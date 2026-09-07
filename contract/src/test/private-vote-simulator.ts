// Copyright (C) Midnight Foundation
// SPDX-License-Identifier: Apache-2.0
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0

import {
  type CircuitContext,
  QueryContext,
  sampleContractAddress,
  createConstructorContext,
  CostModel,
} from "@midnight-ntwrk/compact-runtime";
import {
  Contract,
  type Ledger,
  ledger,
  pureCircuits,
} from "../managed/private-vote/contract/index.js";
import {
  type PrivateVotePrivateState,
  witnesses,
} from "../private-vote-witnesses.js";

export class PrivateVoteSimulator {
  readonly contract: Contract<PrivateVotePrivateState>;
  circuitContext: CircuitContext<PrivateVotePrivateState>;

  constructor(secretKey: Uint8Array, isAdmin: boolean = false) {
    this.contract = new Contract<PrivateVotePrivateState>(witnesses);
    const {
      currentPrivateState,
      currentContractState,
      currentZswapLocalState,
    } = this.contract.initialState(
      createConstructorContext({ secretKey, isAdmin }, "0".repeat(64)),
    );
    this.circuitContext = {
      currentPrivateState,
      currentZswapLocalState,
      costModel: CostModel.initialCostModel(),
      currentQueryContext: new QueryContext(
        currentContractState.data,
        sampleContractAddress(),
      ),
    };
  }

  public switchUser(secretKey: Uint8Array, isAdmin: boolean = false): void {
    this.circuitContext.currentPrivateState = {
      secretKey,
      isAdmin,
    };
  }

  public getLedger(): Ledger {
    return ledger(this.circuitContext.currentQueryContext.state);
  }

  public getPrivateState(): PrivateVotePrivateState {
    return this.circuitContext.currentPrivateState;
  }

  public castPrivateVote(voteYes: boolean): Ledger {
    this.circuitContext = this.contract.impureCircuits.castPrivateVote(
      this.circuitContext,
      voteYes,
    ).context;
    return ledger(this.circuitContext.currentQueryContext.state);
  }

  public closePoll(): Ledger {
    this.circuitContext = this.contract.impureCircuits.closePoll(
      this.circuitContext,
    ).context;
    return ledger(this.circuitContext.currentQueryContext.state);
  }

  public getResults(): [bigint, bigint, bigint] {
    const result = this.contract.impureCircuits.getResults(this.circuitContext);
    this.circuitContext = result.context;
    return result.result;
  }

  public getNullifier(): Uint8Array {
    return pureCircuits.getNullifier(
      this.circuitContext.currentPrivateState.secretKey,
    );
  }
}
