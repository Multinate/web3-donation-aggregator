// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

interface IDonate {
    function donate(uint256 _campaignId, uint256 _amount) external;
}
