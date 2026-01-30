// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { Script, console } from "forge-std/Script.sol";
import { BuilderVault } from "../contracts/BuilderVault.sol";

/**
 * @title DeployVault
 * @dev Deployment script for BuilderVault to Base Sepolia
 */
contract DeployVault is Script {
    function run() external returns (BuilderVault) {
        // Get the private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("=== BuilderVault Deployment to Base Sepolia ===");
        console.log("Deployer address:", deployer);
        console.log("Deployer balance:", deployer.balance);
        console.log("Chain ID:", block.chainid);

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Deploy BuilderVault
        BuilderVault vaultContract = new BuilderVault();

        console.log("\n=== Deployment Successful ===");
        console.log("BuilderVault deployed at:", address(vaultContract));
        console.log("Owner:", vaultContract.owner());
        console.log("Block number:", block.number);

        // Stop broadcasting
        vm.stopBroadcast();

        // Log deployment information
        console.log("\n=== Integration Information ===");
        console.log("Add this to your .env file:");
        console.log("NEXT_PUBLIC_BUILDER_VAULT_ADDRESS=", address(vaultContract));

        console.log("\n=== Verification Command ===");
        console.log(
            "forge verify-contract",
            address(vaultContract),
            "contracts/BuilderVault.sol:BuilderVault",
            "--chain base-sepolia"
        );

        return vaultContract;
    }
}
