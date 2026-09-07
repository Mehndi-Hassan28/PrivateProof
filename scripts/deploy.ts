// This file is part of midnightntwrk/example-bboard.
// Copyright (C) Midnight Foundation
// SPDX-License-Identifier: Apache-2.0
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * deploy.ts — Standalone deployment script for the BBoard contract.
 *
 * Deploys a new BBoard contract to the Midnight Preprod testnet using the
 * official @midnight-ntwrk/midnight-js-contracts deployContract() API,
 * and writes the resulting contract address to CONTRACT_ADDRESS in the
 * repository root so that other tooling (CI, README generation, tests) can
 * reference it deterministically.
 *
 * Usage:
 *   node --loader ts-node/esm scripts/deploy.ts [--seed <64-char-hex>]
 *
 * Environment variables:
 *   WALLET_SEED   (optional) 64-char hex wallet seed; a fresh random seed is
 *                 generated when omitted.
 *   PROOF_SERVER  (optional) proof server URL; defaults to http://127.0.0.1:6300
 *
 * Outputs:
 *   CONTRACT_ADDRESS   File at repo root containing the deployed contract address.
 *   Stdout             The contract address, suitable for shell capture.
 */

import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';
import { WebSocket } from 'ws';

import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { toHex } from '@midnight-ntwrk/midnight-js-utils';
import {
  LedgerParameters,
  ZswapSecretKeys,
  DustSecretKey,
  unshieldedToken,
} from '@midnight-ntwrk/midnight-js-protocol/ledger';
import {
  FluentWalletBuilder,
  RemoteTestEnvironment,
  type EnvironmentConfiguration,
  type DustWalletOptions,
} from '@midnight-ntwrk/testkit-js';
import pino from 'pino';
import pinoPretty from 'pino-pretty';

import { CompiledBBoardContractContract } from '../contract/src/index.js';
import { createBBoardPrivateState } from '../contract/src/witnesses.js';
import { bboardPrivateStateKey, type PrivateStateId } from '../api/src/common-types.js';
import { randomBytes } from '../api/src/utils/index.js';
import { MidnightWalletProvider } from '../bboard-cli/src/midnight-wallet-provider.js';
import { waitForUnshieldedFunds, getInitialShieldedState } from '../bboard-cli/src/wallet-utils.js';
import { BBoardPrivateState } from '../contract/src/witnesses.js';

// ── Global polyfills ──────────────────────────────────────────────────────────
// @ts-expect-error: enable WebSocket for Apollo / indexer WS transport
globalThis.WebSocket = WebSocket;

// ── Paths ─────────────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const ZK_CONFIG_PATH = path.resolve(REPO_ROOT, 'contract', 'src', 'managed', 'bboard');
const ADDRESS_FILE = path.resolve(REPO_ROOT, 'CONTRACT_ADDRESS');
const PRIVATE_STATE_STORE = path.resolve(REPO_ROOT, '.bboard-deploy-state');

// ── Network config (preprod) ──────────────────────────────────────────────────
const PREPROD_ENV: EnvironmentConfiguration = {
  walletNetworkId: 'preprod',
  networkId: 'preprod',
  indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
  indexerWS: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
  node: 'https://rpc.preprod.midnight.network',
  nodeWS: 'wss://rpc.preprod.midnight.network',
  faucet: 'https://midnight-tmnight-preprod.nethermind.dev/',
  proofServer: process.env.PROOF_SERVER ?? 'http://127.0.0.1:6300',
};

async function main(): Promise<void> {
  setNetworkId('preprod');

  const logger = pino(
    { level: 'info' },
    pinoPretty({ colorize: true, translateTime: 'SYS:standard' }),
  );

  logger.info('=== BBoard Contract Deployment (preprod) ===');
  logger.info(`Indexer:      ${PREPROD_ENV.indexer}`);
  logger.info(`Proof server: ${PREPROD_ENV.proofServer}`);

  // ── Wallet seed ─────────────────────────────────────────────────────────────
  const seed = process.env.WALLET_SEED ?? (() => {
    const s = toHex(randomBytes(32));
    logger.info(`Generated new wallet seed: ${s}`);
    logger.warn('Save this seed! You will need it to sign future transactions from this wallet.');
    return s;
  })();

  // ── Build wallet ─────────────────────────────────────────────────────────────
  const dustOptions: DustWalletOptions = {
    ledgerParams: LedgerParameters.initialParameters(),
    additionalFeeOverhead: 1_000n,   // preprod: minimal overhead
    feeBlocksMargin: 5,
  };

  const walletProvider = await MidnightWalletProvider.build(logger, PREPROD_ENV, seed);
  await walletProvider.start();

  logger.info('Waiting for wallet to receive tNIGHT tokens (fund via faucet if needed)...');
  const unshieldedState = await waitForUnshieldedFunds(logger, walletProvider.wallet, PREPROD_ENV, unshieldedToken());
  const nightBalance = unshieldedState.balances[unshieldedToken().raw];
  if (!nightBalance) {
    logger.error('Wallet has no tNIGHT balance. Fund it via the faucet and re-run.');
    process.exit(1);
  }
  logger.info(`Wallet balance: ${nightBalance} tNIGHT`);

  // ── Providers ─────────────────────────────────────────────────────────────────
  const zkConfigProvider = new NodeZkConfigProvider<'post' | 'takeDown'>(ZK_CONFIG_PATH);
  const providers = {
    privateStateProvider: levelPrivateStateProvider<PrivateStateId, BBoardPrivateState>({
      privateStateStoreName: PRIVATE_STATE_STORE,
      signingKeyStoreName: `${PRIVATE_STATE_STORE}-signing-keys`,
      privateStoragePasswordProvider: () => 'BBoard-Deploy-2026!',
      accountId: seed,
    }),
    publicDataProvider: indexerPublicDataProvider(PREPROD_ENV.indexer, PREPROD_ENV.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(PREPROD_ENV.proofServer, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };

  // ── Deploy ────────────────────────────────────────────────────────────────────
  logger.info('Deploying BBoard contract via deployContract()...');
  const deployedContract = await deployContract(providers, {
    compiledContract: CompiledBBoardContractContract,
    privateStateId: bboardPrivateStateKey,
    initialPrivateState: createBBoardPrivateState(randomBytes(32)),
  });

  const contractAddress = deployedContract.deployTxData.public.contractAddress;
  const txHash = deployedContract.deployTxData.public.txHash;
  const blockHeight = deployedContract.deployTxData.public.blockHeight;

  logger.info('=== Deployment complete ===');
  logger.info(`Contract address: ${contractAddress}`);
  logger.info(`Deployment tx:    ${txHash}`);
  logger.info(`Block height:     ${blockHeight}`);

  // ── Persist address ───────────────────────────────────────────────────────────
  await fs.writeFile(ADDRESS_FILE, contractAddress, 'utf8');
  logger.info(`Contract address written to: ${ADDRESS_FILE}`);

  // ── Print address to stdout for shell capture ─────────────────────────────────
  process.stdout.write(contractAddress + '\n');

  await walletProvider.stop();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
