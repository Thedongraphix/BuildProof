// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { Script, console } from "forge-std/Script.sol";
import { BuilderEscrow } from "../contracts/BuilderEscrow.sol";

contract DeployBuilderEscrow is Script {
    function run() external returns (BuilderEscrow) {
        vm.startBroadcast();

        BuilderEscrow builderEscrow = new BuilderEscrow();

        console.log("BuilderEscrow deployed at:", address(builderEscrow));
        console.log("Total escrows:", builderEscrow.totalEscrows());
        console.log("Owner:", builderEscrow.owner());

        vm.stopBroadcast();

        return builderEscrow;
    }
}
