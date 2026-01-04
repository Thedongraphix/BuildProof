// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { Test, console } from "forge-std/Test.sol";
import { BuilderInsurance } from "../contracts/BuilderInsurance.sol";

contract BuilderInsuranceTest is Test {
    BuilderInsurance public insurance;

    address public owner;
    address public builder1;
    address public builder2;
    address public client1;
    address public client2;

    event BuilderStaked(address indexed builder, uint256 amount, uint256 lockDuration);
    event PolicyCreated(
        uint256 indexed policyId,
        address indexed holder,
        uint256 coverageAmount,
        uint256 premiumPaid,
        uint256 duration
    );
    event ClaimFiled(
        uint256 indexed claimId,
        uint256 indexed policyId,
        address indexed claimant,
        uint256 requestedAmount
    );

    function setUp() public {
        owner = address(this);
        builder1 = makeAddr("builder1");
        builder2 = makeAddr("builder2");
        client1 = makeAddr("client1");
        client2 = makeAddr("client2");

        insurance = new BuilderInsurance();

        // Fund accounts
        vm.deal(builder1, 100 ether);
        vm.deal(builder2, 100 ether);
        vm.deal(client1, 100 ether);
        vm.deal(client2, 100 ether);
    }

    function test_Deployment() public view {
        assertEq(insurance.owner(), owner);
        assertEq(insurance.totalPolicies(), 0);
        assertEq(insurance.totalClaims(), 0);
        assertEq(insurance.insurancePool(), 0);
    }

    function test_StakeAsBuilder() public {
        uint256 stakeAmount = 10 ether;
        uint256 lockDuration = 30 days;

        vm.prank(builder1);
        vm.expectEmit(true, false, false, true);
        emit BuilderStaked(builder1, stakeAmount, lockDuration);
        insurance.stakeAsBuilder{ value: stakeAmount }(lockDuration);

        (
            uint256 amount,
            uint256 stakedAt,
            uint256 lock,
            uint256 rewardsClaimed,
            bool isActive
        ) = insurance.builderStakes(builder1);

        assertEq(amount, stakeAmount);
        assertEq(stakedAt, block.timestamp);
        assertEq(lock, lockDuration);
        assertEq(rewardsClaimed, 0);
        assertTrue(isActive);
        assertEq(insurance.totalStaked(), stakeAmount);
    }

    function testFail_StakeWithZeroAmount() public {
        vm.prank(builder1);
        insurance.stakeAsBuilder{ value: 0 }(30 days);
    }

    function testFail_StakeWithInvalidDuration() public {
        vm.prank(builder1);
        insurance.stakeAsBuilder{ value: 1 ether }(1 days);
    }

    function test_PurchasePolicy() public {
        uint256 coverageAmount = 5 ether;
        uint256 duration = 90 days;
        uint256 projectValue = 10 ether;

        // Calculate expected premium
        uint256 expectedPremium = (coverageAmount * 100 * duration) / (10_000 * 365 days);

        vm.prank(client1);
        vm.expectEmit(true, true, false, true);
        emit PolicyCreated(0, client1, coverageAmount, expectedPremium, duration);
        uint256 policyId =
            insurance.purchasePolicy{ value: expectedPremium }(
                coverageAmount, duration, projectValue, "Test Project", address(0x123)
            );

        assertEq(policyId, 0);
        assertEq(insurance.totalPolicies(), 1);

        BuilderInsurance.Policy memory policy = insurance.getPolicy(policyId);
        assertEq(policy.holder, client1);
        assertEq(policy.coverageAmount, coverageAmount);
        assertEq(uint256(policy.status), uint256(BuilderInsurance.PolicyStatus.Active));
    }

    function test_PurchasePolicyWithExcessPayment() public {
        uint256 coverageAmount = 5 ether;
        uint256 duration = 90 days;
        uint256 projectValue = 10 ether;

        uint256 expectedPremium = (coverageAmount * 100 * duration) / (10_000 * 365 days);
        uint256 excessPayment = expectedPremium + 1 ether;

        uint256 balanceBefore = client1.balance;

        vm.prank(client1);
        insurance.purchasePolicy{ value: excessPayment }(
            coverageAmount, duration, projectValue, "Test Project", address(0x123)
        );

        uint256 balanceAfter = client1.balance;
        assertEq(balanceBefore - balanceAfter, expectedPremium);
    }

    function testFail_PurchasePolicyWithInsufficientPayment() public {
        uint256 coverageAmount = 5 ether;
        uint256 duration = 90 days;

        vm.prank(client1);
        insurance.purchasePolicy{ value: 0.001 ether }(
            coverageAmount, duration, 10 ether, "Test Project", address(0x123)
        );
    }

    function test_CancelPolicy() public {
        uint256 coverageAmount = 5 ether;
        uint256 duration = 90 days;

        uint256 premium = (coverageAmount * 100 * duration) / (10_000 * 365 days);

        vm.prank(client1);
        uint256 policyId = insurance.purchasePolicy{ value: premium }(
            coverageAmount, duration, 10 ether, "Test Project", address(0x123)
        );

        // Fast forward halfway through policy
        vm.warp(block.timestamp + 45 days);

        uint256 balanceBefore = client1.balance;

        vm.prank(client1);
        insurance.cancelPolicy(policyId);

        uint256 balanceAfter = client1.balance;

        BuilderInsurance.Policy memory policy = insurance.getPolicy(policyId);
        assertEq(uint256(policy.status), uint256(BuilderInsurance.PolicyStatus.Cancelled));
        assertTrue(balanceAfter > balanceBefore); // Should receive refund
    }

    function test_FileClaim() public {
        uint256 coverageAmount = 5 ether;
        uint256 duration = 90 days;

        uint256 premium = (coverageAmount * 100 * duration) / (10_000 * 365 days);

        vm.prank(client1);
        uint256 policyId = insurance.purchasePolicy{ value: premium }(
            coverageAmount, duration, 10 ether, "Test Project", address(0x123)
        );

        uint256 claimAmount = 2 ether;

        vm.prank(client1);
        vm.expectEmit(true, true, true, true);
        emit ClaimFiled(0, policyId, client1, claimAmount);
        uint256 claimId = insurance.fileClaim(policyId, claimAmount, "Evidence IPFS hash");

        assertEq(claimId, 0);
        assertEq(insurance.totalClaims(), 1);

        BuilderInsurance.Claim memory claim = insurance.getClaim(claimId);
        assertEq(claim.claimant, client1);
        assertEq(claim.requestedAmount, claimAmount);
        assertEq(uint256(claim.status), uint256(BuilderInsurance.ClaimStatus.Pending));
    }

    function testFail_FileClaimOnExpiredPolicy() public {
        uint256 coverageAmount = 5 ether;
        uint256 duration = 30 days;

        uint256 premium = (coverageAmount * 100 * duration) / (10_000 * 365 days);

        vm.prank(client1);
        uint256 policyId = insurance.purchasePolicy{ value: premium }(
            coverageAmount, duration, 10 ether, "Test Project", address(0x123)
        );

        // Fast forward past expiry
        vm.warp(block.timestamp + 31 days);

        vm.prank(client1);
        insurance.fileClaim(policyId, 2 ether, "Evidence");
    }

    function test_ReviewAndPayClaim() public {
        // Setup policy
        uint256 coverageAmount = 5 ether;
        uint256 duration = 90 days;
        uint256 premium = (coverageAmount * 100 * duration) / (10_000 * 365 days);

        vm.prank(client1);
        uint256 policyId = insurance.purchasePolicy{ value: premium }(
            coverageAmount, duration, 10 ether, "Test Project", address(0x123)
        );

        // File claim
        uint256 claimAmount = 2 ether;
        vm.prank(client1);
        uint256 claimId = insurance.fileClaim(policyId, claimAmount, "Evidence");

        // Review claim (as owner)
        insurance.reviewClaim(claimId, true, claimAmount, "Approved after review");

        BuilderInsurance.Claim memory claim = insurance.getClaim(claimId);
        assertEq(uint256(claim.status), uint256(BuilderInsurance.ClaimStatus.Approved));
        assertEq(claim.approvedAmount, claimAmount);

        // Pay claim
        uint256 balanceBefore = client1.balance;
        insurance.payClaim(claimId);
        uint256 balanceAfter = client1.balance;

        assertEq(balanceAfter - balanceBefore, claimAmount);

        claim = insurance.getClaim(claimId);
        assertEq(uint256(claim.status), uint256(BuilderInsurance.ClaimStatus.Paid));
    }

    function test_RejectClaim() public {
        uint256 coverageAmount = 5 ether;
        uint256 duration = 90 days;
        uint256 premium = (coverageAmount * 100 * duration) / (10_000 * 365 days);

        vm.prank(client1);
        uint256 policyId = insurance.purchasePolicy{ value: premium }(
            coverageAmount, duration, 10 ether, "Test Project", address(0x123)
        );

        vm.prank(client1);
        uint256 claimId = insurance.fileClaim(policyId, 2 ether, "Evidence");

        insurance.reviewClaim(claimId, false, 0, "Insufficient evidence");

        BuilderInsurance.Claim memory claim = insurance.getClaim(claimId);
        assertEq(uint256(claim.status), uint256(BuilderInsurance.ClaimStatus.Rejected));
        assertEq(claim.approvedAmount, 0);
    }

    function test_WithdrawStake() public {
        uint256 stakeAmount = 10 ether;
        uint256 lockDuration = 30 days;

        vm.prank(builder1);
        insurance.stakeAsBuilder{ value: stakeAmount }(lockDuration);

        // Fast forward past lock period
        vm.warp(block.timestamp + lockDuration + 1);

        uint256 balanceBefore = builder1.balance;

        vm.prank(builder1);
        insurance.withdrawStake();

        uint256 balanceAfter = builder1.balance;

        assertTrue(balanceAfter > balanceBefore);
        assertEq(insurance.totalStaked(), 0);
    }

    function testFail_WithdrawStakeBeforeLockPeriod() public {
        uint256 stakeAmount = 10 ether;
        uint256 lockDuration = 30 days;

        vm.prank(builder1);
        insurance.stakeAsBuilder{ value: stakeAmount }(lockDuration);

        // Try to withdraw immediately
        vm.prank(builder1);
        insurance.withdrawStake();
    }

    function test_CalculateStakeRewards() public {
        uint256 stakeAmount = 10 ether;
        uint256 lockDuration = 365 days;

        vm.prank(builder1);
        insurance.stakeAsBuilder{ value: stakeAmount }(lockDuration);

        // Fast forward 1 year
        vm.warp(block.timestamp + 365 days);

        uint256 rewards = insurance.calculateStakeRewards(builder1);
        assertTrue(rewards > 0);

        // Approximate 5% APY check
        uint256 expectedReward = (stakeAmount * 5) / 100;
        assertApproxEqRel(rewards, expectedReward, 0.01e18); // 1% tolerance
    }

    function test_GetBuilderCoverageCapacity() public {
        uint256 stakeAmount = 10 ether;
        uint256 lockDuration = 30 days;

        vm.prank(builder1);
        insurance.stakeAsBuilder{ value: stakeAmount }(lockDuration);

        uint256 capacity = insurance.getBuilderCoverageCapacity(builder1);
        assertEq(capacity, stakeAmount * 10); // 10x leverage
    }

    function test_DepositToPool() public {
        uint256 depositAmount = 5 ether;

        vm.prank(client1);
        insurance.depositToPool{ value: depositAmount }();

        assertEq(insurance.insurancePool(), depositAmount);
    }

    function test_UpdatePremiumRate() public {
        uint256 newRate = 200; // 2%
        insurance.updatePremiumRate(newRate);
        assertEq(insurance.premiumRate(), newRate);
    }

    function testFail_UpdatePremiumRateTooHigh() public {
        insurance.updatePremiumRate(1001); // Over 10%
    }

    function test_PauseUnpause() public {
        insurance.pause();

        vm.prank(builder1);
        vm.expectRevert();
        insurance.stakeAsBuilder{ value: 1 ether }(30 days);

        insurance.unpause();

        vm.prank(builder1);
        insurance.stakeAsBuilder{ value: 1 ether }(30 days);
    }

    function test_ReceiveEther() public {
        uint256 amount = 1 ether;

        vm.prank(client1);
        (bool success,) = address(insurance).call{ value: amount }("");
        assertTrue(success);

        assertEq(insurance.insurancePool(), amount);
    }

    function test_GetHolderPolicies() public {
        uint256 premium = 0.1 ether;

        vm.startPrank(client1);
        insurance.purchasePolicy{ value: premium }(
            5 ether, 90 days, 10 ether, "Project 1", address(0x123)
        );
        insurance.purchasePolicy{ value: premium }(
            3 ether, 60 days, 5 ether, "Project 2", address(0x456)
        );
        vm.stopPrank();

        uint256[] memory policies = insurance.getHolderPolicies(client1);
        assertEq(policies.length, 2);
        assertEq(policies[0], 0);
        assertEq(policies[1], 1);
    }

    function test_EmergencyWithdraw() public {
        // Add funds to contract
        vm.prank(client1);
        insurance.depositToPool{ value: 10 ether }();

        uint256 ownerBalanceBefore = owner.balance;
        insurance.emergencyWithdraw(5 ether);
        uint256 ownerBalanceAfter = owner.balance;

        assertEq(ownerBalanceAfter - ownerBalanceBefore, 5 ether);
    }

    function test_GetContractBalance() public {
        vm.prank(client1);
        insurance.depositToPool{ value: 10 ether }();

        assertEq(insurance.getContractBalance(), 10 ether);
    }
}
