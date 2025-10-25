// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "../contracts/BuildProofToken.sol";
import "../contracts/BuilderLiquidityPool.sol";
import "../contracts/BuilderTimelock.sol";

/**
 * @title DeployNewDeFi
 * @dev Deployment script for new DeFi contracts on Base Sepolia
 */
contract DeployNewDeFi is Script {
    // Deployment configuration
    uint256 constant INITIAL_TOKEN_SUPPLY = 100_000_000 * 10 ** 18; // 100M tokens
    uint256 constant TIMELOCK_MIN_DELAY = 2 days;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("====================================");
        console.log("Deploying New DeFi Contracts to Base Sepolia");
        console.log("====================================");
        console.log("Deployer:", deployer);
        console.log("Chain ID:", block.chainid);
        console.log("");

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy BuildProofToken
        console.log("1. Deploying BuildProofToken...");
        BuildProofToken token = new BuildProofToken(INITIAL_TOKEN_SUPPLY);
        console.log("   BuildProofToken deployed at:", address(token));
        console.log("   Initial supply:", INITIAL_TOKEN_SUPPLY / 10 ** 18, "tokens");
        console.log("");

        // 2. Deploy BuilderLiquidityPool
        console.log("2. Deploying BuilderLiquidityPool...");
        BuilderLiquidityPool pool = new BuilderLiquidityPool(address(token));
        console.log("   BuilderLiquidityPool deployed at:", address(pool));
        console.log("");

        // 3. Deploy BuilderTimelock
        console.log("3. Deploying BuilderTimelock...");
        address[] memory proposers = new address[](1);
        address[] memory executors = new address[](1);
        proposers[0] = deployer;
        executors[0] = deployer;

        BuilderTimelock timelock =
            new BuilderTimelock(TIMELOCK_MIN_DELAY, proposers, executors, deployer);
        console.log("   BuilderTimelock deployed at:", address(timelock));
        console.log("   Min delay:", TIMELOCK_MIN_DELAY / 1 days, "days");
        console.log("");

        vm.stopBroadcast();

        console.log("====================================");
        console.log("Deployment Summary");
        console.log("====================================");
        console.log("BuildProofToken:", address(token));
        console.log("BuilderLiquidityPool:", address(pool));
        console.log("BuilderTimelock:", address(timelock));
        console.log("");
        console.log("Next Steps:");
        console.log("1. Verify contracts on BaseScan");
        console.log("2. Update frontend .env with new addresses");
        console.log("3. Add liquidity to the pool");
        console.log("4. Configure timelock proposers/executors");
        console.log("====================================");
    }
}
