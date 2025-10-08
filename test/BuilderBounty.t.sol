// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { Test } from "@forge-std/Test.sol";
import { console } from "@forge-std/console.sol";
import { BuilderBounty } from "../contracts/BuilderBounty.sol";

contract BuilderBountyTest is Test {
    BuilderBounty public bounty;
    address public owner;
    address public creator;
    address public claimer;

    event BountyCreated(
        uint256 indexed bountyId,
        address indexed creator,
        string title,
        uint256 reward,
        uint256 deadline
    );

    function setUp() public {
        owner = address(this);
        creator = makeAddr("creator");
        claimer = makeAddr("claimer");

        bounty = new BuilderBounty();

        // Fund creator and claimer
        vm.deal(creator, 10 ether);
        vm.deal(claimer, 1 ether);
    }

    function test_CreateBounty() public {
        vm.startPrank(creator);

        uint256 reward = 1 ether;
        uint256 deadline = block.timestamp + 7 days;

        vm.expectEmit(true, true, false, true);
        emit BountyCreated(0, creator, "Build DApp", reward, deadline);

        uint256 bountyId = bounty.createBounty{ value: reward }(
            "Build DApp", "Create a decentralized application", deadline
        );

        assertEq(bountyId, 0);
        assertEq(bounty.totalBounties(), 1);

        BuilderBounty.Bounty memory b = bounty.getBounty(0);
        assertEq(b.creator, creator);
        assertEq(b.reward, reward);
        assertEq(uint256(b.status), uint256(BuilderBounty.BountyStatus.Open));

        vm.stopPrank();
    }

    function test_ClaimBounty() public {
        // Create bounty
        vm.prank(creator);
        bounty.createBounty{ value: 1 ether }(
            "Build DApp", "Create a decentralized application", block.timestamp + 7 days
        );

        // Claim bounty
        vm.prank(claimer);
        bounty.claimBounty(0);

        BuilderBounty.Bounty memory b = bounty.getBounty(0);
        assertEq(b.claimer, claimer);
        assertEq(uint256(b.status), uint256(BuilderBounty.BountyStatus.Claimed));
    }

    function test_SubmitWork() public {
        // Create and claim bounty
        vm.prank(creator);
        bounty.createBounty{ value: 1 ether }(
            "Build DApp", "Create a decentralized application", block.timestamp + 7 days
        );

        vm.prank(claimer);
        bounty.claimBounty(0);

        // Submit work
        vm.prank(claimer);
        bounty.submitWork(0, "QmHash123");

        BuilderBounty.Bounty memory b = bounty.getBounty(0);
        assertEq(b.ipfsSubmission, "QmHash123");
        assertEq(uint256(b.status), uint256(BuilderBounty.BountyStatus.UnderReview));
    }

    function test_ApproveBounty() public {
        // Create, claim, and submit work
        vm.prank(creator);
        bounty.createBounty{ value: 1 ether }(
            "Build DApp", "Create a decentralized application", block.timestamp + 7 days
        );

        vm.prank(claimer);
        bounty.claimBounty(0);

        vm.prank(claimer);
        bounty.submitWork(0, "QmHash123");

        uint256 claimerBalanceBefore = claimer.balance;

        // Approve bounty
        vm.prank(creator);
        bounty.approveBounty(0);

        BuilderBounty.Bounty memory b = bounty.getBounty(0);
        assertEq(uint256(b.status), uint256(BuilderBounty.BountyStatus.Completed));

        // Check claimer received payment minus platform fee
        uint256 fee = (1 ether * 25) / 10_000; // 2.5% fee
        uint256 expectedReward = 1 ether - fee;
        assertEq(claimer.balance, claimerBalanceBefore + expectedReward);
    }

    function test_CancelBounty() public {
        vm.startPrank(creator);

        uint256 creatorBalanceBefore = creator.balance;
        bounty.createBounty{ value: 1 ether }(
            "Build DApp", "Create a decentralized application", block.timestamp + 7 days
        );

        bounty.cancelBounty(0);

        BuilderBounty.Bounty memory b = bounty.getBounty(0);
        assertEq(uint256(b.status), uint256(BuilderBounty.BountyStatus.Cancelled));
        assertEq(creator.balance, creatorBalanceBefore);

        vm.stopPrank();
    }

    function test_UpdatePlatformFee() public {
        bounty.updatePlatformFee(50); // 5%
        assertEq(bounty.platformFee(), 50);
    }

    function test_RevertWhen_CreateBountyWithZeroReward() public {
        vm.prank(creator);
        vm.expectRevert(bytes("Reward must be greater than 0"));
        bounty.createBounty{ value: 0 }(
            "Build DApp", "Create a decentralized application", block.timestamp + 7 days
        );
    }

    function test_RevertWhen_ClaimOwnBounty() public {
        vm.startPrank(creator);
        bounty.createBounty{ value: 1 ether }(
            "Build DApp", "Create a decentralized application", block.timestamp + 7 days
        );
        vm.expectRevert(bytes("Creator cannot claim own bounty"));
        bounty.claimBounty(0);
        vm.stopPrank();
    }
}
