// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

interface IBuilderReputation {
    function recordProjectCompletion(
        address _builder,
        uint256 _earnings,
        uint256 _reputationPoints
    )
        external;
}

/**
 * @title BuilderBounty
 * @dev A decentralized bounty system for builders to post and claim rewards
 * @author BuildProof Team
 */
contract BuilderBounty is Ownable2Step, ReentrancyGuard, Pausable {
    struct Submission {
        address submitter;
        string ipfsHash;
        uint256 submittedAt;
        SubmissionStatus status;
        string reviewNotes;
    }

    enum SubmissionStatus {
        Pending,
        UnderReview,
        Approved,
        Rejected
    }

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
        bool allowsMultipleSubmissions;
        uint256 maxSubmissions;
        uint256 submissionCount;
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
    mapping(uint256 => Submission[]) public bountySubmissions;
    mapping(uint256 => mapping(address => bool)) public hasSubmitted;

    uint256 public totalBounties;
    uint256 public platformFee = 25; // 2.5% fee (basis points)
    uint256 public collectedFees;

    IBuilderReputation public reputationContract;
    uint256 public constant REPUTATION_PER_ETH = 100; // 100 reputation points per ETH earned

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
    error AlreadySubmitted();
    error MaxSubmissionsReached();
    error InvalidMaxSubmissions();

    event BountyCreated(
        uint256 indexed bountyId,
        address indexed creator,
        string title,
        uint256 reward,
        uint256 deadline,
        bool allowsMultipleSubmissions,
        uint256 maxSubmissions
    );

    event BountyClaimed(uint256 indexed bountyId, address indexed claimer);

    event SubmissionMade(
        uint256 indexed bountyId, address indexed submitter, string ipfsSubmission
    );

    event SubmissionReviewed(
        uint256 indexed bountyId,
        address indexed submitter,
        uint256 submissionIndex,
        SubmissionStatus status,
        string reviewNotes
    );

    event BountyCompleted(uint256 indexed bountyId, address indexed claimer, uint256 reward);

    event BountyCancelled(uint256 indexed bountyId, address indexed creator);

    event FeeUpdated(uint256 newFee);

    event ReputationContractUpdated(address indexed newContract);

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
     * @param _allowsMultipleSubmissions Whether multiple builders can submit
     * @param _maxSubmissions Maximum number of submissions (0 = unlimited)
     */
    function createBounty(
        string memory _title,
        string memory _description,
        uint256 _deadline,
        bool _allowsMultipleSubmissions,
        uint256 _maxSubmissions
    )
        external
        payable
        whenNotPaused
        returns (uint256)
    {
        if (msg.value == 0) revert InvalidReward();
        if (_deadline <= block.timestamp) revert InvalidDeadline();
        if (bytes(_title).length == 0) revert EmptyTitle();
        if (_allowsMultipleSubmissions && _maxSubmissions == 0) revert InvalidMaxSubmissions();

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
            createdAt: block.timestamp,
            allowsMultipleSubmissions: _allowsMultipleSubmissions,
            maxSubmissions: _maxSubmissions,
            submissionCount: 0
        });

        creatorBounties[msg.sender].push(bountyId);

        emit BountyCreated(
            bountyId,
            msg.sender,
            _title,
            msg.value,
            _deadline,
            _allowsMultipleSubmissions,
            _maxSubmissions
        );

        return bountyId;
    }

    /**
     * @dev Create a simple bounty (backwards compatible)
     * @param _title Bounty title
     * @param _description Bounty description
     * @param _deadline Unix timestamp for deadline
     */
    function createSimpleBounty(
        string memory _title,
        string memory _description,
        uint256 _deadline
    )
        external
        payable
        whenNotPaused
        returns (uint256)
    {
        return this.createBounty{ value: msg.value }(_title, _description, _deadline, false, 1);
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
     * @dev Submit work for a bounty (new multi-submission system)
     * @param _bountyId ID of the bounty
     * @param _ipfsHash IPFS hash of the submission
     */
    function submitWork(uint256 _bountyId, string memory _ipfsHash) external whenNotPaused {
        Bounty storage bounty = bounties[_bountyId];

        if (bounty.status != BountyStatus.Open && bounty.status != BountyStatus.Claimed) {
            revert BountyNotOpen();
        }
        if (block.timestamp >= bounty.deadline) revert DeadlinePassed();
        if (bounty.creator == msg.sender) revert CannotClaimOwnBounty();
        if (bytes(_ipfsHash).length == 0) revert EmptySubmission();

        // Check if multiple submissions are allowed
        if (!bounty.allowsMultipleSubmissions && hasSubmitted[_bountyId][msg.sender]) {
            revert AlreadySubmitted();
        }

        // Check max submissions limit
        if (bounty.maxSubmissions > 0 && bounty.submissionCount >= bounty.maxSubmissions) {
            revert MaxSubmissionsReached();
        }

        // Create submission
        bountySubmissions[_bountyId].push(
            Submission({
                submitter: msg.sender,
                ipfsHash: _ipfsHash,
                submittedAt: block.timestamp,
                status: SubmissionStatus.Pending,
                reviewNotes: ""
            })
        );

        hasSubmitted[_bountyId][msg.sender] = true;
        bounty.submissionCount++;

        if (bounty.status == BountyStatus.Open) {
            bounty.status = BountyStatus.UnderReview;
        }

        emit SubmissionMade(_bountyId, msg.sender, _ipfsHash);
    }

    /**
     * @dev Review a submission (approve or reject)
     * @param _bountyId ID of the bounty
     * @param _submissionIndex Index of the submission to review
     * @param _approve Whether to approve the submission
     * @param _reviewNotes Notes from the review
     */
    function reviewSubmission(
        uint256 _bountyId,
        uint256 _submissionIndex,
        bool _approve,
        string memory _reviewNotes
    )
        external
        onlyCreator(_bountyId)
    {
        Bounty storage bounty = bounties[_bountyId];
        Submission storage submission = bountySubmissions[_bountyId][_submissionIndex];

        if (submission.status != SubmissionStatus.Pending) revert BountyNotUnderReview();

        submission.status = _approve ? SubmissionStatus.Approved : SubmissionStatus.Rejected;
        submission.reviewNotes = _reviewNotes;

        emit SubmissionReviewed(
            _bountyId, submission.submitter, _submissionIndex, submission.status, _reviewNotes
        );
    }

    /**
     * @dev Approve a submission and pay the builder
     * @param _bountyId ID of the bounty
     * @param _submissionIndex Index of the approved submission
     * @param _rewardAmount Amount to pay (can be partial for multi-submission bounties)
     */
    function approveAndPaySubmission(
        uint256 _bountyId,
        uint256 _submissionIndex,
        uint256 _rewardAmount
    )
        external
        nonReentrant
        onlyCreator(_bountyId)
    {
        Bounty storage bounty = bounties[_bountyId];
        Submission storage submission = bountySubmissions[_bountyId][_submissionIndex];

        if (submission.status != SubmissionStatus.Pending) revert BountyNotUnderReview();
        if (_rewardAmount > bounty.reward) revert InvalidReward();

        // Mark as approved
        submission.status = SubmissionStatus.Approved;

        // Calculate fees
        uint256 fee = (_rewardAmount * platformFee) / 10_000;
        uint256 builderPayment = _rewardAmount - fee;

        collectedFees += fee;
        bounty.reward -= _rewardAmount;

        // Transfer reward to builder
        (bool success,) = payable(submission.submitter).call{ value: builderPayment }("");
        if (!success) revert TransferFailed();

        // Update reputation if contract is set
        if (address(reputationContract) != address(0)) {
            uint256 reputationPoints = (builderPayment * REPUTATION_PER_ETH) / 1 ether;
            try reputationContract.recordProjectCompletion(
                submission.submitter, builderPayment, reputationPoints
            ) { } catch { }
        }

        // Mark bounty as completed if all rewards distributed
        if (bounty.reward == 0) {
            bounty.status = BountyStatus.Completed;
        }

        emit BountyCompleted(_bountyId, submission.submitter, builderPayment);
    }

    /**
     * @dev Get all submissions for a bounty
     * @param _bountyId ID of the bounty
     * @return Array of submissions
     */
    function getSubmissions(uint256 _bountyId) external view returns (Submission[] memory) {
        return bountySubmissions[_bountyId];
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

        // Update reputation if contract is set
        if (address(reputationContract) != address(0)) {
            uint256 reputationPoints = (claimerReward * REPUTATION_PER_ETH) / 1 ether;
            try reputationContract.recordProjectCompletion(
                bounty.claimer, claimerReward, reputationPoints
            ) { } catch { }
        }

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
     * @dev Set the reputation contract address for cross-contract integration
     * @param _reputationContract Address of the BuilderReputation contract
     */
    function setReputationContract(address _reputationContract) external onlyOwner {
        reputationContract = IBuilderReputation(_reputationContract);
        emit ReputationContractUpdated(_reputationContract);
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
