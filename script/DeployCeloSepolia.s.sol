// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { Script, console } from "forge-std/Script.sol";
import { BuilderNFT } from "../contracts/BuilderNFT.sol";
import { BuilderStaking } from "../contracts/BuilderStaking.sol";
import { BuilderGovernance } from "../contracts/BuilderGovernance.sol";

/**
 * @title DeployCeloSepolia
 * @dev Deployment script for BuildProof contracts to Celo Sepolia Testnet
 * @notice Celo Sepolia (Chain ID: 11142220) is the new developer testnet built on Ethereum Sepolia
 */
contract DeployCeloSepolia is Script {
    function run() external {
        // Get the private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("=== BuildProof Deployment to Celo Sepolia Testnet ===");
        console.log("Network:", block.chainid == 11142220 ? "Celo Sepolia" : "Unknown Network");
        console.log("Chain ID:", block.chainid);
        console.log("Deployer address:", deployer);
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
        console.log("NEXT_PUBLIC_CELO_SEPOLIA_BUILDER_NFT_ADDRESS=", address(nft));
        console.log("NEXT_PUBLIC_CELO_SEPOLIA_BUILDER_STAKING_ADDRESS=", address(staking));
        console.log("NEXT_PUBLIC_CELO_SEPOLIA_BUILDER_GOVERNANCE_ADDRESS=", address(governance));
        console.log("");

        // Log verification information
        console.log("=== Contract Verification ===");
        console.log("View contracts on Celo Sepolia Block Explorer:");
        console.log("https://celo-sepolia.blockscout.com/");
        console.log("");
        console.log(
            "BuilderNFT:",
            string.concat(
                "https://celo-sepolia.blockscout.com/address/", _addressToString(address(nft))
            )
        );
        console.log(
            "BuilderStaking:",
            string.concat(
                "https://celo-sepolia.blockscout.com/address/", _addressToString(address(staking))
            )
        );
        console.log(
            "BuilderGovernance:",
            string.concat(
                "https://celo-sepolia.blockscout.com/address/",
                _addressToString(address(governance))
            )
        );
        console.log("");

        // Log faucet information
        console.log("=== Get Testnet Funds ===");
        console.log(
            "Google Cloud Web3 Faucet: https://cloud.google.com/application/web3/faucet/celo/sepolia"
        );
        console.log("Celo Sepolia Self-Serve Faucet: https://faucet.celo.org/celo-sepolia");
    }

    // Helper function to convert address to string
    function _addressToString(address _addr) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(_addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = "0";
        str[1] = "x";
        for (uint256 i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3 + i * 2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }
}
