// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "../contracts/BuildProofToken.sol";
import "../contracts/BuilderLiquidityPool.sol";

contract BuilderLiquidityPoolTest is Test {
    BuildProofToken public token;
    BuilderLiquidityPool public pool;

    address public owner;
    address public user1;
    address public user2;

    uint256 constant INITIAL_TOKEN_SUPPLY = 1_000_000 * 10 ** 18;

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        // Deploy token and pool
        token = new BuildProofToken(INITIAL_TOKEN_SUPPLY);
        pool = new BuilderLiquidityPool(address(token));

        // Give users some ETH
        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);

        // Give users some tokens
        token.transfer(user1, 100_000 * 10 ** 18);
        token.transfer(user2, 100_000 * 10 ** 18);
    }

    function testInitialState() public view {
        assertEq(address(pool.bproofToken()), address(token));
        assertEq(pool.reserveBproof(), 0);
        assertEq(pool.reserveEth(), 0);
        assertEq(pool.totalLiquidity(), 0);
    }

    function testAddInitialLiquidity() public {
        uint256 bproofAmount = 1000 * 10 ** 18;
        uint256 ethAmount = 1 ether;

        vm.startPrank(user1);
        token.approve(address(pool), bproofAmount);
        uint256 liquidity = pool.addLiquidity{ value: ethAmount }(bproofAmount, 0);
        vm.stopPrank();

        assertTrue(liquidity > 0);
        assertEq(pool.reserveBproof(), bproofAmount);
        assertEq(pool.reserveEth(), ethAmount);
        assertEq(pool.liquidity(user1), liquidity);
    }

    function testAddSubsequentLiquidity() public {
        // User1 adds initial liquidity
        vm.startPrank(user1);
        token.approve(address(pool), 1000 * 10 ** 18);
        pool.addLiquidity{ value: 1 ether }(1000 * 10 ** 18, 0);
        vm.stopPrank();

        // User2 adds liquidity
        vm.startPrank(user2);
        token.approve(address(pool), 500 * 10 ** 18);
        uint256 liquidity2 = pool.addLiquidity{ value: 0.5 ether }(500 * 10 ** 18, 0);
        vm.stopPrank();

        assertTrue(liquidity2 > 0);
        assertEq(pool.liquidity(user2), liquidity2);
    }

    function testRemoveLiquidity() public {
        // Add liquidity
        vm.startPrank(user1);
        token.approve(address(pool), 1000 * 10 ** 18);
        uint256 liquidity = pool.addLiquidity{ value: 1 ether }(1000 * 10 ** 18, 0);

        // Remove liquidity
        uint256 bproofBefore = token.balanceOf(user1);
        uint256 ethBefore = user1.balance;

        (uint256 bproofOut, uint256 ethOut) = pool.removeLiquidity(liquidity, 0, 0);
        vm.stopPrank();

        assertTrue(bproofOut > 0);
        assertTrue(ethOut > 0);
        assertEq(token.balanceOf(user1), bproofBefore + bproofOut);
        assertEq(user1.balance, ethBefore + ethOut);
    }

    function testSwapBproofForEth() public {
        // Add initial liquidity
        vm.startPrank(user1);
        token.approve(address(pool), 10000 * 10 ** 18);
        pool.addLiquidity{ value: 10 ether }(10000 * 10 ** 18, 0);
        vm.stopPrank();

        // User2 swaps BPROOF for ETH
        uint256 swapAmount = 100 * 10 ** 18;
        uint256 ethBefore = user2.balance;

        vm.startPrank(user2);
        token.approve(address(pool), swapAmount);
        uint256 ethOut = pool.swapBproofForEth(swapAmount, 0);
        vm.stopPrank();

        assertTrue(ethOut > 0);
        assertEq(user2.balance, ethBefore + ethOut);
    }

    function testSwapEthForBproof() public {
        // Add initial liquidity
        vm.startPrank(user1);
        token.approve(address(pool), 10000 * 10 ** 18);
        pool.addLiquidity{ value: 10 ether }(10000 * 10 ** 18, 0);
        vm.stopPrank();

        // User2 swaps ETH for BPROOF
        uint256 swapAmount = 1 ether;
        uint256 bproofBefore = token.balanceOf(user2);

        vm.prank(user2);
        uint256 bproofOut = pool.swapEthForBproof{ value: swapAmount }(0);

        assertTrue(bproofOut > 0);
        assertEq(token.balanceOf(user2), bproofBefore + bproofOut);
    }

    function testGetQuoteBproofToEth() public {
        // Add liquidity
        vm.startPrank(user1);
        token.approve(address(pool), 10000 * 10 ** 18);
        pool.addLiquidity{ value: 10 ether }(10000 * 10 ** 18, 0);
        vm.stopPrank();

        uint256 quote = pool.getQuoteBproofToEth(100 * 10 ** 18);
        assertTrue(quote > 0);
    }

    function testGetQuoteEthToBproof() public {
        // Add liquidity
        vm.startPrank(user1);
        token.approve(address(pool), 10000 * 10 ** 18);
        pool.addLiquidity{ value: 10 ether }(10000 * 10 ** 18, 0);
        vm.stopPrank();

        uint256 quote = pool.getQuoteEthToBproof(1 ether);
        assertTrue(quote > 0);
    }

    function testGetLiquidityInfo() public {
        vm.startPrank(user1);
        token.approve(address(pool), 1000 * 10 ** 18);
        pool.addLiquidity{ value: 1 ether }(1000 * 10 ** 18, 0);
        vm.stopPrank();

        (uint256 shares, uint256 bproofValue, uint256 ethValue) = pool.getLiquidityInfo(user1);

        assertTrue(shares > 0);
        assertTrue(bproofValue > 0);
        assertTrue(ethValue > 0);
    }

    function testSlippageProtectionOnSwap() public {
        vm.startPrank(user1);
        token.approve(address(pool), 10000 * 10 ** 18);
        pool.addLiquidity{ value: 10 ether }(10000 * 10 ** 18, 0);
        vm.stopPrank();

        uint256 swapAmount = 100 * 10 ** 18;

        vm.startPrank(user2);
        token.approve(address(pool), swapAmount);

        // Set unrealistic slippage expectation
        vm.expectRevert();
        pool.swapBproofForEth(swapAmount, 100 ether);
        vm.stopPrank();
    }

    function testPauseUnpause() public {
        pool.pause();

        vm.startPrank(user1);
        token.approve(address(pool), 1000 * 10 ** 18);

        vm.expectRevert();
        pool.addLiquidity{ value: 1 ether }(1000 * 10 ** 18, 0);
        vm.stopPrank();

        pool.unpause();

        vm.startPrank(user1);
        pool.addLiquidity{ value: 1 ether }(1000 * 10 ** 18, 0);
        vm.stopPrank();
    }

    function testRevertWhenAddLiquidityWithZeroTokens() public {
        vm.prank(user1);
        vm.expectRevert();
        pool.addLiquidity{ value: 1 ether }(0, 0);
    }

    function testRevertWhenAddLiquidityWithZeroEth() public {
        vm.startPrank(user1);
        token.approve(address(pool), 1000 * 10 ** 18);
        vm.expectRevert();
        pool.addLiquidity{ value: 0 }(1000 * 10 ** 18, 0);
        vm.stopPrank();
    }

    function testRevertWhenSwapWithZeroAmount() public {
        vm.prank(user1);
        vm.expectRevert();
        pool.swapBproofForEth(0, 0);
    }

    function testConstantProductFormula() public {
        // Add liquidity
        vm.startPrank(user1);
        token.approve(address(pool), 10000 * 10 ** 18);
        pool.addLiquidity{ value: 10 ether }(10000 * 10 ** 18, 0);
        vm.stopPrank();

        uint256 k_before = pool.reserveBproof() * pool.reserveEth();

        // Make a swap
        vm.startPrank(user2);
        token.approve(address(pool), 100 * 10 ** 18);
        pool.swapBproofForEth(100 * 10 ** 18, 0);
        vm.stopPrank();

        uint256 k_after = pool.reserveBproof() * pool.reserveEth();

        // K should increase slightly due to fees
        assertTrue(k_after >= k_before);
    }
}
