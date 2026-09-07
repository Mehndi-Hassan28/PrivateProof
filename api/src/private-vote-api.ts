// Copyright (C) Midnight Foundation
// SPDX-License-Identifier: Apache-2.0
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0

import { type ContractAddress } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import { type Logger } from 'pino';
import { Observable, combineLatest, from, map, tap } from 'rxjs';
import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import {
  type PrivateVoteProviders,
  type DeployedPrivateVoteContract,
  type VoteDerivedState,
  privateVotePrivateStateKey,
  type PrivateVoteContract,
} from './private-vote-types.js';
import { CompiledPrivateVoteContract } from '../../contract/src/private-vote-index.js';
import {
  createPrivateVotePrivateState,
  type PrivateVotePrivateState,
} from '../../contract/src/private-vote-witnesses.js';
import * as PrivateVote from '../../contract/src/private-vote-index.js';

export interface DeployedPrivateVoteAPI {
  readonly deployedContractAddress: ContractAddress;
  readonly state$: Observable<VoteDerivedState>;

  castPrivateVote: (voteYes: boolean) => Promise<void>;
  closePoll: () => Promise<void>;
}

export class PrivateVoteAPI implements DeployedPrivateVoteAPI {
  readonly deployedContractAddress: ContractAddress;
  readonly state$: Observable<VoteDerivedState>;

  private constructor(
    public readonly deployedContract: DeployedPrivateVoteContract,
    providers: PrivateVoteProviders,
    private readonly logger?: Logger,
  ) {
    this.deployedContractAddress = deployedContract.deployTxData.public.contractAddress;
    providers.privateStateProvider.setContractAddress(this.deployedContractAddress);

    this.state$ = combineLatest(
      [
        providers.publicDataProvider.contractStateObservable(this.deployedContractAddress, { type: 'latest' }).pipe(
          map((contractState) => PrivateVote.ledger(contractState.data)),
          tap((ledgerState) => {
            logger?.trace({ ledgerStateChanged: { ledgerState } });
          }),
        ),
        from(providers.privateStateProvider.get(privateVotePrivateStateKey) as Promise<PrivateVotePrivateState>),
      ],
      (ledgerState, privateState) => {
        const nullifier = PrivateVote.pureCircuits.getNullifier(privateState.secretKey);
        const hasVoted = ledgerState.nullifierSet ? ledgerState.nullifierSet.member(nullifier) : false;

        return {
          pollOpen: ledgerState.pollOpen,
          voteCount: ledgerState.voteCount,
          yesCount: ledgerState.pollOpen ? undefined : ledgerState.yesCount,
          noCount: ledgerState.pollOpen ? undefined : ledgerState.noCount,
          hasVoted,
          isAdmin: privateState.isAdmin,
        };
      },
    );
  }

  async castPrivateVote(voteYes: boolean): Promise<void> {
    this.logger?.info(`casting private vote: ${voteYes}`);
    const txData = await this.deployedContract.callTx.castPrivateVote(voteYes);
    this.logger?.trace({
      transactionAdded: {
        circuit: 'castPrivateVote',
        txHash: txData.public.txHash,
        blockHeight: txData.public.blockHeight,
      },
    });
  }

  async closePoll(): Promise<void> {
    this.logger?.info('closing poll');
    const txData = await this.deployedContract.callTx.closePoll();
    this.logger?.trace({
      transactionAdded: {
        circuit: 'closePoll',
        txHash: txData.public.txHash,
        blockHeight: txData.public.blockHeight,
      },
    });
  }

  static async deploy(
    providers: PrivateVoteProviders,
    adminSecretKey: Uint8Array,
    logger?: Logger,
  ): Promise<PrivateVoteAPI> {
    logger?.info('deployContract');
    const deployedContract = await deployContract(providers, {
      compiledContract: CompiledPrivateVoteContract,
      privateStateId: privateVotePrivateStateKey,
      initialPrivateState: createPrivateVotePrivateState(adminSecretKey, true),
    });
    return new PrivateVoteAPI(deployedContract, providers, logger);
  }

  static async join(
    providers: PrivateVoteProviders,
    contractAddress: ContractAddress,
    userSecretKey: Uint8Array,
    logger?: Logger,
  ): Promise<PrivateVoteAPI> {
    logger?.info('joinContract');
    const deployedContract = await findDeployedContract<PrivateVoteContract>(providers, {
      contractAddress,
      compiledContract: CompiledPrivateVoteContract,
      privateStateId: privateVotePrivateStateKey,
      initialPrivateState: await PrivateVoteAPI.getPrivateState(providers, contractAddress, userSecretKey),
    });
    return new PrivateVoteAPI(deployedContract, providers, logger);
  }

  private static async getPrivateState(
    providers: PrivateVoteProviders,
    contractAddress: ContractAddress,
    userSecretKey: Uint8Array,
  ): Promise<PrivateVotePrivateState> {
    providers.privateStateProvider.setContractAddress(contractAddress);
    const existingPrivateState = await providers.privateStateProvider.get(privateVotePrivateStateKey);
    return existingPrivateState ?? createPrivateVotePrivateState(userSecretKey, false);
  }
}
