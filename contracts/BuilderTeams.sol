// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/**
 * @title BuilderTeams
 * @dev Collaborative team management for builders with reward splitting
 * @author BuildProof Team
 */
contract BuilderTeams {
    struct Team {
        uint256 teamId;
        string name;
        address creator;
        address[] members;
        mapping(address => bool) isMember;
        mapping(address => uint256) rewardShares; // percentage in basis points (10000 = 100%)
        uint256 totalShares;
        bool isActive;
        uint256 createdAt;
        uint256 completedBounties;
        uint256 totalEarnings;
    }

    struct TeamInfo {
        uint256 teamId;
        string name;
        address creator;
        address[] members;
        uint256 totalShares;
        bool isActive;
        uint256 createdAt;
        uint256 completedBounties;
        uint256 totalEarnings;
    }

    struct MemberShare {
        address member;
        uint256 share;
    }

    mapping(uint256 => Team) public teams;
    mapping(address => uint256[]) public memberTeams;
    mapping(address => uint256[]) public createdTeams;

    uint256 public totalTeams;

    event TeamCreated(
        uint256 indexed teamId, string name, address indexed creator, uint256 timestamp
    );

    event MemberAdded(uint256 indexed teamId, address indexed member, uint256 share);

    event MemberRemoved(uint256 indexed teamId, address indexed member);

    event SharesUpdated(uint256 indexed teamId, address indexed member, uint256 newShare);

    event RewardDistributed(uint256 indexed teamId, uint256 totalAmount, uint256 timestamp);

    event TeamDeactivated(uint256 indexed teamId, uint256 timestamp);

    event BountyCompleted(uint256 indexed teamId, uint256 bountyCount, uint256 earnings);

    modifier onlyTeamCreator(uint256 _teamId) {
        require(teams[_teamId].creator == msg.sender, "Only team creator can call this");
        _;
    }

    modifier onlyTeamMember(uint256 _teamId) {
        require(teams[_teamId].isMember[msg.sender], "Only team members can call this");
        _;
    }

    modifier teamExists(uint256 _teamId) {
        require(_teamId < totalTeams, "Team does not exist");
        _;
    }

    modifier teamIsActive(uint256 _teamId) {
        require(teams[_teamId].isActive, "Team is not active");
        _;
    }

    /**
     * @dev Create a new team
     * @param _name Team name
     * @param _initialMembers Initial team members including creator
     * @param _initialShares Share percentages for each member (in basis points)
     */
    function createTeam(
        string memory _name,
        address[] memory _initialMembers,
        uint256[] memory _initialShares
    )
        external
        returns (uint256)
    {
        require(bytes(_name).length > 0, "Team name cannot be empty");
        require(_initialMembers.length > 0, "Must have at least one member");
        require(
            _initialMembers.length == _initialShares.length, "Members and shares length mismatch"
        );

        uint256 teamId = totalTeams++;
        Team storage team = teams[teamId];

        team.teamId = teamId;
        team.name = _name;
        team.creator = msg.sender;
        team.isActive = true;
        team.createdAt = block.timestamp;
        team.completedBounties = 0;
        team.totalEarnings = 0;

        // Add members and shares
        uint256 totalSharesSum = 0;
        for (uint256 i = 0; i < _initialMembers.length; i++) {
            address member = _initialMembers[i];
            uint256 share = _initialShares[i];

            require(member != address(0), "Invalid member address");
            require(share > 0, "Share must be greater than 0");
            require(!team.isMember[member], "Duplicate member");

            team.members.push(member);
            team.isMember[member] = true;
            team.rewardShares[member] = share;
            totalSharesSum += share;

            memberTeams[member].push(teamId);
        }

        require(totalSharesSum == 10_000, "Total shares must equal 100% (10000 basis points)");
        team.totalShares = totalSharesSum;

        createdTeams[msg.sender].push(teamId);

        emit TeamCreated(teamId, _name, msg.sender, block.timestamp);

        return teamId;
    }

    /**
     * @dev Add a member to the team
     * @param _teamId Team ID
     * @param _member Address of the member to add
     * @param _share Share percentage for the new member
     */
    function addMember(
        uint256 _teamId,
        address _member,
        uint256 _share
    )
        external
        onlyTeamCreator(_teamId)
        teamExists(_teamId)
        teamIsActive(_teamId)
    {
        Team storage team = teams[_teamId];

        require(_member != address(0), "Invalid member address");
        require(_share > 0, "Share must be greater than 0");
        require(!team.isMember[_member], "Member already exists");

        team.members.push(_member);
        team.isMember[_member] = true;
        team.rewardShares[_member] = _share;
        team.totalShares += _share;

        memberTeams[_member].push(_teamId);

        emit MemberAdded(_teamId, _member, _share);
    }

    /**
     * @dev Remove a member from the team
     * @param _teamId Team ID
     * @param _member Address of the member to remove
     */
    function removeMember(
        uint256 _teamId,
        address _member
    )
        external
        onlyTeamCreator(_teamId)
        teamExists(_teamId)
        teamIsActive(_teamId)
    {
        Team storage team = teams[_teamId];

        require(team.isMember[_member], "Member does not exist");
        require(_member != team.creator, "Cannot remove team creator");

        team.isMember[_member] = false;
        team.totalShares -= team.rewardShares[_member];
        team.rewardShares[_member] = 0;

        // Remove from members array
        for (uint256 i = 0; i < team.members.length; i++) {
            if (team.members[i] == _member) {
                team.members[i] = team.members[team.members.length - 1];
                team.members.pop();
                break;
            }
        }

        emit MemberRemoved(_teamId, _member);
    }

    /**
     * @dev Update member's share
     * @param _teamId Team ID
     * @param _member Address of the member
     * @param _newShare New share percentage
     */
    function updateMemberShare(
        uint256 _teamId,
        address _member,
        uint256 _newShare
    )
        external
        onlyTeamCreator(_teamId)
        teamExists(_teamId)
        teamIsActive(_teamId)
    {
        Team storage team = teams[_teamId];

        require(team.isMember[_member], "Member does not exist");
        require(_newShare > 0, "Share must be greater than 0");

        uint256 oldShare = team.rewardShares[_member];
        team.totalShares = team.totalShares - oldShare + _newShare;
        team.rewardShares[_member] = _newShare;

        emit SharesUpdated(_teamId, _member, _newShare);
    }

    /**
     * @dev Distribute rewards to team members
     * @param _teamId Team ID
     */
    function distributeReward(uint256 _teamId)
        external
        payable
        teamExists(_teamId)
        teamIsActive(_teamId)
    {
        require(msg.value > 0, "Reward must be greater than 0");

        Team storage team = teams[_teamId];
        uint256 totalAmount = msg.value;

        // Distribute to each member based on their share
        for (uint256 i = 0; i < team.members.length; i++) {
            address member = team.members[i];
            uint256 share = team.rewardShares[member];
            uint256 memberReward = (totalAmount * share) / team.totalShares;

            if (memberReward > 0) {
                (bool success,) = payable(member).call{ value: memberReward }("");
                require(success, "Transfer failed");
            }
        }

        team.totalEarnings += totalAmount;
        team.completedBounties++;

        emit RewardDistributed(_teamId, totalAmount, block.timestamp);
        emit BountyCompleted(_teamId, team.completedBounties, totalAmount);
    }

    /**
     * @dev Record bounty completion for team stats (no payment)
     * @param _teamId Team ID
     * @param _earnings Amount earned
     */
    function recordBountyCompletion(
        uint256 _teamId,
        uint256 _earnings
    )
        external
        teamExists(_teamId)
        teamIsActive(_teamId)
    {
        Team storage team = teams[_teamId];
        team.completedBounties++;
        team.totalEarnings += _earnings;

        emit BountyCompleted(_teamId, team.completedBounties, _earnings);
    }

    /**
     * @dev Deactivate a team
     * @param _teamId Team ID
     */
    function deactivateTeam(uint256 _teamId)
        external
        onlyTeamCreator(_teamId)
        teamExists(_teamId)
    {
        teams[_teamId].isActive = false;
        emit TeamDeactivated(_teamId, block.timestamp);
    }

    /**
     * @dev Get team information
     * @param _teamId Team ID
     * @return TeamInfo struct
     */
    function getTeamInfo(uint256 _teamId)
        external
        view
        teamExists(_teamId)
        returns (TeamInfo memory)
    {
        Team storage team = teams[_teamId];

        return TeamInfo({
            teamId: team.teamId,
            name: team.name,
            creator: team.creator,
            members: team.members,
            totalShares: team.totalShares,
            isActive: team.isActive,
            createdAt: team.createdAt,
            completedBounties: team.completedBounties,
            totalEarnings: team.totalEarnings
        });
    }

    /**
     * @dev Get member shares for a team
     * @param _teamId Team ID
     * @return Array of MemberShare structs
     */
    function getMemberShares(uint256 _teamId)
        external
        view
        teamExists(_teamId)
        returns (MemberShare[] memory)
    {
        Team storage team = teams[_teamId];
        MemberShare[] memory shares = new MemberShare[](team.members.length);

        for (uint256 i = 0; i < team.members.length; i++) {
            address member = team.members[i];
            shares[i] = MemberShare({ member: member, share: team.rewardShares[member] });
        }

        return shares;
    }

    /**
     * @dev Get teams a member belongs to
     * @param _member Address of the member
     * @return Array of team IDs
     */
    function getMemberTeams(address _member) external view returns (uint256[] memory) {
        return memberTeams[_member];
    }

    /**
     * @dev Get teams created by an address
     * @param _creator Address of the creator
     * @return Array of team IDs
     */
    function getCreatedTeams(address _creator) external view returns (uint256[] memory) {
        return createdTeams[_creator];
    }

    /**
     * @dev Check if an address is a team member
     * @param _teamId Team ID
     * @param _member Address to check
     * @return Boolean indicating membership
     */
    function isMember(
        uint256 _teamId,
        address _member
    )
        external
        view
        teamExists(_teamId)
        returns (bool)
    {
        return teams[_teamId].isMember[_member];
    }

    /**
     * @dev Get member's share in a team
     * @param _teamId Team ID
     * @param _member Address of the member
     * @return Share percentage in basis points
     */
    function getMemberShare(
        uint256 _teamId,
        address _member
    )
        external
        view
        teamExists(_teamId)
        returns (uint256)
    {
        return teams[_teamId].rewardShares[_member];
    }
}
