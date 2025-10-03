// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

// contracts/ContractRegistry.sol

/**
 * @title ContractRegistry
 * @dev A registry to store verified contract information for BuildProof platform
 * @author BuildProof Team
 */
contract ContractRegistry {
    struct ContractInfo {
        address contractAddress;
        string name;
        string version;
        uint256 securityScore;
        bool isVerified;
        address submitter;
        uint256 timestamp;
        string ipfsHash; // For storing detailed analysis reports
    }

    mapping(address => ContractInfo) public contracts;
    mapping(address => bool) public verifiers;
    address public owner;
    uint256 public totalContracts;

    event ContractRegistered(
        address indexed contractAddress,
        string name,
        uint256 securityScore,
        address indexed submitter
    );

    event ContractVerified(
        address indexed contractAddress, address indexed verifier, uint256 newSecurityScore
    );

    event VerifierAdded(address indexed verifier);
    event VerifierRemoved(address indexed verifier);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyVerifier() {
        require(
            verifiers[msg.sender] || msg.sender == owner, "Only verifiers can call this function"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
        verifiers[msg.sender] = true;
    }

    /**
     * @dev Register a new contract with initial analysis
     * @param _contractAddress The address of the contract to register
     * @param _name Name of the contract
     * @param _version Version of the contract
     * @param _securityScore Initial security score (0-100)
     * @param _ipfsHash IPFS hash containing detailed analysis
     */
    function registerContract(
        address _contractAddress,
        string memory _name,
        string memory _version,
        uint256 _securityScore,
        string memory _ipfsHash
    )
        external
    {
        require(_contractAddress != address(0), "Invalid contract address");
        require(_securityScore <= 100, "Security score must be <= 100");
        require(bytes(_name).length > 0, "Contract name cannot be empty");

        // Check if contract already exists
        if (contracts[_contractAddress].contractAddress == address(0)) {
            totalContracts++;
        }

        contracts[_contractAddress] = ContractInfo({
            contractAddress: _contractAddress,
            name: _name,
            version: _version,
            securityScore: _securityScore,
            isVerified: false,
            submitter: msg.sender,
            timestamp: block.timestamp,
            ipfsHash: _ipfsHash
        });

        emit ContractRegistered(_contractAddress, _name, _securityScore, msg.sender);
    }

    /**
     * @dev Verify a contract (only by authorized verifiers)
     * @param _contractAddress Address of the contract to verify
     * @param _newSecurityScore Updated security score after verification
     * @param _ipfsHash Updated IPFS hash with verification details
     */
    function verifyContract(
        address _contractAddress,
        uint256 _newSecurityScore,
        string memory _ipfsHash
    )
        external
        onlyVerifier
    {
        require(
            contracts[_contractAddress].contractAddress != address(0), "Contract not registered"
        );
        require(_newSecurityScore <= 100, "Security score must be <= 100");

        contracts[_contractAddress].securityScore = _newSecurityScore;
        contracts[_contractAddress].isVerified = true;
        contracts[_contractAddress].ipfsHash = _ipfsHash;

        emit ContractVerified(_contractAddress, msg.sender, _newSecurityScore);
    }

    /**
     * @dev Add a new verifier (only owner)
     * @param _verifier Address of the new verifier
     */
    function addVerifier(address _verifier) external onlyOwner {
        require(_verifier != address(0), "Invalid verifier address");
        verifiers[_verifier] = true;
        emit VerifierAdded(_verifier);
    }

    /**
     * @dev Remove a verifier (only owner)
     * @param _verifier Address of the verifier to remove
     */
    function removeVerifier(address _verifier) external onlyOwner {
        require(_verifier != owner, "Cannot remove owner as verifier");
        verifiers[_verifier] = false;
        emit VerifierRemoved(_verifier);
    }

    /**
     * @dev Get contract information
     * @param _contractAddress Address of the contract
     * @return ContractInfo struct containing all contract details
     */
    function getContractInfo(address _contractAddress)
        external
        view
        returns (ContractInfo memory)
    {
        return contracts[_contractAddress];
    }

    /**
     * @dev Check if a contract is registered
     * @param _contractAddress Address to check
     * @return bool indicating if contract is registered
     */
    function isContractRegistered(address _contractAddress) external view returns (bool) {
        return contracts[_contractAddress].contractAddress != address(0);
    }

    /**
     * @dev Get contracts by security score range
     * @param _minScore Minimum security score
     * @param _maxScore Maximum security score
     * @return Array of contract addresses within the score range
     */
    function getContractsBySecurityScore(
        uint256 _minScore,
        uint256 _maxScore
    )
        external
        view
        returns (address[] memory)
    {
        require(_minScore <= _maxScore, "Invalid score range");
        require(_maxScore <= 100, "Max score cannot exceed 100");

        // Note: This is a simplified implementation
        // In production, you'd want to use a more efficient data structure
        // or implement pagination for large datasets

        address[] memory results = new address[](totalContracts);

        // This is not gas-efficient for large datasets - consider using events/indexing
        // for production use
        // TODO: Implement actual filtering logic based on stored contracts

        return results;
    }

    /**
     * @dev Transfer ownership (only current owner)
     * @param _newOwner Address of the new owner
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid new owner address");
        owner = _newOwner;
        verifiers[_newOwner] = true;
    }
}

