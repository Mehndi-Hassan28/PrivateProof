const http = require('node:http');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const PORT = Number(process.env.PORT || 8000);
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || 'privateproof';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '';
const RPC_URL = process.env.MIDNIGHT_RPC_URL || 'https://rpc.preprod.midnight.network';
let mongoClient;
let mongoConnectPromise;

async function database() {
  if (!MONGODB_URI) throw Object.assign(new Error('MONGODB_URI is not configured'), { status: 503 });
  if (!mongoConnectPromise) {
    mongoClient = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    mongoConnectPromise = mongoClient.connect().catch((error) => {
      mongoConnectPromise = null;
      throw error;
    });
  }
  await mongoConnectPromise;
  return mongoClient.db(DB_NAME);
}

function send(response, status, body) {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'access-control-allow-origin': process.env.APP_ORIGIN || 'http://localhost:3000',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type, authorization',
  });
  response.end(JSON.stringify(body));
}

async function handler(request, response) {
  if (request.method === 'OPTIONS') return send(response, 204, {});
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);

  if (url.pathname === '/health' || url.pathname === '/') {
    return send(response, 200, {
      service: 'PrivateProof API',
      storage: MONGODB_URI ? 'configured' : 'needs MONGODB_URI',
      contract: CONTRACT_ADDRESS ? 'configured' : 'needs deployment',
    });
  }

  if (url.pathname === '/api/midnight/network-status' && request.method === 'GET') {
    try {
      const rpcResponse = await fetch(RPC_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'system_health', params: [] }),
        signal: AbortSignal.timeout(5000),
      });
      const rpc = await rpcResponse.json();
      if (!rpcResponse.ok || rpc.error) throw new Error(rpc.error?.message || `RPC returned ${rpcResponse.status}`);
      return send(response, 200, {
        network: 'Midnight Preprod',
        node_url: RPC_URL,
        contract_address: CONTRACT_ADDRESS || null,
        sync_status: rpc.result?.isSyncing === false ? 'Synced' : 'Syncing or unknown',
        peers: rpc.result?.peers,
        health: rpc.result,
      });
    } catch (error) {
      return send(response, 502, { detail: `Midnight RPC unavailable: ${error.message}` });
    }
  }

  if (url.pathname === '/api/proposals' && request.method === 'GET') {
    try {
      const db = await database();
      const proposals = await db.collection('proposals').find({}).sort({ created_at: -1 }).limit(200).toArray();
      return send(response, 200, proposals.map(({ _id, ...proposal }) => proposal));
    } catch (error) {
      return send(response, error.status || 503, { detail: error.status ? error.message : `MongoDB unavailable: ${error.message}` });
    }
  }

  if (url.pathname === '/api/proposals' && request.method === 'POST') {
    return send(response, 503, { detail: 'Proposal creation is unavailable until the real multi-proposal Compact contract is compiled and deployed.' });
  }

  if (url.pathname.startsWith('/api/proposals/') && url.pathname.endsWith('/vote')) {
    return send(response, 503, { detail: 'Voting is unavailable until the compiled Compact circuit and deployed contract are configured.' });
  }

  if (url.pathname.startsWith('/api/circuits/')) {
    return send(response, 503, { detail: 'Proof generation requires the generated Compact runtime and matching prover artifacts. No proof is fabricated.' });
  }

  return send(response, 404, { detail: 'Route not found' });
}

const server = http.createServer((request, response) => {
  handler(request, response).catch((error) => {
    console.error('API request failed:', error);
    if (!response.headersSent) send(response, 500, { detail: 'Internal API error' });
    else response.end();
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`PrivateProof API listening on http://localhost:${PORT}`);
  console.log(MONGODB_URI ? `MongoDB database: ${DB_NAME}` : 'MongoDB not configured; database routes return 503');
  console.log(CONTRACT_ADDRESS ? 'Contract address configured' : 'No contract address configured');
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => {
    server.close();
    if (mongoClient) await mongoClient.close();
    process.exit(0);
  });
}
