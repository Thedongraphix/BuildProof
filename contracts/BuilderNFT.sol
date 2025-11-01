// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IBuilderReputation {
    function builders(address)
        external
        view
        returns (
            address builder,
            string memory username,
            uint256 reputationScore,
            uint256 completedProjects,
            uint256 totalEarnings,
            uint256 joinedAt,
            bool isActive
        );
}

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

    IBuilderReputation public reputationContract;

    /// @dev Base URI for token metadata
    string private _baseTokenURI;

    /// @notice Emitted when a new achievement NFT is minted
    event AchievementMinted(
        address indexed builder, uint256 indexed tokenId, string achievementType
    );

    /// @notice Emitted when base URI is updated
    event BaseURIUpdated(string newBaseURI);

    event ReputationContractUpdated(address indexed newContract);

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
        _baseTokenURI = "ipfs://";
    }

    /**
     * @notice Automatically check and mint milestone achievements for a builder
     * @param builder Address to check and mint achievements for
     */
    function checkAndMintAchievements(address builder) external whenNotPaused {
        if (address(reputationContract) == address(0)) return;

        try reputationContract.builders(builder) returns (
            address,
            string memory,
            uint256 reputationScore,
            uint256 completedProjects,
            uint256 totalEarnings,
            uint256,
            bool isActive
        ) {
            if (!isActive) return;

            // First Bounty Achievement
            if (completedProjects == 1 && !builderAchievements[builder]["FIRST_BOUNTY"]) {
                _mintAchievementInternal(builder, "FIRST_BOUNTY", "first_bounty");
            }

            // Rising Star - 5 completed projects
            if (completedProjects >= 5 && !builderAchievements[builder]["RISING_STAR"]) {
                _mintAchievementInternal(builder, "RISING_STAR", "rising_star");
            }

            // Established Builder - 25 completed projects
            if (completedProjects >= 25 && !builderAchievements[builder]["ESTABLISHED_BUILDER"]) {
                _mintAchievementInternal(builder, "ESTABLISHED_BUILDER", "established_builder");
            }

            // Power Builder - 50+ projects
            if (completedProjects >= 50 && !builderAchievements[builder]["POWER_BUILDER"]) {
                _mintAchievementInternal(builder, "POWER_BUILDER", "power_builder");
            }

            // High Reputation - 1000+ reputation points
            if (reputationScore >= 1000 && !builderAchievements[builder]["HIGH_REPUTATION"]) {
                _mintAchievementInternal(builder, "HIGH_REPUTATION", "high_reputation");
            }

            // Elite Builder - 5000+ reputation points
            if (reputationScore >= 5000 && !builderAchievements[builder]["ELITE_BUILDER"]) {
                _mintAchievementInternal(builder, "ELITE_BUILDER", "elite_builder");
            }

            // High Earner - 10+ ETH earned
            if (totalEarnings >= 10 ether && !builderAchievements[builder]["HIGH_EARNER"]) {
                _mintAchievementInternal(builder, "HIGH_EARNER", "high_earner");
            }
        } catch { }
    }

    /**
     * @dev Internal function to mint achievement
     */
    function _mintAchievementInternal(
        address builder,
        string memory achievementType,
        string memory uriSuffix
    )
        private
    {
        if (_tokenIdCounter > MAX_SUPPLY) return;
        if (builderAchievements[builder][achievementType]) return;

        uint256 tokenId = _tokenIdCounter++;
        _safeMint(builder, tokenId);
        _setTokenURI(tokenId, string(abi.encodePacked(_baseTokenURI, uriSuffix, ".json")));

        achievements[tokenId] = achievementType;
        builderAchievements[builder][achievementType] = true;
        achievementCounts[achievementType]++;

        emit AchievementMinted(builder, tokenId, achievementType);
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
    )
        external
        onlyOwner
        whenNotPaused
        nonReentrant
    {
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
    )
        external
        onlyOwner
        whenNotPaused
        nonReentrant
    {
        uint256 length = builders.length;
        require(
            length == achievementTypes.length && length == tokenURIs.length, "Array length mismatch"
        );

        for (uint256 i = 0; i < length; i++) {
            if (
                builders[i] != address(0) && !builderAchievements[builders[i]][achievementTypes[i]]
                    && _tokenIdCounter <= MAX_SUPPLY
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
    )
        external
        view
        returns (bool)
    {
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
     * @dev Set the reputation contract address for automatic achievement minting
     * @param _reputationContract Address of the BuilderReputation contract
     */
    function setReputationContract(address _reputationContract) external onlyOwner {
        reputationContract = IBuilderReputation(_reputationContract);
        emit ReputationContractUpdated(_reputationContract);
    }

    /**
     * @dev Set base URI for token metadata
     * @param baseURI New base URI
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
        emit BaseURIUpdated(baseURI);
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
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    /**
     * @dev Override required by Solidity for ERC721URIStorage
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
