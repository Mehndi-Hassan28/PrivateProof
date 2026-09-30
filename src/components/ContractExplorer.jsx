import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Copy, ExternalLink, RefreshCw, Server } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from './ui/badge';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || '';

export const ContractExplorer = () => {
  const [networkStatus, setNetworkStatus] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${BACKEND_URL}/api/midnight/network-status`);
      setNetworkStatus(response.data);
    } catch (requestError) {
      setNetworkStatus(null);
      setError(requestError.response?.data?.detail || requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const copyAddress = async () => {
    if (!CONTRACT_ADDRESS) return;
    await navigator.clipboard.writeText(CONTRACT_ADDRESS);
    toast.success('Contract address copied');
  };

  return (
    <section className="space-y-6" data-testid="contract-explorer-view">
      <header className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Server className="h-6 w-6 text-sky-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Midnight network status</h1>
              <p className="text-sm text-slate-400">Live response from the configured Preprod RPC node.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={networkStatus ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-amber-500/30 bg-amber-500/10 text-amber-300'}>
              {networkStatus?.sync_status || (loading ? 'Checking node' : 'Unavailable')}
            </Badge>
            <button onClick={refresh} disabled={loading} aria-label="Refresh node status" className="rounded-lg border border-slate-700 p-2 text-slate-300 hover:bg-slate-800">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        {error && <p role="alert" className="mt-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p>}
      </header>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <div className="mb-2 text-xs uppercase tracking-wide text-slate-400">Contract address</div>
        {CONTRACT_ADDRESS ? (
          <div className="flex flex-wrap items-center gap-3 break-all font-mono text-sm text-sky-300">
            <span data-testid="deployed-contract-address">{CONTRACT_ADDRESS}</span>
            <button onClick={copyAddress} aria-label="Copy contract address" className="text-slate-400 hover:text-white"><Copy className="h-4 w-4" /></button>
            <a href={`https://explorer.1am.xyz/?network=preprod&contract=${encodeURIComponent(CONTRACT_ADDRESS)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-slate-400 hover:text-white">Explorer <ExternalLink className="h-3.5 w-3.5" /></a>
          </div>
        ) : <p className="text-sm text-amber-300">Not configured. Set REACT_APP_CONTRACT_ADDRESS after deploying the compiled contract.</p>}
      </div>

      {networkStatus && <pre className="overflow-auto rounded-2xl border border-slate-800 bg-slate-950 p-5 text-xs text-emerald-200">{JSON.stringify(networkStatus, null, 2)}</pre>}
    </section>
  );
};
