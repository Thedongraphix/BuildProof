// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/**
 * @title BuilderEscrow
 * @dev Secure milestone-based escrow system for builders with dispute resolution
 * @author BuildProof Team
 */
contract BuilderEscrow {
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
    address public owner;
    uint256 public collectedFees;

    event EscrowCreated(
        uint256 indexed escrowId,
        address indexed client,
        address indexed builder,
        string projectTitle,
        uint256 totalAmount
    );

    event MilestoneAdded(uint256 indexed escrowId, uint256 milestoneIndex, string description, uint256 amount);

    event MilestoneCompleted(uint256 indexed escrowId, uint256 milestoneIndex, address indexed builder);

    event MilestoneApproved(
        uint256 indexed escrowId, uint256 milestoneIndex, address indexed client, uint256 amount
    );

    event MilestoneDisputed(uint256 indexed escrowId, uint256 milestoneIndex);

    event DisputeResolved(uint256 indexed escrowId, uint256 milestoneIndex, bool approvedByOwner);

    event EscrowCompleted(uint256 indexed escrowId, uint256 totalReleased);

    event EscrowCancelled(uint256 indexed escrowId, uint256 refundAmount);

    event FeeUpdated(uint256 newFee);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyClient(uint256 _escrowId) {
        require(escrows[_escrowId].client == msg.sender, "Only client can call this");
        _;
    }

    modifier onlyBuilder(uint256 _escrowId) {
        require(escrows[_escrowId].builder == msg.sender, "Only builder can call this");
        _;
    }

    modifier escrowExists(uint256 _escrowId) {
        require(_escrowId < totalEscrows, "Escrow does not exist");
        _;
    }

    modifier escrowActive(uint256 _escrowId) {
        require(escrows[_escrowId].status == EscrowStatus.Active, "Escrow is not active");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

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
        returns (uint256)
    {
        require(_builder != address(0), "Invalid builder address");
        require(_builder != msg.sender, "Client and builder cannot be the same");
        require(bytes(_projectTitle).length > 0, "Project title cannot be empty");
        require(_milestoneDescriptions.length > 0, "Must have at least one milestone");
        require(
            _milestoneDescriptions.length == _milestoneAmounts.length
                && _milestoneAmounts.length == _milestoneDeadlines.length,
            "Milestone arrays length mismatch"
        );

        // Calculate total amount
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < _milestoneAmounts.length; i++) {
            require(_milestoneAmounts[i] > 0, "Milestone amount must be greater than 0");
            require(
                _milestoneDeadlines[i] > block.timestamp, "Milestone deadline must be in the future"
            );
            totalAmount += _milestoneAmounts[i];
        }

        require(msg.value == totalAmount, "Sent value must equal total milestone amounts");

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
        require(_milestoneIndex < escrow.milestoneCount, "Invalid milestone index");

        Milestone storage milestone = escrow.milestones[_milestoneIndex];
        require(!milestone.completed, "Milestone already completed");
        require(!milestone.approved, "Milestone already approved");
        require(!milestone.disputed, "Milestone is disputed");

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
        onlyClient(_escrowId)
        escrowExists(_escrowId)
        escrowActive(_escrowId)
    {
        Escrow storage escrow = escrows[_escrowId];
        require(_milestoneIndex < escrow.milestoneCount, "Invalid milestone index");

        Milestone storage milestone = escrow.milestones[_milestoneIndex];
        require(milestone.completed, "Milestone not completed by builder");
        require(!milestone.approved, "Milestone already approved");
        require(!milestone.disputed, "Cannot approve disputed milestone");

        milestone.approved = true;

        // Calculate fee and payment
        uint256 fee = (milestone.amount * platformFee) / 10_000;
        uint256 builderPayment = milestone.amount - fee;

        collectedFees += fee;
        escrow.releasedAmount += milestone.amount;

        // Transfer payment to builder
        (bool success,) = payable(escrow.builder).call{ value: builderPayment }("");
        require(success, "Transfer to builder failed");

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
        require(
            msg.sender == escrow.client || msg.sender == escrow.builder, "Only client or builder can dispute"
        );
        require(_milestoneIndex < escrow.milestoneCount, "Invalid milestone index");

        Milestone storage milestone = escrow.milestones[_milestoneIndex];
        require(milestone.completed, "Can only dispute completed milestones");
        require(!milestone.approved, "Cannot dispute approved milestone");
        require(!milestone.disputed, "Milestone already disputed");

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
        onlyOwner
        escrowExists(_escrowId)
    {
        Escrow storage escrow = escrows[_escrowId];
        require(_milestoneIndex < escrow.milestoneCount, "Invalid milestone index");

        Milestone storage milestone = escrow.milestones[_milestoneIndex];
        require(milestone.disputed, "Milestone is not disputed");

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
            require(success, "Transfer to builder failed");

            emit MilestoneApproved(_escrowId, _milestoneIndex, owner, builderPayment);
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
        onlyClient(_escrowId)
        escrowExists(_escrowId)
        escrowActive(_escrowId)
    {
        Escrow storage escrow = escrows[_escrowId];

        // Check that no milestones have been approved
        for (uint256 i = 0; i < escrow.milestoneCount; i++) {
            require(!escrow.milestones[i].approved, "Cannot cancel after milestone approval");
        }

        escrow.status = EscrowStatus.Cancelled;

        // Refund unreleased amount to client
        uint256 refundAmount = escrow.totalAmount - escrow.releasedAmount;

        (bool success,) = payable(escrow.client).call{ value: refundAmount }("");
        require(success, "Refund to client failed");

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
    function getMilestone(uint256 _escrowId, uint256 _milestoneIndex)
        external
        view
        escrowExists(_escrowId)
        returns (MilestoneInfo memory)
    {
        Escrow storage escrow = escrows[_escrowId];
        require(_milestoneIndex < escrow.milestoneCount, "Invalid milestone index");

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
        require(_newFee <= 1000, "Fee cannot exceed 10%");
        platformFee = _newFee;
        emit FeeUpdated(_newFee);
    }

    /**
     * @dev Withdraw collected fees (only owner)
     */
    function withdrawFees() external onlyOwner {
        uint256 amount = collectedFees;
        collectedFees = 0;

        (bool success,) = payable(owner).call{ value: amount }("");
        require(success, "Fee withdrawal failed");
    }

    /**
     * @dev Transfer ownership (only owner)
     * @param _newOwner Address of the new owner
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid new owner address");
        owner = _newOwner;
    }
}
