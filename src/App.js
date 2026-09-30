import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { WalletProvider } from './context/WalletContext';
import { Navbar } from './components/Navbar';
import { ProposalsList } from './components/ProposalsList';
import { ContractExplorer } from './components/ContractExplorer';
import { UserProfile } from './components/UserProfile';
import { LaceWalletModal } from './components/LaceWalletModal';
import './index.css';

function AppInner() {
  const [activeTab, setActiveTab] = useState('proposals');

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 w-full">
        {activeTab === 'proposals' && (
          <ProposalsList />
        )}
        {activeTab === 'contract' && <ContractExplorer />}
        {activeTab === 'profile' && (
          <UserProfile onNavigateToProposals={() => setActiveTab('proposals')} />
        )}
      </main>
      <LaceWalletModal />
      <Toaster theme="dark" position="bottom-right" richColors />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <WalletProvider>
        <AppInner />
      </WalletProvider>
    </BrowserRouter>
  );
}

export default App;
