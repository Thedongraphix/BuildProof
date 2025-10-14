// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { Test } from "forge-std/Test.sol";
import { BuilderEscrow } from "../contracts/BuilderEscrow.sol";

contract BuilderEscrowTest is Test {
    BuilderEscrow public escrow;

    address public owner = address(1);
    address public client = address(2);
    address public builder = address(3);

    function setUp() public {
        vm.prank(owner);
        escrow = new BuilderEscrow();

        vm.deal(client, 100 ether);
        vm.deal(builder, 10 ether);
    }

    function test_CreateEscrow() public {
        string[] memory descriptions = new string[](2);
        descriptions[0] = "Design Phase";
        descriptions[1] = "Development Phase";

        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 1 ether;
        amounts[1] = 2 ether;

        uint256[] memory deadlines = new uint256[](2);
        deadlines[0] = block.timestamp + 7 days;
        deadlines[1] = block.timestamp + 14 days;

        vm.prank(client);
        uint256 escrowId =
            escrow.createEscrow{ value: 3 ether }(builder, "Web App Project", descriptions, amounts, deadlines);

        assertEq(escrowId, 0);
        assertEq(escrow.totalEscrows(), 1);

        BuilderEscrow.EscrowInfo memory info = escrow.getEscrowInfo(escrowId);
        assertEq(info.client, client);
        assertEq(info.builder, builder);
        assertEq(info.projectTitle, "Web App Project");
        assertEq(info.totalAmount, 3 ether);
        assertEq(info.milestoneCount, 2);
    }

    function test_RevertWhen_CreateEscrowWithInvalidBuilder() public {
        string[] memory descriptions = new string[](1);
        descriptions[0] = "Phase 1";

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 1 ether;

        uint256[] memory deadlines = new uint256[](1);
        deadlines[0] = block.timestamp + 7 days;

        vm.prank(client);
        vm.expectRevert();
        escrow.createEscrow{ value: 1 ether }(address(0), "Project", descriptions, amounts, deadlines);
    }

    function test_RevertWhen_CreateEscrowWithSelfAsBuilder() public {
        string[] memory descriptions = new string[](1);
        descriptions[0] = "Phase 1";

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 1 ether;

        uint256[] memory deadlines = new uint256[](1);
        deadlines[0] = block.timestamp + 7 days;

        vm.prank(client);
        vm.expectRevert();
        escrow.createEscrow{ value: 1 ether }(client, "Project", descriptions, amounts, deadlines);
    }

    function test_RevertWhen_CreateEscrowWithWrongValue() public {
        string[] memory descriptions = new string[](1);
        descriptions[0] = "Phase 1";

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 1 ether;

        uint256[] memory deadlines = new uint256[](1);
        deadlines[0] = block.timestamp + 7 days;

        vm.prank(client);
        vm.expectRevert();
        escrow.createEscrow{ value: 0.5 ether }(builder, "Project", descriptions, amounts, deadlines);
    }

    function test_CompleteMilestone() public {
        // Create escrow
        string[] memory descriptions = new string[](1);
        descriptions[0] = "Development";

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 1 ether;

        uint256[] memory deadlines = new uint256[](1);
        deadlines[0] = block.timestamp + 7 days;

        vm.prank(client);
        uint256 escrowId =
            escrow.createEscrow{ value: 1 ether }(builder, "Project", descriptions, amounts, deadlines);

        // Complete milestone
        vm.prank(builder);
        escrow.completeMilestone(escrowId, 0);

        BuilderEscrow.MilestoneInfo memory milestone = escrow.getMilestone(escrowId, 0);
        assertTrue(milestone.completed);
        assertFalse(milestone.approved);
    }

    function test_RevertWhen_NonBuilderCompletesMilestone() public {
        string[] memory descriptions = new string[](1);
        descriptions[0] = "Development";

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 1 ether;

        uint256[] memory deadlines = new uint256[](1);
        deadlines[0] = block.timestamp + 7 days;

        vm.prank(client);
        uint256 escrowId =
            escrow.createEscrow{ value: 1 ether }(builder, "Project", descriptions, amounts, deadlines);

        vm.prank(client);
        vm.expectRevert();
        escrow.completeMilestone(escrowId, 0);
    }

    function test_ApproveMilestone() public {
        // Create escrow
        string[] memory descriptions = new string[](1);
        descriptions[0] = "Development";

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 1 ether;

        uint256[] memory deadlines = new uint256[](1);
        deadlines[0] = block.timestamp + 7 days;

        vm.prank(client);
        uint256 escrowId =
            escrow.createEscrow{ value: 1 ether }(builder, "Project", descriptions, amounts, deadlines);

        // Complete milestone
        vm.prank(builder);
        escrow.completeMilestone(escrowId, 0);

        // Approve milestone
        uint256 builderBalanceBefore = builder.balance;

        vm.prank(client);
        escrow.approveMilestone(escrowId, 0);

        uint256 builderBalanceAfter = builder.balance;

        // Builder should receive 97.5% of milestone amount (2.5% fee)
        uint256 expectedPayment = 1 ether - (1 ether * 25) / 10_000;
        assertEq(builderBalanceAfter - builderBalanceBefore, expectedPayment);

        BuilderEscrow.MilestoneInfo memory milestone = escrow.getMilestone(escrowId, 0);
        assertTrue(milestone.approved);
    }

    function test_RevertWhen_ApprovingNonCompletedMilestone() public {
        string[] memory descriptions = new string[](1);
        descriptions[0] = "Development";

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 1 ether;

        uint256[] memory deadlines = new uint256[](1);
        deadlines[0] = block.timestamp + 7 days;

        vm.prank(client);
        uint256 escrowId =
            escrow.createEscrow{ value: 1 ether }(builder, "Project", descriptions, amounts, deadlines);

        vm.prank(client);
        vm.expectRevert();
        escrow.approveMilestone(escrowId, 0);
    }

    function test_EscrowCompletedAfterAllMilestonesApproved() public {
        string[] memory descriptions = new string[](2);
        descriptions[0] = "Phase 1";
        descriptions[1] = "Phase 2";

        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 1 ether;
        amounts[1] = 1 ether;

        uint256[] memory deadlines = new uint256[](2);
        deadlines[0] = block.timestamp + 7 days;
        deadlines[1] = block.timestamp + 14 days;

        vm.prank(client);
        uint256 escrowId =
            escrow.createEscrow{ value: 2 ether }(builder, "Project", descriptions, amounts, deadlines);

        // Complete and approve first milestone
        vm.prank(builder);
        escrow.completeMilestone(escrowId, 0);

        vm.prank(client);
        escrow.approveMilestone(escrowId, 0);

        BuilderEscrow.EscrowInfo memory info1 = escrow.getEscrowInfo(escrowId);
        assertEq(uint256(info1.status), uint256(BuilderEscrow.EscrowStatus.Active));

        // Complete and approve second milestone
        vm.prank(builder);
        escrow.completeMilestone(escrowId, 1);

        vm.prank(client);
        escrow.approveMilestone(escrowId, 1);

        BuilderEscrow.EscrowInfo memory info2 = escrow.getEscrowInfo(escrowId);
        assertEq(uint256(info2.status), uint256(BuilderEscrow.EscrowStatus.Completed));
    }

    function test_DisputeMilestone() public {
        string[] memory descriptions = new string[](1);
        descriptions[0] = "Development";

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 1 ether;

        uint256[] memory deadlines = new uint256[](1);
        deadlines[0] = block.timestamp + 7 days;

        vm.prank(client);
        uint256 escrowId =
            escrow.createEscrow{ value: 1 ether }(builder, "Project", descriptions, amounts, deadlines);

        // Complete milestone
        vm.prank(builder);
        escrow.completeMilestone(escrowId, 0);

        // Client disputes
        vm.prank(client);
        escrow.disputeMilestone(escrowId, 0);

        BuilderEscrow.MilestoneInfo memory milestone = escrow.getMilestone(escrowId, 0);
        assertTrue(milestone.disputed);

        BuilderEscrow.EscrowInfo memory info = escrow.getEscrowInfo(escrowId);
        assertEq(uint256(info.status), uint256(BuilderEscrow.EscrowStatus.Disputed));
    }

    function test_ResolveDisputeInFavorOfBuilder() public {
        string[] memory descriptions = new string[](1);
        descriptions[0] = "Development";

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 1 ether;

        uint256[] memory deadlines = new uint256[](1);
        deadlines[0] = block.timestamp + 7 days;

        vm.prank(client);
        uint256 escrowId =
            escrow.createEscrow{ value: 1 ether }(builder, "Project", descriptions, amounts, deadlines);

        // Complete and dispute milestone
        vm.prank(builder);
        escrow.completeMilestone(escrowId, 0);

        vm.prank(client);
        escrow.disputeMilestone(escrowId, 0);

        // Owner resolves in favor of builder
        uint256 builderBalanceBefore = builder.balance;

        vm.prank(owner);
        escrow.resolveDispute(escrowId, 0, true);

        uint256 builderBalanceAfter = builder.balance;

        BuilderEscrow.MilestoneInfo memory milestone = escrow.getMilestone(escrowId, 0);
        assertFalse(milestone.disputed);
        assertTrue(milestone.approved);

        uint256 expectedPayment = 1 ether - (1 ether * 25) / 10_000;
        assertEq(builderBalanceAfter - builderBalanceBefore, expectedPayment);
    }

    function test_ResolveDisputeInFavorOfClient() public {
        string[] memory descriptions = new string[](1);
        descriptions[0] = "Development";

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 1 ether;

        uint256[] memory deadlines = new uint256[](1);
        deadlines[0] = block.timestamp + 7 days;

        vm.prank(client);
        uint256 escrowId =
            escrow.createEscrow{ value: 1 ether }(builder, "Project", descriptions, amounts, deadlines);

        // Complete and dispute milestone
        vm.prank(builder);
        escrow.completeMilestone(escrowId, 0);

        vm.prank(client);
        escrow.disputeMilestone(escrowId, 0);

        // Owner resolves in favor of client
        vm.prank(owner);
        escrow.resolveDispute(escrowId, 0, false);

        BuilderEscrow.MilestoneInfo memory milestone = escrow.getMilestone(escrowId, 0);
        assertFalse(milestone.disputed);
        assertFalse(milestone.approved);
        assertFalse(milestone.completed);
    }

    function test_CancelEscrow() public {
        string[] memory descriptions = new string[](1);
        descriptions[0] = "Development";

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 1 ether;

        uint256[] memory deadlines = new uint256[](1);
        deadlines[0] = block.timestamp + 7 days;

        vm.prank(client);
        uint256 escrowId =
            escrow.createEscrow{ value: 1 ether }(builder, "Project", descriptions, amounts, deadlines);

        uint256 clientBalanceBefore = client.balance;

        vm.prank(client);
        escrow.cancelEscrow(escrowId);

        uint256 clientBalanceAfter = client.balance;

        assertEq(clientBalanceAfter - clientBalanceBefore, 1 ether);

        BuilderEscrow.EscrowInfo memory info = escrow.getEscrowInfo(escrowId);
        assertEq(uint256(info.status), uint256(BuilderEscrow.EscrowStatus.Cancelled));
    }

    function test_RevertWhen_CancelEscrowAfterApproval() public {
        string[] memory descriptions = new string[](1);
        descriptions[0] = "Development";

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 1 ether;

        uint256[] memory deadlines = new uint256[](1);
        deadlines[0] = block.timestamp + 7 days;

        vm.prank(client);
        uint256 escrowId =
            escrow.createEscrow{ value: 1 ether }(builder, "Project", descriptions, amounts, deadlines);

        // Complete and approve milestone
        vm.prank(builder);
        escrow.completeMilestone(escrowId, 0);

        vm.prank(client);
        escrow.approveMilestone(escrowId, 0);

        // Try to cancel
        vm.prank(client);
        vm.expectRevert();
        escrow.cancelEscrow(escrowId);
    }

    function test_GetAllMilestones() public {
        string[] memory descriptions = new string[](3);
        descriptions[0] = "Phase 1";
        descriptions[1] = "Phase 2";
        descriptions[2] = "Phase 3";

        uint256[] memory amounts = new uint256[](3);
        amounts[0] = 1 ether;
        amounts[1] = 2 ether;
        amounts[2] = 3 ether;

        uint256[] memory deadlines = new uint256[](3);
        deadlines[0] = block.timestamp + 7 days;
        deadlines[1] = block.timestamp + 14 days;
        deadlines[2] = block.timestamp + 21 days;

        vm.prank(client);
        uint256 escrowId =
            escrow.createEscrow{ value: 6 ether }(builder, "Project", descriptions, amounts, deadlines);

        BuilderEscrow.MilestoneInfo[] memory milestones = escrow.getAllMilestones(escrowId);

        assertEq(milestones.length, 3);
        assertEq(milestones[0].description, "Phase 1");
        assertEq(milestones[0].amount, 1 ether);
        assertEq(milestones[1].description, "Phase 2");
        assertEq(milestones[1].amount, 2 ether);
        assertEq(milestones[2].description, "Phase 3");
        assertEq(milestones[2].amount, 3 ether);
    }

    function test_GetClientAndBuilderEscrows() public {
        string[] memory descriptions = new string[](1);
        descriptions[0] = "Development";

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 1 ether;

        uint256[] memory deadlines = new uint256[](1);
        deadlines[0] = block.timestamp + 7 days;

        vm.prank(client);
        uint256 escrowId1 =
            escrow.createEscrow{ value: 1 ether }(builder, "Project 1", descriptions, amounts, deadlines);

        vm.prank(client);
        uint256 escrowId2 =
            escrow.createEscrow{ value: 1 ether }(builder, "Project 2", descriptions, amounts, deadlines);

        uint256[] memory clientEscrows = escrow.getClientEscrows(client);
        uint256[] memory builderEscrows = escrow.getBuilderEscrows(builder);

        assertEq(clientEscrows.length, 2);
        assertEq(clientEscrows[0], escrowId1);
        assertEq(clientEscrows[1], escrowId2);

        assertEq(builderEscrows.length, 2);
        assertEq(builderEscrows[0], escrowId1);
        assertEq(builderEscrows[1], escrowId2);
    }
}
