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
 * integration/bboard-integration.test.ts
 *
 * End-to-end integration tests for the BBoard contract running against a local
 * Midnight node + indexer + proof server spun up via Testcontainers (the same
 * Docker Compose stack used by `compose.yml`).
 *
 * These tests exercise the full Midnight.js stack:
 *   • deployContract()     from @midnight-ntwrk/midnight-js-contracts
 *   • findDeployedContract() join path
 *   • callTx.post()        submits a real ZK-proven transaction
 *   • callTx.takeDown()    submits a second real ZK-proven transaction
 *   • indexerPublicDataProvider – queries ledger state from the Midnight indexer
 *   • httpClientProofProvider  – generates witnesses/proofs via proof server
 *   • MidnightWalletProvider   – balances and signs transactions
 *
 * Run with:
 *   cd bboard-cli && npx vitest run src/integration/bboard-integration.test.ts
 *
 * Requirements:
 *   • Docker daemon running (Testcontainers pulls images automatically)
 *   • Sufficient disk space for node (~500 MB) and proof server images
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { getTestEnvironment, type TestEnvironment, type EnvironmentConfiguration } from '@midnight-ntwrk/testkit-js';
import { unshieldedToken } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { WebSocket } from 'ws';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import fs from 'node:fs/promises';
import pino from 'pino';

import { BBoardAPI, type BBoardProviders } from '../../../api/src/index.js';
import { type PrivateStateId } from '../../../api/src/common-types.js';
import { randomBytes } from '../../../api/src/utils/index.js';
import { BBoardPrivateState } from '../../../contract/src/witnesses.js';
import { State } from '../../../contract/src/managed/bboard/contract/index.js';
import { MidnightWalletProvider } from '../midnight-wallet-provider.js';
import { waitForUnshieldedFunds } from '../wallet-utils.js';
import { getBBoardLedgerState } from '../index.js';

// @ts-expect-error: WebSocket polyfill required for Apollo / WS transport
globalThis.WebSocket = WebSocket;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const ZK_CONFIG_PATH = path.resolve(REPO_ROOT, 'contract', 'src', 'managed', 'bboard');

const logger = pino({ level: 'info' });

// ── Test lifecycle ─────────────────────────────────────────────────────────────
let testEnv: TestEnvironment;
let envConfig: EnvironmentConfiguration;
let providers: BBoardProviders;
let walletProvider: MidnightWalletProvider;
let privateStateDir: string;

beforeAll(
  async () => {
    setNetworkId('undeployed');

    // Spin up local Midnight node + indexer + proof server via Testcontainers
    testEnv = getTestEnvironment(logger) as TestEnvironment;
    envConfig = await testEnv.start();
    logger.info({ envConfig }, 'Test environment started');

    // Temporary LevelDB directory for this test run
    privateStateDir = await fs.mkdtemp(path.join(os.tmpdir(), 'bboard-it-'));

    const seed = randomBytes(32);
    const seedHex = Buffer.from(seed).toString('hex');

    walletProvider = await MidnightWalletProvider.build(logger, envConfig, seedHex);
    await walletProvider.start();

    // Wait for the genesis funds to appear in the local dev wallet
    await waitForUnshieldedFunds(logger, walletProvider.wallet, envConfig, unshieldedToken());

    const zkConfigProvider = new NodeZkConfigProvider<'post' | 'takeDown'>(ZK_CONFIG_PATH);
    providers = {
      privateStateProvider: levelPrivateStateProvider<PrivateStateId, BBoardPrivateState>({
        privateStateStoreName: privateStateDir,
        signingKeyStoreName: `${privateStateDir}-signing-keys`,
        privateStoragePasswordProvider: () => 'IT-2026!',
        accountId: seedHex,
      }),
      publicDataProvider: indexerPublicDataProvider(envConfig.indexer, envConfig.indexerWS),
      zkConfigProvider,
      proofProvider: httpClientProofProvider(envConfig.proofServer, zkConfigProvider),
      walletProvider,
      midnightProvider: walletProvider,
    };
  },
  15 * 60 * 1000 /* 15 min – image pull + node boot */,
);

afterAll(async () => {
  try {
    await walletProvider?.stop();
  } finally {
    await testEnv?.shutdown();
  }
  await fs.rm(privateStateDir, { recursive: true, force: true });
});

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('BBoard end-to-end integration (local stack)', () => {
  let api: BBoardAPI;

  it(
    'deploys a new BBoard contract via deployContract()',
    async () => {
      api = await BBoardAPI.deploy(providers, logger);

      expect(api.deployedContractAddress).toBeTruthy();
      expect(api.deployedContractAddress.length).toBeGreaterThan(0);
      logger.info(`Deployed at: ${api.deployedContractAddress}`);
    },
    10 * 60 * 1000,
  );

  it(
    'reports initial ledger state as VACANT with no message',
    async () => {
      const ledger = await getBBoardLedgerState(providers, api.deployedContractAddress);
      expect(ledger).not.toBeNull();
      expect(ledger!.state).toBe(State.VACANT);
      expect(ledger!.message.is_some).toBe(false);
      expect(ledger!.sequence).toBe(1n);
    },
    2 * 60 * 1000,
  );

  it(
    'posts a message via callTx.post() and updates ledger state',
    async () => {
      const message = 'Life before Death. Strength before Weakness. Journey before Destination.';
      await api.post(message);

      const ledger = await getBBoardLedgerState(providers, api.deployedContractAddress);
      expect(ledger).not.toBeNull();
      expect(ledger!.state).toBe(State.OCCUPIED);
      expect(ledger!.message.is_some).toBe(true);
      expect(ledger!.message.value).toBe(message);
    },
    10 * 60 * 1000,
  );

  it(
    'txHash and blockHeight from post() are real (not fabricated)',
    async () => {
      // The previous post() call already succeeded; here we call again on a fresh board
      const freshApi = await BBoardAPI.deploy(providers, logger);
      const txData = await (
        freshApi as unknown as {
          deployedContract: {
            callTx: { post: (m: string) => Promise<{ public: { txHash: string; blockHeight: bigint } }> };
          };
        }
      ).deployedContract.callTx.post('Szeth wore white');

      // txHash must be a non-empty hex string (not a mock)
      expect(typeof txData.public.txHash).toBe('string');
      expect(txData.public.txHash.length).toBeGreaterThan(0);
      expect(/^[0-9a-f]+$/i.test(txData.public.txHash)).toBe(true);

      // blockHeight must be a positive BigInt
      expect(typeof txData.public.blockHeight).toBe('bigint');
      expect(txData.public.blockHeight).toBeGreaterThan(0n);
    },
    10 * 60 * 1000,
  );

  it(
    'takes down a message via callTx.takeDown() and clears ledger state',
    async () => {
      await api.takeDown();

      const ledger = await getBBoardLedgerState(providers, api.deployedContractAddress);
      expect(ledger).not.toBeNull();
      expect(ledger!.state).toBe(State.VACANT);
      expect(ledger!.message.is_some).toBe(false);
      expect(ledger!.sequence).toBe(2n);
    },
    10 * 60 * 1000,
  );

  it(
    'joins an existing contract at the deployed address',
    async () => {
      const joinedApi = await BBoardAPI.join(providers, api.deployedContractAddress, logger);
      expect(joinedApi.deployedContractAddress).toBe(api.deployedContractAddress);

      const ledger = await getBBoardLedgerState(providers, joinedApi.deployedContractAddress);
      expect(ledger).not.toBeNull();
      // Board should still be VACANT from the takeDown above
      expect(ledger!.state).toBe(State.VACANT);
    },
    5 * 60 * 1000,
  );

  it(
    'state$ observable emits real ledger+private combined state',
    async () => {
      const { firstValueFrom } = await import('rxjs');
      const derivedState = await firstValueFrom(api.state$);

      expect(derivedState).toMatchObject({
        state: State.VACANT,
        sequence: 2n,
        message: undefined,
      });
      // isOwner is deterministic from the private key
      expect(typeof derivedState.isOwner).toBe('boolean');
    },
    2 * 60 * 1000,
  );
});
