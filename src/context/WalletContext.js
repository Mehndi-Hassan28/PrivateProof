import React, { createContext, useContext, useMemo, useState } from 'react';
import { toast } from 'sonner';

const WalletContext = createContext(null);

function injectedWallets() {
  if (typeof window === 'undefined' || !window.midnight) return [];
  return Object.entries(window.midnight).map(([id, api]) => ({
    id,
    name: api?.name || id,
    icon: typeof api?.icon === 'string' ? api.icon : '',
    api,
  })).filter(({ api }) => typeof api?.connect === 'function' && /^4\./.test(api.apiVersion || ''));
}

export const WalletProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState('');
  const [walletName, setWalletName] = useState('');
  const [connectedAPI, setConnectedAPI] = useState(null);
  const [balanceDust, setBalanceDust] = useState(null);
  const [balanceNight, setBalanceNight] = useState(null);
  const [selectedNetwork] = useState('Midnight Preprod');
  const [isLaceModalOpen, setIsLaceModalOpen] = useState(false);
  const [walletChoices, setWalletChoices] = useState([]);

  const isConnected = Boolean(connectedAPI && walletAddress);
  const dappConnector = connectedAPI;

  const connectWallet = async (walletId) => {
    const choices = injectedWallets();
    setWalletChoices(choices);
    const choice = choices.find(({ id }) => id === walletId);
    if (!choice) {
      toast.error('Wallet extension not found', { description: 'Install and unlock Lace or 1AM, then try again.' });
      return;
    }

    try {
      const api = await choice.api.connect('preprod');
      const connection = await api.getConnectionStatus();
      if (connection?.networkId && connection.networkId !== 'preprod') {
        throw new Error(`Wallet is connected to ${connection.networkId}, not Preprod.`);
      }
      const walletAddressResult = await api.getUnshieldedAddress();
      const address = typeof walletAddressResult === 'string'
        ? walletAddressResult
        : walletAddressResult?.unshieldedAddress || walletAddressResult?.address;
      if (!address) throw new Error('The wallet did not provide a Midnight unshielded address.');
      setConnectedAPI(api);
      setWalletAddress(address);
      setWalletName(choice.name);
      const dust = await api.getDustBalance();
      const tokenBalances = await api.getUnshieldedBalances();
      setBalanceDust(typeof dust === 'bigint' || typeof dust === 'number' ? Number(dust) / 1_000_000_000_000_000 : null);
      setBalanceNight(tokenBalances?.NIGHT == null ? null : Number(tokenBalances.NIGHT) / 1_000_000);
      setIsLaceModalOpen(false);
      toast.success(`Connected to ${choice.name}`);
    } catch (error) {
      toast.error('Wallet connection failed', { description: error.message });
    }
  };

  const disconnectWallet = () => {
    setConnectedAPI(null);
    setWalletAddress('');
    setWalletName('');
    setBalanceDust(null);
    setBalanceNight(null);
  };

  const value = useMemo(() => ({
    isConnected, walletAddress, walletName, balanceDust, balanceNight,
    selectedNetwork, isLaceModalOpen, dappConnector, walletChoices,
    setIsLaceModalOpen: (open) => { if (open) setWalletChoices(injectedWallets()); setIsLaceModalOpen(open); },
    connectWallet, disconnectWallet,
  }), [isConnected, walletAddress, walletName, balanceDust, balanceNight, selectedNetwork, isLaceModalOpen, dappConnector, walletChoices]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWallet = () => useContext(WalletContext);
