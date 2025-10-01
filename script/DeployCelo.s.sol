// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script} from "@forge-std/Script.sol";
import {console} from "@forge-std/console.sol";
import {Counter} from "../contracts/Counter.sol";

/**
 * @title DeployCelo
 * @notice Deployment script for Celo Alfajores testnet
 * @dev Run with: forge script script/DeployCelo.s.sol --rpc-url celo_alfajores --broadcast --verify
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
        console.log("Celo Alfajores Deployment Complete");
        console.log("========================================");
        console.log("Counter deployed to:", address(counter));
        console.log("Network: Celo Alfajores Testnet");
        console.log("Chain ID: 44787");
        console.log("========================================");
        console.log("");
        console.log("Next steps:");
        console.log("1. Verify contract on Celoscan:");
        console.log("   Visit: https://alfajores.celoscan.io/address/%s", address(counter));
        console.log("");
        console.log("2. Get testnet CELO:");
        console.log("   Visit: https://faucet.celo.org/alfajores");
        console.log("");
        console.log("3. Interact with contract:");
        console.log("   cast call %s \"number()\" --rpc-url celo_alfajores", address(counter));
        console.log("========================================");

        vm.stopBroadcast();
    }
}
