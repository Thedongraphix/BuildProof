// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { Test, console } from "forge-std/Test.sol";
import { BuilderTeams } from "../contracts/BuilderTeams.sol";

contract BuilderTeamsTest is Test {
    BuilderTeams public builderTeams;

    address public owner = address(1);
    address public alice = address(2);
    address public bob = address(3);
    address public charlie = address(4);

    function setUp() public {
        vm.prank(owner);
        builderTeams = new BuilderTeams();

        vm.deal(owner, 100 ether);
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
        vm.deal(charlie, 100 ether);
    }

    function test_CreateTeam() public {
        address[] memory members = new address[](2);
        members[0] = alice;
        members[1] = bob;

        uint256[] memory shares = new uint256[](2);
        shares[0] = 6000; // 60%
        shares[1] = 4000; // 40%

        vm.prank(alice);
        uint256 teamId = builderTeams.createTeam("DevSquad", members, shares);

        assertEq(teamId, 0);
        assertEq(builderTeams.totalTeams(), 1);

        BuilderTeams.TeamInfo memory teamInfo = builderTeams.getTeamInfo(teamId);
        assertEq(teamInfo.name, "DevSquad");
        assertEq(teamInfo.creator, alice);
        assertEq(teamInfo.members.length, 2);
        assertEq(teamInfo.totalShares, 10_000);
        assertTrue(teamInfo.isActive);
    }

    function test_RevertWhen_CreateTeamWithInvalidShares() public {
        address[] memory members = new address[](2);
        members[0] = alice;
        members[1] = bob;

        uint256[] memory shares = new uint256[](2);
        shares[0] = 5000; // 50%
        shares[1] = 3000; // 30% - Total is 80%, not 100%

        vm.prank(alice);
        vm.expectRevert();
        builderTeams.createTeam("DevSquad", members, shares);
    }

    function test_RevertWhen_CreateTeamWithEmptyName() public {
        address[] memory members = new address[](1);
        members[0] = alice;

        uint256[] memory shares = new uint256[](1);
        shares[0] = 10_000;

        vm.prank(alice);
        vm.expectRevert();
        builderTeams.createTeam("", members, shares);
    }

    function test_RevertWhen_CreateTeamWithDuplicateMembers() public {
        address[] memory members = new address[](2);
        members[0] = alice;
        members[1] = alice; // Duplicate

        uint256[] memory shares = new uint256[](2);
        shares[0] = 5000;
        shares[1] = 5000;

        vm.prank(alice);
        vm.expectRevert();
        builderTeams.createTeam("DevSquad", members, shares);
    }

    function test_AddMember() public {
        // Create team
        address[] memory members = new address[](1);
        members[0] = alice;

        uint256[] memory shares = new uint256[](1);
        shares[0] = 10_000;

        vm.prank(alice);
        uint256 teamId = builderTeams.createTeam("DevSquad", members, shares);

        // Add member
        vm.prank(alice);
        builderTeams.addMember(teamId, bob, 5000);

        BuilderTeams.TeamInfo memory teamInfo = builderTeams.getTeamInfo(teamId);
        assertEq(teamInfo.members.length, 2);
        assertEq(teamInfo.totalShares, 15_000);
        assertTrue(builderTeams.isMember(teamId, bob));
    }

    function test_RevertWhen_NonCreatorAddsMember() public {
        // Create team
        address[] memory members = new address[](1);
        members[0] = alice;

        uint256[] memory shares = new uint256[](1);
        shares[0] = 10_000;

        vm.prank(alice);
        uint256 teamId = builderTeams.createTeam("DevSquad", members, shares);

        // Try to add member as non-creator
        vm.prank(bob);
        vm.expectRevert();
        builderTeams.addMember(teamId, charlie, 5000);
    }

    function test_RemoveMember() public {
        // Create team with 2 members
        address[] memory members = new address[](2);
        members[0] = alice;
        members[1] = bob;

        uint256[] memory shares = new uint256[](2);
        shares[0] = 6000;
        shares[1] = 4000;

        vm.prank(alice);
        uint256 teamId = builderTeams.createTeam("DevSquad", members, shares);

        // Remove member
        vm.prank(alice);
        builderTeams.removeMember(teamId, bob);

        BuilderTeams.TeamInfo memory teamInfo = builderTeams.getTeamInfo(teamId);
        assertEq(teamInfo.members.length, 1);
        assertEq(teamInfo.totalShares, 6000);
        assertFalse(builderTeams.isMember(teamId, bob));
    }

    function test_RevertWhen_RemovingCreator() public {
        address[] memory members = new address[](2);
        members[0] = alice;
        members[1] = bob;

        uint256[] memory shares = new uint256[](2);
        shares[0] = 6000;
        shares[1] = 4000;

        vm.prank(alice);
        uint256 teamId = builderTeams.createTeam("DevSquad", members, shares);

        vm.prank(alice);
        vm.expectRevert();
        builderTeams.removeMember(teamId, alice);
    }

    function test_UpdateMemberShare() public {
        address[] memory members = new address[](2);
        members[0] = alice;
        members[1] = bob;

        uint256[] memory shares = new uint256[](2);
        shares[0] = 6000;
        shares[1] = 4000;

        vm.prank(alice);
        uint256 teamId = builderTeams.createTeam("DevSquad", members, shares);

        // Update bob's share
        vm.prank(alice);
        builderTeams.updateMemberShare(teamId, bob, 5000);

        assertEq(builderTeams.getMemberShare(teamId, bob), 5000);
        BuilderTeams.TeamInfo memory teamInfo = builderTeams.getTeamInfo(teamId);
        assertEq(teamInfo.totalShares, 11_000);
    }

    function test_DistributeReward() public {
        address[] memory members = new address[](2);
        members[0] = alice;
        members[1] = bob;

        uint256[] memory shares = new uint256[](2);
        shares[0] = 6000; // 60%
        shares[1] = 4000; // 40%

        vm.prank(alice);
        uint256 teamId = builderTeams.createTeam("DevSquad", members, shares);

        uint256 aliceBalanceBefore = alice.balance;
        uint256 bobBalanceBefore = bob.balance;

        // Distribute 10 ETH reward
        vm.prank(charlie);
        builderTeams.distributeReward{ value: 10 ether }(teamId);

        uint256 aliceBalanceAfter = alice.balance;
        uint256 bobBalanceAfter = bob.balance;

        // Alice should get 6 ETH (60%)
        assertEq(aliceBalanceAfter - aliceBalanceBefore, 6 ether);
        // Bob should get 4 ETH (40%)
        assertEq(bobBalanceAfter - bobBalanceBefore, 4 ether);

        BuilderTeams.TeamInfo memory teamInfo = builderTeams.getTeamInfo(teamId);
        assertEq(teamInfo.totalEarnings, 10 ether);
        assertEq(teamInfo.completedBounties, 1);
    }

    function test_RevertWhen_DistributeZeroReward() public {
        address[] memory members = new address[](1);
        members[0] = alice;

        uint256[] memory shares = new uint256[](1);
        shares[0] = 10_000;

        vm.prank(alice);
        uint256 teamId = builderTeams.createTeam("DevSquad", members, shares);

        vm.prank(bob);
        vm.expectRevert();
        builderTeams.distributeReward{ value: 0 }(teamId);
    }

    function test_RecordBountyCompletion() public {
        address[] memory members = new address[](1);
        members[0] = alice;

        uint256[] memory shares = new uint256[](1);
        shares[0] = 10_000;

        vm.prank(alice);
        uint256 teamId = builderTeams.createTeam("DevSquad", members, shares);

        vm.prank(alice);
        builderTeams.recordBountyCompletion(teamId, 5 ether);

        BuilderTeams.TeamInfo memory teamInfo = builderTeams.getTeamInfo(teamId);
        assertEq(teamInfo.completedBounties, 1);
        assertEq(teamInfo.totalEarnings, 5 ether);
    }

    function test_DeactivateTeam() public {
        address[] memory members = new address[](1);
        members[0] = alice;

        uint256[] memory shares = new uint256[](1);
        shares[0] = 10_000;

        vm.prank(alice);
        uint256 teamId = builderTeams.createTeam("DevSquad", members, shares);

        vm.prank(alice);
        builderTeams.deactivateTeam(teamId);

        BuilderTeams.TeamInfo memory teamInfo = builderTeams.getTeamInfo(teamId);
        assertFalse(teamInfo.isActive);
    }

    function test_RevertWhen_NonCreatorDeactivatesTeam() public {
        address[] memory members = new address[](1);
        members[0] = alice;

        uint256[] memory shares = new uint256[](1);
        shares[0] = 10_000;

        vm.prank(alice);
        uint256 teamId = builderTeams.createTeam("DevSquad", members, shares);

        vm.prank(bob);
        vm.expectRevert();
        builderTeams.deactivateTeam(teamId);
    }

    function test_GetMemberShares() public {
        address[] memory members = new address[](3);
        members[0] = alice;
        members[1] = bob;
        members[2] = charlie;

        uint256[] memory shares = new uint256[](3);
        shares[0] = 5000;
        shares[1] = 3000;
        shares[2] = 2000;

        vm.prank(alice);
        uint256 teamId = builderTeams.createTeam("DevSquad", members, shares);

        BuilderTeams.MemberShare[] memory memberShares = builderTeams.getMemberShares(teamId);

        assertEq(memberShares.length, 3);
        assertEq(memberShares[0].member, alice);
        assertEq(memberShares[0].share, 5000);
        assertEq(memberShares[1].member, bob);
        assertEq(memberShares[1].share, 3000);
        assertEq(memberShares[2].member, charlie);
        assertEq(memberShares[2].share, 2000);
    }

    function test_GetMemberTeams() public {
        address[] memory members1 = new address[](2);
        members1[0] = alice;
        members1[1] = bob;

        uint256[] memory shares1 = new uint256[](2);
        shares1[0] = 6000;
        shares1[1] = 4000;

        vm.prank(alice);
        uint256 team1 = builderTeams.createTeam("DevSquad", members1, shares1);

        address[] memory members2 = new address[](2);
        members2[0] = bob;
        members2[1] = charlie;

        uint256[] memory shares2 = new uint256[](2);
        shares2[0] = 5000;
        shares2[1] = 5000;

        vm.prank(bob);
        uint256 team2 = builderTeams.createTeam("CodeNinjas", members2, shares2);

        uint256[] memory bobTeams = builderTeams.getMemberTeams(bob);
        assertEq(bobTeams.length, 2);
        assertEq(bobTeams[0], team1);
        assertEq(bobTeams[1], team2);
    }

    function test_GetCreatedTeams() public {
        address[] memory members = new address[](1);
        members[0] = alice;

        uint256[] memory shares = new uint256[](1);
        shares[0] = 10_000;

        vm.prank(alice);
        uint256 team1 = builderTeams.createTeam("DevSquad", members, shares);

        vm.prank(alice);
        uint256 team2 = builderTeams.createTeam("CodeNinjas", members, shares);

        uint256[] memory aliceTeams = builderTeams.getCreatedTeams(alice);
        assertEq(aliceTeams.length, 2);
        assertEq(aliceTeams[0], team1);
        assertEq(aliceTeams[1], team2);
    }
}
