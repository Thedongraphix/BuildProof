// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { Script } from "@forge-std/Script.sol";
import { console } from "@forge-std/console.sol";
import { BuilderBounty } from "../contracts/BuilderBounty.sol";

/**
 * @title DeployBounty
 * @notice Deployment script for BuilderBounty contract
 * @dev Run with: forge script script/DeployBounty.s.sol --rpc-url <network> --broadcast --verify
 */
contract DeployBounty is Script {
    function run() external {
        // Get deployer private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Deploy BuilderBounty contract
        BuilderBounty bounty = new BuilderBounty();

        console.log("========================================");
        console.log("BuilderBounty Deployment Complete");
        console.log("========================================");
        console.log("BuilderBounty deployed to:", address(bounty));
        console.log("Owner:", bounty.owner());
        console.log("Platform Fee:", bounty.platformFee(), "basis points");
        console.log("========================================");

        vm.stopBroadcast();
    }
}
