// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { Script, console } from "forge-std/Script.sol";
import { RewardToken } from "../contracts/RewardToken.sol";
import { StakingPool } from "../contracts/StakingPool.sol";

/**
 * @title DeployStaking
 * @dev Deployment script for Staking contracts to Base Sepolia
 */
contract DeployStaking is Script {
    function run() external {
        // Get the private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("=== BuildProof Staking Deployment to Base Sepolia ===");
        console.log("Network:", "Base Sepolia");
        console.log("Chain ID:", block.chainid);
        console.log("Deployer address:", deployer);
        console.log("Block number:", block.number);
        console.log("");

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Deploy RewardToken (BPT)
        console.log("Deploying RewardToken (BPT)...");
        RewardToken rewardToken = new RewardToken();
        console.log("RewardToken deployed at:", address(rewardToken));
        console.log("Symbol:", rewardToken.symbol());
        console.log("Initial Supply:", rewardToken.totalSupply() / 1e18, "tokens");
        console.log("");

        // Deploy StakingPool
        console.log("Deploying StakingPool...");
        StakingPool stakingPool = new StakingPool(address(rewardToken));
        console.log("StakingPool deployed at:", address(stakingPool));
        console.log("");

        // Fund staking pool with initial rewards (10 million tokens)
        uint256 rewardAmount = 10_000_000 * 1e18;
        console.log("Funding StakingPool with rewards...");
        rewardToken.transfer(address(stakingPool), rewardAmount);
        console.log("Transferred", rewardAmount / 1e18, "BPT to StakingPool");
        console.log("");

        // Add staking pool as minter
        console.log("Adding StakingPool as authorized minter...");
        rewardToken.addMinter(address(stakingPool));
        console.log("StakingPool is now authorized to mint rewards");
        console.log("");

        // Stop broadcasting
        vm.stopBroadcast();

        // Log deployment summary
        console.log("=== Deployment Summary ===");
        console.log("RewardToken (BPT):", address(rewardToken));
        console.log("StakingPool:", address(stakingPool));
        console.log("");

        // Log integration information
        console.log("=== Integration Information ===");
        console.log("Add these to your .env file:");
        console.log("NEXT_PUBLIC_REWARD_TOKEN_ADDRESS=", address(rewardToken));
        console.log("NEXT_PUBLIC_STAKING_POOL_ADDRESS=", address(stakingPool));
        console.log("");

        // Log verification commands
        console.log("=== Verification Commands ===");
        console.log("Verify RewardToken:");
        console.log(
            "forge verify-contract",
            address(rewardToken),
            "contracts/RewardToken.sol:RewardToken",
            "--chain base-sepolia --watch"
        );
        console.log("");
        console.log("Verify StakingPool:");
        console.log(
            "forge verify-contract",
            address(stakingPool),
            "contracts/StakingPool.sol:StakingPool",
            "--chain base-sepolia --constructor-args $(cast abi-encode 'constructor(address)' ",
            address(rewardToken),
            ") --watch"
        );
        console.log("");

        // Log staking configuration
        console.log("=== Staking Configuration ===");
        console.log("Available Lock Periods:");
        console.log("- 30 days: 12% APY");
        console.log("- 90 days: 18% APY");
        console.log("- 180 days: 25% APY");
        console.log("- 365 days: 35% APY");
        console.log("Early Withdrawal Penalty: 10%");
    }
}
