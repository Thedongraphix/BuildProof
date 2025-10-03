// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { Script } from "@forge-std/Script.sol";
import { console } from "@forge-std/console.sol";
import { Counter } from "../contracts/Counter.sol";

/**
 * @title DeployCelo
 * @notice Deployment script for Celo Sepolia testnet
 * @dev Run with: forge script script/DeployCelo.s.sol --rpc-url celo-sepolia --broadcast
 */
contract DeployCelo is Script {
    function run() external {
        // Get deployer private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Deploy Counter contract
        Counter counter = new Counter();

        console.log("========================================");
        console.log("Celo Sepolia Deployment Complete");
        console.log("========================================");
        console.log("Counter deployed to:", address(counter));
        console.log("Network: Celo Sepolia Testnet");
        console.log("Chain ID: 11142220");
        console.log("========================================");
        console.log("");
        console.log("Next steps:");
        console.log("1. View contract on Blockscout:");
        console.log("   Visit: https://celo-sepolia.blockscout.com/address/%s", address(counter));
        console.log("");
        console.log("2. Get testnet CELO:");
        console.log("   Faucet 1: https://faucet.celo.org/celo-sepolia");
        console.log("   Faucet 2: https://cloud.google.com/application/web3/faucet/celo/sepolia");
        console.log("");
        console.log("3. Interact with contract:");
        console.log("   cast call %s \"number()\" --rpc-url celo-sepolia", address(counter));
        console.log("========================================");

        vm.stopBroadcast();
    }
}
