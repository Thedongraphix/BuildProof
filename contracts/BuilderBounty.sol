// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title BuilderBounty
 * @dev A decentralized bounty system for builders to post and claim rewards
 * @author BuildProof Team
 */
contract BuilderBounty is Ownable2Step, ReentrancyGuard, Pausable {
    struct Bounty {
        uint256 bountyId;
        address creator;
        string title;
        string description;
        uint256 reward;
        uint256 deadline;
        BountyStatus status;
        address claimer;
        string ipfsSubmission;
        uint256 createdAt;
    }

    enum BountyStatus {
        Open,
        Claimed,
        UnderReview,
        Completed,
        Cancelled
    }

    mapping(uint256 => Bounty) public bounties;
    mapping(address => uint256[]) public creatorBounties;
    mapping(address => uint256[]) public claimerBounties;

    uint256 public totalBounties;
    uint256 public platformFee = 25; // 2.5% fee (basis points)
    uint256 public collectedFees;

    /// @dev Custom errors for gas efficiency
    error InvalidReward();
    error InvalidDeadline();
    error EmptyTitle();
    error BountyNotOpen();
    error DeadlinePassed();
    error CannotClaimOwnBounty();
    error OnlyClaimerCanSubmit();
    error BountyNotClaimed();
    error EmptySubmission();
    error BountyNotUnderReview();
    error OnlyCreatorAllowed();
    error CanOnlyCancelOpenBounties();
    error TransferFailed();
    error FeeTooHigh();
    error InvalidOwnerAddress();

    event BountyCreated(
        uint256 indexed bountyId,
        address indexed creator,
        string title,
        uint256 reward,
        uint256 deadline
    );

    event BountyClaimed(uint256 indexed bountyId, address indexed claimer);

    event SubmissionMade(uint256 indexed bountyId, address indexed claimer, string ipfsSubmission);

    event BountyCompleted(uint256 indexed bountyId, address indexed claimer, uint256 reward);

    event BountyCancelled(uint256 indexed bountyId, address indexed creator);

    event FeeUpdated(uint256 newFee);

    modifier onlyCreator(uint256 _bountyId) {
        if (bounties[_bountyId].creator != msg.sender) revert OnlyCreatorAllowed();
        _;
    }

    /**
     * @dev Constructor sets the contract owner
     */
    constructor() Ownable(msg.sender) { }

    /**
     * @dev Create a new bounty
     * @param _title Bounty title
     * @param _description Bounty description
     * @param _deadline Unix timestamp for deadline
     */
    function createBounty(
        string memory _title,
        string memory _description,
        uint256 _deadline
    )
        external
        payable
        whenNotPaused
        returns (uint256)
    {
        if (msg.value == 0) revert InvalidReward();
        if (_deadline <= block.timestamp) revert InvalidDeadline();
        if (bytes(_title).length == 0) revert EmptyTitle();

        uint256 bountyId = totalBounties++;

        bounties[bountyId] = Bounty({
            bountyId: bountyId,
            creator: msg.sender,
            title: _title,
            description: _description,
            reward: msg.value,
            deadline: _deadline,
            status: BountyStatus.Open,
            claimer: address(0),
            ipfsSubmission: "",
            createdAt: block.timestamp
        });

        creatorBounties[msg.sender].push(bountyId);

        emit BountyCreated(bountyId, msg.sender, _title, msg.value, _deadline);

        return bountyId;
    }

    /**
     * @dev Claim a bounty
     * @param _bountyId ID of the bounty to claim
     */
    function claimBounty(uint256 _bountyId) external whenNotPaused {
        Bounty storage bounty = bounties[_bountyId];

        if (bounty.status != BountyStatus.Open) revert BountyNotOpen();
        if (block.timestamp >= bounty.deadline) revert DeadlinePassed();
        if (bounty.creator == msg.sender) revert CannotClaimOwnBounty();

        bounty.status = BountyStatus.Claimed;
        bounty.claimer = msg.sender;

        claimerBounties[msg.sender].push(_bountyId);

        emit BountyClaimed(_bountyId, msg.sender);
    }

    /**
     * @dev Submit work for a bounty
     * @param _bountyId ID of the bounty
     * @param _ipfsHash IPFS hash of the submission
     */
    function submitWork(uint256 _bountyId, string memory _ipfsHash) external {
        Bounty storage bounty = bounties[_bountyId];

        if (bounty.claimer != msg.sender) revert OnlyClaimerCanSubmit();
        if (bounty.status != BountyStatus.Claimed) revert BountyNotClaimed();
        if (bytes(_ipfsHash).length == 0) revert EmptySubmission();

        bounty.status = BountyStatus.UnderReview;
        bounty.ipfsSubmission = _ipfsHash;

        emit SubmissionMade(_bountyId, msg.sender, _ipfsHash);
    }

    /**
     * @dev Approve and complete a bounty (only creator)
     * @param _bountyId ID of the bounty to approve
     */
    function approveBounty(uint256 _bountyId) external nonReentrant onlyCreator(_bountyId) {
        Bounty storage bounty = bounties[_bountyId];

        if (bounty.status != BountyStatus.UnderReview) revert BountyNotUnderReview();

        bounty.status = BountyStatus.Completed;

        // Calculate platform fee
        uint256 fee = (bounty.reward * platformFee) / 10_000;
        uint256 claimerReward = bounty.reward - fee;

        collectedFees += fee;

        // Transfer reward to claimer
        (bool success,) = payable(bounty.claimer).call{ value: claimerReward }("");
        if (!success) revert TransferFailed();

        emit BountyCompleted(_bountyId, bounty.claimer, claimerReward);
    }

    /**
     * @dev Cancel a bounty and refund creator (only before it's claimed)
     * @param _bountyId ID of the bounty to cancel
     */
    function cancelBounty(uint256 _bountyId) external nonReentrant onlyCreator(_bountyId) {
        Bounty storage bounty = bounties[_bountyId];

        if (bounty.status != BountyStatus.Open) revert CanOnlyCancelOpenBounties();

        bounty.status = BountyStatus.Cancelled;

        // Refund creator
        (bool success,) = payable(bounty.creator).call{ value: bounty.reward }("");
        if (!success) revert TransferFailed();

        emit BountyCancelled(_bountyId, msg.sender);
    }

    /**
     * @dev Get bounty details
     * @param _bountyId ID of the bounty
     * @return Bounty struct
     */
    function getBounty(uint256 _bountyId) external view returns (Bounty memory) {
        return bounties[_bountyId];
    }

    /**
     * @dev Get all bounties created by an address
     * @param _creator Address of the creator
     * @return Array of bounty IDs
     */
    function getCreatorBounties(address _creator) external view returns (uint256[] memory) {
        return creatorBounties[_creator];
    }

    /**
     * @dev Get all bounties claimed by an address
     * @param _claimer Address of the claimer
     * @return Array of bounty IDs
     */
    function getClaimerBounties(address _claimer) external view returns (uint256[] memory) {
        return claimerBounties[_claimer];
    }

    /**
     * @dev Update platform fee (only owner)
     * @param _newFee New fee in basis points (100 = 1%)
     */
    function updatePlatformFee(uint256 _newFee) external onlyOwner {
        if (_newFee > 1000) revert FeeTooHigh();
        platformFee = _newFee;
        emit FeeUpdated(_newFee);
    }

    /**
     * @dev Withdraw collected fees (only owner)
     */
    function withdrawFees() external nonReentrant onlyOwner {
        uint256 amount = collectedFees;
        collectedFees = 0;

        (bool success,) = payable(owner()).call{ value: amount }("");
        if (!success) revert TransferFailed();
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
}
