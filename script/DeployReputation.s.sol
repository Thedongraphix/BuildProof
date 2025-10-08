// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { Script } from "@forge-std/Script.sol";
import { console } from "@forge-std/console.sol";
import { BuilderReputation } from "../contracts/BuilderReputation.sol";

/**
 * @title DeployReputation
 * @notice Deployment script for BuilderReputation contract
 * @dev Run with: forge script script/DeployReputation.s.sol --rpc-url <network> --broadcast
 * --verify
 */
contract DeployReputation is Script {
    function run() external {
        // Get deployer private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Deploy BuilderReputation contract
        BuilderReputation reputation = new BuilderReputation();

        console.log("========================================");
        console.log("BuilderReputation Deployment Complete");
        console.log("========================================");
        console.log("BuilderReputation deployed to:", address(reputation));
        console.log("Owner:", reputation.owner());
        console.log("Total Builders:", reputation.totalBuilders());
        console.log("========================================");

        vm.stopBroadcast();
    }
}
