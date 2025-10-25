// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BuilderGovernance
 * @dev Governance contract for BuildProof platform decisions
 * @notice Allows builders to create and vote on platform proposals
 */
contract BuilderGovernance is Ownable, Pausable, ReentrancyGuard {
    /// @dev Enum for proposal status
    enum ProposalStatus {
        Pending,
        Active,
        Succeeded,
        Defeated,
        Executed,
        Cancelled
    }

    /// @dev Struct to store proposal information
    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 startTime;
        uint256 endTime;
        ProposalStatus status;
        bool executed;
    }

    /// @dev Counter for proposal IDs
    uint256 private _proposalIdCounter;

    /// @dev Mapping from proposal ID to proposal data
    mapping(uint256 => Proposal) public proposals;

    /// @dev Mapping from proposal ID to voter address to vote cast
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    /// @dev Mapping from proposal ID to voter address to vote choice (true = for, false = against)
    mapping(uint256 => mapping(address => bool)) public voteChoice;

    /// @dev Minimum reputation required to create proposal
    uint256 public constant MIN_PROPOSAL_REPUTATION = 100;

    /// @dev Voting period duration (7 days)
    uint256 public constant VOTING_PERIOD = 7 days;

    /// @dev Quorum percentage (10% = 1000 basis points)
    uint256 public constant QUORUM_BASIS_POINTS = 1000;

    /// @dev Basis points divisor
    uint256 public constant BASIS_POINTS_DIVISOR = 10000;

    /// @dev Total voting power in the system
    uint256 public totalVotingPower;

    /// @dev Mapping from address to voting power (reputation-based)
    mapping(address => uint256) public votingPower;

    /// @notice Emitted when a new proposal is created
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string title,
        uint256 startTime,
        uint256 endTime
    );

    /// @notice Emitted when a vote is cast
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);

    /// @notice Emitted when a proposal is executed
    event ProposalExecuted(uint256 indexed proposalId);

    /// @notice Emitted when a proposal is cancelled
    event ProposalCancelled(uint256 indexed proposalId);

    /// @notice Emitted when voting power is updated
    event VotingPowerUpdated(address indexed account, uint256 newPower);

    /// @dev Custom errors for gas efficiency
    error InsufficientReputation();
    error InvalidProposal();
    error VotingNotActive();
    error AlreadyVoted();
    error ProposalNotSucceeded();
    error ProposalAlreadyExecuted();
    error InvalidVotingPower();

    /**
     * @dev Constructor sets the contract owner
     */
    constructor() Ownable(msg.sender) {
        _proposalIdCounter = 1;
    }

    /**
     * @notice Create a new governance proposal
     * @param title Proposal title
     * @param description Detailed proposal description
     * @return uint256 Proposal ID
     */
    function createProposal(
        string calldata title,
        string calldata description
    )
        external
        whenNotPaused
        returns (uint256)
    {
        if (votingPower[msg.sender] < MIN_PROPOSAL_REPUTATION) {
            revert InsufficientReputation();
        }

        uint256 proposalId = _proposalIdCounter;
        _proposalIdCounter++;

        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + VOTING_PERIOD;

        proposals[proposalId] = Proposal({
            id: proposalId,
            proposer: msg.sender,
            title: title,
            description: description,
            forVotes: 0,
            againstVotes: 0,
            startTime: startTime,
            endTime: endTime,
            status: ProposalStatus.Active,
            executed: false
        });

        emit ProposalCreated(proposalId, msg.sender, title, startTime, endTime);

        return proposalId;
    }

    /**
     * @notice Cast a vote on a proposal
     * @param proposalId ID of the proposal
     * @param support True for yes, false for no
     */
    function castVote(uint256 proposalId, bool support) external whenNotPaused nonReentrant {
        Proposal storage proposal = proposals[proposalId];

        if (proposal.id == 0) revert InvalidProposal();
        if (block.timestamp < proposal.startTime || block.timestamp > proposal.endTime) {
            revert VotingNotActive();
        }
        if (hasVoted[proposalId][msg.sender]) revert AlreadyVoted();
        if (votingPower[msg.sender] == 0) revert InvalidVotingPower();

        uint256 weight = votingPower[msg.sender];

        hasVoted[proposalId][msg.sender] = true;
        voteChoice[proposalId][msg.sender] = support;

        if (support) {
            proposal.forVotes += weight;
        } else {
            proposal.againstVotes += weight;
        }

        emit VoteCast(proposalId, msg.sender, support, weight);
    }

    /**
     * @notice Execute a successful proposal
     * @param proposalId ID of the proposal to execute
     */
    function executeProposal(uint256 proposalId) external onlyOwner nonReentrant {
        Proposal storage proposal = proposals[proposalId];

        if (proposal.id == 0) revert InvalidProposal();
        if (proposal.executed) revert ProposalAlreadyExecuted();
        if (block.timestamp <= proposal.endTime) revert VotingNotActive();

        _updateProposalStatus(proposalId);

        if (proposal.status != ProposalStatus.Succeeded) {
            revert ProposalNotSucceeded();
        }

        proposal.executed = true;
        proposal.status = ProposalStatus.Executed;

        emit ProposalExecuted(proposalId);
    }

    /**
     * @notice Cancel a proposal (only by proposer or owner)
     * @param proposalId ID of the proposal to cancel
     */
    function cancelProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];

        if (proposal.id == 0) revert InvalidProposal();
        if (msg.sender != proposal.proposer && msg.sender != owner()) {
            revert InsufficientReputation();
        }
        if (proposal.executed) revert ProposalAlreadyExecuted();

        proposal.status = ProposalStatus.Cancelled;

        emit ProposalCancelled(proposalId);
    }

    /**
     * @notice Update voting power for an account (called by reputation contract)
     * @param account Address to update
     * @param newPower New voting power amount
     */
    function updateVotingPower(address account, uint256 newPower) external onlyOwner {
        uint256 oldPower = votingPower[account];

        if (oldPower < newPower) {
            totalVotingPower += (newPower - oldPower);
        } else if (oldPower > newPower) {
            totalVotingPower -= (oldPower - newPower);
        }

        votingPower[account] = newPower;

        emit VotingPowerUpdated(account, newPower);
    }

    /**
     * @notice Get proposal details
     * @param proposalId ID of the proposal
     * @return Proposal struct
     */
    function getProposal(uint256 proposalId) external view returns (Proposal memory) {
        return proposals[proposalId];
    }

    /**
     * @notice Get current proposal status
     * @param proposalId ID of the proposal
     * @return ProposalStatus Current status
     */
    function getProposalStatus(uint256 proposalId) external view returns (ProposalStatus) {
        Proposal memory proposal = proposals[proposalId];
        if (proposal.id == 0) revert InvalidProposal();

        if (proposal.executed) return ProposalStatus.Executed;
        if (proposal.status == ProposalStatus.Cancelled) return ProposalStatus.Cancelled;
        if (block.timestamp <= proposal.endTime) return ProposalStatus.Active;

        return _checkProposalOutcome(proposal);
    }

    /**
     * @notice Check if quorum is reached for a proposal
     * @param proposalId ID of the proposal
     * @return bool True if quorum reached
     */
    function isQuorumReached(uint256 proposalId) public view returns (bool) {
        Proposal memory proposal = proposals[proposalId];
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes;
        uint256 requiredQuorum = (totalVotingPower * QUORUM_BASIS_POINTS) / BASIS_POINTS_DIVISOR;

        return totalVotes >= requiredQuorum;
    }

    /**
     * @dev Internal function to update proposal status after voting ends
     * @param proposalId ID of the proposal
     */
    function _updateProposalStatus(uint256 proposalId) private {
        Proposal storage proposal = proposals[proposalId];
        proposal.status = _checkProposalOutcome(proposal);
    }

    /**
     * @dev Internal function to check proposal outcome
     * @param proposal Proposal struct
     * @return ProposalStatus Outcome status
     */
    function _checkProposalOutcome(Proposal memory proposal)
        private
        view
        returns (ProposalStatus)
    {
        if (!isQuorumReached(proposal.id)) return ProposalStatus.Defeated;

        return proposal.forVotes > proposal.againstVotes
            ? ProposalStatus.Succeeded
            : ProposalStatus.Defeated;
    }

    /**
     * @notice Pause the contract (emergency stop)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Get total number of proposals
     * @return uint256 Total proposals created
     */
    function totalProposals() external view returns (uint256) {
        return _proposalIdCounter - 1;
    }
}
