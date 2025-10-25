// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "../contracts/BuildProofToken.sol";

contract BuildProofTokenTest is Test {
    BuildProofToken public token;
    address public owner;
    address public minter;
    address public user1;
    address public user2;
    address public treasury;

    uint256 constant INITIAL_SUPPLY = 100_000_000 * 10 ** 18;

    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event TransferTaxUpdated(uint256 oldRate, uint256 newRate);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);

    function setUp() public {
        owner = address(this);
        minter = makeAddr("minter");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        treasury = makeAddr("treasury");

        token = new BuildProofToken(INITIAL_SUPPLY);
    }

    function testInitialState() public view {
        assertEq(token.name(), "BuildProof Token");
        assertEq(token.symbol(), "BPROOF");
        assertEq(token.decimals(), 18);
        assertEq(token.totalSupply(), INITIAL_SUPPLY);
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY);
        assertEq(token.owner(), owner);
    }

    function testMintingByOwner() public {
        uint256 mintAmount = 1000 * 10 ** 18;
        token.mint(user1, mintAmount);

        assertEq(token.balanceOf(user1), mintAmount);
        assertEq(token.totalSupply(), INITIAL_SUPPLY + mintAmount);
    }

    function testAddMinter() public {
        vm.expectEmit(true, false, false, true);
        emit MinterAdded(minter);

        token.addMinter(minter);
        assertTrue(token.minters(minter));
    }

    function testMintingByAuthorizedMinter() public {
        token.addMinter(minter);

        uint256 mintAmount = 1000 * 10 ** 18;

        vm.prank(minter);
        token.mint(user1, mintAmount);

        assertEq(token.balanceOf(user1), mintAmount);
    }

    function testRevertWhenMintingByUnauthorized() public {
        vm.prank(user1);
        vm.expectRevert();
        token.mint(user2, 1000 * 10 ** 18);
    }

    function testRevertWhenMintExceedingMaxSupply() public {
        uint256 excessAmount = token.MAX_SUPPLY() + 1;
        vm.expectRevert();
        token.mint(user1, excessAmount);
    }

    function testRemoveMinter() public {
        token.addMinter(minter);
        assertTrue(token.minters(minter));

        vm.expectEmit(true, false, false, true);
        emit MinterRemoved(minter);

        token.removeMinter(minter);
        assertFalse(token.minters(minter));
    }

    function testTransferWithoutTax() public {
        uint256 transferAmount = 1000 * 10 ** 18;
        token.transfer(user1, transferAmount);

        assertEq(token.balanceOf(user1), transferAmount);
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY - transferAmount);
    }

    function testSetTransferTax() public {
        uint256 newTaxRate = 100; // 1%

        vm.expectEmit(false, false, false, true);
        emit TransferTaxUpdated(0, newTaxRate);

        token.setTransferTax(newTaxRate);
        assertEq(token.transferTaxBasisPoints(), newTaxRate);
    }

    function testTransferWithTax() public {
        // Set 1% tax
        token.setTransferTax(100);

        // Give user1 some tokens
        token.transfer(user1, 10000 * 10 ** 18);

        // User1 transfers to user2 (should incur tax)
        vm.prank(user1);
        uint256 transferAmount = 1000 * 10 ** 18;
        token.transfer(user2, transferAmount);

        // Calculate expected values
        uint256 expectedTax = (transferAmount * 100) / 10000; // 1%
        uint256 expectedReceived = transferAmount - expectedTax;

        assertEq(token.balanceOf(user2), expectedReceived);
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY - 10000 * 10 ** 18 + expectedTax);
    }

    function testSetTreasury() public {
        vm.expectEmit(true, true, false, true);
        emit TreasuryUpdated(owner, treasury);

        token.setTreasury(treasury);
        assertEq(token.treasury(), treasury);
        assertTrue(token.taxExempt(treasury));
    }

    function testTaxExemption() public {
        token.setTransferTax(100); // 1% tax
        token.setTaxExemption(user1, true);

        // Transfer from owner to user1 (owner is exempt)
        uint256 transferAmount = 1000 * 10 ** 18;
        token.transfer(user1, transferAmount);

        // user1 transfers to user2 (user1 is exempt, no tax)
        vm.prank(user1);
        token.transfer(user2, transferAmount);

        assertEq(token.balanceOf(user2), transferAmount);
    }

    function testPauseUnpause() public {
        token.pause();

        // Should fail when paused
        vm.expectRevert();
        token.transfer(user1, 100);

        token.unpause();

        // Should work after unpause
        token.transfer(user1, 100);
        assertEq(token.balanceOf(user1), 100);
    }

    function testDelegation() public {
        // Transfer some tokens to user1
        token.transfer(user1, 1000 * 10 ** 18);

        // User1 delegates to user2
        vm.prank(user1);
        token.delegate(user2);

        assertEq(token.getVotes(user2), 1000 * 10 ** 18);
    }

    function testBurning() public {
        uint256 burnAmount = 1000 * 10 ** 18;
        uint256 initialSupply = token.totalSupply();

        token.burn(burnAmount);

        assertEq(token.totalSupply(), initialSupply - burnAmount);
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY - burnAmount);
    }

    function testPermit() public {
        uint256 privateKey = 0xA11CE;
        address alice = vm.addr(privateKey);

        token.transfer(alice, 1000 * 10 ** 18);

        uint256 nonce = token.nonces(alice);
        uint256 deadline = block.timestamp + 1 hours;

        bytes32 permitHash = keccak256(
            abi.encode(
                keccak256(
                    "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
                ),
                alice,
                user1,
                500 * 10 ** 18,
                nonce,
                deadline
            )
        );

        bytes32 digest =
            keccak256(abi.encodePacked("\x19\x01", token.DOMAIN_SEPARATOR(), permitHash));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, digest);

        token.permit(alice, user1, 500 * 10 ** 18, deadline, v, r, s);

        assertEq(token.allowance(alice, user1), 500 * 10 ** 18);
    }

    function testRevertWhenSetTransferTaxTooHigh() public {
        vm.expectRevert();
        token.setTransferTax(501); // Over 5% limit
    }

    function testRevertWhenSetZeroTreasury() public {
        vm.expectRevert();
        token.setTreasury(address(0));
    }

    function testRevertWhenAddZeroAddressMinter() public {
        vm.expectRevert();
        token.addMinter(address(0));
    }
}
