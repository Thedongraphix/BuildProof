// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { Test, console } from "forge-std/Test.sol";
import { BuilderGovernance } from "../contracts/BuilderGovernance.sol";

contract BuilderGovernanceTest is Test {
    BuilderGovernance public governance;
    address public owner;
    address public voter1;
    address public voter2;
    address public voter3;

    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string title,
        uint256 startTime,
        uint256 endTime
    );

    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);

    function setUp() public {
        owner = address(this);
        voter1 = makeAddr("voter1");
        voter2 = makeAddr("voter2");
        voter3 = makeAddr("voter3");

        governance = new BuilderGovernance();

        // Set up voting power
        governance.updateVotingPower(voter1, 500); // High reputation
        governance.updateVotingPower(voter2, 300);
        governance.updateVotingPower(voter3, 200);
    }

    function test_Constructor() public view {
        assertEq(governance.owner(), owner);
        assertEq(governance.totalProposals(), 0);
        assertEq(governance.totalVotingPower(), 1000);
    }

    function test_CreateProposal() public {
        vm.prank(voter1);
        vm.expectEmit(true, true, false, false);
        emit ProposalCreated(1, voter1, "Test Proposal", block.timestamp, 0);

        uint256 proposalId =
            governance.createProposal("Test Proposal", "This is a test proposal description");

        assertEq(proposalId, 1);
        assertEq(governance.totalProposals(), 1);

        BuilderGovernance.Proposal memory proposal = governance.getProposal(proposalId);
        assertEq(proposal.proposer, voter1);
        assertEq(proposal.title, "Test Proposal");
        assertEq(proposal.forVotes, 0);
        assertEq(proposal.againstVotes, 0);
    }

    function test_RevertCreateProposalInsufficientReputation() public {
        address lowRepVoter = makeAddr("lowRep");
        governance.updateVotingPower(lowRepVoter, 50); // Below MIN_PROPOSAL_REPUTATION

        vm.prank(lowRepVoter);
        vm.expectRevert(BuilderGovernance.InsufficientReputation.selector);
        governance.createProposal("Test", "Description");
    }

    function test_CastVote() public {
        vm.prank(voter1);
        uint256 proposalId = governance.createProposal("Test Proposal", "Description");

        vm.prank(voter2);
        vm.expectEmit(true, true, false, true);
        emit VoteCast(proposalId, voter2, true, 300);

        governance.castVote(proposalId, true);

        BuilderGovernance.Proposal memory proposal = governance.getProposal(proposalId);
        assertEq(proposal.forVotes, 300);
        assertEq(proposal.againstVotes, 0);
    }

    function test_RevertCastVoteAlreadyVoted() public {
        vm.prank(voter1);
        uint256 proposalId = governance.createProposal("Test Proposal", "Description");

        vm.startPrank(voter2);
        governance.castVote(proposalId, true);

        vm.expectRevert(BuilderGovernance.AlreadyVoted.selector);
        governance.castVote(proposalId, true);
        vm.stopPrank();
    }

    function test_RevertCastVoteInvalidProposal() public {
        vm.prank(voter1);
        vm.expectRevert(BuilderGovernance.InvalidProposal.selector);
        governance.castVote(999, true);
    }

    function test_RevertCastVoteNoVotingPower() public {
        vm.prank(voter1);
        uint256 proposalId = governance.createProposal("Test Proposal", "Description");

        address noVotingPower = makeAddr("noVotingPower");

        vm.prank(noVotingPower);
        vm.expectRevert(BuilderGovernance.InvalidVotingPower.selector);
        governance.castVote(proposalId, true);
    }

    function test_VotingAgainst() public {
        vm.prank(voter1);
        uint256 proposalId = governance.createProposal("Test Proposal", "Description");

        vm.prank(voter2);
        governance.castVote(proposalId, false);

        BuilderGovernance.Proposal memory proposal = governance.getProposal(proposalId);
        assertEq(proposal.forVotes, 0);
        assertEq(proposal.againstVotes, 300);
    }

    function test_ProposalSucceeds() public {
        vm.prank(voter1);
        uint256 proposalId = governance.createProposal("Test Proposal", "Description");

        // Vote with majority
        vm.prank(voter1);
        governance.castVote(proposalId, true); // 500 for

        vm.prank(voter2);
        governance.castVote(proposalId, true); // 300 for (total: 800)

        vm.prank(voter3);
        governance.castVote(proposalId, false); // 200 against

        // Fast forward past voting period
        vm.warp(block.timestamp + 8 days);

        BuilderGovernance.ProposalStatus status = governance.getProposalStatus(proposalId);
        assertEq(uint8(status), uint8(BuilderGovernance.ProposalStatus.Succeeded));
    }

    function test_ProposalDefeated() public {
        vm.prank(voter1);
        uint256 proposalId = governance.createProposal("Test Proposal", "Description");

        // Vote with majority against
        vm.prank(voter1);
        governance.castVote(proposalId, false); // 500 against

        vm.prank(voter2);
        governance.castVote(proposalId, true); // 300 for

        // Fast forward past voting period
        vm.warp(block.timestamp + 8 days);

        BuilderGovernance.ProposalStatus status = governance.getProposalStatus(proposalId);
        assertEq(uint8(status), uint8(BuilderGovernance.ProposalStatus.Defeated));
    }

    function test_QuorumNotReached() public {
        vm.prank(voter1);
        uint256 proposalId = governance.createProposal("Test Proposal", "Description");

        // Only small vote (need 10% of 1000 = 100 minimum)
        vm.prank(voter3);
        governance.castVote(proposalId, true); // Only 200 votes, but quorum is 100

        // Fast forward past voting period
        vm.warp(block.timestamp + 8 days);

        assertTrue(governance.isQuorumReached(proposalId));
    }

    function test_ExecuteProposal() public {
        vm.prank(voter1);
        uint256 proposalId = governance.createProposal("Test Proposal", "Description");

        // Vote to pass
        vm.prank(voter1);
        governance.castVote(proposalId, true);

        vm.prank(voter2);
        governance.castVote(proposalId, true);

        // Fast forward past voting period
        vm.warp(block.timestamp + 8 days);

        governance.executeProposal(proposalId);

        BuilderGovernance.Proposal memory proposal = governance.getProposal(proposalId);
        assertTrue(proposal.executed);
        assertEq(uint8(proposal.status), uint8(BuilderGovernance.ProposalStatus.Executed));
    }

    function test_RevertExecuteProposalNotSucceeded() public {
        vm.prank(voter1);
        uint256 proposalId = governance.createProposal("Test Proposal", "Description");

        // Vote to fail
        vm.prank(voter1);
        governance.castVote(proposalId, false);

        vm.prank(voter2);
        governance.castVote(proposalId, false);

        // Fast forward past voting period
        vm.warp(block.timestamp + 8 days);

        vm.expectRevert(BuilderGovernance.ProposalNotSucceeded.selector);
        governance.executeProposal(proposalId);
    }

    function test_RevertExecuteProposalVotingNotEnded() public {
        vm.prank(voter1);
        uint256 proposalId = governance.createProposal("Test Proposal", "Description");

        vm.expectRevert(BuilderGovernance.VotingNotActive.selector);
        governance.executeProposal(proposalId);
    }

    function test_CancelProposalByProposer() public {
        vm.prank(voter1);
        uint256 proposalId = governance.createProposal("Test Proposal", "Description");

        vm.prank(voter1);
        governance.cancelProposal(proposalId);

        BuilderGovernance.ProposalStatus status = governance.getProposalStatus(proposalId);
        assertEq(uint8(status), uint8(BuilderGovernance.ProposalStatus.Cancelled));
    }

    function test_CancelProposalByOwner() public {
        vm.prank(voter1);
        uint256 proposalId = governance.createProposal("Test Proposal", "Description");

        governance.cancelProposal(proposalId);

        BuilderGovernance.ProposalStatus status = governance.getProposalStatus(proposalId);
        assertEq(uint8(status), uint8(BuilderGovernance.ProposalStatus.Cancelled));
    }

    function test_RevertCancelProposalUnauthorized() public {
        vm.prank(voter1);
        uint256 proposalId = governance.createProposal("Test Proposal", "Description");

        vm.prank(voter2);
        vm.expectRevert(BuilderGovernance.InsufficientReputation.selector);
        governance.cancelProposal(proposalId);
    }

    function test_UpdateVotingPower() public {
        address newVoter = makeAddr("newVoter");

        governance.updateVotingPower(newVoter, 150);

        assertEq(governance.votingPower(newVoter), 150);
        assertEq(governance.totalVotingPower(), 1150);

        // Update existing voter
        governance.updateVotingPower(voter1, 600);
        assertEq(governance.votingPower(voter1), 600);
        assertEq(governance.totalVotingPower(), 1250);

        // Decrease voting power
        governance.updateVotingPower(voter2, 200);
        assertEq(governance.votingPower(voter2), 200);
        assertEq(governance.totalVotingPower(), 1150);
    }

    function test_PauseAndUnpause() public {
        governance.pause();

        vm.prank(voter1);
        vm.expectRevert();
        governance.createProposal("Test", "Description");

        governance.unpause();

        vm.prank(voter1);
        uint256 proposalId = governance.createProposal("Test", "Description");
        assertEq(proposalId, 1);
    }

    function test_MultipleProposals() public {
        vm.prank(voter1);
        governance.createProposal("Proposal 1", "Description 1");

        vm.prank(voter2);
        governance.createProposal("Proposal 2", "Description 2");

        assertEq(governance.totalProposals(), 2);
    }
}
