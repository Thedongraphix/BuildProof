// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BuilderStaking
 * @dev Staking contract for builders to stake ETH and earn rewards
 * @notice Builders stake ETH to boost reputation and earn rewards
 */
contract BuilderStaking is Ownable, Pausable, ReentrancyGuard {
    /// @dev Struct to store staker information
    struct Staker {
        uint256 stakedAmount;
        uint256 stakedTimestamp;
        uint256 rewardsEarned;
        uint256 lastRewardClaim;
    }

    /// @dev Mapping from staker address to staker info
    mapping(address => Staker) public stakers;

    /// @dev Total amount staked in the contract
    uint256 public totalStaked;

    /// @dev Minimum stake amount (0.01 ETH)
    uint256 public constant MIN_STAKE = 0.01 ether;

    /// @dev Maximum stake amount per user (10 ETH)
    uint256 public constant MAX_STAKE = 10 ether;

    /// @dev Annual percentage yield (5% = 500 basis points)
    uint256 public constant APY_BASIS_POINTS = 500;

    /// @dev Basis points divisor
    uint256 public constant BASIS_POINTS_DIVISOR = 10000;

    /// @dev Seconds in a year for reward calculation
    uint256 public constant SECONDS_PER_YEAR = 365 days;

    /// @dev Minimum staking period (7 days)
    uint256 public constant MIN_STAKING_PERIOD = 7 days;

    /// @notice Emitted when a user stakes ETH
    event Staked(address indexed staker, uint256 amount, uint256 timestamp);

    /// @notice Emitted when a user unstakes ETH
    event Unstaked(address indexed staker, uint256 amount, uint256 rewards);

    /// @notice Emitted when a user claims rewards
    event RewardsClaimed(address indexed staker, uint256 amount);

    /// @notice Emitted when contract receives ETH for rewards
    event RewardsFunded(address indexed funder, uint256 amount);

    /// @dev Custom errors for gas efficiency
    error InsufficientStakeAmount();
    error ExceedsMaxStake();
    error NoStakeFound();
    error StakingPeriodNotMet();
    error InsufficientRewards();
    error TransferFailed();

    /**
     * @dev Constructor sets the contract owner
     */
    constructor() Ownable(msg.sender) { }

    /**
     * @notice Stake ETH to earn rewards and boost reputation
     */
    function stake() external payable whenNotPaused nonReentrant {
        if (msg.value < MIN_STAKE) revert InsufficientStakeAmount();

        Staker storage staker = stakers[msg.sender];
        uint256 newTotalStake = staker.stakedAmount + msg.value;

        if (newTotalStake > MAX_STAKE) revert ExceedsMaxStake();

        // Calculate and add pending rewards before updating stake
        if (staker.stakedAmount > 0) {
            uint256 pendingRewards = _calculateRewards(msg.sender);
            staker.rewardsEarned += pendingRewards;
        }

        staker.stakedAmount = newTotalStake;
        staker.stakedTimestamp = block.timestamp;
        staker.lastRewardClaim = block.timestamp;
        totalStaked += msg.value;

        emit Staked(msg.sender, msg.value, block.timestamp);
    }

    /**
     * @notice Unstake ETH and claim all rewards
     */
    function unstake() external nonReentrant {
        Staker storage staker = stakers[msg.sender];

        if (staker.stakedAmount == 0) revert NoStakeFound();
        if (block.timestamp < staker.stakedTimestamp + MIN_STAKING_PERIOD) {
            revert StakingPeriodNotMet();
        }

        uint256 stakedAmount = staker.stakedAmount;
        uint256 rewards = _calculateRewards(msg.sender) + staker.rewardsEarned;

        // Reset staker info
        staker.stakedAmount = 0;
        staker.rewardsEarned = 0;
        staker.lastRewardClaim = 0;
        staker.stakedTimestamp = 0;

        totalStaked -= stakedAmount;

        // Transfer staked amount + rewards
        uint256 totalPayout = stakedAmount + rewards;
        if (address(this).balance < totalPayout) revert InsufficientRewards();

        (bool success,) = msg.sender.call{ value: totalPayout }("");
        if (!success) revert TransferFailed();

        emit Unstaked(msg.sender, stakedAmount, rewards);
    }

    /**
     * @notice Claim accumulated rewards without unstaking
     */
    function claimRewards() external nonReentrant {
        Staker storage staker = stakers[msg.sender];

        if (staker.stakedAmount == 0) revert NoStakeFound();

        uint256 rewards = _calculateRewards(msg.sender) + staker.rewardsEarned;
        if (rewards == 0) revert InsufficientRewards();

        staker.rewardsEarned = 0;
        staker.lastRewardClaim = block.timestamp;

        if (address(this).balance < rewards) revert InsufficientRewards();

        (bool success,) = msg.sender.call{ value: rewards }("");
        if (!success) revert TransferFailed();

        emit RewardsClaimed(msg.sender, rewards);
    }

    /**
     * @notice Calculate pending rewards for a staker
     * @param stakerAddress Address of the staker
     * @return uint256 Pending rewards amount
     */
    function getPendingRewards(address stakerAddress) external view returns (uint256) {
        return _calculateRewards(stakerAddress) + stakers[stakerAddress].rewardsEarned;
    }

    /**
     * @notice Get staker information
     * @param stakerAddress Address of the staker
     * @return stakedAmount Amount staked
     * @return stakedTimestamp When stake started
     * @return rewardsEarned Accumulated rewards
     * @return lastRewardClaim Last reward claim timestamp
     */
    function getStakerInfo(address stakerAddress)
        external
        view
        returns (
            uint256 stakedAmount,
            uint256 stakedTimestamp,
            uint256 rewardsEarned,
            uint256 lastRewardClaim
        )
    {
        Staker memory staker = stakers[stakerAddress];
        return (
            staker.stakedAmount,
            staker.stakedTimestamp,
            staker.rewardsEarned,
            staker.lastRewardClaim
        );
    }

    /**
     * @dev Internal function to calculate rewards based on time staked
     * @param stakerAddress Address of the staker
     * @return uint256 Calculated rewards
     */
    function _calculateRewards(address stakerAddress) private view returns (uint256) {
        Staker memory staker = stakers[stakerAddress];

        if (staker.stakedAmount == 0) return 0;

        uint256 stakingDuration = block.timestamp - staker.lastRewardClaim;
        uint256 rewards = (staker.stakedAmount * APY_BASIS_POINTS * stakingDuration)
            / (BASIS_POINTS_DIVISOR * SECONDS_PER_YEAR);

        return rewards;
    }

    /**
     * @notice Fund the contract with ETH for rewards
     */
    function fundRewards() external payable onlyOwner {
        emit RewardsFunded(msg.sender, msg.value);
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
     * @notice Emergency withdraw for owner (only if paused)
     */
    function emergencyWithdraw() external onlyOwner whenPaused {
        uint256 balance = address(this).balance;
        (bool success,) = owner().call{ value: balance }("");
        if (!success) revert TransferFailed();
    }

    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {
        emit RewardsFunded(msg.sender, msg.value);
    }
}
