// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

import "./interfaces/IAttestationStation.sol";

contract Multinate {
    IAttestationStation public attestationStation;

    constructor(address _attestation) {
        attestationStation = IAttestationStation(_attestation);
    }

    function getAttestation(address _creator, address _about, bytes32 _key) public view returns (bytes memory) {
        return attestationStation.attestations(_creator, _about, _key);
    }

    // Check attestation and create a campaign
    function createCampaign(address _creator, address _about, bytes32 _key, bytes memory _val) public {
        bytes memory attestation = getAttestation(_creator, _about, _key);
        require(keccak256(attestation) == keccak256(_val), "Multinate: Attestation does not match");
        // Create campaign
    }
}
