// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title BuilderLiquidityPool
 * @dev Simplified AMM liquidity pool for BPROOF/ETH trading pair
 * @notice Users can provide liquidity and swap between BPROOF tokens and ETH
 */
contract BuilderLiquidityPool is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    /// @dev BPROOF token contract
    IERC20 public immutable bproofToken;

    /// @dev Reserves for constant product formula (x * y = k)
    uint256 public reserveBproof;
    uint256 public reserveEth;

    /// @dev Liquidity provider shares
    uint256 public totalLiquidity;
    mapping(address => uint256) public liquidity;

    /// @dev Trading fee (0.3% = 30 basis points)
    uint256 public constant FEE_BASIS_POINTS = 30;
    uint256 public constant BASIS_POINTS_DIVISOR = 10000;

    /// @dev Minimum liquidity (for initial LP lock)
    uint256 public constant MINIMUM_LIQUIDITY = 10 ** 3;

    /// @notice Emitted when liquidity is added
    event LiquidityAdded(
        address indexed provider, uint256 bproofAmount, uint256 ethAmount, uint256 liquidityMinted
    );

    /// @notice Emitted when liquidity is removed
    event LiquidityRemoved(
        address indexed provider, uint256 bproofAmount, uint256 ethAmount, uint256 liquidityBurned
    );

    /// @notice Emitted when a swap occurs
    event Swap(address indexed trader, bool bproofToEth, uint256 inputAmount, uint256 outputAmount);

    /// @dev Custom errors
    error InsufficientLiquidity();
    error InsufficientInputAmount();
    error InsufficientOutputAmount();
    error InvalidTokenAmount();
    error InvalidEthAmount();
    error SlippageExceeded();
    error TransferFailed();
    error ZeroAddress();

    /**
     * @dev Constructor sets the BPROOF token address
     * @param _bproofToken Address of the BPROOF token contract
     */
    constructor(address _bproofToken) Ownable(msg.sender) {
        if (_bproofToken == address(0)) revert ZeroAddress();
        bproofToken = IERC20(_bproofToken);
    }

    /**
     * @notice Add liquidity to the pool
     * @param bproofAmount Amount of BPROOF tokens to add
     * @param minLiquidity Minimum liquidity tokens expected (slippage protection)
     * @return liquidityMinted Amount of liquidity tokens minted
     */
    function addLiquidity(
        uint256 bproofAmount,
        uint256 minLiquidity
    )
        external
        payable
        nonReentrant
        whenNotPaused
        returns (uint256 liquidityMinted)
    {
        if (bproofAmount == 0) revert InvalidTokenAmount();
        if (msg.value == 0) revert InvalidEthAmount();

        if (totalLiquidity == 0) {
            // Initial liquidity provision
            liquidityMinted = _sqrt(bproofAmount * msg.value);

            if (liquidityMinted <= MINIMUM_LIQUIDITY) revert InsufficientLiquidity();

            // Lock minimum liquidity permanently
            liquidity[address(0)] = MINIMUM_LIQUIDITY;
            liquidityMinted -= MINIMUM_LIQUIDITY;

            reserveBproof = bproofAmount;
            reserveEth = msg.value;
            totalLiquidity = _sqrt(bproofAmount * msg.value);
        } else {
            // Subsequent liquidity provision
            uint256 ethLiquidity = (msg.value * totalLiquidity) / reserveEth;
            uint256 bproofLiquidity = (bproofAmount * totalLiquidity) / reserveBproof;

            // Use the smaller value to maintain ratio
            liquidityMinted = ethLiquidity < bproofLiquidity ? ethLiquidity : bproofLiquidity;

            if (liquidityMinted < minLiquidity) revert SlippageExceeded();

            reserveBproof += bproofAmount;
            reserveEth += msg.value;
            totalLiquidity += liquidityMinted;
        }

        liquidity[msg.sender] += liquidityMinted;

        // Transfer BPROOF tokens to pool
        bproofToken.safeTransferFrom(msg.sender, address(this), bproofAmount);

        emit LiquidityAdded(msg.sender, bproofAmount, msg.value, liquidityMinted);
    }

    /**
     * @notice Remove liquidity from the pool
     * @param liquidityAmount Amount of liquidity tokens to burn
     * @param minBproof Minimum BPROOF tokens expected
     * @param minEth Minimum ETH expected
     * @return bproofAmount Amount of BPROOF tokens returned
     * @return ethAmount Amount of ETH returned
     */
    function removeLiquidity(
        uint256 liquidityAmount,
        uint256 minBproof,
        uint256 minEth
    )
        external
        nonReentrant
        returns (uint256 bproofAmount, uint256 ethAmount)
    {
        if (liquidity[msg.sender] < liquidityAmount) revert InsufficientLiquidity();

        bproofAmount = (liquidityAmount * reserveBproof) / totalLiquidity;
        ethAmount = (liquidityAmount * reserveEth) / totalLiquidity;

        if (bproofAmount < minBproof || ethAmount < minEth) revert SlippageExceeded();

        liquidity[msg.sender] -= liquidityAmount;
        totalLiquidity -= liquidityAmount;
        reserveBproof -= bproofAmount;
        reserveEth -= ethAmount;

        // Transfer tokens back to provider
        bproofToken.safeTransfer(msg.sender, bproofAmount);
        (bool success,) = msg.sender.call{ value: ethAmount }("");
        if (!success) revert TransferFailed();

        emit LiquidityRemoved(msg.sender, bproofAmount, ethAmount, liquidityAmount);
    }

    /**
     * @notice Swap BPROOF for ETH
     * @param bproofAmount Amount of BPROOF to swap
     * @param minEthOut Minimum ETH expected (slippage protection)
     * @return ethOut Amount of ETH received
     */
    function swapBproofForEth(
        uint256 bproofAmount,
        uint256 minEthOut
    )
        external
        nonReentrant
        whenNotPaused
        returns (uint256 ethOut)
    {
        if (bproofAmount == 0) revert InsufficientInputAmount();

        // Calculate output with fee
        ethOut = _getAmountOut(bproofAmount, reserveBproof, reserveEth);

        if (ethOut < minEthOut) revert SlippageExceeded();

        // Update reserves
        reserveBproof += bproofAmount;
        reserveEth -= ethOut;

        // Execute transfers
        bproofToken.safeTransferFrom(msg.sender, address(this), bproofAmount);
        (bool success,) = msg.sender.call{ value: ethOut }("");
        if (!success) revert TransferFailed();

        emit Swap(msg.sender, true, bproofAmount, ethOut);
    }

    /**
     * @notice Swap ETH for BPROOF
     * @param minBproofOut Minimum BPROOF expected (slippage protection)
     * @return bproofOut Amount of BPROOF received
     */
    function swapEthForBproof(uint256 minBproofOut)
        external
        payable
        nonReentrant
        whenNotPaused
        returns (uint256 bproofOut)
    {
        if (msg.value == 0) revert InsufficientInputAmount();

        // Calculate output with fee
        bproofOut = _getAmountOut(msg.value, reserveEth, reserveBproof);

        if (bproofOut < minBproofOut) revert SlippageExceeded();

        // Update reserves
        reserveEth += msg.value;
        reserveBproof -= bproofOut;

        // Execute transfer
        bproofToken.safeTransfer(msg.sender, bproofOut);

        emit Swap(msg.sender, false, msg.value, bproofOut);
    }

    /**
     * @notice Get quote for swapping BPROOF to ETH
     * @param bproofAmount Amount of BPROOF input
     * @return ethOut Expected ETH output
     */
    function getQuoteBproofToEth(uint256 bproofAmount) external view returns (uint256 ethOut) {
        return _getAmountOut(bproofAmount, reserveBproof, reserveEth);
    }

    /**
     * @notice Get quote for swapping ETH to BPROOF
     * @param ethAmount Amount of ETH input
     * @return bproofOut Expected BPROOF output
     */
    function getQuoteEthToBproof(uint256 ethAmount) external view returns (uint256 bproofOut) {
        return _getAmountOut(ethAmount, reserveEth, reserveBproof);
    }

    /**
     * @notice Get liquidity provider info
     * @param provider Address of liquidity provider
     * @return liquidityShares LP shares owned
     * @return bproofValue Value in BPROOF tokens
     * @return ethValue Value in ETH
     */
    function getLiquidityInfo(address provider)
        external
        view
        returns (uint256 liquidityShares, uint256 bproofValue, uint256 ethValue)
    {
        liquidityShares = liquidity[provider];

        if (totalLiquidity > 0) {
            bproofValue = (liquidityShares * reserveBproof) / totalLiquidity;
            ethValue = (liquidityShares * reserveEth) / totalLiquidity;
        }
    }

    /**
     * @dev Calculate output amount using constant product formula with fee
     * @param inputAmount Amount of input token
     * @param inputReserve Reserve of input token
     * @param outputReserve Reserve of output token
     * @return outputAmount Amount of output token
     */
    function _getAmountOut(
        uint256 inputAmount,
        uint256 inputReserve,
        uint256 outputReserve
    )
        private
        pure
        returns (uint256 outputAmount)
    {
        if (inputAmount == 0) revert InsufficientInputAmount();
        if (inputReserve == 0 || outputReserve == 0) revert InsufficientLiquidity();

        // Apply fee
        uint256 inputAmountWithFee = inputAmount * (BASIS_POINTS_DIVISOR - FEE_BASIS_POINTS);
        uint256 numerator = inputAmountWithFee * outputReserve;
        uint256 denominator = (inputReserve * BASIS_POINTS_DIVISOR) + inputAmountWithFee;

        outputAmount = numerator / denominator;
    }

    /**
     * @dev Square root function using Babylonian method
     * @param x Input value
     * @return y Square root of x
     */
    function _sqrt(uint256 x) private pure returns (uint256 y) {
        if (x == 0) return 0;

        uint256 z = (x + 1) / 2;
        y = x;

        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }

    /**
     * @notice Pause the pool (emergency stop)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause the pool
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Receive ETH
     */
    receive() external payable { }
}
