// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BuilderNFT
 * @dev NFT contract for awarding achievements to builders on BuildProof platform
 * @notice This contract mints achievement NFTs to recognize builder accomplishments
 */
contract BuilderNFT is ERC721, ERC721URIStorage, Ownable, Pausable, ReentrancyGuard {
    /// @dev Counter for token IDs
    uint256 private _tokenIdCounter;

    /// @dev Mapping from token ID to achievement type
    mapping(uint256 => string) public achievements;

    /// @dev Mapping from builder address to earned achievement types
    mapping(address => mapping(string => bool)) public builderAchievements;

    /// @dev Mapping from achievement type to total minted count
    mapping(string => uint256) public achievementCounts;

    /// @dev Maximum supply of NFTs
    uint256 public constant MAX_SUPPLY = 10000;

    /// @notice Emitted when a new achievement NFT is minted
    event AchievementMinted(
        address indexed builder,
        uint256 indexed tokenId,
        string achievementType
    );

    /// @notice Emitted when base URI is updated
    event BaseURIUpdated(string newBaseURI);

    /// @dev Custom errors for gas efficiency
    error MaxSupplyReached();
    error AchievementAlreadyEarned();
    error InvalidAddress();
    error InvalidAchievementType();

    /**
     * @dev Constructor sets the NFT name and symbol
     */
    constructor() ERC721("BuildProof Achievement", "BPACH") Ownable(msg.sender) {
        _tokenIdCounter = 1; // Start token IDs from 1
    }

    /**
     * @notice Mint an achievement NFT to a builder
     * @param builder Address of the builder receiving the NFT
     * @param achievementType Type of achievement being awarded
     * @param tokenURI Metadata URI for the NFT
     */
    function mintAchievement(
        address builder,
        string calldata achievementType,
        string calldata tokenURI
    ) external onlyOwner whenNotPaused nonReentrant {
        if (builder == address(0)) revert InvalidAddress();
        if (bytes(achievementType).length == 0) revert InvalidAchievementType();
        if (_tokenIdCounter > MAX_SUPPLY) revert MaxSupplyReached();
        if (builderAchievements[builder][achievementType]) {
            revert AchievementAlreadyEarned();
        }

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(builder, tokenId);
        _setTokenURI(tokenId, tokenURI);

        achievements[tokenId] = achievementType;
        builderAchievements[builder][achievementType] = true;
        achievementCounts[achievementType]++;

        emit AchievementMinted(builder, tokenId, achievementType);
    }

    /**
     * @notice Batch mint achievement NFTs to multiple builders
     * @param builders Array of builder addresses
     * @param achievementTypes Array of achievement types
     * @param tokenURIs Array of metadata URIs
     */
    function batchMintAchievements(
        address[] calldata builders,
        string[] calldata achievementTypes,
        string[] calldata tokenURIs
    ) external onlyOwner whenNotPaused nonReentrant {
        uint256 length = builders.length;
        require(
            length == achievementTypes.length && length == tokenURIs.length,
            "Array length mismatch"
        );

        for (uint256 i = 0; i < length; i++) {
            if (
                builders[i] != address(0) &&
                !builderAchievements[builders[i]][achievementTypes[i]] &&
                _tokenIdCounter <= MAX_SUPPLY
            ) {
                uint256 tokenId = _tokenIdCounter;
                _tokenIdCounter++;

                _safeMint(builders[i], tokenId);
                _setTokenURI(tokenId, tokenURIs[i]);

                achievements[tokenId] = achievementTypes[i];
                builderAchievements[builders[i]][achievementTypes[i]] = true;
                achievementCounts[achievementTypes[i]]++;

                emit AchievementMinted(builders[i], tokenId, achievementTypes[i]);
            }
        }
    }

    /**
     * @notice Check if a builder has earned a specific achievement
     * @param builder Address to check
     * @param achievementType Achievement type to verify
     * @return bool True if achievement earned
     */
    function hasAchievement(
        address builder,
        string calldata achievementType
    ) external view returns (bool) {
        return builderAchievements[builder][achievementType];
    }

    /**
     * @notice Get total number of minted NFTs
     * @return uint256 Total minted count
     */
    function totalMinted() external view returns (uint256) {
        return _tokenIdCounter - 1;
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
     * @dev Override required by Solidity for ERC721URIStorage
     */
    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    /**
     * @dev Override required by Solidity for ERC721URIStorage
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
