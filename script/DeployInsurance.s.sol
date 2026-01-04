// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { Script, console } from "forge-std/Script.sol";
import { BuilderInsurance } from "../contracts/BuilderInsurance.sol";

/**
 * @title DeployInsurance
 * @dev Deployment script for BuilderInsurance to Base Sepolia
 */
contract DeployInsurance is Script {
    function run() external returns (BuilderInsurance) {
        // Get the private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("=== BuilderInsurance Deployment to Base Sepolia ===");
        console.log("Deployer address:", deployer);
        console.log("Deployer balance:", deployer.balance);
        console.log("Chain ID:", block.chainid);

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Deploy BuilderInsurance
        BuilderInsurance insurance = new BuilderInsurance();

        console.log("\n=== Deployment Successful ===");
        console.log("BuilderInsurance deployed at:", address(insurance));
        console.log("Owner:", insurance.owner());
        console.log("Block number:", block.number);

        // Stop broadcasting
        vm.stopBroadcast();

        // Log deployment information for frontend integration
        console.log("\n=== Integration Information ===");
        console.log("Add this to your .env file:");
        console.log("NEXT_PUBLIC_BUILDER_INSURANCE_ADDRESS=", address(insurance));

        console.log("\n=== Verification Command ===");
        console.log(
            "forge verify-contract",
            address(insurance),
            "contracts/BuilderInsurance.sol:BuilderInsurance",
            "--chain base-sepolia"
        );

        return insurance;
    }
}
