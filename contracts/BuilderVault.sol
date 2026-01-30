// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title BuilderVault
 * @dev Secure savings vault for builders with time-locked deposits,
 * goal-based savings, and emergency withdrawal capabilities.
 * Enables builders to save funds for projects with built-in discipline.
 * @author BuildProof Team
 */
contract BuilderVault is Ownable2Step, ReentrancyGuard, Pausable {
    /// @dev Custom errors for gas efficiency
    error InsufficientDeposit();
    error VaultDoesNotExist();
    error VaultNotMatured();
    error VaultAlreadyWithdrawn();
    error VaultAlreadyClosed();
    error NotVaultOwner();
    error InvalidLockDuration();
    error InvalidGoalAmount();
    error GoalNotReached();
    error TransferFailed();
    error EmergencyPenaltyTooHigh();
    error ZeroAddress();

    struct Vault {
        uint256 vaultId;
        uint256 balance;
        uint256 goalAmount;
        uint256 depositedAt;
        uint256 maturityDate;
        address owner;
        VaultStatus status;
        string purpose;
    }

    enum VaultStatus {
        Active,
        Matured,
        Withdrawn,
        EmergencyWithdrawn
    }

    // State variables
    mapping(uint256 => Vault) public vaults;
    mapping(address => uint256[]) public userVaults;
    mapping(address => uint256) public totalDeposited;

    uint256 public totalVaults;
    uint256 public totalValueLocked;
    uint256 public totalWithdrawn;
    uint256 public emergencyPenaltyRate = 500; // 5% penalty in basis points
    uint256 public minLockDuration = 7 days;
    uint256 public maxLockDuration = 365 days;
    uint256 public penaltyPool;

    // Events
    event VaultCreated(
        uint256 indexed vaultId,
        address indexed owner,
        uint256 amount,
        uint256 goalAmount,
        uint256 maturityDate,
        string purpose
    );
    event DepositAdded(uint256 indexed vaultId, address indexed owner, uint256 amount);
    event VaultWithdrawn(uint256 indexed vaultId, address indexed owner, uint256 amount);
    event EmergencyWithdrawal(
        uint256 indexed vaultId, address indexed owner, uint256 amount, uint256 penalty
    );
    event PenaltyRateUpdated(uint256 newRate);
    event PenaltyPoolWithdrawn(address indexed recipient, uint256 amount);

    modifier vaultExists(uint256 _vaultId) {
        if (_vaultId >= totalVaults) revert VaultDoesNotExist();
        _;
    }

    modifier onlyVaultOwner(uint256 _vaultId) {
        if (vaults[_vaultId].owner != msg.sender) revert NotVaultOwner();
        _;
    }

    /**
     * @dev Constructor sets the contract owner
     */
    constructor() Ownable(msg.sender) { }

    /**
     * @dev Create a new savings vault with a goal and lock period
     * @param _goalAmount Target savings amount (0 for no goal)
     * @param _lockDuration How long to lock funds (minimum 7 days)
     * @param _purpose Description of what the savings are for
     * @return vaultId The ID of the newly created vault
     */
    function createVault(
        uint256 _goalAmount,
        uint256 _lockDuration,
        string memory _purpose
    )
        external
        payable
        whenNotPaused
        returns (uint256)
    {
        if (msg.value == 0) revert InsufficientDeposit();
        if (_lockDuration < minLockDuration || _lockDuration > maxLockDuration) {
            revert InvalidLockDuration();
        }

        uint256 vaultId = totalVaults++;

        vaults[vaultId] = Vault({
            vaultId: vaultId,
            balance: msg.value,
            goalAmount: _goalAmount,
            depositedAt: block.timestamp,
            maturityDate: block.timestamp + _lockDuration,
            owner: msg.sender,
            status: VaultStatus.Active,
            purpose: _purpose
        });

        userVaults[msg.sender].push(vaultId);
        totalDeposited[msg.sender] += msg.value;
        totalValueLocked += msg.value;

        emit VaultCreated(
            vaultId, msg.sender, msg.value, _goalAmount, block.timestamp + _lockDuration, _purpose
        );

        return vaultId;
    }

    /**
     * @dev Add more funds to an existing vault
     * @param _vaultId ID of the vault to deposit into
     */
    function addDeposit(uint256 _vaultId)
        external
        payable
        whenNotPaused
        vaultExists(_vaultId)
        onlyVaultOwner(_vaultId)
    {
        if (msg.value == 0) revert InsufficientDeposit();

        Vault storage vault = vaults[_vaultId];
        if (vault.status != VaultStatus.Active) revert VaultAlreadyClosed();

        vault.balance += msg.value;
        totalDeposited[msg.sender] += msg.value;
        totalValueLocked += msg.value;

        emit DepositAdded(_vaultId, msg.sender, msg.value);
    }

    /**
     * @dev Withdraw funds after the lock period has ended
     * @param _vaultId ID of the vault to withdraw from
     */
    function withdraw(uint256 _vaultId)
        external
        nonReentrant
        vaultExists(_vaultId)
        onlyVaultOwner(_vaultId)
    {
        Vault storage vault = vaults[_vaultId];
        if (vault.status != VaultStatus.Active) revert VaultAlreadyWithdrawn();
        if (block.timestamp < vault.maturityDate) revert VaultNotMatured();

        uint256 amount = vault.balance;
        vault.balance = 0;
        vault.status = VaultStatus.Withdrawn;
        totalValueLocked -= amount;
        totalWithdrawn += amount;

        (bool success,) = payable(msg.sender).call{ value: amount }("");
        if (!success) revert TransferFailed();

        emit VaultWithdrawn(_vaultId, msg.sender, amount);
    }

    /**
     * @dev Emergency withdraw before maturity with a penalty
     * @param _vaultId ID of the vault for emergency withdrawal
     */
    function emergencyWithdraw(uint256 _vaultId)
        external
        nonReentrant
        vaultExists(_vaultId)
        onlyVaultOwner(_vaultId)
    {
        Vault storage vault = vaults[_vaultId];
        if (vault.status != VaultStatus.Active) revert VaultAlreadyWithdrawn();

        uint256 fullAmount = vault.balance;
        uint256 penalty = (fullAmount * emergencyPenaltyRate) / 10_000;
        uint256 withdrawAmount = fullAmount - penalty;

        vault.balance = 0;
        vault.status = VaultStatus.EmergencyWithdrawn;
        totalValueLocked -= fullAmount;
        totalWithdrawn += withdrawAmount;
        penaltyPool += penalty;

        (bool success,) = payable(msg.sender).call{ value: withdrawAmount }("");
        if (!success) revert TransferFailed();

        emit EmergencyWithdrawal(_vaultId, msg.sender, withdrawAmount, penalty);
    }

    /**
     * @dev Check if a vault has reached its savings goal
     * @param _vaultId ID of the vault
     * @return Whether the goal has been reached
     */
    function isGoalReached(uint256 _vaultId) external view vaultExists(_vaultId) returns (bool) {
        Vault storage vault = vaults[_vaultId];
        if (vault.goalAmount == 0) return true;
        return vault.balance >= vault.goalAmount;
    }

    /**
     * @dev Check if a vault has matured
     * @param _vaultId ID of the vault
     * @return Whether the vault has matured
     */
    function isMatured(uint256 _vaultId) external view vaultExists(_vaultId) returns (bool) {
        return block.timestamp >= vaults[_vaultId].maturityDate;
    }

    /**
     * @dev Get progress toward savings goal as a percentage (basis points)
     * @param _vaultId ID of the vault
     * @return Progress in basis points (10000 = 100%)
     */
    function getGoalProgress(uint256 _vaultId)
        external
        view
        vaultExists(_vaultId)
        returns (uint256)
    {
        Vault storage vault = vaults[_vaultId];
        if (vault.goalAmount == 0) return 10_000;
        if (vault.balance >= vault.goalAmount) return 10_000;
        return (vault.balance * 10_000) / vault.goalAmount;
    }

    /**
     * @dev Get time remaining until vault maturity
     * @param _vaultId ID of the vault
     * @return Seconds remaining (0 if matured)
     */
    function getTimeRemaining(uint256 _vaultId)
        external
        view
        vaultExists(_vaultId)
        returns (uint256)
    {
        Vault storage vault = vaults[_vaultId];
        if (block.timestamp >= vault.maturityDate) return 0;
        return vault.maturityDate - block.timestamp;
    }

    /**
     * @dev Get all vault IDs for a user
     * @param _user Address of the user
     * @return Array of vault IDs
     */
    function getUserVaults(address _user) external view returns (uint256[] memory) {
        return userVaults[_user];
    }

    /**
     * @dev Get vault details
     * @param _vaultId ID of the vault
     * @return Vault struct
     */
    function getVault(uint256 _vaultId) external view vaultExists(_vaultId) returns (Vault memory) {
        return vaults[_vaultId];
    }

    /**
     * @dev Get the penalty amount for early withdrawal
     * @param _vaultId ID of the vault
     * @return Penalty amount in wei
     */
    function getEarlyWithdrawalPenalty(uint256 _vaultId)
        external
        view
        vaultExists(_vaultId)
        returns (uint256)
    {
        return (vaults[_vaultId].balance * emergencyPenaltyRate) / 10_000;
    }

    /**
     * @dev Update emergency penalty rate (only owner)
     * @param _newRate New penalty rate in basis points (max 2000 = 20%)
     */
    function updatePenaltyRate(uint256 _newRate) external onlyOwner {
        if (_newRate > 2000) revert EmergencyPenaltyTooHigh();
        emergencyPenaltyRate = _newRate;
        emit PenaltyRateUpdated(_newRate);
    }

    /**
     * @dev Withdraw accumulated penalty pool (only owner)
     * @param _recipient Address to receive penalty funds
     */
    function withdrawPenaltyPool(address _recipient) external nonReentrant onlyOwner {
        if (_recipient == address(0)) revert ZeroAddress();
        uint256 amount = penaltyPool;
        penaltyPool = 0;

        (bool success,) = payable(_recipient).call{ value: amount }("");
        if (!success) revert TransferFailed();

        emit PenaltyPoolWithdrawn(_recipient, amount);
    }

    /**
     * @dev Get contract statistics
     * @return _totalVaults Total number of vaults created
     * @return _totalValueLocked Total ETH currently locked
     * @return _totalWithdrawn Total ETH withdrawn over time
     * @return _penaltyPool Accumulated penalty fees
     */
    function getStats()
        external
        view
        returns (
            uint256 _totalVaults,
            uint256 _totalValueLocked,
            uint256 _totalWithdrawn,
            uint256 _penaltyPool
        )
    {
        return (totalVaults, totalValueLocked, totalWithdrawn, penaltyPool);
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
     * @dev Get contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
