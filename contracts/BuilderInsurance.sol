// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title BuilderInsurance
 * @dev Insurance and protection fund for builders and clients
 * Provides coverage for disputes, fraud protection, and builds trust
 * @author BuildProof Team
 */
contract BuilderInsurance is Ownable2Step, ReentrancyGuard, Pausable {
    /// @dev Custom errors for gas efficiency
    error InsufficientStake();
    error InvalidCoverageAmount();
    error PolicyDoesNotExist();
    error PolicyAlreadyActive();
    error PolicyNotActive();
    error PolicyExpired();
    error ClaimAlreadyExists();
    error ClaimDoesNotExist();
    error ClaimAlreadyProcessed();
    error NotPolicyHolder();
    error InvalidDuration();
    error InsufficientPoolBalance();
    error TransferFailed();
    error InvalidBuilderAddress();
    error StakeNotFound();
    error StakeLocked();
    error CannotClaimOwnPolicy();
    error InvalidPremiumRate();

    struct BuilderStake {
        uint256 amount;
        uint256 stakedAt;
        uint256 lockDuration;
        uint256 rewardsClaimed;
        bool isActive;
    }

    struct Policy {
        uint256 policyId;
        uint256 coverageAmount;
        uint256 premiumPaid;
        uint256 startTime;
        uint256 endTime;
        uint256 projectValue;
        address holder;
        address coveredProject;
        PolicyStatus status;
        string projectDescription;
    }

    enum PolicyStatus {
        Active,
        Expired,
        Claimed,
        Cancelled
    }

    struct Claim {
        uint256 claimId;
        uint256 policyId;
        uint256 requestedAmount;
        uint256 approvedAmount;
        uint256 claimedAt;
        address claimant;
        ClaimStatus status;
        string evidence;
        string resolution;
    }

    enum ClaimStatus {
        Pending,
        UnderReview,
        Approved,
        Rejected,
        Paid
    }

    // State variables
    mapping(address => BuilderStake) public builderStakes;
    mapping(uint256 => Policy) public policies;
    mapping(uint256 => Claim) public claims;
    mapping(address => uint256[]) public holderPolicies;
    mapping(uint256 => uint256) public policyClaims;

    uint256 public totalPolicies;
    uint256 public totalClaims;
    uint256 public insurancePool;
    uint256 public totalStaked;
    uint256 public premiumRate = 100; // 1% in basis points (100/10000)
    uint256 public minStakeDuration = 30 days;
    uint256 public maxCoverageRatio = 10; // Max 10x coverage on stake

    event BuilderStaked(address indexed builder, uint256 amount, uint256 lockDuration);
    event StakeWithdrawn(address indexed builder, uint256 amount, uint256 rewards);
    event PolicyCreated(
        uint256 indexed policyId,
        address indexed holder,
        uint256 coverageAmount,
        uint256 premiumPaid,
        uint256 duration
    );
    event PolicyCancelled(uint256 indexed policyId, uint256 refundAmount);
    event ClaimFiled(
        uint256 indexed claimId,
        uint256 indexed policyId,
        address indexed claimant,
        uint256 requestedAmount
    );
    event ClaimReviewed(
        uint256 indexed claimId, ClaimStatus status, uint256 approvedAmount
    );
    event ClaimPaid(uint256 indexed claimId, address indexed claimant, uint256 amount);
    event PremiumRateUpdated(uint256 newRate);
    event PoolDeposit(address indexed depositor, uint256 amount);

    modifier policyExists(uint256 _policyId) {
        if (_policyId >= totalPolicies) revert PolicyDoesNotExist();
        _;
    }

    modifier onlyPolicyHolder(uint256 _policyId) {
        if (policies[_policyId].holder != msg.sender) revert NotPolicyHolder();
        _;
    }

    /**
     * @dev Constructor sets the contract owner
     */
    constructor() Ownable(msg.sender) { }

    /**
     * @dev Stake ETH as a builder to unlock insurance benefits
     * @param _lockDuration How long to lock the stake (minimum 30 days)
     */
    function stakeAsBuilder(uint256 _lockDuration) external payable whenNotPaused {
        if (msg.value == 0) revert InsufficientStake();
        if (_lockDuration < minStakeDuration) revert InvalidDuration();
        if (builderStakes[msg.sender].isActive) revert PolicyAlreadyActive();

        builderStakes[msg.sender] = BuilderStake({
            amount: msg.value,
            stakedAt: block.timestamp,
            lockDuration: _lockDuration,
            rewardsClaimed: 0,
            isActive: true
        });

        totalStaked += msg.value;

        emit BuilderStaked(msg.sender, msg.value, _lockDuration);
    }

    /**
     * @dev Withdraw stake after lock period (includes rewards from pool)
     */
    function withdrawStake() external nonReentrant {
        BuilderStake storage stake = builderStakes[msg.sender];
        if (!stake.isActive) revert StakeNotFound();
        if (block.timestamp < stake.stakedAt + stake.lockDuration) revert StakeLocked();

        uint256 stakeAmount = stake.amount;
        uint256 rewards = calculateStakeRewards(msg.sender);
        uint256 totalAmount = stakeAmount + rewards;

        stake.isActive = false;
        totalStaked -= stakeAmount;

        (bool success,) = payable(msg.sender).call{ value: totalAmount }("");
        if (!success) revert TransferFailed();

        emit StakeWithdrawn(msg.sender, stakeAmount, rewards);
    }

    /**
     * @dev Calculate staking rewards based on time and pool performance
     * @param _builder Address of the builder
     * @return Reward amount
     */
    function calculateStakeRewards(address _builder) public view returns (uint256) {
        BuilderStake storage stake = builderStakes[_builder];
        if (!stake.isActive) return 0;

        uint256 stakeDuration = block.timestamp - stake.stakedAt;
        uint256 rewardRate = 500; // 5% APY in basis points
        uint256 reward = (stake.amount * rewardRate * stakeDuration) / (10_000 * 365 days);

        return reward > stake.rewardsClaimed ? reward - stake.rewardsClaimed : 0;
    }

    /**
     * @dev Purchase insurance policy for a project
     * @param _coverageAmount Amount of coverage needed
     * @param _duration Policy duration in seconds
     * @param _projectValue Total value of the project
     * @param _projectDescription Description of the covered project
     * @param _coveredProject Address of the project/contract being insured
     */
    function purchasePolicy(
        uint256 _coverageAmount,
        uint256 _duration,
        uint256 _projectValue,
        string memory _projectDescription,
        address _coveredProject
    )
        external
        payable
        whenNotPaused
        returns (uint256)
    {
        if (_coverageAmount == 0) revert InvalidCoverageAmount();
        if (_duration < 7 days) revert InvalidDuration();

        // Calculate premium based on coverage amount and duration
        uint256 premium = (_coverageAmount * premiumRate * _duration) / (10_000 * 365 days);
        if (msg.value < premium) revert InsufficientStake();

        uint256 policyId = totalPolicies++;

        policies[policyId] = Policy({
            policyId: policyId,
            holder: msg.sender,
            coverageAmount: _coverageAmount,
            premiumPaid: msg.value,
            startTime: block.timestamp,
            endTime: block.timestamp + _duration,
            status: PolicyStatus.Active,
            projectValue: _projectValue,
            projectDescription: _projectDescription,
            coveredProject: _coveredProject
        });

        holderPolicies[msg.sender].push(policyId);
        insurancePool += msg.value;

        emit PolicyCreated(policyId, msg.sender, _coverageAmount, msg.value, _duration);

        // Refund excess payment
        if (msg.value > premium) {
            uint256 refund = msg.value - premium;
            (bool success,) = payable(msg.sender).call{ value: refund }("");
            if (!success) revert TransferFailed();
        }

        return policyId;
    }

    /**
     * @dev Cancel active policy and get partial refund
     * @param _policyId ID of the policy to cancel
     */
    function cancelPolicy(uint256 _policyId)
        external
        nonReentrant
        policyExists(_policyId)
        onlyPolicyHolder(_policyId)
    {
        Policy storage policy = policies[_policyId];
        if (policy.status != PolicyStatus.Active) revert PolicyNotActive();

        policy.status = PolicyStatus.Cancelled;

        // Calculate refund based on remaining time
        uint256 remainingTime = policy.endTime > block.timestamp
            ? policy.endTime - block.timestamp
            : 0;
        uint256 totalDuration = policy.endTime - policy.startTime;
        uint256 refund = (policy.premiumPaid * remainingTime) / totalDuration;

        insurancePool -= refund;

        (bool success,) = payable(msg.sender).call{ value: refund }("");
        if (!success) revert TransferFailed();

        emit PolicyCancelled(_policyId, refund);
    }

    /**
     * @dev File an insurance claim
     * @param _policyId ID of the policy
     * @param _requestedAmount Amount being claimed
     * @param _evidence IPFS hash or description of evidence
     */
    function fileClaim(
        uint256 _policyId,
        uint256 _requestedAmount,
        string memory _evidence
    )
        external
        policyExists(_policyId)
        returns (uint256)
    {
        Policy storage policy = policies[_policyId];
        if (policy.status != PolicyStatus.Active) revert PolicyNotActive();
        if (block.timestamp > policy.endTime) revert PolicyExpired();
        if (_requestedAmount > policy.coverageAmount) revert InvalidCoverageAmount();
        if (policyClaims[_policyId] != 0) revert ClaimAlreadyExists();

        uint256 claimId = totalClaims++;

        claims[claimId] = Claim({
            claimId: claimId,
            policyId: _policyId,
            claimant: msg.sender,
            requestedAmount: _requestedAmount,
            approvedAmount: 0,
            claimedAt: block.timestamp,
            status: ClaimStatus.Pending,
            evidence: _evidence,
            resolution: ""
        });

        policyClaims[_policyId] = claimId;

        emit ClaimFiled(claimId, _policyId, msg.sender, _requestedAmount);

        return claimId;
    }

    /**
     * @dev Review and approve/reject a claim (only owner or authorized adjuster)
     * @param _claimId ID of the claim
     * @param _approve Whether to approve the claim
     * @param _approvedAmount Amount approved (can be less than requested)
     * @param _resolution Resolution notes
     */
    function reviewClaim(
        uint256 _claimId,
        bool _approve,
        uint256 _approvedAmount,
        string memory _resolution
    )
        external
        onlyOwner
    {
        if (_claimId >= totalClaims) revert ClaimDoesNotExist();
        Claim storage claim = claims[_claimId];
        if (claim.status != ClaimStatus.Pending && claim.status != ClaimStatus.UnderReview) {
            revert ClaimAlreadyProcessed();
        }

        claim.status = _approve ? ClaimStatus.Approved : ClaimStatus.Rejected;
        claim.approvedAmount = _approve ? _approvedAmount : 0;
        claim.resolution = _resolution;

        emit ClaimReviewed(_claimId, claim.status, _approvedAmount);
    }

    /**
     * @dev Pay out an approved claim
     * @param _claimId ID of the claim to pay
     */
    function payClaim(uint256 _claimId) external nonReentrant onlyOwner {
        if (_claimId >= totalClaims) revert ClaimDoesNotExist();
        Claim storage claim = claims[_claimId];
        if (claim.status != ClaimStatus.Approved) revert ClaimAlreadyProcessed();

        uint256 payoutAmount = claim.approvedAmount;
        if (payoutAmount > insurancePool) revert InsufficientPoolBalance();

        claim.status = ClaimStatus.Paid;
        insurancePool -= payoutAmount;

        Policy storage policy = policies[claim.policyId];
        policy.status = PolicyStatus.Claimed;

        (bool success,) = payable(claim.claimant).call{ value: payoutAmount }("");
        if (!success) revert TransferFailed();

        emit ClaimPaid(_claimId, claim.claimant, payoutAmount);
    }

    /**
     * @dev Get builder's coverage capacity based on stake
     * @param _builder Address of the builder
     * @return Maximum coverage amount available
     */
    function getBuilderCoverageCapacity(address _builder) external view returns (uint256) {
        BuilderStake storage stake = builderStakes[_builder];
        if (!stake.isActive) return 0;
        return stake.amount * maxCoverageRatio;
    }

    /**
     * @dev Get all policies for a holder
     * @param _holder Address of the policy holder
     * @return Array of policy IDs
     */
    function getHolderPolicies(address _holder) external view returns (uint256[] memory) {
        return holderPolicies[_holder];
    }

    /**
     * @dev Get policy details
     * @param _policyId ID of the policy
     * @return Policy struct
     */
    function getPolicy(uint256 _policyId)
        external
        view
        policyExists(_policyId)
        returns (Policy memory)
    {
        return policies[_policyId];
    }

    /**
     * @dev Get claim details
     * @param _claimId ID of the claim
     * @return Claim struct
     */
    function getClaim(uint256 _claimId) external view returns (Claim memory) {
        if (_claimId >= totalClaims) revert ClaimDoesNotExist();
        return claims[_claimId];
    }

    /**
     * @dev Deposit funds to insurance pool (for pool growth)
     */
    function depositToPool() external payable {
        insurancePool += msg.value;
        emit PoolDeposit(msg.sender, msg.value);
    }

    /**
     * @dev Update premium rate (only owner)
     * @param _newRate New premium rate in basis points
     */
    function updatePremiumRate(uint256 _newRate) external onlyOwner {
        if (_newRate > 1000) revert InvalidPremiumRate(); // Max 10%
        premiumRate = _newRate;
        emit PremiumRateUpdated(_newRate);
    }

    /**
     * @dev Emergency withdraw (only owner)
     * @param _amount Amount to withdraw
     */
    function emergencyWithdraw(uint256 _amount) external nonReentrant onlyOwner {
        if (_amount > address(this).balance) revert InsufficientPoolBalance();

        (bool success,) = payable(owner()).call{ value: _amount }("");
        if (!success) revert TransferFailed();
    }

    /**
     * @dev Get contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Pause the contract (emergency stop)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {
        insurancePool += msg.value;
        emit PoolDeposit(msg.sender, msg.value);
    }
}
