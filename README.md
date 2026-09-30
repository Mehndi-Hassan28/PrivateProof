# PrivateProof

PrivateProof is a React interface and Node API for a planned Midnight governance dApp.

## Current implementation status

- The frontend connects to installed Midnight wallets exposed through `window.midnight` (including Lace and 1AM) using the wallet DApp Connector API.
- The API reads live Preprod node health from Midnight RPC.
- The API reads proposal metadata from MongoDB when `MONGODB_URI` is configured.
- No proposal, proof, vote, transaction, wallet balance, or contract address is fabricated by the app.
- Proposal creation and voting are disabled. The single-contract, multi-proposal Compact source is in `public/contract/private_vote.compact`, but this checkout does not have usable proof keys or the Midnight.js transaction provider needed to deploy or call it.
- MongoDB transaction persistence and wallet authentication are not enabled. The app never receives wallet secrets or stores wallet credentials.

The old generated JavaScript, keys, and ZKIR files were removed because they were placeholders rather than compiler output. `npm run compile:compact` invokes the real Compact compiler and fails if key generation fails; it does not report a mock build as success.

## Requirements

- Node.js 20 or newer
- x86-64 CPU with the instruction set required by the Compact prover-key generator
- npm
- A MongoDB Atlas URI to populate proposal metadata (optional while inspecting the app)
- Lace or 1AM browser extension for wallet connection

## Run locally

Install the frontend and API dependencies:

```bash
npm install --legacy-peer-deps
```

Configure the browser API URL in `.env`:

```dotenv
REACT_APP_BACKEND_URL=http://localhost:8000
REACT_APP_CONTRACT_ADDRESS=
```

Set server settings in the environment or root `.env` file. Never commit the Atlas URI:

```dotenv
MONGODB_URI=
MONGODB_DB=privateproof
MIDNIGHT_RPC_URL=https://rpc.preprod.midnight.network
PORT=8000
```

Run the API and frontend in separate terminals:

```bash
npm run start:server
npm start
```

The frontend is served at `http://localhost:3000`; API health is at `http://localhost:8000/health`. Without `MONGODB_URI`, proposal reads return HTTP 503. The network status endpoint still queries Midnight Preprod RPC.

## Configuration

`CONTRACT_ADDRESS` is a server environment variable. `REACT_APP_CONTRACT_ADDRESS` is a public frontend setting. Set both only after a successful deployment. Contract addresses cannot be generated independently of a deployment transaction.

The API intentionally does not write proposal or transaction records until the frontend can submit and confirm the corresponding real contract transactions.
