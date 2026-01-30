// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "../contracts/BuilderVault.sol";

contract BuilderVaultTest is Test {
    BuilderVault public vault;
    address public owner;
    address public alice;
    address public bob;

    function setUp() public {
        owner = address(this);
        alice = makeAddr("alice");
        bob = makeAddr("bob");

        vault = new BuilderVault();

        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
    }

    // === Vault Creation Tests ===

    function test_CreateVault() public {
        vm.prank(alice);
        uint256 vaultId = vault.createVault{ value: 1 ether }(5 ether, 30 days, "Project savings");

        assertEq(vaultId, 0);
        assertEq(vault.totalVaults(), 1);
        assertEq(vault.totalValueLocked(), 1 ether);

        BuilderVault.Vault memory v = vault.getVault(0);
        assertEq(v.balance, 1 ether);
        assertEq(v.goalAmount, 5 ether);
        assertEq(v.owner, alice);
        assertEq(uint256(v.status), uint256(BuilderVault.VaultStatus.Active));
    }

    function test_CreateVaultNoGoal() public {
        vm.prank(alice);
        vault.createVault{ value: 2 ether }(0, 14 days, "No goal vault");

        BuilderVault.Vault memory v = vault.getVault(0);
        assertEq(v.goalAmount, 0);
        assertTrue(vault.isGoalReached(0));
    }

    function test_RevertCreateVaultZeroDeposit() public {
        vm.prank(alice);
        vm.expectRevert(BuilderVault.InsufficientDeposit.selector);
        vault.createVault{ value: 0 }(1 ether, 30 days, "Test");
    }

    function test_RevertCreateVaultInvalidDuration() public {
        vm.prank(alice);
        vm.expectRevert(BuilderVault.InvalidLockDuration.selector);
        vault.createVault{ value: 1 ether }(1 ether, 1 days, "Too short");
    }

    function test_RevertCreateVaultDurationTooLong() public {
        vm.prank(alice);
        vm.expectRevert(BuilderVault.InvalidLockDuration.selector);
        vault.createVault{ value: 1 ether }(1 ether, 400 days, "Too long");
    }

    // === Add Deposit Tests ===

    function test_AddDeposit() public {
        vm.startPrank(alice);
        vault.createVault{ value: 1 ether }(5 ether, 30 days, "Project");
        vault.addDeposit{ value: 2 ether }(0);
        vm.stopPrank();

        BuilderVault.Vault memory v = vault.getVault(0);
        assertEq(v.balance, 3 ether);
        assertEq(vault.totalValueLocked(), 3 ether);
        assertEq(vault.totalDeposited(alice), 3 ether);
    }

    function test_RevertAddDepositNotOwner() public {
        vm.prank(alice);
        vault.createVault{ value: 1 ether }(5 ether, 30 days, "Project");

        vm.prank(bob);
        vm.expectRevert(BuilderVault.NotVaultOwner.selector);
        vault.addDeposit{ value: 1 ether }(0);
    }

    function test_RevertAddDepositZero() public {
        vm.prank(alice);
        vault.createVault{ value: 1 ether }(5 ether, 30 days, "Project");

        vm.prank(alice);
        vm.expectRevert(BuilderVault.InsufficientDeposit.selector);
        vault.addDeposit{ value: 0 }(0);
    }

    // === Withdraw Tests ===

    function test_WithdrawAfterMaturity() public {
        vm.prank(alice);
        vault.createVault{ value: 5 ether }(5 ether, 30 days, "Project");

        // Warp past maturity
        vm.warp(block.timestamp + 31 days);

        uint256 balanceBefore = alice.balance;
        vm.prank(alice);
        vault.withdraw(0);
        uint256 balanceAfter = alice.balance;

        assertEq(balanceAfter - balanceBefore, 5 ether);
        assertEq(vault.totalValueLocked(), 0);
        assertEq(vault.totalWithdrawn(), 5 ether);

        BuilderVault.Vault memory v = vault.getVault(0);
        assertEq(uint256(v.status), uint256(BuilderVault.VaultStatus.Withdrawn));
    }

    function test_RevertWithdrawBeforeMaturity() public {
        vm.prank(alice);
        vault.createVault{ value: 5 ether }(5 ether, 30 days, "Project");

        vm.prank(alice);
        vm.expectRevert(BuilderVault.VaultNotMatured.selector);
        vault.withdraw(0);
    }

    function test_RevertWithdrawNotOwner() public {
        vm.prank(alice);
        vault.createVault{ value: 5 ether }(5 ether, 30 days, "Project");

        vm.warp(block.timestamp + 31 days);

        vm.prank(bob);
        vm.expectRevert(BuilderVault.NotVaultOwner.selector);
        vault.withdraw(0);
    }

    function test_RevertDoubleWithdraw() public {
        vm.prank(alice);
        vault.createVault{ value: 5 ether }(5 ether, 30 days, "Project");

        vm.warp(block.timestamp + 31 days);

        vm.prank(alice);
        vault.withdraw(0);

        vm.prank(alice);
        vm.expectRevert(BuilderVault.VaultAlreadyWithdrawn.selector);
        vault.withdraw(0);
    }

    // === Emergency Withdraw Tests ===

    function test_EmergencyWithdraw() public {
        vm.prank(alice);
        vault.createVault{ value: 10 ether }(10 ether, 30 days, "Project");

        uint256 balanceBefore = alice.balance;
        vm.prank(alice);
        vault.emergencyWithdraw(0);
        uint256 balanceAfter = alice.balance;

        // 5% penalty: 10 ETH - 0.5 ETH = 9.5 ETH
        uint256 expectedPenalty = 0.5 ether;
        uint256 expectedWithdraw = 9.5 ether;

        assertEq(balanceAfter - balanceBefore, expectedWithdraw);
        assertEq(vault.penaltyPool(), expectedPenalty);
        assertEq(vault.totalValueLocked(), 0);

        BuilderVault.Vault memory v = vault.getVault(0);
        assertEq(uint256(v.status), uint256(BuilderVault.VaultStatus.EmergencyWithdrawn));
    }

    function test_RevertEmergencyWithdrawNotOwner() public {
        vm.prank(alice);
        vault.createVault{ value: 10 ether }(10 ether, 30 days, "Project");

        vm.prank(bob);
        vm.expectRevert(BuilderVault.NotVaultOwner.selector);
        vault.emergencyWithdraw(0);
    }

    // === Goal Progress Tests ===

    function test_GoalProgress() public {
        vm.prank(alice);
        vault.createVault{ value: 2 ether }(10 ether, 30 days, "Project");

        // 2 / 10 = 20% = 2000 basis points
        assertEq(vault.getGoalProgress(0), 2000);
    }

    function test_GoalProgressComplete() public {
        vm.prank(alice);
        vault.createVault{ value: 10 ether }(10 ether, 30 days, "Project");

        assertEq(vault.getGoalProgress(0), 10_000);
        assertTrue(vault.isGoalReached(0));
    }

    function test_GoalProgressOverfunded() public {
        vm.prank(alice);
        vault.createVault{ value: 15 ether }(10 ether, 30 days, "Project");

        assertEq(vault.getGoalProgress(0), 10_000);
    }

    // === Time Remaining Tests ===

    function test_TimeRemaining() public {
        vm.prank(alice);
        vault.createVault{ value: 1 ether }(1 ether, 30 days, "Project");

        uint256 remaining = vault.getTimeRemaining(0);
        assertEq(remaining, 30 days);
    }

    function test_TimeRemainingAfterMaturity() public {
        vm.prank(alice);
        vault.createVault{ value: 1 ether }(1 ether, 30 days, "Project");

        vm.warp(block.timestamp + 31 days);
        assertEq(vault.getTimeRemaining(0), 0);
    }

    // === Maturity Tests ===

    function test_IsMatured() public {
        vm.prank(alice);
        vault.createVault{ value: 1 ether }(1 ether, 30 days, "Project");

        assertFalse(vault.isMatured(0));

        vm.warp(block.timestamp + 30 days);
        assertTrue(vault.isMatured(0));
    }

    // === Penalty Penalty Tests ===

    function test_GetEarlyWithdrawalPenalty() public {
        vm.prank(alice);
        vault.createVault{ value: 10 ether }(10 ether, 30 days, "Project");

        assertEq(vault.getEarlyWithdrawalPenalty(0), 0.5 ether);
    }

    // === Admin Functions Tests ===

    function test_UpdatePenaltyRate() public {
        vault.updatePenaltyRate(1000); // 10%
        assertEq(vault.emergencyPenaltyRate(), 1000);
    }

    function test_RevertUpdatePenaltyRateTooHigh() public {
        vm.expectRevert(BuilderVault.EmergencyPenaltyTooHigh.selector);
        vault.updatePenaltyRate(2500); // 25% > max 20%
    }

    function test_RevertUpdatePenaltyRateNotOwner() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", alice));
        vault.updatePenaltyRate(1000);
    }

    function test_WithdrawPenaltyPool() public {
        // Create vault and emergency withdraw to generate penalty
        vm.prank(alice);
        vault.createVault{ value: 10 ether }(10 ether, 30 days, "Project");
        vm.prank(alice);
        vault.emergencyWithdraw(0);

        uint256 penaltyAmount = vault.penaltyPool();
        assertEq(penaltyAmount, 0.5 ether);

        uint256 ownerBalanceBefore = owner.balance;
        vault.withdrawPenaltyPool(owner);
        uint256 ownerBalanceAfter = owner.balance;

        assertEq(ownerBalanceAfter - ownerBalanceBefore, 0.5 ether);
        assertEq(vault.penaltyPool(), 0);
    }

    function test_RevertWithdrawPenaltyPoolZeroAddress() public {
        vm.expectRevert(BuilderVault.ZeroAddress.selector);
        vault.withdrawPenaltyPool(address(0));
    }

    // === Pause Tests ===

    function test_PauseAndUnpause() public {
        vault.pause();

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSignature("EnforcedPause()"));
        vault.createVault{ value: 1 ether }(1 ether, 30 days, "Test");

        vault.unpause();

        vm.prank(alice);
        vault.createVault{ value: 1 ether }(1 ether, 30 days, "Test");
        assertEq(vault.totalVaults(), 1);
    }

    // === User Vaults Tests ===

    function test_GetUserVaults() public {
        vm.startPrank(alice);
        vault.createVault{ value: 1 ether }(1 ether, 30 days, "Vault 1");
        vault.createVault{ value: 2 ether }(2 ether, 60 days, "Vault 2");
        vault.createVault{ value: 3 ether }(3 ether, 90 days, "Vault 3");
        vm.stopPrank();

        uint256[] memory aliceVaults = vault.getUserVaults(alice);
        assertEq(aliceVaults.length, 3);
        assertEq(aliceVaults[0], 0);
        assertEq(aliceVaults[1], 1);
        assertEq(aliceVaults[2], 2);
    }

    // === Stats Tests ===

    function test_GetStats() public {
        vm.prank(alice);
        vault.createVault{ value: 5 ether }(5 ether, 30 days, "Project");

        vm.prank(bob);
        vault.createVault{ value: 3 ether }(3 ether, 14 days, "Savings");

        (
            uint256 _totalVaults,
            uint256 _totalValueLocked,
            uint256 _totalWithdrawn,
            uint256 _penaltyPool
        ) = vault.getStats();

        assertEq(_totalVaults, 2);
        assertEq(_totalValueLocked, 8 ether);
        assertEq(_totalWithdrawn, 0);
        assertEq(_penaltyPool, 0);
    }

    function test_GetContractBalance() public {
        vm.prank(alice);
        vault.createVault{ value: 5 ether }(5 ether, 30 days, "Project");

        assertEq(vault.getContractBalance(), 5 ether);
    }

    // === Multiple Vaults Lifecycle Test ===

    function test_FullLifecycle() public {
        // Alice creates two vaults
        vm.startPrank(alice);
        vault.createVault{ value: 5 ether }(10 ether, 30 days, "Long term");
        vault.createVault{ value: 2 ether }(2 ether, 7 days, "Short term");

        // Add more to first vault
        vault.addDeposit{ value: 3 ether }(0);
        vm.stopPrank();

        assertEq(vault.totalValueLocked(), 10 ether);

        // Bob creates a vault
        vm.prank(bob);
        vault.createVault{ value: 4 ether }(4 ether, 14 days, "Bob savings");

        assertEq(vault.totalVaults(), 3);
        assertEq(vault.totalValueLocked(), 14 ether);

        // Alice's short term vault matures
        vm.warp(block.timestamp + 8 days);
        vm.prank(alice);
        vault.withdraw(1);

        assertEq(vault.totalValueLocked(), 12 ether);
        assertEq(vault.totalWithdrawn(), 2 ether);

        // Bob emergency withdraws
        vm.prank(bob);
        vault.emergencyWithdraw(2);

        // 5% of 4 ETH = 0.2 ETH penalty
        assertEq(vault.penaltyPool(), 0.2 ether);
        assertEq(vault.totalValueLocked(), 8 ether);
    }

    // Allow receiving ETH
    receive() external payable { }
}
