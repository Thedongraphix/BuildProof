// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { Test, console } from "forge-std/Test.sol";
import { StakingPool } from "../contracts/StakingPool.sol";
import { RewardToken } from "../contracts/RewardToken.sol";

contract StakingPoolTest is Test {
    StakingPool public stakingPool;
    RewardToken public rewardToken;

    address public owner = address(1);
    address public user1 = address(2);
    address public user2 = address(3);

    uint256 constant INITIAL_BALANCE = 1000 ether;
    uint256 constant REWARD_POOL = 100000 ether;

    function setUp() public {
        vm.startPrank(owner);

        // Deploy RewardToken
        rewardToken = new RewardToken();

        // Deploy StakingPool
        stakingPool = new StakingPool(address(rewardToken));

        // Fund reward pool
        rewardToken.transfer(address(stakingPool), REWARD_POOL);

        // Give tokens to users
        rewardToken.transfer(user1, INITIAL_BALANCE);
        rewardToken.transfer(user2, INITIAL_BALANCE);

        vm.stopPrank();
    }

    function test_Deployment() public view {
        assertEq(address(stakingPool.stakingToken()), address(rewardToken));
        assertEq(stakingPool.owner(), owner);
        assertEq(stakingPool.totalStaked(), 0);
    }

    function test_Stake() public {
        uint256 stakeAmount = 100 ether;
        uint256 lockPeriod = 90;

        vm.startPrank(user1);
        rewardToken.approve(address(stakingPool), stakeAmount);
        stakingPool.stake(stakeAmount, lockPeriod);
        vm.stopPrank();

        assertEq(stakingPool.totalStaked(), stakeAmount);
        (uint256 count, uint256 totalAmount) = stakingPool.getActiveStakes(user1);
        assertEq(count, 1);
        assertEq(totalAmount, stakeAmount);
    }

    function test_RevertWhen_StakeZeroAmount() public {
        vm.startPrank(user1);
        rewardToken.approve(address(stakingPool), 100 ether);

        vm.expectRevert("Amount must be greater than 0");
        stakingPool.stake(0, 90);
        vm.stopPrank();
    }

    function test_RevertWhen_StakeInvalidLockPeriod() public {
        vm.startPrank(user1);
        rewardToken.approve(address(stakingPool), 100 ether);

        vm.expectRevert("Invalid lock period");
        stakingPool.stake(100 ether, 45); // 45 days not configured
        vm.stopPrank();
    }

    function test_CalculateRewards() public {
        uint256 stakeAmount = 100 ether;
        uint256 lockPeriod = 90;

        vm.startPrank(user1);
        rewardToken.approve(address(stakingPool), stakeAmount);
        stakingPool.stake(stakeAmount, lockPeriod);
        vm.stopPrank();

        // Fast forward 30 days
        vm.warp(block.timestamp + 30 days);

        uint256 rewards = stakingPool.calculateRewards(user1, 0);
        assertTrue(rewards > 0, "Rewards should be greater than 0");

        // Approximate check: 100 * 0.18 * (30/365) ≈ 1.48 tokens
        assertTrue(rewards > 1 ether && rewards < 2 ether, "Rewards in expected range");
    }

    function test_ClaimRewards() public {
        uint256 stakeAmount = 100 ether;
        uint256 lockPeriod = 90;

        vm.startPrank(user1);
        rewardToken.approve(address(stakingPool), stakeAmount);
        stakingPool.stake(stakeAmount, lockPeriod);
        vm.stopPrank();

        // Fast forward 30 days
        vm.warp(block.timestamp + 30 days);

        uint256 balanceBefore = rewardToken.balanceOf(user1);
        uint256 expectedRewards = stakingPool.calculateRewards(user1, 0);

        vm.prank(user1);
        stakingPool.claimRewards(0);

        uint256 balanceAfter = rewardToken.balanceOf(user1);
        assertEq(balanceAfter - balanceBefore, expectedRewards);
    }

    function test_ClaimAllRewards() public {
        uint256 stakeAmount = 100 ether;

        vm.startPrank(user1);
        rewardToken.approve(address(stakingPool), stakeAmount * 2);
        stakingPool.stake(stakeAmount, 30);
        stakingPool.stake(stakeAmount, 90);
        vm.stopPrank();

        // Fast forward 60 days
        vm.warp(block.timestamp + 60 days);

        uint256 balanceBefore = rewardToken.balanceOf(user1);
        uint256 expectedTotal = stakingPool.getTotalPendingRewards(user1);

        vm.prank(user1);
        stakingPool.claimAllRewards();

        uint256 balanceAfter = rewardToken.balanceOf(user1);
        assertEq(balanceAfter - balanceBefore, expectedTotal);
    }

    function test_WithdrawAfterLockPeriod() public {
        uint256 stakeAmount = 100 ether;
        uint256 lockPeriod = 30;

        vm.startPrank(user1);
        rewardToken.approve(address(stakingPool), stakeAmount);
        stakingPool.stake(stakeAmount, lockPeriod);
        vm.stopPrank();

        // Fast forward past lock period
        vm.warp(block.timestamp + 31 days);

        uint256 balanceBefore = rewardToken.balanceOf(user1);

        vm.prank(user1);
        stakingPool.withdraw(0);

        uint256 balanceAfter = rewardToken.balanceOf(user1);

        // User should get back stake + rewards, no penalty
        assertTrue(balanceAfter > balanceBefore + stakeAmount, "Should receive stake plus rewards");
    }

    function test_WithdrawBeforeLockPeriod() public {
        uint256 stakeAmount = 100 ether;
        uint256 lockPeriod = 90;

        vm.startPrank(user1);
        rewardToken.approve(address(stakingPool), stakeAmount);
        stakingPool.stake(stakeAmount, lockPeriod);
        vm.stopPrank();

        // Try to withdraw after only 30 days
        vm.warp(block.timestamp + 30 days);

        uint256 balanceBefore = rewardToken.balanceOf(user1);

        vm.prank(user1);
        stakingPool.withdraw(0);

        uint256 balanceAfter = rewardToken.balanceOf(user1);
        uint256 received = balanceAfter - balanceBefore;

        // Should receive less than staked amount due to 10% penalty
        assertTrue(received < stakeAmount, "Should have penalty applied");
        assertTrue(received >= stakeAmount * 90 / 100, "Penalty should be 10%");
    }

    function test_MultipleStakes() public {
        vm.startPrank(user1);
        rewardToken.approve(address(stakingPool), 300 ether);

        stakingPool.stake(100 ether, 30);
        stakingPool.stake(100 ether, 90);
        stakingPool.stake(100 ether, 180);

        (uint256 count, uint256 totalAmount) = stakingPool.getActiveStakes(user1);
        assertEq(count, 3);
        assertEq(totalAmount, 300 ether);

        vm.stopPrank();
    }

    function test_ConfigureLockPeriod() public {
        vm.prank(owner);
        stakingPool.configureLockPeriod(60, 1500, true); // 60 days, 15% APY

        vm.startPrank(user1);
        rewardToken.approve(address(stakingPool), 100 ether);
        stakingPool.stake(100 ether, 60); // Should work now
        vm.stopPrank();

        (uint256 count, ) = stakingPool.getActiveStakes(user1);
        assertEq(count, 1);
    }

    function test_RevertWhen_NonOwnerConfiguresLockPeriod() public {
        vm.prank(user1);
        vm.expectRevert();
        stakingPool.configureLockPeriod(60, 1500, true);
    }

    function test_GetUserStakes() public {
        vm.startPrank(user1);
        rewardToken.approve(address(stakingPool), 200 ether);
        stakingPool.stake(100 ether, 30);
        stakingPool.stake(100 ether, 90);
        vm.stopPrank();

        StakingPool.StakeInfo[] memory stakes = stakingPool.getUserStakes(user1);
        assertEq(stakes.length, 2);
        assertEq(stakes[0].amount, 100 ether);
        assertEq(stakes[1].amount, 100 ether);
        assertEq(stakes[0].lockPeriod, 30);
        assertEq(stakes[1].lockPeriod, 90);
    }

    function test_EmergencyWithdraw() public {
        uint256 contractBalance = rewardToken.balanceOf(address(stakingPool));
        uint256 ownerBalanceBefore = rewardToken.balanceOf(owner);

        vm.prank(owner);
        stakingPool.emergencyWithdraw(1000 ether);

        uint256 ownerBalanceAfter = rewardToken.balanceOf(owner);
        assertEq(ownerBalanceAfter - ownerBalanceBefore, 1000 ether);
    }

    function test_FundRewards() public {
        uint256 fundAmount = 5000 ether;
        uint256 contractBalanceBefore = rewardToken.balanceOf(address(stakingPool));

        vm.startPrank(owner);
        rewardToken.approve(address(stakingPool), fundAmount);
        stakingPool.fundRewards(fundAmount);
        vm.stopPrank();

        uint256 contractBalanceAfter = rewardToken.balanceOf(address(stakingPool));
        assertEq(contractBalanceAfter - contractBalanceBefore, fundAmount);
    }
}
