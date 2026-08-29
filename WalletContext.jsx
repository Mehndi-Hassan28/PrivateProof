import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [voterSecret, setVoterSecret] = useState('');
  const [balanceDust, setBalanceDust] = useState(250.0);
  const [balanceNight, setBalanceNight] = useState(15.5);
  const [selectedNetwork, setSelectedNetwork] = useState('Midnight Preprod');
  const [isLaceModalOpen, setIsLaceModalOpen] = useState(false);

  // Load or initialize wallet session
  useEffect(() => {
    const savedConnected = localStorage.getItem('midnight_wallet_connected');
    const savedAddress = localStorage.getItem('midnight_wallet_address');
    const savedSecret = localStorage.getItem('midnight_voter_secret');

    if (savedConnected === 'true' && savedAddress && savedSecret) {
      setIsConnected(true);
      setWalletAddress(savedAddress);
      setVoterSecret(savedSecret);
    }
  }, []);

  const connectWallet = (customAddress = null) => {
    const randomSuffix = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 8);
    const address = customAddress || `addr_midnight_preprod1qz${randomSuffix}`;
    const secret = `voter_sk_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;

    setIsConnected(true);
    setWalletAddress(address);
    setVoterSecret(secret);
    setBalanceDust(350.75);
    setBalanceNight(24.0);

    localStorage.setItem('midnight_wallet_connected', 'true');
    localStorage.setItem('midnight_wallet_address', address);
    localStorage.setItem('midnight_voter_secret', secret);

    toast.success('Lace Wallet Connected', {
      description: `Connected to ${selectedNetwork} with address ${address.slice(0, 14)}...`,
    });
    setIsLaceModalOpen(false);
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress('');
    setVoterSecret('');
    localStorage.removeItem('midnight_wallet_connected');
    localStorage.removeItem('midnight_wallet_address');
    localStorage.removeItem('midnight_voter_secret');

    toast.info('Lace Wallet Disconnected', {
      description: 'Session cleared. Reconnect anytime to cast private ballots.',
    });
  };

  const switchNetwork = (networkName) => {
    setSelectedNetwork(networkName);
    toast.info(`Switched to ${networkName}`, {
      description: `Targeting Midnight RPC node for ${networkName}`,
    });
  };

  const regenerateSecret = () => {
    const newSecret = `voter_sk_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
    setVoterSecret(newSecret);
    localStorage.setItem('midnight_voter_secret', newSecret);
    toast.success('Voter Secret Rotated', {
      description: 'Generated fresh local zero-knowledge witness entropy.',
    });
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        walletAddress,
        voterSecret,
        balanceDust,
        balanceNight,
        selectedNetwork,
        isLaceModalOpen,
        setIsLaceModalOpen,
        connectWallet,
        disconnectWallet,
        switchNetwork,
        regenerateSecret,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);