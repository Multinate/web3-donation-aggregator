// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

import "./interfaces/IAttestationStation.sol";

contract Multinate {
    IAttestationStation public attestationStation;
    uint256 public minimumAttestationScore;

    bytes32 constant REGISTRATION_KEY = keccak256("registration");
    bytes32 constant TAX_EXEMPT_STATUS_KEY = keccak256("tax_exempt_status");
    bytes32 constant FINANCIAL_STATEMENTS_KEY = keccak256("financial_statements");
    bytes32 constant MISSION_STATEMENT_KEY = keccak256("mission_statement");

    mapping(address => uint256) public charityScores;

    event CharityEligibilityUpdated(address indexed charity, bool eligible);

    constructor(address _attestationStation, uint256 _minimumAttestationScore) {
        attestationStation = IAttestationStation(_attestationStation);
        minimumAttestationScore = _minimumAttestationScore;
    }

    function setMinimumAttestationScore(uint256 _minimumAttestationScore) external {
        minimumAttestationScore = _minimumAttestationScore;
    }

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
