// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { Test } from "forge-std/Test.sol";
import { ContractRegistry } from "../contracts/ContractRegistry.sol";

contract ContractRegistryTest is Test {
    ContractRegistry public registry;
    address public owner;
    address public verifier;
    address public user;
    address public testContract;

    event ContractRegistered(
        address indexed contractAddress,
        string name,
        uint256 securityScore,
        address indexed submitter
    );

    event ContractVerified(
        address indexed contractAddress, address indexed verifier, uint256 newSecurityScore
    );

    event VerifierAdded(address indexed verifier);
    event VerifierRemoved(address indexed verifier);

    function setUp() public {
        owner = address(this);
        verifier = makeAddr("verifier");
        user = makeAddr("user");
        testContract = makeAddr("testContract");

        registry = new ContractRegistry();
    }

    // ============ Constructor Tests ============

    function test_Constructor_SetsOwner() public view {
        assertEq(registry.owner(), owner);
    }

    function test_Constructor_OwnerIsVerifier() public view {
        assertTrue(registry.verifiers(owner));
    }

    function test_Constructor_InitialTotalContracts() public view {
        assertEq(registry.totalContracts(), 0);
    }

    // ============ Register Contract Tests ============

    function test_RegisterContract_Success() public {
        vm.expectEmit(true, false, false, true);
        emit ContractRegistered(testContract, "TestContract", 85, owner);

        registry.registerContract(testContract, "TestContract", "1.0.0", 85, "QmTest123");

        ContractRegistry.ContractInfo memory info = registry.getContractInfo(testContract);
        assertEq(info.contractAddress, testContract);
        assertEq(info.name, "TestContract");
        assertEq(info.version, "1.0.0");
        assertEq(info.securityScore, 85);
        assertFalse(info.isVerified);
        assertEq(info.submitter, owner);
        assertEq(info.ipfsHash, "QmTest123");
        assertEq(registry.totalContracts(), 1);
    }

    function test_RegisterContract_RevertsOnZeroAddress() public {
        vm.expectRevert("Invalid contract address");
        registry.registerContract(address(0), "TestContract", "1.0.0", 85, "QmTest123");
    }

    function test_RegisterContract_RevertsOnHighScore() public {
        vm.expectRevert("Security score must be <= 100");
        registry.registerContract(testContract, "TestContract", "1.0.0", 101, "QmTest123");
    }

    function test_RegisterContract_RevertsOnEmptyName() public {
        vm.expectRevert("Contract name cannot be empty");
        registry.registerContract(testContract, "", "1.0.0", 85, "QmTest123");
    }

    function test_RegisterContract_UpdateExisting() public {
        // Register first time
        registry.registerContract(testContract, "TestContract", "1.0.0", 85, "QmTest123");

        // Update registration
        registry.registerContract(testContract, "TestContract", "2.0.0", 90, "QmTest456");

        ContractRegistry.ContractInfo memory info = registry.getContractInfo(testContract);
        assertEq(info.version, "2.0.0");
        assertEq(info.securityScore, 90);
        assertEq(info.ipfsHash, "QmTest456");
        assertEq(registry.totalContracts(), 1); // Should not increment
    }

    function test_RegisterContract_MultipleContracts() public {
        address contract1 = makeAddr("contract1");
        address contract2 = makeAddr("contract2");

        registry.registerContract(contract1, "Contract1", "1.0.0", 85, "QmTest1");
        registry.registerContract(contract2, "Contract2", "1.0.0", 90, "QmTest2");

        assertEq(registry.totalContracts(), 2);
    }

    // ============ Verify Contract Tests ============

    function test_VerifyContract_Success() public {
        registry.registerContract(testContract, "TestContract", "1.0.0", 85, "QmTest123");

        vm.expectEmit(true, true, false, true);
        emit ContractVerified(testContract, owner, 95);

        registry.verifyContract(testContract, 95, "QmVerified123");

        ContractRegistry.ContractInfo memory info = registry.getContractInfo(testContract);
        assertTrue(info.isVerified);
        assertEq(info.securityScore, 95);
        assertEq(info.ipfsHash, "QmVerified123");
    }

    function test_VerifyContract_OnlyVerifier() public {
        registry.registerContract(testContract, "TestContract", "1.0.0", 85, "QmTest123");

        vm.prank(user);
        vm.expectRevert("Only verifiers can call this function");
        registry.verifyContract(testContract, 95, "QmVerified123");
    }

    function test_VerifyContract_RevertsOnUnregistered() public {
        vm.expectRevert("Contract not registered");
        registry.verifyContract(testContract, 95, "QmVerified123");
    }

    function test_VerifyContract_RevertsOnHighScore() public {
        registry.registerContract(testContract, "TestContract", "1.0.0", 85, "QmTest123");

        vm.expectRevert("Security score must be <= 100");
        registry.verifyContract(testContract, 101, "QmVerified123");
    }

    // ============ Verifier Management Tests ============

    function test_AddVerifier_Success() public {
        vm.expectEmit(true, false, false, false);
        emit VerifierAdded(verifier);

        registry.addVerifier(verifier);
        assertTrue(registry.verifiers(verifier));
    }

    function test_AddVerifier_OnlyOwner() public {
        vm.prank(user);
        vm.expectRevert("Only owner can call this function");
        registry.addVerifier(verifier);
    }

    function test_AddVerifier_RevertsOnZeroAddress() public {
        vm.expectRevert("Invalid verifier address");
        registry.addVerifier(address(0));
    }

    function test_AddVerifier_AllowsVerifierToVerify() public {
        registry.registerContract(testContract, "TestContract", "1.0.0", 85, "QmTest123");

        registry.addVerifier(verifier);

        vm.prank(verifier);
        registry.verifyContract(testContract, 95, "QmVerified123");

        ContractRegistry.ContractInfo memory info = registry.getContractInfo(testContract);
        assertTrue(info.isVerified);
    }

    function test_RemoveVerifier_Success() public {
        registry.addVerifier(verifier);
        assertTrue(registry.verifiers(verifier));

        vm.expectEmit(true, false, false, false);
        emit VerifierRemoved(verifier);

        registry.removeVerifier(verifier);
        assertFalse(registry.verifiers(verifier));
    }

    function test_RemoveVerifier_OnlyOwner() public {
        registry.addVerifier(verifier);

        vm.prank(user);
        vm.expectRevert("Only owner can call this function");
        registry.removeVerifier(verifier);
    }

    function test_RemoveVerifier_CannotRemoveOwner() public {
        vm.expectRevert("Cannot remove owner as verifier");
        registry.removeVerifier(owner);
    }

    // ============ Query Tests ============

    function test_IsContractRegistered_True() public {
        registry.registerContract(testContract, "TestContract", "1.0.0", 85, "QmTest123");

        assertTrue(registry.isContractRegistered(testContract));
    }

    function test_IsContractRegistered_False() public view {
        assertFalse(registry.isContractRegistered(testContract));
    }

    function test_GetContractInfo_UnregisteredReturnsZero() public view {
        ContractRegistry.ContractInfo memory info = registry.getContractInfo(testContract);
        assertEq(info.contractAddress, address(0));
        assertEq(info.name, "");
        assertEq(info.securityScore, 0);
    }

    // ============ Ownership Transfer Tests ============

    function test_TransferOwnership_Success() public {
        address newOwner = makeAddr("newOwner");

        registry.transferOwnership(newOwner);

        assertEq(registry.owner(), newOwner);
        assertTrue(registry.verifiers(newOwner));
    }

    function test_TransferOwnership_OnlyOwner() public {
        address newOwner = makeAddr("newOwner");

        vm.prank(user);
        vm.expectRevert("Only owner can call this function");
        registry.transferOwnership(newOwner);
    }

    function test_TransferOwnership_RevertsOnZeroAddress() public {
        vm.expectRevert("Invalid new owner address");
        registry.transferOwnership(address(0));
    }

    function test_TransferOwnership_NewOwnerCanManageVerifiers() public {
        address newOwner = makeAddr("newOwner");
        registry.transferOwnership(newOwner);

        vm.prank(newOwner);
        registry.addVerifier(verifier);

        assertTrue(registry.verifiers(verifier));
    }

    // ============ GetContractsBySecurityScore Tests ============

    function test_GetContractsBySecurityScore_ValidRange() public view {
        address[] memory contracts = registry.getContractsBySecurityScore(50, 100);
        assertEq(contracts.length, 0);
    }

    function test_GetContractsBySecurityScore_RevertsOnInvalidRange() public {
        vm.expectRevert("Invalid score range");
        registry.getContractsBySecurityScore(100, 50);
    }

    function test_GetContractsBySecurityScore_RevertsOnHighMaxScore() public {
        vm.expectRevert("Max score cannot exceed 100");
        registry.getContractsBySecurityScore(0, 101);
    }

    // ============ Fuzz Tests ============

    function testFuzz_RegisterContract_ValidScore(uint256 score) public {
        vm.assume(score <= 100);

        registry.registerContract(testContract, "TestContract", "1.0.0", score, "QmTest123");

        ContractRegistry.ContractInfo memory info = registry.getContractInfo(testContract);
        assertEq(info.securityScore, score);
    }

    function testFuzz_VerifyContract_ValidScore(uint256 score) public {
        vm.assume(score <= 100);

        registry.registerContract(testContract, "TestContract", "1.0.0", 50, "QmTest123");

        registry.verifyContract(testContract, score, "QmVerified");

        ContractRegistry.ContractInfo memory info = registry.getContractInfo(testContract);
        assertEq(info.securityScore, score);
        assertTrue(info.isVerified);
    }

    // ============ Integration Tests ============

    function test_Integration_FullWorkflow() public {
        // 1. Register contract as user
        vm.prank(user);
        registry.registerContract(testContract, "TestContract", "1.0.0", 75, "QmTest123");

        // 2. Add verifier
        registry.addVerifier(verifier);

        // 3. Verifier reviews and verifies
        vm.prank(verifier);
        registry.verifyContract(testContract, 85, "QmVerified123");

        // 4. Check final state
        ContractRegistry.ContractInfo memory info = registry.getContractInfo(testContract);
        assertEq(info.contractAddress, testContract);
        assertEq(info.name, "TestContract");
        assertEq(info.version, "1.0.0");
        assertEq(info.securityScore, 85);
        assertTrue(info.isVerified);
        assertEq(info.submitter, user);
        assertEq(info.ipfsHash, "QmVerified123");
    }
}
