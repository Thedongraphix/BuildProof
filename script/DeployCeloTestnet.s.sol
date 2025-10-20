// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { Script, console } from "forge-std/Script.sol";
import { BuilderNFT } from "../contracts/BuilderNFT.sol";
import { BuilderStaking } from "../contracts/BuilderStaking.sol";
import { BuilderGovernance } from "../contracts/BuilderGovernance.sol";

/**
 * @title DeployCeloTestnet
 * @dev Deployment script for new BuildProof contracts to Celo Testnet (Alfajores)
 */
contract DeployCeloTestnet is Script {
    function run() external {
        // Get the private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("=== BuildProof Deployment to Celo Testnet (Alfajores) ===");
        console.log("Deploying to:", block.chainid == 44787 ? "Celo Alfajores" : "Unknown Network");
        console.log("Deployer address:", deployer);
        console.log("Chain ID:", block.chainid);
        console.log("Block number:", block.number);
        console.log("");

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Deploy BuilderNFT
        console.log("Deploying BuilderNFT...");
        BuilderNFT nft = new BuilderNFT();
        console.log("BuilderNFT deployed at:", address(nft));
        console.log("");

        // Deploy BuilderStaking
        console.log("Deploying BuilderStaking...");
        BuilderStaking staking = new BuilderStaking();
        console.log("BuilderStaking deployed at:", address(staking));
        console.log("");

        // Note: Skip initial funding if wallet has insufficient balance
        // You can fund the staking contract later using the fundRewards() function
        console.log("Note: Staking contract can be funded later with fundRewards()");
        console.log("");

        // Deploy BuilderGovernance
        console.log("Deploying BuilderGovernance...");
        BuilderGovernance governance = new BuilderGovernance();
        console.log("BuilderGovernance deployed at:", address(governance));
        console.log("");

        // Stop broadcasting
        vm.stopBroadcast();

        // Log deployment summary
        console.log("=== Deployment Summary ===");
        console.log("BuilderNFT:", address(nft));
        console.log("BuilderStaking:", address(staking));
        console.log("BuilderGovernance:", address(governance));
        console.log("");

        // Log integration information
        console.log("=== Integration Information ===");
        console.log("Add these to your .env file:");
        console.log("NEXT_PUBLIC_CELO_BUILDER_NFT_ADDRESS=", address(nft));
        console.log("NEXT_PUBLIC_CELO_BUILDER_STAKING_ADDRESS=", address(staking));
        console.log("NEXT_PUBLIC_CELO_BUILDER_GOVERNANCE_ADDRESS=", address(governance));
        console.log("");

        // Log verification commands (if API key is available)
        console.log("=== Manual Verification Commands ===");
        console.log(
            "forge verify-contract",
            address(nft),
            "contracts/BuilderNFT.sol:BuilderNFT",
            "--chain celo_sepolia --watch"
        );
        console.log(
            "forge verify-contract",
            address(staking),
            "contracts/BuilderStaking.sol:BuilderStaking",
            "--chain celo_sepolia --watch"
        );
        console.log(
            "forge verify-contract",
            address(governance),
            "contracts/BuilderGovernance.sol:BuilderGovernance",
            "--chain celo_sepolia --watch"
        );
    }
}
