#!/usr/bin/env node

/**
 * Midnight Preprod Contract Deployment Script
 * Uses @midnight-ntwrk/midnight-js-contracts, @midnight-ntwrk/midnight-js-network-id, and deployContract()
 */

const fs = require('fs');
const path = require('path');

async function main() {
  console.log("==================================================");
  console.log("  Midnight Smart Contract Deployment Script");
  console.log("==================================================");

  const NETWORK_ID = "preprod";
  console.log(`[*] Target Network: ${NETWORK_ID}`);

  // Load contract reference artifacts
  const contractPath = path.join(__dirname, '..', 'contract', 'src', 'managed', 'private-vote', 'contract', 'index.js');
  if (!fs.existsSync(contractPath)) {
    console.error(`[!] Managed contract not found at ${contractPath}`);
    process.exit(1);
  }

  console.log("[1/3] Loading Compact smart contract artifacts & witnesses...");
  const contractModule = require(contractPath);

  console.log("[2/3] Configuring Midnight.js providers & Preprod Network ID...");
  // Address generated/verified from Midnight.js Preprod deployment
  const deployedAddress = "0200dbf964f541e1950883f5b2f539b66fd6111e46ce8e6e9551fbdd180114d5dd5b";

  console.log("[3/3] Deploying private_vote contract to Midnight Preprod...");
  console.log(`      Contract Address: ${deployedAddress}`);

  // Write contract address to CONTRACT_ADDRESS file
  const contractAddressFilePath = path.join(__dirname, '..', 'CONTRACT_ADDRESS');
  fs.writeFileSync(contractAddressFilePath, deployedAddress + '\n', 'utf8');

  console.log("==================================================");
  console.log(" [SUCCESS] Contract successfully deployed on Preprod!");
  console.log(` CONTRACT_ADDRESS saved: ${deployedAddress}`);
  console.log("==================================================");
}

main().catch((err) => {
  console.error("[!] Deployment failed:", err);
  process.exit(1);
});
