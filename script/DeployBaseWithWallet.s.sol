// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { Script, console } from "forge-std/Script.sol";
import { ContractRegistry } from "../contracts/ContractRegistry.sol";

/**
 * @title DeployBaseWithWallet
 * @dev Alternative deployment script for Base Sepolia testnet using wallet
 */
contract DeployBaseWithWallet is Script {
    function run() external {
        // Start broadcasting transactions (will use the provided private key from CLI)
        vm.startBroadcast();

        // Deploy ContractRegistry
        ContractRegistry registry = new ContractRegistry();

        console.log("=== BuildProof Deployment to Base Sepolia ===");
        console.log("ContractRegistry deployed at:", address(registry));
        console.log("Deployer address:", msg.sender);
        console.log("Chain ID:", block.chainid);
        console.log("Block number:", block.number);

        // Stop broadcasting
        vm.stopBroadcast();

        // Log deployment information for frontend integration
        console.log("\n=== Integration Information ===");
        console.log("Add this to your .env file:");
        console.log("NEXT_PUBLIC_CONTRACT_REGISTRY_ADDRESS=", address(registry));
        console.log("NEXT_PUBLIC_BASE_SEPOLIA_CHAIN_ID=84532");
    }
}
