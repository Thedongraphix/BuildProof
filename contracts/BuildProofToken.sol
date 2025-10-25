// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title BuildProofToken
 * @dev Enhanced governance token for BuildProof ecosystem with voting, delegation, and permit
 * @notice This is the primary governance and utility token for the BuildProof platform
 */
contract BuildProofToken is ERC20, ERC20Burnable, ERC20Permit, ERC20Votes, Ownable, Pausable {
    /// @dev Maximum supply cap (1 billion tokens)
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10 ** 18;

    /// @dev Mapping of authorized minters
    mapping(address => bool) public minters;

    /// @dev Token transfer tax rate (in basis points, 100 = 1%)
    uint256 public transferTaxBasisPoints = 0;

    /// @dev Maximum transfer tax (5% = 500 basis points)
    uint256 public constant MAX_TRANSFER_TAX = 500;

    /// @dev Basis points divisor
    uint256 public constant BASIS_POINTS_DIVISOR = 10000;

    /// @dev Treasury address for tax collection
    address public treasury;

    /// @dev Addresses exempt from transfer tax
    mapping(address => bool) public taxExempt;

    /// @notice Emitted when a minter is added
    event MinterAdded(address indexed minter);

    /// @notice Emitted when a minter is removed
    event MinterRemoved(address indexed minter);

    /// @notice Emitted when transfer tax rate is updated
    event TransferTaxUpdated(uint256 oldRate, uint256 newRate);

    /// @notice Emitted when treasury address is updated
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);

    /// @notice Emitted when tax exemption status is updated
    event TaxExemptionUpdated(address indexed account, bool isExempt);

    /// @dev Custom errors for gas efficiency
    error ExceedsMaxSupply();
    error InvalidMinterAddress();
    error AlreadyMinter();
    error NotMinter();
    error ExceedsMaxTax();
    error InvalidTreasuryAddress();

    modifier onlyMinter() {
        if (!minters[msg.sender] && msg.sender != owner()) revert NotMinter();
        _;
    }

    /**
     * @dev Constructor initializes the token with name, symbol, and initial supply
     * @param initialSupply Initial token supply to mint to deployer
     */
    constructor(uint256 initialSupply)
        ERC20("BuildProof Token", "BPROOF")
        ERC20Permit("BuildProof Token")
        Ownable(msg.sender)
    {
        if (initialSupply > MAX_SUPPLY) revert ExceedsMaxSupply();

        treasury = msg.sender;
        taxExempt[msg.sender] = true;
        taxExempt[address(this)] = true;

        _mint(msg.sender, initialSupply);
    }

    /**
     * @notice Mint new tokens (only by authorized minters)
     * @param to Recipient address
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external onlyMinter whenNotPaused {
        if (totalSupply() + amount > MAX_SUPPLY) revert ExceedsMaxSupply();
        _mint(to, amount);
    }

    /**
     * @notice Add a new minter
     * @param minter Address to grant minter role
     */
    function addMinter(address minter) external onlyOwner {
        if (minter == address(0)) revert InvalidMinterAddress();
        if (minters[minter]) revert AlreadyMinter();

        minters[minter] = true;
        emit MinterAdded(minter);
    }

    /**
     * @notice Remove a minter
     * @param minter Address to revoke minter role from
     */
    function removeMinter(address minter) external onlyOwner {
        if (!minters[minter]) revert NotMinter();

        minters[minter] = false;
        emit MinterRemoved(minter);
    }

    /**
     * @notice Update transfer tax rate
     * @param newTaxBasisPoints New tax rate in basis points
     */
    function setTransferTax(uint256 newTaxBasisPoints) external onlyOwner {
        if (newTaxBasisPoints > MAX_TRANSFER_TAX) revert ExceedsMaxTax();

        uint256 oldRate = transferTaxBasisPoints;
        transferTaxBasisPoints = newTaxBasisPoints;

        emit TransferTaxUpdated(oldRate, newTaxBasisPoints);
    }

    /**
     * @notice Update treasury address
     * @param newTreasury New treasury address
     */
    function setTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert InvalidTreasuryAddress();

        address oldTreasury = treasury;
        treasury = newTreasury;

        // Update tax exemption
        taxExempt[newTreasury] = true;

        emit TreasuryUpdated(oldTreasury, newTreasury);
    }

    /**
     * @notice Set tax exemption status for an address
     * @param account Address to update
     * @param isExempt Whether the address should be exempt from taxes
     */
    function setTaxExemption(address account, bool isExempt) external onlyOwner {
        taxExempt[account] = isExempt;
        emit TaxExemptionUpdated(account, isExempt);
    }

    /**
     * @notice Pause all token transfers (emergency stop)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause token transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Override transfer to implement tax mechanism
     */
    function _update(
        address from,
        address to,
        uint256 amount
    )
        internal
        override(ERC20, ERC20Votes)
        whenNotPaused
    {
        // Skip tax for minting, burning, and exempt addresses
        if (
            from == address(0) || to == address(0) || taxExempt[from] || taxExempt[to]
                || transferTaxBasisPoints == 0
        ) {
            super._update(from, to, amount);
            return;
        }

        // Calculate tax
        uint256 taxAmount = (amount * transferTaxBasisPoints) / BASIS_POINTS_DIVISOR;
        uint256 amountAfterTax = amount - taxAmount;

        // Transfer tax to treasury
        if (taxAmount > 0) {
            super._update(from, treasury, taxAmount);
        }

        // Transfer remaining amount to recipient
        super._update(from, to, amountAfterTax);
    }

    /**
     * @dev Override required for ERC20Votes
     */
    function nonces(address owner) public view override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }
}
