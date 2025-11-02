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
 * @title BuilderEscrow
 * @dev Secure milestone-based escrow system for builders with dispute resolution
 * @author BuildProof Team
 */
contract BuilderEscrow is Ownable2Step, ReentrancyGuard, Pausable {
    /// @dev Custom errors for gas efficiency
    error OnlyClient();
    error OnlyBuilder();
    error EscrowDoesNotExist();
    error EscrowNotActive();
    error InvalidBuilderAddress();
    error ClientAndBuilderCannotBeSame();
    error ProjectTitleEmpty();
    error MustHaveAtLeastOneMilestone();
    error MilestoneAmountMustBeGreaterThanZero();
    error MilestoneDeadlineMustBeInFuture();
    error SentValueMustEqualTotalMilestoneAmounts();
    error InvalidMilestoneIndex();
    error MilestoneAlreadyCompleted();
    error MilestoneAlreadyApproved();
    error MilestoneIsDisputed();
    error MilestoneNotCompletedByBuilder();
    error CannotApproveDisputedMilestone();
    error TransferToBuilderFailed();
    error CanOnlyDisputeCompletedMilestones();
    error CannotDisputeApprovedMilestone();
    error MilestoneAlreadyDisputed();
    error MilestoneNotDisputed();
    error CannotCancelAfterMilestoneApproval();
    error RefundToClientFailed();
    error FeeCannotExceed10Percent();
    error FeeWithdrawalFailed();
    error OnlyClientOrBuilderCanDispute();

    struct Milestone {
        string description;
        uint256 amount;
        uint256 deadline;
        bool completed;
        bool approved;
        bool disputed;
    }

    struct Escrow {
        uint256 escrowId;
        address client;
        address builder;
        string projectTitle;
        uint256 totalAmount;
        uint256 releasedAmount;
        EscrowStatus status;
        uint256 createdAt;
        uint256 milestoneCount;
        mapping(uint256 => Milestone) milestones;
    }

    enum EscrowStatus {
        Active,
        Completed,
        Cancelled,
        Disputed
    }

    struct EscrowInfo {
        uint256 escrowId;
        address client;
        address builder;
        string projectTitle;
        uint256 totalAmount;
        uint256 releasedAmount;
        EscrowStatus status;
        uint256 createdAt;
        uint256 milestoneCount;
    }

    struct MilestoneInfo {
        string description;
        uint256 amount;
        uint256 deadline;
        bool completed;
        bool approved;
        bool disputed;
    }

    mapping(uint256 => Escrow) public escrows;
    mapping(address => uint256[]) public clientEscrows;
    mapping(address => uint256[]) public builderEscrows;

    uint256 public totalEscrows;
    uint256 public platformFee = 25; // 2.5% fee (basis points)
    uint256 public collectedFees;

    IBuilderReputation public reputationContract;
    uint256 public constant REPUTATION_PER_ETH = 100;

    event EscrowCreated(
        uint256 indexed escrowId,
        address indexed client,
        address indexed builder,
        string projectTitle,
        uint256 totalAmount
    );

    event MilestoneAdded(
        uint256 indexed escrowId, uint256 milestoneIndex, string description, uint256 amount
    );

    event MilestoneCompleted(
        uint256 indexed escrowId, uint256 milestoneIndex, address indexed builder
    );

    event MilestoneApproved(
        uint256 indexed escrowId, uint256 milestoneIndex, address indexed client, uint256 amount
    );

    event MilestoneDisputed(uint256 indexed escrowId, uint256 milestoneIndex);

    event DisputeResolved(uint256 indexed escrowId, uint256 milestoneIndex, bool approvedByOwner);

    event EscrowCompleted(uint256 indexed escrowId, uint256 totalReleased);

    event EscrowCancelled(uint256 indexed escrowId, uint256 refundAmount);

    event FeeUpdated(uint256 newFee);

    event ReputationContractUpdated(address indexed newContract);

    modifier onlyClient(uint256 _escrowId) {
        if (escrows[_escrowId].client != msg.sender) revert OnlyClient();
        _;
    }

    modifier onlyBuilder(uint256 _escrowId) {
        if (escrows[_escrowId].builder != msg.sender) revert OnlyBuilder();
        _;
    }

    modifier escrowExists(uint256 _escrowId) {
        if (_escrowId >= totalEscrows) revert EscrowDoesNotExist();
        _;
    }

    modifier escrowActive(uint256 _escrowId) {
        if (escrows[_escrowId].status != EscrowStatus.Active) revert EscrowNotActive();
        _;
    }

    /**
     * @dev Constructor sets the contract owner
     */
    constructor() Ownable(msg.sender) { }

    /**
     * @dev Create a new escrow
     * @param _builder Address of the builder
     * @param _projectTitle Title of the project
     * @param _milestoneDescriptions Array of milestone descriptions
     * @param _milestoneAmounts Array of milestone amounts
     * @param _milestoneDeadlines Array of milestone deadlines
     */
    function createEscrow(
        address _builder,
        string memory _projectTitle,
        string[] memory _milestoneDescriptions,
        uint256[] memory _milestoneAmounts,
        uint256[] memory _milestoneDeadlines
    )
        external
        payable
        whenNotPaused
        returns (uint256)
    {
        if (_builder == address(0)) revert InvalidBuilderAddress();
        if (_builder == msg.sender) revert ClientAndBuilderCannotBeSame();
        if (bytes(_projectTitle).length == 0) revert ProjectTitleEmpty();
        if (_milestoneDescriptions.length == 0) revert MustHaveAtLeastOneMilestone();
        if (
            _milestoneDescriptions.length != _milestoneAmounts.length
                || _milestoneAmounts.length != _milestoneDeadlines.length
        ) {
            revert MustHaveAtLeastOneMilestone();
        }

        // Calculate total amount
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < _milestoneAmounts.length; i++) {
            if (_milestoneAmounts[i] == 0) revert MilestoneAmountMustBeGreaterThanZero();
            if (_milestoneDeadlines[i] <= block.timestamp) revert MilestoneDeadlineMustBeInFuture();
            totalAmount += _milestoneAmounts[i];
        }

        if (msg.value != totalAmount) revert SentValueMustEqualTotalMilestoneAmounts();

        uint256 escrowId = totalEscrows++;
        Escrow storage escrow = escrows[escrowId];

        escrow.escrowId = escrowId;
        escrow.client = msg.sender;
        escrow.builder = _builder;
        escrow.projectTitle = _projectTitle;
        escrow.totalAmount = totalAmount;
        escrow.releasedAmount = 0;
        escrow.status = EscrowStatus.Active;
        escrow.createdAt = block.timestamp;
        escrow.milestoneCount = _milestoneDescriptions.length;

        // Add milestones
        for (uint256 i = 0; i < _milestoneDescriptions.length; i++) {
            escrow.milestones[i] = Milestone({
                description: _milestoneDescriptions[i],
                amount: _milestoneAmounts[i],
                deadline: _milestoneDeadlines[i],
                completed: false,
                approved: false,
                disputed: false
            });

            emit MilestoneAdded(escrowId, i, _milestoneDescriptions[i], _milestoneAmounts[i]);
        }

        clientEscrows[msg.sender].push(escrowId);
        builderEscrows[_builder].push(escrowId);

        emit EscrowCreated(escrowId, msg.sender, _builder, _projectTitle, totalAmount);

        return escrowId;
    }

    /**
     * @dev Mark milestone as completed by builder
     * @param _escrowId Escrow ID
     * @param _milestoneIndex Index of the milestone
     */
    function completeMilestone(
        uint256 _escrowId,
        uint256 _milestoneIndex
    )
        external
        onlyBuilder(_escrowId)
        escrowExists(_escrowId)
        escrowActive(_escrowId)
    {
        Escrow storage escrow = escrows[_escrowId];
        if (_milestoneIndex >= escrow.milestoneCount) revert InvalidMilestoneIndex();

        Milestone storage milestone = escrow.milestones[_milestoneIndex];
        if (milestone.completed) revert MilestoneAlreadyCompleted();
        if (milestone.approved) revert MilestoneAlreadyApproved();
        if (milestone.disputed) revert MilestoneIsDisputed();

        milestone.completed = true;

        emit MilestoneCompleted(_escrowId, _milestoneIndex, msg.sender);
    }

    /**
     * @dev Approve milestone and release payment
     * @param _escrowId Escrow ID
     * @param _milestoneIndex Index of the milestone
     */
    function approveMilestone(
        uint256 _escrowId,
        uint256 _milestoneIndex
    )
        external
        nonReentrant
        onlyClient(_escrowId)
        escrowExists(_escrowId)
        escrowActive(_escrowId)
    {
        Escrow storage escrow = escrows[_escrowId];
        if (_milestoneIndex >= escrow.milestoneCount) revert InvalidMilestoneIndex();

        Milestone storage milestone = escrow.milestones[_milestoneIndex];
        if (!milestone.completed) revert MilestoneNotCompletedByBuilder();
        if (milestone.approved) revert MilestoneAlreadyApproved();
        if (milestone.disputed) revert CannotApproveDisputedMilestone();

        milestone.approved = true;

        // Calculate fee and payment
        uint256 fee = (milestone.amount * platformFee) / 10_000;
        uint256 builderPayment = milestone.amount - fee;

        collectedFees += fee;
        escrow.releasedAmount += milestone.amount;

        // Transfer payment to builder
        (bool success,) = payable(escrow.builder).call{ value: builderPayment }("");
        if (!success) revert TransferToBuilderFailed();

        // Update reputation if contract is set
        if (address(reputationContract) != address(0)) {
            uint256 reputationPoints = (builderPayment * REPUTATION_PER_ETH) / 1 ether;
            try reputationContract.recordProjectCompletion(
                escrow.builder, builderPayment, reputationPoints
            ) { } catch { }
        }

        emit MilestoneApproved(_escrowId, _milestoneIndex, msg.sender, builderPayment);

        // Check if all milestones are approved
        bool allApproved = true;
        for (uint256 i = 0; i < escrow.milestoneCount; i++) {
            if (!escrow.milestones[i].approved) {
                allApproved = false;
                break;
            }
        }

        if (allApproved) {
            escrow.status = EscrowStatus.Completed;
            emit EscrowCompleted(_escrowId, escrow.releasedAmount);
        }
    }

    /**
     * @dev Dispute a milestone
     * @param _escrowId Escrow ID
     * @param _milestoneIndex Index of the milestone
     */
    function disputeMilestone(
        uint256 _escrowId,
        uint256 _milestoneIndex
    )
        external
        escrowExists(_escrowId)
        escrowActive(_escrowId)
    {
        Escrow storage escrow = escrows[_escrowId];
        if (msg.sender != escrow.client && msg.sender != escrow.builder) {
            revert OnlyClientOrBuilderCanDispute();
        }
        if (_milestoneIndex >= escrow.milestoneCount) revert InvalidMilestoneIndex();

        Milestone storage milestone = escrow.milestones[_milestoneIndex];
        if (!milestone.completed) revert CanOnlyDisputeCompletedMilestones();
        if (milestone.approved) revert CannotDisputeApprovedMilestone();
        if (milestone.disputed) revert MilestoneAlreadyDisputed();

        milestone.disputed = true;
        escrow.status = EscrowStatus.Disputed;

        emit MilestoneDisputed(_escrowId, _milestoneIndex);
    }

    /**
     * @dev Resolve dispute (only owner)
     * @param _escrowId Escrow ID
     * @param _milestoneIndex Index of the milestone
     * @param _approveForBuilder True to approve in favor of builder, false for client
     */
    function resolveDispute(
        uint256 _escrowId,
        uint256 _milestoneIndex,
        bool _approveForBuilder
    )
        external
        nonReentrant
        onlyOwner
        escrowExists(_escrowId)
    {
        Escrow storage escrow = escrows[_escrowId];
        if (_milestoneIndex >= escrow.milestoneCount) revert InvalidMilestoneIndex();

        Milestone storage milestone = escrow.milestones[_milestoneIndex];
        if (!milestone.disputed) revert MilestoneNotDisputed();

        milestone.disputed = false;
        escrow.status = EscrowStatus.Active;

        if (_approveForBuilder) {
            milestone.approved = true;

            // Calculate fee and payment
            uint256 fee = (milestone.amount * platformFee) / 10_000;
            uint256 builderPayment = milestone.amount - fee;

            collectedFees += fee;
            escrow.releasedAmount += milestone.amount;

            // Transfer payment to builder
            (bool success,) = payable(escrow.builder).call{ value: builderPayment }("");
            if (!success) revert TransferToBuilderFailed();

            emit MilestoneApproved(_escrowId, _milestoneIndex, owner(), builderPayment);
        } else {
            // Refund not implemented in this simple version
            // In production, you might want to allow partial refunds
            milestone.completed = false;
        }

        emit DisputeResolved(_escrowId, _milestoneIndex, _approveForBuilder);

        // Check if all milestones are done
        bool allApproved = true;
        for (uint256 i = 0; i < escrow.milestoneCount; i++) {
            if (!escrow.milestones[i].approved) {
                allApproved = false;
                break;
            }
        }

        if (allApproved) {
            escrow.status = EscrowStatus.Completed;
            emit EscrowCompleted(_escrowId, escrow.releasedAmount);
        }
    }

    /**
     * @dev Cancel escrow (only if no milestones approved)
     * @param _escrowId Escrow ID
     */
    function cancelEscrow(uint256 _escrowId)
        external
        nonReentrant
        onlyClient(_escrowId)
        escrowExists(_escrowId)
        escrowActive(_escrowId)
    {
        Escrow storage escrow = escrows[_escrowId];

        // Check that no milestones have been approved
        for (uint256 i = 0; i < escrow.milestoneCount; i++) {
            if (escrow.milestones[i].approved) revert CannotCancelAfterMilestoneApproval();
        }

        escrow.status = EscrowStatus.Cancelled;

        // Refund unreleased amount to client
        uint256 refundAmount = escrow.totalAmount - escrow.releasedAmount;

        (bool success,) = payable(escrow.client).call{ value: refundAmount }("");
        if (!success) revert RefundToClientFailed();

        emit EscrowCancelled(_escrowId, refundAmount);
    }

    /**
     * @dev Get escrow information
     * @param _escrowId Escrow ID
     * @return EscrowInfo struct
     */
    function getEscrowInfo(uint256 _escrowId)
        external
        view
        escrowExists(_escrowId)
        returns (EscrowInfo memory)
    {
        Escrow storage escrow = escrows[_escrowId];

        return EscrowInfo({
            escrowId: escrow.escrowId,
            client: escrow.client,
            builder: escrow.builder,
            projectTitle: escrow.projectTitle,
            totalAmount: escrow.totalAmount,
            releasedAmount: escrow.releasedAmount,
            status: escrow.status,
            createdAt: escrow.createdAt,
            milestoneCount: escrow.milestoneCount
        });
    }

    /**
     * @dev Get milestone information
     * @param _escrowId Escrow ID
     * @param _milestoneIndex Milestone index
     * @return MilestoneInfo struct
     */
    function getMilestone(
        uint256 _escrowId,
        uint256 _milestoneIndex
    )
        external
        view
        escrowExists(_escrowId)
        returns (MilestoneInfo memory)
    {
        Escrow storage escrow = escrows[_escrowId];
        if (_milestoneIndex >= escrow.milestoneCount) revert InvalidMilestoneIndex();

        Milestone storage milestone = escrow.milestones[_milestoneIndex];

        return MilestoneInfo({
            description: milestone.description,
            amount: milestone.amount,
            deadline: milestone.deadline,
            completed: milestone.completed,
            approved: milestone.approved,
            disputed: milestone.disputed
        });
    }

    /**
     * @dev Get all milestones for an escrow
     * @param _escrowId Escrow ID
     * @return Array of MilestoneInfo structs
     */
    function getAllMilestones(uint256 _escrowId)
        external
        view
        escrowExists(_escrowId)
        returns (MilestoneInfo[] memory)
    {
        Escrow storage escrow = escrows[_escrowId];
        MilestoneInfo[] memory milestones = new MilestoneInfo[](escrow.milestoneCount);

        for (uint256 i = 0; i < escrow.milestoneCount; i++) {
            Milestone storage milestone = escrow.milestones[i];
            milestones[i] = MilestoneInfo({
                description: milestone.description,
                amount: milestone.amount,
                deadline: milestone.deadline,
                completed: milestone.completed,
                approved: milestone.approved,
                disputed: milestone.disputed
            });
        }

        return milestones;
    }

    /**
     * @dev Get client's escrows
     * @param _client Address of the client
     * @return Array of escrow IDs
     */
    function getClientEscrows(address _client) external view returns (uint256[] memory) {
        return clientEscrows[_client];
    }

    /**
     * @dev Get builder's escrows
     * @param _builder Address of the builder
     * @return Array of escrow IDs
     */
    function getBuilderEscrows(address _builder) external view returns (uint256[] memory) {
        return builderEscrows[_builder];
    }

    /**
     * @dev Update platform fee (only owner)
     * @param _newFee New fee in basis points (100 = 1%)
     */
    function updatePlatformFee(uint256 _newFee) external onlyOwner {
        if (_newFee > 1000) revert FeeCannotExceed10Percent();
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
        if (!success) revert FeeWithdrawalFailed();
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
