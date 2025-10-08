// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { Test } from "@forge-std/Test.sol";
import { console } from "@forge-std/console.sol";
import { BuilderReputation } from "../contracts/BuilderReputation.sol";

contract BuilderReputationTest is Test {
    BuilderReputation public reputation;
    address public owner;
    address public builder1;
    address public builder2;
    address public issuer;

    event BuilderRegistered(address indexed builder, string username, uint256 timestamp);
    event SkillAdded(address indexed builder, string skill);
    event SkillEndorsed(address indexed builder, address indexed endorser, string skill);

    function setUp() public {
        owner = address(this);
        builder1 = makeAddr("builder1");
        builder2 = makeAddr("builder2");
        issuer = makeAddr("issuer");

        reputation = new BuilderReputation();
    }

    function test_RegisterBuilder() public {
        vm.startPrank(builder1);

        vm.expectEmit(true, false, false, true);
        emit BuilderRegistered(builder1, "alice_dev", block.timestamp);

        reputation.registerBuilder("alice_dev");

        BuilderReputation.BuilderProfile memory profile = reputation.getBuilderProfile(builder1);

        assertEq(profile.builder, builder1);
        assertEq(profile.username, "alice_dev");
        assertEq(profile.reputationScore, 0);
        assertEq(profile.completedProjects, 0);
        assertTrue(profile.isActive);

        vm.stopPrank();
    }

    function test_AddSkill() public {
        vm.startPrank(builder1);
        reputation.registerBuilder("alice_dev");

        vm.expectEmit(true, false, false, true);
        emit SkillAdded(builder1, "Solidity");

        reputation.addSkill("Solidity");

        string[] memory skills = reputation.getBuilderSkills(builder1);
        assertEq(skills.length, 1);
        assertEq(skills[0], "Solidity");

        vm.stopPrank();
    }

    function test_EndorseSkill() public {
        // Register both builders
        vm.prank(builder1);
        reputation.registerBuilder("alice_dev");

        vm.prank(builder2);
        reputation.registerBuilder("bob_dev");

        // Builder1 adds skill
        vm.prank(builder1);
        reputation.addSkill("Solidity");

        // Builder2 endorses Builder1's skill
        vm.startPrank(builder2);

        vm.expectEmit(true, true, false, true);
        emit SkillEndorsed(builder1, builder2, "Solidity");

        reputation.endorseSkill(builder1, "Solidity");

        uint256 endorsements = reputation.getSkillEndorsements(builder1, "Solidity");
        assertEq(endorsements, 1);
        assertTrue(reputation.hasEndorsed(builder1, "Solidity", builder2));

        vm.stopPrank();
    }

    function test_AwardAchievement() public {
        vm.prank(builder1);
        reputation.registerBuilder("alice_dev");

        // Authorize issuer
        reputation.authorizeIssuer(issuer);

        // Award achievement
        vm.prank(issuer);
        reputation.awardAchievement(
            builder1, "First Smart Contract", "Deployed first verified contract"
        );

        BuilderReputation.Achievement[] memory achievements =
            reputation.getBuilderAchievements(builder1);

        assertEq(achievements.length, 1);
        assertEq(achievements[0].title, "First Smart Contract");
        assertEq(achievements[0].issuer, issuer);
    }

    function test_RecordProjectCompletion() public {
        vm.prank(builder1);
        reputation.registerBuilder("alice_dev");

        // Authorize issuer
        reputation.authorizeIssuer(issuer);

        // Record project completion
        vm.prank(issuer);
        reputation.recordProjectCompletion(builder1, 5 ether, 100);

        BuilderReputation.BuilderProfile memory profile = reputation.getBuilderProfile(builder1);

        assertEq(profile.completedProjects, 1);
        assertEq(profile.totalEarnings, 5 ether);
        assertEq(profile.reputationScore, 100);
    }

    function test_UpdateUsername() public {
        vm.startPrank(builder1);

        reputation.registerBuilder("alice_dev");
        reputation.updateUsername("alice_builder");

        BuilderReputation.BuilderProfile memory profile = reputation.getBuilderProfile(builder1);
        assertEq(profile.username, "alice_builder");

        vm.stopPrank();
    }

    function test_DeactivateProfile() public {
        vm.startPrank(builder1);

        reputation.registerBuilder("alice_dev");
        reputation.deactivateProfile();

        BuilderReputation.BuilderProfile memory profile = reputation.getBuilderProfile(builder1);
        assertFalse(profile.isActive);

        vm.stopPrank();
    }

    function test_RevertWhen_RegisterTwice() public {
        vm.startPrank(builder1);
        reputation.registerBuilder("alice_dev");
        vm.expectRevert(bytes("Builder already registered"));
        reputation.registerBuilder("alice_dev2");
        vm.stopPrank();
    }

    function test_RevertWhen_EndorseOwnSkill() public {
        vm.startPrank(builder1);
        reputation.registerBuilder("alice_dev");
        reputation.addSkill("Solidity");
        vm.expectRevert(bytes("Cannot endorse own skills"));
        reputation.endorseSkill(builder1, "Solidity");
        vm.stopPrank();
    }

    function test_RevertWhen_AwardAchievementUnauthorized() public {
        vm.prank(builder1);
        reputation.registerBuilder("alice_dev");

        vm.prank(builder2);
        vm.expectRevert(bytes("Not authorized to issue achievements"));
        reputation.awardAchievement(builder1, "Fake Achievement", "This should fail");
    }
}
