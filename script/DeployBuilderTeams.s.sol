// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { Script, console } from "forge-std/Script.sol";
import { BuilderTeams } from "../contracts/BuilderTeams.sol";

contract DeployBuilderTeams is Script {
    function run() external returns (BuilderTeams) {
        vm.startBroadcast();

        BuilderTeams builderTeams = new BuilderTeams();

        console.log("BuilderTeams deployed at:", address(builderTeams));
        console.log("Total teams:", builderTeams.totalTeams());

        vm.stopBroadcast();

        return builderTeams;
    }
}
