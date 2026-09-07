// Copyright (C) Midnight Foundation
// SPDX-License-Identifier: Apache-2.0
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0

import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { InitialAPI, ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import semver from 'semver';

export interface WalletState {
  connected: boolean;
  address: string | null;
  coinPublicKey: string | null;
  encryptionPublicKey: string | null;
  balance: string | null;
  network: string | null;
  connecting: boolean;
  error: string | null;
  api: ConnectedAPI | null;
}

export interface WalletContextValue extends WalletState {
  connect: (targetNetwork?: string) => Promise<void>;
  disconnect: () => void;
  clearError: () => void;
  refreshBalance: () => Promise<void>;
}

export const WalletContext = createContext<WalletContextValue | null>(null);

declare global {
  interface Window {
    midnight?: Record<string, InitialAPI>;
  }
}

const COMPATIBLE_CONNECTOR_API_VERSION = '4.x';

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    connected: false,
    address: null,
    coinPublicKey: null,
    encryptionPublicKey: null,
    balance: null,
    network: 'preprod',
    connecting: false,
    error: null,
    api: null,
  });

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!state.api) return;
    try {
      const dust = await state.api.getDustBalance();
      const dustAmount = Number(dust.balance) / 1_000_000;
      const formatted = `${dustAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DUST`;
      setState((s) => ({ ...s, balance: formatted }));
    } catch (e) {
      console.warn('Could not refresh balance:', e);
    }
  }, [state.api]);

  const connect = useCallback(async (targetNetwork = 'preprod') => {
    setState((s) => ({ ...s, connecting: true, error: null }));

    try {
      // Set network ID globally to ensure library alignment
      setNetworkId(targetNetwork);

      // Discover genuine Midnight Lace / 1AM wallet provider from window.midnight
      if (!window.midnight || Object.keys(window.midnight).length === 0) {
        throw new Error(
          'Midnight Lace / 1AM wallet extension not detected. Please install and enable the Lace Wallet extension for Midnight.',
        );
      }

      const walletProviders = Object.values(window.midnight);
      const laceProvider =
        walletProviders.find(
          (w) =>
            w &&
            typeof w === 'object' &&
            'apiVersion' in w &&
            semver.satisfies(w.apiVersion, COMPATIBLE_CONNECTOR_API_VERSION) &&
            (w.name?.toLowerCase().includes('lace') || w.rdns?.toLowerCase().includes('lace')),
        ) ||
        walletProviders.find(
          (w): w is InitialAPI =>
            !!w &&
            typeof w === 'object' &&
            'apiVersion' in w &&
            semver.satisfies(w.apiVersion, COMPATIBLE_CONNECTOR_API_VERSION),
        );

      if (!laceProvider || typeof laceProvider.connect !== 'function') {
        throw new Error(
          `No compatible Midnight wallet provider found (requires API version ${COMPATIBLE_CONNECTOR_API_VERSION}).`,
        );
      }

      // Request actual connection to Midnight Preprod network
      const connectedApi = await laceProvider.connect(targetNetwork);

      // Verify connection status
      const status = await connectedApi.getConnectionStatus();
      if (!status) {
        throw new Error('Application is not authorized by the Midnight wallet.');
      }

      // Query actual shielded address and public keys directly from the wallet
      const addresses = await connectedApi.getShieldedAddresses();

      // Query actual DUST balance directly from the wallet
      let formattedBalance = '0.00 DUST';
      try {
        const dust = await connectedApi.getDustBalance();
        const dustAmount = Number(dust.balance) / 1_000_000;
        formattedBalance = `${dustAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DUST`;
      } catch (e) {
        console.warn('Could not query real DUST balance from wallet API:', e);
      }

      localStorage.setItem('midnight_wallet_connected', 'true');

      setState({
        connected: true,
        address: addresses.shieldedAddress,
        coinPublicKey: addresses.shieldedCoinPublicKey,
        encryptionPublicKey: addresses.shieldedEncryptionPublicKey,
        balance: formattedBalance,
        network: targetNetwork,
        connecting: false,
        error: null,
        api: connectedApi,
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('Midnight wallet connection error:', errorMsg);
      localStorage.removeItem('midnight_wallet_connected');
      setState({
        connected: false,
        address: null,
        coinPublicKey: null,
        encryptionPublicKey: null,
        balance: null,
        network: targetNetwork,
        connecting: false,
        error: errorMsg,
        api: null,
      });
      throw err;
    }
  }, []);

  const disconnect = useCallback(() => {
    localStorage.removeItem('midnight_wallet_connected');
    setState({
      connected: false,
      address: null,
      coinPublicKey: null,
      encryptionPublicKey: null,
      balance: null,
      network: 'preprod',
      connecting: false,
      error: null,
      api: null,
    });
  }, []);

  // Auto-reconnect if previously connected
  useEffect(() => {
    if (localStorage.getItem('midnight_wallet_connected') === 'true') {
      void connect('preprod');
    }
  }, [connect]);

  return (
    <WalletContext.Provider
      value={{
        ...state,
        connect,
        disconnect,
        clearError,
        refreshBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletContextValue {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a <WalletProvider />');
  }
  return context;
}
