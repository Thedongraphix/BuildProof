// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title StakingPool
 * @dev Flexible staking pool with multiple lock periods and dynamic APY
 */
contract StakingPool is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct StakeInfo {
        uint256 amount;
        uint256 startTime;
        uint256 lockPeriod; // in days
        uint256 apy; // basis points (e.g., 1200 = 12%)
        uint256 lastClaimTime;
        bool active;
    }

    struct LockPeriodConfig {
        uint256 duration; // in days
        uint256 apy; // basis points
        bool enabled;
    }

    IERC20 public stakingToken;
    uint256 public totalStaked;
    uint256 public totalRewardsPaid;
    uint256 public earlyWithdrawalPenalty = 1000; // 10% penalty

    mapping(address => StakeInfo[]) public userStakes;
    mapping(uint256 => LockPeriodConfig) public lockPeriods;
    uint256[] public availableLockPeriods;

    event Staked(
        address indexed user, uint256 amount, uint256 lockPeriod, uint256 apy, uint256 stakeId
    );
    event Withdrawn(address indexed user, uint256 amount, uint256 penalty, uint256 stakeId);
    event RewardsClaimed(address indexed user, uint256 amount);
    event LockPeriodConfigured(uint256 lockDays, uint256 apy, bool enabled);
    event EmergencyWithdraw(address indexed user, uint256 amount);

    constructor(address _stakingToken) Ownable(msg.sender) {
        stakingToken = IERC20(_stakingToken);

        // Initialize default lock periods
        _configureLockPeriod(30, 1200, true); // 30 days - 12% APY
        _configureLockPeriod(90, 1800, true); // 90 days - 18% APY
        _configureLockPeriod(180, 2500, true); // 180 days - 25% APY
        _configureLockPeriod(365, 3500, true); // 365 days - 35% APY
    }

    /**
     * @dev Stake tokens for a specific lock period
     * @param amount Amount of tokens to stake
     * @param lockPeriodDays Lock period in days
     */
    function stake(uint256 amount, uint256 lockPeriodDays) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(lockPeriods[lockPeriodDays].enabled, "Invalid lock period");

        stakingToken.safeTransferFrom(msg.sender, address(this), amount);

        LockPeriodConfig memory config = lockPeriods[lockPeriodDays];

        userStakes[msg.sender].push(
            StakeInfo({
                amount: amount,
                startTime: block.timestamp,
                lockPeriod: lockPeriodDays,
                apy: config.apy,
                lastClaimTime: block.timestamp,
                active: true
            })
        );

        totalStaked += amount;

        emit Staked(
            msg.sender, amount, lockPeriodDays, config.apy, userStakes[msg.sender].length - 1
        );
    }

    /**
     * @dev Calculate pending rewards for a stake
     * @param user User address
     * @param stakeId Stake index
     * @return Pending rewards amount
     */
    function calculateRewards(address user, uint256 stakeId) public view returns (uint256) {
        require(stakeId < userStakes[user].length, "Invalid stake ID");
        StakeInfo memory stakeInfo = userStakes[user][stakeId];

        if (!stakeInfo.active) {
            return 0;
        }

        uint256 stakingDuration = block.timestamp - stakeInfo.lastClaimTime;
        uint256 rewards = (stakeInfo.amount * stakeInfo.apy * stakingDuration) / (365 days * 10000);

        return rewards;
    }

    /**
     * @dev Claim rewards from a specific stake
     * @param stakeId Stake index
     */
    function claimRewards(uint256 stakeId) external nonReentrant {
        require(stakeId < userStakes[msg.sender].length, "Invalid stake ID");
        StakeInfo storage stakeInfo = userStakes[msg.sender][stakeId];
        require(stakeInfo.active, "Stake is not active");

        uint256 rewards = calculateRewards(msg.sender, stakeId);
        require(rewards > 0, "No rewards to claim");

        stakeInfo.lastClaimTime = block.timestamp;
        totalRewardsPaid += rewards;

        stakingToken.safeTransfer(msg.sender, rewards);

        emit RewardsClaimed(msg.sender, rewards);
    }

    /**
     * @dev Claim rewards from all active stakes
     */
    function claimAllRewards() external nonReentrant {
        uint256 totalRewards = 0;

        for (uint256 i = 0; i < userStakes[msg.sender].length; i++) {
            if (userStakes[msg.sender][i].active) {
                uint256 rewards = calculateRewards(msg.sender, i);
                if (rewards > 0) {
                    userStakes[msg.sender][i].lastClaimTime = block.timestamp;
                    totalRewards += rewards;
                }
            }
        }

        require(totalRewards > 0, "No rewards to claim");
        totalRewardsPaid += totalRewards;

        stakingToken.safeTransfer(msg.sender, totalRewards);

        emit RewardsClaimed(msg.sender, totalRewards);
    }

    /**
     * @dev Withdraw staked tokens
     * @param stakeId Stake index
     */
    function withdraw(uint256 stakeId) external nonReentrant {
        require(stakeId < userStakes[msg.sender].length, "Invalid stake ID");
        StakeInfo storage stakeInfo = userStakes[msg.sender][stakeId];
        require(stakeInfo.active, "Stake is not active");

        // Claim any pending rewards first
        uint256 rewards = calculateRewards(msg.sender, stakeId);
        if (rewards > 0) {
            stakingToken.safeTransfer(msg.sender, rewards);
            totalRewardsPaid += rewards;
        }

        uint256 amount = stakeInfo.amount;
        uint256 penalty = 0;

        // Check if lock period has passed
        uint256 unlockTime = stakeInfo.startTime + (stakeInfo.lockPeriod * 1 days);
        if (block.timestamp < unlockTime) {
            // Early withdrawal penalty
            penalty = (amount * earlyWithdrawalPenalty) / 10000;
            amount -= penalty;
        }

        stakeInfo.active = false;
        totalStaked -= stakeInfo.amount;

        stakingToken.safeTransfer(msg.sender, amount);

        emit Withdrawn(msg.sender, amount, penalty, stakeId);
    }

    /**
     * @dev Get all stakes for a user
     * @param user User address
     * @return Array of stake info
     */
    function getUserStakes(address user) external view returns (StakeInfo[] memory) {
        return userStakes[user];
    }

    /**
     * @dev Get active stakes for a user
     * @param user User address
     * @return count Number of active stakes
     * @return totalAmount Total amount staked
     */
    function getActiveStakes(address user)
        external
        view
        returns (uint256 count, uint256 totalAmount)
    {
        for (uint256 i = 0; i < userStakes[user].length; i++) {
            if (userStakes[user][i].active) {
                count++;
                totalAmount += userStakes[user][i].amount;
            }
        }
    }

    /**
     * @dev Get total pending rewards for a user
     * @param user User address
     * @return Total pending rewards
     */
    function getTotalPendingRewards(address user) external view returns (uint256) {
        uint256 totalRewards = 0;
        for (uint256 i = 0; i < userStakes[user].length; i++) {
            if (userStakes[user][i].active) {
                totalRewards += calculateRewards(user, i);
            }
        }
        return totalRewards;
    }

    /**
     * @dev Configure a lock period (owner only)
     * @param lockDays Lock period in days
     * @param apy APY in basis points
     * @param enabled Whether this period is enabled
     */
    function configureLockPeriod(uint256 lockDays, uint256 apy, bool enabled) external onlyOwner {
        _configureLockPeriod(lockDays, apy, enabled);
    }

    function _configureLockPeriod(uint256 lockDays, uint256 apy, bool enabled) private {
        if (!lockPeriods[lockDays].enabled && enabled) {
            availableLockPeriods.push(lockDays);
        }

        lockPeriods[lockDays] = LockPeriodConfig({ duration: lockDays, apy: apy, enabled: enabled });

        emit LockPeriodConfigured(lockDays, apy, enabled);
    }

    /**
     * @dev Set early withdrawal penalty (owner only)
     * @param penalty Penalty in basis points
     */
    function setEarlyWithdrawalPenalty(uint256 penalty) external onlyOwner {
        require(penalty <= 5000, "Penalty too high"); // Max 50%
        earlyWithdrawalPenalty = penalty;
    }

    /**
     * @dev Emergency withdraw for owner
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        stakingToken.safeTransfer(owner(), amount);
        emit EmergencyWithdraw(owner(), amount);
    }

    /**
     * @dev Fund the contract with reward tokens
     * @param amount Amount to fund
     */
    function fundRewards(uint256 amount) external {
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
    }

    /**
     * @dev Get contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return stakingToken.balanceOf(address(this));
    }

    /**
     * @dev Get available lock periods
     */
    function getAvailableLockPeriods() external view returns (uint256[] memory) {
        return availableLockPeriods;
    }
}
