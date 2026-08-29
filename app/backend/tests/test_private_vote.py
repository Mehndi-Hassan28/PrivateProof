import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))



import pytest
import requests
import os
import hashlib
def test_compact_contract_compilation_artifacts():
    """Verify Compact smart contract source and managed artifacts exist and have required format."""
    compact_file = Path("/app/contract/private_vote.compact")
    assert compact_file.exists(), "Compact contract source file missing"
    
    content = compact_file.read_text()
    assert "pragma language_version 0.23;" in content
    assert "circuit castPrivateVote" in content
    assert "circuit deriveNullifier" in content
    assert "witness localVoterSecret" in content
    assert "export ledger nullifiers" in content
    
    manifest_file = Path("/app/managed/private_vote/compiler/contract-manifest.json")
    assert manifest_file.exists(), "Managed contract manifest missing"
    
    info_file = Path("/app/managed/private_vote/compiler/contract-info.json")
    assert info_file.exists(), "Managed contract info missing"
    
    prover_key = Path("/app/managed/private_vote/keys/private_vote.prover")
    assert prover_key.exists(), "SNARK prover key missing"
    
    verifier_key = Path("/app/managed/private_vote/keys/private_vote.verifier")
    assert verifier_key.exists(), "SNARK verifier key missing"

def test_nullifier_and_commitment_crypimport sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
import pytest
import requests
import os
import hashlibtography():
    """Verify cryptographic nullifier derivation and collision isolation."""
    from server import compute_nullifier, compute_vote_commitment, generate_mock_snark_proof
    
    sk1 = "voter_secret_alice_999"
    sk2 = "voter_secret_bob_888"
    prop = "prop-mid-001"
    
    # Determinism: same voter + same proposal -> same nullifier
    n1 = compute_nullifier(sk1, prop)
    n1_again = compute_nullifier(sk1, prop)
    assert n1 == n1_again
    assert n1.startswith("0x")
    assert len(n1) == 66  # 32 bytes in hex with 0x prefix
    
    # Isolation: different voter -> different nullifier
    n2 = compute_nullifier(sk2, prop)
    assert n1 != n2
    
    # Ballot choice blinding: different blinding salt -> different commitment
    c1 = compute_vote_commitment(1, "salt_1")
    c2 = compute_vote_commitment(1, "salt_2")
    assert c1 != c2
    
    # SNARK proof generation verification
    proof = generate_mock_snark_proof(n1, c1, prop)
    assert proof["circuit_name"] == "castPrivateVote"
    assert proof["constraints_verified"] == 3840
    assert proof["curve"] == "BN254"
    assert len(proof["public_signals"]) == 3

def test_deployed_preprod_contract_address():
    """Verify contract address satisfies Midnight Preprod format."""
    from server import CONTRACT_ADDRESS, NETWORK_NAME
    assert CONTRACT_ADDRESS.startswith("0200")
    assert len(CONTRACT_ADDRESS) == 66
    assert "Midnight Preprod" in NETWORK_NAME