// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/governance/TimelockController.sol";

/**
 * @title BuilderTimelock
 * @dev Timelock controller for BuildProof governance
 * @notice Adds time delay to governance decisions for security
 */
contract BuilderTimelock is TimelockController {
    /**
     * @dev Constructor initializes the timelock
     * @param minDelay Minimum delay before executing a proposal (in seconds)
     * @param proposers List of addresses that can propose
     * @param executors List of addresses that can execute
     * @param admin Admin address (can be zero address for decentralization)
     */
    constructor(
        uint256 minDelay,
        address[] memory proposers,
        address[] memory executors,
        address admin
    )
        TimelockController(minDelay, proposers, executors, admin)
    { }
}
