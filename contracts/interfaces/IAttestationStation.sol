// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

interface IAttestationStation {
    function attestations(address creator, address about, bytes32 key) external view returns (bytes memory);
}
