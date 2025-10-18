// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { Script, console } from "forge-std/Script.sol";
import { BuilderNFT } from "../contracts/BuilderNFT.sol";
import { BuilderStaking } from "../contracts/BuilderStaking.sol";
import { BuilderGovernance } from "../contracts/BuilderGovernance.sol";

/**
 * @title DeployNewContracts
 * @dev Deployment script for new BuildProof contracts to Base Sepolia
 */
contract DeployNewContracts is Script {
    function run() external {
        // Get the private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("=== BuildProof New Contracts Deployment ===");
        console.log("Deploying to:", block.chainid == 84532 ? "Base Sepolia" : "Unknown Network");
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

        // Fund staking contract with initial rewards (0.1 ETH)
        console.log("Funding staking contract with initial rewards...");
        staking.fundRewards{ value: 0.1 ether }();
        console.log("Funded with 0.1 ETH");
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

        // Log verification commands
        console.log("=== Verification Commands ===");
        console.log(
            "forge verify-contract",
            address(nft),
            "contracts/BuilderNFT.sol:BuilderNFT",
            "--chain base-sepolia --watch"
        );
        console.log(
            "forge verify-contract",
            address(staking),
            "contracts/BuilderStaking.sol:BuilderStaking",
            "--chain base-sepolia --watch"
        );
        console.log(
            "forge verify-contract",
            address(governance),
            "contracts/BuilderGovernance.sol:BuilderGovernance",
            "--chain base-sepolia --watch"
        );
    }
}
