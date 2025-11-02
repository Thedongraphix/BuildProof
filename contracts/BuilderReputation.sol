// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title BuilderReputation
 * @dev On-chain reputation system for builders with skills and achievements
 * @author BuildProof Team
 */
contract BuilderReputation is Ownable2Step, ReentrancyGuard, Pausable {
    /// @dev Custom errors for gas efficiency
    error BuilderAlreadyRegistered();
    error BuilderNotActive();
    error UsernameEmpty();
    error UsernameTooLong();
    error SkillNameEmpty();
    error SkillAlreadyExists();
    error CannotEndorseSelf();
    error EndorserNotActive();
    error SkillDoesNotExist();
    error AlreadyEndorsed();
    error TitleEmpty();
    error InvalidIssuerAddress();
    error CannotRevokeOwner();
    error NotAuthorizedIssuer();

    struct BuilderProfile {
        uint256 reputationScore;
        uint256 completedProjects;
        uint256 totalEarnings;
        uint256 joinedAt;
        address builder;
        bool isActive;
        string username;
    }

    struct Skill {
        uint256 endorsements;
        string name;
        mapping(address => bool) endorsers;
    }

    struct Achievement {
        uint256 earnedAt;
        address issuer;
        string title;
        string description;
    }

    mapping(address => BuilderProfile) public builders;
    mapping(address => mapping(string => Skill)) public builderSkills;
    mapping(address => string[]) public builderSkillsList;
    mapping(address => Achievement[]) public builderAchievements;
    mapping(address => bool) public authorizedIssuers;

    uint256 public totalBuilders;

    event BuilderRegistered(address indexed builder, string username, uint256 timestamp);

    event ReputationUpdated(address indexed builder, uint256 oldScore, uint256 newScore);

    event SkillAdded(address indexed builder, string skill);

    event SkillEndorsed(address indexed builder, address indexed endorser, string skill);

    event AchievementAwarded(
        address indexed builder, string title, address indexed issuer, uint256 timestamp
    );

    event ProjectCompleted(address indexed builder, uint256 projectCount, uint256 earnings);

    event IssuerAuthorized(address indexed issuer);

    event IssuerRevoked(address indexed issuer);

    modifier onlyAuthorizedIssuer() {
        if (!authorizedIssuers[msg.sender] && msg.sender != owner()) {
            revert NotAuthorizedIssuer();
        }
        _;
    }

    modifier onlyActiveBuilder(address _builder) {
        if (!builders[_builder].isActive) revert BuilderNotActive();
        _;
    }

    /**
     * @dev Constructor sets the contract owner and authorizes them as issuer
     */
    constructor() Ownable(msg.sender) {
        authorizedIssuers[msg.sender] = true;
    }

    /**
     * @dev Register as a builder
     * @param _username Unique username for the builder
     */
    function registerBuilder(string memory _username) external whenNotPaused {
        if (builders[msg.sender].isActive) revert BuilderAlreadyRegistered();
        if (bytes(_username).length == 0) revert UsernameEmpty();
        if (bytes(_username).length > 32) revert UsernameTooLong();

        builders[msg.sender] = BuilderProfile({
            builder: msg.sender,
            username: _username,
            reputationScore: 0,
            completedProjects: 0,
            totalEarnings: 0,
            joinedAt: block.timestamp,
            isActive: true
        });

        totalBuilders++;

        emit BuilderRegistered(msg.sender, _username, block.timestamp);
    }

    /**
     * @dev Add a skill to builder profile
     * @param _skill Name of the skill
     */
    function addSkill(string memory _skill) external onlyActiveBuilder(msg.sender) {
        if (bytes(_skill).length == 0) revert SkillNameEmpty();
        if (builderSkills[msg.sender][_skill].endorsements != 0) revert SkillAlreadyExists();

        builderSkills[msg.sender][_skill].name = _skill;
        builderSkillsList[msg.sender].push(_skill);

        emit SkillAdded(msg.sender, _skill);
    }

    /**
     * @dev Endorse a builder's skill
     * @param _builder Address of the builder
     * @param _skill Name of the skill to endorse
     */
    function endorseSkill(
        address _builder,
        string memory _skill
    )
        external
        onlyActiveBuilder(_builder)
    {
        if (msg.sender == _builder) revert CannotEndorseSelf();
        if (!builders[msg.sender].isActive) revert EndorserNotActive();
        if (bytes(builderSkills[_builder][_skill].name).length == 0) revert SkillDoesNotExist();
        if (builderSkills[_builder][_skill].endorsers[msg.sender]) revert AlreadyEndorsed();

        builderSkills[_builder][_skill].endorsers[msg.sender] = true;
        builderSkills[_builder][_skill].endorsements++;

        emit SkillEndorsed(_builder, msg.sender, _skill);
    }

    /**
     * @dev Award an achievement to a builder (authorized issuers only)
     * @param _builder Address of the builder
     * @param _title Achievement title
     * @param _description Achievement description
     */
    function awardAchievement(
        address _builder,
        string memory _title,
        string memory _description
    )
        external
        onlyAuthorizedIssuer
        onlyActiveBuilder(_builder)
    {
        if (bytes(_title).length == 0) revert TitleEmpty();

        builderAchievements[_builder].push(
            Achievement({
                title: _title,
                description: _description,
                earnedAt: block.timestamp,
                issuer: msg.sender
            })
        );

        emit AchievementAwarded(_builder, _title, msg.sender, block.timestamp);
    }

    /**
     * @dev Record a completed project (authorized issuers only)
     * @param _builder Address of the builder
     * @param _earnings Amount earned from the project
     * @param _reputationIncrease Reputation points to add
     */
    function recordProjectCompletion(
        address _builder,
        uint256 _earnings,
        uint256 _reputationIncrease
    )
        external
        onlyAuthorizedIssuer
        onlyActiveBuilder(_builder)
    {
        BuilderProfile storage profile = builders[_builder];

        uint256 oldScore = profile.reputationScore;
        profile.completedProjects++;
        profile.totalEarnings += _earnings;
        profile.reputationScore += _reputationIncrease;

        emit ProjectCompleted(_builder, profile.completedProjects, _earnings);
        emit ReputationUpdated(_builder, oldScore, profile.reputationScore);
    }

    /**
     * @dev Get builder profile
     * @param _builder Address of the builder
     * @return BuilderProfile struct
     */
    function getBuilderProfile(address _builder) external view returns (BuilderProfile memory) {
        return builders[_builder];
    }

    /**
     * @dev Get builder's skills
     * @param _builder Address of the builder
     * @return Array of skill names
     */
    function getBuilderSkills(address _builder) external view returns (string[] memory) {
        return builderSkillsList[_builder];
    }

    /**
     * @dev Get endorsement count for a specific skill
     * @param _builder Address of the builder
     * @param _skill Name of the skill
     * @return Number of endorsements
     */
    function getSkillEndorsements(
        address _builder,
        string memory _skill
    )
        external
        view
        returns (uint256)
    {
        return builderSkills[_builder][_skill].endorsements;
    }

    /**
     * @dev Get all achievements of a builder
     * @param _builder Address of the builder
     * @return Array of achievements
     */
    function getBuilderAchievements(address _builder)
        external
        view
        returns (Achievement[] memory)
    {
        return builderAchievements[_builder];
    }

    /**
     * @dev Check if an address has endorsed a skill
     * @param _builder Address of the builder
     * @param _skill Name of the skill
     * @param _endorser Address of the potential endorser
     * @return Boolean indicating if endorsed
     */
    function hasEndorsed(
        address _builder,
        string memory _skill,
        address _endorser
    )
        external
        view
        returns (bool)
    {
        return builderSkills[_builder][_skill].endorsers[_endorser];
    }

    /**
     * @dev Authorize an address to issue achievements (only owner)
     * @param _issuer Address to authorize
     */
    function authorizeIssuer(address _issuer) external onlyOwner {
        if (_issuer == address(0)) revert InvalidIssuerAddress();
        authorizedIssuers[_issuer] = true;
        emit IssuerAuthorized(_issuer);
    }

    /**
     * @dev Revoke issuer authorization (only owner)
     * @param _issuer Address to revoke
     */
    function revokeIssuer(address _issuer) external onlyOwner {
        if (_issuer == owner()) revert CannotRevokeOwner();
        authorizedIssuers[_issuer] = false;
        emit IssuerRevoked(_issuer);
    }

    /**
     * @dev Update builder username
     * @param _newUsername New username
     */
    function updateUsername(string memory _newUsername) external onlyActiveBuilder(msg.sender) {
        if (bytes(_newUsername).length == 0) revert UsernameEmpty();
        if (bytes(_newUsername).length > 32) revert UsernameTooLong();

        builders[msg.sender].username = _newUsername;
    }

    /**
     * @dev Deactivate builder profile
     */
    function deactivateProfile() external onlyActiveBuilder(msg.sender) {
        builders[msg.sender].isActive = false;
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
