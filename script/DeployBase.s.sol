// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {ContractRegistry} from "../contracts/ContractRegistry.sol";

/**
 * @title DeployBase
 * @dev Deployment script for Base Sepolia testnet
 */
contract DeployBase is Script {
    function run() external {
        // Get the private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Deploy ContractRegistry
        ContractRegistry registry = new ContractRegistry();

        console.log("=== BuildProof Deployment to Base Sepolia ===");
        console.log("ContractRegistry deployed at:", address(registry));
        console.log("Deployer address:", vm.addr(deployerPrivateKey));
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