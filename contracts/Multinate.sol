// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

import "./interfaces/IAttestationStation.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

contract Multinate is Ownable {
    IAttestationStation public attestationStation;
    IERC20 public usdc;
    uint256 public minimumAttestationScore;

    bytes32 public constant REGISTRATION_KEY = keccak256("registration");
    bytes32 public constant TAX_EXEMPT_STATUS_KEY = keccak256("tax_exempt_status");
    bytes32 public constant FINANCIAL_STATEMENTS_KEY = keccak256("financial_statements");
    bytes32 public constant MISSION_STATEMENT_KEY = keccak256("mission_statement");

    mapping(address => uint256) public charityScores;
    struct Campaign {
        address payable charity;
        string title;
        string description;
        uint256 targetAmount;
        uint256 currentAmount;
        uint256 deadline;
        bool active;
    }

    uint256 public nextCampaignId = 1;

    mapping(uint256 => Campaign) public campaigns;

    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed charity,
        string title,
        string description,
        uint256 targetAmount,
        uint256 deadline
    );
    event CharityEligibilityUpdated(address indexed charity, bool eligible);
    event CampaignFunded(uint256 indexed campaignId, uint256 amount);

    constructor(address _attestationStation, uint256 _minimumAttestationScore, address _gnosisSafe, address _usdc) {
        attestationStation = IAttestationStation(_attestationStation);
        minimumAttestationScore = _minimumAttestationScore;
        usdc = IERC20(_usdc);
        transferOwnership(_gnosisSafe);
    }

    function setMinimumAttestationScore(uint256 _minimumAttestationScore) external {
        minimumAttestationScore = _minimumAttestationScore;
    }

    function updateCharityScore(address _charity) external {
        uint256 score = 0;

        // Add a scoring system based on the attestation data
        bytes memory registrationData = attestationStation.attestations(msg.sender, _charity, REGISTRATION_KEY);
        score += calculateRegistrationScore(registrationData);
        console.log("score after registration: %s", score);
        bytes memory taxExemptStatusData = attestationStation.attestations(msg.sender, _charity, TAX_EXEMPT_STATUS_KEY);
        score += calculateTaxExemptStatusScore(taxExemptStatusData);
        console.log("score after tax exempt: %s", score);
        bytes memory financialStatementsData = attestationStation.attestations(
            msg.sender,
            _charity,
            FINANCIAL_STATEMENTS_KEY
        );
        score += calculateFinancialStatementsScore(financialStatementsData);
        bytes memory missionStatementData = attestationStation.attestations(
            msg.sender,
            _charity,
            MISSION_STATEMENT_KEY
        );
        score += calculateMissionStatementScore(missionStatementData);
        charityScores[_charity] = score;
        bool isEligible = score >= minimumAttestationScore;
        emit CharityEligibilityUpdated(_charity, isEligible);
    }

    function isCharityEligible(address _charity) public view returns (bool) {
        return charityScores[_charity] >= minimumAttestationScore;
    }

    function calculateRegistrationScore(bytes memory _registrationData) internal pure returns (uint256) {
        // Check if registration data is available
        if (_registrationData.length > 0) {
            // In this example, we assign 25 points for having registration data
            return 25;
        }
        return 0;
    }

    function calculateTaxExemptStatusScore(bytes memory _taxExemptStatusData) internal pure returns (uint256) {
        // Check if tax-exempt status data is available
        if (_taxExemptStatusData.length > 0) {
            // In this example, we assign 25 points for having tax-exempt status data
            return 25;
        }
        return 0;
    }

    function calculateFinancialStatementsScore(bytes memory _financialStatementsData) internal pure returns (uint256) {
        // Check if financial statements data is available
        if (_financialStatementsData.length > 0) {
            // In this example, we assign a score between 0 and 25 based on the financial transparency level
            // (e.g., percentage of funds spent on the mission, administrative costs, etc.)
            uint256 transparencyLevel = uint8(_financialStatementsData[0]);
            return (transparencyLevel * 25) / 100;
        }
        return 0;
    }

    function calculateMissionStatementScore(bytes memory _missionStatementData) internal pure returns (uint256) {
        // Check if mission statement data is available
        if (_missionStatementData.length > 0) {
            // In this example, we assign a score between 0 and 25 based on the mission's alignment with global goals (e.g., UN SDGs)
            uint256 alignmentScore = uint8(_missionStatementData[0]);
            return (alignmentScore * 25) / 100;
        }
        return 0;
    }

    function createCampaign(
        address _charity,
        string memory _title,
        string memory _description,
        uint256 _targetAmount,
        uint256 _deadline
    ) external onlyOwner {
        require(isCharityEligible(_charity), "The charity organization is not eligible");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(_targetAmount > 0, "Target amount must be greater than zero");

        uint256 campaignId = nextCampaignId;
        nextCampaignId++;

        campaigns[campaignId] = Campaign({
            charity: payable(_charity),
            title: _title,
            description: _description,
            targetAmount: _targetAmount,
            currentAmount: 0,
            deadline: _deadline,
            active: true
        });

        emit CampaignCreated(campaignId, _charity, _title, _description, _targetAmount, _deadline);
    }

    // Withdraw funds from the campaign
    function withdraw(uint256 _campaignId) external {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.active, "Campaign is not active");
        require(campaign.charity == msg.sender, "Only the charity can withdraw funds");
        require(campaign.currentAmount >= campaign.targetAmount, "Target amount not reached");
        require(campaign.deadline < block.timestamp, "Deadline has not passed yet");

        campaign.active = false;
        usdc.transfer(campaign.charity, campaign.currentAmount);
        // Emit event
        emit CampaignFunded(_campaignId, campaign.currentAmount);
    }
}
